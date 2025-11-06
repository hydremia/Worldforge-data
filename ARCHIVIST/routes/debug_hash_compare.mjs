// ARCHIVIST/routes/debug_hash_compare.mjs
import { canonHashV1, baseForHash } from './lineage.mjs';

export const onRequestGet = async (ctx) => {
  const url = new URL(ctx.request.url);
  const store = url.searchParams.get('store') || 'staging';
  const slug  = url.searchParams.get('slug');
  if (!slug) return new Response(JSON.stringify({ ok:false, error:'slug required' }), { status:400 });

  const map = {
    staging: ctx.env?.WF_KV_STAGING,
    canon:   ctx.env?.WF_KV_CANON,
    archive: ctx.env?.WF_KV_ARCHIVE
  };
  const kv = map[store];
  if (!kv) return new Response(JSON.stringify({ ok:false, error:`unknown store: ${store}` }), { status:400 });

  const key = `archivist/${store}/${slug}.json`;
  const raw = await kv.get(key, { type:'text' });
  if (!raw) return new Response(JSON.stringify({ ok:false, error:'not found', key }), { status:404 });

  const entry = JSON.parse(raw);
  const basis = baseForHash(entry);
  const storedHash = entry.canon_hash_v1 || null;
  const recomputed = await canonHashV1(basis);

  return new Response(JSON.stringify({
    ok: true, key,
    storedHash, recomputed,
    same: storedHash ? storedHash === recomputed : null
  }), { headers: { 'content-type':'application/json' }});
};
