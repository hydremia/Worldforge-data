// =============================
// Worldforge API Worker (TypeScript/ESM)
// Modernized for GPT-5 Audit + Promotion Bridge
// =============================

export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_API_URL: string;
  OPS_TOKEN: string;
  CANON_PREFIX: string;
  REPO_OWNER: string;
  REPO_NAME: string;
  REPO_BRANCH: string;
  ARCHIVIST_URL: string; // e.g., https://worldforge-archivist.hydremia.workers.dev/archivist/promote
  WF_KV_RUNTIME: KVNamespace;
  WF_KV_SESSIONS: KVNamespace;
  WF_KV_STAGING: KVNamespace;
  WF_KV_MEDIA: KVNamespace;
  // Optional, used by Nomina inline helpers:
  DATA_REPO_RAW_BASE?: string;        // default: https://raw.githubusercontent.com/hydremia/Worldforge-data/main
  DATA_REPO_MANIFEST_URL?: string;    // default: https://raw.githubusercontent.com/hydremia/Worldforge-data/main/reference/manifest.json
}

function json(data: Record<string, any>, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type"
    }
  });
}

function unauthorized(): Response {
  return json({ error: "unauthorized" }, 401);
}

async function callGPT(env: Env, body: any) {
  const response = await fetch(env.OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are the Worldforge OPS QGate auditor." },
        { role: "user", content: JSON.stringify(body) }
      ],
    }),
  });
  return await response.json();
}

async function promoteToArchivist(env: Env, payload: any) {
  const archivistUrl =
    env.ARCHIVIST_URL || "https://worldforge-archivist.hydremia.workers.dev/archivist/promote";
  const response = await fetch(archivistUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

// =====================================================================
// Inline Nomina helpers (no external imports)
// =====================================================================

type RepoModule = { name: string; current: string; versions: { v: string; index_url: string; hash?: string }[]; service?: any };
type RepoManifest = { modules: RepoModule[] };

async function loadManifestInline(env: Env): Promise<RepoManifest> {
  const url =
    env.DATA_REPO_MANIFEST_URL ||
    "https://raw.githubusercontent.com/hydremia/Worldforge-data/main/reference/manifest.json";
  const r = await fetch(url, { cf: { cacheEverything: true, cacheTtl: 300 } });
  if (!r.ok) throw new Error(`manifest fetch failed: ${r.status}`);
  return await r.json();
}

async function loadNominaIndexInline(env: Env, version?: string): Promise<any> {
  const m = await loadManifestInline(env);
  const mod = m.modules.find(x => x.name.toLowerCase() === "nomina");
  if (!mod) throw new Error("Nomina module not found in manifest");
  const v = version || mod.current;
  const entry = mod.versions.find(x => x.v === v);
  if (!entry) throw new Error(`Nomina version not found: ${v}`);
  const base =
    env.DATA_REPO_RAW_BASE || "https://raw.githubusercontent.com/hydremia/Worldforge-data/main";
  const indexUrl = entry.index_url.startsWith("http")
    ? entry.index_url
    : `${base}${entry.index_url.startsWith("/") ? "" : "/"}${entry.index_url}`;
  const r = await fetch(indexUrl, { cf: { cacheEverything: true, cacheTtl: 300 } });
  if (!r.ok) throw new Error(`nomina index fetch failed: ${r.status}`);
  return await r.json();
}

function makeXorShift128Plus(seedHex: string) {
  const seed = seedHex.replace(/[^0-9a-f]/gi, "").padEnd(32, "0").slice(0, 32);
  let s0 = BigInt("0x" + seed.slice(0, 16));
  let s1 = BigInt("0x" + seed.slice(16, 32));
  if (s0 === 0n && s1 === 0n) s1 = 1n;
  return () => {
    let x = s0, y = s1;
    s0 = y;
    x ^= (x << 23n) & ((1n << 64n) - 1n);
    x ^= (x >> 17n);
    x ^= y ^ (y >> 26n);
    s1 = x;
    const sum = (s0 + s1) & ((1n << 64n) - 1n);
    return Number(sum >> 11n) / Number(1n << 53n);
  };
}

async function fetchShardText(env: Env, urlOrPath: string): Promise<string> {
  const base =
    env.DATA_REPO_RAW_BASE || "https://raw.githubusercontent.com/hydremia/Worldforge-data/main";
  const url = /^https?:\/\//i.test(urlOrPath)
    ? urlOrPath
    : `${base}${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;
  const r = await fetch(url, { cf: { cacheEverything: true, cacheTtl: 600 } });
  if (!r.ok) throw new Error(`shard fetch failed: ${r.status}`);
  return await r.text();
}

function cryptoRandomSeed() {
  return (crypto.getRandomValues(new Uint32Array(4)) as Uint32Array)
    .reduce((s, n) => s + n.toString(16).padStart(8, "0"), "");
}

async function handleNominaMeta(_req: Request, env: Env): Promise<Response> {
  const manifest = await loadManifestInline(env);
  const mod = manifest.modules.find(m => m.name.toLowerCase() === "nomina");
  if (!mod) return json({ error: "Nomina not found in manifest" }, 404);
  return json({
    module: "Nomina",
    current: mod.current,
    versions: mod.versions.map(v => v.v),
    service: mod.service ?? null
  });
}

async function handleNominaIndex(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const v = url.searchParams.get("v") || undefined;
  const index = await loadNominaIndexInline(env, v);
  return json(index, 200);
}

async function handleNominaResolve(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const species = (url.searchParams.get("species") || "").toLowerCase();
  if (!species) return json({ error: "species required" }, 400);

  const culture = (url.searchParams.get("culture") || "").toLowerCase() || undefined;
  const gender  = (url.searchParams.get("gender")  || "").toLowerCase() || undefined;
  const count   = Math.min(Math.max(parseInt(url.searchParams.get("count") || "10", 10), 1), 100);
  const seed    = url.searchParams.get("seed") || cryptoRandomSeed();

  const index = await loadNominaIndexInline(env);
  const ids: string[] = [];
  if (culture && index.files.some((f: any) => f.id === `spec:${species}/${culture}`)) ids.push(`spec:${species}/${culture}`);
  if (gender  && index.files.some((f: any) => f.id === `spec:${species}/${gender}`)) ids.push(`spec:${species}/${gender}`);
  if (index.files.some((f: any) => f.id === `spec:${species}/core`)) ids.push(`spec:${species}/core`);
  if (ids.length === 0) return json({ error: "No matching logical IDs", species, culture, gender }, 404);

  // Build pool from shards
  const rng = makeXorShift128Plus(seed);
  const pool: string[] = [];
  for (const id of ids) {
    const f = index.files.find((x: any) => x.id === id)!;
    const txt = await fetchShardText(env, f.url || f.path);
    if ((f.path || f.url || "").endsWith(".jsonl")) {
      for (const line of txt.split(/\r?\n/)) {
        const t = line.trim(); if (t) pool.push(JSON.parse(t));
      }
    } else {
      const arr = JSON.parse(txt); if (Array.isArray(arr)) pool.push(...arr);
    }
  }
  // Deterministic shuffle (Fisher–Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const results = pool.slice(0, count);

  return json({
    module: "Nomina",
    version: index.version,
    resolved_from: { logical_ids: ids },
    rng: { seed, algo: "xorshift128+" },
    results,
    provenance: { manifest: `/Nomina/${index.version}/index.json`, sha256_bundle: index.sha256_bundle || null }
  });
}

// =====================================================================
// Fetch entrypoint with Nomina routes at top
// =====================================================================

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type"
        }
      });
    }

    // --- Nomina service endpoints (must come before other routing) ---
    if (req.method === "GET" && pathname === "/nomina/meta")    return handleNominaMeta(req, env);
    if (req.method === "GET" && pathname === "/nomina/index")   return handleNominaIndex(req, env);
    if (req.method === "GET" && pathname === "/nomina/resolve") return handleNominaResolve(req, env);
    // --- end Nomina endpoints ---

    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      const authed = () => {
        const h = req.headers.get("Authorization") || "";
        return h.startsWith("Bearer ") && h.slice(7).trim() === env.OPS_TOKEN;
      };

      // Health / Version
      if (path === "/health" && method === "GET") {
        return json({ ok: true, time: new Date().toISOString() });
      }
      if (path === "/version" && method === "GET") {
        return json({
          active: env.CANON_PREFIX,
          latest: env.CANON_PREFIX,
          repo: `https://raw.githubusercontent.com/${env.REPO_OWNER}/${env.REPO_NAME}/${env.REPO_BRANCH}`,
        });
      }

      // GPT-5 Audit
      if (path === "/audit" && method === "POST") {
        if (!authed()) return unauthorized();
        const body = await req.json().catch(() => ({}));
        const gptResult = await callGPT(env, body);
        const verdict =
          gptResult?.choices?.[0]?.message?.content?.includes("PASS") ? "PASS" : "FAIL";
        return json({ ok: true, verdict, gptResult });
      }

      // Promotion Bridge
      if (path === "/promote" && method === "POST") {
        if (!authed()) return unauthorized();
        const body = await req.json().catch(() => ({}));
        if (!Array.isArray(body.slugs)) return json({ error: "slugs[] required" }, 400);
        const result = await promoteToArchivist(env, { slugs: body.slugs });
        return json({ ok: true, promoted: result });
      }

      // Capsule endpoints (compat)
      if (path === "/capsule/create" && method === "POST") {
        if (!authed()) return unauthorized();
        const body = await req.json().catch(() => ({}));
        const token = body.token || crypto.randomUUID();
        const seed = {
          "wf:sessionToken": token,
          canonVersion: env.CANON_PREFIX,
          created_at: new Date().toISOString(),
        };
        await env.WF_KV_RUNTIME.put(`runtime:${token}`, JSON.stringify(seed));
        return json({ ok: true, token });
      }

      if (path.startsWith("/capsule/") && method === "GET") {
        const token = path.split("/")[2];
        const data = await env.WF_KV_RUNTIME.get(`runtime:${token}`);
        if (!data) return json({ error: "not found" }, 404);
        return json(JSON.parse(data));
      }

      // Fallback
      return json({ error: "not found", path }, 404);

    } catch (err: any) {
      return json({ error: "runtime exception", message: err?.message || String(err) }, 500);
    }
  }
};
