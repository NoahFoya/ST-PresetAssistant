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
    cache_path.write_text("\n".join(cache_lines), encoding="utf-8")

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
        "1. **01_系统框架（最上方 AI 人设 + `<核心准则>`）**：支持 `[AI人设] 莉莉丝`（默认开启）、`[AI人设] 泠音`、「不启用」与用户自定义人设扩展，人设直接置顶而不包裹 `<xml>` 标签；`main`（`[核心规则] 核心创作准则`）采用扁平 4 节结构，兼容多 AI 人设与不启用模式。",
        "2. **02_角色与故事设定 (`<故事设定>`)**：SillyTavern 原生世界书、角色设定与示例对话插槽。",
        "3. **03_聊天历史 (`<历史会话>`)**：`chatHistory` 对话记录区。",
        "4. **04_叙事约定 (`<叙事约定>`)**：全人设共享通用规范 + 8 款全第三人称示范文风（默认 `[文风] 情色文学`）+ 视角（1/2/3限知/3全知）+ 文学节奏 + 五维描写侧重（含心理刻画）+ 拆分 `[NSFW倾向]` 与 `[NSFW细化]`。",
        "5. **05_执行规则 (`<执行规则>`)**：篇幅联动 + 统一 `※` 段间随记批注等 4 项功能开关 + `[输出汇总模板]` + `[思考] 基本推理`（主思考链）与草稿控制。",
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
    guide_path.write_text(guide_md, encoding="utf-8")

    print(f"[docs] Generated {guide_path.name} and {cache_path.name}")


if __name__ == "__main__":
    main()
