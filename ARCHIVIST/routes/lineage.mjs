// Lineage utilities — compute canon_hash_v1 with stable key order and NFC normalization
export async function canonHashV1(obj){
  const stable = JSON.stringify(stableSort(obj));
  return sha256(stable);
}
function normalizeText(v){
  return (typeof v === 'string') ? v.normalize('NFC') : v;
}
function stableSort(o){
  if (Array.isArray(o)) return o.map(stableSort);
  if (o && typeof o === 'object'){
    return Object.keys(o).sort().reduce((acc,k)=> {
      acc[k] = stableSort(normalizeText(o[k]));
      return acc;
    }, {});
  }
  return normalizeText(o);
}
async function sha256(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
