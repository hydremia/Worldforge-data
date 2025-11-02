# Worldforge OPS Repository Scaffold

This scaffold provides the minimal structure for running OPS audits (QGate) and promotions.

## Folders
- `/staging/<GPT>/<version>/` — candidates awaiting promotion.
- `/canon/<GPT>/<version>/` — immutable, approved artifacts.
- `/failed_promotions/` — auto-archived failed attempts with reason and pointers.
- `/logs/OPS/` — optional roll-up copies of reports (historical).

## Conventions
- Versioned filename prefixes: `v3.0.0_File_Name.ext`
- Reports live under `/OPS/reports/` in your working repo; promote copies to `/canon/OPS/<version>/` when finalized.
- Use the PR template in `.github/pull_request_template.md` for all promotions.
