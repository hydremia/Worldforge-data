// ARCHIVIST/routes/adapters/wa_adapter.mjs
// Minimal World Anvil adapter: normalizes WA-like JSON to proposals.
export function parseWA(json) {
  // Expected shape (simplified):
  // { articles: [{ id, title, slug, type, updated_at }], characters: [...], locations: [...] }
  const proposals = [];
  let total = 0, matched = 0, isNew = 0;
  if (!json || typeof json !== 'object') return { proposals, totals: { total, matched, isNew } };

  const push = (entity_type, arr=[]) => {
    for (const it of (arr || [])) {
      total += 1;
      const slug = (it.slug || safeSlug(it.title || it.name || `wa-${entity_type}-${total}`)).toLowerCase();
      proposals.push({
        slug,
        entity_type,
        tier_suggested: 2,              // External Canon by default
        confidence: "medium",
        status: "new",                   // Without KV lookup we mark as 'new'
        conflicts_with: [],
        delta_summary: it.title || it.name || slug,
        promotion_readiness: 0.6
      });
      isNew += 1;
    }
  };

  push("article", json.articles);
  push("character", json.characters);
  push("location", json.locations);
  push("faction", json.factions);
  push("item", json.items);
  push("event", json.events);
  push("other", json.other);

  return { proposals, totals: { total, matched, isNew } };
}

function safeSlug(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');
}
