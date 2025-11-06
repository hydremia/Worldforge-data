var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ARCHIVIST/routes/adapters/wa_adapter.mjs
function parseWA(json) {
  const proposals = [];
  let total = 0, matched = 0, isNew = 0;
  if (!json || typeof json !== "object") return { proposals, totals: { total, matched, isNew } };
  const push = /* @__PURE__ */ __name((entity_type, arr = []) => {
    for (const it of arr || []) {
      total += 1;
      const slug = (it.slug || safeSlug(it.title || it.name || `wa-${entity_type}-${total}`)).toLowerCase();
      proposals.push({
        slug,
        entity_type,
        tier_suggested: 2,
        // External Canon by default
        confidence: "medium",
        status: "new",
        // Without KV lookup we mark as 'new'
        conflicts_with: [],
        delta_summary: it.title || it.name || slug,
        promotion_readiness: 0.6
      });
      isNew += 1;
    }
  }, "push");
  push("article", json.articles);
  push("character", json.characters);
  push("location", json.locations);
  push("faction", json.factions);
  push("item", json.items);
  push("event", json.events);
  push("other", json.other);
  return { proposals, totals: { total, matched, isNew } };
}
__name(parseWA, "parseWA");
function safeSlug(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}
__name(safeSlug, "safeSlug");

// ARCHIVIST/routes/shared_review.mjs
async function makeReviewPacket(source_uri, adapter, body = {}) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let proposals = [];
  let totals = { total: 0, isNew: 0, matched: 0 };
  if ((adapter === "wa" || adapter === "worldanvil") && body.wa_json) {
    try {
      const parsed = typeof body.wa_json === "string" ? JSON.parse(body.wa_json) : body.wa_json;
      const out = parseWA(parsed);
      proposals = out.proposals;
      totals = { total: out.totals.total, isNew: out.totals.isNew, matched: out.totals.matched };
    } catch (e) {
    }
  }
  return {
    review_id: cryptoRandomId(),
    source_uri,
    source_adapter: adapter,
    scan_summary: { entities_total: totals.total, entities_new: totals.isNew, entities_matched: totals.matched },
    proposals,
    gaps: [],
    duplicates: [],
    conflicts: [],
    recommendations: proposals.length ? ["Review proposals and promote selected"] : ["No-op: analyzer stub"],
    est_effort: { ops_review_minutes: Math.max(1, Math.ceil((proposals.length || 1) / 25)), merge_complexity: proposals.length > 50 ? "med" : "low" },
    generated_at: now
  };
}
__name(makeReviewPacket, "makeReviewPacket");
function cryptoRandomId() {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[/+=]/g, "").slice(0, 16);
}
__name(cryptoRandomId, "cryptoRandomId");

// ARCHIVIST/routes/review.mjs
var onRequestPost = /* @__PURE__ */ __name(async (ctx) => {
  const body = await ctx.request.json().catch(() => ({}));
  const pkt = await makeReviewPacket(body.source_uri || "unknown", body.adapter || "wa", body);
  return new Response(JSON.stringify(pkt), { headers: { "content-type": "application/json" } });
}, "onRequestPost");

// ARCHIVIST/routes/ingest.mjs
var onRequestPost2 = /* @__PURE__ */ __name(async (ctx) => {
  const url = new URL(ctx.request.url);
  const dry = url.searchParams.get("dry_run") === "true";
  const body = await ctx.request.json().catch(() => ({}));
  if (dry) {
    const pkt = await makeReviewPacket(body.source_uri || "unknown", body.adapter || "wa", body);
    return new Response(JSON.stringify(pkt), { headers: { "content-type": "application/json" } });
  }
  return new Response(JSON.stringify({ ok: true, staged: true, count: 0 }), { headers: { "content-type": "application/json" } });
}, "onRequestPost");

// ARCHIVIST/routes/lineage.mjs
function baseForHash(entry) {
  const e = JSON.parse(JSON.stringify(entry || {}));
  delete e.canon_hash_v1;
  delete e.promoted_at;
  if (e.lineage && typeof e.lineage === "object" && "last_hash" in e.lineage) {
    const { last_hash, ...rest } = e.lineage;
    e.lineage = rest;
  }
  return e;
}
__name(baseForHash, "baseForHash");
function stableStringify(obj) {
  const seen = /* @__PURE__ */ new WeakSet();
  const stringify = /* @__PURE__ */ __name((o) => {
    if (o === null || typeof o !== "object") return JSON.stringify(o);
    if (seen.has(o)) throw new TypeError("circular structure");
    seen.add(o);
    if (Array.isArray(o)) {
      return "[" + o.map((v) => stringify(v)).join(",") + "]";
    }
    const keys = Object.keys(o).sort();
    const entries = keys.map((k) => JSON.stringify(k) + ":" + stringify(o[k]));
    return "{" + entries.join(",") + "}";
  }, "stringify");
  return stringify(obj);
}
__name(stableStringify, "stableStringify");
async function canonHashV1(obj) {
  const text = stableStringify(obj);
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(canonHashV1, "canonHashV1");

// ARCHIVIST/routes/promote.mjs
var onRequestPost3 = /* @__PURE__ */ __name(async (ctx) => {
  const started = Date.now();
  try {
    const body = await ctx.request.json().catch(() => ({}));
    const auth = ctx.request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const expected = ctx.env?.OPS_TOKEN || process.env.OPS_TOKEN || "";
    if (!expected || token !== expected) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" }
      });
    }
    const useKV = !!(ctx.env?.WF_KV_STAGING && ctx.env?.WF_KV_CANON && ctx.env?.WF_KV_ARCHIVE);
    const slugs = Array.isArray(body.slugs) ? body.slugs : [];
    if (!slugs.length) {
      return new Response(JSON.stringify({ ok: false, error: "Provide slugs[]" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const results = [];
    for (const slug of slugs) {
      const stagingKey = `archivist/staging/${slug}.json`;
      let entry;
      if (useKV) {
        const raw = await ctx.env.WF_KV_STAGING.get(stagingKey, { type: "text" });
        if (!raw) {
          results.push({ slug, status: "missing_in_staging" });
          continue;
        }
        entry = JSON.parse(raw);
      } else {
        entry = {
          slug,
          tier: 2,
          entity_type: "article",
          verification_status: "pending",
          pending_promotion: true,
          confidence: "medium",
          lineage: { entry_id: `staging:${slug}`, origin: {}, edits: [], merged_from: [], verified_by: [], last_hash: "" },
          payload: {},
          canon_hash_v1: "",
          _warnings: []
        };
      }
      const recomputed = await canonHashV1(baseForHash(entry));
      if (entry.canon_hash_v1 && entry.canon_hash_v1 !== recomputed) {
        results.push({ slug, status: "hash_mismatch", expected: entry.canon_hash_v1, got: recomputed });
        continue;
      }
      entry.canon_hash_v1 = recomputed;
      entry.verification_status = "verified";
      entry.pending_promotion = false;
      entry.promoted_at = (/* @__PURE__ */ new Date()).toISOString();
      if (useKV) {
        const canonKey = `archivist/canon/${slug}.json`;
        const oldCanon = await ctx.env.WF_KV_CANON.get(canonKey, { type: "text" });
        if (oldCanon) {
          const archiveKey = `archivist/archive/${slug}.${Date.now()}.json`;
          await ctx.env.WF_KV_ARCHIVE.put(archiveKey, oldCanon);
        }
        await ctx.env.WF_KV_CANON.put(canonKey, JSON.stringify(entry));
        await ctx.env.WF_KV_STAGING.delete(stagingKey);
        results.push({ slug, status: "promoted", canonKey });
      } else {
        results.push({ slug, status: "promoted (simulated)" });
      }
    }
    return new Response(JSON.stringify({ ok: true, results, ms: Date.now() - started }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestPost");

// ARCHIVIST/routes/review_promote_selected.mjs
var SLUG_RE = /^[a-z0-9_-]+$/;
var onRequestPost4 = /* @__PURE__ */ __name(async (ctx) => {
  try {
    const body = await ctx.request.json().catch(() => ({}));
    const slugs = Array.isArray(body.slugs) ? body.slugs : [];
    const target_tier = Number(body.target_tier ?? 2);
    const notes = typeof body.notes === "string" ? body.notes : "";
    const review_id = body.review_id || null;
    const audit = { warnings: [], errors: [] };
    if (!slugs.length) audit.errors.push("Body.slugs must be a non-empty array.");
    if (![1, 2].includes(target_tier)) audit.errors.push("target_tier must be 1 or 2.");
    const uniq = [];
    const dupes = [];
    const invalid = [];
    for (const s of slugs) {
      if (typeof s !== "string" || !SLUG_RE.test(s)) {
        invalid.push(s);
        continue;
      }
      if (uniq.includes(s)) dupes.push(s);
      else uniq.push(s);
    }
    if (invalid.length) audit.warnings.push(`Invalid slugs filtered: ${invalid.join(", ")}`);
    if (dupes.length) audit.warnings.push(`Duplicate slugs ignored: ${dupes.join(", ")}`);
    if (audit.errors.length) {
      return new Response(JSON.stringify({ ok: false, review_id, errors: audit.errors, warnings: audit.warnings }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const useKV = !!(ctx.env && ctx.env.WF_KV_STAGING);
    const staged = [];
    for (const slug of uniq) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const entry = {
        slug,
        entity_type: "article",
        tier: target_tier,
        source_type: target_tier === 1 ? "internal" : "external",
        verification_status: "pending",
        pending_promotion: true,
        confidence: target_tier === 1 ? "high" : "medium",
        archived_version: false,
        lineage: {
          entry_id: `staging:${slug}`,
          origin: { source: "External", tier: target_tier, author: "ArchivistReview", timestamp: now, signature: "" },
          edits: [],
          merged_from: [],
          verified_by: [],
          last_hash: ""
        },
        payload: {}
      };
      entry._warnings ||= [];
      const basis = baseForHash(entry);
      entry.canon_hash_v1 = await canonHashV1(basis);
      entry.lineage.last_hash = entry.canon_hash_v1;
      const key = `archivist/staging/${slug}.json`;
      if (useKV) {
        await ctx.env.WF_KV_STAGING.put(key, JSON.stringify(entry));
        staged.push({ slug, target_tier, staged_to: "WF_KV_STAGING", key, _warnings: entry._warnings || [] });
      } else {
        staged.push({ slug, target_tier, staged_to: "WF_KV_STAGING (simulated)", key, _warnings: entry._warnings || [] });
      }
    }
    return new Response(JSON.stringify({
      ok: true,
      review_id,
      target_tier,
      notes,
      staged_count: staged.length,
      staged,
      audit
    }), { headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}, "onRequestPost");

// ARCHIVIST/routes/export.mjs
var onRequestGet = /* @__PURE__ */ __name(async (ctx) => {
  const url = new URL(ctx.request.url);
  const tier = url.searchParams.get("tier");
  const archived = url.searchParams.get("archived") === "true";
  const q = url.searchParams.get("q") || "";
  return new Response(JSON.stringify({ ok: true, results: [], filters: { tier, archived, q } }), { headers: { "content-type": "application/json" } });
}, "onRequestGet");

// ARCHIVIST/routes/rollback.mjs
var onRequestPost5 = /* @__PURE__ */ __name(async (ctx) => {
  return new Response(JSON.stringify({ ok: true, action: "noop" }), { headers: { "content-type": "application/json" } });
}, "onRequestPost");

// ARCHIVIST/routes/debug_get.mjs
var onRequestGet2 = /* @__PURE__ */ __name(async (ctx) => {
  const url = new URL(ctx.request.url);
  const store = url.searchParams.get("store");
  const slug = url.searchParams.get("slug");
  if (!store || !slug) return new Response(JSON.stringify({ ok: false, error: "store & slug required" }), { status: 400 });
  const map = {
    staging: ctx.env?.WF_KV_STAGING,
    canon: ctx.env?.WF_KV_CANON,
    archive: ctx.env?.WF_KV_ARCHIVE
  };
  const kv = map[store];
  if (!kv) return new Response(JSON.stringify({ ok: false, error: `unknown store: ${store}` }), { status: 400 });
  const key = `archivist/${store}/${slug}.json`;
  const raw = await kv.get(key, { type: "text" });
  if (!raw) return new Response(JSON.stringify({ ok: false, error: "not found", key }), { status: 404 });
  return new Response(raw, { headers: { "content-type": "application/json" } });
}, "onRequestGet");

// ARCHIVIST/routes/debug_hash_compare.mjs
var onRequestGet3 = /* @__PURE__ */ __name(async (ctx) => {
  const url = new URL(ctx.request.url);
  const store = url.searchParams.get("store") || "staging";
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ ok: false, error: "slug required" }), { status: 400 });
  const map = {
    staging: ctx.env?.WF_KV_STAGING,
    canon: ctx.env?.WF_KV_CANON,
    archive: ctx.env?.WF_KV_ARCHIVE
  };
  const kv = map[store];
  if (!kv) return new Response(JSON.stringify({ ok: false, error: `unknown store: ${store}` }), { status: 400 });
  const key = `archivist/${store}/${slug}.json`;
  const raw = await kv.get(key, { type: "text" });
  if (!raw) return new Response(JSON.stringify({ ok: false, error: "not found", key }), { status: 404 });
  const entry = JSON.parse(raw);
  const basis = baseForHash(entry);
  const storedHash = entry.canon_hash_v1 || null;
  const recomputed = await canonHashV1(basis);
  return new Response(JSON.stringify({
    ok: true,
    key,
    storedHash,
    recomputed,
    same: storedHash ? storedHash === recomputed : null
  }), { headers: { "content-type": "application/json" } });
}, "onRequestGet");

// worker.mjs
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const rctx = { request, env, ctx };
    if (url.pathname === "/archivist/review" && method === "POST") return onRequestPost(rctx);
    if ((url.pathname === "/archivist/ingest" || url.pathname === "/archivist/ingest/wa") && method === "POST") return onRequestPost2(rctx);
    if (url.pathname === "/archivist/promote" && method === "POST") return onRequestPost3(rctx);
    if (url.pathname === "/archivist/review/promote_selected" && method === "POST") return onRequestPost4(rctx);
    if (url.pathname === "/archivist/export/index" && method === "GET") return onRequestGet(rctx);
    if ((url.pathname === "/archivist/rollback" || url.pathname === "/archivist/deprecate" || url.pathname === "/archivist/restore") && method === "POST") return onRequestPost5(rctx);
    if (url.pathname === "/archivist/debug/get" && method === "GET") return onRequestGet2(rctx);
    if (url.pathname === "/archivist/debug/hash_compare" && method === "GET") return onRequestGet3(rctx);
    return new Response(JSON.stringify({ ok: false, error: "Not Found", path: url.pathname, method }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }
};

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-z7PU2V/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-z7PU2V/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
