# Worldforge Master Control — v3.2 Tier‑2 Refinement Cycle

_Last updated: 2025-11-04_
_Parent Architecture: Worldforge v3_
_Scope: Stabilization, schema validation, automation, dashboard integration_

## 1️⃣ Phase Overview — From v3.1 to v3.5
| Tier | Focus | Core Themes | Milestone Tags |
|------|--------|--------------|----------------|
| **Tier-1 (v3.0 – v3.1)** | Foundation | Five GPTs online (Hub · DM · OPS · Creator · Atelier); canon baseline v3.0.0 established | ✅ Complete |
| **Tier-2 (v3.2 – v3.3)** | **Refinement Cycle** | OPS QGate passes · Worker schema validation · Hub dashboard · Archivist Agent automation · descriptor integrity tests | 🚀 **Current Target** |
| **Tier-3 (v3.4 – v3.5)** | Expansion | New GPTs (**Archivist (Lore Curator) pulled-forward**, Atlas, Ledger, Muse) · cross-GPT overlays · multi-user handoff · capsule federation | 🕓 Next |
| **Tier-4 (v3.6 – v3.8)** | Federation & Scale | Shared campaign spaces · public canon viewer · external API exposure · hub federation | Planned |

## 2️⃣ Objectives for Tier-2 Refinement
**Strategic Goal:** Harden the v3 ecosystem for long-term stability by completing audits, aligning schemas, and preparing automation infrastructure.

| Area | Deliverables | Owner / Thread |
|------|---------------|----------------|
| **OPS QGate Passes** | Validate DM / Hub / Creator / Atelier; publish OPS Audit Reports v3.1 → OPS/Reports | OPS Thread `OPS QGate Execution v3.1` |
| **Creator Worker Schema** | Define visual link schema · validate KV payloads · update Bridge v3.0.1 | Creator Thread `Creator Worker Schema v3.0.1` |
| **Atelier Worker Schema** | Extend prompt grammar validation · add descriptor lineage schema | Atelier Thread `Atelier Worker Schema v3.0.1` |
| **Hub Dashboard** | Live OPS promotion feed + capsule activity panel | Hub Thread `Hub Dashboard v3.2` |
| **Archivist Agent Automation** | GitHub commit hooks · auto-handoff · changelog writer · scheduled audits | Control Thread `Archivist Agent Setup v3.2` |

## 3️⃣ Cross-GPT Dependency Matrix
| Source | Consumes / Feeds To | Dependency Type | Validation Point |
|---------|--------------------|-----------------|------------------|
| **Creator** | Atelier · OPS | Descriptor → Visual → Promotion | `creator_worker_schema.json` |
| **Atelier** | OPS · Hub | Visual lineage → audit → dashboard | `visual_audit_manifest.json` |
| **DM** | OPS · Hub | RNG ledger → integrity badges | `roll_ledger.json` |
| **OPS** | Hub | Promotion logs → dashboard feed | `ops_promotion_feed.json` |
| **Hub** | All | Routes and summarizes status | `hub_dashboard_manifest.json` |

## 4️⃣ Risk & Mitigation Register
| # | Risk | Type | Mitigation / Action |
|---|------|------|---------------------|
| R-01 | Schema drift between Creator and Atelier workers | Technical | Lock schema in `/schemas` + OPS checksum check before promotion |
| R-02 | OPS QGate latency blocking Creator/Atelier deploy | Process | Introduce Pre-QGate local check within Creator and Atelier |
| R-03 | Archivist Agent commit hooks looping on PR actions | Automation | Dry-run mode for first two weeks + OPS approval flag |
| R-04 | Dashboard feed parsing invalid JSON from OPS | Integration | Use schema-validated feed with null-safe fallback |
| R-05 | Overlapping visual IDs in Atelier cache | Data | OPS assigns UUID on promotion + hash collision check |

## 5️⃣ Milestone & Owner Plan (4-Week Cycle)
| Week | Focus | Output | Owner Thread |
|------|--------|---------|--------------|
| **Week 1** | OPS QGate DM · Hub · Creator · Atelier | Audit Reports v3.1 | OPS GPT |
| **Week 2** | Creator / Atelier Worker Schema v3.0.1 updates | Schema JSON + Worker test pass | Creator · Atelier |
| **Week 3** | Hub Dashboard integration + OPS feed sync | Live dashboard demo · OPS feed visible | Hub |
| **Week 4** | Archivist Agent automation deploy | CI hooks live · auto-handoff reports committing | Master Control / OPS |

# 📜 Archivist GPT (Lore Curator) — **Pulled-Forward Expansion**

**Role:** World canon librarian & semantic index; source of truth for lore/characters/factions/locations/events with versioning, provenance, and cross-GPT graph.

## A) Import-First Rollout (WorldAnvil → Worldforge Canon Upgrade)
- **Version Target:** `Archivist GPT v3.3.0 (Import MVP)`
- **Prime Directive:** Ingest your WorldAnvil export; normalize, enrich, deduplicate, conflict-review; publish to SSOT with lineage.

### Import ETL (through Archivist)
1. **Ingest:** Unpack WA export; inventory; hash; type-detect.
2. **Transform/Normalize:** Map WA → Archivist schema; clean Markdown; normalize names/dates/places.
3. **Enrich:** Entity linking; relationship graph; derived metadata; DR timeline alignment.
4. **Validate:** JSON Schema per type; uniqueness; canon rules; emit `archivist_validation_report.json`.
5. **Diff & Review:** Generate `archivist_diffs/*.json`; classify new/merge/conflict/deprecated.
6. **QGate & Promote:** Human-in-the-loop merge; emit Promotion Pack; OPS signs → `/canon/*`.
7. **Index & Graph:** Update `lore_index.json`; rebuild semantic graph cache.

### Entry Schema (v1, common envelope)
{
  "id": "uuid",
  "type": "character|location|faction|item|event|article",
  "slug": "kebab-case-unique",
  "name": "Primary Name",
  "aliases": ["Alt Name"],
  "summary": "1–2 sentence canonical blurb.",
  "body_md": "Markdown content",
  "tags": ["canon", "faerun"],
  "relations": {"characters": [], "factions": [], "locations": [], "items": [], "events": []},
  "lineage": {
    "sources": [{"origin": "WorldAnvil", "path": "…", "hash": "…", "first_seen": "2025-11-04"}],
    "edits": [{"by": "Archivist", "ts": "2025-11-04", "reason": "Import normalize v1"}],
    "version": "1.0.0"
  },
  "status": "canon|noncanon|alt-A|staging",
  "visibility": "public|private|capsule-only",
  "last_updated": "ISO-8601"
}

## B) Conflict & Merge Rules
- Same-name overlap → merge proposal (preserve first_seen, union aliases, prefer newer body_md with diff notes).
- Contradictory facts → conflict_notes block; manual resolution in Archivist UI.
- Duplicates (near-match) → alias + redirect.
- Canon vs Noncanon → keep both; mark status and link canonical ancestor.

## C) Milestones (Fast Track)
| Week | Deliverable |
|------|-------------|
| **W0–W1** | Finalize schemas; import adapters; dry-run on 5–10 WA entries → first `validation_report.json`. |
| **W2** | Full WA pass → diffs + merge candidates; human review loop in Archivist. |
| **W3** | Promotion Pack #1 (Characters + Locations) → `/canon/*`; update `lore_index.json`. |
| **W4** | Promotion Pack #2 (Factions + Events + Items) → graph cache live; Hub/Creator consumption. |

## D) Acceptance Criteria — Archivist Import MVP
- WA export ingested with zero dangling UUIDs.
- ≥95% of entries pass schema and relation checks on first full run.
- Promotion Pack #1 and #2 published; rollback packs generated.
- `lore_index.json` + semantic graph available to Hub/Creator/DM.

## 6️⃣ Checkpoint Entries to Append
#11 — 2025-11-04 | Master Control v3.2 Tier-2 Refinement Initialized | Status: ✅
#12 — 2025-11-05 | OPS QGate Execution for DM / Hub / Creator / Atelier Begun | Status: ⏳
#13 — 2025-11-07 | Archivist v3.3.0 Import MVP — Schemas finalized & WA mapping draft | Status: ⏳
#14 — 2025-11-14 | Hub Dashboard v3.2 Live with OPS Feed | Status: ⏳
#15 — 2025-11-21 | Archivist Promotion Pack #1 published | Status: ⏳

## 7️⃣ Acceptance Criteria (Tier-2 Core)
- All four content GPTs pass OPS QGate audit under v3.1 ruleset.
- Creator & Atelier workers upgraded to v3.0.1 with schema validation.
- Hub Dashboard displays promotion feed and capsule activity without error.
- Archivist Agent auto-commits handoffs and audit reports to GitHub CI.
- Control Log entries #11–#15 registered in OPS/Reports.

## 8️⃣ Forward Outlook — Tier-3+ Expansion
| Planned GPT Additions | Purpose | Tentative Phase |
|-----------------------|----------|-----------------|
| Archivist GPT (Lore Curator) | Canon federation + import & graph backbone | v3.3–v3.5 (pulled-forward) |
| Atlas GPT | Map & geospatial coordination engine | v3.5 |
| Ledger GPT | Economic & trade simulation engine | v3.5 |
| Muse / Voicewright GPT | Narrative tone and voice profile curator | v3.4 |
| Cartographer Sub-Agent | Region overlay generator for Atlas | v3.6 |
