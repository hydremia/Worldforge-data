// Ingest (WA) — supports dry_run to return Review Packet without writes
import { makeReviewPacket } from './shared_review.mjs';
export const onRequestPost = async (ctx) => {
  const url = new URL(ctx.request.url);
  const dry = url.searchParams.get("dry_run") === "true";
  const body = await ctx.request.json().catch(()=>({}));
  if (dry) {
    const pkt = await makeReviewPacket(body.source_uri || "unknown", body.adapter || "wa", body);
    return new Response(JSON.stringify(pkt), { headers: { "content-type":"application/json" }});
  }
  return new Response(JSON.stringify({ ok:true, staged:true, count:0 }), { headers: { "content-type":"application/json" }});
};
