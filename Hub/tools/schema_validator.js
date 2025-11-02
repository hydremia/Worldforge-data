#!/usr/bin/env node
// Worldforge Hub v3.0.1 — Loader Report Schema Validator
// Usage: node schema_validator.js <template.json> <report.json>
// Exits with code 0 on PASS, 1 on FAIL.

import fs from 'fs';

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`ERROR reading ${p}:`, e.message);
    process.exit(1);
  }
}

function keys(o){ return Object.keys(o || {}).sort(); }

function assert(cond, msg, diffs) {
  if (!cond) diffs.push(msg);
}

function validate(template, report) {
  const diffs = [];

  // Top-level keys match (order-insensitive)
  const tk = keys(template).join('|');
  const rk = keys(report).join('|');
  assert(tk === rk, `Top-level keys mismatch.\n  tmpl: ${tk}\n  repo: ${rk}`, diffs);

  // Required nested keys presence
  const required = [
    'bridge_version','canon_version','hub','user','gpts','ops_audit','safe_mode','ops_mode'
  ];
  for (const k of required) {
    assert(Object.prototype.hasOwnProperty.call(report, k), `Missing required key: ${k}`, diffs);
  }

  // Versions should be v3.0.1
  for (const vkey of ['bridge_version','canon_version']) {
    const val = report[vkey] || '';
    if (!/^v3\.0\.1$/.test(val)) {
      diffs.push(`Expected ${vkey}=v3.0.1, got ${val}`);
    }
  }
  const hv = (report && report.hub && report.hub.version) || '';
  if (hv !== 'v3.0.1') {
    diffs.push(`Expected hub.version=v3.0.1, got ${hv}`);
  }

  // Basic structure checks
  for (const k of ['OPS','DM']) {
    if (!(report && report.gpts && report.gpts[k])) {
      diffs.push(`gpts.${k} missing`);
      continue;
    }
    for (const sub of ['version','health','endpoints']) {
      if (!Object.prototype.hasOwnProperty.call(report.gpts[k], sub)) {
        diffs.push(`gpts.${k}.${sub} missing`);
      }
    }
  }

  // ops_audit shape
  for (const sub of ['tone_status','schema_status','notes']) {
    if (!(report && report.ops_audit && Object.prototype.hasOwnProperty.call(report.ops_audit, sub))) {
      diffs.push(`ops_audit.${sub} missing`);
    }
  }

  return diffs;
}

function main() {
  const [tmplPath, reportPath] = process.argv.slice(2);
  if (!tmplPath || !reportPath) {
    console.error('Usage: node schema_validator.js <template.json> <report.json>');
    process.exit(1);
  }
  const template = readJSON(tmplPath);
  const report   = readJSON(reportPath);
  const diffs = validate(template, report);
  if (diffs.length === 0) {
    console.log('PASS: Loader Report matches v3.0.1 template.');
    process.exit(0);
  } else {
    console.error('FAIL:');
    console.error(diffs.map(d => '- ' + d).join('\n'));
    process.exit(1);
  }
}

main();
