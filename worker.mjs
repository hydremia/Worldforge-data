// worker.mjs — Cloudflare Worker entry (Archivist v3.3.x)
import * as Review from './ARCHIVIST/routes/review.mjs';
import * as Ingest from './ARCHIVIST/routes/ingest.mjs';
import * as Promote from './ARCHIVIST/routes/promote.mjs';
import * as ReviewPromote from './ARCHIVIST/routes/review_promote_selected.mjs';
import * as ExportRoute from './ARCHIVIST/routes/export.mjs';
import * as Rollback from './ARCHIVIST/routes/rollback.mjs';

import * as DebugGet from './ARCHIVIST/routes/debug_get.mjs';
import * as DebugHashCompare from './ARCHIVIST/routes/debug_hash_compare.mjs';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const rctx = { request, env, ctx };

    if (url.pathname === '/archivist/review' && method === 'POST') return Review.onRequestPost(rctx);
    if ((url.pathname === '/archivist/ingest' || url.pathname === '/archivist/ingest/wa') && method === 'POST') return Ingest.onRequestPost(rctx);
    if (url.pathname === '/archivist/promote' && method === 'POST') return Promote.onRequestPost(rctx);
    if (url.pathname === '/archivist/review/promote_selected' && method === 'POST') return ReviewPromote.onRequestPost(rctx);
    if (url.pathname === '/archivist/export/index' && method === 'GET') return ExportRoute.onRequestGet(rctx);
    if ((url.pathname === '/archivist/rollback' || url.pathname === '/archivist/deprecate' || url.pathname === '/archivist/restore') && method === 'POST') return Rollback.onRequestPost(rctx);

    if (url.pathname === '/archivist/debug/get' && method === 'GET') return DebugGet.onRequestGet(rctx);
    if (url.pathname === '/archivist/debug/hash_compare' && method === 'GET') return DebugHashCompare.onRequestGet(rctx);

    return new Response(JSON.stringify({ ok:false, error:'Not Found', path:url.pathname, method }), {
      status: 404, headers: { 'content-type':'application/json' }
    });
  }
};
