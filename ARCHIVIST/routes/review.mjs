// Prospect Mode — non-destructive review of large sources
import { makeReviewPacket } from './shared_review.mjs';
export const onRequestPost = async (ctx) => {
  const body = await ctx.request.json().catch(()=>({}));
  const pkt = await makeReviewPacket(body.source_uri || "unknown", body.adapter || "wa", body);
  return new Response(JSON.stringify(pkt), { headers: { "content-type":"application/json" }});
};
