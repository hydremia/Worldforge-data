/**
 * preqgate_validate.mjs
 * Worldforge Atelier — Pre-QGate Validation Pipeline (v3.0.1)
 * Ecosystem Target: v3.2
 * -----------------------------------------------------------
 * Validates visual lineage data, enforces schema compliance,
 * checks audit thresholds, and optionally uploads to OPS QGate.
 */

import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import crypto from "crypto";
import https from "https";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schema ---------------------------------------------------------------
const schemaPath = "./schemas/visual_lineage_schema.json";
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const validate = ajv.compile(schema);

// Utility -------------------------------------------------------------------
function checksum(obj) {
  const json = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}

function scoreAudit(fields = {}) {
  const required = ["fidelity", "restraint", "clarity", "transparency"];
  for (const key of required) if (fields[key] === undefined) return false;
  const avg =
    (fields.fidelity + fields.restraint + fields.clarity + fields.transparency) /
    4;
  return avg >= 4;
}

function postToQGate(report) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(report);
    const req = https.request(
      {
        hostname: "ops.worldforge.io",
        path: "/audit/qgate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          console.log(`OPS QGate responded: ${res.statusCode}`);
          resolve({ status: res.statusCode, body });
        });
      }
    );
    req.on("error", (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// Core Validation -----------------------------------------------------------
export function validateVisual(data, index = 0) {
  const valid = validate(data);
  const lineageIntact =
    !data.parent_capsule ||
    data.lineage_graph?.some((n) => n.capsule_id === data.parent_capsule);
  const auditPass = scoreAudit(data.audit_fields);
  const computedChecksum = checksum(data);
  const checksumMatch = data.checksum === computedChecksum;

  return {
    index,
    capsule_id: data.capsule_id,
    valid,
    lineageIntact,
    auditPass,
    checksumMatch,
    errors: validate.errors || [],
  };
}

export async function runBatchValidation(inputDir = "./data/visuals") {
  const files = fs
    .readdirSync(inputDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(inputDir, f));

  const results = [];
  for (const [i, file] of files.entries()) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const result = validateVisual(data, i);
    results.push(result);
  }

  const summary = {
    schema_version: schema.version,
    ecosystem_version: schema.ecosystem_version,
    total_items: results.length,
    pass_count: results.filter(
      (r) => r.valid && r.lineageIntact && r.auditPass && r.checksumMatch
    ).length,
    fail_count: results.filter(
      (r) => !(r.valid && r.lineageIntact && r.auditPass && r.checksumMatch)
    ).length,
    lineage_graph_size: results.reduce(
      (sum, r) => sum + (r.lineage_graph ? r.lineage_graph.length : 0),
      0
    ),
    timestamp: new Date().toISOString(),
    notes: "Pre-QGate validation completed.",
  };

  const report = { summary, results };
  const outPath = "./reports/Atelier_Loader_Report_v3.2.json";
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(
    `✅ Validation Complete — ${summary.pass_count}/${summary.total_items} passed.`
  );
  console.log(`Report written to ${outPath}`);

  if (summary.fail_count === 0) {
    console.log("🚀 All visuals passed. Submitting to OPS QGate...");
    try {
      const res = await postToQGate(report);
      console.log("QGate submission successful:", res.status);
    } catch (err) {
      console.error("❌ QGate submission failed:", err);
    }
  } else {
    console.warn("⚠️ Some items failed validation. QGate upload skipped.");
  }

  return report;
}

// CLI Entrypoint -------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputDir = process.argv[2] || "./data/visuals";
  runBatchValidation(inputDir);
}

// End of File ---------------------------------------------------------------
// ✔ Ready for OPS Intake / Master Control Submission
