
import crypto from 'node:crypto';

function rng(seed, count=5) {
  const results = [];
  for (let i=0;i<count;i++) {
    const h = crypto.createHash('sha256').update(seed + ':' + i).digest('hex');
    const n = parseInt(h.slice(0,8),16) / 0xffffffff;
    results.push(n);
  }
  return results;
}

const seed = process.argv[2] || 'roll_id:test';
const vals = rng(seed, 10);
console.log('Seed:', seed);
console.log('Values:', vals.map(v=>v.toFixed(6)).join(', '));
