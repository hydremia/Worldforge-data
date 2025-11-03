// tools/size_guard.mjs
// Ecosystem-wide file-size & hash audit against manifests.
// Usage:
//   node tools/size_guard.mjs --gpt HUB
//   node tools/size_guard.mjs --all
//   node tools/size_guard.mjs --gpt HUB --write-manifest
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const GUARD = JSON.parse(fs.readFileSync(path.join('OPS','Rules','guardrails.json'),'utf8'));
const exts = new Set(GUARD.scan_exts);

const args = new Set(process.argv.slice(2));
const getArgVal = (flag, def=null) => {
  const idx = process.argv.indexOf(flag);
  return idx > -1 ? process.argv[idx+1] : def;
};

const targetGPT = getArgVal('--gpt', null);
const all = args.has('--all');
const writeManifest = args.has('--write-manifest');

if (!all && !targetGPT) {
  console.error('Provide --gpt <Name> or --all');
  process.exit(2);
}

const targets = all ? GUARD.gpts : [targetGPT];

function listFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(listFiles(p));
    else out.push(p);
  }
  return out;
}

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

const timestamp = new Date().toISOString();
let violations = [];
let report = { timestamp, threshold_percent_drop: GUARD.threshold_percent_drop, items: [] };

for (const gpt of targets) {
  const roots = (GUARD.paths[gpt] || []).map(p => path.join(ROOT, p)).filter(p => fs.existsSync(p));
  const manifestPath = path.join(ROOT, 'OPS', 'Manifests', `${gpt}_manifest.json`);
  const baseline = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath,'utf8')) : {};

  let current = {};
  for (const r of roots) {
    for (const file of listFiles(r)) {
      const ext = path.extname(file).toLowerCase();
      if (!exts.has(ext)) continue;
      const rel = path.relative(ROOT, file).replace(/\\/g,'/');
      const text = fs.readFileSync(file, 'utf8');
      current[rel] = { size: text.length, hash: sha256(text) };
    }
  }

  for (const [rel, cur] of Object.entries(current)) {
    const base = baseline[rel];
    const before = base ? base.size : null;
    const after = cur.size;
    const delta = before === null ? null : after - before;
    const pct = before ? (delta / before) * 100 : null;
    const flagged = (pct !== null && pct < 0 && Math.abs(pct) > GUARD.threshold_percent_drop);
    if (flagged) violations.push({ gpt, file: rel, before, after, delta, pct });
    report.items.push({ gpt, file: rel, before, after, delta, pct, hash: cur.hash, flagged });
  }

  if (writeManifest) {
    fs.writeFileSync(manifestPath, JSON.stringify(current, null, 2));
    console.log(`Wrote manifest baseline: ${path.relative(ROOT, manifestPath)}`);
  }
}

const outPath = path.join(ROOT, 'OPS', 'Reports', `size_audit_${timestamp.replace(/[:.]/g,'-')}.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

if (violations.length) {
  console.error('❌ Size guard violations (drops > threshold):');
  for (const v of violations) console.error(` - [${v.gpt}] ${v.file}: ${v.before} -> ${v.after} (${v.pct.toFixed(2)}%)`);
  console.error(`Report: ${path.relative(ROOT, outPath)}`);
  process.exit(3);
} else {
  console.log('✅ Size audit passed. Report:', path.relative(ROOT, outPath));
}
