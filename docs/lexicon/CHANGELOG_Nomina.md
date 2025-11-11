# Worldforge Nomina — Change Log (v3.2 → v3.5.4)

## v3.5.4 — Pronounceability Optimization (current)
- Smoothing of hard clusters and rhythmic syllable normalization.
- Preserved uniqueness (≥0.99) and entry counts (110,072).
- Reports: Pronounceability Summary/Audit + Full Integrity Audit.

## v3.5.3 — Uniqueness Normalization
- Cross-species/type dedup via phonotactic-aware mutations (no deletions).
- Introduced Uniqueness Lock Manifest.
- Per-species uniqueness ≥98.5%, global target ~99%.

## v3.5.2 — Entropy Refinement Baseline
- Balanced rarity and initial phonotactic distancing.
- Established reporting format for audits and summaries.

## Migration Notes
- From 3.2: install 3.5.4 alongside older versions and point loaders to `LEXICON/NOMINA_v3.5.4` (or `LEXICON/current` symlink).
- Maintain 3.5.3 for rollback/diffs; 3.5.2 serves as baseline reference.