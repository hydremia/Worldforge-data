# Quick Start — Worldforge Workers (v3.5.5)

This guide walks through local testing and deployment for both the **API** and **Archivist** Workers.

---

## 🧱 Requirements

* Node.js 18+
* Wrangler 4.46+
* A Cloudflare account with KV namespaces configured

---

## 🛠️ Install

```bash
npm install
```

---

## 🔧 Development Mode

Run either worker locally:

```bash
npm run dev:api
npm run dev:archivist
```

You’ll see logs in your terminal and can test endpoints like:

```bash
curl http://127.0.0.1:8787/version
curl http://127.0.0.1:8787/health
```

---

## 🚀 Deploy to Cloudflare

```bash
npm run deploy:api
npm run deploy:archivist
```

After deployment, verify endpoints:

```bash
curl https://worldforge-api.hydremia.workers.dev/version
curl https://worldforge-archivist.hydremia.workers.dev/debug/routes
```

---

## 🔐 Set Secrets

```bash
wrangler secret put OPS_TOKEN
wrangler secret put OPENAI_API_KEY
```

---

## 🧩 Promotion Example

```bash
curl -X POST \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slugs":["example-entry"]}' \
  https://worldforge-archivist.hydremia.workers.dev/archivist/promote
```

---

## 🤬 Notes

* All routes are authenticated using `OPS_TOKEN`.
* Canon promotion auto-writes to `WF_KV_CANON` and archives older versions.
* A checkpoint is written to `WF_KV_RUNTIME` after each successful promotion.

---

**Last updated:** 2025-11-10
