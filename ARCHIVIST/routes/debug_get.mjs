// ARCHIVIST/routes/debug_get.mjs
// DEV-ONLY: fetch a KV entry by store & slug, e.g. /archivist/debug/get?store=canon&slug=vaelthirathil
export const onRequestGet = async (ctx) => {
  const url = new URL(ctx.request.url);
  const store = url.searchParams.get("store");   // "staging" | "canon" | "archive"
  const slug  = url.searchParams.get("slug");
  if (!store || !slug) return new Response(JSON.stringify({ ok:false, error:"store & slug required" }), { status:400 });
  const map = {
    staging: ctx.env?.WF_KV_STAGING,
    canon:   ctx.env?.WF_KV_CANON,
    archive: ctx.env?.WF_KV_ARCHIVE
  };
  const kv = map[store];
  if (!kv) return new Response(JSON.stringify({ ok:false, error:`unknown store: ${store}` }), { status:400 });
  const key = `archivist/${store}/${slug}.json`;
  const raw = await kv.get(key, { type:"text" });
  if (!raw) return new Response(JSON.stringify({ ok:false, error:"not found", key }), { status:404 });
  return new Response(raw, { headers: { "content-type":"application/json" }});
};
