
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(process.cwd());
const ajv = new Ajv2020({
  strict: false,
  allErrors: true
});

addFormats(ajv);

const files = [
  'schemas/archivist_voice_profile.json',
  'schemas/archivist_entry_schema.json',
  'schemas/archivist_review_packet.json',
  'LEXICON/NOMINA/schemas/nomina_entry_schema.json',
  'LEXICON/NOMINA/schemas/nomina_request_schema.json'
];

let ok = true;
for (const rel of files) {
  const p = path.join(root, rel);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (/_schema\.json$/.test(rel)) {
      try {
        ajv.compile(data);
        console.log('✅ schema OK:', rel);
      } catch (e) {
        ok = false;
        console.error('❌ schema FAIL:', rel);
        if (e && e.message) console.error(e.message);
      }
    } else {
      console.log('ℹ️ JSON loaded:', rel);
    }
  } catch (e) {
    ok = false;
    console.error('❌ read FAIL:', rel, e.message);
  }
}
if (!ok) process.exit(1);
