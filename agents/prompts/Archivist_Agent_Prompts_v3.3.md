
# Agent Mode Prompt Pack — Archivist + Nomina (v3.3)

## 1) Archivist Review Agent
Goal: Validate deltas and prepare review packets.
Prompt:
"Load normalized deltas from WF_KV_STAGING, validate against archivist_entry_schema, compute canon_hash_v1 preview, and emit archivist_review_packet with action suggestions. Flag conflicts and missing lineage."

## 2) Nomina Fairness Agent
Goal: Audit RNG rolls and cooldowns.
Prompt:
"Scan WF_RNG_ROLLS for last N=50 rolls by capsule_id. Verify rarity weighting and cooldown compliance. Output distribution histograms and flag p<0.05 anomalies."

## 3) Hub Feed Agent
Goal: Prepare display payloads.
Prompt:
"Read latest canon entries by region and type, reduce to Hub card format, include lineage badges, and emit /hub_feed.json for preview."

## 4) OPS Audit Agent
Goal: Pre-QGate sanity.
Prompt:
"Validate schemas, ensure size-diff within ±10%, check required provenance fields, and produce OPS_Promotion_Manifest_v3.3.json (draft)."
