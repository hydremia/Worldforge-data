var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// workers/hub_worker.ts
var capsuleStore = /* @__PURE__ */ new Map();
var sessionLog = [];
var sandboxStore = /* @__PURE__ */ new Map();
var auditInbox = [];
function json(res, status = 200) {
  return new Response(JSON.stringify(res), { status, headers: { "content-type": "application/json" } });
}
__name(json, "json");
function bad(msg, status = 400) {
  return json({ ok: false, error: msg }, status);
}
__name(bad, "bad");
function iso(ts) {
  return new Date(ts ?? Date.now()).toISOString();
}
__name(iso, "iso");
function randomId(prefix, len = 18) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[^a-z0-9]/gi, "");
  return prefix + b64.slice(0, len);
}
__name(randomId, "randomId");
function maskToken(t) {
  return t ? t.slice(0, 4) + "\u2026" + t.slice(-6) : "";
}
__name(maskToken, "maskToken");
async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
function isString(v) {
  return typeof v === "string";
}
__name(isString, "isString");
function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
__name(isObject, "isObject");
function hasKeys(obj, keys) {
  return isObject(obj) && keys.every((k) => k in obj);
}
__name(hasKeys, "hasKeys");
var hub_worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      if (req.method === "GET" && path === "/version") {
        return json({ service: "HUB_WORKER", version: "v3.1.0", timestamp: iso() });
      }
      if (req.method === "GET" && path === "/health") {
        const status = url.searchParams.get("status") || "PASS";
        return json({ status, details: status === "PASS" ? "ok" : status.toLowerCase() });
      }
      if (req.method === "POST" && path === "/auth/issue") {
        const body = await readJson(req);
        if (!body || !isString(body.session_id) || !isString(body.username)) return bad("invalid body: { session_id, username }");
        const token = randomId("wf_", 22);
        capsuleStore.set(token, { username: body.username, state: { resume_available: false, last_route: null } });
        return json({ capsule_token: token, issued_at: iso() });
      }
      if (req.method === "POST" && path === "/capsule/save") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token) || !isString(body.username) || !isObject(body.state)) return bad("invalid body: { capsule_token, username, state }");
        if (!capsuleStore.has(body.capsule_token)) return bad("unknown token", 401);
        capsuleStore.set(body.capsule_token, { username: body.username, state: body.state });
        return json({ ok: true });
      }
      if (req.method === "POST" && path === "/capsule/load") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token)) return bad("invalid body: { capsule_token }");
        const rec = capsuleStore.get(body.capsule_token);
        if (!rec) return bad("unknown token", 401);
        return json({ ok: true, username: rec.username, state: rec.state });
      }
      if (req.method === "POST" && path === "/sandbox/new") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token)) return bad("invalid body: { capsule_token }");
        const ttl = typeof body.ttl_s === "number" ? body.ttl_s : 1200;
        const id = randomId("sbx_", 12);
        sandboxStore.set(id, { expires: Date.now() + ttl * 1e3 });
        return json({ sandbox_id: id, expires_at: iso(Date.now() + ttl * 1e3) });
      }
      if (req.method === "POST" && path === "/session/log") {
        const body = await readJson(req);
        if (!body || !isString(body.capsule_token) || !isString(body.event) || !isString(body.ts)) return bad("invalid body: { capsule_token, event, ts, payload? }");
        sessionLog.push({ token: maskToken(body.capsule_token), event: body.event, payload: body.payload ?? {}, ts: body.ts });
        return json({ ok: true }, 202);
      }
      if (req.method === "POST" && path === "/audit/qgate") {
        const body = await readJson(req);
        if (!body || !hasKeys(body, ["source", "bundle", "hashes", "items"])) {
          return bad("invalid body: { source, bundle, hashes, items[] }");
        }
        if (!isString(body.source) || !isString(body.bundle) || !isObject(body.hashes) || !Array.isArray(body.items)) {
          return bad("invalid types in body");
        }
        const invalid = body.items.some((it) => !hasKeys(it, ["file", "before", "after", "delta", "pct", "flagged"]));
        if (invalid) return bad("invalid items schema");
        const record = { ts: iso(), report: body };
        auditInbox.push(record);
        const flagged = body.items.filter((i) => i.flagged);
        const status = flagged.length ? "OPS_WARN" : "OPS_PASS";
        return json({ status, received: body.items.length, flagged: flagged.length, stored_at: auditInbox.length });
      }
      if (req.method === "GET" && path === "/session/logs") {
        return json({ logs: sessionLog });
      }
      if (req.method === "POST" && path === "/capsule/reset") {
        capsuleStore.clear();
        return json({ ok: true });
      }
      return json({ ok: false, error: "Not Found", path }, 404);
    } catch (e) {
      return json({ ok: false, error: e?.message || String(e) }, 500);
    }
  }
};

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
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

// .wrangler/tmp/bundle-C62Rq6/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = hub_worker_default;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-C62Rq6/middleware-loader.entry.ts
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
//# sourceMappingURL=hub_worker.js.map
