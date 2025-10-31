# 🌐 Worldforge Ecosystem Overview — v3.0 (Control Edition)

*Last updated 2025-10-30*
**Canonical Source:** *Worldforge v3 Master Summary (2025-10-29)*
**Purpose:** Central coordination document for the multi-GPT Worldforge ecosystem.
**Maintainer:** OPS GPT (primary) — Hub GPT (router)

---

## 🧭 System Dashboard (At-a-Glance)

| Item                       | Current Value                                       |
| -------------------------- | --------------------------------------------------- |
| **Canon Version**          | `v3.0.0`                                            |
| **Cloudflare Worker**      | `https://worldforge-api.hydremia.workers.dev`       |
| **GitHub Canon Repo**      | `hydremia/worldforge-data`                          |
| **Active GPT Nodes**       | Hub, DM, OPS, Creator, Atelier                      |
| **Current Capsule Tokens** | `WF_ACC`, `WF_DJ`, `WF_SUS`, `WF_WW`, `WF_CORE`     |
| **Latest OPS Log**         | *Pending initialization*                            |
| **Last Cross-Sync**        | *(To be logged once first OPS promotion completes)* |

---

## 🧩 GPT Architecture Map

| GPT         | Role                                  | Core API Endpoints                 | KV Namespace                      | Dependencies                  | Output Target                  |
| ----------- | ------------------------------------- | ---------------------------------- | --------------------------------- | ----------------------------- | ------------------------------ |
| **Hub**     | Router, navigator, system status      | `/version`, `/health`              | —                                 | All GPTs                      | User navigation / display      |
| **DM**      | Narrative runtime, capsule log engine | `/capsule/*`                       | `WF_KV_RUNTIME`, `WF_KV_SESSIONS` | Hub, OPS                      | Session logs, campaign updates |
| **Creator** | Ideation, draft generation            | `/staging/ingest`                  | `WF_KV_STAGING`                   | DM (exports), OPS (promotion) | Staging drafts                 |
| **OPS**     | Auditor, version control, promoter    | `/audit`                           | `WF_KV_PROMOTION` (planned)       | Creator, GitHub               | Canon commits                  |
| **Atelier** | Visual canon and style management     | `/visuals/ingest`, `/visuals/{id}` | `WF_KV_MEDIA`                     | Creator, OPS                  | Visual metadata, prompt DB     |

---

## 🔄 Data Flow Summary

```
[DM Capsule]
   ↓ (session export)
[WF_KV_SESSIONS]
   ↓
[Creator GPT]
   ↓ (draft or lore export)
[WF_KV_STAGING]
   ↓ (audit + QGate)
[OPS GPT]
   ↓ (promotion)
[GitHub Canon / worldforge-data/canon]
   ⇔ (reference sync)
[Hub GPT + Atelier GPT]
```

---

## 🧱 Canonical Infrastructure Recap

*(Directly from Master Summary; no modification)*

* **Worker URL:** `https://worldforge-api.hydremia.workers.dev`
* **KV Namespaces:** `WF_KV_RUNTIME`, `WF_KV_SESSIONS`, `WF_KV_STAGING`, `WF_KV_MEDIA`
* **Secrets/Vars:** `REPO_OWNER`, `REPO_NAME`, `REPO_BRANCH`, `CANON_PREFIX`, `API_KEY`
* **OpenAPI Spec:** `worldforge-data/api/worldforge_openapi_v3.yaml`
* **Legal:** `https://hydremia.github.io/worldforge-legal/privacy`, `.../terms`

---

## 🦉 Cross-GPT Thread Index

| GPT         | Build Thread                           | Dev Log Version    | Status    |
| ----------- | -------------------------------------- | ------------------ | --------- |
| **Hub**     | `Worldforge Hub — v3 Build Thread`     | *Pending creation* | ⬜ Planned |
| **DM**      | `Worldforge DM — v3 Build Thread`      | *Pending creation* | ⬜ Planned |
| **OPS**     | `Worldforge OPS — v3 Build Thread`     | *Pending creation* | ⬜ Planned |
| **Creator** | `Worldforge Creator — v3 Build Thread` | *Pending creation* | ⬜ Planned |
| **Atelier** | `Worldforge Atelier — v3 Build Thread` | *Pending creation* | ⬜ Planned |

Each GPT’s **Dev Log v3.0** will report Checkpoints and Handoff summaries here.

---

## 🥮 Master Checkpoint Log (Ecosystem Level)

| # | Date       | Source                           | Summary                                      | Status    |
| - | ---------- | -------------------------------- | -------------------------------------------- | --------- |
| 1 | 2025-10-29 | Rethinking GPT Worldforge Thread | v3 architecture and Master Summary finalized | ✅         |
| 2 | 2025-10-30 | This Thread (Master Control)     | Ecosystem Overview — Control Edition created | ✅         |
| 3 | —          | —                                | *Next cross-GPT decision*                    | ⬜ Pending |

(Use this to track all major structural decisions, not content-level ones. Each GPT will maintain its own Dev Log separately.)

---

## ⚙️ v3 Maintenance Rules

* **OPS Sync Frequency:** After every promoted commit or >48 hrs of active editing.
* **Version Bump Rule:**

  * Patch → `.x` for internal fixes (e.g. 3.0.1)
  * Minor → `.x` for added endpoints or GPT integrations (e.g. 3.1)
  * Major → full `.x` when API or file structure changes (e.g. 4.0)
* **QGate Policy:**

  * Warn at >5% file shrink
  * Block at >10% shrink
* **Bridge Sync:** All GPTs must confirm version parity before any file hand-off.

---

## 🧠 Canonical Summary Reference

The full text of the **Worldforge v3 Master Summary (2025-10-29)** is considered canonical and should be linked or appended here for archival.

---

## 🔬 Next Actions (Control Thread)

1. ✅ Confirm this Control Edition as the operational header of this thread.
2. ⏳ Spin up the 5 GPT build threads (Hub → DM → OPS → Creator → Atelier).
3. 🧱 Begin first cross-GPT test: DM exports capsule → Creator imports → OPS promotes → Hub displays.
4. 🗾 Log each milestone here in **Master Checkpoint Log**.
5. 🔐 OPS GPT to initialize QGate registry and character-count guardrails.

---

### *End of Ecosystem Overview — v3.0 (Control Edition)*
