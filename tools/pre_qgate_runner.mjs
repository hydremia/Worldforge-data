// tools/pre_qgate_runner.mjs
// Minimal Pre-QGate runner: exercises /review and /review/promote_selected,
// runs a deterministic hash self-check, and bumps the Loader Report.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';  // <-- include pathToFileURL here
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, "..");
const ENDPOINT = process.env.ARCHIVIST_ENDPOINT || "http://127.0.0.1:8787";

async function post(url, body){
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function get(url){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// Simple field checker; non-fatal WARNs
function checkFields(obj, mustHave = []){
  const missing = mustHave.filter(k => !(k in obj));
  return { ok: missing.length === 0, missing };
}

async function main(){
  console.log("🔎 Pre-QGate — Archivist v3.3.x");

  // 1) Load sample review body
  const reviewBodyPath = path.join(ROOT, "sample_requests", "review_sample.json");
  const reviewBody = JSON.parse(await fs.readFile(reviewBodyPath, "utf-8"));

  // 2) Call /review
  const review = await post(`${ENDPOINT}/archivist/review`, reviewBody);
  console.log("• /review → proposals:", review.proposals.length);

  // 3) Basic schema checks on review packet
  const chk = checkFields(review, ["review_id","source_uri","source_adapter","scan_summary","proposals","generated_at"]);
  if (!chk.ok) console.warn("⚠️ Review packet missing fields:", chk.missing);

  // 4) Promote two slugs (from sample)
  const promoteBodyPath = path.join(ROOT, "sample_requests", "promote_selected_sample.json");
  const promoteBody = JSON.parse(await fs.readFile(promoteBodyPath, "utf-8"));
  const promoted = await post(`${ENDPOINT}/archivist/review/promote_selected`, promoteBody);
  console.log("• promote_selected → staged_count:", promoted.staged_count);

  // 5) Deterministic hash self-check (import lineage.mjs and hash same object twice)
  const lineagePath = path.join(ROOT, "ARCHIVIST", "routes", "lineage.mjs");
  const lineageUrl = pathToFileURL(lineagePath).href;   // turn C:\... into file:// URL
  const lineageMod = await import(lineageUrl);

  const sampleEntry = {
    slug:"determinism-check",
    tier:2,
    payload:{ a:1, b:["x","y"] },
    lineage:{
      entry_id:"x",
      origin:{ source:"External", tier:2, author:"test", timestamp:"2025-11-06T00:00:00Z", signature:"" },
      edits:[], merged_from:[], verified_by:[], last_hash:""
    },
    verification_status:"pending",
    canon_hash_v1:""
  };

  const h1 = await lineageMod.canonHashV1(sampleEntry);
  const h2 = await lineageMod.canonHashV1(sampleEntry);
  const deterministic = (h1 === h2);
  console.log("• hash deterministic:", deterministic, h1);

  // 6) Bump Loader Report
  const lrPath = path.join(ROOT, "OPS", "Reports", "Archivist_Loader_Report_v3.3.json");
  let lr = {};
  try { lr = JSON.parse(await fs.readFile(lrPath, "utf-8")); } catch {}
  lr.module = "Archivist";
  lr.version = lr.version || "v3.3.1";
  lr.timestamp = new Date().toISOString();
  lr.schema_checks = chk.ok ? "PASS" : "WARN";
  lr.qgate = deterministic ? "READY" : "PENDING";
  await fs.writeFile(lrPath, JSON.stringify(lr, null, 2), "utf-8");
  console.log("✅ Updated Loader Report:", lrPath);
  console.log("   schema_checks:", lr.schema_checks, "| qgate:", lr.qgate);
}

main().catch(err => {
  console.error("❌ Pre-QGate runner failed:", err);
  process.exit(1);
});
