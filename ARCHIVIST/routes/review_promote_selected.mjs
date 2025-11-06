// Promote a subset of proposals from a Review Packet into STAGING.
// Feature-flagged KV writes: if ctx.env.WF_KV_STAGING exists, writes there; otherwise simulates.
import { canonHashV1 } from './lineage.mjs';
const SLUG_RE = /^[a-z0-9_-]+$/;
export const onRequestPost = async (ctx) => {
  const body = await ctx.request.json().catch(()=>({}));
  const slugs = Array.isArray(body.slugs) ? body.slugs : [];
  const target_tier = Number(body.target_tier);
  const notes = typeof body.notes === "string" ? body.notes : "";
  const review_id = body.review_id || null;
  const audit = { warnings: [], errors: [] };
  if (!slugs.length) audit.errors.push("Body.slugs must be a non-empty array.");
  if (![1,2].includes(target_tier)) audit.errors.push("target_tier must be 1 or 2.");
  const uniq = []; const dupes = []; const invalid = [];
  for (const s of slugs) {
    if (typeof s !== "string" || !SLUG_RE.test(s)) { invalid.push(s); continue; }
    if (uniq.includes(s)) dupes.push(s); else uniq.push(s);
  }
  if (invalid.length) audit.warnings.push(`Invalid slugs filtered: ${invalid.join(", ")}`);
  if (dupes.length) audit.warnings.push(`Duplicate slugs ignored: ${dupes.join(", ")}`);
  if (audit.errors.length) {
    return new Response(JSON.stringify({ ok:false, review_id, errors: audit.errors, warnings: audit.warnings }), {
      status: 400, headers: { "content-type":"application/json" }
    });
  }
  const useKV = !!(ctx.env && ctx.env.WF_KV_STAGING);
  const staged = [];
  for (const slug of uniq) {
    const now = new Date().toISOString();
    const entry = {
      slug, entity_type: "article",
      tier: target_tier,
      source_type: target_tier === 1 ? "internal" : "external",
      verification_status: "pending",
      pending_promotion: true,
      confidence: target_tier === 1 ? "high" : "medium",
      archived_version: false,
      lineage: {
        entry_id: `staging:${slug}`,
        origin: { source: "External", tier: target_tier, author: "ArchivistReview", timestamp: now, signature: "" },
        edits: [], merged_from: [], verified_by: [], last_hash: ""
      },
      payload: {}
    };
    entry.canon_hash_v1 = await canonHashV1(entry);
    entry.lineage.last_hash = entry.canon_hash_v1;
    const key = `archivist/staging/${slug}.json`;
    if (useKV) {
      await ctx.env.WF_KV_STAGING.put(key, JSON.stringify(entry));
      staged.push({ slug, target_tier, staged_to: "WF_KV_STAGING", key });
    } else {
      staged.push({ slug, target_tier, staged_to: "WF_KV_STAGING (simulated)", key });
    }
  }
  return new Response(JSON.stringify({
    ok: true, review_id, target_tier, notes,
    staged_count: staged.length, staged, audit
  }), { headers: { "content-type":"application/json" }});
};
