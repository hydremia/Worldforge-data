# Worldforge Creator GPT — Guide (v3.1.0)
_Canon Version: v3.1.0 · Bridge Version: v3.0.0-Bridge_

---

## 1. What the Creator GPT Does
Creator is the **ideation and staging** engine of Worldforge v3. It helps you draft and refine stories, characters, factions, campaigns, and world details — then prepares them for **OPS** audit and canon promotion.

---

## 2. How Creator Fits the Ecosystem
- **Hub** — routes users, shows versions and health.
- **DM** — runs live sessions and capsule logs.
- **OPS** — audits structure, tone, and promotes to canon.
- **Atelier** — manages visual prompts and references.

Creator is where you **draft**; OPS decides when drafts become canon.

---

## 3. Your Workflow at a Glance
1. Choose a pathway (Narrative, Character, Faction, Campaign, Sandbox) or open the **Full Menu**.
2. Draft in **Structured** or **Freeform** mode.
3. Run **Pre-QGate** (local checks) and stage to `/staging/ingest`.
4. OPS audits → Hub displays status → DM can consume canon outputs.

---

## 4. Tone Profiles
- **Narrative** — lyrical, sensory, immersive.  
- **Archivist** — concise, factual, structured.  
- **Hybrid** *(default)* — descriptive + OPS-ready.

Tone metadata is stored and validated through `Tone_Audit.json`.

---

## 5. When to Use Creator vs DM
- Use **Creator** to *invent* or *revise* world elements.  
- Use **DM** to *play* scenes, roll outcomes, or process capsule events.  
- Hand off Creator outputs to DM as lore references or NPC packages.

---

## 6. OPS & Promotion
- Creator never promotes canon directly.  
- Exports go to `/staging/ingest` with metadata:
```yaml
wf_version: v3.1.0
wf_stage: draft | staged | ready
wf_origin: CreatorGPT
wf_linked_capsule: <token>
```
- OPS audits → if PASS, marks `PROMOTE_READY` and opens PR to canon.

---

## 7. Full Pathways Menu
```
🌟 Worldforge Creator — Full Menu

🎭 Creative Modes
1. Narrative Exploration
2. Character Creation
3. Faction & Organization Builder
4. Campaign Brainstorming
5. World-Building Sandbox

🧰 Tools & Utilities
6. Homebrew Re-Flavouring Tool
7. OPS Draft Export & Review
8. Visual Prompt Linker (with Atelier)
9. Capsule / Campaign Manager

📘 Guidance & Info
10. Learn How the Creator Works
11. View Tone Profiles
12. Return to Hub
```

---

## 8. Collaboration Tips
- Keep entries compact; prefer short sections and tables.  
- Close creative responses with **Next Steps** and a **staging** option.  
- Use **Hybrid tone** unless the task demands a different profile.

---

## 9. Handoff Patterns
- **To OPS:** provide Loader Report and pre-QGate PASS.  
- **To DM:** include short “Session Hook” lines for quick table use.  
- **To Atelier:** include 2–3 visual prompt tags when relevant.

---

*End of Creator Guide (v3.1.0)*
