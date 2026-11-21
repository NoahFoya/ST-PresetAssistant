#!/usr/bin/env python3
"""Sync single-source UI templates, floating panel script & version constant into preset_manifest.json."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PKG_PATH = BASE / "package.json"
MANIFEST_PATH = BASE / "raw_data_cache" / "preset_manifest.json"
UI_DIR = BASE / "raw_data_cache" / "ui"
MAIN_GUIDE_PATH = BASE / "raw_data_cache" / "prompts" / "01_系统框架" / "main.json"
BANNED_WORDS_PATH = BASE / "raw_data_cache" / "banned_words_default.txt"
BANNED_REGEX_ID = "b2c3d4e5-2106-4e8a-9b10-111122220006"
BANNED_REGEX_NAME = "历史禁词清洗"
MAX_BANNED_WORDS = 80
MAX_BANNED_WORD_LEN = 40

SCRIPT_TO_UI = {
    "[美化] 思考": UI_DIR / "draft_card.html",
    "[美化] 状态栏": UI_DIR / "scene_card.html",
    "[美化] 批注": UI_DIR / "comment_card.html",
    "[美化] 小结": UI_DIR / "summary_card.html",
    "[美化] 梳理": UI_DIR / "recap_card.html",
    "[美化] 选择": UI_DIR / "options_card.html",
    "[美化] 正文": UI_DIR / "prose_beautify.html",
}
FLOAT_SCRIPT_FILE = UI_DIR / "floating_panel.js"
FLOAT_SCRIPT_NAME = "🎛️ ST-预设助手悬浮控制面板"


def load_default_banned_words() -> list[str]:
    if not BANNED_WORDS_PATH.exists():
        raise FileNotFoundError(f"Missing default banned words file: {BANNED_WORDS_PATH}")
    seen: set[str] = set()
    words: list[str] = []
    for raw_line in BANNED_WORDS_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        word = line[:MAX_BANNED_WORD_LEN]
        if word in seen:
            continue
        seen.add(word)
        words.append(word)
        if len(words) >= MAX_BANNED_WORDS:
            break
    return words


def escape_js_regex_literal(text: str) -> str:
    return re.sub(r"[.*+?^${}()|[\]\\/]", lambda m: "\\" + m.group(0), text)


def compile_banned_regex(words: list[str]) -> str:
    if not words:
        return "/^(?!)/"
    ordered = sorted(words, key=lambda w: (-len(w), w))
    return "/(?:" + "|".join(escape_js_regex_literal(w) for w in ordered) + ")/gi"


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

    default_banned = load_default_banned_words()
    compiled_banned_re = compile_banned_regex(default_banned)
    th_vars["yd_banned_words"] = default_banned

    synced_banned_re = False
    for item in regex_scripts:
        if item.get("id") == BANNED_REGEX_ID or item.get("scriptName") == BANNED_REGEX_NAME:
            item["id"] = BANNED_REGEX_ID
            item["scriptName"] = BANNED_REGEX_NAME
            item["findRegex"] = compiled_banned_re
            item["replaceString"] = ""
            item["placement"] = [2]
            item["markdownOnly"] = False
            item["promptOnly"] = True
            synced_banned_re = True
            print(f"[sync_ui] Synced regex '{BANNED_REGEX_NAME}' <- {BANNED_WORDS_PATH.name} ({len(default_banned)} words)")
    if not synced_banned_re:
        raise RuntimeError(f"Missing '{BANNED_REGEX_NAME}' entry in preset_manifest.json extensions.regex_scripts")

    if not FLOAT_SCRIPT_FILE.exists():
        raise FileNotFoundError(f"Missing floating panel source: {FLOAT_SCRIPT_FILE}")
    float_code = FLOAT_SCRIPT_FILE.read_text(encoding="utf-8")
    stamped_code = re.sub(
        r'const PRESET_VERSION = "[^"]*";',
        f'const PRESET_VERSION = "{version}";',
        float_code,
        count=1,
    )
    js_words_block = "const DEFAULT_BANNED_WORDS = [\n" + "".join(
        f'    {json.dumps(w, ensure_ascii=False)},\n' for w in default_banned
    ) + "  ];"
    stamped_code = re.sub(
        r"const DEFAULT_BANNED_WORDS = \[[\s\S]*?\];",
        lambda _: js_words_block,
        stamped_code,
        count=1,
    )
    if stamped_code != float_code:
        FLOAT_SCRIPT_FILE.write_text(stamped_code, encoding="utf-8", newline="\n")
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

    expected_order = [
        {"identifier": e["identifier"], "enabled": bool(e["enabled"])}
        for e in manifest.get("prompt_index", [])
    ]
    manifest.setdefault("preset_config", {})["prompt_order"] = [
        {"character_id": 100000, "order": expected_order},
        {"character_id": 100001, "order": [dict(x) for x in expected_order]},
    ]
    print(f"[sync_ui] Synced prompt_order (100000, 100001) <- prompt_index ({len(expected_order)} modules)")

    if MAIN_GUIDE_PATH.exists():
        main_raw = MAIN_GUIDE_PATH.read_text(encoding="utf-8")
        main_mod = json.loads(main_raw)
        next_content = re.sub(
            r"(ST-PresetAssistant\)\s*v)[0-9A-Za-z._-]+",
            rf"\g<1>{version}",
            main_mod.get("content", ""),
            count=1,
        )
        if next_content != main_mod.get("content", ""):
            main_mod["content"] = next_content
            MAIN_GUIDE_PATH.write_text(json.dumps(main_mod, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
            print(f"[sync_ui] Synced main.json guide header -> v{version}")

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("[sync_ui] preset_manifest.json updated successfully.")


if __name__ == "__main__":
    main()
