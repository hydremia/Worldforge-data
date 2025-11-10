# Patch — Species-first requests + optional culture (v3.3.1)
Generated: 2025-11-06T07:09:15.136828Z

**Changes**
- `nomina_request_schema.json`: `culture` is now optional.
- `Lexicon/Nomina worker`: species-first shard selection; optional `culture` filter (["*"] or missing = any);
  deterministic RNG; basic cooldown via KV on `/nomina/reserve`; JSONL bulk `/nomina/import`.

**Apply**
1) Overwrite:
   - `LEXICON/NOMINA/schemas/nomina_request_schema.json`
   - `LEXICON/NOMINA/workers/index.mjs`
2) `npm run validate`
3) Run local worker and try species-only request:
   ```
   curl -s http://127.0.0.1:8787/nomina/suggest \
     -H "content-type: application/json" \
     -d '{"species":["human"],"name_type":"personal","gender":"any","count":5,"seed":"roll_id:test"}'
   ```
