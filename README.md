
# WF Archivist + Nomina Bundle (v3.3)

**Generated:** 2025-11-06T06:31:33.867517Z

This bundle seeds the Archivist + Nomina design/build for Tier-3 → v3.3.

## Contents
- `schemas/` — core schemas (voice, entry, review, pipeline)
- `workers/archivist/index.mjs` — Archivist Worker skeleton
- `LEXICON/NOMINA/*` — Nomina schemas & Worker skeleton
- `tools/` — validation and RNG smoke scripts
- `agents/prompts/` — Agent Mode prompt pack

## Setup
1. `npm i ajv ajv-formats undici`
2. Configure `wrangler.toml` KV bindings (staging first).
3. `npm run validate` — validate all JSON files.
4. `npm run rng:smoke` — simulate RNG & cooldown.
5. Deploy workers with `wrangler dev` / `wrangler publish`.

## Notes
- Promotion requires manifest preview and `OPS_TOKEN`.
- Deterministic `canon_hash_v1` to be implemented in Worker (placeholder provided).
