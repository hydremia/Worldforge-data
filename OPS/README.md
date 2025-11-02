# Worldforge OPS — Operations & Promotion System

The **Worldforge OPS** module is the infrastructure layer responsible for auditing, validating, and promoting
all official data and GPT builds within the Worldforge v3 ecosystem. OPS enforces structure, parity, and
version integrity across every system — from GPT runtime instructions to world data, campaign capsules, and
character exports.

Each new release, rule update, or data addition passes through the OPS QGate process before becoming canon.
This ensures deterministic version control, reproducibility, and cross-GPT compatibility across all active
Worldforge components (DM, Creator, Atelier, Hub, etc.).

## Directory Overview
| Folder | Purpose |
|--------|----------|
| **core/** | Runtime instructions loaded by the OPS GPT (tone, schema, audit logic). |
| **reports/** | Generated audit artifacts (Loader, QGate, Promotion summaries). |
| **staging/** | Candidate bundles awaiting QGate and promotion. |
| **canon/** | Immutable approved assets, locked once promoted. |
| **failed_promotions/** | Archived failed promotions for rollback or investigation. |
| **logs/OPS/** | Optional long-term archive of all reports. |
| **.github/** | PR template for standardized QGate submissions. |
| **CHANGELOG.md** | Append-only log of all promotions and version bumps. |

---

### OPS Lifecycle Summary
1. **Audit (QGate)** — OPS evaluates new or modified files using a three-tier checklist.  
2. **Promotion** — On PASS, OPS creates a PR moving the files from `/staging/` to `/canon/`.  
3. **Rollback** — On FAIL, OPS archives the attempt in `/failed_promotions/` with diagnostic notes.  
4. **Logging** — Every event appends an entry to `CHANGELOG.md` and emits report artifacts under `/reports/`.

OPS v3.0.0 establishes the canonical baseline for all future system and data updates.

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
