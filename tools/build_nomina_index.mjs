/**
 * Worldforge Nomina Index Builder
 *
 * Builds an index.json for either:
 *   - the current "live" dataset   → /Nomina/live/index.json
 *   - a versioned release dataset  → /Nomina/releases/v3.5.5/index.json
 *
 * Usage:
 *   node tools/build_nomina_index.mjs live
 *   node tools/build_nomina_index.mjs releases/v3.5.5
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const TARGET = process.argv[2] || "live"; // default target
const ROOT = process.cwd();
const BASE = path.join(ROOT, "Nomina", TARGET);
const SHARDS_DIR = path.join(BASE, "shards");
const INDEX_FILE = path.join(BASE, "index.json");

if (!fs.existsSync(SHARDS_DIR)) {
  console.error("❌ Missing shards directory:", SHARDS_DIR);
  process.exit(1);
}

function sha256File(p) {
  const buf = fs.readFileSync(p);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * facet → logical ID mapping
 * personal → core (given names)
 * family   → family (surnames)
 * house    → house  (lineage)
 */
function logicalId(species, facet) {
  if (facet === "personal") return `spec:${species}/core`;
  if (facet === "family")   return `spec:${species}/family`;
  if (facet === "house")    return `spec:${species}/house`;
  return `spec:${species}/${facet}`;
}

/** Recursively walk the shards directory */
const entries = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, f.name);
    if (f.isDirectory()) { walk(abs); continue; }
    if (!f.name.endsWith(".jsonl")) continue;

    // Expect: shards/<species>/<facet>/<letter>.jsonl
    const relFromBase = path.relative(BASE, abs).replace(/\\/g, "/");
    const parts = relFromBase.split("/"); // ["shards","elf","personal","a.jsonl"]
    if (parts.length !== 4 || parts[0] !== "shards") continue;

    const species = parts[1].toLowerCase();
    const facet   = parts[2].toLowerCase();
    const stat    = fs.statSync(abs);

    const relRepo = path.posix.join("Nomina", TARGET, relFromBase);
    entries.push({
      id: logicalId(species, facet),
      path: relRepo,
      url: "/" + relRepo,
      size: stat.size,
      sha256: sha256File(abs)
    });
  }
})(SHARDS_DIR);

entries.sort((a,b)=> a.id.localeCompare(b.id) || a.path.localeCompare(b.path));

const index = {
  module: "Nomina",
  version: TARGET === "live" ? "live" : TARGET.split("/").pop(),
  sha256_bundle: "",
  files: entries,
  generated_on: new Date().toISOString().slice(0,10)
};

fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
console.log(`✅ Wrote ${INDEX_FILE}`);
console.log(`   ${entries.length} shard entries across ${new Set(entries.map(e=>e.id)).size} logical IDs`);
