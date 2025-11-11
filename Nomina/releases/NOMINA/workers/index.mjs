// LEXICON/NOMINA/workers/index.mjs — v3.3.2 (debug enhanced)
// Adds: GET /healthz, GET /debug/list-keys?prefix=..., GET /debug/get?key=...
// Improves: error handling, safer RNG fallback, verbose error JSON on 500 in dev.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    try {
      // Health check
      if (url.pathname === '/healthz' && method === 'GET') {
        return jsonRes({ ok: true, ts: Date.now(), env: env.ENV || 'dev' });
      }

      // Debug: list KV keys
      if (url.pathname === '/debug/list-keys' && method === 'GET') {
        const prefix = url.searchParams.get('prefix') || '';
        const listed = await env.WF_NOMINA_SETS.list({ prefix });
        return jsonRes({ prefix, count: listed.keys.length, keys: listed.keys.map(k => k.name) });
      }

      // Debug: get KV value (CAUTION: large values truncated)
      if (url.pathname === '/debug/get' && method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return jsonRes({ error: 'key required' }, 400);
        const val = await env.WF_NOMINA_SETS.get(key);
        return jsonRes({ key, length: val ? val.length : 0, sample: val ? val.slice(0, 300) : null });
      }

      if (url.pathname === '/nomina/suggest' && method === 'POST') {
        const req = await request.json();

        const species = Array.isArray(req.species) ? req.species : [];
        const nameType = req.name_type;
        const gender = req.gender || 'any';
        const culture = Array.isArray(req.culture) ? req.culture : []; // optional
        const count = Math.max(1, Math.min(100, req.count || 5));
        const seed = req.seed || crypto.randomUUID();

        if (!species.length || !nameType) {
          return jsonRes({ error: "species[] and name_type required" }, 400);
        }

        // Load shards
        let candidates = [];
        for (const sp of species) {
          const prefix = `nomina/${sp}/${nameType}/`;
          const listed = await env.WF_NOMINA_SETS.list({ prefix });
          for (const k of listed.keys) {
            const raw = await env.WF_NOMINA_SETS.get(k.name);
            if (!raw) continue;
            for (const line of raw.split('\n')) {
              const t = line.trim();
              if (!t) continue;
              try {
                const obj = JSON.parse(t);
                if (culture.length && culture[0] !== '*') {
                  const entryCult = Array.isArray(obj.culture) ? obj.culture : [];
                  if (!entryCult.some(c => culture.includes(c))) continue;
                }
                if (gender && gender !== 'any' && obj.gender && obj.gender !== 'any' && obj.gender !== gender) continue;
                candidates.push(obj);
              } catch (e) {
                // ignore bad line
              }
            }
          }
        }

        if (!candidates.length) {
          return jsonRes({ roll_id: seed, results: [], note: "No candidates matched filters or shards not loaded." });
        }

        // Weighted selection
        const rng = await seededRng(seed);
        const weighted = candidates.map(c => ({ c, w: (c.weight ?? 1) * (1 - (c.rarity ?? 0.5)) }));
        const picks = await sampleWeighted(weighted, count, rng);

        const roll_id = seed;
        await env.WF_RNG_ROLLS.put(roll_id, JSON.stringify({
          ts: Date.now(), req: { species, nameType, gender, culture, count, seed },
          pool: candidates.length, selected: picks.map(p => p.slug)
        }));

        return jsonRes({ roll_id, results: picks });
      }

      if (url.pathname === '/nomina/reserve' && method === 'POST') {
        const body = await request.json();
        const capsule = body.capsule_id || 'default';
        const cooldown = Math.max(0, body.cooldown || 0);
        const names = Array.isArray(body.names) ? body.names : [];

        const now = Date.now();
        const blocked = [];
        const reserved = [];

        for (const n of names) {
          const slug = typeof n === 'string' ? n : n.slug;
          if (!slug) continue;
          const key = `cooldown/${capsule}/${slug}`;
          const existing = await env.WF_NOMINA_STATS.get(key, { type: 'json' });
          if (existing && existing.until && existing.until > now) {
            blocked.push({ slug, until: existing.until });
            continue;
          }
          const until = now + cooldown * 1000;
          await env.WF_NOMINA_STATS.put(key, JSON.stringify({ until }), { expirationTtl: cooldown || 60 });
          reserved.push({ slug, until });
        }

        return jsonRes({ ok: true, reserved, blocked });
      }

      if (url.pathname.startsWith('/nomina/stats/') && method === 'GET') {
        const id = url.pathname.split('/').pop();
        const stats = await env.WF_NOMINA_STATS.get(id, { type: 'json' }) || { uses: 0 };
        return jsonRes(stats);
      }

      if (url.pathname === '/nomina/import' && method === 'POST') {
        const body = await request.json();
        const species = body.species;
        const nameType = body.name_type;
        const bucket = body.bucket || 'a.jsonl';
        if (!species || !nameType || !Array.isArray(body.entries)) {
          return jsonRes({ error: "species, name_type, and entries[] required" }, 400);
        }
        const key = `nomina/${species}/${nameType}/${bucket}`;
        const jsonl = body.entries.map(e => JSON.stringify(e)).join('\n') + '\n';
        await env.WF_NOMINA_SETS.put(key, jsonl);
        return jsonRes({ ok: true, key, count: body.entries.length });
      }

      return new Response('Nomina v3.3.2 worker online');
    } catch (err) {
      const msg = (err && err.stack) ? err.stack : String(err);
      // Return a JSON error to aid local debugging
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }
}

// Helpers
function jsonRes(obj, status=200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

async function seededRng(seed) {
  let counter = 0;
  const te = new TextEncoder();
  const hasSubtle = globalThis.crypto && globalThis.crypto.subtle && globalThis.crypto.subtle.digest;
  if (!hasSubtle) {
    // Fallback PRNG using Math.random seeded poorly; for dev only
    const salt = Math.random();
    return async () => (Math.random() + salt) % 1;
  }
  return async () => {
    const data = te.encode(seed + ':' + (counter++));
    const buf = await crypto.subtle.digest('SHA-256', data);
    const view = new DataView(buf);
    const n = view.getUint32(0, false) / 0xFFFFFFFF;
    return n;
  };
}

function sampleIndex(weights, r) {
  const total = weights.reduce((a,b)=>a+b,0);
  let acc = 0;
  const target = r * total;
  for (let i=0;i<weights.length;i++) {
    acc += weights[i];
    if (target <= acc) return i;
  }
  return weights.length-1;
}

async function sampleWeighted(weighted, k, rng) {
  const out = [];
  const items = weighted.slice();
  while (out.length < k && items.length) {
    const weights = items.map(x => x.w || 1);
    const r = await rng();
    const idx = sampleIndex(weights, r);
    out.push(items[idx].c);
    items.splice(idx,1);
  }
  return out;
}
