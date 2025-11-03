/* Worldforge Hub Worker — v3.1 (scaffold) */
export interface Env {}

type Health = "PASS" | "WARN" | "FAIL";
type EventType = "INIT" | "ROUTE" | "SAFE" | "ERROR";

const capsuleStore = new Map<string, { username: string; state: any }>();
const sessionLog: Array<{ token: string; event: EventType; payload: any; ts: string }> = [];
const sandboxStore = new Map<string, { expires: number }>();

function json(res: any, status = 200) {
  return new Response(JSON.stringify(res), { status, headers: { "content-type": "application/json" } });
}
function bad(msg: string, status = 400) { return json({ ok: false, error: msg }, status); }
function iso(ts?: number){ return new Date(ts ?? Date.now()).toISOString(); }
function randomId(prefix: string, len = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return prefix + btoa(String.fromCharCode(...bytes)).replace(/[^a-z0-9]/gi, '').slice(0, len);
}
function maskToken(t: string){ return t ? t.slice(0, 4) + "…" + t.slice(-6) : ""; }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      if (req.method === "GET" && path === "/version") {
        return json({ service: "HUB_WORKER", version: "v3.1.0-dev", timestamp: iso() });
      }
      if (req.method === "GET" && path === "/health") {
        const status = (url.searchParams.get("status") as Health) || "PASS";
        return json({ status, details: status === "PASS" ? "ok" : status.toLowerCase() });
      }
      const readJson = async () => { try { return await req.json(); } catch { return null; } };

      if (req.method === "POST" && path === "/auth/issue") {
        const body = await readJson();
        if (!body || typeof body.session_id !== "string" || typeof body.username !== "string") return bad("invalid body: { session_id, username }");
        const token = randomId("wf_", 18);
        capsuleStore.set(token, { username: body.username, state: { resume_available: false, last_route: null } });
        return json({ capsule_token: token, issued_at: iso() });
      }
      if (req.method === "POST" && path === "/capsule/save") {
        const body = await readJson();
        if (!body || typeof body.capsule_token !== "string" || typeof body.username !== "string" || typeof body.state !== "object") return bad("invalid body: { capsule_token, username, state }");
        if (!capsuleStore.has(body.capsule_token)) return bad("unknown token", 401);
        capsuleStore.set(body.capsule_token, { username: body.username, state: body.state });
        return json({ ok: true });
      }
      if (req.method === "POST" && path === "/capsule/load") {
        const body = await readJson();
        if (!body || typeof body.capsule_token !== "string") return bad("invalid body: { capsule_token }");
        const rec = capsuleStore.get(body.capsule_token);
        if (!rec) return bad("unknown token", 401);
        return json({ ok: true, username: rec.username, state: rec.state });
      }
      if (req.method === "POST" && path === "/sandbox/new") {
        const body = await readJson();
        if (!body || typeof body.capsule_token !== "string") return bad("invalid body: { capsule_token }");
        const ttl = typeof body.ttl_s === "number" ? body.ttl_s : 1200;
        const id = randomId("sbx_", 10);
        sandboxStore.set(id, { expires: Date.now() + ttl * 1000 });
        return json({ sandbox_id: id, expires_at: iso(Date.now() + ttl * 1000) });
      }
      if (req.method === "POST" && path === "/session/log") {
        const body = await readJson();
        if (!body || typeof body.capsule_token !== "string" || typeof body.event !== "string" || typeof body.ts !== "string") return bad("invalid body: { capsule_token, event, ts, payload? }");
        sessionLog.push({ token: maskToken(body.capsule_token), event: body.event as EventType, payload: body.payload ?? {}, ts: body.ts });
        return json({ ok: true }, 202);
      }
      if (req.method === "POST" && path === "/audit/qgate") {
        const body = await readJson();
        if (!body || typeof body.bundle !== "string" || typeof body.hashes !== "object") return bad("invalid body: { bundle, hashes }");
        return json({ status: "OPS_PASS", drift_pct: 0.7, notes: "Hotfix 01 baseline" });
      }
      return json({ ok: false, error: "Not Found", path }, 404);
    } catch (e: any) { return json({ ok: false, error: e?.message || String(e) }, 500); }
  }
};
