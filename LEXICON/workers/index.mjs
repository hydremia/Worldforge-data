// Lexicon Worker — suggest/reserve/stats stubs
export const onRequestPost = async (ctx) => {
  const body = await ctx.request.json().catch(()=>({}));
  return new Response(JSON.stringify({ ok:true, suggestions:[], request: body }), { headers: { "content-type":"application/json" }});
};
