# Worldforge v3 Bridge Handoff
_Last updated 2025-10-30_

## Purpose
This Bridge provides a lightweight handoff header between GPTs, defining their shared version, data sources, and control references within the Worldforge v3 ecosystem.

## Canonical References
- **Design Reference:** [`/docs/architecture/Worldforge_v3_Master_Summary.md`](https://github.com/hydremia/worldforge-data/tree/main/docs/architecture/)
- **Operational Reference:** [`/docs/control/Worldforge_v3_Ecosystem_Control.md`](https://github.com/hydremia/worldforge-data/tree/main/docs/control/)
- **API Specification:** [`/api/worldforge_openapi_v3.yaml`](https://github.com/hydremia/worldforge-data/tree/main/api/)
- **Worker Endpoint:** `https://worldforge-api.hydremia.workers.dev`

## Version
- **Canon Version:** `v3.0.0`
- **Bridge Version:** `v3.0.0-Bridge`
- **Last OPS Sync:** _Pending first promotion under v3_

## Shared Assets
- KV Namespaces: `WF_KV_RUNTIME`, `WF_KV_SESSIONS`, `WF_KV_STAGING`, `WF_KV_MEDIA`
- Repo: `hydremia/worldforge-data`
- Maintainer GPTs: Hub, DM, OPS, Creator, Atelier

## Function
This Bridge acts as the standardized loader header for all GPTs in the Worldforge ecosystem, ensuring:
- Version parity across all modules
- Access to canonical architecture
- Consistent API and KV schema usage
- Smooth session handoffs between GPTs


# Worldforge v3 Bridge / Handoff Document
_Last updated 2025-10-29_

## 1. System Overview
Five-GPT ecosystem connected via the Worldforge API at  
https://worldforge-api.hydremia.workers.dev

| GPT | Core Function |
|-----|----------------|
| Hub | Routing, navigation, status, campaign selection |
| DM | Gameplay runtime, session management |
| OPS | Auditing, promotion, version control |
| Creator | Ideation, lore generation, staging ingest |
| Atelier | Visual canon, art prompt generation, visual ingest |

Shared constants:
- Canon prefix: `v3.0.0`
- API secret: `WF_KEY_a9b8c7d6e5f4`
- Privacy: https://hydremia.github.io/worldforge-legal/privacy  
- Terms: https://hydremia.github.io/worldforge-legal/terms

## 2. API Storage Layout
- `WF_KV_RUNTIME` — active capsule state  
- `WF_KV_SESSIONS` — session logs  
- `WF_KV_STAGING` — drafts  
- `WF_KV_MEDIA` — visuals  

## 3. Dev Process Summary
Use the standard Dev Log template (see `dev_process_v3.md`).  
When starting a new build thread, paste this Bridge header followed by the latest Dev Log summary.

## 4. Source Repositories
- Worker: worldforge-api.hydremia.workers.dev  
- Canon data: https://github.com/hydremia/worldforge-data  
- Legal: https://github.com/hydremia/worldforge-legal

## 5. Next Phase
Begin per-GPT build threads in this order:
1. DM  
2. OPS  
3. Creator  
4. Atelier  
5. Hub
