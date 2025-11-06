// index.mjs — Worldforge Atelier Worker v3.0.1 (Ecosystem v3.2)
// -------------------------------------------------------------
// Primary entrypoint for Atelier validation workflow.
// Executes Pre-QGate lineage validation and produces Loader Report.

import { runBatchValidation } from "./tools/preqgate_validate.mjs";
import fs from "fs";
import path from "path";

// Define expected directory layout relative to this file
const ROOT = path.resolve("/worldforge-data/ATELIER");
const DATA_DIR = path.join(ROOT, "data/visuals");
const REPORTS_DIR = path.join(ROOT, "reports");
const SCHEMA_PATH = path.join(ROOT, "schemas/visual_lineage_schema.json");
const TOOLS_PATH = path.join(ROOT, "tools/preqgate_validate.mjs");

console.log("\n🎨  Worldforge Atelier Worker v3.0.1 — Ecosystem v3.2");
console.log("------------------------------------------------------");
console.log(`Root Path: ${ROOT}`);
console.log(`Schema: ${SCHEMA_PATH}`);
console.log(`Tool: ${TOOLS_PATH}`);

// Ensure expected directories exist
for (const dir of [DATA_DIR, REPORTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created missing directory: ${dir}`);
  }
}

console.log("\n🧩  Beginning Pre-QGate validation batch...");
try {
  const report = await runBatchValidation(DATA_DIR);
  const outPath = path.join(REPORTS_DIR, "Atelier_Loader_Report_v3.2.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n✅  Loader Report saved: ${outPath}`);
  console.log("🚀  Worker process complete. Ready for Master Control submission.\n");
} catch (err) {
  console.error("❌  Pre-QGate validation failed:", err);
  process.exit(1);
}

// -------------------------------------------------------------
// Usage:
//   node index.mjs
//
// Expected structure under /worldforge-data/ATELIER/:
//   ├── index.mjs                  ← this file
//   ├── schemas/visual_lineage_schema.json
//   ├── tools/preqgate_validate.mjs
//   ├── data/visuals/*.json        ← Visual metadata inputs
//   └── reports/                   ← Validation outputs
// -------------------------------------------------------------
