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
        "1. **01_系统框架（使用说明 + 变量统一初始化 + 最上方 AI 人设 + `<core_rules>` + 助手确认）**：`main` 设为 `✨ST-使用说明`（仅含 `{{// ... }}` 注释，0 Token 且 `forbid_overrides: true`）；紧接 `yd_vars_init` 紧贴单行清零并预设全部扁平宏变量；随后支持 `[AI人设] 莉莉丝 / 泠音 / Ark [单选]` 与动态扩展人设；`<core_rules>` 聚焦创作边界、既定玩家输入保护/模态区分、性格/状态变化证据强度、历史可信度甄别、长期连续性及叙事因果；末尾 `🤝 助手确认`（`role: assistant`）动态读取 `persona_ack` 分隔系统提示词并强化助手自认同。",
        "2. **02_角色与故事设定 (`📖 故事设定 - 开始/结束` -> `<story_setting>`)**：SillyTavern 原生世界书、角色设定与示例对话插槽。",
        "3. **03_聊天历史 (`💬 历史会话 - 开始/结束` -> `<chat_history>`)**：`chatHistory` 对话记录区。",
        "4. **04_叙事约定 (`📐 叙事约定 - 汇总` -> `<narrative_rules>`)**：内接 `[写作规范] 默认 / 宽松 [单选]`（仅约束实际口头台词双引号，内置 `### 详略与节奏`）+ 8 款含三段语感示范的文风 + 视角 + 叙事时间管理节奏 + 五维描写侧重 + 感受驱动的 `[NSFW倾向]`（`通用 / 男性向 / 女性向`）/`[NSFW细化]`，末尾单块 `<narrative_rules>` 扁平紧凑直渲输出。",
        "5. **05_执行规则 (`⚙️ 执行规则 - 汇总` -> `<execution_rules>`)**：顶层 6 顺位 `## 规则优先级` 冲突裁决 + `[代写边界]`（`禁止代写 / 允许延伸 / 自由代写`）三档独立尺度 + `[篇幅]`（`较短 / 适中 / 较长`）软性目标 + `[功能]` 正交层级输出（`正文批注 / 行动选项 / 格式兼容 / 防复读检查 / 状态栏`）+ `[总结]` 互斥总结模式（`场景小结 / 全局梳理`）+ `[思考]` 可叠加构思执行（`输出思考面板 / 构思推演 / 多角色调度 / 预填充思考`），末尾单块 `<execution_rules>` 紧凑直渲输出。",
        "",
        "## 二、内置正则与酒馆助手脚本",
        "",
        f"### 正则流水线（{len(scripts)} 条）",
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
