// Worldforge HUB — Manifest Validator (v3.2.0)
// Purpose: OPS QGate check for hub_dashboard_manifest.json
// Placement: /tools/validate_manifest.js
// Run: node tools/validate_manifest.js

import fs from 'fs';
import path from 'path';
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);


// --------------------------------------
// Load Schema and Manifest
// --------------------------------------
const schemaPath = path.resolve('./schema/hub_dashboard_manifest_schema.json');
const manifestPath = path.resolve('./hub_dashboard_manifest.json');

if (!fs.existsSync(schemaPath)) {
  console.error('\u274C Schema file missing at', schemaPath);
  process.exit(1);
}
if (!fs.existsSync(manifestPath)) {
  console.error('\u274C Manifest file missing at', manifestPath);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// --------------------------------------
// Validate
// --------------------------------------
const validate = ajv.compile(schema);
const valid = validate(manifest);

if (valid) {
  console.log('\u2705 HUB Dashboard manifest schema PASS');
  process.exit(0);
} else {
  console.error('\u26A0\uFE0F HUB Dashboard manifest schema FAIL');
  console.error('Errors:', validate.errors);
  process.exit(2);
}
