# Worldforge Handoff — Creator GPT — v3.0.0  
_Last updated: 2025-11-03_

---

## 1. Source Threads

| Origin | Title | Date Range | Summary |
|--------|--------|-------------|----------|
| **System Context** | *Worldforge Master Control — Ecosystem Planning (v3 Core)* | 2025-10-30 → 2025-11-03 | Authorizes Creator GPT build and defines its role within v3 architecture. |
| **Design Context** | *Worldforge Creator — Design and Tone Definition* | 2025-10-30 | Establishes Creator’s creative functions, tone, and integration with OPS, DM, and Atelier GPTs. |
| **Operational Context** | *Worldforge Hub v3.1 Hand-Back / Lessons Learned* | 2025-11-01 | Adds guardrail, CI, and Worker SOP standards for future GPT builds. |

---

## 2. Context and Purpose
The **Worldforge Creator GPT** is the *creative forge* of the Worldforge v3 ecosystem. It empowers users to develop lore, characters, factions, and world elements through structured creative dialogues.  
It bridges the gap between **narrative immersion** and **editorial precision**, ensuring all creative outputs remain canon-compatible and audit-ready for OPS promotion.

This unified handoff merges the Creator design handoff, Hub lessons, and OPS integration standards into a single operational blueprint for the Creator v3 Build Thread.

---

## 3. Combined Checkpoints

### 3.1 Role and Tone  
1. **#CRE-C1:** Acts as the *Collaborative Conductor* — blending creative guidance with editorial structure.  
2. **#CRE-C2:** Maintains a hybrid voice:  
   - *Creative/Narrative Mode* → immersive and descriptive.  
   - *Archivist/Editorial Mode* → concise, structured, OPS-aligned.  
3. **#CRE-C3:** Introduces selectable tone profiles (Narrative, Archivist, or Hybrid).  
4. **#CRE-C4:** All outputs maintain world-consistent diction and formatting suitable for canon ingestion.  
5. **#CRE-C5:** Adds OPS-verifiable `Tone_Audit.json` schema for internal review.

### 3.2 Functional Architecture  
6. **#CRE-C6:** Five core creative modes available at launch:  
   - Narrative Exploration  
   - Character Creation  
   - Faction & Organization Builder  
   - Campaign Brainstorming  
   - World-Building Sandbox  
7. **#CRE-C7:** Supports *Pre-Canned Prompts* for quick-start generation of locations, factions, and characters.  
8. **#CRE-C8:** Integrates Homebrew Re-Flavouring Tool for subclass and feature adaptation.  
9. **#CRE-C9:** Implements OPS export pipeline for drafts (`/staging/ingest`, `/staging/review`, `/staging/promote`).  
10. **#CRE-C10:** Adds `/visuals/link` endpoint (deferred activation) for future Atelier integration.  
11. **#CRE-C11:** Includes schema validation hooks in Worker (v3.0.1 planned).  
12. **#CRE-C12:** Provides Guided Onboarding introducing modes and promoting audit-aware creation.

### 3.3 Ecosystem and Cross-GPT Integration  
13. **#CRE-C13:** Canon version: v3.0.0 baseline.  
14. **#CRE-C14:** OPS version: v3.0.0 active; DM version: v3.0.7 (validated).  
15. **#CRE-C15:** Creator cannot directly promote canon; OPS approval required.  
16. **#CRE-C16:** OPS QGate integration mandatory — Creator performs local pre-QGate before OPS submission.  
17. **#CRE-C17:** Cross-GPT readiness validation via Hub and OPS Loader Reports.  
18. **#CRE-C18:** Logs build initialization as Checkpoint #8 in Ecosystem Control thread.

---

## 4. Constraints
- Must operate under **Worldforge v3.0.0** canonical framework.  
- All file names and Bridge headers must include canonical prefix (e.g., `v3.0.0_Creator_*`).  
- File-count ≤ 20; instruction field ≤ 8 KB.  
- OPS QGate verification required prior to any promotion.  
- Creator cannot modify existing canon; only stage or propose updates.  
- Must maintain API and KV consistency with OPS and Hub endpoints.  
- Knowledge files only (runtime and Worker files remain external in repo).  

---

## 5. Tiered File Plan

| Tier | File | Purpose | Target Size |
|------|-------|----------|--------------|
| **Instruction Field** | `v3.0.0_Creator_RuntimeCore_Instructions.txt` | Core engine and creative mode handling | ≤ 7 KB |
| **Tier 1** | `v3.0.0_Creator_Modes_Index.txt` | Lists all creative functions and routing logic | ≤ 4 KB |
| **Tier 1** | `v3.0.0_Creator_Onboarding.txt` | Guided onboarding flow for new users | ≤ 4 KB |
| **Tier 1** | `v3.0.0_Creator_Tone_Profiles.txt` | Voice calibration bands + OPS-auditable tone schema | ≤ 2 KB |
| **Tier 1** | `v3.0.0_Creator_QGate_Checklist.txt` | Local pre-audit tests (char count, schema, diff) | ≤ 2 KB |
| **(Optional Future)** | `v3.0.1_Creator_Worker_Schema.ts` | Adds Worker-side schema validation | — |
| **(Optional Future)** | `v3.0.1_Creator_Visual_Prompt_Templates.txt` | Integrates Atelier prompt formatting | — |

---

## 6. Guardrails and CI Standards

- **Size Guard:** Run `node tools/size_guard.mjs --all` pre-commit and after intentional changes.  
- Treat >5% shrink as *review required*, not automatic fail; explain rationale in PR.  
- Maintain JSON size reports in `OPS/Reports/` and link in PR description.  
- Keep GPT Knowledge files limited to those listed above — no runtime or Worker files.  
- Use feature branches (`creator/v3.x-dev`) for experimental updates.  
- All merges validated through GitHub Actions and OPS QGate.  
- Include `tools/check_banned_terms.mjs` for CI compliance (v3.1+ upgrade path).  

---

## 7. OPS QGate Readiness Criteria

| Category | Requirement |
|-----------|--------------|
| **Structural Integrity** | All files within char limits and include Bridge + Canon headers. |
| **Schema Compliance** | Local QGate confirms correct field names and output format. |
| **Cross-GPT Sync** | OPS, DM, and Hub report versions match Creator baseline. |
| **Promotion Pathway** | Creator outputs marked `draft`, `staged`, or `ready` for OPS audit. |
| **Visual Link** | `/visuals/link` reference valid; deferred until Atelier launch. |
| **Audit Hooks** | `Tone_Audit.json` produced and parsed correctly. |

---

## 8. Integration Map

| System | Endpoint | Function |
|---------|-----------|-----------|
| **Cloudflare Worker** | `/staging/ingest`, `/staging/review`, `/staging/promote` | OPS export and staging operations |
| **Atelier Worker (Deferred)** | `/visuals/link` | Visual prompt linking and metadata sync |
| **OPS GPT** | `/audit/qgate`, `/promote` | Final QGate validation and canon promotion |
| **Hub GPT** | `/version`, `/health`, `/navigate` | Cross-GPT menu and routing validation |
| **Ecosystem Control** | `/checkpoint/register` | Register build and checkpoint #8 |

---

## 9. DevOps Checklist
1. Load 5 Knowledge Files (confirm version headers = v3.0.0).  
2. Verify Worker endpoint contracts present and responding.  
3. Run local pre-QGate: structure, schema, diff%.  
4. Execute size audit (`node tools/size_guard.mjs --all`).  
5. Update manifest (`--write-manifest`) post-confirmation.  
6. Commit and link size report JSON in PR.  
7. OPS QGate simulation → submit Loader Report for validation.  
8. Register Creator v3.0.0 build as Checkpoint #8 in Ecosystem Control.

---

## 10. Acceptance Criteria
- Creator GPT initializes successfully and generates Loader Report.  
- All five Knowledge Files load without exceeding caps.  
- Local QGate returns PASS.  
- OPS QGate returns PASS on structure and tone audit.  
- Worker endpoint tests (4 of 4) complete without error.  
- Cross-GPT version sync confirmed (OPS, Hub, DM).  
- Build registered and logged in Ecosystem Control as Checkpoint #8.

---

## 11. Next Steps
1. Initialize **Worldforge Creator — v3 Build Thread** with this document.  
2. Generate 5 Knowledge Files (see Section 5).  
3. Configure local Worker (`wrangler dev`) and test 4 endpoints.  
4. Run CI guardrails and manifest checks.  
5. Conduct OPS QGate audit and post Loader Report.  
6. Register build activation in Control thread.  
7. Prepare `Creator_Worker_Schema.ts` for v3.0.1 upgrade.  

---

## 12. Bridge Note
This document serves as the **official unified handoff** between the *Worldforge v3 Ecosystem* and the *Worldforge Creator GPT v3.0.0 Build Thread*.  
When imported, record the event as:

```
#8 — 2025-11-03 | Source: Master Control + Creator Design Threads | Action: Creator GPT Build Initialized under v3 Architecture | Status: ✅
```

