# Ecosystem Guardrails — Quick Guide

## 1) First-time: create baselines after review
```bash
node tools/size_guard.mjs --all --write-manifest
```
This records sizes/hashes in `OPS/Manifests/*.json`.

## 2) On every change: run checks
```bash
node tools/check_banned_terms.mjs
node tools/size_guard.mjs --all
```
- Prints before/after/delta/% per file and fails if a file shrinks by more than 5% (configurable).

## 3) CI
`.github/workflows/qgate.yml` enforces checks on PRs and pushes to main.

## 4) Optional pre-commit hook
Copy one into `.git/hooks/pre-commit`:
- Windows: `OPS/Templates/hooks/pre-commit.cmd`
- macOS/Linux: `OPS/Templates/hooks/pre-commit.sh` (make executable)

## 5) Per-GPT usage
Single GPT:
```bash
node tools/size_guard.mjs --gpt HUB
```
After intended large edits, refresh that GPT's baseline:
```bash
node tools/size_guard.mjs --gpt HUB --write-manifest
```

## 6) Reports
Each run writes a JSON report to `OPS/Reports/size_audit_<timestamp>.json`.

## 7) Threshold
Edit `OPS/Rules/guardrails.json` → `threshold_percent_drop`.
