# Worldforge OPS — CHANGELOG

All notable changes to this repository will be documented in this file.

## [Unreleased]

## [v3.0.0] — OPS Baseline Initialization (2025-11-01)

### Summary
Initial deployment of the Worldforge OPS system — establishing the audit, promotion, and version-control backbone for all GPT and data management processes within the Worldforge v3 ecosystem.

### Highlights
- Created full **OPS directory structure**:
  - `/core/` — runtime instructions loaded into the GPT.
  - `/reports/` — generated audit and loader artifacts.
  - `/staging/` — candidate files awaiting QGate and promotion.
  - `/canon/` — immutable approved assets post-promotion.
  - `/failed_promotions/` — automatic archive of failed promotions.
  - `/logs/OPS/` — optional roll-up for historical reports.
- Added `.github/pull_request_template.md` for QGate-driven PRs.
- Introduced `CHANGELOG.md` as append-only record of promotions.
- Integrated baseline QGate reports confirming:
  - Tier 1 — Structural & Size → PASS  
  - Tier 2 — Parity & Integrity → PASS  
  - Tier 3 — Promotion Readiness → PASS
- Designated this version as **OPS canonical baseline** for v3.x ecosystem builds.

### Notes
- All subsequent OPS, DM, Creator, Atelier, and Hub versions will trace lineage to this baseline.
- GitHub/Cloudflare write automation deferred to OPS Update 2 (post-HUB integration).
- Tag reference: `ops-baseline-v3.0.0`

## [v3.0.0] - 2025-11-02
### Added
- Initialized OPS baseline and repository scaffold.
- Created canonical directory layout for staging, canon, failed promotions, and logs.
- Added PR template for promotion workflows.

### Notes
- Use conventional commits. Example: `feat(ops): promote DM v3.0.7 (QGate PASS; Δ +1.1%)`
