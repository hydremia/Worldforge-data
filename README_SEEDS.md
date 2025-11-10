# Nomina Seed Shards — Species Layout (v3.3)
Generated: 2025-11-06T06:58:40.306525Z

These seeds are organized **by species only** for broad-phase initialization.

Structure:
```
/LEXICON/NOMINA/sets/
  ├─ human/personal/a.jsonl
  ├─ human/family/a.jsonl
  ├─ human/house/a.jsonl
  ├─ elf/personal/a.jsonl
  ├─ elf/family/a.jsonl
  ├─ elf/house/a.jsonl
  ├─ dwarf/personal/a.jsonl
  ├─ dwarf/family/a.jsonl
  └─ dwarf/house/a.jsonl
```

Culture metadata remains on each entry for later refinement,
but the file hierarchy stays lightweight for now.

Use the same smoke test:
```
curl -s http://127.0.0.1:8787/nomina/suggest \
  -H "content-type: application/json" \
  -d '{"species":["human"],"name_type":"personal","gender":"any","count":5,"seed":"roll_id:test"}'
```
