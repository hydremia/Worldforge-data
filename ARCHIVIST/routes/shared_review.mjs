// ARCHIVIST/routes/shared_review.mjs
import { parseWA } from './adapters/wa_adapter.mjs';

export async function makeReviewPacket(source_uri, adapter, body = {}){
  const now = new Date().toISOString();
  let proposals = [];
  let totals = { total: 0, isNew: 0, matched: 0 };

  if ((adapter === 'wa' || adapter === 'worldanvil') && body.wa_json) {
    try {
      const parsed = typeof body.wa_json === 'string' ? JSON.parse(body.wa_json) : body.wa_json;
      const out = parseWA(parsed);
      proposals = out.proposals;
      totals = { total: out.totals.total, isNew: out.totals.isNew, matched: out.totals.matched };
    } catch (e) {
      // fall back to empty analyzer if JSON invalid
    }
  }

  return {
    review_id: cryptoRandomId(),
    source_uri,
    source_adapter: adapter,
    scan_summary: { entities_total: totals.total, entities_new: totals.isNew, entities_matched: totals.matched },
    proposals,
    gaps: [],
    duplicates: [],
    conflicts: [],
    recommendations: proposals.length ? ["Review proposals and promote selected"] : ["No-op: analyzer stub"],
    est_effort: { ops_review_minutes: Math.max(1, Math.ceil((proposals.length || 1)/25)), merge_complexity: proposals.length>50 ? "med" : "low" },
    generated_at: now
  };
}

function cryptoRandomId(){
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[/+=]/g,"").slice(0,16);
}
