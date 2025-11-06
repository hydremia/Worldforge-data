// ARCHIVIST/routes/promote.mjs
import { canonHashV1, baseForHash } from './lineage.mjs';

export const onRequestPost = async (ctx) => {
  const started = Date.now();
  try {
    const body = await ctx.request.json().catch(()=>({}));
    const auth = ctx.request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    const expected = ctx.env?.OPS_TOKEN || process.env.OPS_TOKEN || '';
    if (!expected || token !== expected) {
      return new Response(JSON.stringify({ ok:false, error:'Unauthorized' }), {
        status: 401, headers: {'content-type':'application/json'}
      });
    }

    const useKV = !!(ctx.env?.WF_KV_STAGING && ctx.env?.WF_KV_CANON && ctx.env?.WF_KV_ARCHIVE);
    const slugs = Array.isArray(body.slugs) ? body.slugs : [];
    if (!slugs.length) {
      return new Response(JSON.stringify({ ok:false, error:'Provide slugs[]' }), {
        status: 400, headers: {'content-type':'application/json'}
      });
    }

    const results = [];
    for (const slug of slugs) {
      const stagingKey = `archivist/staging/${slug}.json`;
      let entry;

      if (useKV) {
        const raw = await ctx.env.WF_KV_STAGING.get(stagingKey, { type: 'text' });
        if (!raw) { results.push({ slug, status:'missing_in_staging' }); continue; }
        entry = JSON.parse(raw);
      } else {
        entry = {
          slug, tier: 2, entity_type: 'article',
          verification_status:'pending', pending_promotion: true, confidence: 'medium',
          lineage:{ entry_id:`staging:${slug}`, origin:{}, edits:[], merged_from:[], verified_by:[], last_hash:'' },
          payload: {}, canon_hash_v1: '', _warnings: []
        };
      }

      const recomputed = await canonHashV1(baseForHash(entry));

      if (entry.canon_hash_v1 && entry.canon_hash_v1 !== recomputed) {
        results.push({ slug, status:'hash_mismatch', expected:entry.canon_hash_v1, got:recomputed });
        continue;
      }

      entry.canon_hash_v1 = recomputed;
      entry.verification_status = 'verified';
      entry.pending_promotion = false;
      entry.promoted_at = new Date().toISOString();

      if (useKV) {
        const canonKey = `archivist/canon/${slug}.json`;
        const oldCanon = await ctx.env.WF_KV_CANON.get(canonKey, { type:'text' });
        if (oldCanon) {
          const archiveKey = `archivist/archive/${slug}.${Date.now()}.json`;
          await ctx.env.WF_KV_ARCHIVE.put(archiveKey, oldCanon);
        }
        await ctx.env.WF_KV_CANON.put(canonKey, JSON.stringify(entry));
        await ctx.env.WF_KV_STAGING.delete(stagingKey);
        results.push({ slug, status:'promoted', canonKey });
      } else {
        results.push({ slug, status:'promoted (simulated)' });
      }
    }

    return new Response(JSON.stringify({ ok:true, results, ms: (Date.now()-started) }), {
      headers: { 'content-type':'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:String(err) }), {
      status: 500, headers: { 'content-type':'application/json' }
    });
  }
};
