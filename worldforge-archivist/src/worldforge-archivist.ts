// =============================
// Worldforge Archivist Worker (TypeScript/ESM)
// Modernized for Bridge Checkpoint + Canon Ops
// =============================

export interface Env {
  OPS_TOKEN: string;
  CANON_PREFIX: string;
  WF_KV_STAGING: KVNamespace;
  WF_KV_CANON: KVNamespace;
  WF_KV_ARCHIVE: KVNamespace;
  WF_KV_RUNTIME?: KVNamespace; // optional for bridge checkpoint
}

function json(data: Record<string, any>, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function stableStringify(obj: any): string {
  const seen = new WeakSet();
  const stringify = (o: any): string => {
    if (o === null || typeof o !== "object") return JSON.stringify(o);
    if (seen.has(o)) throw new TypeError("circular structure");
    seen.add(o);
    if (Array.isArray(o)) return `[${o.map(v => stringify(v)).join(",")}]`;
    const keys = Object.keys(o).sort();
    const entries = keys.map(k => `${JSON.stringify(k)}:${stringify(o[k])}`);
    return `{${entries.join(",")}}`;
  };
  return stringify(obj);
}

async function canonHashV1(obj: any): Promise<string> {
  const text = stableStringify(obj);
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function baseForHash(entry: any): any {
  const e = JSON.parse(JSON.stringify(entry || {}));
  delete e.canon_hash_v1;
  delete e.promoted_at;
  if (e.lineage && typeof e.lineage === "object" && "last_hash" in e.lineage) {
    const { last_hash, ...rest } = e.lineage;
    e.lineage = rest;
  }
  return e;
}

async function writeCheckpoint(env: Env, version: string) {
  try {
    if (env.WF_KV_RUNTIME) {
      await env.WF_KV_RUNTIME.put(
        "bridge:last_checkpoint",
        JSON.stringify({ version, time: new Date().toISOString() })
      );
    }
  } catch (err) {
    console.warn("checkpoint write failed", err);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // --- Diagnostic Route Listing
    if (url.pathname === "/debug/routes" && method === "GET") {
      const routes = [
        "/archivist/review (POST)",
        "/archivist/ingest (POST)",
        "/archivist/promote (POST)",
        "/archivist/review/promote_selected (POST)",
        "/archivist/export/index (GET)",
        "/archivist/rollback (POST)",
        "/archivist/debug/get (GET)",
        "/archivist/debug/hash_compare (GET)"
      ];
      return json({ ok: true, routes });
    }

    // --- Promotion (core endpoint)
    if (url.pathname === "/archivist/promote" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const auth = request.headers.get("authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token || token !== env.OPS_TOKEN) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        const useKV = !!(env.WF_KV_STAGING && env.WF_KV_CANON && env.WF_KV_ARCHIVE);
        const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : [];
        if (!slugs.length) return json({ ok: false, error: "Provide slugs[]" }, 400);

        const results: any[] = [];
        for (const slug of slugs) {
          const stagingKey = `archivist/staging/${slug}.json`;
          let entry: any;
          if (useKV) {
            const raw = await env.WF_KV_STAGING.get(stagingKey, { type: "text" });
            if (!raw) {
              results.push({ slug, status: "missing_in_staging" });
              continue;
            }
            entry = JSON.parse(raw);
          } else {
            entry = { slug, tier: 2, entity_type: "article", lineage: {}, payload: {} };
          }

          const recomputed = await canonHashV1(baseForHash(entry));
          if (entry.canon_hash_v1 && entry.canon_hash_v1 !== recomputed) {
            results.push({ slug, status: "hash_mismatch" });
            continue;
          }

          entry.canon_hash_v1 = recomputed;
          entry.verification_status = "verified";
          entry.pending_promotion = false;
          entry.promoted_at = new Date().toISOString();

          if (useKV) {
            const canonKey = `archivist/canon/${slug}.json`;
            const oldCanon = await env.WF_KV_CANON.get(canonKey, { type: "text" });
            if (oldCanon) {
              const archiveKey = `archivist/archive/${slug}.${Date.now()}.json`;
              await env.WF_KV_ARCHIVE.put(archiveKey, oldCanon);
            }
            await env.WF_KV_CANON.put(canonKey, JSON.stringify(entry));
            await env.WF_KV_STAGING.delete(stagingKey);
            results.push({ slug, status: "promoted", canonKey });
          } else {
            results.push({ slug, status: "promoted (simulated)" });
          }
        }

        await writeCheckpoint(env, env.CANON_PREFIX);
        return json({ ok: true, results });
      } catch (err: any) {
        return json({ ok: false, error: String(err) }, 500);
      }
    }

    // --- Debug (hash compare)
    if (url.pathname === "/archivist/debug/hash_compare" && method === "GET") {
      const slug = url.searchParams.get("slug");
      if (!slug) return json({ ok: false, error: "slug required" }, 400);
      const raw = await env.WF_KV_STAGING.get(`archivist/staging/${slug}.json`, { type: "text" });
      if (!raw) return json({ ok: false, error: "not found" }, 404);
      const entry = JSON.parse(raw);
      const recomputed = await canonHashV1(baseForHash(entry));
      return json({ ok: true, stored: entry.canon_hash_v1, recomputed });
    }

    // --- Export (list index)
if (url.pathname === "/archivist/export/index" && method === "GET") {
  const tier = url.searchParams.get("tier");
  const archived = url.searchParams.get("archived") === "true";
  const q = url.searchParams.get("q") || "";

  // For now we’ll stub an empty list — later can be backed by WF_KV_CANON
  return json({
    ok: true,
    results: [],
    filters: { tier, archived, q },
  });
}

    // --- Default 404
    return json({ ok: false, error: "Not Found", path: url.pathname, method }, 404);
  }
};
