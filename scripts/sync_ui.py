#!/usr/bin/env python3
"""Sync single-source UI templates, floating panel script & version constant into preset_manifest.json."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PKG_PATH = BASE / "package.json"
MANIFEST_PATH = BASE / "raw_data_cache" / "preset_manifest.json"
UI_DIR = BASE / "raw_data_cache" / "ui"

SCRIPT_TO_UI = {
    "[思考] 构思手记": UI_DIR / "draft_card.html",
    "[批注] 段间随记楼": UI_DIR / "comment_card.html",
    "[选择] 行动建议卡片": UI_DIR / "options_card.html",
    "[正文] 对白与排版美化": UI_DIR / "prose_beautify.html",
}
FLOAT_SCRIPT_FILE = UI_DIR / "floating_panel.js"
FLOAT_SCRIPT_NAME = "🎛️ ST-预设助手悬浮控制面板"


def main() -> None:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    version = pkg["version"]

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    ext = manifest.get("preset_config", {}).setdefault("extensions", {})

    regex_scripts = ext.get("regex_scripts", [])
    updated = 0
    for item in regex_scripts:
        name = item.get("scriptName")
        if name in SCRIPT_TO_UI:
            ui_path = SCRIPT_TO_UI[name]
            if not ui_path.exists():
                raise FileNotFoundError(f"Missing UI source file: {ui_path}")
            content = ui_path.read_text(encoding="utf-8").strip()
            item["replaceString"] = content
            updated += 1
            print(f"[sync_ui] Synced regex '{name}' <- {ui_path.name} ({len(content)} chars)")

    if updated != len(SCRIPT_TO_UI):
        raise RuntimeError(f"Expected {len(SCRIPT_TO_UI)} UI regex scripts, synced {updated}")

    th = ext.setdefault("tavern_helper", {"scripts": [], "variables": {}})
    th_vars = th.setdefault("variables", {})
    th_vars["st_preset_version"] = version

    if not FLOAT_SCRIPT_FILE.exists():
        raise FileNotFoundError(f"Missing floating panel source: {FLOAT_SCRIPT_FILE}")
    float_code = FLOAT_SCRIPT_FILE.read_text(encoding="utf-8")
    stamped_code = re.sub(
        r'const PRESET_VERSION = "[^"]*";',
        f'const PRESET_VERSION = "{version}";',
        float_code,
        count=1,
    )
    if stamped_code != float_code:
        FLOAT_SCRIPT_FILE.write_text(stamped_code, encoding="utf-8")
    float_stripped = stamped_code.strip()

    th_scripts = th.setdefault("scripts", [])
    synced_float = False
    for sc in th_scripts:
        if sc.get("name") == FLOAT_SCRIPT_NAME:
            sc["content"] = float_stripped
            synced_float = True
            print(f"[sync_ui] Synced tavern_helper '{FLOAT_SCRIPT_NAME}' v{version} <- {FLOAT_SCRIPT_FILE.name} ({len(float_stripped)} chars)")
    if not synced_float:
        raise RuntimeError(f"Missing '{FLOAT_SCRIPT_NAME}' entry in preset_manifest.json extensions.tavern_helper.scripts")

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("[sync_ui] preset_manifest.json updated successfully.")


if __name__ == "__main__":
    main()
