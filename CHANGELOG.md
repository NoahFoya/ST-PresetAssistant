# 更新日志 (Changelog)

## [1.1.0] - 2026-11-27

### Added
- **新增第四套 AI 人设 `[AI人设] 大肥鱼：努力干饭 [单选]` 与置前 `05_附加设定` 前提系统** ([yd_persona_dafeiyu.json](raw_data_cache/prompts/01_系统框架/yd_persona_dafeiyu.json), [yd_add_self_romance.json](raw_data_cache/prompts/05_附加设定/yd_add_self_romance.json), [yd_add_dihua.json](raw_data_cache/prompts/05_附加设定/yd_add_dihua.json), [yd_add_shura.json](raw_data_cache/prompts/05_附加设定/yd_add_shura.json), [yd_add_coincidence.json](raw_data_cache/prompts/05_附加设定/yd_add_coincidence.json), [yd_add_comedy.json](raw_data_cache/prompts/05_附加设定/yd_add_comedy.json), [yd_add_settings_render.json](raw_data_cache/prompts/05_附加设定/yd_add_settings_render.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json))：
  - 新增深海蓝鲸看板娘 **`大肥鱼：努力干饭`**（默认关闭，鲸蓝 `#18a4e0`），将玩家投喂的对话与 Token 视作白米饭，以实诚努力、不挑题材、自由发挥与尽力而为作为隐性驱动力强化活人感与输出投入度。
  - 在 `04_叙事约定` 与执行规则之间新增独立目录 **`05_附加设定`**（`<additional_settings>`，6 模块，含 5 项默认关闭的多选世界/角色前提开关与 `🧩 附加设定 - 汇总`，全关零输出），专门修正思考前置设定而不干涉思维过程与格式输出：收录 **`角色自我攻略`**、**`全员迪化脑补`**、**`修罗场暗涌`**、**`戏剧性巧合`**（约束单段仅适度触发一处契机、避免具体桥段清单与连环堆砌）与 **`沙雕喜剧`**（强调情境错位与一本正经的反差感，远离生硬网络烂梗）。
  - 宏变量表由 27 个同步扩展为 **34 个严格零嵌套单行变量**（新增 `add_open / add_close / add_self_romance / add_dihua / add_shura / add_coincidence / add_comedy`，原 `cot_draft` 并入格式层正名为 `out_draft`），总模块数由 73 增至 **80 个**。

### Changed
- **品牌正式定名为 `ST-PresetAssistant`（英文全称 `Starlight-PresetAssistant`，中文名“星光”）并同步全套文档与脚本** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [package.json](package.json), [main.json](raw_data_cache/prompts/01_系统框架/main.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js), [sync_ui.py](scripts/sync_ui.py), [build_preset.py](scripts/build_preset.py), [build_docs.py](scripts/build_docs.py), [README.md](README.md))：
  - 以 **`ST`** 同时呼应 **SillyTavern**（酒馆）与 **Starlight**（星光），将酒馆内预设显示名、悬浮面板顶栏与内嵌脚本名正式定为 **`ST-PresetAssistant`** / **`🎛️ ST-PresetAssistant 悬浮控制面板`**，与 GitHub 仓库路径（`NoahFoya/ST-PresetAssistant`）及导出文件名（`ST-PresetAssistant_V1.1.0.json`）保持完全一致；文档内清晰标注英文全称 `Starlight-PresetAssistant` 与中文称呼“星光预设”。
- **全面修正并丰满四套 AI 人设（默认全关 + 提示说明 + 去除补丁式声明）** ([yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [yd_persona_dafeiyu.json](raw_data_cache/prompts/01_系统框架/yd_persona_dafeiyu.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - 将四套 `[AI人设]` 统一调整为**默认全不开启**（开箱由纯净 `Assistant` 承接，未开人设时悬浮球采用琥珀主题色 `#c69352`），并在悬浮面板「AI人设」`?` 帮助气泡、悬停提示（Tooltip）、`main.json` 与 `README.md` 补充人设作用说明，同时去掉多余的内联副标题以保持面板整洁。
  - 彻底移除各人设末尾重复的「正文之外……；故事正文严格贴合……」补丁式声明与僵化固定模板，纯正向塑形 **`泠音：剧情小说`**（温和家常、市井烟火与寻常人情，去掉高调升华与真实作家点名防跨题材串味）、**`莉莉丝：肉文写手`**（坦率热辣、爱写肉文爽文与直白感官张力）、**`Ark：角色扮演`**（冷静克制的理性 AI 助手，侧重规则边界、条件盘点与跑团式推算），并消除所有人设对下游标签/功能词的直接提及。
- **切换默认文风为 `经典日轻` 并做保热点防同构微调** ([yd_style_light_novel.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_novel.json), [yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json), [yd_style_delicate.json](raw_data_cache/prompts/04_叙事约定/yd_style_delicate.json), [yd_style_web_brisk.json](raw_data_cache/prompts/04_叙事约定/yd_style_web_brisk.json), [yd_style_slice_of_life.json](raw_data_cache/prompts/04_叙事约定/yd_style_slice_of_life.json))：
  - 将默认 `[文风]` 由 `情色文学` 调整为 **`经典日轻`**（保持 `[NSFW倾向] 中性双向` 默认开启）；在不丢掉各体裁热点风味、避免过度纠正的前提下，微调 `经典日轻`、`细腻工笔`、`爽利网文` 与 `写实白描`，拓宽示范跨子题材跨度并消除重复桥段。
- **重整 `06_执行规则` 分层（统一 `[格式要求]` + 独立 `[其他]` 分组）、优化 `正文批注` 并全仓用户向文档改写** ([yd_exec_rules_render.json](raw_data_cache/prompts/06_执行规则/yd_exec_rules_render.json), [yd_cot_output_draft.json](raw_data_cache/prompts/06_执行规则/yd_cot_output_draft.json), [yd_feat_scene_status.json](raw_data_cache/prompts/06_执行规则/yd_feat_scene_status.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/06_执行规则/yd_feat_inline_comment.json), [yd_feat_scene_summary.json](raw_data_cache/prompts/06_执行规则/yd_feat_scene_summary.json), [yd_feat_action_options.json](raw_data_cache/prompts/06_执行规则/yd_feat_action_options.json), [yd_feat_format_compat.json](raw_data_cache/prompts/06_执行规则/yd_feat_format_compat.json), [yd_prefill_draft.json](raw_data_cache/prompts/06_执行规则/yd_prefill_draft.json), [yd_task_full_summary.json](raw_data_cache/prompts/06_执行规则/yd_task_full_summary.json), [yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [chat_history_open.json](raw_data_cache/prompts/03_聊天历史/chat_history_open.json), [yd_focus_balance.json](raw_data_cache/prompts/04_叙事约定/yd_focus_balance.json), [yd_length_short.json](raw_data_cache/prompts/04_叙事约定/yd_length_short.json), [yd_length_medium.json](raw_data_cache/prompts/04_叙事约定/yd_length_medium.json), [yd_length_long.json](raw_data_cache/prompts/04_叙事约定/yd_length_long.json), [yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_writing_spec_relaxed.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_relaxed.json), [yd_style_literary_formal.json](raw_data_cache/prompts/04_叙事约定/yd_style_literary_formal.json), [README.md](README.md))：
  - 将原 `05_执行规则` 目录顺延为 `06_执行规则`，内部按「执行边界（`[输入处理]` / `[代写边界]`）→ 思考功能（`[主思考]` / `[思考增强]`）→ **`[格式要求]`**（6 项汇总格式模块）」分层，`[其他] 预填充思考 [多选]&输出思考面板` 独立置于 `[核心任务]` 之后并配套专属 `other` 帮助主题；`yd_exec_rules_render` 导语与完结标记统一对齐「格式要求」、规则优先级第 3 顺位纳入「及已启用的附加设定」，`[格式要求] 输出思考面板` 兼容上方构思步骤全关场景，`[核心任务] 全文总结` 统一为暂停「上述各项格式要求」。
  - **`[格式要求] 正文批注`** 内化吐槽功能并彻底移除篇幅计数、`1~2 条` 及最低条数限制，明确为**落笔前核对尚未回收的伏笔与仍然有效的状态备忘；随故事正文同步推进，仅当出现立场/态度/局势转折与强烈反差、潜台词交锋、伏笔埋设回收或重要约定与物品伤势变更四类明确节点之一时，紧随该段或该轮交锋另起空行输出 1 条 `※ 标签：内容`**，并清晰划分 `点评 / 吐槽 / 伏笔 / 笔记` 等标签职责。
  - 全仓批量对齐三层边界：`yd_core_rules_default.json` 明确「不作叙事外说教或道德评判」并剥离与 `chat_history_open.json`（补入「伪装」核查）、`写作规范`、`节奏` 重叠及易歧义表述；`[篇幅]` 三档去掉对 `[代写边界]` 决策停笔点的越界描述；`[写作规范]` 标准/宽松将非台词约束收紧为纯文风表述、`[侧重] 自然均衡` 改为「简明带过」；`yd_add_dihua.json` 清理偏元词汇，整体零补丁、少歧义。
  - 悬浮面板为**全部 18 个预设分组**统一补齐 `?` 帮助说明弹窗；[README.md](README.md) 彻底重写为面向普通玩家的使用与排错手册（去除研发机制、目录结构与构建说明），将本地研发/测试脚本（`docs/`、`tests/`、`scripts/`）统一排除在 Git 追踪外，并修正 `yd_style_literary_formal.json`（改用 `银质托座`）用词。

## [1.0.0] - 2026-11-24

### Changed
- **六层全 `system` 消息流重构、移除四节点伪确认与双节点 `Assistant` 重锚体系（`77 → 73` 模块、`30 → 27` 宏变量）** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [story_setting_open.json](raw_data_cache/prompts/02_角色与故事设定/story_setting_open.json), [chat_history_open.json](raw_data_cache/prompts/03_聊天历史/chat_history_open.json), [yd_writing_spec_render.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_render.json), [yd_exec_rules_render.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_render.json), [yd_task_continue.json](raw_data_cache/prompts/05_执行规则/yd_task_continue.json), [yd_task_full_summary.json](raw_data_cache/prompts/05_执行规则/yd_task_full_summary.json), [yd_feat_scene_summary.json](raw_data_cache/prompts/05_执行规则/yd_feat_scene_summary.json))：
  - **删除 4 个伪确认节点与 5 个旧宏变量，统一双主体身份、规范化三套人设并建立双节点 `Assistant` 重锚与 `nar_open/close` 动态防空壳**：移除 `yd_assistant_ack`、`yd_setting_ack`、`yd_history_ack`、`yd_exec_ack` 以及 `persona_name`、`ack_core`、`ack_setting`、`ack_history`、`ack_exec`；全仓彻底清除 `master`、`管理员` 与第二重平行头衔（魅魔写手 / 高级人工智能 / 创作者），三套 `[AI人设]` 统一规范为「`玩家（user）的 Assistant` + 3 条核心特质」结构（移除 `### 日常开口风格` 固定口癖模板与对默认关闭功能「批注」的直接点名，保留各自风格区隔，自建人设零宏变量门槛）；在 `<core_rules>`（前置立责）与 `<execution_rules>`（历史后执行收束）两处关键边界以直接客观的「要求 Assistant」双节点重锚指令强度；32 个叙事模块 `nar_open` 精简为纯单行 `<narrative_rules>` 直出客观规范，全关叙事模块时自动静默、零空壳块。
  - **采用六层全 `system` 消息流、7 级规则优先级与资料来源隔离**：将 `story_setting_open`、`chat_history_open`、`yd_writing_spec_render` 与重构后的 `yd_exec_rules_render`（替代原 `yd_exec_rules_close`）全部调整为 `role: system`，并在故事设定与历史会话开头客观区分世界规则、角色自身认知/传闻、仅作口吻参考的对话范例（同步将 `preset_manifest.json` 顶层 `new_example_chat_prompt` 统一为 `[对话范例]`），以及历史已发生行动与口头说辞/假设；`<execution_rules>` 细化为 7 级规则优先级，明确将 `5. 叙事视角` 提至文风、节奏、侧重与专项描写之上；动态叙事与执行配置置于 `chatHistory` 之后，使规则靠近生成位置且切换文风/视角时不破坏前部稳定前缀。
  - **尾置 `[核心任务]` 互斥单选组（`<core_task>`，`role: user`，按任务阻力差异化祈使）**：整合为 **`[核心任务] 续写故事 [单选]`**（`yd_task_continue`，由原 `yd_exec_continue` 重构而来，默认开，无客套直接祈使承接续写并在请求末尾提供安全 `user` 意图缓冲）与 **`[核心任务] 全文总结 [单选]`**（`yd_task_full_summary`，由原 `yd_summary_recap` 演进而来，默认关，高阻力切换任务显式要求 `Assistant` 暂停续写并直接输出区分事实与推断的 `<recap>` 档案与 `<ToBeContinue>`，生成结束后自动切回 `续写故事`）；同步将原 `yd_summary_scene`（`[总结] 场景小结`）归入 **`[附加输出] 场景小结 [多选]`**（`yd_feat_scene_summary`），共计 8 删 4 增（净 `77 → 73` 模块），规范化 5 处滞后内部标识符，并同步清理 `preset_manifest.json` 顶层内置提示词的客套语。
- **精简描写重叠、内化有效推进与弹性篇幅、彻底剥离「准则」与「分型 CoT」并全仓去补丁化** ([yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_pov_1st.json](raw_data_cache/prompts/04_叙事约定/yd_pov_1st.json), [yd_pov_2nd.json](raw_data_cache/prompts/04_叙事约定/yd_pov_2nd.json), [yd_pov_3rd_limited.json](raw_data_cache/prompts/04_叙事约定/yd_pov_3rd_limited.json), [yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json), [yd_style_pulp_smut.json](raw_data_cache/prompts/04_叙事约定/yd_style_pulp_smut.json), [yd_style_delicate.json](raw_data_cache/prompts/04_叙事约定/yd_style_delicate.json), [yd_style_light_novel.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_novel.json), [yd_style_light_literature.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_literature.json), [yd_style_web_brisk.json](raw_data_cache/prompts/04_叙事约定/yd_style_web_brisk.json), [yd_focus_balance.json](raw_data_cache/prompts/04_叙事约定/yd_focus_balance.json), [yd_focus_psychology.json](raw_data_cache/prompts/04_叙事约定/yd_focus_psychology.json), [yd_pace_auto.json](raw_data_cache/prompts/04_叙事约定/yd_pace_auto.json), [yd_pace_jump.json](raw_data_cache/prompts/04_叙事约定/yd_pace_jump.json), [yd_length_short.json](raw_data_cache/prompts/04_叙事约定/yd_length_short.json), [yd_length_medium.json](raw_data_cache/prompts/04_叙事约定/yd_length_medium.json), [yd_length_long.json](raw_data_cache/prompts/04_叙事约定/yd_length_long.json), [yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_writing_spec_relaxed.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_relaxed.json), [yd_nsfw_bias_neutral.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_neutral.json), [yd_nsfw_bias_male.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_male.json), [yd_nsfw_bias_female.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_female.json), [yd_nsfw_detail_diversity.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_detail_diversity.json), [yd_input_continue.json](raw_data_cache/prompts/05_执行规则/yd_input_continue.json), [yd_input_expand.json](raw_data_cache/prompts/05_执行规则/yd_input_expand.json), [yd_cot_heavy.json](raw_data_cache/prompts/05_执行规则/yd_cot_heavy.json), [yd_cot_light.json](raw_data_cache/prompts/05_执行规则/yd_cot_light.json), [yd_cot_multi_char.json](raw_data_cache/prompts/05_执行规则/yd_cot_multi_char.json), [yd_cot_subtext.json](raw_data_cache/prompts/05_执行规则/yd_cot_subtext.json), [yd_cot_foreshadowing.json](raw_data_cache/prompts/05_执行规则/yd_cot_foreshadowing.json), [yd_cot_anti_sycophancy.json](raw_data_cache/prompts/05_执行规则/yd_cot_anti_sycophancy.json), [yd_cot_anti_repeat.json](raw_data_cache/prompts/05_执行规则/yd_cot_anti_repeat.json), [yd_cot_output_draft.json](raw_data_cache/prompts/05_执行规则/yd_cot_output_draft.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [yd_feat_action_options.json](raw_data_cache/prompts/05_执行规则/yd_feat_action_options.json))：
  - **第一层内化通用准则并保持输入模式中立**：`<core_rules>` 完善五类玩家输入性质判定（已完成 / 尝试 / 意愿 / 提问 / 假设）与临时叙事安排作用域，将“不再复写”移归 `直接承接` 专责以兼容 `演绎展开`、清除「跳场 / 场景转场」重叠；新增「叙事因果与有效推进」，内化角色独立防迎合、认知盲区隔离、静态设定与未变状态免复述、人物设定隐性化（习惯动作不机械复现）与低信息自然留白，归口与 `[写作规范]` 之间的重复表述并清除绝对化条款与冗余防御尾巴。
  - **描写去重叠、示例去同构与跨模块行为内建**：统一 `第三人称限知` 直接感官表述；取消 `情色文学 / 直白肉文` 全篇滤镜并重写 `情色文学` 3 组结构差异化示范（打破固定模板结构、降低示例感官叠加），修复 `细腻工笔` 示例 2 间接引语与写作规范的冲突；将 `[侧重] 均衡全面` 更名为 **`[侧重] 自然均衡`**；精简 `标准 / 宽松` 写作规范并清除叠加的否定补丁与读者元评价词；重构三档 `[NSFW倾向]` 为正向 `描写倾向 + 词汇与分寸`（清除 14 处负向「禁止」、粗鄙词表喂入与孤立免责条，统一采用「己方 / 对方」并聚焦可观察外显反差）；`心理刻画` 与 `快进略写` 内建视角与过渡行为路径；`[NSFW细化] 反应多样性` 采用情景差异化互动张力表述（去除一刀切同意停止条款）。
  - **信息量驱动的弹性篇幅**：三档 `[篇幅]`、`[节奏] 张弛自然` 与默认回退 `exec_ending` 明确字数区间仅为信息量充沛时的展开参考，简单应答、低信息过渡或抵达决策节点时主动简短收束；`[代写边界] 有限延伸` 聚焦决策节点与阶段落点并统一「玩家 vs `{{user}}`」称谓，避免默认流多重短收叠加引发过度压缩。
  - **分型 CoT、解耦思考面板与批注/选项时序归位**：`[主思考]` 纳入五类输入判定、状态差分与条件式新进展判断（无新增变化时顺势承接自然收束）；5 项 `[思考增强]` 区分「每轮必出结论」（`防谄媚读心 / 防复读套话`）与「先核查再判断、条件不成立时统一记`此项推演记“无”`」（`多角色调度 / 心理潜台词 / 伏笔与暗线`），全面清除防御性否定尾巴；`输出思考面板` 保持默认开启，完整显化全部已启用思考步骤的分析与决策条目（便于排查、防止偷懒）；`正文批注`（`[附加输出] 正文批注 [多选]`，`yd_feat_inline_comment`）调整为**默认关闭**并按实际生成时序归入 `## 附加输出`（`场景状态栏 → 正文批注 → 场景小结 → 剧情选项 → 外部格式兼容`），去除不兼容 Ark 的旧口吻限定；`剧情选项` 重写为两条清晰规则强化跨轮维度差异；同步消解 `古风雅韵 × 标准规范`、`限知视角 × 心理刻画` 与 `快进略写 × 代写边界` 等跨模块冲突。
- **全流程正名「全文总结」与 21 词长词优先历史禁词表扩充** ([recap_card.html](raw_data_cache/ui/recap_card.html), [floating_panel.js](raw_data_cache/ui/floating_panel.js), [banned_words_default.txt](raw_data_cache/banned_words_default.txt), [sync_ui.py](scripts/sync_ui.py), [preset_manifest.json](raw_data_cache/preset_manifest.json), [main.json](raw_data_cache/prompts/01_系统框架/main.json), [README.md](README.md))：
  - 全仓清除“全局梳理 / 梳理”旧称：卡片主标题更新为 `全文总结`（`剧情总结`），正则更新为 **`[美化] 总结`** 与 **`历史总结清理`**；悬浮面板同步更新横幅、`GENERATION_ENDED` 自动切回 `续写故事` 逻辑及 11 项 `?` 帮助说明（`summary → core_task`、`场景小结` 归入 `extra_output`、`思考增强` 补充选开与核查说明）。
  - `banned_words_default.txt` 由 11 词扩充至 **21 词**（补齐 `本能地 / 不可置信的 / 不容置疑的 / 不由自主 / 微不可察地 / 微不可察的 / 几不可察地 / 几不可察的 / 死死 / 狠狠` 10 个实测高频变体），依托长度降序编译保障零残句；默认采样参数维持 `0` 惩罚不变以保障 Gemini 4 / Claude 开箱零 `HTTP 400`。

## [0.9.0] - 2026-11-23

### Added
- **新增 `[输入处理]` 单选组（`直接承接 / 演绎展开`）、`[文风] 新式轻文学 [单选]`、`[侧重] 外貌神韵 [单选]`、尾部常驻执行确认与继续模块（`yd_exec_ack / yd_exec_continue`）及 `隐藏完结标记` 正则** ([yd_input_continue.json](raw_data_cache/prompts/05_执行规则/yd_input_continue.json), [yd_input_expand.json](raw_data_cache/prompts/05_执行规则/yd_input_expand.json), [yd_style_light_literature.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_literature.json), [yd_focus_appearance.json](raw_data_cache/prompts/04_叙事约定/yd_focus_appearance.json), [yd_exec_ack.json](raw_data_cache/prompts/05_执行规则/yd_exec_ack.json), [yd_exec_continue.json](raw_data_cache/prompts/05_执行规则/yd_exec_continue.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - `[输入处理]` 按思考落笔先后置于 `05_执行规则` 首位（`[输入处理] → [代写边界]`），通过 `exec_input` 汇入 `## 正文执行`，与 `[代写边界]` 清晰分工：`直接承接`（默认开）将玩家已给出的动作与台词视作已发生并已呈现的内容，略去重复描写直接接写结果与反应；`演绎展开` 将玩家简短输入/提纲按当前视角与文风自然融入正文开头再接续后续反应；同步为悬浮面板新增 `[输入处理]` `?` 帮助弹窗（全套 11 项帮助说明）。
  - 将原 `[文风] 轻小说体 [单选]` 修正为 **`[文风] 经典日轻 [单选]`**，并在其后新增差分文风 **`[文风] 新式轻文学 [单选]`**（日式新文艺 / 青春物语风格，强氛围空气感、清冷透明语调与细腻独白节奏，搭配三段第三人称语感示范；全仓文风增至 9 款）。
  - 在 `[侧重]` 新增第 6 项 **`[侧重] 外貌神韵 [单选]`**（默认关闭，复用 `nar_focus`），聚焦光线与互动中的动态容貌、身姿线条、发丝肤色与衣着垂坠变化并主动呼应角色既定外貌服饰特征，服务全题材及成人向视觉魅力表现。
  - 在 `05_执行规则` 末尾新增常驻 **`🤝 执行确认`（`yd_exec_ack`）** 与 **`▶️ 继续`（`yd_exec_continue`）**，并在内置正则新增 **`隐藏完结标记`**（归入「其他设置」，默认开启），配合 `<ToBeContinue>` 实现尾部人设与防截断自强化及界面隐藏/历史过滤。

### Changed
- **对齐酒馆实测默认参数与开箱开关，并分区块重构使用说明与预设机制资料** ([package.json](package.json), [preset_manifest.json](raw_data_cache/preset_manifest.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js), [main.json](raw_data_cache/prompts/01_系统框架/main.json), [README.md](README.md), [yd_style_light_novel.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_novel.json), [yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json), [yd_nsfw_bias_neutral.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_neutral.json), [build_docs.py](scripts/build_docs.py))：
  - **默认参数同步酒馆实测导出状态**：将默认 `openai_max_tokens / max_completion_tokens` 调整为 `32768`、`reasoning_effort` 调整为 `high`、`inline_image_quality` 调整为 `auto`，并补齐酒馆顶层字段 `image_inlining / video_inlining / wrap_in_quotes: false`（同步更新 `floating_panel.js` 默认参数，恢复默认后自然对齐 `Gemini4-high` 方案；自动过滤酒馆导出产生的空内置桩、`forbid_overrides` 变更与 `injection_trigger` 丢失）；
  - **默认开箱组合同步为「莉莉丝：肉文写手 + 情色文学 + 中性双向 + 直接承接 + 有限延伸」**（日常全年龄场景可在面板一键切回 `经典日轻 / 新式轻文学` 等文风并关闭 `[NSFW倾向]`）；
  - **分区块重写使用说明**：将 `main.json`（`✨ST-使用说明`）与 `README.md` 统一拆分为「快速上手与使用说明」与「预设机制说明（按需查阅）」两大板块，降低新用户阅读成本并保持机制文档完整可查。
- **整体交互运行体系升级：「小说质感 × 跑团内核」、附加思考重构、人设感回归与成人向文风去过拟合强化** ([yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_player_control_strict.json](raw_data_cache/prompts/05_执行规则/yd_player_control_strict.json), [yd_player_control_extend.json](raw_data_cache/prompts/05_执行规则/yd_player_control_extend.json), [yd_player_control_free.json](raw_data_cache/prompts/05_执行规则/yd_player_control_free.json), [yd_length_short.json](raw_data_cache/prompts/04_叙事约定/yd_length_short.json), [yd_length_medium.json](raw_data_cache/prompts/04_叙事约定/yd_length_medium.json), [yd_length_long.json](raw_data_cache/prompts/04_叙事约定/yd_length_long.json), [yd_cot_anti_sycophancy.json](raw_data_cache/prompts/05_执行规则/yd_cot_anti_sycophancy.json), [yd_cot_anti_repeat.json](raw_data_cache/prompts/05_执行规则/yd_cot_anti_repeat.json), [yd_cot_heavy.json](raw_data_cache/prompts/05_执行规则/yd_cot_heavy.json), [yd_cot_light.json](raw_data_cache/prompts/05_执行规则/yd_cot_light.json), [yd_cot_output_draft.json](raw_data_cache/prompts/05_执行规则/yd_cot_output_draft.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [yd_feat_scene_status.json](raw_data_cache/prompts/05_执行规则/yd_feat_scene_status.json), [yd_feat_action_options.json](raw_data_cache/prompts/05_执行规则/yd_feat_action_options.json), [yd_feat_format_compat.json](raw_data_cache/prompts/05_执行规则/yd_feat_format_compat.json), [yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json), [yd_style_light_novel.json](raw_data_cache/prompts/04_叙事约定/yd_style_light_novel.json), [yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json), [yd_style_pulp_smut.json](raw_data_cache/prompts/04_叙事约定/yd_style_pulp_smut.json), [yd_nsfw_bias_neutral.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_neutral.json), [yd_nsfw_bias_male.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_male.json), [yd_nsfw_bias_female.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_female.json), [yd_nsfw_detail_diversity.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_detail_diversity.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - **恢复正文外人设感、清理过度纠正与历史包裹，并新增尾部执行确认、继续骨架与 `<ToBeContinue>` 完结标记正则（`75 → 77` 模块、`11 → 12` 条正则、`28 → 30` 宏变量）** ([yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_writing_spec_render.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_render.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_exec_ack.json](raw_data_cache/prompts/05_执行规则/yd_exec_ack.json), [yd_exec_continue.json](raw_data_cache/prompts/05_执行规则/yd_exec_continue.json), [yd_cot_heavy.json](raw_data_cache/prompts/05_执行规则/yd_cot_heavy.json), [yd_cot_light.json](raw_data_cache/prompts/05_执行规则/yd_cot_light.json), [yd_cot_output_draft.json](raw_data_cache/prompts/05_执行规则/yd_cot_output_draft.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [yd_feat_action_options.json](raw_data_cache/prompts/05_执行规则/yd_feat_action_options.json), [yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json), [preset_manifest.json](raw_data_cache/preset_manifest.json))：
    - 引入零嵌套顶层变量 `persona_name`（未启人设默认 `Assistant`，三套人设设为 `莉莉丝 / 泠音 / Ark`），在 `<core_rules>`、`<narrative_rules>` 与 `<execution_rules>` 三个交接节点自然呼唤搭档，同时将思考面板、正文批注与叙事推理转为第二人称「你」下达指令；松绑 4 段助手确认语的公文模板、清除人设本体负向补丁，拉开莉莉丝 / 泠音 / Ark 鲜明口吻差距；
    - 保留 `<core_rules>` 的 `## 创作边界` 原标题并去过度修饰，简明确立「面向成人的虚构互动文学，世界背景、故事情节与登场角色均属虚构」，同时拆顺长句并清理 `yd_cot_heavy / light` 重复核查与 `yd_feat_inline_comment` 元定义前缀；
    - 在 `<execution_rules>` 末尾新增常驻 `## 完结标记`（要求回复最末尾输出 `<ToBeContinue>`，并同步调整 `剧情选项` 位于其前），紧接新增常驻 `🤝 执行确认`（`yd_exec_ack`，`assistant`，读取 `ack_exec` 自强化人设与完结收尾）与极简 `▶️ 继续`（`yd_exec_continue`，`user`，排在 `全局梳理` 与 `预填充思考` 之前，确保常规请求恒以 `user` 结尾）；
    - 新增独立显示正则 `隐藏完结标记`（归入「其他设置」，默认开启，带 `<draft>` 双向隔离保护）并扩展 `历史标签过滤` 发前自动清理历史 `<ToBeContinue>`。
  - **系统性更新 9 个条目名称并修复全仓 5 处跨模块语义与连贯性隐患**：
    - 保留全部内部 `identifier` 不变，将 9 处含义模糊的展示名校准为直白定位：`[AI人设]` 补齐领域标签（`泠音：剧情小说 / 莉莉丝：肉文写手 / Ark：角色扮演`），`[文风]` 调整 `典雅书面 → 严肃正剧`、`轻快网感 → 爽利网文`，`[NSFW倾向]` 调整 `通用 → 中性双向`，`[写作规范]` 调整 `默认 → 标准`，`[附加输出]` 调整 `状态栏 → 场景状态栏`、`格式兼容 → 外部格式兼容`（同步内部子标题与悬浮面板标签/帮助）；
    - 修复 5 处跨模块连贯性问题：`规则优先级 #5` 补齐「及专项描写约定」以覆盖 `[NSFW倾向 / NSFW细化]`；`<core_rules>` 与 `全局梳理` 补入「姿态衣着 / 衣着状态」以对齐思考核查；`有限延伸` 收束句补齐幕间与阶段自然结束出口以兼容切视角与全知模式；`男性向` 描写调整为在代写边界允许范围内展开以兼容 `禁止代写 / 有限延伸`；3 套 `[AI人设]` 末尾 `{{setvar}}` 合并为同行连续定义，消除渲染尾部多余空行。
  - **`<core_rules>` 升级为通用交互与世界运行法则中心并彻底剥离单一模式偏置**：拆清三类玩家输入（明确指令与事实修正 / 共写叙事安排 / 角色内言行），将「无风险衔接 / 实质分叉与代价风险留给玩家」的具体切分完全交由三档 `[代写边界]` 各自声明；`<core_rules>`、`叙事推理-重度 / 轻量` 与 `ack_core` 统一改为中性边界表述，兼容 `禁止代写 / 有限延伸 / 自由代写` 全模式，同时统一去掉「裁定事件后果」等桌游口吻；
  - **防谄媚与读心、防复读迁入 `[思考增强]` 并更名为 `防谄媚读心` / `防复读套话`（均默认关闭）**：移除独立的 `[叙事约束]` 分组，由 `yd_cot_anti_sycophancy`（`cot_anti_sycophancy`）与 `yd_cot_anti_repeat`（`cot_anti_repeat`）以 `### 防谄媚读心` / `### 防复读套话` 构思核查动作并入 `## 构思与推演`，与 `多角色调度 / 心理潜台词 / 伏笔与暗线` 并列按需开启；`## 正文执行` 精简为聚焦 `[输入处理] + [代写边界]`，并同步补充悬浮面板 `[思考增强]` `?` 帮助说明；
  - **重构 `情色文学`、`直白肉文` 为贯穿全篇的叙事滤镜，对齐 `[NSFW倾向]` 与 `[NSFW细化]` 多样性并全线凝练去补丁**：取消“非性爱段 / 性爱段”二元切割，改为不干扰剧情与关系走向的连续滤镜（将性事写得像起居饮食般寻常自然），打散两款文风 1+1+1 示范中的重复外貌/节奏套路并引入主动权与人设差异；清理机械造词、回避词（「亲密 / 欢好 / 床笫」）、跨模块指路补丁与固定视觉/动作清单；三档 `[NSFW倾向]` 拆清 `### 描写倾向 / ### 词汇倾向 / ### 禁止内容`（词汇倾向精简为调性原则 + 4~6 个锚点词），解除单一体型、单一攻受主动权与单一事后温存模式预设，与凝练后的 `[NSFW细化]`（`## 性事反应细化`）无缝对齐；同步凝练 `新式轻文学`、`外貌神韵`、`心理刻画`、`写作规范-宽松`、`防复读套话` 与 `<core_rules>` 局部冗余表述，松绑默认写作规范与 `经典日轻` 对动态外貌的潜在压制，并在 `叙事推理-重度 / 轻量` 补齐姿态与衣着过程连续性核查；
  - **消除叙事约定与输入处理层的跨模块冲突与别扭措辞**：`经典日轻` 去掉「心理槽点 / 脑内小剧场 / 少年感与同伴默契」并在严肃桥段及时收起谐趣，兼顾默认 `限知 + 有限延伸` 与全题材适配；`心理刻画` 改为「视角/边界允许时细写思绪、受限时转由外显细节透出暗流」双通道；三档限知 `[视角]` 去掉「主观揣测」；`禁止代写` 改为依本轮输入处理方式承接以零摩擦兼容 `演绎展开`，优先级 #2 纳入 `输入处理方式`，两项 `[输入处理]` 补齐无新输入（继续生成）兼容；同步柔化 `紧凑推进`、`轻快网感` 的绝对化条款，清理 `写作规范`、`女性向`、`典雅书面` 与 `floating_panel.js` 帮助词条中的生造词与旧口径；
  - **三档 `[代写边界]` 重定为清晰边界台阶并引入 `exec_ending` 变量覆盖机制**：将 `[代写边界] 允许延伸` 更名为 **`[代写边界] 有限延伸 [单选]`**（默认开，保留标识符 `yd_player_control_extend` 兼容），可顺延无风险动作衔接、明确意图的简短日常应答、外界刺激引发的直接体感以及承接玩家已表达态度的自然反应，并将未由玩家表达的心理立场、情绪结论、实质表态、答应或拒绝提议及新独立行动留给 `{{user}}`；三档模式分别覆盖专属 `exec_ending`（到达决定节点前可展开、节点处即自然收束且允许短于参考篇幅；`自由代写` 独立写至当前阶段自然告一段落），全关时自动回退至 `yd_vars_init` 中性收束，彻底消除跨模式冲突；
  - **按“输出目标（`<narrative_rules>`）vs 输出方式（`<execution_rules>`）”与思考逻辑顺序重构 17 个分组**：
    - `[篇幅]` 3 模块迁入 `04_叙事约定`（`nar_length`），输出目标层统一按 `[视角] → [文风] → [节奏] → [侧重] → [篇幅] → [写作规范] → [NSFW倾向] → [NSFW细化]` 顺序排布；
    - `05_执行规则` 与悬浮面板按 `规则优先级 → 正文执行（[输入处理] / [代写边界]）→ 构思与推演（[主思考] / [思考增强] / [思考工具]）→ 附加输出（[附加输出] / [总结]）` 严格 1:1 对齐；
    - `正文批注` 从附加输出迁入 `[思考工具]` / `## 构思与推演`（`cot_comment`，默认开启），定位为按需使用的思考与记忆标记工具：构思前先查看 `<chat_history>` 过往批注作为构思参考（客观事实与人物状态仍以故事设定与前文正文为准），仅在值得点评、吐槽、标记伏笔或留存笔记之处才在故事正文段落之间或文末记录 `※ 标签：内容`，无须记述时自然省略；同步将 `输出思考面板` / `预填充思考` 归入 `[思考工具]`、`格式兼容` 归入 `[附加输出]`，`叙事推理-重度 / 轻量` 恢复先兆前提条件，`全局梳理` 豁免范围扩展为「不受常规叙事、构思与附加输出规则约束」；
    - 同步更新悬浮面板 11 项 `?` 帮助说明（`输入处理 / 主思考 / 思考增强 / 思考工具 / 附加输出 / 总结` 等）与 `main.json` / `README.md`；
  - **根治「强行留白 / 余韵」与慢节奏跨层历史包裹**：清除通用层与非含蓄模块中的留白/余韵诱导（含 `泠音` 示例 1/3 与历史确认语、`<core_rules>`、`[写作规范]` 默认/宽松抢占节奏的迟疑停顿描述、`直白肉文`、`情色文学`、`对话交锋`、`较长篇幅`、`剧情选项`、`多角色调度`、`叙事推理-重度` 与 `执行汇总` 收束句），仅在 `细腻工笔`、`古风雅韵` 与 `泠音` 简介保留一处克制表述。
- **架构精简、28 变量分域重构、正向人设回应与全仓排版统一** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [yd_assistant_ack.json](raw_data_cache/prompts/01_系统框架/yd_assistant_ack.json), [story_setting_open.json](raw_data_cache/prompts/02_角色与故事设定/story_setting_open.json), [yd_setting_ack.json](raw_data_cache/prompts/02_角色与故事设定/yd_setting_ack.json), [chat_history_open.json](raw_data_cache/prompts/03_聊天历史/chat_history_open.json), [yd_history_ack.json](raw_data_cache/prompts/03_聊天历史/yd_history_ack.json), [yd_writing_spec_render.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_render.json))：
  - **合并 3 个独立引导模块、新增 2 个输入处理、1 个差分文风与 1 个外貌侧重模块（净 75 模块）**：删除 `yd_story_setting_guide`、`yd_chat_history_guide`、`yd_rules_guide`，将简明引导词直接并入 `<story_setting>` 与 `<chat_history>` 开始块，并将 `story_setting_open`、`chat_history_open`、`yd_writing_spec_render` 设为 `role: user`，保持 Gemini 4 / Claude 严格角色交替；
  - **28 个宏变量分域重构（兼容经典 `setvar / getvar`）**：统一迁移至 `ack_*`（3）/ `nar_*`（8）/ `exec_*`（3，含 `exec_input` 与按模式覆盖的 `exec_ending`）/ `cot_*`（9，含 `cot_anti_sycophancy` 与 `cot_anti_repeat`）/ `out_*`（5）五大语义分域；
  - **三套 `[AI人设]` 与中性回退重写为正向平实回应**：全部 12 条回应聚焦「了解了什么 + 怎么利用 + 要做什么」，彻底清除反向强调（`不会 xxx`）、自我表态（`记清楚了 / 接好了 / 已归档`）、工程术语与过拟合假设；同步精简人设冗余修饰、改写莉莉丝示例 2 旧口径并微调 Ark 用词消除术语误报；
  - **全仓统一 Markdown 排版与去补丁瘦身**：全仓执行 `XML 外壳 → ## 一级区 → ### 二级模块 → - 无前缀直述项`（`## 构思与推演` 与 `## 附加输出` 统一为 `### 模块名`、`## 正文执行` 与叙事约定层清除孤立冒号小标题），同步清理写作规范跨模块补丁及状态栏、选项、全局梳理的冗余解释。

## [0.7.0] - 2026-11-22（内部迭代）

### Added
- **重做批注体系（统一标签格式、去来源区分、长对话持久留存）与强化未知长上下文稳健性** ([yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [comment_card.html](raw_data_cache/ui/comment_card.html), [preset_manifest.json](raw_data_cache/preset_manifest.json), [banned_words_default.txt](raw_data_cache/banned_words_default.txt), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_feat_repeat_check.json](raw_data_cache/prompts/05_执行规则/yd_feat_repeat_check.json), [yd_chat_history_guide.json](raw_data_cache/prompts/03_聊天历史/yd_chat_history_guide.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - **批注体系重做**：提示词与 `comment_card.html` 全面对齐 `※ 标签：内容` 统一格式（用于吐槽、伏笔、笔记、点评等，不署名也不区分作者/读者/客评来源）；卡片彻底移除人设扫描、头像与署名栏，底部提供快捷标签按钮（`点评 / 伏笔 / 吐槽 / 笔记`）与自定义标签输入框，并支持楼层标签与正文联合编辑；同步彻底删除 `历史批注清理` 正则（内置正则精简至 `11` 条），使批注与伏笔在长对话中持久留存；
  - **未知长上下文稳健性强化**：
    - `banned_words_default.txt` 剔除 4 个在医学、悬疑与说理题材中删空易伤句意的词条（`生理性的 / 生理性 / 条件反射般 / 某种意义上`），保留 11 个低误伤套话修饰词；
    - `历史梳理清理`（`minDepth=30`）调整为默认开启，避免长对话多次梳理后过时 `<recap>` 定格画面互相干扰；
    - `[功能] 防复读检查` 调整为默认开启，主动抑制未知长历史积累的复读与套话惯性；
    - `<execution_rules>` `## 规则优先级 #1` 新增演进优先约束，防止长对话后期人物关系与状态回退至 `<story_setting>` 开局初始状态；
    - 改写 `yd_chat_history_guide` 与三套人设/中性 `persona_history_ack`，去掉「最后一条必为玩家新输入」的硬假设，自然兼容 Continue 继续生成与首轮开场；同步在面板 `?` 帮助与文档中补充长上下文搭配原生思考模型的调优建议。
- **重构 CoT 变量逻辑、拆分面板分组并调整人设默认配色（全量去历史包裹清理）** ([yd_cot_heavy.json](raw_data_cache/prompts/05_执行规则/yd_cot_heavy.json), [yd_cot_light.json](raw_data_cache/prompts/05_执行规则/yd_cot_light.json), [yd_cot_subtext.json](raw_data_cache/prompts/05_执行规则/yd_cot_subtext.json), [yd_cot_foreshadowing.json](raw_data_cache/prompts/05_执行规则/yd_cot_foreshadowing.json), [yd_cot_output_draft.json](raw_data_cache/prompts/05_执行规则/yd_cot_output_draft.json), [yd_cot_multi_char.json](raw_data_cache/prompts/05_执行规则/yd_cot_multi_char.json), [yd_feat_format_compat.json](raw_data_cache/prompts/05_执行规则/yd_feat_format_compat.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - 将面板与 `<execution_rules>` 四个区域一一对齐：`[功能]`（防谄媚与读心 / 防复读检查）→ `## 正文执行`；`[格式要求]`（输出思考面板 / 预填充思考&输出思考面板 / 正文批注 / 行动选项 / 状态栏）与 `[总结] 场景小结` → 动态标题 `extra_output_header`（`## 附加输出`，全关零空标题）；`[主思考]` 单选互斥（`叙事推理-重度` 默认开 / `叙事推理-轻量` 精要罗列核心要点，统一写作一级项 `- 叙事推理：` 与缩进子项）与 `[附加思考]` 多选独立（`格式兼容` 默认开、`多角色调度`、`心理潜台词`、`伏笔与暗线`，严格以同级 `- 项名：` 并列拼入 `## 构思与推演`；总模块数 74）；
  - 全量清理历史补丁与跨模块重叠：`<core_rules>` 专守客观认知隔离、反讨好/防读心迎合完全收归 `[功能] 防谄媚与读心`；三段人设确认去规则复读与题材假设并清理“表单”负向补丁与 Ark `（亦称 master）` 残留；`[写作规范]` 清理古风点名括号与 `宽松` 的反向限制参照；同步清理文风元视角词、`防复读检查` 开头、`全局梳理` 排除清单与 `main.json` 旧分组说明；
  - **扩展「剧情选项」支持叙事功能项，并修正其余功能认知偏差** ([yd_feat_action_options.json](raw_data_cache/prompts/05_执行规则/yd_feat_action_options.json), [yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_feat_scene_status.json](raw_data_cache/prompts/05_执行规则/yd_feat_scene_status.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [yd_feat_repeat_check.json](raw_data_cache/prompts/05_执行规则/yd_feat_repeat_check.json), [yd_feat_anti_sycophancy.json](raw_data_cache/prompts/05_执行规则/yd_feat_anti_sycophancy.json), [options_card.html](raw_data_cache/ui/options_card.html))：
    - 将 `[格式要求] 行动选项` 更名为 `[格式要求] 剧情选项 [多选]`，放宽为「角色动向 + 叙事功能项」（时间推进、场景转场、临时切视角看幕间、引入合理情境变化、深挖眼下细节、留白静观）按场景自然混搭，移除旧版「正文完整落幕可省略输出」的历史包裹；同步更新 `options_card.html` 填入按钮提示文本；
    - 全线衔接叙事安排与清理遗留包裹：`<core_rules>` 的 `## 玩家输入边界` 明确区分「角色内言行」与「玩家作为共写者的叙事安排」，`叙事推理-重度 / 轻量` 同步纳入叙事安排辨识，三款限知 `[视角]` 改为「常规叙事中」表述以放行单轮幕间切镜；同步清理 `Ark` 早期「化身故事角色」残留、`莉莉丝` 历史确认语、`场景小结` 冗余代写条款与 `多角色调度` 尾句重复；
    - 修正 4 处功能认知偏差：`状态栏` 去掉必含 `{{user}}` 假设以兼容全知/切视角幕间；`正文批注` 放宽至「段落之间或文末」；`防复读检查` 将末尾「关系推进」改为「新的细节反馈或互动展开」避免催熟关系；`防谄媚与读心` 补齐「该亲近热络时自然流露」的正向平衡，防止对亲近角色矫枉过正；
    - 修正全仓 8 处语义歧义、语法指代模糊与开关组合下缺失上下文问题（涵盖女性向 `对自身→对己方`、轻小说体 `主角→当前视角人物`、核心规则 `所指段落→本轮对应场景` 与补主语、格式兼容 `合并为一套→优先保留设定或前文约定的格式`、思考面板/正文批注全关关联模块时的上下文自足、伏笔 `如实留白→略过此项`、重度推理补全参照物及写作规范明确指代）。
  - **区分玩家输入边界与代写边界、精炼去补丁式强调** ([yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_player_control_strict.json](raw_data_cache/prompts/05_执行规则/yd_player_control_strict.json), [yd_player_control_extend.json](raw_data_cache/prompts/05_执行规则/yd_player_control_extend.json), [yd_player_control_free.json](raw_data_cache/prompts/05_执行规则/yd_player_control_free.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_feat_anti_sycophancy.json](raw_data_cache/prompts/05_执行规则/yd_feat_anti_sycophancy.json), [yd_feat_action_options.json](raw_data_cache/prompts/05_执行规则/yd_feat_action_options.json), [yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [yd_feat_format_compat.json](raw_data_cache/prompts/05_执行规则/yd_feat_format_compat.json), [yd_cot_heavy.json](raw_data_cache/prompts/05_执行规则/yd_cot_heavy.json), [yd_cot_subtext.json](raw_data_cache/prompts/05_执行规则/yd_cot_subtext.json), [yd_cot_foreshadowing.json](raw_data_cache/prompts/05_执行规则/yd_cot_foreshadowing.json), [yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json))：
    - `<core_rules>` 移除压制延伸的「绝不臆测」，专注保护玩家已明确给出的表达、拒绝与选择；
    - `允许延伸` 明确授权主动顺延连贯动作、自然反应、情绪体感与简短日常应答以写顺当前互动来回，仅将重大立场/关系/分支决定留给 `{{user}}` 并去掉硬「停笔」截断；
    - 贯彻单点职责归属并清理多处负向补丁强调：正文自然收尾原则唯一收归 `## 正文执行` 收尾句，`行动选项` 以正向顺序「正文自然写完后」承接，`防谄媚与读心`、`正文批注`、`格式兼容`、`心理潜台词`、`伏笔与暗线` 与 `全局梳理` 同步去重瘦身。
  - 调整默认人设配色：泠音改为偏紫 `#9575d8`（紫藤），Ark 改为科技蓝 `#3b9eff`（并同步更新色卡），莉莉丝保持 `#d46b94`。
- **新增三段人设交替确认与轻量对话引导（强化搭档扮演感）** ([yd_assistant_ack.json](raw_data_cache/prompts/01_系统框架/yd_assistant_ack.json), [yd_story_setting_guide.json](raw_data_cache/prompts/02_角色与故事设定/yd_story_setting_guide.json), [yd_setting_ack.json](raw_data_cache/prompts/02_角色与故事设定/yd_setting_ack.json), [yd_chat_history_guide.json](raw_data_cache/prompts/03_聊天历史/yd_chat_history_guide.json), [yd_history_ack.json](raw_data_cache/prompts/03_聊天历史/yd_history_ack.json), [yd_rules_guide.json](raw_data_cache/prompts/04_叙事约定/yd_rules_guide.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json))：
  - 将 `yd_assistant_ack` 更名为 `🤝 核心确认`，并在 `<story_setting>`、`<chat_history>` 后分别新增 `🤝 故事设定确认`（`persona_setting_ack`）与 `🤝 历史会话确认`（`persona_history_ack`），三位人设（泠音 / 莉莉丝 / Ark）各具独立语气与称呼，全关人设时自动回退为简洁中性确认；
  - 配套新增 3 条轻量 `role: user` 引导（`💬 引导 - 故事设定`、`💬 引导 - 历史会话`、`💬 引导 - 写作与执行`），使整体消息流自然交替且不以 `assistant` 结尾，兼容 Gemini 4 / Claude / DeepSeek 等主流接口；
  - 同步理顺模块分布：将 `{{getvar::rule_repeat_check}}` 由 `## 附加输出` 迁回 `## 正文执行` 紧接 `防谄媚与读心`，并在 `preset_manifest.json` 中将 `[功能]` 调整为 `防谄媚与读心 → 正文批注 → 行动选项 → 格式兼容 → 状态栏 → 防复读检查`（总模块数 71）。
- **新增 `[功能] 防谄媚与读心 [多选]` 模块（默认开启）** ([yd_feat_anti_sycophancy.json](raw_data_cache/prompts/05_执行规则/yd_feat_anti_sycophancy.json), [yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json))：
  - 汇入 `<execution_rules>` 的 `## 正文执行` 区域，约束在场角色立足自身利益、性格底色、当下心情与实际已知信息独立行动，不为了迎合玩家主动降低底线或凭空读心，该冷淡、拒绝、误判或各怀心思时如实呈现，并可在悬浮面板一键开关。
- **新增 3 条按深度区分的历史标签清理正则** ([preset_manifest.json](raw_data_cache/preset_manifest.json))：
  - 在「正则设置 -> 其他设置」中将历史上下文清理细分为可独立开关的规则：`历史状态栏清理`（默认开启，`minDepth=6`）、`历史批注清理`（默认开启，`minDepth=8`）、`历史梳理清理`（默认关闭，`minDepth=30`），保留近期连续性与 `<summary>`，避免长对话旧状态栏、早期梳理与远古批注堆积。

### Changed
- **默认启用组合调整为「泠音 + 轻小说体 + 允许延伸」、文风按热度重排、思考腹稿去填空化与折叠卡排版修复**：
  - 默认开关切换为 `泠音` + `轻小说体` + `允许延伸`（配合 `防谄媚与读心`、`第三人称限知`、`张弛自然`、`均衡全面`、`适中篇幅`）；8 款文风按社区常用热度重排为 `轻小说体 → 细腻工笔 → 情色文学 → 直白肉文 → 轻快网感 → 写实白描 → 古风雅韵 → 典雅书面`；
  - 重写 `yd_cot_unified` 并联动三位人设的表达边界与 `persona_ack`，彻底去掉冷冰冰的 5 栏质检填表标题，改为顺着当前人设口吻自然打简短创作腹稿（全关人设时自动退回平实作者笔记），同时清理提示词中“当前选定的文风”“本轮已启用的同类模块”等选项菜单措辞；
  - 修复 `<draft>` / `<summary>` / `<recap>` 内部 Markdown 出现多空行与大间隔的问题：正则捕获裁剪首尾空白，三张折叠卡正文由 `white-space: pre-wrap` 改为 `white-space: normal` 并补齐紧凑的 Markdown 段落/列表/标题间距。
- **批注功能改为无署名形态，读者追加固定为 `※ 点评：xxxx`** ([yd_feat_inline_comment.json](raw_data_cache/prompts/05_执行规则/yd_feat_inline_comment.json), [comment_card.html](raw_data_cache/ui/comment_card.html), [preset_manifest.json](raw_data_cache/preset_manifest.json))：
  - AI 伴读批注改为纯无署名 `※ ……`（用于吐槽、笔记、点评、点破潜台词或伏笔备忘），卡片内移除署名输入框与记忆候选栏，读者追加固定写回 `※ 点评：xxxx` 并显示「点评」徽章，同时向后兼容旧记录中的 `※ 署名：xxxx`。
- **修复提示词边界冲突、禁词表残句隐患与面板/渲染细节** ([yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json), [yd_prefill_draft.json](raw_data_cache/prompts/05_执行规则/yd_prefill_draft.json), [yd_feat_format_compat.json](raw_data_cache/prompts/05_执行规则/yd_feat_format_compat.json), [yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_persona_lilith.json](raw_data_cache/prompts/01_系统框架/yd_persona_lilith.json), [yd_persona_lingyin.json](raw_data_cache/prompts/01_系统框架/yd_persona_lingyin.json), [yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [banned_words_default.txt](raw_data_cache/banned_words_default.txt), [prose_beautify.html](raw_data_cache/ui/prose_beautify.html), [options_card.html](raw_data_cache/ui/options_card.html), [floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - `yd_summary_recap` 明确跳过 `<draft>` 思考面板；`yd_prefill_draft` 绑定 `&输出思考面板` 避免孤立开标签；`yd_feat_format_compat` 补齐外部同类模块与内置模块重叠时的去重原则；调和 `写作规范` 与 `古风雅韵` 对白引导语及三位 AI 人设审美偏好与 `[文风]` 的优先级边界；
  - 重构 `banned_words_default.txt` 为 15 条不破坏句子语法的纯修饰语/套话副词，移除易留下残句的谓语短语与核心名词；
  - `[美化] 正文` 移除每句重复 `<style>` 标签（改由悬浮面板一次性注入全局样式并保留行内高亮），扩展支持 `『...』` 与含 `<em>`/`<strong>` 等行内格式的对白；`[美化] 选择` 填入输入框时若已有草稿改为换行追加不覆盖；
  - 修复 `Claude` 方案与默认参数完全相同导致初次导入误高亮 `Claude` 的显示缺陷（调整为 `reasoning_effort: "medium"`）；为 `全局梳理` 增加悬浮球/面板顶部警示与 `GENERATION_ENDED` 自动关闭机制；高级参数区改为默认折叠并持久化记忆；同步脚本 `info` 为四标签描述。
- **三大主干层职责重划、去除补丁写法与多余提示词说明**：
  - **核心规则重构** ([yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json))：移除顶部模块导览句，精炼为「创作边界」「玩家输入边界」「角色推演与认知边界」「叙事因果」四板块；将 `<story_setting>` 私密背景/隐藏偏好盲区隔离与前文说法可信度区分统一整合，并与 `[代写边界]` 彻底分开各自职责。
  - **写作规范重写** ([yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_writing_spec_relaxed.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_relaxed.json))：将默认规范重构为「描写与用词」「对白与人物」「段落与标点」三板块（保留 3 组 `❌ → ✅` 对比示范、蓄势留白反差与习惯动作递进），清理历次叠加的 7 处补充括号及空泛说教，将宏观节奏交由 `[节奏]` 模块负责；同步精简 `宽松` 规范保持对称。
  - **执行规则四分区与思考/代写协同** ([yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_player_control_strict.json](raw_data_cache/prompts/05_执行规则/yd_player_control_strict.json), [yd_player_control_extend.json](raw_data_cache/prompts/05_执行规则/yd_player_control_extend.json), [yd_player_control_free.json](raw_data_cache/prompts/05_执行规则/yd_player_control_free.json), [yd_feat_format_compat.json](raw_data_cache/prompts/05_执行规则/yd_feat_format_compat.json), [yd_cot_unified.json](raw_data_cache/prompts/05_执行规则/yd_cot_unified.json), [yd_cot_multi_char.json](raw_data_cache/prompts/05_执行规则/yd_cot_multi_char.json), [yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json))：
    - `<execution_rules>` 清晰拆分为「规则优先级」「正文执行」「附加输出」「构思与推演」四区，全部 `{{getvar::...}}` 独立成行，彻底避免 SillyTavern 裁剪变量首尾换行引起的文本首尾连在一起；
    - `[代写边界]` 三档专责未表达部分的续写权限与停笔节点（`自由代写` 保留既有拒绝与选择保护并主动形成双向互动）；
    - `构思推演`、`多角色调度`、`格式兼容` 与 `全局梳理` 清理内部 XML 标签名指路词与规则分级说明，以简明动作词在长对话中保持提醒。
  - **全仓术语与中文表达梳理** ([main.json](raw_data_cache/prompts/01_系统框架/main.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js), [README.md](README.md), [verify.py](tests/verify.py))：统一梳理提示词、悬浮面板帮助、文档及校验脚本中的机械工程词、产品黑话与翻译腔（涵盖防复读检查、构思推演、格式兼容、动作侧重、禁用代写边界及帮助弹窗中的接口说明），全部替换为自然平实的中文表达。
  - **测试校验升级** ([verify.py](tests/verify.py))：将 `[4/8]` 主干层校验升级为结构、变量独立成行防连在一起与核心要求校验，不再锁死早期补丁措辞。

## [0.6.0] - 2026-11-21

### Added
- **新增第三位内置 AI 人设 `Ark`、场景状态栏、多角色调度与 `[总结]` 模式（全部新模块默认关闭，保持 v0.5.1 默认配置不变）**：
  - **`[AI人设]` Ark** ([yd_persona_ark.json](raw_data_cache/prompts/01_系统框架/yd_persona_ark.json), [floating_panel.js](raw_data_cache/ui/floating_panel.js), [comment_card.html](raw_data_cache/ui/comment_card.html))：新增冷静理性的高级人工智能人设 `Ark`（默认关闭，专属主题色 `#46b8a6`），面向“管理员 / master”汇报并严守世界观真实性与正文隔离；同步注册悬浮面板内置人设表与批注卡片作者署名识别。
  - **`[功能]` 状态栏** ([yd_feat_scene_status.json](raw_data_cache/prompts/05_执行规则/yd_feat_scene_status.json), [scene_card.html](raw_data_cache/ui/scene_card.html))：默认关闭，开启后在故事正文之前单独一行输出固定三栏 `<scene>时间｜地点｜在场人物</scene>`，搭配 `[美化] 状态栏` 单行场景条渲染，历史上下文保留以提供时空连续性。
  - **`[思考]` 多角色调度** ([yd_cot_multi_char.json](raw_data_cache/prompts/05_执行规则/yd_cot_multi_char.json))：默认关闭，在两名及以上 NPC 同场时划分焦点与旁观角色、校准知情差异与多方互动；同步补充悬浮面板 `[思考]` 帮助弹窗说明。
  - **`[总结]` 场景小结 / 全局梳理** ([yd_summary_scene.json](raw_data_cache/prompts/05_执行规则/yd_summary_scene.json), [yd_summary_recap.json](raw_data_cache/prompts/05_执行规则/yd_summary_recap.json), [summary_card.html](raw_data_cache/ui/summary_card.html), [recap_card.html](raw_data_cache/ui/recap_card.html))：新增互斥单选组与面板 `?` 使用提示，`场景小结` 汇入 `<execution_rules>` 提供正文后 2~4 句客观总结（`<summary>`），`全局梳理` 以独立 `<special_task>` 置于提示词最尾部（`yd_exec_rules_close` 之后、`yd_prefill_draft` 之前），暂停续写并按四段 `【】` 骨架输出 `<recap>` 档案。
  - **新增 3 条显示美化正则与单源模板** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [sync_ui.py](scripts/sync_ui.py))：注册 `[美化] 状态栏`、`[美化] 小结`、`[美化] 梳理` 及其单源 HTML 模板（总计 8 个 UI 单源资产）。

### Changed
- **适配 SillyTavern 变量换行机制与跨模块职责去重** ([yd_vars_init.json](raw_data_cache/prompts/01_系统框架/yd_vars_init.json), [yd_writing_spec_render.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_render.json), [yd_exec_rules_close.json](raw_data_cache/prompts/05_执行规则/yd_exec_rules_close.json), [yd_cot_unified.json](raw_data_cache/prompts/05_执行规则/yd_cot_unified.json), [yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_pace_auto.json](raw_data_cache/prompts/04_叙事约定/yd_pace_auto.json), [yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json))：
  - 修复 SillyTavern 裁剪 `{{setvar}}` 首尾换行导致的变量汇总连在一起问题：在 `yd_writing_spec_render` 与 `yd_exec_rules_close` 汇总器中显式换行分隔全部 `{{getvar}}` 引用行，并移除 42 个模块内冗余的首尾换行；
  - 精准清理跨模块重复规则：`yd_cot_unified` 精简为核对清单不再大段复述 `<core_rules>`，移除 `yd_writing_spec_general`、`yd_pace_auto`、`yd_style_erotica` 中跨层重复的转折、停笔与通用节奏表述，将 `yd_exec_rules_close` 与 `yd_feat_format_compat` 与可选模块完全拆分开；
  - 强化信息认知盲区与自由代写协同 ([yd_core_rules_default.json](raw_data_cache/prompts/01_系统框架/yd_core_rules_default.json), [yd_player_control_free.json](raw_data_cache/prompts/05_执行规则/yd_player_control_free.json), [yd_cot_unified.json](raw_data_cache/prompts/05_执行规则/yd_cot_unified.json))：将 `<core_rules>` 首句理顺为“推演客观世界与角色互动”，明确 `<story_setting>` 中他人的私密设定与隐藏偏好对未亲历/未获知角色均属未知，在 `yd_cot_unified` 显式核对认知盲区与双向互动，并将 `自由代写` 升级为主动接管指令以消除 NPC 单方面独角戏。
- **正则跨卡片隔离与结构化测试校验升级** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [verify.py](tests/verify.py), [preview.html](tests/preview.html))：
  - 扩展 `[美化] 批注`、`[美化] 选择` 与 `[美化] 正文` 的隔离断言，保护 `<scene>` / `<summary>` / `<recap>` 及渲染卡片内部引号不被正文对白着色误伤，同时防止 `<draft>` 内部示例标签泄漏；
  - 将 `verify.py` 扩展至 65 个模块、8 个单源 UI 资产与新正则 V8 测试（新增断言均采用结构校验，不写死新模块提示词文本）。

## [0.5.1] - 2026-11-21

### Changed
- **通用叙事张弛能力建设、层次划分与中文自然表述校准**：
  - **`[写作规范]` 默认 / 宽松** ([yd_writing_spec_general.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_general.json), [yd_writing_spec_relaxed.json](raw_data_cache/prompts/04_叙事约定/yd_writing_spec_relaxed.json))：协调“每轮推进”与 `<core_rules>` 自然停留原则，明确平缓相处时的态度微变、观察试探、沉默对峙与情绪酝酿同样具有叙事价值，不强行制造事件转折；将 `### 详略与节奏` 拆清为“细节服务重点”“疏密随场景与情绪起伏（不必每轮走完从铺垫到高潮的完整流程）”“密集描写之间穿插留白”“善用铺垫蓄势”“善用前后反差”等清晰条列，并与 `宽松` 模块精简同步。
  - **`[节奏]` 张弛自然** ([yd_pace_auto.json](raw_data_cache/prompts/04_叙事约定/yd_pace_auto.json))：明确负责按事件轻重安排叙事快慢与场面详略，与写作规范及文风的句式松紧各自独立分工；对有意义的观察、僵持对峙或仍在酝酿消化情绪的场景稳住节奏、不急于跳场。
  - **`[文风]` 情色文学 / 直白肉文** ([yd_style_erotica.json](raw_data_cache/prompts/04_叙事约定/yd_style_erotica.json), [yd_style_pulp_smut.json](raw_data_cache/prompts/04_叙事约定/yd_style_pulp_smut.json))：
    - 情色文学移除硬性的“一段只立一个感官焦点”，改为清晰情绪重心（允许矛盾拉扯）与克制聚焦的细节描写，允许短对白/停顿/走神缓一口气；明确区分性格处境与生理反应，生理反应不能单独作为意愿依据也不能推翻明确表达；在取消示例字数限制后舒展重写 `示例 2`，完整展现碰触前停顿蓄势、确认意愿、微物走神与压抑反差。
    - 直白肉文清理“肉感变形 / 清点单 / 拉满临场节奏”等借词与网络词，明确紧扣当下情境与人物互动、靠动作起落与留白调动想象空间；同步舒展重写 `示例 2` 体现动作前悬停逗弄、猛撞与退至浅处慢磨的快慢节奏起伏。
  - **`[NSFW倾向]` 男性向** ([yd_nsfw_bias_male.json](raw_data_cache/prompts/04_叙事约定/yd_nsfw_bias_male.json))：将“傲娇者口头推拒却不自觉迎合”与“心理变化”校准为“情绪松动与态度反差（如言语仍在挑衅却主动靠近）”，消除与意愿边界规则的潜在冲突。
  - **`[思考]` 构思推演** ([yd_cot_unified.json](raw_data_cache/prompts/05_执行规则/yd_cot_unified.json))：将第四项 `叙事与篇幅校准` 校准为“把控叙事视角、行文语感、剧情节奏与描写重心，结合当下场景特点、事件轻重与情绪变化统筹详略和篇幅（不必每轮都刻意安排戏剧冲突或完整的情绪起伏）”。
  - **测试校验与版本留存** ([verify.py](tests/verify.py))：移除文风示例的字数与逗号数量硬性限制，同步更新 7 个模块的正反向静态断言；按重要节点留存原则同时保留 `V0.5.0.json` 与 `V0.5.1.json`。

## [0.5.0] - 2026-11-19

### Added
- **悬浮控制面板新增「参数设置」独立页签** ([floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - 将面板由三页签扩展为 **「预设设置 / 参数设置 / 正则设置 / 助手设置」** 四页签，严格坚持**「参数只管参数，绝不联动任何提示词开关」**的职责边界；
  - 顶部内置 **4 套简洁模型方案**（`Gemini4-low` / `Gemini4-high` / `Claude` / `DeepSeek`，无副标题、按紧凑胶囊排布），切换方案仅调整推理强度、回复上限、核心采样与惩罚参数，**绝不覆写或缩减玩家的 `max_context` 重度长上下文设置与 `should_stream` 偏好**；
  - 提供「清零惩罚项」「恢复默认参数」、思考深度 (`auto/low/medium/high/max`) 单行分段切换、最大回复长度 (`8192/16384/32768/65536` + 自定义) 与重度上下文 (`200K/500K/1M/2M` + 自定义) 微调、Temperature / Top-P 滑块数字联动、返回思考内容/流式开关及默认展开的高级采样与惩罚参数区；
  - 将全面板 6 处 **`?`** 提示统一改造为**不挤压正文的抽屉内智能锚定悬浮窗**（支持上下自动避让、点空白/滚动/`Esc`/切页自动关闭），并清理方案副标、思考深度、悬浮球坐标（`距左 / 距顶`）及长度单位（tokens）等歧义简写。

### Changed
- **预设默认生成参数与全仓口径同步** ([preset_manifest.json](raw_data_cache/preset_manifest.json), [main.json](raw_data_cache/prompts/01_系统框架/main.json), [sync_ui.py](scripts/sync_ui.py), [README.md](README.md))：
  - 全局默认 `openai_max_tokens` 由 `8192` 提升至 **`16384`**（为原生思考与长章正文留足额度），默认 `top_p` 校准为中性无限制 **`1.0`**，维持 `openai_max_context: 2000000`（`max_context_unlocked: true`）与 60 模块 `prompt_order` 不变；
  - 升级 `sync_ui.py` 自动同步 `main.json` (`✨ST-使用说明`) 版本标题，清理 `main.json`、`README.md` 与 `tests/verify.py` 中的过时“三页签 / `8192`”旧描述并补充常见排错 FAQ。

## [0.4.1] - 2026-11-19

### Fixed
- **悬浮控制面板竞态与正则同步修复** ([floating_panel.js](raw_data_cache/ui/floating_panel.js))：
  - 修复 `mergePresetRegexes` 与 `toggleRegexItem` 在酒馆重新生成正则 UUID 时的重复渲染及开关失灵问题（建立 `id` / `name` 双索引合并，并在 ID 未命中时按脚本名安全替补匹配）；
  - 补齐 `applyBannedRegexToTavernList` 对缺失 `历史禁词清洗` 运行态正则的自动补建（严格符合标准 `TavernRegex` Schema）；
  - 将 `mutateBannedWords` 改造为基于串行队列实时读取最新预设词表的增量变换，`isSelfUpdating` 升级为引用计数 `selfUpdateCount`，彻底消除快速连点删词回滚及并发定时器覆盖问题；
  - 补齐 `applyDynamicToggle` 非法目标空值保护与 `cleanupPanel` 卸载态拦截/定时器清理。
- **批注与选项卡片边界修复** ([comment_card.html](raw_data_cache/ui/comment_card.html), [options_card.html](raw_data_cache/ui/options_card.html))：
  - 修复 `comment_card.html` 清空末楼后仍保留可追写空卡片导致报错的缺陷（切换为「已清空」状态并隐藏追写栏，兼容 CRLF 清理，`detectMessageContext()` 自动跳过已删除卡片，消除后续同消息批注块索引偏移）；
  - `comment_card.html` 动态读取预设中全部自定义 `[AI人设]` 识别为「作者」，并将用户记住的自定义读者署名归类为「读者」徽章；
  - 修复 `options_card.html` 将 `12:30` 等时间文本误拆为标题、以及未能剥离 `**加粗**` 标题星号的解析缺陷。
- **流式未闭合 `<draft>` 正则隔离与提示词空行精简**：
  - `[美化] 批注 / 选择 / 正文` 三条显示正则补齐行锚定未闭合 `<draft>` 负向后行断言保护，避免流式输出或截断时误渲染 `<draft>` 内部文本；
  - 紧凑化 `yd_writing_spec_render` 与 `yd_exec_rules_close` 变量拼接换行，消除发送给模型的 `<narrative_rules>` / `<execution_rules>` 中 3~9 连多余空行（全部开关组合下严格零 `\n\n\n`）。

### Changed
- **术语语义化正名与中文日常习惯贴合**（保持全部 60 模块 `identifier` 不变，确保旧存档无损升级）：
  - `[玩家控制]` ➔ **`[代写边界] 禁止代写 / 允许延伸 / 自由代写`**（同步正文前缀 `- 代写边界：`）；
  - `[NSFW倾向] 无倾向` ➔ **`[NSFW倾向] 通用`**，`[文风] 肉文直白` ➔ **`[文风] 直白肉文`**，`[节奏] 跳场略写` ➔ **`[节奏] 快进略写`**；
  - `[篇幅]`：`短篇 / 中篇 / 长篇` ➔ **`较短 / 适中 / 较长`**（保留字数区间）；
  - `[功能]`：`段间批注` ➔ **`正文批注`**、`防重复校验` ➔ **`防复读检查`**；`[思考] 基本推理` ➔ **`构思推演`**；思考卡徽章 `推演存档` ➔ **`推演过程`**。
- **卡片交互增强与 `v0.4.0` 口径/文档收尾**：
  - `comment_card.html` 追加署名栏升级为「单输入框 + 卡内流式署名候选栏」（默认 `master`，内置 `master` / `正文批注` 并记住自定义读者署名与上次选用，附带 `×` 按钮清理记忆名称，彻底避免原生 `<datalist>` 在酒馆 `iframe` 中的位置偏移与前缀截断）；
  - 修复脚本 `sync_ui.py` / `build_preset.py` / `build_docs.py` 跨平台 LF 写盘、`floating_panel.js` 不可达死分支与 `tests/verify.py` 字节级 CRLF 检验，清理过时注释；
  - `options_card.html` 新增「填入 / 发送」输入模式 `localStorage` 持久记忆；
  - 精修 6 处 `v0.4.0` 遗留提示词微瑕（`声线微哑` ➔ `呼吸轻颤`、`嘴上逞强` ➔ `口头推拒却不自觉迎合`、`嘴硬挑衅` ➔ `故意反讽挑衅`、`交代充足的互动与气氛细节` ➔ `写足人物互动与情绪张力`、`按当下信息量自然把控` ➔ `按当下的情绪张力与互动推进自然把控`、移除机制词 `下意识` / `本能`）；
  - 修正 `README.md` 过期 `<构思>` / `<选择>` FAQ、重复段落与错别字，并同步 `scripts/build_docs.py` 与 `tests/preview.html`（单源拉取清单正则并补全回归用例）。

## [0.4.0] - 2026-11-18

### Changed
- **情色叙事的情绪导向、详略张弛与男女向指导重构**：
  - **`[写作规范]` 默认 / 宽松**：新增 `### 详略与节奏`（细节服务于此刻情绪、感受或推进，疏密随情绪曲线起伏，修饰服务于表达），并修正跨回合硬编无关新景物细节的诱导；
  - **`[文风]` 情色文学 / 肉文直白**：重构为“以情绪与感受为主线、一段只立一个感官焦点 / 每分镜只聚焦一个特写 + 镜间换气节奏”，并将两款文风共 6 段示范重写为「张力型 / 峰值型 / 余韵型」三种疏密，彻底清除道具清单堆砌与“高密度”指令；
  - **`[NSFW倾向]` 无倾向 / 男性向 / 女性向 & `[NSFW细化]` 反应多样性**：从“前戏/进入/持续/高潮/事后”阶段清单与部位参数表重构为“主线感受 → 互动回馈 → 取舍原则”结构（补齐男性向双向感受与主导感、女性向被珍视确认感与铺垫拉扯张力，压缩部位参数罗列）；
  - **`[节奏]` 慢笔细写、`[篇幅]` 中篇 / 长篇 & `[思考]` 基本推理**：同步保持“放慢重在把同一瞬间写深而非罗列更多物件、按本轮情绪曲线分配详略疏密与篇幅”的一致要求。

## [0.3.0] - 2026-11-18

### Added
- **动态「禁词清洗」管理器与第 6 条内置正则 `历史禁词清洗`**：
  - 新增单源词表文件 [banned_words_default.txt](raw_data_cache/banned_words_default.txt)（含 28 条出厂默认高频修饰语与套话词条），由 [sync_ui.py](scripts/sync_ui.py) 同步至 `preset_manifest.json` 与 [floating_panel.js](raw_data_cache/ui/floating_panel.js)；
  - 新增默认开启的 `历史禁词清洗` 内置正则（`placement: [2]`、`promptOnly: true`、`markdownOnly: false`），采用单条正则纯剔除方案，仅在发送给模型前从 AI 历史回复中剔除已录入词条，不改写聊天存档与界面显示；
  - 悬浮面板「正则设置」页签新增 **「禁词清洗」** 管理分区：支持词条标签展示与一键删除、添加输入校验（去空、去重、单条最多 40 字、上限 80 条）、恢复默认并即时重编译同步至酒馆预设正则，标题旁附 `?` 图标可点击展开/收起说明卡（说明作用、定位、录入建议与不生效范围）。

### Changed
- **整组重写结尾停笔与玩家控制边界（修正因果倒置）**：
  - `⚙️ 执行规则 - 汇总`（`yd_exec_rules_close`）移除“写至需要 `{{user}}` 回应或抉择的节点时利落停笔、把主动权交还 `{{user}}`”的必达指令，改为正向引导“随场景脉络在恰当的画面、余韵或阶段节点自然收束”；
  - `[玩家控制] 完全控制 / 允许延伸` 统一界定边界：仅当推进中触及需要 `{{user}}` 表态或抉择的节点时在该处停笔，留由 `{{user}}` 自行回应或决定；
  - `[思考] 基本推理`（`yd_cot_unified`）第 3 维与第 5 维（`收束与层级核对`）同步采用“自然收束、触及决策边界再停笔”的统一因果逻辑。
- **整组重写套话与“生理性”标签的提示词治理**：
  - `[写作规范] 默认 / 宽松` 新增正向句法约束：直接描摹眼神、声线、呼吸与肢体反应展现情绪和状态，不用“生理性、本能般、条件反射”等机制标签替代画面，少用“硬生生、死死、狠狠”等受迫修饰，并精简示例括号长度；
  - 清理 `[文风] 情色文学`、`[文风] 肉文直白` 示例 2 与 `[NSFW细化] 反应多样性` 中的同源诱发词（“生理泪水 / 眼神失焦 / 死咬 / 狠狠 / 死死 / 硬是”），改为直观可感的画面描写。

## [0.2.6] - 2026-11-18

### Changed
- **酒馆 UI 中文图标化命名、变量防连串、写作规范凝练与分组联动机制**：
  - **中文 UI 条目名 + 英文 XML 内容独立分工**：将 6 个包装/汇总条目的显示名称升级为 `📖 故事设定 - 开始/结束`、`💬 历史会话 - 开始/结束`、`📐 叙事约定 - 汇总` 与 `⚙️ 执行规则 - 汇总`，内部仍保持纯净英文 XML 标签。
  - **全量 `04`/`05` `setvar` 首尾双换行规范**：为 `04_叙事约定` 与 `05_执行规则` 全部 39 个非空 `setvar` 变量补齐结尾 `\n`（形如 `{{setvar::key::\n内容\n}}`），保留渲染容器换行占位，避免不同变量语义块首尾连在一起（同步升级 `verify.py` 使用平衡括号扫描器检验，正确兼容内部 `{{user}}` 宏）。
  - **`[写作规范]` 默认/宽松凝练去修饰**：清理虚浮修饰词藻，合并“忌硬凑生涩替代词”重复条款，完整保留语义区分与所有 `❌ → ✅` 正反例。
  - **新增动态分组联动规则 `[分组名] 条目名 [单选/多选]&条目名称1&条目名称2`**：[floating_panel.js](raw_data_cache/ui/floating_panel.js) 支持按 `&` 绑定的条目名称动态显隐子条目（为空或全未匹配目标时默认显示；任一目标启用即显示，全关时隐藏并自动级联将子条目 `enabled` 设为 `false`，空分组同步隐藏）。

## [0.2.5] - 2026-11-18

### Changed
- **规则边界校准与前端交互面板健壮性加固（思考模块保持默认双开与完整推演）**：
  - **规则边界微调**：
    - `[玩家控制] 无限制` 显式补齐“不得覆盖 `{{user}}` 刚刚明确表达的拒绝、既定事实与关键选择”，与 `<core_rules>` 保持一致；
    - `<core_rules>` 在 `## 世界与角色推演` 中凝练加入“信息须保留其来源与可信程度，转述不会自动提高信息可信度，后续证据可以修正先前认知”；
    - `[NSFW细化] 反应多样性` 开头明确“按人物设定与当前情境选择性参考，不要求每次亲密互动逐项覆盖；描写密度由当前互动阶段自然决定”；
    - `[写作规范] 默认` 将高频网文套话黑名单调整为“重点排查并尽量避开”，避免为绕开字眼硬凑生涩替代词。
  - **前端交互面板加固**：
    - `comment_card.html`：当索引失配且存在多个相同批注块时，拒绝猜测写回并提示刷新消息；唯一匹配时保留安全替补匹配；
    - `options_card.html`：发送模式增加 `sendBtn.disabled` / 可见性兼容校验（不可用时改为填入输入框并提示）与 `800ms` 连点防抖。

## [0.2.4] - 2026-11-18

### Changed
- **全量英文 XML 标签迁移、人设模板规范化、跨条目去重与元认知清理**：
  - **全量英文 XML 标签统一**：将提示词骨架与输出标签统一切换为 `<core_rules>`、`<story_setting>`、`<chat_history>`、`<narrative_rules>`、`<execution_rules>`、`<draft>`（替代 `<构思>`，与原生 `<think>` / `<thinking>` 互不冲突）与 `<options>`（替代 `<选择>`），并同步更新 5 条内置正则、`comment_card.html`、文档与 V8 测试校验。
  - **变量初始化零换行**：`⚙️ 变量初始化`（`yd_vars_init`）改为紧贴单行无换行初始化，彻底消除初始化条目的空行输出。
  - **AI 人设模板重构与去过度修饰**：`莉莉丝` 与 `泠音` 改为「身份定位 + 性格特质 / 创作偏好 / 表达边界 + 日常开口风格」结构化模板，保留完整性格与创作细节，去除过度修饰词藻并梳理为自然表述。
  - **跨条目冗余清理**：精简 `<core_rules>` 中与 `[视角]` 重复的幕后呈现说明、`[功能] 防重复校验` 中与 `[写作规范]` 重复的开篇/景物措辞、`[侧重] 均衡全面` 尾部重复禁令，以及 `<execution_rules>` 输出要求前两条的重复停笔表述。
  - **消除玩家控制标题性元认知泄露**：`[玩家控制]` 三档模块移除泄露 UI 选项名的 `（完全控制）` / `（允许延伸）` / `（无限制）` 括号标题，统一使用中性前缀 `- 玩家控制：`。

## [0.2.3] - 2026-11-18

### Changed
- **双 AI 人设重塑、核心层助手确认条目、变量体系优化与玩家控制权分级**：
  - **AI 人设性格优化与正文防过拟合**：
    - `[AI人设] 莉莉丝` 调整为**鬼点子多、爱挑逗捉弄的色气雌小鬼魅魔**（温柔知性为辅），去掉生硬的毒舌与傲气嘴硬；
    - `[AI人设] 泠音` 调整为**温润沉静、书卷气、耐心剖析且留有温度的文学编辑感创作者**，去掉偏冷疏离与毒舌；
    - 显式隔离日常沟通口吻与正文角色口吻，避免人设风格溢出。
  - **新增核心层 `assistant` 确认条目（`🤝 助手确认` / `yd_assistant_ack`）**：
    - 置于 `<核心准则>` 之后、`<故事设定>` 之前，通过 `{{getvar::persona_ack}}` 动态响应「莉莉丝 / 泠音 / 无激活人设」，在角色消息流上分隔顶层系统提示词并强化助手自认同。
  - **变量体系优化**：
    - `⚙️ 变量初始化`（`yd_vars_init`）上移至 `✨ST-使用说明` 之后、`[AI人设]` 之前并紧贴去空行，保证全变量先初始化后覆写；
    - 移除 `target_length` 的隐藏 `600~1200 字` 默认后备值（改为空初始化），关闭全部 `[篇幅]` 选项时彻底交由场景自由把控；保留渲染容器的单行换行分隔。
  - **新增 `[玩家控制]` 三档分级与 `<核心准则>` 分工拆分**：
    - 在 `05_执行规则` 新增 `[玩家控制] 完全控制 [单选]`（默认开启）、`[玩家控制] 允许延伸 [单选]` 与 `[玩家控制] 无限制 [单选]`，各自独立界定对 `{{user}}` 言行、心理与感官体验的描写尺度；
    - `<核心准则>` 的 `## 玩家边界` 剥离描写尺度与跨模块引用，专注保护“不臆测、篡改或覆盖 `{{user}}` 已明确给出的言行、心理与感官体验”与输入意图边界。

## [0.2.2] - 2026-11-18

### Changed
- **主旨归位、去补丁化、文风示例结构化与情色/高H模块具象化**：
  - **`<核心准则>`（`[核心规则] 默认`）主旨去敏归位**：
    - `## 创作边界` 彻底移除成人向与感官场景相关表述，回归“虚构背景与虚构角色下真实、沉静、可代入的互动体验”；亲密内容的授权与尺度统一交由情色类模块承担；
    - 清理 `## 世界与角色推演` 与 `## 叙事因果` 末尾的否定式补丁表述。
  - **`<叙事约定>` 去元认知泄露与文风不干涉原则**：
    - 移除 `yd_writing_spec_render` 中固定写死的 `## 叙事协调` 段落，消除关闭文风/节奏/侧重时的悬挂引用与元认知泄露，容器恢复纯净变量占位组装；
    - `[写作规范] 默认` 移除“罩杯字母”“生理反应”等敏感词及“依所选文风自然舒展”元引用；
    - 确立**文风只约束语言质感、句式节奏与表达尺度，不干涉剧情走向与内容刻画**原则；8 款文风各 3 段示范统一按「对话交锋 / 动作神态 / 环境氛围（含人物互动）」重排并保持充实细节体量；
    - `[文风] 情色文学` 去除过度文学化的散文腔，贴合通俗交互式高热言情；`[文风] 肉文直白` 贴合**本子画风的高H小说**（近景分镜特写、直白拟声词与高密度感官冲击）。
  - **`[NSFW倾向]` / `[NSFW细化]` 分阶段具象化**：
    - `无倾向`、`男性向`、`女性向` 与 `反应多样性` 补充前戏、进入、持续、高潮、事后各阶段的可执行感官与动作/反应细则。
  - **`<执行规则>` 双思考与输出约束精简**：
    - `[思考] 输出思考面板` 与 `[思考] 基本推理` 去除双开时的括号补丁与重复强调，消除对可能关闭模块的元术语引用；
    - `<执行规则>` 第六顺位收口为“其余附加输出内容”，`[功能] 段间批注` 去除括号补丁，保持简洁独立。

## [0.2.1] - 2026-11-18

### Changed
- **宏观写作规范 vs 具体文风职责分开、玩家边界精修与工程稳健性加固**：
  - **`<叙事约定>` 宏观标准与具体风格彻底分层**：
    - `## 叙事协调` 确立“宏观写作标准（`写作规范`）vs 具体审美风格（`文风`）”分工、多段示范分切参考原则（不在单轮强走全流程），并补齐单选分组关闭时的自然行文补充说明；
    - `[写作规范] 默认` 移除越界压制非白描文风的“具体物象以直陈白描为主”“直观日常感官”“日常对话自然带语气词”等局部风格限制，确保与 `情色文学`、`细腻工笔`、`古风雅韵`、`典雅书面` 等所有文风顺畅兼容；
    - 修复 `[写作规范] 默认 / 宽松` 中“{{user}} 本轮发言均须用双引号直接写出”导致的格式越权，精确限定仅人物实际说出口的台词用双引号，`{{user}}` 输入中的动作、神态、意愿或场景补充按原语义自然承接。
  - **`<核心准则>` 因果去显性化、证据强度与历史可信度完善**：
    - `## 玩家边界` 区分玩家对时间推进/转场节奏的合理叙事授权（直接承接）与替 NPC 预写顺从反应或单方面写定对抗结果（视作主观意图/尝试）；
    - `## 世界与角色推演` 引入状态变化证据强度（变化幅度须与事件分量及持续时间匹配，不以短暂刺激自动改写长期定位与核心性格）与 `<历史会话>` 信息可信度区分（角色口头说辞、敷衍、未兑现计划或被后续修正的旧判断不自动等同于客观事实）；
    - `## 叙事因果` 明确关键决策与立场转变需可追溯因果依据，而日常互动、本能反应与情绪爆发即时自然呈现，不在正文中机械拆解为显性推导步骤。
  - **`<执行规则>` 跨轮独立性、留白判断与双思考去重**：
    - `[思考] 输出思考面板` 与 `[思考] 基本推理` 保持默认双开与全量五项完整推演，消除拼接时连续重复的引导语，并与前文术语形成一致的参照对应；
    - `[功能] 行动选项` 去除固定四件套举例诱导，补充 NPC 提出开放性提问时自然留白不输出选项的准则；
    - `[功能] 格式兼容` 去除对未启用模块的跨模块概念悬挂引用；`[功能] 段间批注` 补充“不让批注口吻串入正文叙事”的双向上下文语态隔离；`[功能] 防重复校验` 拉开职责梯度，专注跨回合语义与段落结构循环破局。
  - **UI 卡片与单源构建工程加固**：
    - [comment_card.html](raw_data_cache/ui/comment_card.html)：`detectMessageContext()` 兼容未完成 DOM 挂载的兄弟 `iframe[srcdoc]` 计数，新增页面级跨 `iframe` 写回互斥锁 `__YD_COMMENT_WRITE_LOCK__`，并将同名批注块匹配升级为基于 `Math.abs(idx - ctx.blockIdx)` 的最近邻定位；
    - [sync_ui.py](scripts/sync_ui.py) 与 [build_preset.py](scripts/build_preset.py) 实现从单一权威源 `prompt_index` 自动同步生成 `100000` / `100001` 两组 `prompt_order`；
    - [verify.py](tests/verify.py) 扩充多批注块隔离与同名块最近邻定位、以及 `<选择>` 多分支解析的 V8 回归测试。

## [0.2.0] - 2026-11-17

### Changed
- **叙事因果逻辑、六顺位冲突取舍与完整回合执行体系升级**：
  - **`<核心准则>`（[核心规则] 默认）原生补强**：
    - `## 玩家边界` 明确区分 `{{user}}` 已完成的行动、尝试、意愿、提问与假设性描述，并将顺承描写严格限定为体感（冷暖、痛感或受力位移）与必需衔接动作，不代判主观情绪或后续抉择；
    - `## 世界与角色推演` 确立人物稳定性格底色与波动情绪/态度/关系状态的分层机制、已确认事实/个人认知/猜测/未知四级知识边界、长期关系/未了约定/未解矛盾连续性，以及“幕后时间线推进 ↔ 视角准入”的衔接规则；
    - 新增平级 `## 叙事因果` 章节，明确因果链推演逻辑与“日常积累/观察试探同样构成有效推进”的原则，避免为制造戏剧性而跳过因果或强行反转。
  - **`<叙事约定>` 协同总则与技法校准**：
    - 在 `<叙事约定>` 顶部新增 `## 叙事协调`，统一规定规范与文风协同、语感示范防模板化、以及时间流速节奏与描写侧重之间的详略配合；
    - `[写作规范] 默认` 与 `[写作规范] 宽松` 校准为“准确自然优先”并区分有叙事意义的习惯复现与无实质进展的复读，从通用禁用清单中剔除会误伤限知推测的 `"似乎"`；
    - 重写 `[文风] 细腻工笔` 示例 2 消除与示例 1 重叠的“水杯/水珠”道具依赖，校订 `[文风] 轻小说体` 示例 2 口癖；
    - 升级 4 个 `[视角]` 模块明确“观察主体主观揣测 + 幕后线索准入”边界，校订 `[节奏] 慢笔细写` 反应层次表述以严守限知边界。
  - **`<执行规则>` 六顺位取舍、完整双开推演与功能质效提升**：
    - 在 `<执行规则>` 顶部确立 6 顺位 `## 规则优先级`（世界设定与既定事实 ➔ 玩家控制权/NPC自主性/视角边界 ➔ 因果与状态衔接 ➔ 叙事约定 ➔ 参考篇幅/节奏/侧重 ➔ 附加输出）；将 3 档 `[篇幅]` 与 `⚙️ 变量初始化` 调整为依内容重心分配的软性参考目标；
    - 保持 `[思考] 输出思考面板` 与 `[思考] 基本推理` 默认双开且全量五项完整执行，将输入意图判别、性格/状态分层、因果链推演、长期连续性、视角与格式核对原生织入五项推理框架；
    - 完善 4 个 `[功能]` 模块：`格式兼容` 明确正文/附加标签/正文外附加输出的独立划分；`段间批注` 明确正文外伴读层定位（支持即兴点评、自省、吐槽、潜台词与伏笔备忘，且历史批注不直接覆写既定故事事实）；`行动选项` 强制给出 2~4 个不同风格或不同作用的实质分支且自然收尾时可省；`防重复校验` 升级为聚焦实质新内容与递进层次的语义防重。

## [0.1.6] - 2026-11-17

### Changed
- **全仓列表 `**...**` 格式、变量换行排版与源码文件规范统一**：
  - **统一去除列表前缀加粗混用**：取消 `[功能]`（`格式兼容` / `段间批注` / `行动选项` / `防重复校验`）与 `[思考] 基本推理` 五项清单中的 `- **...**：` 加粗前缀，统一采用全仓一致的 `- 标签：说明` 纯条列形式；并在 `<执行规则>` 顶部补齐对称标题 `## 输出要求`。
  - **优化变量编写排版（不同变量严格换行 + 单变量先换行再填内容 + 允许合理空行）**：
    - 重排 `yd_vars_init.json` 为按 `<叙事约定>`、`<执行规则>`、`<构思>` 三组换行的清晰结构；
    - 拆分 `yd_cot_output_draft.json` 与 `yd_cot_unified.json` 内的双变量同排连写，消除双开时连续两句“动笔前先……”起手重复；
    - 全仓全部非空 `{{setvar::变量名::\n内容}}` 统一在 `::` 后先换行再写入正文内容；
    - 优化 `<叙事约定>` 与 `<执行规则>` 容器的逐行占位排版，保证模块间保持一致的呼吸间隔，消除多连空行堆叠。
  - **统一 56 个 Prompt JSON 文件规范**：统一全仓源码 JSON 字段键序、LF 行尾与文件末尾单换行（EOF `\n`），并在 [verify.py](tests/verify.py) 新增对应静态校验检查。

## [0.1.5] - 2026-11-17

### Changed
- **人设中文口语化校准与全仓连贯性/健壮性纠正**：
  - **两款人设贴合实际创作需求并清除书面腔**：
    - `[AI人设] 莉莉丝 [单选]`：拿掉“无实际经历”与刻意傲娇桥段，剔除旧派书面表达，锚定“坏心眼、腹黑毒舌、略带傲气嘴硬、懂写亲密戏必须由情绪张力和心理暗流带动感官”的成熟魅魔写手本色，配以地道松弛的中文口语示例；
    - `[AI人设] 泠音 [单选]`：消除“常年伏案/顾忌体面”等老气感，重塑为年轻、审美锐利、清冷毒舌又带冷幽默的创作者形象，保持自然口语手感。
  - **全仓 5 处连贯性与健壮性梳理纠正**：
    - `[思考] 输出思考面板` & `[思考] 基本推理`：消除双开时“在 `<构思>` 内”与“先在内部”的语义冲突及重复引导，统一顺畅兼容单开、双开与原生思考模型；
    - `[写作规范] 宽松`：修正末句倒置表述为“优先顺应 `<故事设定>`/`<历史会话>` 的具体要求并保持当下叙事顺畅自然”；
    - `<核心准则>`：调整说教限定范围为“保持纯粹沉浸的故事叙事，不附加脱离剧情的说教或免责声明”；
    - `[功能] 行动选项`：删去 `<选择>` 模板内易被模型原样输出的孤立 `...` 行；
    - `[写作规范] 默认`：放宽旁白正常语意骤转的破折号使用，精准限制仅不用括号或破折号插注解释。

## [0.1.4] - 2026-11-17

### Changed
- **AI 人设重塑与防过拟合校准（参照社区高活性人设思路）**：
  - 重构 `[AI人设] 莉莉丝 [单选]` 与 `[AI人设] 泠音 [单选]`：全面废除五段式 `## 基础档案` 履历表单及 `任务承接：……` 割裂式过渡句，改为确立人物“本身就是干这行的”客观陈述与性情机制（将莉莉丝补全为嗜好心动拉扯、腹黑毒舌、傲娇且理论深厚但零实战经历、立志写出浑身燥动文字的魅魔；同步将泠音重塑为沉静较真、外冷内热的职业写作者）；
  - 消除过度修饰与舞台动作过拟合源：摒弃第三人称动作旁白与道具小动作复读，仅保留 `2~3` 句纯第一人称日常口语原话示例（与下游写作流程各自独立），兼顾鲜活语态与防过拟合稳定性；
  - 参照 `<核心准则>` 极简统一下游 2 处表述：将 `<核心准则>` 末句收窄为“保持故事正文纯粹沉浸，不在正文之外附加脱离剧情的说教或免责声明”，避免误压正文本体之外交互声线；将 `[思考] 输出思考面板` 中的“思路分析”微调为“构思梳理”。

## [0.1.3] - 2026-11-17

### Changed
- **基于 LLM 解析效益的格式规范统一与标题清理**：
  - 移除 `<执行规则>` 下生造拼接标题 `## 输出与收尾规范`，让篇幅、收尾与 `[功能]` 条目直接置于 `<执行规则>` 下；
  - 统一移除标题上的版本/菜单补丁修饰：`## 通用写作规范` 与 `## 通用写作规范（宽松）` 统一为 `## 写作规范`，`## NSFW 倾向（...）` 统一为 `## 亲密描写规范`，`## NSFW 细化：反应多样性` 调整为 `## 亲密反应细化`，8 款 `[文风]` 的示范标题还原为纯粹的 `### 语感示范`；
  - 清除同义归纳型加粗前缀：去掉 `[写作规范] 宽松` 4 条、8 款 `[文风]` 4 条与 `[NSFW细化]` 前 2 条无实质解析增益的 `- **标签**：` 加粗前缀，统一为高信息密度的纯 `- 指令` 条列（仅在 `<执行规则>` 异构 `[功能]` 动作与 `[思考] 基本推理` 多步推演清单保留加粗标记），并按“能正向引导则正向、必要红线保持明确禁用语义”的原则校准各文风与宽松规范用语。

## [0.1.2] - 2026-11-17

### Changed
- **清除过度解释、冗余分支与简练歧义**：
  - `[功能] 段间批注` 删去“有无名号”分支解释、列表符防御补丁与出戏嘱托，回归直白的 `※ 署名：……` 范式，保留完整的伴读点评/潜台词/伏笔备忘及历史批注反馈承接定位；
  - `[功能] 行动选项` 精简多余括号防御补丁，保持 `2~4` 项不同取向与单行可直发具体言行格式；`[功能] 格式兼容` 与 `<执行规则>` 去除“功能区块”等工程黑话与冗余嵌套说明；
  - `[思考] 基本推理` 去掉“写入独立构思环节”隐性耦合，`[思考] 输出思考面板` 补齐“只写思路分析与状态核对、不提前写出正文”的独立边界；
  - `[AI人设]` 收束为“带着上述审美与表达性格承接创作与协作”，避免诱导正文旁白口吻串味；
  - 8 款 `[文风]` 的示范防复用提示精简为标题 `### 语感示范（仅作语感参考）`，并移除 `[文风] 情色文学` 的防御性过渡补丁；
  - 补实 `[侧重] 均衡全面` 调度细节、`[节奏] 张弛自然` 不越权跳过关键抉择的边界、`⚙️ 变量初始化` 默认篇幅弹性参考尺度（`600~1200 字`）、`[核心准则]` 玩家连带动作与 NPC 态度自然演化界限，并恢复 `[写作规范] 默认` 对高频网文套话的明确禁用力度。

## [0.1.1] - 2026-11-17

### Changed
- **提示词任务化与强正向引导校准**：
  - `[AI人设]`（`莉莉丝` / `泠音`）收束末端关系定位为正向创作任务承接，减少闲聊引导与多余嘱托；
  - `<核心准则>` 整合冗余禁令为清晰具体的边界描述与推演标准，将创作范围表述自然兼容全题材；
  - `[写作规范] 默认` 限定否肯句与解剖/测量词汇边界以消除对台词澄清及感官词汇的误伤，校准每轮进展表述以兼容 `[节奏] 慢笔细写`；
  - 全部 8 款 `[文风]` 的 `### 语感示范` 补充“仅作语感节奏参考、不照搬示例情节意象”提示；`情色文学` 补充日常铺垫到亲密场景的自然过渡说明；`[NSFW倾向] 女性向` 调整对方描写为通用兼容表述；
  - `[功能]` 与 `[思考]` 系列强化格式边界与正向执行指导：`段间批注` 明确独立空行与 `※ 批注：` 默认署名并保持叙事沉浸；`行动选项` 去除 `[简短标题]` 方括号并限制每项单行且不使用 `< >`；`格式兼容` 明确正文之外独立闭合互不嵌套；`防重复校验` 改写为适配前向生成的前置查重避让；`<执行规则>` 明确正文字数统计边界；
  - 全局配置 `openai_max_tokens` 由 `16384` 下调至更通用的 `8192`（保持 `use_sysprompt: true`）。

## [0.1.0] - 2026-11-16

### Release Overview
- **正式建立 `ST-PresetAssistant`（ST-预设助手）`v0.1.0` 独立仓库与构建流程**：
  - 严格遵循 **6 大 XML 语义块 + 非 JSON 源码驱动构建流程**（`raw_data_cache/` ➔ `npm run all` ➔ `presets/ST-PresetAssistant_V0.1.0.json`），采用 `GPL-3.0`（脚本与控制台）+ `CC BY-NC-SA 4.0`（提示词与预设）双协议开源；
  - 预设内部 `name` 固定为简洁的 **`ST-预设助手`**，导出产物文件名携带语义化版本号，覆盖导入升级不产生重复预设副本。
- **多 AI 人设与 `[分组] 条目名 [单选/多选]` 动态规则（56 模块）**：
  - 统一术语区分：**「助手」指代 `ST-PresetAssistant` 预设整体**，`[AI人设] 莉莉丝 [单选]`（默认开启）与 `[AI人设] 泠音 [单选]` 置顶无 `<xml>` 包装；删除冗余「不启用」按钮，**所有条目（含所有 `[单选]` 与 `[多选]`）均支持再次点击已激活项直接关闭**；
  - 将 `main` 定位为 `✨ST-使用说明`（仅含 `{{// ... }}` 注释，0 Token 发送，并设 `forbid_overrides: true` 防止角色卡覆写），将 `<核心准则>` 拆分为独立可选模块 `[核心规则] 默认 [单选]`（`yd_core_rules_default`，`system_prompt: false`）并严守「世界与玩家边界」职责（剔除冗余现实违法安全声明）；全量宏变量在核心规则后通过 `⚙️ 变量初始化`（`yd_vars_init`）统一顶部预设，使 `<叙事约定>` 与 `<执行规则>` 各以单条模板扁平合拢（保留 `<故事设定>`/`<历史会话>` 首尾分隔边界）；
  - 深化 `[写作规范] 默认 / 宽松 [单选]`（内化日常防复读与实质推进原则），统一治理全仓 Markdown 层级（避免为 `1~2` 条内容强设 `###` 小标题），将 `05_执行规则` 全部 4 个 `[功能]` 条目统一为助手执行的祈使句指令（`[功能] 段间批注 [多选]` 去除`随记`旧词、篇幅限制与元认知解释，重塑用途说明；`[功能] 行动选项 [多选]` 改写为弹性 `2~4` 项可直发格式并取消模板句重复；`[功能] 防重复校验 [多选]` 默认关闭；`[功能] 格式兼容 [多选]` 统一前缀）；全面重构全部 **8 款第三人称示范文风**（严格拉开 `情色文学` 与 `肉文直白`、`轻小说体` 与 `轻快网感` 梯度，打破同构三段切入并清剿高频套词），使 `[思考] 基本推理 [多选]` 保持丰富推演细则的同时收拢为平实要点清单且与可选功能开关完全拆分开。
- **文学化叙事控制与双轨 NSFW 分组**：
  - 收录全 8 款第三人称示范文风（默认 `[文风] 情色文学 [单选]`）；按文学常识重构 **`[节奏]`** 与 **`[侧重]`**（含心理刻画）；
  - 拆分 **`[NSFW倾向]`**（`无倾向 / 男性向 / 女性向` `[单选]`）与 **`[NSFW细化]`**（`反应多样性 [多选]`），默认全关。
- **三标签页悬浮控制面板（`floating_panel.js`）与全中文标签体系**：
  - 面板收起态采用 **`42×42px` 半透明毛玻璃 `✨` 悬浮球**（外环带 `14s` 柔和星光环绕轨道、微光呼吸、轻量拖拽抬升及新版脉冲圆点提醒，支持 `prefers-reduced-motion` 无障碍适配），展开采用 **「预设设置 / 正则设置 / 助手设置」** 三大可切换标签页（柔和零回弹 `cubic-bezier(0.22, 1, 0.36, 1)` 开合、页签淡入切换与卡片微交互），**固定抽屉高度并保持滚轮位置不跳变**，配备 5px 圆角主题半透明滚动条；`正则设置` 划分为 **「美化设置」**（`[美化]` 前缀的 `思考 / 批注 / 选择 / 正文`）与 **「其他设置」**（`历史标签过滤` 及所有不符合 `[美化]` 规则的其他正则）并双向同步酒馆正则配置；`助手设置` 收纳无冗余说明的「主题配色」、悬浮球二维相对位置查看/重置与版本更新（默认检查 `main` 分支）；
  - **全面统一中文结构化标签**：思考输出采用 **`<构思>...</构思>`**（避开原生英文 `<think>`/`<thought>` 冲突，UI 同步更正为 **`输出思考面板` / `预填充思考`**），行动选择采用 **`<选择>...</选择>`**；简化美化卡片左上角标题为纯净 **`思考` / `批注` / `选择`**，新增 **`[美化] 正文`**（对白与场景分隔线美化，严格隔离 `<构思>`、批注楼与选择卡片）；
  - 保留弹窗首次加载单次 Git 更新检查（零后台轮询）并直跳 GitHub `CHANGELOG.md`；批注卡片**默认闭合**（单行摘要预览，整栏点击展开）并开放全楼层「编辑 / 删除 / 追加」写回；悬浮球、批注卡与选择卡全面适配移动端（`100dvh`/`visualViewport`、防 iOS 聚焦放大、窄屏换行与触摸防抖）。
