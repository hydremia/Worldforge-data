// Shared analyzer used by /review and /ingest?dry_run
export async function makeReviewPacket(source_uri, adapter){
  const now = new Date().toISOString();
  return {
    review_id: cryptoRandomId(),
    source_uri,
    source_adapter: adapter,
    scan_summary: { entities_total: 0, entities_new: 0, entities_matched: 0 },
    proposals: [],
    gaps: [],
    duplicates: [],
    conflicts: [],
    recommendations: ["No-op: analyzer stub"],
    est_effort: { ops_review_minutes: 0, merge_complexity: "low" },
    generated_at: now
  };
}
function cryptoRandomId(){
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[/+=]/g,"").slice(0,16);
}
