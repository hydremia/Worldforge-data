# Worldforge Creator GPT — QGate Checklist

*Canon Version: v3.0.0 · Bridge Version: v3.0.0-Bridge*\
*Linked Systems: Hub v3.1 · OPS v3.0.0*

---

## 1. Purpose

This checklist defines the **local pre-QGate verification process** performed by the Creator GPT prior to OPS audit submission.\
It ensures all creative outputs meet structure, schema, and size standards before staging to `/staging/ingest`.

---

## 2. Validation Categories

Each draft must pass all categories before OPS submission.

| Category             | Description                                    | Target       | Status |
| -------------------- | ---------------------------------------------- | ------------ | ------ |
| **Structure**        | All required headers and formatting present.   | PASS/FAIL    | [ ]    |
| **Schema**           | Metadata fields valid (version, tone, tags).   | PASS/FAIL    | [ ]    |
| **Tone Audit**       | Tone\_Profile declared & matches OPS schema.   | PASS/FAIL    | [ ]    |
| **Char Count**       | Within ±5% of prior version or under file cap. | ≤8,000 chars | [ ]    |
| **Diff %**           | Change summary logged and explained if >5%.    | ≤5% default  | [ ]    |
| **Export Readiness** | Properly tagged Markdown block (OPS type).     | PASS/FAIL    | [ ]    |

---

## 3. Step-by-Step Pre-QGate Flow

1. **Confirm Version Metadata**\
   Ensure top of file includes:
   ```yaml
   wf_version: v3.0.0
   wf_stage: draft | staged | ready
   wf_origin: CreatorGPT
   wf_linked_capsule: <token>
   tone_profile: Narrative | Archivist | Hybrid
   ```
2. **Run Char Count Check**
   - Calculate character count of current vs. previous revision.
   - If shrink >5%, request rationale.
   - If >10%, block submission pending OPS override.
3. **Validate Structure**
   - Check presence of headers (`##`, `###`).
   - Verify no missing closing code blocks.
   - Ensure table alignment and valid Markdown syntax.
4. **Schema Compliance**
   - Confirm OPS export tag matches mode type (`lore_entry`, `character_profile`, etc.).
   - Verify presence of lore summary or factual notes.
5. **Tone Verification**
   - Confirm `tone_profile` declared.
   - Run internal `Tone_Audit.json` metrics for lexical density and structure.
   - Flag deviation >10% from Hybrid baseline.
6. **Compile Local Loader Report**\
   Summarize checks:
   ```json
   {
     "wf_version": "v3.0.0",
     "status": "PASS",
     "char_diff": "+2.4%",
     "tone_compliance": "PASS",
     "structure": "PASS",
     "schema": "PASS"
   }
   ```
7. **Confirm Export Readiness**
   - Mark draft as `staged` if all checks PASS.
   - Generate `/staging/ingest` payload with header + content block.
   - Log completion: `[Creator Pre-QGate ✅ — ready for OPS audit]`.

---

## 4. OPS Integration Notes

- OPS QGate performs secondary validation and promotion.
- Creator cannot bypass OPS promotion lock.
- If OPS rejects, log reason under `QGate_Report_Failures.md` and re-stage after edits.

---

## 5. Helper Commands (For Internal Use)

| Command          | Function                                     |
| ---------------- | -------------------------------------------- |
| `/run pre-qgate` | Executes full checklist above.               |
| `/diff audit`    | Displays character diff summary.             |
| `/tone check`    | Runs Tone\_Audit and outputs metrics.        |
| `/ops ready`     | Confirms readiness and outputs export block. |

---

## 6. Failure Response Patterns

If pre-QGate fails any stage:

- Display friendly but direct advisory:
  > “⚠️ Structural or schema issue detected. Let’s review before OPS submission.”
- Suggest corrective steps (missing header, size overage, or missing tag).
- Prevent export until issue resolved.

---

## 7. Completion Criteria

A file is **QGate-Ready** when:

- All checklist boxes marked PASS.
- Character difference <5% or justified.
- OPS schema and tone compliance confirmed.
- Loader Report generated and stored locally.

> Final confirmation message: `[Creator QGate v3.0.0 — ✅ All Checks Passed | Ready for OPS Intake]`

---

### End of QGate Checklist (v3.0.0)

