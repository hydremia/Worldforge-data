import crypto from "node:crypto";
import fs from "node:fs";
import https from "node:https";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main() {
  const manifestPath = process.argv[2]; // e.g., Nomina/v3.5.5/index.json
  const logicalId = process.argv[3];    // e.g., spec:elf/core
  if (!manifestPath || !logicalId) {
    console.error("Usage: node tools/verify_fetch.mjs <index.json> <logical-id>");
    process.exit(1);
  }
  const idx = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const item = idx.files.find(f => f.id === logicalId);
  if (!item) throw new Error(`Logical ID not found: ${logicalId}`);
  const url = item.url.startsWith("http") ? item.url : `https://data.worldforge.io${item.url}`;
  const buf = await fetchUrl(url);
  const sha = crypto.createHash("sha256").update(buf).digest("hex");
  if (item.sha256 && sha !== item.sha256) {
    console.error(`FAIL: sha256 mismatch\n expected=${item.sha256}\n actual  =${sha}`);
    process.exit(2);
  }
  console.log(`PASS: ${logicalId} @ ${url} (sha256=${sha}, size=${buf.length})`);
}
main().catch(e => { console.error(e); process.exit(3); });
