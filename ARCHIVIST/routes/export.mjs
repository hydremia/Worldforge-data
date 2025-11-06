// Export index for Hub/DM — supports filters: tier, archived, q
export const onRequestGet = async (ctx) => {
  const url = new URL(ctx.request.url);
  const tier = url.searchParams.get('tier');
  const archived = url.searchParams.get('archived') === 'true';
  const q = url.searchParams.get('q') || '';
  // TODO: query KV; currently stub
  return new Response(JSON.stringify({ ok:true, results:[], filters:{ tier, archived, q } }), { headers: { "content-type":"application/json" }});
};
