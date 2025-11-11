# QuickStart — Hub Worker & Capsule API Test (v3.5.5)

This quickstart demonstrates how to verify and interact with the **Worldforge Hub Worker** API endpoints — focusing on capsule creation, runtime storage, and session export.

---

## 🧱 Base Endpoints

All requests use the deployed Hub Worker:

```
https://worldforge-api.hydremia.workers.dev
```

Each endpoint supports simple JSON-based testing via `curl`, Postman, or a browser REST client.

---

## ⚙️ 1. Health & Version

Verify deployment and repo alignment:

```bash
curl https://worldforge-api.hydremia.workers.dev/health
curl https://worldforge-api.hydremia.workers.dev/version
```

Example response:
```json
{
  "ok": true,
  "time": "2025-11-10T18:00:00Z"
}
```

---

## 🔐 2. Create Capsule

Create a new runtime capsule using your OPS token:

```bash
curl -X POST \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"example-session-token"}' \
  https://worldforge-api.hydremia.workers.dev/capsule/create
```

Expected response:
```json
{ "ok": true, "token": "example-session-token" }
```

This initializes a runtime KV entry for your session.

---

## 🧠 3. Get / Update Runtime

Retrieve or modify your session runtime data:

```bash
curl https://worldforge-api.hydremia.workers.dev/capsule/example-session-token/runtime
```

To update it:
```bash
curl -X PUT \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"canonVersion":"v3.5.5","flags":{"qgate":"ready"}}' \
  https://worldforge-api.hydremia.workers.dev/capsule/example-session-token/runtime
```

---

## 💾 4. Save Session Markdown

Save a session export (e.g., a log or transcript) to KV:

```bash
curl -X POST \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"session1.md","markdown":"# Session Export\nAll good."}' \
  https://worldforge-api.hydremia.workers.dev/capsule/example-session-token/session
```

---

## 🧪 5. Visual Ingest (Optional)

If your session references generated visuals:

```bash
curl -X POST \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"wf:gear-test","prompt":"fiery gear glowing","tags":["gear","promo"]}' \
  https://worldforge-api.hydremia.workers.dev/visuals/ingest
```

---

## 🧭 Notes

- All authenticated routes require a Bearer `OPS_TOKEN`.
- Capsule runtime objects are stored in the `WF_KV_RUNTIME` namespace.
- Markdown exports are stored in `WF_KV_SESSIONS`.
- Visual assets and metadata write to `WF_KV_MEDIA` or `WF_KV_STAGING` depending on availability.

---

**Purpose:** Internal verification of hub communication, capsule state management, and KV I/O correctness.

**Last updated:** 2025-11-10

