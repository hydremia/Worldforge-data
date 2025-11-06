// serve_local.mjs — local runner with routes (includes /review/promote_selected)
import { createServer } from 'node:http';
import * as Review from './ARCHIVIST/routes/review.mjs';
import * as Ingest from './ARCHIVIST/routes/ingest.mjs';
import * as Promote from './ARCHIVIST/routes/promote.mjs';
import * as ReviewPromote from './ARCHIVIST/routes/review_promote_selected.mjs';
import * as ExportRoute from './ARCHIVIST/routes/export.mjs';
import * as Rollback from './ARCHIVIST/routes/rollback.mjs';
import * as DebugHashCompare from './ARCHIVIST/routes/debug_hash_compare.mjs';
if (url.pathname === '/archivist/debug/hash_compare' && method === 'GET') return DebugHashCompare.onRequestGet(rctx);

const PORT = 8787;

function toNode(res, nodeRes) {
  nodeRes.statusCode = res.status || 200;
  for (const [k, v] of res.headers.entries()) {
    if (k.toLowerCase() === 'content-length') continue;
    nodeRes.setHeader(k, v);
  }
  res.text().then(txt => nodeRes.end(txt)).catch(err => {
    nodeRes.statusCode = 500;
    nodeRes.end(JSON.stringify({ ok:false, error: String(err) }));
  });
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method || 'GET';
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const bodyBuf = Buffer.concat(chunks);
    const bodyInit = bodyBuf.length ? bodyBuf : undefined;
    const request = new Request(url.toString(), { method, headers: req.headers, body: bodyInit });
    const ctx = { request, env: {} };
    const p = url.pathname;
    if (p === '/archivist/review' && method === 'POST') return toNode(await Review.onRequestPost(ctx), res);
    if ((p === '/archivist/ingest' || p === '/archivist/ingest/wa') && method === 'POST') return toNode(await Ingest.onRequestPost(ctx), res);
    if (p === '/archivist/promote' && method === 'POST') return toNode(await Promote.onRequestPost(ctx), res);
    if (p === '/archivist/review/promote_selected' && method === 'POST') return toNode(await ReviewPromote.onRequestPost(ctx), res);
    if (p === '/archivist/export/index' && method === 'GET') return toNode(await ExportRoute.onRequestGet(ctx), res);
    if ((p === '/archivist/rollback' || p === '/archivist/deprecate' || p === '/archivist/restore') && method === 'POST') return toNode(await Rollback.onRequestPost(ctx), res);
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok:false, error:'Not Found', path:p, method }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok:false, error: String(e) }));
  }
}).listen(8787, () => console.log(`Archivist local server running at http://127.0.0.1:8787`));
