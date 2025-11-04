# Archivist Import Checklist (WorldAnvil → Worldforge)

## Pre-Import
- [ ] Place WA export ZIP in /imports/
- [ ] Verify export contains articles, timelines, images
- [ ] Update `field_map_wa_to_archivist.json` for any custom fields

## Dry-Run (Subset 5–10 entries)
- [ ] Ingest + inventory report
- [ ] Schema validate (common + type extensions)
- [ ] Relation resolution (no dangling UUIDs)
- [ ] Produce `archivist_validation_report.json`

## Full Import
- [ ] Transform + normalize all entries
- [ ] Enrich links + build relationship graph
- [ ] Generate diffs (`/diffs`) and merge candidates

## Review & Promotion
- [ ] Resolve conflicts in Archivist UI
- [ ] Build Promotion Pack #1 (Characters + Locations)
- [ ] OPS QGate + publish to /canon/*
- [ ] Build Promotion Pack #2 (Factions + Events + Items)
- [ ] Rebuild lore_index.json + semantic graph

## Post-Publish
- [ ] Hub/Creator read new canon
- [ ] Create rollback pack for this promotion
