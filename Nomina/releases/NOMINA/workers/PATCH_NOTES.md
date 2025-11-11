# Nomina Worker Debug Patch (v3.3.2)
Generated: 2025-11-06T07:50:01.786251Z

**Adds**
- `GET /healthz` — quick service check.
- `GET /debug/list-keys?prefix=...` — list KV keys.
- `GET /debug/get?key=...` — read KV value (sample).

**Improves**
- Try/catch around request handling; returns JSON error with stack on 500.
- Safer RNG with Math.random fallback if `crypto.subtle` is unavailable in dev.

**Apply**
1) Replace `LEXICON/NOMINA/workers/index.mjs` with this file.
2) Restart dev server:
   `wrangler dev --local --persist-to .wrangler\state LEXICON/NOMINA/workers/index.mjs`
3) Sanity checks:
   - `Invoke-RestMethod http://127.0.0.1:8787/healthz`
   - `Invoke-RestMethod http://127.0.0.1:8787/debug/list-keys?prefix=nomina/human/personal/`
