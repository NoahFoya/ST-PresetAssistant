#!/usr/bin/env python3
"""Generate architecture guide and full content cache for ST-PresetAssistant."""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PKG_PATH = BASE / "package.json"
RAW_DIR = BASE / "raw_data_cache"
MANIFEST_PATH = RAW_DIR / "preset_manifest.json"
DOCS_DIR = BASE / "docs"


def main() -> None:
    pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
    version = pkg["version"]
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    prompt_index = manifest["prompt_index"]

    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    cache_lines = [
        "======================================================================",
        f"ST-PresetAssistant (ST-预设助手) v{version} · 全量提示词源码缓存",
        f"总模块数: {len(prompt_index)}",
        "======================================================================\n",
    ]
    guide_rows = []
    for idx, entry in enumerate(prompt_index):
        fpath = RAW_DIR / entry["file"]
        mod = json.loads(fpath.read_text(encoding="utf-8"))
        en = "✅ 开启" if entry["enabled"] else "⬜ 关闭"
        role = mod.get("role", "system")
        content = mod.get("content", "")
        cache_lines.append(
            f"=== [{idx:02d}] {mod['identifier']} | {mod['name']} | en={entry['enabled']} | role={role} | len={len(content)} | {entry['file']} ==="
        )
        cache_lines.append(content)
        cache_lines.append("")
        guide_rows.append(
            f"| `{idx:02d}` | `{mod['identifier']}` | {mod['name']} | `{role}` | {en} | `{entry['file']}` |"
        )

    cache_path = DOCS_DIR / "Preset_Full_Content_Cache.txt"
    cache_path.write_text("\n".join(cache_lines), encoding="utf-8", newline="\n")

    ext = manifest["preset_config"]["extensions"]
    scripts = ext["regex_scripts"]
    regex_rows = [
        f"| {sc['scriptName']} | `{sc['placement']}` | `markdownOnly={sc['markdownOnly']}` / `promptOnly={sc['promptOnly']}` | `disabled={sc['disabled']}` |"
        for sc in scripts
    ]
    th_scripts = ext.get("tavern_helper", {}).get("scripts", [])
    th_rows = [
        f"| {sc['name']} | `{sc['type']}` | `enabled={sc['enabled']}` | {sc.get('info', '')} |"
        for sc in th_scripts
    ]

    guide_md = "\n".join([
        f"# ST-PresetAssistant (`ST-预设助手` `v{version}`) · 多人设架构与模块清单",
        "",
        "## 一、6 大 XML 语义块与扁平 Markdown 架构",
        "",
        "1. **01_系统框架（使用说明 + 变量统一初始化 + 最上方 AI 人设 + `<core_rules>` + 核心确认）**：`main` 设为 `✨ST-使用说明`（仅含 `{{// ... }}` 注释，0 Token 且 `forbid_overrides: true`）；紧接 `yd_vars_init` 单行初始化全部 30 个分域宏变量（`persona_name` / `ack_*` / `nar_*` / `exec_*` / `cot_*` / `out_*`，严格零嵌套，含无激活人设时的 `Assistant` 称呼、四段自然中性回应与默认收束 `exec_ending`）；随后支持 `[AI人设] 泠音：剧情小说 / 莉莉丝：肉文写手（默认） / Ark：角色扮演 [单选]` 与动态扩展人设；`<core_rules>` 开篇呼唤 `{{getvar::persona_name}}` 并确立面向成人的虚构互动文学创作边界与通用交互法则；末尾 `🤝 核心确认`（`role: assistant`）动态读取 `ack_core`，确立当前搭档口吻并承接核心原则。",
        "2. **02_角色与故事设定 (`📖 故事设定 - 开始` -> `<story_setting>` -> `🤝 故事设定确认`)**：`story_setting_open` 设为 `role: user` 并在 `<story_setting>` 内直接附带引导说明，包裹 SillyTavern 原生世界书、角色设定与示例对话插槽，末尾由 `🤝 故事设定确认`（`role: assistant`，读取 `ack_setting`）以当前人设口吻自然衔接故事设定。",
        "3. **03_聊天历史 (`💬 历史会话 - 开始` -> `<chat_history>` -> `🤝 历史会话确认`)**：`chat_history_open` 设为 `role: user` 并在 `<chat_history>` 内直接附带引导说明，包裹 `chatHistory` 对话记录区，末尾由 `🤝 历史会话确认`（`role: assistant`，读取 `ack_history`）以当前人设口吻承接前文脉络与当前局面（兼容 Continue 与首轮开场）。",
        "4. **04_叙事约定 · 输出目标 (`📐 叙事约定 - 汇总` -> `<narrative_rules>`)**：按思考逻辑顺序汇总 8 个 `nar_*` 分域变量——`[视角]` → `[文风]`（9 款含三段语感示范，默认 `情色文学`，含 `经典日轻`、`新式轻文学`、`爽利网文`、`严肃正剧` 等）→ `[节奏]` → `[侧重]`（6 款，含新增 `外貌神韵`）→ `[篇幅]`（`较短 / 适中 / 较长`）→ `[写作规范]`（`标准 / 宽松`）→ `[NSFW倾向]`（`中性双向（默认） / 男性向 / 女性向`，均拆清描写倾向 / 词汇倾向 / 禁止内容）/`[NSFW细化]`，由 `yd_writing_spec_render`（`role: user`，顶部呼唤 `{{getvar::persona_name}}`）按独立换行占位直接输出 `<narrative_rules>`，自然维持完整消息流角色交替。",
        "5. **05_执行规则 · 输出方式与尾部自强化 (`⚙️ 执行规则 - 汇总` -> `<execution_rules>` -> `🤝 执行确认` -> `▶️ 继续`)**：按思考与执行流排布「6 级规则优先级 → 正文执行 → 构思与推演 → 附加输出 → 完结标记 (`<ToBeContinue>`)」五分区，与悬浮面板分组严格 1:1 对齐——`[输入处理]`（`直接承接` 默认开 / `演绎展开`）与 `[代写边界]`（`禁止代写 / 有限延伸 / 自由代写`，默认 `有限延伸`，按模式覆盖 `exec_ending`）写入 `exec_*` 并汇入「正文执行」；`[主思考]`（`叙事推理-重度 / 轻量`）、`[思考增强]`（`多角色调度 / 心理潜台词 / 伏笔与暗线 / 防谄媚读心 / 防复读套话`，均默认关闭）与 `[思考工具]`（`输出思考面板`、`正文批注`、`预填充思考&输出思考面板`）以第二人称「你」写入 `cot_*` 并以统一 `### 模块名` 汇入「构思与推演」（由 `cot_header` 动态防空标题）；`[附加输出]`（`场景状态栏 / 剧情选项 / 外部格式兼容`）与 `[总结] 场景小结` 写入 `out_*` 并按生成时序汇入「附加输出」（由 `out_header` 动态防空标题）。`<execution_rules>` 之后紧跟常驻 `🤝 执行确认`（`role: assistant`，读取 `ack_exec` 自强化人设与 `<ToBeContinue>` 收尾）与极简 `▶️ 继续`（`role: user`），保证常规请求恒以 `user` 结尾；`全局梳理`（独立 `<special_task>`）与可选 `预填充思考` 尾置其后，互不干扰。",
        "",
        "## 二、内置正则与酒馆助手脚本",
        "",
        f"### 内置正则列表（{len(scripts)} 条）",
        "| 脚本名称 | Placement | 作用域 | 状态 |",
        "| --- | --- | --- | --- |",
        *regex_rows,
        "",
        "### 内嵌酒馆助手脚本 (`extensions.tavern_helper.scripts`)",
        "| 脚本名称 | 类型 | 状态 | 说明 |",
        "| --- | --- | --- | --- |",
        *th_rows,
        "",
        f"## 三、全量 Prompt 模块列表（共 {len(prompt_index)} 个）",
        "",
        "| 序号 | Identifier | 展示名称 | Role | 默认状态 | 源码路径 |",
        "| --- | --- | --- | --- | --- | --- |",
        *guide_rows,
        "",
    ])
    guide_path = DOCS_DIR / "Preset_Architecture_Guide.md"
    guide_path.write_text(guide_md, encoding="utf-8", newline="\n")

    print(f"[docs] Generated {guide_path.name} and {cache_path.name}")


if __name__ == "__main__":
    main()
