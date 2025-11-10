# Archivist Interface Spec — v3.4

## Overview
This document defines the Custom GPT layer’s interaction surface, schemas, and message flows across Workers and GPTs.

## Endpoints
### POST /archivist/review
- Input: `review_submission_schema.json`
- Output: `Review_Summary_<timestamp>.json`
- Side effects: writes `/staging/**` normalized entries; logs telemetry `archivist.event.reviewed`.

### POST /archivist/promote
- Input: `{ promotion_ticket, ops_token, entity_ids[], delta }`
- Preconditions: QGate PASS, OPS approval recorded.
- Output: `archivist_record_schema.json` with `status: canon` and appended lineage.

### POST /ops/audit/qgate
- Input: `OPS_QGate_Preflight` payload
- Output: `OPS_Audit_Report_v3.4_Archivist.json` (stored by OPS)

## Schemas (contracted)
- `archivist_record_schema.json`: Canon entity record with lineage, sources, ids, and tags.
- `canon_delta_schema.json`: Differences between staged and canon with confidence metrics.
- `review_submission_schema.json`: Normalized submission intake format.

## Message Flow (textual)
1. Creator/External submits staged content → `/archivist/review`.
2. Archivist validates + normalizes → emits `Review_Summary`.
3. Archivist computes deltas vs canon → proposes actions.
4. OPS runs QGate preflight → returns PASS/FAIL.
5. With approval + tokens, Archivist calls `/archivist/promote` → writes to `/canon/**`.
6. Hub receives telemetry and updates dashboards.

## Cross-GPT Contracts
- **Creator GPT**: requires `validated_refs[]` to avoid orphan descriptors.
- **Atelier Worker**: requires `entity_map{visual→canon_id}` for consistent lineage.
- **Hub Dashboard**: consumes `archivist.event.*` for counts/health.

## Error Semantics
- 400 schema_error
- 401 ops_token_invalid
- 409 conflict_requires_escalation
- 412 preflight_required
- 423 canon_locked
- 428 missing_lineage