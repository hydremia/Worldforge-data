# Worldforge Infrastructure Reference — v3.0.0
_Last updated 2025-10-29_

## Overview
The Worldforge ecosystem runs on a multi-GPT architecture connected through a
Cloudflare Worker API and KV storage layer.  
All Custom GPTs authenticate to the same Worker using a shared API key.

**Primary Worker:**  
https://worldforge-api.hydremia.workers.dev

**GitHub Repositories**
- `worldforge-data` — canonical world data, changelogs, and promotion outputs
- `worldforge-legal` — public policy pages (privacy & terms)

**Active Canon Version:** `v3.0.0`

---

## Cloudflare Components
| Component | Purpose |
|------------|----------|
| **Worker** | Hosts REST API for runtime, staging, visuals, audit |
| **KV Namespaces** | Persistent world state & media indexes |

### KV Namespace Bindings
| Variable | Description |
|-----------|-------------|
| `WF_KV_RUNTIME` | Active capsule state (campaign runtime) |
| `WF_KV_SESSIONS` | Markdown session logs |
| `WF_KV_STAGING` | Draft entries from Creator & Atelier |
| `WF_KV_MEDIA` | Visual assets and metadata |

### Worker Variables
| Name | Type | Example |
|------|------|---------|
| `REPO_OWNER` | Text | `hydremia` |
| `REPO_NAME` | Text | `worldforge-data` |
| `REPO_BRANCH` | Text | `main` |
| `CANON_PREFIX` | Text | `v3.0.0` |

### Secrets
| Name | Example | Note |
|------|----------|------|
| `API_KEY` | `WF_KEY_a9b8c7d6e5f4` | Shared secret for GPT Actions |
| `GITHUB_PAT` | (optional) | Enables canon promotion |

---

## API Quick-Test Endpoints
- `GET /health` — heartbeat
- `GET /version` — returns canon prefix & repo path
- `POST /capsule/create` — new runtime capsule
- `GET/PUT /capsule/{token}/runtime` — fetch or update runtime
- `POST /capsule/{token}/session` — save markdown session log
- `POST /staging/ingest` — Creator/Atelier draft upload
- `POST /visuals/ingest` — visual prompt or base64 image ingest
- `GET /visuals/{id}` — list visuals linked to wf:id
- `POST /audit` — OPS audit hook

---

## Hosting / Legal Links
- **Privacy Policy:** https://hydremia.github.io/worldforge-legal/privacy  
- **Terms of Use:** https://hydremia.github.io/worldforge-legal/terms
