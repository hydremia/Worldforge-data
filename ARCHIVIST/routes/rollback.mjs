// Rollback / Deprecate / Restore — stubs
export const onRequestPost = async (ctx) => {
  // TODO: implement rollback workflows and Control Log hooks
  return new Response(JSON.stringify({ ok:true, action:"noop" }), { headers: { "content-type":"application/json" }});
};
