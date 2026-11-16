# ST-PresetAssistant (`ST-预设助手` `v0.3.0`) · 多人设架构与模块清单

## 一、6 大 XML 语义块与扁平 Markdown 架构

1. **01_系统框架 (`<助手设定>` + `<核心准则>`)**：支持 `[人设] 莉莉丝`（默认开启）、`[人设] 泠音`、「不启用」与用户自定义人设扩展；`main` 采用扁平 4 节结构，兼容多人设与不启用模式。
2. **02_角色与故事设定 (`<故事设定>`)**：SillyTavern 原生世界书、角色设定与示例对话插槽。
3. **03_聊天历史 (`<历史会话>`)**：`chatHistory` 对话记录区。
4. **04_叙事约定 (`<叙事约定>`)**：全人设共享通用规范 + 8 款全第三人称示范文风（默认 `[文风] 情色文学`）+ 视角（1/2/3限知/3全知）+ 文学节奏 + 五维描写侧重（含心理刻画）+ 拆分 `[NSFW倾向]` 与 `[NSFW细化]`。
5. **05_执行规则 (`<执行规则>`)**：篇幅联动 + 统一 `※` 段间随记批注等 4 项功能开关 + `[输出汇总模板]` + `[思考] 基本推理`（主思考链）与草稿控制。

## 二、内置正则与酒馆助手脚本

### 正则流水线（4 条）
| 脚本名称 | Placement | 作用域 | 状态 |
| --- | --- | --- | --- |
| 💭 构思手记折叠 | `[2]` | `markdownOnly=True` / `promptOnly=False` | `disabled=False` |
| 💬 段间随记与批注卡片 | `[2]` | `markdownOnly=True` / `promptOnly=False` | `disabled=False` |
| 🎯 行动选项交互卡片 | `[2]` | `markdownOnly=True` / `promptOnly=False` | `disabled=False` |
| 🧹 历史手记与选项清洗 | `[1, 2]` | `markdownOnly=False` / `promptOnly=True` | `disabled=False` |

### 内嵌酒馆助手脚本 (`extensions.tavern_helper.scripts`)
| 脚本名称 | 类型 | 状态 | 说明 |
| --- | --- | --- | --- |
| 🎛️ ST-预设助手悬浮控制面板 | `script` | `enabled=True` | ST-PresetAssistant (ST-预设助手) 快捷悬浮控制面板：支持切换助手人设、绑定主题配色、二维相对位置记忆与预设实时写回保存。 |

## 三、全量 Prompt 模块列表（共 57 个）

| 序号 | Identifier | 展示名称 | Role | 默认状态 | 源码路径 |
| --- | --- | --- | --- | --- | --- |
| `00` | `yd_top_user_guide` | [说明] ST-预设助手 | `system` | ✅ 开启 | `prompts/01_系统框架/yd_top_user_guide.json` |
| `01` | `yd_persona_lilith` | [人设] 莉莉丝 | `system` | ✅ 开启 | `prompts/01_系统框架/yd_persona_lilith.json` |
| `02` | `yd_persona_lingyin` | [人设] 泠音 | `system` | ⬜ 关闭 | `prompts/01_系统框架/yd_persona_lingyin.json` |
| `03` | `main` | [准则] 核心创作准则 | `system` | ✅ 开启 | `prompts/01_系统框架/main.json` |
| `04` | `story_setting_open` | <故事设定> | `system` | ✅ 开启 | `prompts/02_角色与故事设定/story_setting_open.json` |
| `05` | `worldInfoBefore` | 🌠 前世界书 (规则、世界背景) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/worldInfoBefore.json` |
| `06` | `personaDescription` | 🌠 用户角色描述 | `system` | ✅ 开启 | `prompts/02_角色与故事设定/personaDescription.json` |
| `07` | `charDescription` | 🌠 角色卡 (描述) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/charDescription.json` |
| `08` | `charPersonality` | 🌠 角色卡 (性格) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/charPersonality.json` |
| `09` | `scenario` | 🌠 角色卡 (场景) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/scenario.json` |
| `10` | `worldInfoAfter` | 🌠 后世界书 (故事进展、补充语料) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/worldInfoAfter.json` |
| `11` | `dialogueExamples` | 🌠 示例对话 (Chat Examples) | `system` | ✅ 开启 | `prompts/02_角色与故事设定/dialogueExamples.json` |
| `12` | `story_setting_close` | </故事设定> | `system` | ✅ 开启 | `prompts/02_角色与故事设定/story_setting_close.json` |
| `13` | `chat_history_open` | <历史会话> | `system` | ✅ 开启 | `prompts/03_聊天历史/chat_history_open.json` |
| `14` | `chatHistory` | 💬 聊天历史 (Chat History) | `system` | ✅ 开启 | `prompts/03_聊天历史/chatHistory.json` |
| `15` | `chat_history_close` | </历史会话> | `system` | ✅ 开启 | `prompts/03_聊天历史/chat_history_close.json` |
| `16` | `yd_writing_spec_init` | <叙事约定> | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_writing_spec_init.json` |
| `17` | `yd_writing_spec_general` | [通用] 写作规范 | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_writing_spec_general.json` |
| `18` | `yd_style_erotica` | [文风] 情色文学 | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_style_erotica.json` |
| `19` | `yd_style_pulp_smut` | [文风] 肉文直白 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_pulp_smut.json` |
| `20` | `yd_style_slice_of_life` | [文风] 写实白描 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_slice_of_life.json` |
| `21` | `yd_style_delicate` | [文风] 细腻工笔 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_delicate.json` |
| `22` | `yd_style_light_novel` | [文风] 轻小说体 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_light_novel.json` |
| `23` | `yd_style_web_brisk` | [文风] 轻快网感 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_web_brisk.json` |
| `24` | `yd_style_classical` | [文风] 古风雅韵 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_classical.json` |
| `25` | `yd_style_literary_formal` | [文风] 典雅书面 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_style_literary_formal.json` |
| `26` | `yd_pov_1st` | [视角] 第一人称 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pov_1st.json` |
| `27` | `yd_pov_2nd` | [视角] 第二人称 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pov_2nd.json` |
| `28` | `yd_pov_3rd_limited` | [视角] 第三人称限知 | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_pov_3rd_limited.json` |
| `29` | `yd_pov_omniscient` | [视角] 第三人称全知 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pov_omniscient.json` |
| `30` | `yd_pace_slow` | [节奏] 慢笔细写 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pace_slow.json` |
| `31` | `yd_pace_auto` | [节奏] 张弛自然 | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_pace_auto.json` |
| `32` | `yd_pace_fast` | [节奏] 紧凑推进 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pace_fast.json` |
| `33` | `yd_pace_jump` | [节奏] 跳场略写 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_pace_jump.json` |
| `34` | `yd_focus_balance` | [侧重] 均衡全面 | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_focus_balance.json` |
| `35` | `yd_focus_dialogue` | [侧重] 对话交锋 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_focus_dialogue.json` |
| `36` | `yd_focus_action` | [侧重] 动作神态 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_focus_action.json` |
| `37` | `yd_focus_psychology` | [侧重] 心理刻画 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_focus_psychology.json` |
| `38` | `yd_focus_environment` | [侧重] 环境烘托 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_focus_environment.json` |
| `39` | `yd_nsfw_bias_neutral` | [NSFW倾向] 无倾向 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_nsfw_bias_neutral.json` |
| `40` | `yd_nsfw_bias_male` | [NSFW倾向] 男性向 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_nsfw_bias_male.json` |
| `41` | `yd_nsfw_bias_female` | [NSFW倾向] 女性向 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_nsfw_bias_female.json` |
| `42` | `yd_nsfw_detail_diversity` | [NSFW细化] 反应多样性 | `system` | ⬜ 关闭 | `prompts/04_叙事约定/yd_nsfw_detail_diversity.json` |
| `43` | `yd_writing_spec_render` | </叙事约定> | `system` | ✅ 开启 | `prompts/04_叙事约定/yd_writing_spec_render.json` |
| `44` | `yd_exec_rules_open` | <执行规则> | `system` | ✅ 开启 | `prompts/05_执行规则/yd_exec_rules_open.json` |
| `45` | `yd_length_short` | [篇幅] 短篇 (400-800字) | `system` | ⬜ 关闭 | `prompts/05_执行规则/yd_length_short.json` |
| `46` | `yd_length_medium` | [篇幅] 中篇 (800-1200字) | `system` | ✅ 开启 | `prompts/05_执行规则/yd_length_medium.json` |
| `47` | `yd_length_long` | [篇幅] 长篇 (1200-1800字) | `system` | ⬜ 关闭 | `prompts/05_执行规则/yd_length_long.json` |
| `48` | `yd_feat_inline_comment` | [功能] 段间随记批注 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_feat_inline_comment.json` |
| `49` | `yd_feat_action_options` | [功能] 行动选项 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_feat_action_options.json` |
| `50` | `yd_feat_anti_repeat` | [功能] 剧情防重复 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_feat_anti_repeat.json` |
| `51` | `yd_feat_format_compat` | [功能] 格式兼容 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_feat_format_compat.json` |
| `52` | `yd_output_format_and_note` | [输出汇总模板] | `system` | ✅ 开启 | `prompts/05_执行规则/yd_output_format_and_note.json` |
| `53` | `yd_cot_output_draft` | [思考] 输出草稿面板 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_cot_output_draft.json` |
| `54` | `yd_cot_unified` | [思考] 基本推理 | `system` | ✅ 开启 | `prompts/05_执行规则/yd_cot_unified.json` |
| `55` | `yd_exec_rules_close` | </执行规则> | `system` | ✅ 开启 | `prompts/05_执行规则/yd_exec_rules_close.json` |
| `56` | `yd_prefill_draft` | [思考] 预填充草稿 (Prefill) | `assistant` | ⬜ 关闭 | `prompts/05_执行规则/yd_prefill_draft.json` |
