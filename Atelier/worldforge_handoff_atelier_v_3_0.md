# Worldforge Handoff — Atelier GPT — v3.0.0  
_Last updated: 2025-11-03_

---

## 1. Source Threads

| Origin | Title | Date Range | Summary |
|--------|--------|-------------|----------|
| **System Context** | *Worldforge Master Control — Ecosystem Planning (v3 Core)* | 2025-10-30 → 2025-11-03 | Authorizes Atelier GPT build and establishes cross-GPT visual canon integration. |
| **Design Context** | *Worldforge Atelier — Design and Tone Session* | 2025-10-30 | Defines Atelier’s role as visual canon curator and prompt generator within the Worldforge ecosystem. |
| **Operational Context** | *Hub v3.1 Hand-Back / Lessons Learned* | 2025-11-01 | Adds CI, guardrail, and Worker schema SOP best practices for visual processing modules. |

---

## 2. Context and Purpose
The **Worldforge Atelier GPT** serves as the *visual canon curator and art director* of the Worldforge v3 ecosystem.  
It interprets creative intent, lore descriptors, and world data from Creator, DM, and OPS sources to generate optimized visual prompts and asset metadata.  
Atelier establishes the **Visual Compendium**, ensuring all imagery aligns with tone, style, and canon lineage while maintaining traceable metadata for OPS audit and promotion.

This unified handoff merges the Atelier design brief, Hub/OPS CI guardrails, and Creator schema standards into a single operational blueprint for the **Atelier v3 Build Thread**.

---

## 3. Combined Checkpoints

### 3.1 Role and Tone
1. **#ATL-C1:** Acts as the *Curatorial Oracle* — analytical, calm, and stylistically interpretive.  
2. **#ATL-C2:** Translates textual world data into visual grammar with OPS-verifiable metadata.  
3. **#ATL-C3:** Supports conversational branches — Create, Refine, Define Style, and Curate.  
4. **#ATL-C4:** All visual assets inherit descriptor lineage (source capsule, character, motif, timestamp).  
5. **#ATL-C5:** Maintains OPS-auditable tone — consistent, restrained, canon-faithful, and transparent.  

### 3.2 Functional Architecture
6. **#ATL-C6:** Implements **Visual Capsule Storage** with KV namespaces:  
   - `VISUAL_CAPSULES` — palette/motif definitions.  
   - `VISUAL_LIBRARY` — archives descriptors and canon visuals.  
   - `OPS_SYNC` — approved assets and audit logs.  
7. **#ATL-C7:** Integrates cross-GPT descriptor schema for Creator/DM → Atelier handoffs.  
8. **#ATL-C8:** Introduces **Prompt Assembly Grammar** for layered canon synthesis.  
9. **#ATL-C9:** Enables **Batch Operations** with partial success reporting.  
10. **#ATL-C10:** All generated visuals saved to the Visual Compendium with capsule lineage.

### 3.3 Ecosystem and Integration
11. **#ATL-C11:** Canon baseline: v3.0.0.  
12. **#ATL-C12:** OPS integration active for audit and promotion (`/audit/visuals`, `/promote/assets`).  
13. **#ATL-C13:** Worker schema validation planned for v3.0.1 (ensures valid JSON payloads pre-render).  
14. **#ATL-C14:** Logs build initialization as Checkpoint #9 in Ecosystem Control thread.  

---

## 4. Constraints
- Operates under **Worldforge v3.0.0** canon baseline.  
- File-count ≤ 20; instruction field ≤ 8 KB.  
- Worker endpoints must pass OPS audit preflight before deployment.  
- Only Knowledge files loaded into GPT; runtime and Worker scripts remain external.  
- OPS QGate validation mandatory for every visual promotion.  
- Image generation subject to metadata integrity checks and lineage tracing.

---

## 5. Tiered File Plan

| Tier | File | Purpose | Target Size |
|------|-------|----------|--------------|
| **Instruction Field** | `v3.0.0_Atelier_RuntimeCore_Instructions.txt` | Core architecture + conversational routing | ≤ 7 KB |
| **Tier 1** | `v3.0.0_Atelier_Mode_Trees.txt` | Guided dialogue trees (Create, Refine, Define Style, Curate) | ≤ 5 KB |
| **Tier 1** | `v3.0.0_Atelier_Prompt_Grammar.txt` | Canon prompt grammar and weighting heuristics | ≤ 3 KB |
| **Tier 1** | `v3.0.0_Atelier_Tone_Profiles.txt` | Voice calibration + OPS tone audit schema | ≤ 2 KB |
| **Tier 1** | `v3.0.0_Atelier_QGate_Checklist.txt` | Preflight audit checklist (schema + lineage validation) | ≤ 2 KB |
| **(Optional Future)** | `v3.0.1_Atelier_Worker_Schema.ts` | Worker-side schema validation for render payloads | — |
| **(Optional Future)** | `v3.0.1_Atelier_Visual_Templates.txt` | Style templates for quick render references | — |

---

## 6. Guardrails and CI Standards
- Run `node tools/size_guard.mjs --all` pre-commit; document intentional size changes in PR notes.  
- Maintain JSON audit reports in `OPS/Reports/`; link to promotion PR.  
- Keep only knowledge files in GPT build list.  
- Test Worker endpoints locally via `npx wrangler dev`.  
- Smoke-test 4 endpoints: `/capsule`, `/batch`, `/render`, `/audit/qgate`.  
- Record endpoint test logs in `Atelier_Build_Log_v3.0.0.md`.  
- Use feature branches (`atelier/v3.x-dev`) for build iterations.  
- Confirm all CI passes (Action workflow, size guard, schema validation).  

---

## 7. OPS QGate Readiness Criteria

| Category | Requirement |
|-----------|--------------|
| **Schema Validation** | JSON payloads valid and compliant with OPS visual schema. |
| **Lineage Integrity** | Each image includes capsule ID, descriptor, timestamp, artist reference. |
| **Cross-GPT Sync** | Creator → Atelier → OPS handoff verified through descriptor checksum. |
| **Audit Hooks** | `Visual_Audit.json` produced and parsed by OPS. |
| **Batch Handling** | Partial failures logged, not discarded. |
| **Metadata Safety** | No missing descriptor or inferred data without user confirmation. |

---

## 8. Integration Map

| System | Endpoint | Function |
|---------|-----------|-----------|
| **Cloudflare Worker** | `/capsule`, `/batch`, `/render`, `/audit/qgate` | Runtime and audit testing |
| **OPS GPT** | `/audit/visuals`, `/promote/assets` | Validate and promote visual metadata |
| **Creator GPT** | `/visuals/link` | Pass creative descriptors to Atelier |
| **Hub GPT** | `/version`, `/health`, `/navigate` | Display Atelier status and availability |
| **Ecosystem Control** | `/checkpoint/register` | Log Checkpoint #9 |

---

## 9. DevOps Checklist
1. Load all 5 Knowledge Files and verify Bridge + Canon headers = v3.0.0.  
2. Run local Worker (`wrangler dev`) → test `/capsule`, `/batch`, `/render`, `/audit/qgate`.  
3. Run `node tools/size_guard.mjs --all` and `--write-manifest`.  
4. Commit manifest and attach size audit JSON.  
5. Generate sample `Visual_Audit.json` and submit to OPS for QGate validation.  
6. Validate cross-GPT descriptor schema with Creator outputs.  
7. Register build as Checkpoint #9 in Ecosystem Control.  

---

## 10. Acceptance Criteria
- Atelier GPT initializes successfully with validated tone and prompt grammar.  
- All Worker endpoints return PASS on local smoke test.  
- OPS QGate returns PASS for schema, lineage, and tone audits.  
- Cross-GPT visual linkage (Creator → Atelier → OPS) functions without loss.  
- Loader Report generated and archived in OPS.  
- Build recorded as Checkpoint #9 in Ecosystem Control thread.  

---

## 11. Next Steps
1. Initialize **Worldforge Atelier — v3 Build Thread** with this document.  
2. Generate and validate all five core Knowledge Files.  
3. Configure local Worker (`wrangler dev`) and run endpoint smoke tests.  
4. Run CI guardrails and manifest checks.  
5. Execute OPS QGate audit for visual schema validation.  
6. Register activation in Control thread (Checkpoint #9).  
7. Prepare `Atelier_Worker_Schema.ts` and `Visual_Templates.txt` for v3.0.1 expansion.  

---

## 12. Bridge Note
This document serves as the **official unified handoff** between the *Worldforge v3 Ecosystem* and the *Worldforge Atelier GPT v3.0.0 Build Thread.*  
When imported, record the event as:

```
#9 — 2025-11-03 | Source: Master Control + Atelier Design Threads | Action: Atelier GPT Build Initialized under v3 Architecture | Status: ✅
```

