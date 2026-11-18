#!/usr/bin/env python3
"""Compile non-JSON-escaped source prompts and manifest into ST-PresetAssistant SillyTavern preset JSON."""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PKG_PATH = BASE / "package.json"
RAW_DIR = BASE / "raw_data_cache"
MANIFEST_PATH = RAW_DIR / "preset_manifest.json"
OUT_DIR = BASE / "presets"


def main() -> None:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    version = pkg["version"]
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    preset = dict(manifest["preset_config"])
    # Keep internal SillyTavern preset name clean & stable across upgrades
    preset_name = preset.get("name") or "ST-预设助手"
    preset["name"] = preset_name
    preset["preset_name"] = preset_name
    th = preset.setdefault("extensions", {}).setdefault("tavern_helper", {"scripts": [], "variables": {}})
    th.setdefault("variables", {})["st_preset_version"] = version

    prompts = []
    for entry in manifest["prompt_index"]:
        prompt_path = RAW_DIR / entry["file"]
        if not prompt_path.exists():
            raise FileNotFoundError(f"Missing prompt module: {prompt_path}")
        mod = json.loads(prompt_path.read_text(encoding="utf-8"))
        clean_mod = {
            "identifier": mod["identifier"],
            "name": mod["name"],
            "role": mod.get("role", "system"),
            "content": mod.get("content", ""),
            "system_prompt": bool(mod.get("system_prompt", False)),
            "marker": bool(mod.get("marker", False)),
            "forbid_overrides": bool(mod.get("forbid_overrides", False)),
            "enabled": bool(entry["enabled"]),
        }
        if not clean_mod["marker"]:
            clean_mod["injection_position"] = mod.get("injection_position", 0)
            clean_mod["injection_depth"] = mod.get("injection_depth", 4)
            clean_mod["injection_order"] = mod.get("injection_order", 100)
        if "injection_trigger" in mod:
            clean_mod["injection_trigger"] = mod["injection_trigger"]
        prompts.append(clean_mod)

    preset["prompts"] = prompts
    expected_order = [
        {"identifier": e["identifier"], "enabled": bool(e["enabled"])}
        for e in manifest["prompt_index"]
    ]
    preset["prompt_order"] = [
        {"character_id": 100000, "order": expected_order},
        {"character_id": 100001, "order": [dict(x) for x in expected_order]},
    ]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / f"ST-PresetAssistant_V{version}.json"
    out_file.write_text(json.dumps(preset, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[build_preset] Compiled {len(prompts)} modules -> {out_file}")


if __name__ == "__main__":
    main()
