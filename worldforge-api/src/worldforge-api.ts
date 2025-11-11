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
  WF_KV_RUNTIME: KVNamespace;
  WF_KV_SESSIONS: KVNamespace;
  WF_KV_STAGING: KVNamespace;
  WF_KV_MEDIA: KVNamespace;
}

type JsonResponse = Record<string, any>;

function json(data: JsonResponse, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
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
  const archivistUrl = env.ARCHIVIST_URL || "https://worldforge-archivist.yourdomain.dev/archivist/promote";
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

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      const authed = () => {
        const h = req.headers.get("Authorization") || "";
        return h.startsWith("Bearer ") && h.slice(7).trim() === env.OPS_TOKEN;
      };

      // --- Health / Version
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

      // --- GPT-5 Audit Endpoint
      if (path === "/audit" && method === "POST") {
        if (!authed()) return unauthorized();
        const body = await req.json().catch(() => ({}));
        const gptResult = await callGPT(env, body);

        // Optional: determine PASS/FAIL logic from GPT response
        const verdict = gptResult?.choices?.[0]?.message?.content?.includes("PASS") ? "PASS" : "FAIL";

        return json({ ok: true, verdict, gptResult });
      }

      // --- Promotion Bridge
      if (path === "/promote" && method === "POST") {
        if (!authed()) return unauthorized();
        const body = await req.json().catch(() => ({}));
        if (!Array.isArray(body.slugs)) return json({ error: "slugs[] required" }, 400);

        const result = await promoteToArchivist(env, { slugs: body.slugs });
        return json({ ok: true, promoted: result });
      }

      // --- Capsule / Visual / Staging Endpoints (kept for backward compat)
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
