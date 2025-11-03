/* Worldforge Hub Worker — v3.1.0
   - Auth/capsule/session endpoints
   - Test helpers (/session/logs, /capsule/reset)
   - OPS audit endpoint (/audit/qgate) with schema validation stub
*/
export interface Env {}

type Health = "PASS" | "WARN" | "FAIL";
type EventType = "INIT" | "ROUTE" | "SAFE" | "ERROR" | "NOTE";

const capsuleStore = new Map<string, { username: string; state: any }>();
const sessionLog: Array<{ token: string; event: EventType; payload: any; ts: string }> = [];
const sandboxStore = new Map<string, { expires: number }>();
const auditInbox: Array<{ ts: string; report: any }> = [];

function json(res: any, status = 200) {
  return new Response(JSON.stringify(res), { status, headers: { "content-type": "application/json" } });
}
function bad(msg: string, status = 400) { return json({ ok: false, error: msg }, status); }
function iso(ts?: number){ return new Date(ts ?? Date.now()).toISOString(); }
function randomId(prefix: string, len = 18) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[^a-z0-9]/gi, '');
  return prefix + b64.slice(0, len);
}
function maskToken(t: string){ return t ? t.slice(0, 4) + "…" + t.slice(-6) : ""; }

async function readJson(req: Request) { try { return await req.json(); } catch { return null; } }

// --- naive schema helpers (lightweight validation) ---
function isString(v: any){ return typeof v === "string"; }
function isObject(v: any){ return v && typeof v === "object" && !Array.isArray(v); }
function hasKeys(obj: any, keys: string[]){ return isObject(obj) && keys.every(k => k in obj); }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // GET /version
      if (req.method === "GET" && path === "/version") {
        return json({ service: "HUB_WORKER", version: "v3.1.0", timestamp: iso() });
      }

      // GET /health?status=PASS|WARN|FAIL
      if (req.method === "GET" && path === "/health") {
        const status = (url.searchParams.get("status") as Health) || "PASS";
        return json({ status, details: status === "PASS" ? "ok" : status.toLowerCase() });
      }

      // POST /auth/issue
      if (req.method === "POST" && path === "/auth/issue") {
        const body = await readJson(req);
        if (!body || !isString(body.session_id) || !isString(body.username)) return bad("invalid body: { session_id, username }");
        const token = randomId("wf_", 22);
        capsuleStore.set(token, { username: body.username, state: { resume_available: false, last_route: null } });
        return json({ capsule_token: token, issued_at: iso() });
      }

      // POST /capsule/save
      if (req.method === "POST" && path === "/capsule/save") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token) || !isString(body.username) || !isObject(body.state)) return bad("invalid body: { capsule_token, username, state }");
        if (!capsuleStore.has(body.capsule_token)) return bad("unknown token", 401);
        capsuleStore.set(body.capsule_token, { username: body.username, state: body.state });
        return json({ ok: true });
      }

      // POST /capsule/load
      if (req.method === "POST" && path === "/capsule/load") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token)) return bad("invalid body: { capsule_token }");
        const rec = capsuleStore.get(body.capsule_token);
        if (!rec) return bad("unknown token", 401);
        return json({ ok: true, username: rec.username, state: rec.state });
      }

      // POST /sandbox/new
      if (req.method === "POST" && path === "/sandbox/new") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token)) return bad("invalid body: { capsule_token }");
        const ttl = typeof body.ttl_s === "number" ? body.ttl_s : 1200;
        const id = randomId("sbx_", 12);
        sandboxStore.set(id, { expires: Date.now() + ttl * 1000 });
        return json({ sandbox_id: id, expires_at: iso(Date.now() + ttl * 1000) });
      }

      // POST /session/log
      if (req.method === "POST" && path === "/session/log") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token) || !isString(body.event) || !isString(body.ts)) return bad("invalid body: { capsule_token, event, ts, payload? }");
        sessionLog.push({ token: maskToken(body.capsule_token), event: body.event as EventType, payload: body.payload ?? {}, ts: body.ts });
        return json({ ok: true }, 202);
      }

      // POST /audit/qgate  (OPS triage intake)
      // Expects a report with at least: { source, bundle, hashes, items: [ ... ], notes? }
      if (req.method === "POST" && path === "/audit/qgate") {
        const body = await readJson(req);
        if (!body || !hasKeys(body, ["source", "bundle", "hashes", "items"])) {
          return bad("invalid body: { source, bundle, hashes, items[] }");
        }
        if (!isString(body.source) || !isString(body.bundle) || !isObject(body.hashes) || !Array.isArray(body.items)) {
          return bad("invalid types in body");
        }
        const invalid = body.items.some((it: any) => !hasKeys(it, ["file","before","after","delta","pct","flagged"]));
        if (invalid) return bad("invalid items schema");
        const record = { ts: iso(), report: body };
        auditInbox.push(record);
        const flagged = body.items.filter((i: any) => i.flagged);
        const status = flagged.length ? "OPS_WARN" : "OPS_PASS";
        return json({ status, received: body.items.length, flagged: flagged.length, stored_at: auditInbox.length });
      }

      // --- Test Helpers ---
      if (req.method === "GET" && path === "/session/logs") {
        return json({ logs: sessionLog });
      }
      if (req.method === "POST" && path === "/capsule/reset") {
        capsuleStore.clear();
        return json({ ok: true });
      }

      return json({ ok: false, error: "Not Found", path }, 404);
    } catch (e: any) {
      return json({ ok: false, error: e?.message || String(e) }, 500);
    }
  }
};
