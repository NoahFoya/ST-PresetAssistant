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
        "1. **01_系统框架（使用说明 + 变量统一初始化 + 最上方 AI 人设 + `<core_rules>`）**：`main` 设为 `✨ST-使用说明`（仅含 `{{// ... }}` 注释，0 Token 且 `forbid_overrides: true`）；紧接 `yd_vars_init` 单行初始化全部 27 个分域宏变量（`nar_*` / `exec_*` / `cot_*` / `out_*`，严格零嵌套，含 `nar_open/close` 动态防空壳与默认弹性收束 `exec_ending`）；随后支持 `[AI人设] 泠音：剧情小说 / 莉莉丝：肉文写手（默认） / Ark：角色扮演 [单选]` 与动态扩展人设（全仓统一为「玩家（`user`）的 `Assistant`」单一身份，采用规范化 3 条特质防过拟合、无固定口癖示例与零宏变量门槛）；`<core_rules>` 作为前置职责锚点以「要求 Assistant」确立模拟与创作职责，内化成人向虚构创作边界、五类输入判定、防迎合与认知隔离、静态设定免复述、人物设定隐性化、有效推进与自然留白等恒定通用准则。",
        "2. **02_角色与故事设定 (`📖 故事设定 - 开始` -> `<story_setting>` -> `📖 故事设定 - 结束`)**：全段保持 `role: system`，客观区分世界规则、角色自身认知/传闻与仅作口吻参考的对话范例，包裹 SillyTavern 原生世界书、角色设定与对话范例插槽。",
        "3. **03_聊天历史 (`💬 历史会话 - 开始` -> `<chat_history>` -> `💬 历史会话 - 结束`)**：包裹项保持 `role: system`，明确已发生的实际行动与最新状态默认延续、口头说辞/未兑现计划/主观假设不自动视作客观事实，包裹 `chatHistory` 对话记录区。",
        "4. **04_叙事约定 · 动态输出配置 (`📐 叙事约定 - 汇总` -> `<narrative_rules>`)**：位于 `<chat_history>` 之后使动态规则靠近生成位置且切换配置时不破坏前部稳定前缀；汇总 8 个 `nar_*` 分域变量——`[视角]` → `[文风]`（9 款含三段第三人称语感示范，默认 `情色文学`，按场景调节感官密度）→ `[节奏]` → `[侧重]`（6 款，默认 `自然均衡`，依场景自然侧重）→ `[篇幅]`（信息量驱动的弹性参考，低信息回合主动短收）→ `[写作规范]`（`标准 / 宽松`，聚焦词句自然简洁、近几轮语义去重与直接引语）→ `[NSFW倾向]`（`中性双向（默认） / 男性向 / 女性向`，正向描写倾向与词汇分寸、统一「己方/对方」并聚焦可观察互动反差）/`[NSFW细化]`，由 `yd_writing_spec_render`（`role: system`，纯客观 `<narrative_rules>` 直出无模板导语）按独立换行占位输出。",
        "5. **05_执行规则 · 分型 CoT 与尾部 `<core_task>` (`⚙️ 执行规则 - 汇总` -> `<execution_rules>` -> `<core_task>`)**：入口设置历史后重锚指令「本轮回复要求 Assistant 严格按以下规则优先级、正文边界与推演步骤执行：」，按「7 级规则优先级（`5. 叙事视角` 显式高于 `6. 文风/节奏/侧重/写作规范/专项描写`）→ 正文执行 → 构思与推演（CoT）→ 附加输出 → 完结标记 (`<ToBeContinue>`)」五分区排布，严格区分「准则」与「CoT 推导步骤」——`[输入处理]`（`直接承接` 默认开 / `演绎展开`，完整覆盖五类输入与自然续写）与 `[代写边界]`（`禁止代写 / 有限延伸 / 自由代写`，默认 `有限延伸`，按模式覆盖弹性 `exec_ending`）汇入「正文执行」；`[主思考]`（`叙事推理-重度 / 轻量`，五类输入 + 状态差分 + 条件新进展判断）、`[思考增强]`（A 类必出结论：`防谄媚读心 / 防复读套话`；B 类先核查、条件不成立时推演记“无”：`多角色调度 / 心理潜台词 / 伏笔与暗线`）与 `[思考工具]`（`输出思考面板` 默认开、完整显化全部已启用步骤便于排查，`预填充思考`（绑定 `&输出思考面板`））以统一 `### 模块名` 汇入「构思与推演」；`[附加输出]`（`场景状态栏 / 正文批注 / 场景小结 / 剧情选项 / 外部格式兼容`）按生成时序汇入「附加输出」。`<execution_rules>` 之后由 `role: user` 的尾置互斥单选组 **`[核心任务]`**（`<core_task>`）按任务阻力差异化直述收尾：`续写故事`（`yd_task_continue`，默认开，无客套直接祈使续写并提供末尾安全 `user` 缓冲）与 `全文总结`（`yd_task_full_summary`，默认关，显式要求 `Assistant` 暂停续写并直接输出区分事实与推断的 `<recap>` 总结档案与 `<ToBeContinue>`，生成结束后自动切回 `续写故事`）。",
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
