# Worldforge — Tier‑1 Build Wrap & Master Control Roadmap (v3.1)
_Last updated: 2025‑11‑03_

---

## 1) Master Recap of Tier‑1 Build

### 1a. What We Built
- **GPTs:** Hub (v3.1.0 knowledge / v3.1.1 worker), DM (v3.0.7), OPS (v3.0.0), Creator (v3.0.0), Atelier (v3.0.0)
- **Backbone:** Cloudflare Worker API + KV (capsules, sessions, staging, visuals, promotion logs)
- **Repositories:** `worldforge-data` (SSOT: docs, canon, staging, handoffs, CI)
- **Canon Baseline:** v3.0.0 (all GPTs version from this baseline; runtime/worker may advance independently)

### 1b. How We Worked (Process)
1. **Dev Thread → Handoff → Build Thread** for each GPT
2. **Unified Handoff Docs** (merged design + system context + CI/guardrails)
3. **Tiered File Plans** (≤20 files; ≤8k instruction core; Tier‑1/2 context)
4. **OPS QGate** (ShrinkGuard, Bridge parity, schema checks, RNG audits, promotion policy)
5. **Worker SOP** (`wrangler dev` smoke tests; schema‑validated endpoints)
6. **CI/Guardrails** (size_guard manifests; PR templates; Actions; audit JSON kept in `OPS/Reports/`)
7. **Control Thread Checkpoints** to register every build activation & audit pass

### 1c. What We Learned (Key Lessons)
- **Separate Knowledge vs Runtime:** Only knowledge files load into GPT; runtime/worker/CI live in repo
- **Guardrails First:** Run size audits early; treat >5% shrink as “explain/approve,” not auto‑fail
- **Baseline Discipline:** OPS enforces canon baseline; content GPTs may iterate faster
- **QGate Early & Often:** Add local pre‑QGate in Creator/Atelier before OPS to reduce churn
- **Diegetic UX:** Hub routes with narrative‑friendly language + Safe Mode fallback
- **Cross‑GPT Contracts:** Define descriptor & capsule schemas before linking (Creator ⇄ Atelier ⇄ OPS)
- **Logs as Products:** Loader/QGate/Promotion reports are part of the artifact, not afterthoughts

---

## 2) Current Status & Intended Functionality (Tier‑1)

| GPT | Version | Role | Intended Functionality (at this stage) | OPS/QGate Status |
|-----|---------|------|-----------------------------------------|------------------|
| **Hub** | v3.1.0 (kn) / v3.1.1 (worker) | Router & dashboard | User onboarding; capsule selection; /version + /health; Loader Report surfacing OPS results | CI + size guard live; OPS audit path wired |
| **DM** | v3.0.7 | Narrative runtime | Scenes, adjudication, RNG ledger, session export; tone profiles & improv; onboarding flow | Ready for OPS RNG & structure audit |
| **OPS** | v3.0.0 | Auditor & promoter | ShrinkGuard; Bridge parity; promotion schema; rollback policy; report naming standards | Baseline operational |
| **Creator** | v3.0.0 | Creative forge | Modes: Narrative/Character/Faction/Campaign/Sandbox; pre‑QGate; `/staging/*`; `/visuals/link` (deferred) | Pre‑QGate enabled; Worker v3.0.1 planned |
| **Atelier** | v3.0.0 | Visual canon curator | Mode trees; prompt grammar; batch ops; lineage metadata; Visual Compendium | Pre‑QGate + OPS visual audit ready; Worker v3.0.1 planned |

**Intended Functional Slice (Tier‑1):**
- Play immediately via **DM**, route via **Hub**, create & stage via **Creator**, curate visuals via **Atelier**, validate & promote via **OPS**
- Persist **per‑capsule**; no cross‑campaign bleed; all promotions logged

---

## 3) Master Control Roadmap (v3.1 → v3.5)

### 3.1 Phase Map
- **v3.1 (Now → Short Term):**
  - Finish OPS QGate passes for DM/Hub/Creator/Atelier
  - Add Worker schema validation for Creator & Atelier (v3.0.1)
  - Implement `tools/check_banned_terms.mjs` to green‑light CI
  - Hub Live Dashboard: surface OPS promotion feed + capsule recent activity
- **v3.2:**
  - GitHub commit hooks + Promotion bot (Archivist Agent) to auto‑file reports
  - Public Canon Viewer (read‑only) for visuals and lore indexes
  - Cross‑GPT descriptor checksum enforcement (Creator → Atelier → OPS)
- **v3.3:**
  - Visual asset caching + signed URLs; bulk promotion packs
  - Capsule replay/export tooling (session → markdown + rolls ledger)
  - RNG audit visualizations in OPS
- **v3.4:**
  - Multi‑user campaign handoff (capsule token federation; per‑user buckets)
  - Hub profile settings (voice presets; default modes)
- **v3.5:**
  - **New GPTs Online:** Atlas (maps/coords), Ledger (economy/trade)
  - Cross‑GPT map overlays; Bastion turn engine hooks

### 3.2 Cross‑GPT Feature Roadmap
- **Promotion Pipeline v2:** Draft → Stage → QGate → Promote → Publish → Announce
- **Capsule Insights:** Hub shows last 5 events, active tone, and pending promotions
- **Descriptor Canonization:** Creator defines; Atelier validates; OPS signs
- **RNG Integrity Loop:** DM ledger → OPS audit → Hub UI badges
- **Visual Compendium:** Search by character, motif, palette; lineage graph

### 3.3 Operational Roadmap
- **Automation:** Archivist Agent (handoff extraction, auto‑changelog, scheduled audits)
- **Security:** API keys & rate limits on Workers; gated promotion endpoints
- **Observability:** Standardize Loader/QGate/Promotion JSON; publish dashboards

---

## 4) Handoff to Next Master Control Thread

**Handoff Payload (summary):**
- **Active GPTs:** Hub v3.1.0/3.1.1; DM v3.0.7; OPS v3.0.0; Creator v3.0.0; Atelier v3.0.0
- **Canon Baseline:** v3.0.0
- **Outstanding Actions:**
  1) Run OPS QGate on DM/Hub/Creator/Atelier
  2) Implement Worker schema (Creator/Atelier v3.0.1)
  3) Stand up Archivist Agent (commit hooks; auto reports)
  4) Ship Hub Dashboard (promotion feed)
- **Next Threads to Open:**
  - OPS QGate Execution (per GPT)
  - Creator Worker Schema v3.0.1
  - Atelier Worker Schema v3.0.1
  - Master Control v3.2 Planning

**Control Log Entries to Record:**
```
#7 — 2025‑11‑02 | Hub GPT Build Initialized under v3 Architecture | Status: ✅
#8 — 2025‑11‑03 | Creator GPT Build Initialized under v3 Architecture | Status: ✅
#9 — 2025‑11‑03 | Atelier GPT Build Initialized under v3 Architecture | Status: ✅
#10 — 2025‑11‑03 | Tier‑1 Build Complete; Handoff to Master Control v3.2 Planning | Status: ✅
```

---

## 5) Appendix — Prompts & Checklists

### 5.1 Master Control “Next Thread” Starter Prompt
```
You are initializing **Worldforge Master Control — v3.2 Planning**.
Load prior tier‑1 wrap doc and confirm:
- Active GPTs & versions
- Outstanding OPS QGate tasks
- Worker schema upgrades pending
- Roadmap assumptions (v3.1 → v3.5)
Produce: (1) Updated Phase Map, (2) Cross‑GPT dependencies, (3) Risk & Mitigation list,
(4) Weekly milestone plan with owners, (5) Checkpoint entries to append.
```

### 5.2 GPT‑Specific Roadmap Prompt (drop into each Build/Setup thread)
```
You are preparing the **<GPT> v3.x Roadmap**.
Using the Build Log + Handoff doc, output:
1) Current capabilities & version
2) Near‑term upgrades (2–4 weeks)
3) Cross‑GPT integrations to validate
4) CI/guardrail gaps to close
5) Risks & mitigations
6) Acceptance criteria & test plan
Return as a single markdown doc with checkboxes for execution.
```

### 5.3 CI / Guardrail Quicklist (reuse in PRs)
- `node tools/size_guard.mjs --all` → attach JSON
- `--write-manifest` after intentional deltas
- PR template: rationale for >5% shrink; link to OPS/Reports JSON
- Actions green; schema checks PASS
- If rollback: revert to last PASS; archive under `/logs/failed_promotions/`

