// Promote selected proposals from STAGING → CANON (requires OPS approval)
export const onRequestPost = async (ctx) => {
  // TODO: verify OPS token, load items from STAGING, compute canon_hash_v1, write to CANON
  return new Response(JSON.stringify({ ok:true, promoted:0 }), { headers: { "content-type":"application/json" }});
};
