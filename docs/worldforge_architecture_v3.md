# Worldforge Architecture Overview — v3.0.0
_Last updated 2025-10-29_

## Multi-GPT Ecosystem
| GPT | Primary Function | Key API Endpoints |
|-----|------------------|-------------------|
| **Hub** | Navigator & router; displays version, campaign list, and GPT links | `/version`, `/health` |
| **DM** | Narration, adjudication, capsule runtime & session save | `/capsule/create`, `/capsule/{token}/runtime`, `/capsule/{token}/session` |
| **OPS** | Audits, QGate checks, promotion prep | `/audit`, (future `/promote`) |
| **Creator** | Ideation & worldbuilding drafts | `/staging/ingest` |
| **Atelier** | Visual canon & illustration prompt ingestion | `/visuals/ingest`, `/visuals/{id}` |

All GPTs share:
- Same Worker base URL
- Same API_KEY secret
- Canon prefix `v3.0.0`
- Same privacy/terms URLs

---

## Data Flow
1. **Creator** and **Atelier** post new drafts → `WF_KV_STAGING`
2. **DM** runs sessions → runtime stored in `WF_KV_RUNTIME` and logs in `WF_KV_SESSIONS`
3. **OPS** audits staging → outputs changelog or promotion
4. **Hub** queries `/version` → presents live system status

---

## Design Goals
- Persistent but modular living world
- Campaign isolation (per-capsule runtime tokens)
- Seamless creative + play handoff
- Unified canon pipeline via Cloudflare + GitHub
