#!/usr/bin/env python3
"""Static, multi-persona state-machine, and V8 RegExp verification gate for 悦读助手 (Errors: 0 required)."""
import json
import re
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PKG_PATH = BASE / "package.json"
RAW_DIR = BASE / "raw_data_cache"
MANIFEST_PATH = RAW_DIR / "preset_manifest.json"
UI_DIR = RAW_DIR / "ui"


class Verifier:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, msg: str) -> None:
        self.errors.append(msg)
        print(f"  [ERROR] {msg}")

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)
        print(f"  [WARN]  {msg}")

    def ok(self, msg: str) -> None:
        print(f"  [OK]    {msg}")


def strip_quotes(text: str) -> str:
    text = re.sub(r"“[^”]*”", "", text)
    text = re.sub(r'"[^"]*"', "", text)
    return text


def main() -> int:
    v = Verifier()
    print("=== Running Verification Gate for Presets/ST-PresetAssistant ===")

    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    version = pkg["version"]
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    preset_cfg = manifest["preset_config"]
    prompt_index = manifest["prompt_index"]

    # 1. Version & Name synchronization
    print("\n[1/8] Checking version & name synchronization...")
    if preset_cfg.get("name") != "ST-预设助手" or preset_cfg.get("preset_name") != "ST-预设助手":
        v.err("preset_manifest.json name must stay clean 'ST-预设助手' without version glued into name")
    th_ver = preset_cfg.get("extensions", {}).get("tavern_helper", {}).get("variables", {}).get("st_preset_version")
    if th_ver != version:
        v.err(f"st_preset_version variable mismatch: {th_ver} != {version}")

    guide_mod = json.loads((RAW_DIR / "prompts/01_系统框架/yd_top_user_guide.json").read_text(encoding="utf-8"))
    if f"v{version}" not in guide_mod["content"]:
        v.err(f"yd_top_user_guide.json missing v{version}")

    for doc_name in ("README.md", "CHANGELOG.md"):
        doc_path = BASE / doc_name
        if not doc_path.exists():
            v.err(f"Missing {doc_name}")
        elif version not in doc_path.read_text(encoding="utf-8"):
            v.err(f"{doc_name} missing v{version}")

    out_preset_path = BASE / "presets" / f"ST-PresetAssistant_preset_v{version}.json"
    if not out_preset_path.exists():
        v.err(f"Missing compiled preset file: {out_preset_path}")
    else:
        compiled = json.loads(out_preset_path.read_text(encoding="utf-8"))
        if compiled.get("name") != "ST-预设助手":
            v.err(f"Compiled preset name must be 'ST-预设助手', got {compiled.get('name')}")
        comp_ver = compiled.get("extensions", {}).get("tavern_helper", {}).get("variables", {}).get("st_preset_version")
        if comp_ver != version:
            v.err(f"Compiled preset st_preset_version {comp_ver} != {version}")
        if len(compiled.get("prompts", [])) != len(prompt_index):
            v.err(f"Compiled preset prompt count {len(compiled.get('prompts', []))} != {len(prompt_index)}")
        v.ok(f"ST-预设助手 v{version} synchronized cleanly across package, manifest, guide, docs & compiled JSON.")

    # 2. Module integrity (57 modules), zero orphans, prompt_order parity
    print("\n[2/8] Checking 57 modules & prompt_order parity...")
    if len(prompt_index) != 57:
        v.err(f"Expected 57 modules in prompt_index, got {len(prompt_index)}")

    indexed_files = set()
    mods_by_id = {}
    for entry in prompt_index:
        fpath = RAW_DIR / entry["file"]
        indexed_files.add(fpath.resolve())
        if not fpath.exists():
            v.err(f"Missing prompt file: {entry['file']}")
            continue
        mod = json.loads(fpath.read_text(encoding="utf-8"))
        mods_by_id[mod["identifier"]] = mod
        if mod["identifier"] != entry["identifier"] or mod["name"] != entry["name"] or mod["enabled"] != entry["enabled"]:
            v.err(f"Index drift on {entry['identifier']} ({entry['file']})")

    disk_files = {p.resolve() for p in (RAW_DIR / "prompts").rglob("*.json")}
    orphans = disk_files - indexed_files
    if orphans:
        v.err(f"Orphan prompt files not in prompt_index: {[p.name for p in orphans]}")

    expected_order = [{"identifier": e["identifier"], "enabled": e["enabled"]} for e in prompt_index]
    orders = preset_cfg.get("prompt_order", [])
    if [o.get("character_id") for o in orders] != [100000, 100001]:
        v.err("prompt_order must contain [100000, 100001]")
    for o in orders:
        if o.get("order") != expected_order:
            v.err(f"prompt_order[{o.get('character_id')}] drifted from prompt_index")
    if not v.errors:
        v.ok(f"All {len(prompt_index)} modules verified cleanly with zero drift.")

    # 3. 6-Block XML skeleton & initial defaults (Lilith + Erotica)
    print("\n[3/8] Checking 6-block XML skeleton & initial default states...")
    ids = [e["identifier"] for e in prompt_index]
    skeleton = [
        "yd_top_user_guide", "yd_persona_lilith", "yd_persona_lingyin", "main",
        "story_setting_open", "worldInfoBefore", "personaDescription", "charDescription",
        "charPersonality", "scenario", "worldInfoAfter", "dialogueExamples", "story_setting_close",
        "chat_history_open", "chatHistory", "chat_history_close",
        "yd_writing_spec_init", "yd_writing_spec_render",
        "yd_exec_rules_open", "yd_exec_rules_close", "yd_prefill_draft",
    ]
    positions = [ids.index(k) for k in skeleton]
    if positions != sorted(positions):
        v.err(f"6-block skeleton order broken: {positions}")

    def check_radio(prefix: str, expected_on: set[str], label: str) -> None:
        group = [e for e in prompt_index if e["identifier"].startswith(prefix)]
        if not group:
            v.err(f"Missing radio group {label} ({prefix}*)")
            return
        on_ids = {e["identifier"] for e in group if e["enabled"]}
        if on_ids != expected_on:
            v.err(f"{label} default mismatch: got {on_ids}, expected {expected_on}")

    check_radio("yd_persona_", {"yd_persona_lilith"}, "人设")
    if any(e["identifier"].startswith("yd_rule_") for e in prompt_index):
        v.err("Redundant yd_rule_* exclusive rules must not exist")
    check_radio("yd_style_", {"yd_style_erotica"}, "[文风]")
    check_radio("yd_pov_", {"yd_pov_3rd_limited"}, "[视角]")
    check_radio("yd_pace_", {"yd_pace_auto"}, "[节奏]")
    check_radio("yd_focus_", {"yd_focus_balance"}, "[侧重]")
    check_radio("yd_nsfw_bias_", set(), "[NSFW倾向]")
    check_radio("yd_nsfw_detail_", set(), "[NSFW细化]")
    check_radio("yd_length_", {"yd_length_medium"}, "[篇幅]")

    expected_pov_order = ["yd_pov_1st", "yd_pov_2nd", "yd_pov_3rd_limited", "yd_pov_omniscient"]
    actual_pov_order = [e["identifier"] for e in prompt_index if e["identifier"].startswith("yd_pov_")]
    if actual_pov_order != expected_pov_order:
        v.err(f"yd_pov order mismatch: {actual_pov_order} != {expected_pov_order}")

    expected_pace_order = ["yd_pace_slow", "yd_pace_auto", "yd_pace_fast", "yd_pace_jump"]
    actual_pace_order = [e["identifier"] for e in prompt_index if e["identifier"].startswith("yd_pace_")]
    if actual_pace_order != expected_pace_order:
        v.err(f"yd_pace order mismatch: {actual_pace_order} != {expected_pace_order}")

    expected_focus_order = ["yd_focus_balance", "yd_focus_dialogue", "yd_focus_action", "yd_focus_psychology", "yd_focus_environment"]
    actual_focus_order = [e["identifier"] for e in prompt_index if e["identifier"].startswith("yd_focus_")]
    if actual_focus_order != expected_focus_order:
        v.err(f"yd_focus order mismatch: {actual_focus_order} != {expected_focus_order}")

    prefill = mods_by_id.get("yd_prefill_draft", {})
    if prefill.get("enabled") is not False or prefill.get("role") != "assistant" or "continue" in prefill.get("triggers", []):
        v.err("yd_prefill_draft must stay disabled, role=assistant, and exclude 'continue'")

    for lid, hint in [("yd_length_short", "1~2 串"), ("yd_length_medium", "2~4 串"), ("yd_length_long", "3~5 串")]:
        if f"{{{{setvar::length_comment_hint::{hint}}}}}" not in mods_by_id[lid]["content"]:
            v.err(f"{lid} missing length_comment_hint::{hint}")
    v.ok("6-block skeleton & Lilith+Erotica initial defaults verified.")

    # 4. Content contracts, XML self-containment, zero meta-leaks, zero jargon, 3rd-person demos
    print("\n[4/8] Checking XML isolation, meta-leaks, jargon & 8 style demos...")
    for pid, expected_name in [("yd_persona_lilith", "莉莉丝"), ("yd_persona_lingyin", "泠音")]:
        p_mod = mods_by_id[pid]
        p_txt = p_mod["content"]
        if not p_mod.get("system_prompt") or p_mod.get("role") != "system":
            v.err(f"{pid} must be role=system, system_prompt=true")
        if "<助手设定>" not in p_txt or "</助手设定>" not in p_txt:
            v.err(f"{pid} missing self-contained <助手设定>...</助手设定> tags")
        if "assistant_name" in p_txt:
            v.err(f"{pid} should not carry unused assistant_name setvar patch")
        for task_leak in ("<故事设定>", "<叙事约定>", "<执行规则>", "※", "推演"):
            if task_leak in p_txt:
                v.err(f"{pid} must not leak downstream tag/task '{task_leak}'")

    main_txt = mods_by_id["main"]["content"]
    if not main_txt.startswith("<核心准则>") or not main_txt.rstrip().endswith("</核心准则>"):
        v.err("main.json must be wrapped in <核心准则>...</核心准则>")
    if "###" in main_txt:
        v.err("main.json must use flat ## sections without ### subheadings")
    for expected_h2 in ("## 创作边界", "## 玩家边界", "## 世界与角色推演", "## 叙事展开与表达"):
        if expected_h2 not in main_txt:
            v.err(f"main.json missing flat heading '{expected_h2}'")
    for bad_patch in ("<助手设定>", "若未启用", "客观专业小说家", "master /"):
        if bad_patch in main_txt:
            v.err(f"main.json must be self-consistent without patch '{bad_patch}'")
    if main_txt.count("道德说教") > 1:
        v.err("main.json repeats '道德说教'")
    if "自然收尾" in main_txt:
        v.err("main.json should leave抉择收尾 solely in yd_output_format_and_note.json")

    gen_txt = mods_by_id["yd_writing_spec_general"]["content"]
    if "※" in gen_txt:
        v.err("yd_writing_spec_general.json must not leak '※'")

    cmt_feat = mods_by_id["yd_feat_inline_comment"]["content"]
    for req in ("※ 署名：", "{{getvar::length_comment_hint}}", "严禁代写读者或用户的批注行", "{{setvar::cot_addons::### 随记与批注核对"):
        if req not in cmt_feat:
            v.err(f"yd_feat_inline_comment.json missing '{req}'")
    if "assistant_name" in cmt_feat or "assistant_name" in guide_mod["content"]:
        v.err("Unused assistant_name patch must be removed")
    if "  - **" in cmt_feat:
        v.err("yd_feat_inline_comment.json must use flat bullets instead of 2-space nested bold sub-bullets")

    out_note = mods_by_id["yd_output_format_and_note"]["content"]
    if "把主动权交还玩家" not in out_note:
        v.err("yd_output_format_and_note.json missing '把主动权交还玩家'")
    if "persona_exec_rule" in out_note or "persona_exec_rule" in mods_by_id["yd_exec_rules_open"]["content"]:
        v.err("Redundant persona_exec_rule slot must be removed")

    for povid in ("yd_pov_1st", "yd_pov_2nd", "yd_pov_3rd_limited", "yd_pov_omniscient"):
        p_mod = mods_by_id[povid]
        for bad_pov in ("我=玩家", "你=玩家", "统一转为", "自动转为", "严守玩家边界"):
            if bad_pov in p_mod["name"] or bad_pov in p_mod["content"]:
                v.err(f"{povid} contains redundant patch wording '{bad_pov}'")

    for nid in ("yd_nsfw_bias_neutral", "yd_nsfw_bias_male", "yd_nsfw_bias_female", "yd_nsfw_detail_diversity"):
        n_mod = mods_by_id[nid]
        if "情欲强化" in n_mod["name"] or "情欲描写" in n_mod["content"] or "情欲表现多样性" in n_mod["content"]:
            v.err(f"{nid} still contains euphemistic wording")
        if "[NSFW" not in n_mod["name"]:
            v.err(f"{nid} name should use [NSFW倾向]/[NSFW细化]")

    for mod in mods_by_id.values():
        mname = mod["name"]
        if mod["identifier"].startswith("yd_") and not mod["identifier"].endswith(("_open", "_close", "_init", "_render")):
            if not mname.startswith("["):
                v.err(f"Uniform [分类] 选项名 naming required for {mod['identifier']}, got '{mname}'")
        for old_term in ("极慢特写", "高速快进", "肢体互动", "剧情抗重复", "肉文写手腔"):
            if old_term in mname or old_term in mod.get("content", ""):
                v.err(f"Deprecated wording '{old_term}' found in {mod['identifier']}")

    cot_unified = mods_by_id["yd_cot_unified"]["content"]
    cot_draft = mods_by_id["yd_cot_output_draft"]["content"]
    if re.search(r"^\d+\.", cot_unified, re.MULTILINE):
        v.err("yd_cot_unified.json must use ### Markdown headings instead of numbered 1.~5.")
    if cot_unified.count("### ") != 5:
        v.err("yd_cot_unified.json must have exact 5 ### subsections")
    for coupled in ("※", "<options>", "明确成年人"):
        if coupled in cot_unified or coupled in cot_draft:
            v.err(f"CoT modules must remain decoupled without '{coupled}'")

    meta_leaks = ["角色卡", "模型", "前端", "自我审查", "三流", "久经沙场", "目标AI", "SillyTavern"]
    banned_jargon = ["伤势消耗", "外貌符号", "悬空对话", "物理消耗"]
    for mod in mods_by_id.values():
        txt = mod.get("content", "")
        for bj in banned_jargon:
            if bj in txt:
                v.err(f"Banned coined jargon '{bj}' found in {mod['identifier']}")
        if mod["identifier"] != "yd_top_user_guide":
            for ml in meta_leaks:
                if ml in txt:
                    v.err(f"Meta-cognition/authorial leak '{ml}' found in {mod['identifier']}")

    style_ids = [e["identifier"] for e in prompt_index if e["identifier"].startswith("yd_style_")]
    if len(style_ids) != 8:
        v.err(f"Expected 8 shared styles, found {len(style_ids)}")
    for sid in style_ids:
        sc = mods_by_id[sid]["content"]
        if "### 语感示范" not in sc:
            v.err(f"{sid} missing ### 语感示范")
            continue
        demo = sc.split("### 语感示范", 1)[1]
        for ex in ("示例 1：", "示例 2：", "示例 3："):
            if ex not in demo:
                v.err(f"{sid} missing {ex}")
        if "我" in strip_quotes(demo):
            v.err(f"Unquoted first-person '我' leaked in narration of {sid}")
    v.ok("XML boundaries, zero leaks, flat formatting & all 8 3rd-person style demos passed.")

    # 5. Single-source UI & TavernHelper script sync
    print("\n[5/8] Checking single-source UI, full-floor editing & TavernHelper sync...")
    ext = preset_cfg["extensions"]
    scripts = ext["regex_scripts"]
    scripts_by_name = {s["scriptName"]: s for s in scripts}
    ui_map = {
        "💭 构思手记折叠": "draft_card.html",
        "💬 段间随记与批注卡片": "comment_card.html",
        "🎯 行动选项交互卡片": "options_card.html",
    }
    for sname, fname in ui_map.items():
        sc = scripts_by_name.get(sname)
        if not sc:
            v.err(f"Missing regex script '{sname}'")
        elif sc["replaceString"] != (UI_DIR / fname).read_text(encoding="utf-8").strip():
            v.err(f"Out-of-sync UI replaceString for '{sname}' vs {fname}")

    cleaner = scripts_by_name.get("🧹 历史手记与选项清洗", {})
    if not cleaner or "※" in cleaner.get("findRegex", "") or "<note" not in cleaner.get("findRegex", ""):
        v.err("History cleaner must strip <draft>/<options>/<note> and NEVER match ※")

    cmt_html = (UI_DIR / "comment_card.html").read_text(encoding="utf-8")
    if "if (isMaster)" in cmt_html or "isMaster && editingFloorIdx" in cmt_html:
        v.err("comment_card.html must allow editing/deleting ALL floors (including AI foreshadowing)")
    for req in ("setChatMessages", 'refresh: "none"', "findCommentBlocksInMessage", "isWriting", "ll-reply-role"):
        if req not in cmt_html:
            v.err(f"comment_card.html missing '{req}'")

    th_scripts = ext.get("tavern_helper", {}).get("scripts", [])
    if not th_scripts or th_scripts[0].get("name") != "🎛️ ST-预设助手悬浮控制面板":
        v.err("Missing extensions.tavern_helper.scripts[0] '🎛️ ST-预设助手悬浮控制面板'")
    elif th_scripts[0].get("content") != (UI_DIR / "floating_panel.js").read_text(encoding="utf-8").strip():
        v.err("Out-of-sync floating_panel.js in preset_manifest.json")
    v.ok("All 4 single-source UI/script files synchronized and verified.")

    # 6. Node V8 syntax checks
    print("\n[6/8] Running Node.js V8 syntax check on HTML & floating_panel.js...")
    js_syntax = r"""
const fs = require('fs');
const vm = require('vm');
const dir = process.argv[2];
for (const f of ['comment_card.html', 'options_card.html', 'preview.html']) {
  const html = fs.readFileSync(dir + '/' + f, 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  scripts.filter(m => m[1].trim()).forEach((m, i) => new vm.Script(m[1], { filename: f + '#' + i }));
}
new vm.Script(fs.readFileSync(dir + '/floating_panel.js', 'utf8'), { filename: 'floating_panel.js' });
console.log('SYNTAX_OK');
"""
    r_syn = subprocess.run(["node", "-", str(UI_DIR)], input=js_syntax, text=True, capture_output=True, encoding="utf-8")
    if r_syn.returncode != 0 or "SYNTAX_OK" not in r_syn.stdout:
        v.err(f"JS syntax check failed: {r_syn.stderr or r_syn.stdout}")
    else:
        v.ok("All UI scripts & floating_panel.js compiled cleanly under V8.")

    # 7. Node V8 Unit Tests on floating_panel.js state machine (themes, NSFW mutex, relative position, labels)
    print("\n[7/8] Running V8 unit tests for floating_panel.js state machine...")
    engine_test = r"""
const assert = require('assert');
const eng = require(process.argv[2]);

assert.strictEqual(eng.PRESET_VERSION, '0.1.0');
assert.strictEqual(eng.resolveVersionLabel({ extensions: { tavern_helper: { variables: { st_preset_version: '0.1.0' } } } }), 'v0.1.0');
assert.strictEqual(eng.resolveVersionLabel({}), 'v0.1.0');
assert.strictEqual(eng.GITHUB_CHANGELOG_URL, 'https://github.com/NoahFoya/ST-PresetAssistant/blob/main/CHANGELOG.md');
assert.strictEqual(eng.compareSemver('0.2.0', '0.1.0'), 1);
assert.strictEqual(eng.compareSemver('0.1.10', '0.1.2'), 1);
assert.strictEqual(eng.compareSemver('v0.1.0', '0.1.0'), 0);
assert.strictEqual(eng.compareSemver('0.0.9', '0.1.0'), -1);
assert.strictEqual(eng.stripOptionLabel('[思考] 输出草稿面板'), '输出草稿面板');
assert.strictEqual(eng.stripOptionLabel('[思考] 基本推理'), '基本推理');
assert.strictEqual(eng.stripOptionLabel('[思考] 预填充草稿 (Prefill)'), '预填充草稿 (Prefill)');
assert.strictEqual(eng.stripOptionLabel('[NSFW倾向] 男性向'), '男性向');
assert.deepStrictEqual(
  eng.PANEL_SECTIONS.map(s => s.key),
  ['style', 'pov', 'pace', 'focus', 'nsfw_bias', 'nsfw_detail', 'length', 'feat', 'cot'],
  'PANEL_SECTIONS must follow Core -> Narrative -> Execution order cleanly'
);

const mockPreset = {
  extensions: { tavern_helper: { scripts: [], variables: {} } },
  prompts: [
    { id: 'yd_persona_lilith', name: '[人设] 莉莉丝', enabled: true },
    { id: 'yd_persona_lingyin', name: '[人设] 泠音', enabled: false },
    { id: 'custom_uuid_999', name: '[人设] 克里姆', enabled: false },
    { id: 'yd_nsfw_bias_neutral', name: '[NSFW倾向] 无倾向', enabled: false },
    { id: 'yd_nsfw_bias_male', name: '[NSFW倾向] 男性向', enabled: false },
    { id: 'yd_nsfw_bias_female', name: '[NSFW倾向] 女性向', enabled: false },
    { id: 'yd_nsfw_detail_diversity', name: '[NSFW细化] 反应多样性', enabled: false },
  ]
};
const samplePrompts = mockPreset.prompts;

const discovered = eng.discoverPersonas(samplePrompts);
assert.strictEqual(discovered.length, 4, 'Should discover lilith, lingyin, 1 custom, none');
assert.strictEqual(discovered.find(p => p.key === 'none').label, '不启用');
assert.strictEqual(eng.resolveActivePersona(samplePrompts).key, 'lilith');
assert.strictEqual(eng.getPersonaTheme(eng.resolveActivePersona(samplePrompts), {}).accent, '#d46b94');

// Bind custom accent color to Lilith, then switch to Lingyin and back
eng.writePresetThemeBinding(mockPreset, 'lilith', '#c69352');
let active = eng.applyPersonaSelection(samplePrompts, 'lingyin');
assert.strictEqual(eng.getPersonaTheme(active, eng.readPresetThemes(mockPreset)).accent, '#5fa0d0');
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_persona_lingyin').enabled, true);
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_persona_lilith').enabled, false);

// Switch back to Lilith -> Lilith keeps #c69352!
active = eng.applyPersonaSelection(samplePrompts, 'lilith');
assert.strictEqual(eng.getPersonaTheme(active, eng.readPresetThemes(mockPreset)).accent, '#c69352');

// Switch to 不启用 (none) -> none slate theme, all preset personas disabled
active = eng.applyPersonaSelection(samplePrompts, 'none');
assert.strictEqual(active.key, 'none');
assert.strictEqual(eng.getPersonaTheme(active, eng.readPresetThemes(mockPreset)).accent, '#828c9c');
assert.strictEqual(samplePrompts.filter(p => p.id.includes('persona') && p.enabled).length, 0);

// NSFW bias mutex + toggle-off + independent NSFW detail
const biasSec = eng.PANEL_SECTIONS.find(s => s.key === 'nsfw_bias');
const detailSec = eng.PANEL_SECTIONS.find(s => s.key === 'nsfw_detail');
eng.applySectionToggle(samplePrompts, biasSec, 'yd_nsfw_bias_male');
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_nsfw_bias_male').enabled, true);
eng.applySectionToggle(samplePrompts, biasSec, 'yd_nsfw_bias_female');
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_nsfw_bias_male').enabled, false);
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_nsfw_bias_female').enabled, true);
eng.applySectionToggle(samplePrompts, biasSec, 'yd_nsfw_bias_female');
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_nsfw_bias_female').enabled, false);
eng.applySectionToggle(samplePrompts, detailSec, 'yd_nsfw_detail_diversity');
assert.strictEqual(samplePrompts.find(p => p.id === 'yd_nsfw_detail_diversity').enabled, true);

// 2D relative position preservation without edge snap
const ratios = eng.posToRatio(400, 260, 1280, 720, 94, 32);
const restored = eng.computePillPosition(ratios.xRatio, ratios.yRatio, 1920, 1080, 94, 32);
assert.ok(restored.left > 550 && restored.left < 680, 'Center-left position should scale proportionally rather than snap to edges');

// Update check: CDN fallback & update detection
(async () => {
  let hits = 0;
  const res = await eng.checkRemoteUpdateOnce('0.1.0', async (url) => {
    hits += 1;
    if (url.includes('raw.githubusercontent.com')) return { ok: false };
    return { ok: true, async json() { return { version: '0.2.0' }; } };
  });
  assert.strictEqual(hits, 2, 'Should fallback from raw to jsDelivr CDN');
  assert.strictEqual(res.checked, true);
  assert.strictEqual(res.hasUpdate, true);
  assert.strictEqual(res.remoteVersion, '0.2.0');

  const offRes = await eng.checkRemoteUpdateOnce('0.1.0', async () => { throw new Error('offline'); });
  assert.strictEqual(offRes.checked, false);
  assert.strictEqual(offRes.hasUpdate, false);
  console.log('ENGINE_UNIT_OK');
})().catch((e) => { console.error(e); process.exit(1); });
"""
    r_eng = subprocess.run(["node", "-", str(UI_DIR / "floating_panel.js")], input=engine_test, text=True, capture_output=True, encoding="utf-8")
    if r_eng.returncode != 0 or "ENGINE_UNIT_OK" not in r_eng.stdout:
        v.err(f"Floating panel engine unit tests failed: {r_eng.stderr or r_eng.stdout}")
    else:
        v.ok("Floating panel labels, NSFW mutex, 2D relative positioning & persona themes passed.")

    # 8. Node V8 RegExp pipeline isolation & legacy <note> + ※ preservation test
    print("\n[8/8] Running Node.js V8 RegExp isolation & pipeline tests...")
    regex_payload = json.dumps({
        "draft": scripts_by_name["💭 构思手记折叠"]["findRegex"],
        "comment": scripts_by_name["💬 段间随记与批注卡片"]["findRegex"],
        "options": scripts_by_name["🎯 行动选项交互卡片"]["findRegex"],
        "cleaner": scripts_by_name["🧹 历史手记与选项清洗"]["findRegex"],
        "draftRepl": scripts_by_name["💭 构思手记折叠"]["replaceString"],
    }, ensure_ascii=False)

    v8_regex = r"""
const assert = require('assert');
const cfg = JSON.parse(process.argv[2]);
function parseRe(lit) {
  const m = lit.match(/^\/([\s\S]+)\/([gimsuy]*)$/);
  return new RegExp(m[1], m[2]);
}
const reDraft = parseRe(cfg.draft);
const reComment = parseRe(cfg.comment);
const reOptions = parseRe(cfg.options);
const reCleaner = parseRe(cfg.cleaner);

const sample = [
  '<draft>',
  '※ 莉莉丝：草稿里不能渲染成卡片',
  '<options>\nA. 假选项：不能渲染\n</options>',
  '</draft>',
  '',
  '正文段落一。',
  '',
  '※ 莉莉丝：第一串点评。',
  '※ 泠音：伏笔记录内容。',
  '※ master：用户追加。',
  '',
  '<note>旧版行文随记遗留</note>',
  '<options>\nA. 真实行动：推进对话\n</options>'
].join('\n');

let disp = sample.replace(reDraft, cfg.draftRepl)
  .replace(reComment, '<CMT>$1</CMT>')
  .replace(reOptions, '<OPT>$1</OPT>');

const draftBox = disp.match(/<details class="yd-draft-box">[\s\S]*?<\/details>/);
assert(draftBox && !/<(CMT|OPT)>/.test(draftBox[0]), 'No card leakage inside draft');
assert.strictEqual([...disp.matchAll(/<CMT>/g)].length, 1, 'Expected 1 outer comment block');
assert.strictEqual([...disp.matchAll(/<OPT>/g)].length, 1, 'Expected 1 outer options block');

const cleaned = sample.replace(reCleaner, '');
assert(!cleaned.includes('<draft>') && !cleaned.includes('<options>') && !cleaned.includes('<note>'), 'Draft/options/legacy note stripped');
assert(cleaned.includes('※ 莉莉丝：第一串点评。') && cleaned.includes('※ 泠音：伏笔记录内容。') && cleaned.includes('※ master：用户追加。'), 'All ※ lines preserved');
console.log('REGEXP_OK');
"""
    r_re = subprocess.run(["node", "-", regex_payload], input=v8_regex, text=True, capture_output=True, encoding="utf-8")
    if r_re.returncode != 0 or "REGEXP_OK" not in r_re.stdout:
        v.err(f"V8 RegExp pipeline failed: {r_re.stderr or r_re.stdout}")
    else:
        v.ok("V8 RegExp <draft> isolation, multi-speaker floor grouping & history ※ preservation passed.")

    print(f"\n=== Summary: Errors: {len(v.errors)}, Warnings: {len(v.warnings)} ===")
    return 1 if v.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
