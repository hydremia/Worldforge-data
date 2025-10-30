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
