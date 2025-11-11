# Worldforge OPS — Archivist + API Workers (v3.5.5)

**Generated:** 2025-11-10

This repository contains the **Worldforge operational core** and **Cloudflare Workers** for managing OPS, Archivist, and Nomina data pipelines.

---

## 📦 Contents

| Path                          | Purpose                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `/worldforge-api/`            | Main API Worker — handles runtime capsules, visuals, staging, and audit endpoints. |
| `/worldforge-archivist/`      | Archivist Worker — handles review, staging, and canon promotion workflows.         |
| `/ops-core/`                  | Core OPS logic, schemas, and QGate/PROMOTE definitions.                            |
| `/docs/ops/`                  | Operational documentation, promotion schemas, and bridge sync specs.               |
| `/docs/lexicon/`              | Lexicon and Nomina seed data with changelogs.                                      |
| `/docs/api/QuickStart_Hub.md` | Hub API test guide for capsule, session, and visual endpoints.                     |
| `/QuickStart.md`              | Developer setup and deployment guide for local + Cloudflare workflows.             |
| `/tools/`                     | Developer utilities and validation scripts.                                        |

---

## 🚀 Quick Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Authenticate with Cloudflare**

   ```bash
   wrangler login
   ```

3. **Set required secrets**

   ```bash
   wrangler secret put OPS_TOKEN
   wrangler secret put OPENAI_API_KEY
   ```

4. **Deploy Workers**

   ```bash
   npm run deploy:api
   npm run deploy:archivist
   ```

5. **Verify health**

   ```bash
   curl https://worldforge-api.hydremia.workers.dev/health
   curl https://worldforge-archivist.hydremia.workers.dev/debug/routes
   ```

---

## 🧩 Notes

* `OPS_TOKEN` secures all promotion and audit actions.
* Workers use **TypeScript (ESM)** for reproducible, deterministic promotion flow.
* `canon_hash_v1` hashes are generated using stable JSON serialization and SHA-256.
* Wrangler manages KV bindings for runtime and canon stores.

---

## 📚 Documentation

| Category                              | Location                     |
| ------------------------------------- | ---------------------------- |
| OPS QGate, Promotion, and Bridge Sync | `docs/ops/`                  |
| Nomina Seeds and Lexicon Data         | `docs/lexicon/`              |
| Privacy Policy                        | `docs/PRIVACY_POLICY.md`     |
| Hub Capsule API Reference             | `docs/api/QuickStart_Hub.md` |

---

**Maintained by:** Hydremia / Worldforge OPS
**License:** MIT
