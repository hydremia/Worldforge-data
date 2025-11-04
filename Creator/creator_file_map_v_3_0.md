# Worldforge Creator GPT — File Map (v3.0.0)
_Last updated: 2025-11-03_

---

## 1. Purpose
The **Creator File Map** provides a manifest of all knowledge files, their functions, and their target size constraints. It supports Loader Report generation and OPS verification during cross-GPT audits.

---

## 2. Canon Metadata
| Field | Value |
|-------|--------|
| **GPT Name** | Worldforge Creator GPT |
| **Canon Version** | v3.0.0 |
| **Bridge Version** | v3.0.0-Bridge |
| **Primary Namespace** | `WF_KV_STAGING` |
| **Maintainers** | OPS GPT · Hub GPT |
| **Worker Endpoint** | https://worldforge-api.hydremia.workers.dev |
| **OPS QGate Rule** | Warn >5% shrink · Block >10% shrink |

---

## 3. Knowledge File Manifest
| File | Purpose | Target Size | Actual Size | Status |
|------|----------|--------------|--------------|---------|
| `v3.0.0_Creator_RuntimeCore_Instructions.txt` | Core logic, routing, and operational directives | ≤ 8 KB | ~6.9 KB | ✅ Complete |
| `v3.0.0_Creator_Modes_Index.txt` | Defines 5 creative modes and routing schema | ≤ 4 KB | ~3.8 KB | ✅ Complete |
| `v3.0.0_Creator_Onboarding.txt` | User welcome, tone setup, and mode menu | ≤ 4 KB | ~3.9 KB | ✅ Complete |
| `v3.0.0_Creator_Tone_Profiles.txt` | Voice calibration and OPS tone audit schema | ≤ 2 KB | ~1.8 KB | ✅ Complete |
| `v3.0.0_Creator_QGate_Checklist.txt` | Local pre-audit validation and OPS handoff | ≤ 2 KB | ~1.9 KB | ✅ Complete |

---

## 4. Loader Report Summary Template
```json
{
  "wf_version": "v3.0.0",
  "bridge_version": "v3.0.0-Bridge",
  "files_loaded": 5,
  "status": "PASS",
  "runtime_char_total": 18700,
  "tone_profiles": ["Narrative", "Archivist", "Hybrid"],
  "ops_ready": true
}
```

---

## 5. OPS Integration Targets
| Process | Endpoint | Expected Output |
|----------|-----------|-----------------|
| **Pre-QGate Check** | `/audit/qgate` | Local PASS/FAIL summary |
| **Staging Export** | `/staging/ingest` | OPS-ready Markdown payload |
| **Promotion Review** | `/staging/review` | OPS changelog diff report |
| **Final Promotion** | `/staging/promote` | Canon update (via OPS approval) |

---

## 6. Version Alignment
| GPT | Version | Function |
|-----|----------|-----------|
| **Hub** | v3.1 | Router & loader orchestration |
| **DM** | v3.0.7 | Narrative runtime engine |
| **OPS** | v3.0.0 | Auditor & promoter |
| **Creator** | v3.0.0 | Ideation & staging engine |
| **Atelier** | v3.0.0 | Visual prompt and canon sync |

---

## 7. File Integrity Rules
- All files must include both **Canon** and **Bridge** headers.
- Char count tracked per update using `size_guard` tool.
- Any variance beyond ±5% must include rationale note in PR.
- OPS QGate report cross-references this manifest to confirm:
  - File presence and checksum match.
  - Header version consistency.
  - Char-count delta under threshold.

---

## 8. Checkpoint Reference
Build registration recorded in Ecosystem Control Thread:
```
#8 — 2025-11-03 | Source: Master Control | Action: Creator GPT Build Authorized under v3 Architecture | Status: ✅
```

---

### End of Creator File Map (v3.0.0)