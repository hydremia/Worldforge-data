# Worldforge v3 Master Summary

_Last updated 2025-10-29_

This document provides a comprehensive summary of the **Worldforge v3** system as conceived and designed in the preceding planning sessions. It captures the full context, design intent, architecture, and operational philosophy for the new modular multi-GPT worldbuilding and gameplay environment.  It is meant to complement the lightweight `Worldforge_v3_Bridge_Handoff.md` and other v3 architecture files by preserving the “why” behind the system design.

---

## 1. Project Overview and Goals

Worldforge v3 is a unified, modular, and persistent storytelling ecosystem built around Dungeons & Dragons 5.5e rules. Its primary mission is to sustain a **living Forgotten Realms-based world** shared across multiple campaigns, each of which contributes to the evolving canon.

The system moves away from monolithic GPT builds toward a **multi-GPT architecture**, where specialized GPTs operate in coordinated roles. Each GPT references a shared API and data environment, enabling seamless transitions between creative ideation, gameplay, visual illustration, and operational management.

### Core Objectives
- Maintain **persistent campaign states** without cross-campaign bleed.  
- Enable **multi-user collaboration** through stable, shareable GPTs.  
- Implement **clear promotion workflows** between draft, staging, and canon.  
- Combine creative flexibility with strong technical guardrails.  
- Optimize interoperability through a **central API** (Cloudflare Workers + KV).  
- Create a scalable foundation for future automation and Agent-driven support.

---

## 2. Core Problems Solved in v3

### 2.1 Campaign Bleed and Confusion
Earlier implementations stored lore and runtime context directly within GPT sessions, causing characters and events from one campaign to appear in another.  
**v3 Fix:** Per-campaign “capsules” in KV storage isolate runtime states by token.

### 2.2 Data Availability and Hallucinations
GPTs often lost access to essential stats, world data, and canonical references.  
**v3 Fix:** All persistent data is centralized in `worldforge-data` (GitHub) and synchronized through Cloudflare KV namespaces (`WF_KV_RUNTIME`, `WF_KV_SESSIONS`, etc.), eliminating hallucinated or missing details.

### 2.3 Documentation and Continuity Gaps
Without standard logging, major decisions and edits were lost between updates.  
**v3 Fix:** Dev Log process + Bridge Handoff templates ensure structured continuity.

### 2.4 Loss of Conversational Tone
Over-rigid instruction sets eroded creative dialogue.  
**v3 Fix:** Clear separation of “play” and “ops” modes. DM GPT preserves narrative tone while OPS GPT enforces structure only during audits or promotions.

### 2.5 Truncated or Lost Files
Prior promotion workflows risked overwriting or truncating content.  
**v3 Fix:** OPS GPT runs file size audits, compares before/after character counts, and logs changes through GitHub commits or Cloudflare logs.

---

## 3. Design Philosophy and Key Decisions

### 3.1 Multi-GPT Modularity
Each GPT is a **specialized node**:
- **Hub** – router and navigator  
- **DM** – narrative runtime engine  
- **OPS** – auditor and promoter  
- **Creator** – ideation and staging environment  
- **Atelier** – visual canon and art direction  

All share the same API backend and canon version (`v3.0.0`).

### 3.2 Shared Data, Segmented Context
Information is stored once, referenced many times. GPTs use KV capsules or staging data via the API, but each GPT has its own instruction set and memory boundary to prevent overlap.

### 3.3 GitHub as Canon Repository
`worldforge-data` serves as the **Single Source of Truth (SSOT)**.  
- `/docs/` → infrastructure and governance  
- `/api/` → OpenAPI spec  
- `/canon/` → finalized promoted material  
- `/staging/` → Creator and Atelier drafts

### 3.4 Worker API as Central Spine
The Cloudflare Worker acts as the **spine** connecting GPTs:
- Provides consistent endpoints (`/capsule`, `/staging`, `/visuals`, `/audit`)  
- Manages secrets and variables  
- Uses KV namespaces to store and retrieve structured JSON or Markdown.

### 3.5 Transparency and Portability
All architecture files are public and readable in GitHub, allowing collaboration and inspection. The system is designed to be reproducible by any contributor.

---

## 4. System Architecture and Roles

| GPT | Core Function | API Endpoints | Primary KV Namespace |
|-----|----------------|----------------|----------------------|
| **Hub** | Router, navigator, version/status display | `/version`, `/health` | none |
| **DM** | Narration, runtime state, session logs | `/capsule/*` | `WF_KV_RUNTIME`, `WF_KV_SESSIONS` |
| **OPS** | Audits, versioning, promotion | `/audit` | (future) `WF_KV_PROMOTION` |
| **Creator** | Ideation, lore, staging exports | `/staging/ingest` | `WF_KV_STAGING` |
| **Atelier** | Visual canon, art prompt storage | `/visuals/ingest`, `/visuals/{id}` | `WF_KV_MEDIA` |

### 4.1 Capsule Runtime System
- Each campaign operates in a **capsule** identified by a unique token.  
- The capsule tracks runtime variables, character stats, and session logs.  
- Logs are saved to KV and optionally exported to GitHub via OPS promotion.

### 4.2 Promotion Workflow
1. **Creator** or **Atelier** submits drafts → `WF_KV_STAGING`.  
2. **OPS** runs QGate audits (size, schema, changelog).  
3. Approved entries are committed to GitHub canon folders.  

### 4.3 Visual Canon Integration
Visuals (e.g., character portraits, glyphs, maps) are stored as metadata in `WF_KV_MEDIA` and linked to entities by `wf:id`. Atelier manages prompt formatting, tags, and visual consistency.

### 4.4 Collaboration Flow
- The Hub presents GPT links, version, and campaign options.  
- Each GPT references shared API actions for data sync.  
- OPS ensures file integrity; DM ensures continuity; Creator and Atelier expand the world.

---

## 5. Technical Infrastructure Summary

### 5.1 Cloudflare Components
- **Worker URL:** `https://worldforge-api.hydremia.workers.dev`
- **KV Namespaces:**
  - `WF_KV_RUNTIME` — active capsule data
  - `WF_KV_SESSIONS` — session logs (Markdown)
  - `WF_KV_STAGING` — drafts
  - `WF_KV_MEDIA` — visuals

### 5.2 Worker Variables and Secrets
| Name | Type | Example |
|------|------|----------|
| `REPO_OWNER` | Text | `hydremia` |
| `REPO_NAME` | Text | `worldforge-data` |
| `REPO_BRANCH` | Text | `main` |
| `CANON_PREFIX` | Text | `v3.0.0` |
| `API_KEY` | Secret | `WF_KEY_a9b8c7d6e5f4` |

### 5.3 API Specification
The OpenAPI 3.1 spec defines nine main endpoints (`/health`, `/version`, `/capsule/create`, etc.).  
It is published at:
worldforge-data/api/worldforge_openapi_v3.yaml


### 5.4 Legal and Compliance
- **Privacy Policy:** https://hydremia.github.io/worldforge-legal/privacy  
- **Terms of Use:** https://hydremia.github.io/worldforge-legal/terms  
Required by OpenAI for public GPTs using external actions.

---

## 6. Collaboration and Multi-GPT Flow

### 6.1 Conversation Routing
- The Hub manages navigation between GPTs.  
- Each GPT includes `/hub` or “Return to Hub” links to prevent sidebar clutter.  
- Campaigns can pin one active DM thread and one creative thread per GPT.

### 6.2 Session Handoff
When switching GPTs:
1. DM exports session capsule to KV.  
2. Creator or OPS imports the capsule by token.  
3. Context continuity is preserved via shared API reference, not chat memory.

### 6.3 File Management and Guardrails
OPS performs character-count audits.  
- **Warning:** shrink >5%  
- **Block:** shrink >10%  
Each GPT verifies successful loads and QGate passes before overwriting.

---

## 7. Agent and Automation Strategy

### 7.1 Future “Agents”
Later phases will introduce lightweight GPT agents to handle:
- Promotion and audit automation (OPS side)  
- Repo monitoring and documentation commits (Archivist Agent)  
- Visual ingestion sync between Atelier and KV  

### 7.2 Agent Workflow Example
1. Creator adds draft → `/staging/ingest`  
2. Archivist Agent detects update → runs audit → pushes to GitHub `/canon/`  
3. Hub displays new version → Atelier updates visual link.

### 7.3 Agent vs Agent Mode
- *Agent Mode* (in ChatGPT) enhances single-task reasoning — ideal for summary generation and audit refinement.  
- *Agents* (as components) automate multi-step or scheduled tasks through the API.

---

## 8. Future Expansion Notes

### 8.1 Scaling Beyond 5 GPTs
- Add **Worldforge Atlas** (map manager) and **Worldforge Ledger** (economy/trade simulator) as optional extensions.  
- Each will plug into the same API schema and GitHub structure.

### 8.2 Public Collaboration
- Other users can fork the GPTs or contribute new modules.  
- The Bridge doc ensures anyone can rebuild the same architecture with new tokens.

### 8.3 Migration and Import
An Agent will eventually convert legacy World Anvil exports and previous campaign logs into structured staging JSON for ingestion.

### 8.4 Version Roadmap
- **v3.1:** OPS automation & version bump logic  
- **v3.2:** GitHub commit hooks  
- **v3.3:** Visual asset caching & public canon viewer  
- **v3.5:** Multi-user campaign session handoff  
- **v4.0:** Full persistent shared world with live API sync

---

## 9. Quick Reference Recap

1. **Five-GPT system:** Hub, DM, OPS, Creator, Atelier.  
2. **Cloudflare Worker:** Central API backbone.  
3. **GitHub (`worldforge-data`):** Canon and documentation.  
4. **Bridge Handoff:** Lightweight loader header.  
5. **Capsules:** Isolated runtime per campaign.  
6. **OPS QGate:** File audits and changelog validation.  
7. **Atelier:** Visual canon and prompt tagging.  
8. **Creator:** Drafts and staging exports.  
9. **Agent Mode:** For synthesis and audit optimization.  
10. **Goal:** Persistent, collaborative, Forgotten Realms living world under D&D 5.5e.

---

_End of Worldforge v3 Master Summary_
