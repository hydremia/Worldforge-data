#!/usr/bin/env python3
# Worldforge Hub v3.0.1 - Hotfix 01 Patch Applier
# Run in the directory containing your Hub v3.0.1 files.
# Usage:  python apply_hotfix_01.py

import re, os, json, shutil

FILES = {
  "skeleton": "v3.0.1_HUB_Routing_Skeleton.js",
  "helper": "v3.0.1_HUB_Routing_Helper.js",
  "guide": "v3.0.1_HUB_Guide_Mode.txt",
  "tone": "v3.0.1_HUB_Tone_Profiles.txt",
  "starters": "v3.0.1_HUB_Starters_Config.json",
}

def bak(path):
  if os.path.exists(path):
    shutil.copy2(path, path + ".bak")

def patch_skeleton(path):
  with open(path, "r", encoding="utf-8") as f:
    s = f.read()

  bak(path)

  # 1) Force versions to v3.0.1
  s = re.sub(r"bridge_version:\s*'v3\.0\.0'", "bridge_version: 'v3.0.1'", s)
  s = re.sub(r"canon_version:\s*'v3\.0\.0'", "canon_version: 'v3.0.1'", s)
  s = re.sub(r"version:\s*'v3\.0\.0'", "version: 'v3.0.1'", s)
  s = s.replace("Matches v3.0.0_HUB_Loader_Report_Template.json", "Matches v3.0.1_HUB_Loader_Report_Template.json")
  s = s.replace("End of v3.0.0 HUB Routing Skeleton", "End of v3.0.1 HUB Routing Skeleton")

  # 2) Replace CONFIG_301 with HUB_STARTERS_CONFIG loader
  s = re.sub(
    r"async\s+function\s+loadStartersConfig\(\)\s*\{[\s\S]*?\}",
    "async function loadStartersConfig() {\n  if (typeof HUB_STARTERS_CONFIG !== 'undefined') return HUB_STARTERS_CONFIG;\n  throw new Error('Starters config not injected (HUB_STARTERS_CONFIG missing)');\n}",
    s
  )

  # 3) Rename the second hubInitFlow (starters-only) to hubRenderStartersInit
  s = re.sub(
    r"export\s+async\s+function\s+hubInitFlow\s*\([^)]*\)\s*\{[\s\S]*?\}\s*$",
    "export async function hubRenderStartersInit({ config, context = 'top_level', render = renderStarters }) {\n  const cfg = config ?? (await loadStartersConfig());\n  const starters = await buildStartersFromConfig(cfg, context);\n  return render(starters.visible);\n}\n",
    s,
    flags=re.DOTALL
  )

  # 4) Ensure ops_mode key exists in report (set to null if absent)
  if "ops_mode" not in s:
    s = s.replace("ops_audit: {", "ops_mode: null,\n    ops_audit: {")

  with open(path, "w", encoding="utf-8") as f:
    f.write(s)

def patch_helper(path):
  with open(path, "r", encoding="utf-8") as f:
    s = f.read()
  bak(path)
  s = re.sub(r"slice\(\s*0\s*,\s*4\s*\)", "slice(0, (config.ui?.max_visible ?? 4))", s)
  with open(path, "w", encoding="utf-8") as f:
    f.write(s)

def patch_text_version(path):
  with open(path, "r", encoding="utf-8") as f:
    s = f.read()
  bak(path)
  s = s.replace("(v3.0.0)", "(v3.0.1)")
  s = s.replace("v3.0.0", "v3.0.1")
  with open(path, "w", encoding="utf-8") as f:
    f.write(s)

def patch_starters(path):
  with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)
  bak(path)

  # Normalize OPEN_GUIDE path
  flows = data.get("flows", {})
  if isinstance(flows, dict) and isinstance(flows.get("OPEN_GUIDE"), list):
    data["flows"]["OPEN_GUIDE"] = [
      "ACTION:LOAD_FILE v3.0.1_HUB_Guide_Mode.txt",
      "ACTION:RETURN to previous context"
    ]

  with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

def main():
  print("Applying Hotfix 01...")
  for key, p in FILES.items():
    if not os.path.exists(p):
      print(f"WARNING: {p} not found, skipping its patch step.")
  if os.path.exists(FILES["skeleton"]):
    patch_skeleton(FILES["skeleton"])
    print("✓ Patched Routing Skeleton")
  if os.path.exists(FILES["helper"]):
    patch_helper(FILES["helper"])
    print("✓ Patched Routing Helper")
  if os.path.exists(FILES["guide"]):
    patch_text_version(FILES["guide"])
    print("✓ Patched Guide Mode versions")
  if os.path.exists(FILES["tone"]):
    patch_text_version(FILES["tone"])
    print("✓ Patched Tone Profiles versions")
  if os.path.exists(FILES["starters"]):
    patch_starters(FILES["starters"])
    print("✓ Patched Starters Config (OPEN_GUIDE path)")
  print("Hotfix 01 applied. Backups saved as .bak")

if __name__ == "__main__":
  main()
