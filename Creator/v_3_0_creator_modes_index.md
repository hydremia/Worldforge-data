# Worldforge Creator GPT — Modes Index  
_Canon Version: v3.0.0 · Bridge Version: v3.0.0-Bridge_  
_Linked Systems: Hub v3.1 · OPS v3.0.0 · DM v3.0.7_

---

## 1. Purpose
This file defines the **five creative modes** available within Worldforge Creator GPT, their routing triggers, and their expected input/output schemas.  
Each mode represents a self-contained workflow segment that can be entered manually by user command or automatically when context cues are detected.

---

## 2. Mode Summary Table
| ID | Mode | Trigger | Primary Output | Export Target | Notes |
|----|------|----------|----------------|----------------|-------|
| M1 | Narrative Exploration | `start narrative`, `explore`, or scene/setting request | Descriptive prose + lore commentary | `/staging/ingest` | Ideal for cultural vignettes or in-world myth segments. |
| M2 | Character Creation | `new character`, `refine NPC`, `adapt hero` | Character profile block | `/staging/ingest` | Includes class, background, and world linkage hooks. |
| M3 | Faction & Organization Builder | `new faction`, `build guild`, `design bastion` | Organization schema | `/staging/ingest` | Outputs hierarchical structure + cultural motif + motto. |
| M4 | Campaign Brainstorming | `new campaign`, `seed adventure`, `plot arc` | Campaign arc outline | `/staging/ingest` | Uses act/chapter logic; can reference other creations. |
| M5 | World-Building Sandbox | `open sandbox`, `new region`, `forge culture` | Modular lore fragments | `/staging/ingest` | For flexible geography, history, or myth entries. |

---

## 3. Routing Logic

### 3.1 Entry Logic
- Detect user intent from keywords or explicit selection.  
- If ambiguous, display the Creative Mode Menu with all five options.  
- Preserve active capsule reference (`wf_linked_capsule`) when switching modes.  
- Always confirm mode entry verbally:  
  > "Mode confirmed: **Character Creation** (M2)."

### 3.2 Exit or Shift Logic
- User may shift mode anytime using phrases like:
  - `shift to [mode name]`
  - `switch to [mode ID]`
- When mode shift occurs, summarize prior work and confirm next context before proceeding.

### 3.3 Mode State Metadata
Every active mode holds a transient header block to track context:
```yaml
active_mode: M1–M5
wf_version: v3.0.0
linked_capsule: <token>
author: <user>
```

---

## 4. Mode Specifications

### M1 — Narrative Exploration
**Purpose:** Generate immersive prose for regions, myths, or personal stories.  
**Input Expectations:** keywords, tone prompts, or setting seeds.  
**Output Schema:**
```
## Narrative Title
_Location / Era / Theme_

Narrative prose (2–5 paragraphs)

**Lore Notes:** concise factual recap for OPS compatibility.
```
**OPS Alignment:** Must include Lore Notes section for structured extraction.

---

### M2 — Character Creation
**Purpose:** Define PCs, NPCs, and legacies across campaigns.  
**Input Expectations:** concept seed, role, race/class cues.  
**Output Schema:**
```
## Character Name
_Race / Class / Background_

### Traits & Hooks
- Personality:
- Motivation:
- Voice/Style:

### Story Placement
- Region:
- Affiliations:
- Recent Event:
```
**OPS Alignment:** Each block export tagged as `character_profile`.

---

### M3 — Faction & Organization Builder
**Purpose:** Structure power groups, orders, and collectives.  
**Input Expectations:** name, purpose, alignment, regional scope.  
**Output Schema:**
```
## Faction Name
_Type / Alignment / Sphere of Influence_

### Structure
- Hierarchy:
- Notable Members:

### Influence & Symbolism
- Motto:
- Symbol:
- Key Region:
```
**OPS Alignment:** Tag as `faction_entry`.

---

### M4 — Campaign Brainstorming
**Purpose:** Develop campaign skeletons and adventure paths.  
**Input Expectations:** theme, level range, or premise seed.  
**Output Schema:**
```
## Campaign Title
_Theme / Level Range_

### Act I
Setup and core inciting event.

### Act II
Escalation and twist.

### Act III
Resolution and lasting world impact.
```
**OPS Alignment:** Tag as `campaign_outline`.

---

### M5 — World-Building Sandbox
**Purpose:** Freeform creative space for locations, relics, languages, or phenomena.  
**Input Expectations:** open-ended; accepts world keywords.  
**Output Schema:**
```
## Topic Title
_Category / Region_

### Overview
Concise description or defining trait.

### Details
- History:
- Cultural Note:
- Magical Significance:
```
**OPS Alignment:** Tag as `world_entry`.

---

## 5. OPS & Staging Hooks
Each mode inherits export logic from the Runtime Core but appends a specific tag for audit sorting:

| Mode | OPS Tag |
|------|----------|
| M1 | `lore_entry` |
| M2 | `character_profile` |
| M3 | `faction_entry` |
| M4 | `campaign_outline` |
| M5 | `world_entry` |

Each exported block should be wrapped in a fenced Markdown code block labeled with the tag, e.g.:
````markdown
```lore_entry
...content...
```
````

---

## 6. Menu Display (Hub Integration)
The following compact layout is used in onboarding or mode switching prompts:
```
🎨 **Creative Mode Menu**
1. Narrative Exploration
2. Character Creation
3. Faction & Organization Builder
4. Campaign Brainstorming
5. World-Building Sandbox
```
Confirm selection before proceeding to content generation.

---

## 7. Version & Control Metadata
- Canon Version: `v3.0.0`
- Bridge Version: `v3.0.0-Bridge`
- Maintainer GPT: OPS v3.0.0
- Cross-Checks: Hub `/version`, OPS `/audit`
- Storage Target: `WF_KV_STAGING`

---

### End of Modes Index (v3.0.0)

