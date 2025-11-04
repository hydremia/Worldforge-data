# 🗺️ Worldforge Roadmap Index

_Last updated: 2025-11-04_  
_Parent Architecture: Worldforge v3_  
_Maintained by: Master Control & OPS Systems_

---

## 📘 Purpose

This folder serves as the **single authoritative directory** for all **Master Control planning documents, roadmap updates, and tier transition summaries** across the Worldforge ecosystem.

Each document represents a formal control checkpoint or roadmap revision managed through the **OPS → Master Control → Build Thread** flow.

---

## 📂 Folder Structure

```
/Roadmap
│
├── WF_Tier_1_Wrap_Master_Control_Roadmap_v3.md
│   ↳ Summary of Tier-1 Foundation (v3.0-v3.1)
│
├── WF_Master_Control_v3_2_Planning_with_Archivist.md
│   ↳ Tier-2 Refinement plan (OPS QGate, schema updates, Hub dashboard)
│   ↳ Pull-forward of **Archivist (Lore Curator)** GPT for WorldAnvil import
│
├── ARCHIVIST_README.md
│   ↳ Overview of Archivist GPT (Import MVP) functions and usage
│
├── archivist_import_checklist.md
│   ↳ Step-by-step checklist for WorldAnvil → Worldforge import workflow
│
└── field_map_wa_to_archivist.json
    ↳ Field mapping template for import normalization
```

---

## 🧭 Versioning & Maintenance

| File Type | Naming Convention | Maintainer | Notes |
|------------|-------------------|-------------|--------|
| Master Control Docs | `WF_Master_Control_v<version>_*.md` | Master Control | Tier-to-Tier planning, milestones, dependencies |
| Wrap Docs | `WF_Tier_<n>_Wrap_*.md` | OPS / Master Control | Phase summaries & retrospectives |
| Checklists | `*_checklist.md` | OPS / Archivist | Procedural use only |
| Field Maps | `*_map_*.json` | Archivist | Schema-driven mapping definitions |
| Readme | `ARCHIVIST_README.md` | Archivist | Reference for import sub-systems |

---

## 🔗 Related Directories

- `/schemas` → Shared JSON schemas (Archivist, OPS, Creator, Atelier)  
- `/OPS/Reports` → Audit outputs and promotion logs  
- `/canon` → Published canonical world data (populated by Archivist GPT)  
- `/imports` → Temporary workspace for WorldAnvil export ingestion  

---

## 🧩 Integration Notes

- The **OPS GPT** and **Archivist Agent** both reference this directory to surface current roadmap state.
- The latest active control plan (e.g. `WF_Master_Control_v3_2_Planning_with_Archivist.md`) is used as the **governing document** for ongoing build threads.
- All major roadmap updates are versioned and linked in the Control Log (`#11–#15` for v3.2 cycle).

---

## ✅ Next Actions

1. Store all new planning or wrap docs here upon completion of each build phase.  
2. Reference the active file name in your OPS manifest for visibility.  
3. When Archivist GPT is online, it will catalog this folder under the **Control Index** in `/canon/meta_index.json`.

---

_This directory is part of the Worldforge v3 ecosystem — maintained under Master Control._  
