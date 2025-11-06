// ARCHIVIST/routes/lineage.mjs
// Canonical lineage helpers and stable hashing for Archivist v3.3.x

export function baseForHash(entry) {
  const e = JSON.parse(JSON.stringify(entry || {}));
  delete e.canon_hash_v1;
  delete e.promoted_at;
  if (e.lineage && typeof e.lineage === 'object' && 'last_hash' in e.lineage) {
    const { last_hash, ...rest } = e.lineage;
    e.lineage = rest;
  }
  return e;
}

function stableStringify(obj) {
  const seen = new WeakSet();
  const stringify = (o) => {
    if (o === null || typeof o !== 'object') return JSON.stringify(o);
    if (seen.has(o)) throw new TypeError('circular structure');
    seen.add(o);
    if (Array.isArray(o)) {
      return '[' + o.map(v => stringify(v)).join(',') + ']';
    }
    const keys = Object.keys(o).sort();
    const entries = keys.map(k => JSON.stringify(k) + ':' + stringify(o[k]));
    return '{' + entries.join(',') + '}';
  };
  return stringify(obj);
}

export async function canonHashV1(obj) {
  const text = stableStringify(obj);
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
