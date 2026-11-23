#!/usr/bin/env node
/**
 * @module scripts/check-terms.mjs
 * @description 非规范用语、大厂黑话、伪概念、生词造词与字符画长框线检测自检脚本（工作空间统一单源版）
 *
 * 核心原则：
 * 1. 两级分类：高确信度违规标为 error，强语境依赖、允许误报的提示项标为 warn；
 * 2. 不在规则上堆砌正则前后瞻或词条白名单补丁，保持规则直观可读；
 * 3. 完整扫描所有目标文件并输出分级报告后统一返回退出码 0（传入 --fail-on-error 时按 error 阻断）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. 规则定义清单 (两级分类：error 高确信违规 / warn 语境提示、允许误报)

export const RULES = [
    // 类别 1: 外文概念硬译/直译与伪概念 (Pseudo-concepts & Raw Translations)
    {
        id: 'translation/contract',
        category: '外文硬译/直译',
        pattern: /契约/g,
        severity: 'warn',
        recommendation: '接口定义 (interface) / 类型声明 (type) / 配置项 (options) / 操作句柄 (handle) / 回调函数类型',
        rationale: '代码与架构语境避免直译“契约”；剧情设定中的契约属正常用例，允许误报。'
    },
    {
        id: 'translation/payload',
        category: '外文硬译/直译',
        pattern: /载荷/g,
        severity: 'error',
        recommendation: '请求数据 / 请求体 / 响应数据 / 接口参数 / 消息内容',
        rationale: '规避机械工程与航空借词 (Payload)，采用标准 Web 接口术语。'
    },
    {
        id: 'translation/entity',
        category: '外文硬译/直译',
        pattern: /实体/g,
        severity: 'warn',
        recommendation: '数据模型 (data model) / 任务对象 (task item) / DOM 元素 (element)',
        rationale: '非 DDD / ORM 语境下避免硬套实体概念；若命中“真实体验”等正常词汇可按低等级忽略。'
    },
    {
        id: 'translation/materialize',
        category: '外文硬译/直译',
        pattern: /物化/g,
        severity: 'error',
        recommendation: '挂载 (mount) / 渲染 (render) / 创建 (create) / 实例化 (instantiate)',
        rationale: '前端组件与 DOM 操作应使用标准渲染与挂载术语。'
    },
    {
        id: 'translation/consumer-producer',
        category: '外文硬译/直译',
        pattern: /(?:消费方|消费者|生产者)/g,
        severity: 'warn',
        recommendation: '调用方 (caller) / 使用方 / 数据提供者 (provider)',
        rationale: '单机模块导入调用避免滥用消息队列术语（标准生产者-消费者并发模型除外）。'
    },
    {
        id: 'translation/receipt',
        category: '外文硬译/直译',
        pattern: /回执/g,
        severity: 'warn',
        recommendation: '返回结果 (result) / 确认状态 (ack) / 响应数据 (response)',
        rationale: 'Promise 或内部事件响应避免硬译为回执。'
    },
    {
        id: 'translation/slot-abuse',
        category: '外文硬译/直译',
        pattern: /槽位/g,
        severity: 'warn',
        recommendation: '展示容器 (container) / 占位元素 (placeholder) / 插槽 / 目标消息楼层',
        rationale: '普通 DOM 布局或参数位置避免滥用槽位概念。'
    },
    {
        id: 'translation/deconstruct',
        category: '外文硬译/直译',
        pattern: /解构/g,
        severity: 'warn',
        recommendation: '拆分 (split) / 分解 (decompose) / 梳理',
        rationale: '除 ECMAScript 解构语法外，避免在业务分析中借用哲学语境词汇。'
    },
    {
        id: 'translation/topology',
        category: '外文硬译/直译',
        pattern: /拓扑/g,
        severity: 'warn',
        recommendation: '依赖关系 / 流程节点结构',
        rationale: '简单流程与调用关系避免数学拓扑术语夸大。'
    },
    {
        id: 'translation/backtrack',
        category: '外文硬译/直译',
        pattern: /回溯/g,
        severity: 'warn',
        recommendation: '排查 / 追溯历史 / 恢复先前状态',
        rationale: '日常业务排查避免夸大用词（调用栈回溯与算法搜索除外）。'
    },
    {
        id: 'translation/in-situ',
        category: '外文硬译/直译',
        pattern: /原位/g,
        severity: 'error',
        recommendation: '就地 / 消息内 / 重新生成 / 替换原图 / 渲染展示',
        rationale: '规避将 in-situ 硬译直译为“原位”，前端交互应采用就地、消息内或重新生成等标准表达。'
    },

    // 类别 2: 大厂黑话与抽象空洞造词 (Corporate Jargon & Buzzwords)
    {
        id: 'jargon/closed-loop',
        category: '大厂黑话与造词',
        pattern: /闭环/g,
        severity: 'error',
        recommendation: '生命周期管理 / 资源释放 / 构建流程 / 自动重置',
        rationale: '消除抽象空洞黑话，直接陈述具体流转行为。'
    },
    {
        id: 'jargon/self-heal',
        category: '大厂黑话与造词',
        pattern: /自愈/g,
        severity: 'error',
        recommendation: '自动重置 / 自动恢复 / 清除状态标记',
        rationale: '消除医学/生物隐喻借词，陈述为状态自动恢复与重置。'
    },
    {
        id: 'jargon/converge',
        category: '大厂黑话与造词',
        pattern: /收敛(?:至)?/g,
        severity: 'warn',
        recommendation: '集中到 / 规范化与清理 / 统一处理',
        rationale: '日常 UI 布局与字符串清洗中避免管理学借词（数学/采样收敛除外）。'
    },
    {
        id: 'jargon/transparent-pass',
        category: '大厂黑话与造词',
        pattern: /透传/g,
        severity: 'error',
        recommendation: '直接传递 / 转发 / 自定义请求体参数 (Body)',
        rationale: '面向用户与代码注释应直观表述。'
    },
    {
        id: 'jargon/link-buzzword',
        category: '大厂黑话与造词',
        pattern: /(?:全链路|端到端链路|通信链路)/g,
        severity: 'error',
        recommendation: '全流程 / 完整生命周期 / 网络连接 / 传输方式',
        rationale: '消除电信与互联网黑话链路借用，表述为全流程或网络连接。'
    },
    {
        id: 'jargon/align-and-pull',
        category: '大厂黑话与造词',
        pattern: /(?:拉通|拉齐|认知对齐|对齐认知|对齐颗粒度)/g,
        severity: 'error',
        recommendation: '沟通确认 / 保持共识 / 同步标准 / 协同串联',
        rationale: '消除管理学与大厂汇报黑话。'
    },
    {
        id: 'jargon/gatekeeper',
        category: '大厂黑话与造词',
        pattern: /(?:质量)?守门(?:员|人|工具)?/g,
        severity: 'error',
        recommendation: '代码规范检测脚本 / 自动化校验工具 / 静态质量检测机制',
        rationale: '消除拟人化与口号化“守门”隐喻，直接采用软件工程标准术语。'
    },
    {
        id: 'jargon/commercial-buzzwords',
        category: '大厂黑话与造词',
        pattern: /(?:抓手|打法|玩法|组合拳|护城河)/g,
        severity: 'error',
        recommendation: '机制 (mechanism) / 策略 (strategy) / 解决方案 / 核心优势',
        rationale: '消除商业管理学借词与宣传夸大黑话。'
    },
    {
        id: 'jargon/empower-connect',
        category: '大厂黑话与造词',
        pattern: /(?:赋能|打通)/g,
        severity: 'warn',
        recommendation: '支持 / 提供 / 实现 / 连接 / 对接',
        rationale: '消除空洞口号，规范为具体工程动作。'
    },
    {
        id: 'jargon/mental-load',
        category: '大厂黑话与造词',
        pattern: /心智(?:负担)?/g,
        severity: 'error',
        recommendation: '理解成本 / 学习成本 / 使用复杂度',
        rationale: '消除心理学/互联网造词。'
    },
    {
        id: 'jargon/underlying-logic',
        category: '大厂黑话与造词',
        pattern: /底层逻辑/g,
        severity: 'error',
        recommendation: '实现原理 / 基本原理 / 核心机制',
        rationale: '消除空洞大词。'
    },
    {
        id: 'jargon/infrastructure',
        category: '大厂黑话与造词',
        pattern: /(?:底座|基建)/g,
        severity: 'warn',
        recommendation: '基础模块 / 基础设施 / 通用层',
        rationale: '消除宏大叙事借词。'
    },
    {
        id: 'jargon/penetrate',
        category: '大厂黑话与造词',
        pattern: /(?:击穿|穿透)/g,
        severity: 'warn',
        recommendation: '跨层访问 / 直接调用',
        rationale: '非专业安全/缓存/事件穿透场景中避免夸大用词。'
    },
    {
        id: 'jargon/service-endpoint',
        category: '大厂黑话与造词',
        pattern: /端点/g,
        severity: 'warn',
        recommendation: '服务地址 (Base URL) / 接口地址 / 模型接口',
        rationale: '面向 UI 表单、提示语与用户说明时优先采用“模型接口 / 服务地址”；协议层描述允许误报。'
    },
    {
        id: 'jargon/matrix-abuse',
        category: '大厂黑话与造词',
        pattern: /(?:双列矩阵|网格矩阵|参数矩阵)/g,
        severity: 'warn',
        recommendation: '双列表格 / 属性列表 / 功能清单',
        rationale: '表格即表格，非数学矩阵计算。'
    },
    {
        id: 'jargon/granularity',
        category: '大厂黑话与造词',
        pattern: /颗粒度/g,
        severity: 'warn',
        recommendation: '粒度 / 精度 / 详细程度',
        rationale: '规范为标准计算机术语。'
    },
    {
        id: 'jargon/precipitate',
        category: '大厂黑话与造词',
        pattern: /沉淀/g,
        severity: 'warn',
        recommendation: '封装 / 积累 / 提取 / 归纳',
        rationale: '消除管理化借词。'
    },
    {
        id: 'jargon/pipeline-buzzword',
        category: '大厂黑话与造词',
        pattern: /流水线/g,
        severity: 'warn',
        recommendation: '预处理模块 (Processor) / 处理流程 / 内置正则列表',
        rationale: '轻量扩展与文档优先采用处理流程等直白表述（图形渲染管线或 CI/CD 除外）。'
    },
    {
        id: 'jargon/inject-water',
        category: '大厂黑话与造词',
        pattern: /注水/g,
        severity: 'error',
        recommendation: '快捷填入 (Quick Insert) / 追加标签 (Append Tags) / 模板填充 (Template Fill)',
        rationale: '消除非正规口语化生造词“注水”，采用标准用户交互动作陈述。'
    },
    {
        id: 'jargon/quality-gate',
        category: '大厂黑话与造词',
        pattern: /门禁/g,
        severity: 'error',
        recommendation: '自动化测试与构建验证 / 校验标准 / 质量检查规范',
        rationale: '消除大厂管理学黑话，采用标准软件测试与质量检查术语。'
    },
    {
        id: 'jargon/prompt-jargon',
        category: '生硬工程与产品术语',
        pattern: /(?:输入模态|信息增量|同质化循环|交互支点)/g,
        severity: 'error',
        recommendation: '输入意图与言行 / 新内容与新进展 / 原地打转 / 切入点',
        rationale: '创作类提示词与说明应采用自然地道的中文表达，避免生硬的算法或产品汇报词。'
    },
    {
        id: 'jargon/physical-abuse',
        category: '外文硬译/生硬搭配',
        pattern: /物理/g,
        severity: 'warn',
        recommendation: '真实体感 / 实际 / 紧挨着 / 彻底删除',
        rationale: '提示词或非物理学科场景中谨慎使用“物理”修饰语，自然科学或真实删除语义允许误报。'
    },
    {
        id: 'jargon/mechanical-prose',
        category: '生硬直译与机械用语',
        pattern: /(?:返回体|缝补)/g,
        severity: 'error',
        recommendation: '回复结果 / 补丁式写法',
        rationale: '面向用户、提示词与研发文档应使用自然流畅的中文表述。'
    },
    {
        id: 'jargon/invariant-abuse',
        category: '外文硬译/直译',
        pattern: /不变量/g,
        severity: 'warn',
        recommendation: '核心要求 / 关键规则 / 必须满足的条件',
        rationale: '非数学或循环证明语境下，工程测试与文档避免硬译 Invariant。'
    },
    {
        id: 'jargon/anti-pattern',
        category: '伪概念与夸大用语',
        pattern: /反模式/g,
        severity: 'error',
        recommendation: '逻辑缺陷 / 重复确认 / 体验问题 / 设计不当',
        rationale: '避免将普通的交互体验或重复弹窗问题硬套“反模式”等夸大伪概念。'
    },
    {
        id: 'jargon/patch-debris',
        category: '补丁与陈旧残留',
        pattern: /(?:失败残留|历史残留|保护残留|补丁残留)/g,
        severity: 'error',
        recommendation: '生成失败记录 / 失败项 / 废弃配置 / 兼容逻辑',
        rationale: '消除“残留”等带有防御性自辩与补丁思维的生造词。'
    },
    {
        id: 'jargon/graceful-degradation',
        category: '大厂黑话与造词',
        pattern: /(?:平滑降级|优雅降级|优雅(?:的)?降级)/g,
        severity: 'error',
        recommendation: '容错回退 / 切换为失败状态 / 回退使用原生方案 / 未配置时使用默认值',
        rationale: '消除夸大修饰语，采用具体客观的环境分支与容错描述。'
    },
    {
        id: 'jargon/probe-detect',
        category: '大厂伪概念借词',
        pattern: /探测/g,
        severity: 'warn',
        recommendation: '连通性检测 (checkHealth) / 查找元素 / 拉取列表 / 尝试请求',
        rationale: '前端与 HTTP 接口交互场景中避免滥用硬件或雷达借词“探测”。'
    },

    // 类别 3: 行政化与公文借词 (Bureaucratic Jargon)
    {
        id: 'bureaucracy/store-buzzword',
        category: '行政化借词',
        pattern: /(?:落库|落盘|落表)/g,
        severity: 'error',
        recommendation: '持久化存储 (persist) / 写入磁盘 (write to disk) / 保存至数据库 / 写入数据表',
        rationale: '单机或前端存储应采用“写入磁盘”、“持久化”等标准计算机术语，消除公文汇报借词。'
    },
    {
        id: 'bureaucracy/hierarchical-flow',
        category: '行政化借词',
        pattern: /(?:下发|上报)/g,
        severity: 'warn',
        recommendation: '传递 (pass) / 分发 (dispatch) / 触发通知 (notify/emit) / 更新状态',
        rationale: '单机进程内数据流与事件通知非多级行政上下级。'
    },
    {
        id: 'bureaucracy/manage-govern',
        category: '行政化借词',
        pattern: /纳管/g,
        severity: 'error',
        recommendation: '集中管理 / 统一维护与导出',
        rationale: '行政化借词规范为软件工程用语。'
    },
    {
        id: 'bureaucracy/endorse-claim',
        category: '行政化借词',
        pattern: /(?:背书|认领)/g,
        severity: 'warn',
        recommendation: '官方支持 / 官方认证 / 兼容性保证 / 接管 / 分配处理',
        rationale: '普通代码逻辑与技术声明避免使用行政公文借词。'
    },

    // 类别 4: 教条化定论与口号化用语 (Dogma, Slogans & Hyperbole)
    {
        id: 'dogma/inflexible-assertion',
        category: '教条化与绝对化',
        pattern: /(?:架构冻结|冻结架构|规范冻结|绝对规范|不可逾越|不可动摇|绝对红线)/g,
        severity: 'error',
        recommendation: '阶段性设计基准 / 动态演进参考 / 核心防护边界 / 约束准则（采用正面肯定句阐述）',
        rationale: '严禁使用绝对化教条定论，亦避免用反向否定句引用禁词。'
    },
    {
        id: 'slogan/iron-rule',
        category: '口号化用语',
        pattern: /(?:终态)?铁律/g,
        severity: 'error',
        recommendation: '设计原则 / 规范约束 / 状态流转规则 / 边界要求',
        rationale: '规避情绪化口号与教条词汇，保持客观克制的工程技术表达。'
    },
    {
        id: 'slogan/natural-immunity',
        category: '口号化用语',
        pattern: /天然免疫/g,
        severity: 'error',
        recommendation: '说明具体的局部闭包持有或无状态设计考量，保持客观具体的工程表达。',
        rationale: '规避伪概念与口号式表述。'
    },
    {
        id: 'slogan/eradicate',
        category: '口号化用语',
        pattern: /杜绝/g,
        severity: 'error',
        recommendation: '避免 / 防范 / 规避',
        rationale: '规避宣誓式用词，采用平实的工程技术表达。'
    },
    {
        id: 'slogan/fallback-jargon',
        category: '口号化用语',
        pattern: /(?:兜底|保底)/g,
        severity: 'warn',
        recommendation: '回退策略 (fallback) / 默认值 (default) / 容错处理 / 降级策略 (degradation)',
        rationale: '口语化行话规范为专业容错与回退术语。'
    },
    {
        id: 'slogan/explosion-proof',
        category: '口号化用语',
        pattern: /防爆/g,
        severity: 'warn',
        recommendation: '防止配额超限 / 防止内存溢出 (OOM)',
        rationale: '严谨表达容量控制机制。'
    },
    {
        id: 'slogan/die-hard',
        category: '口号化用语',
        pattern: /死磕/g,
        severity: 'error',
        recommendation: '严格保障 / 深入解决',
        rationale: '口号化俚语。'
    },
    {
        id: 'slogan/dimensional-strike',
        category: '口号化用语',
        pattern: /降维打击/g,
        severity: 'error',
        recommendation: '大幅优化 / 代际提升',
        rationale: '网文/黑话隐喻。'
    },
    {
        id: 'slogan/silver-bullet',
        category: '口号化用语',
        pattern: /(?:银弹|万能药)/g,
        severity: 'warn',
        recommendation: '通用解决方案 (需说明适用边界与技术权衡)',
        rationale: '严谨说明技术权衡 (Trade-offs)。'
    },
    {
        id: 'slogan/pain-point',
        category: '口号化用语',
        pattern: /痛点/g,
        severity: 'warn',
        recommendation: '核心问题 / 设计缺陷 / 性能瓶颈',
        rationale: '规范为具体技术问题陈述。'
    },
    {
        id: 'slogan/imperceptible',
        category: '口号化用语',
        pattern: /无感/g,
        severity: 'warn',
        recommendation: '透明 (transparent) / 后台自动处理 / 静默执行',
        rationale: '严谨陈述异步后台行为。'
    },

    // 类别 5: 无语义字符画长框线 (Decorative Dividers)
    {
        id: 'divider/decorative-divider',
        category: '无语义长框线',
        pattern: /(?:\/\/|#)\s*(?:={4,}|-{4,}|\*{4,}|[─━═]{4,})|\/\*\s*(?:={4,}|-{4,}|[─━═]{4,})/g,
        severity: 'warn',
        recommendation: '轻量单行结构说明 (如 // 1. ...) 或标准 JSDoc',
        rationale: '消除浪费 Token 与增加 Edit 脆弱性的装饰性等号/减号/星号/制表字符长框线。'
    },

    // 类别 6: 编码规范红线与伪概念 (Code Standards & Guardrails)
    {
        id: 'code-quality/no-as-any',
        category: '编码规范质量',
        pattern: /\bas\s+any\b/g,
        severity: 'error',
        recommendation: '使用强类型定义、泛型约束或 unknown + 类型守卫 (type guard)',
        rationale: '项目中严禁使用 as any 破坏类型安全。',
        ignoreIf: (line, matched, filePath) => !/\.[tj]sx?$/.test(filePath) || filePath.includes('tests') || filePath.includes('@types') || filePath.includes('docs')
    },
    {
        id: 'code-quality/no-raw-ui-console',
        category: '编码规范质量',
        pattern: /console\.(error|warn|log)\(/g,
        severity: 'error',
        recommendation: '使用统一分级记录器 logger.error / logger.warn / logger.info',
        rationale: 'UI 组件与业务模块严禁直接使用 console，必须走统一 logger 以便调试终端捕获。',
        ignoreIf: (line, matched, filePath) => !/\.[tj]sx?$/.test(filePath) || (!filePath.includes(path.join('src', 'ui')) && !filePath.includes(path.join('src', 'provider'))) || filePath.includes(path.join('src', 'util', 'logger.ts'))
    },
    {
        id: 'fluff/fail-safe-concept',
        category: '大厂伪概念借词',
        pattern: /故障安全/g,
        severity: 'error',
        recommendation: '直接描述逻辑行为（如“未确认时默认终止操作”或“参数重置为出厂配置”）',
        rationale: '避免在普通前端交互逻辑中滥用航天/工业级“故障安全”概念标榜。'
    },
    {
        id: 'code-quality/no-native-alert',
        category: '编码规范质量',
        pattern: /\b(?:window\.)?alert\s*\(/g,
        severity: 'error',
        recommendation: '使用全局浮层通知 Toast.show(message, { level: "warning" | "error" })',
        rationale: '项目中严禁使用阻塞主线程的 window.alert 弹窗。',
        ignoreIf: (line, matched, filePath) => !/\.[tj]sx?$/.test(filePath) || filePath.includes('tests') || filePath.includes('docs')
    }
];

// 2. 文件扫描与跳过目录策略

const IGNORED_DIRS = new Set([
    'node_modules',
    'dist',
    'build',
    'out',
    '.git',
    '.vscode',
    '.idea',
    'coverage',
    'presets',
    'history',
    'world_books',
    'chara_card',
    '__pycache__',
    'scratch',
    'tmp'
]);

const IGNORED_FILES = new Set([
    'check-terms.mjs',
    'sync-check-terms.mjs',
    'terms.test.ts'
]);

const SCANNABLE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.d.ts',
    '.js',
    '.mjs',
    '.css',
    '.py',
    '.html',
    '.txt'
]);

/**
 * 递归收集目录下的可扫描源文件
 * @param {string} dirPath 扫描目录
 * @param {object} [options] 扫描选项
 * @param {boolean} [options.includeMarkdown] 是否包含 Markdown 文件 (.md)
 * @param {string[]} [options.extensions] 自定义允许的文件扩展名列表
 */
export function collectFiles(dirPath, options = {}) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;

    const includeMarkdown = options.includeMarkdown ?? false;
    const allowedExtensions = options.extensions
        ? new Set(options.extensions)
        : (includeMarkdown
            ? new Set([...SCANNABLE_EXTENSIONS, '.md'])
            : SCANNABLE_EXTENSIONS);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue;
            results.push(...collectFiles(path.join(dirPath, entry.name), options));
        } else if (entry.isFile()) {
            if (IGNORED_FILES.has(entry.name)) continue;
            const ext = path.extname(entry.name);
            const isDts = entry.name.endsWith('.d.ts');
            if (isDts || allowedExtensions.has(ext)) {
                results.push(path.join(dirPath, entry.name));
            }
        }
    }
    return results;
}

// 3. 核心检测引擎

/**
 * 扫描单个文件内容并收集所有违规项
 */
export function checkFileContent(filePath, content) {
    const violations = [];
    const lines = content.split(/\r?\n/);

    let isBlockDisabled = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // 区块豁免检测 (支持 JS/TS 注释、HTML/Markdown 注释及 Python # 注释)
        if (/\/\*\s*terms-disable\s*\*\/|<!--\s*terms-disable\s*-->|#\s*terms-disable\b/.test(line)) {
            isBlockDisabled = true;
            continue;
        }
        if (/\/\*\s*terms-enable\s*\*\/|<!--\s*terms-enable\s*-->|#\s*terms-enable\b/.test(line)) {
            isBlockDisabled = false;
            continue;
        }
        if (isBlockDisabled) continue;

        // 行内单行豁免检测 (支持 JS/TS 注释、HTML/Markdown 注释及 Python # 注释)
        if (/\/\/\s*(?:terms-ignore|terms-disable-line)|\/\*\s*terms-ignore\s*\*\/|<!--\s*(?:terms-ignore|terms-disable-line)\s*-->|#\s*(?:terms-ignore|terms-disable-line)\b/.test(line)) {
            continue;
        }

        for (const rule of RULES) {
            rule.pattern.lastIndex = 0; // 重置正则状态

            let match;
            while ((match = rule.pattern.exec(line)) !== null) {
                // 上下文白名单例外检测
                if (rule.ignoreIf && rule.ignoreIf(line, match[0], filePath)) {
                    continue;
                }

                violations.push({
                    file: filePath,
                    line: lineNum,
                    column: match.index + 1,
                    length: match[0].length,
                    matchedText: match[0],
                    ruleId: rule.id,
                    category: rule.category,
                    severity: rule.severity,
                    recommendation: rule.recommendation,
                    rationale: rule.rationale,
                    lineContent: line
                });
            }
        }
    }

    return violations;
}

// 4. 报告输出器 (Human Readable & Agent Compact Format)

export function formatHumanReport(violations, totalFiles) {
    const errorCount = violations.filter((v) => v.severity === 'error').length;
    const warnCount = violations.filter((v) => v.severity === 'warn').length;

    let output = `\n🔍 代码库术语规范扫描报告 (共检查 ${totalFiles} 个源文件)\n`;
    output += '─'.repeat(70) + '\n';

    if (violations.length === 0) {
        output += '✨ 恭喜！未发现任何非规范生词借词、硬译或装饰框线。\n';
        output += '─'.repeat(70) + '\n';
        return { text: output, errorCount, warnCount };
    }

    for (const v of violations) {
        const relPath = path.relative(process.cwd(), v.file).replace(/\\/g, '/');
        const badge = v.severity === 'error' ? '❌ [ERROR]' : '⚠️ [WARN]';
        output += `\n${relPath}:${v.line}:${v.column} ${badge} [${v.ruleId}]\n`;
        output += `  代码行: ${v.lineContent.trim()}\n`;
        output += `  定位:   ${' '.repeat(Math.max(0, v.column - 1))}${'^'.repeat(v.length)}\n`;
        output += `  说明:   ${v.rationale}\n`;
        output += `  👉 建议规范用语: ${v.recommendation}\n`;
    }

    output += '\n' + '─'.repeat(70) + '\n';
    output += `✖ 扫描结果: ${violations.length} 处违规 (Error: ${errorCount}, Warning: ${warnCount})\n`;

    return { text: output, errorCount, warnCount };
}

export function formatAgentCompactReport(violations, totalFiles) {
    const errorCount = violations.filter((v) => v.severity === 'error').length;
    const warnCount = violations.filter((v) => v.severity === 'warn').length;

    const lines = [];
    for (const v of violations) {
        const relPath = path.relative(process.cwd(), v.file).replace(/\\/g, '/');
        const level = v.severity.toUpperCase();
        lines.push(`${relPath}:${v.line}:${v.column} [${level}] [${v.ruleId}] "${v.matchedText}" -> 建议: ${v.recommendation}`);
    }

    lines.push(`SUMMARY: total_files=${totalFiles} total_violations=${violations.length} errors=${errorCount} warnings=${warnCount}`);
    return { text: lines.join('\n'), errorCount, warnCount };
}

// 5. 项目结构自适应与 CLI 主程序执行流

function resolveDefaultScanEntries(cwd, explicitMdFlag) {
    const hasSrc = fs.existsSync(path.join(cwd, 'src'));
    const hasConfigPresets = fs.existsSync(path.join(cwd, 'config', 'presets'));
    const hasRawCache = fs.existsSync(path.join(cwd, 'raw_data_cache'));
    const hasCardOrWbDirs = ['world_book', 'world_book_template', 'chara_card_template']
        .some((dir) => fs.existsSync(path.join(cwd, dir)));

    // 1) TypeScript 扩展套件（如 ST-DrawAssistant）
    if (hasSrc && hasConfigPresets) {
        const entries = [
            { target: path.join(cwd, 'src'), options: { includeMarkdown: explicitMdFlag } },
            { target: path.join(cwd, '@types'), options: { includeMarkdown: explicitMdFlag } },
            { target: path.join(cwd, 'styles'), options: { includeMarkdown: explicitMdFlag } },
            { target: path.join(cwd, 'tests'), options: { includeMarkdown: explicitMdFlag } },
            { target: path.join(cwd, 'config', 'presets'), options: { extensions: ['.json'] } },
            { target: path.join(cwd, 'config', 'changelog.json'), options: {} }
        ];
        if (explicitMdFlag) {
            entries.push(
                { target: path.join(cwd, 'docs'), options: { includeMarkdown: true } },
                { target: path.join(cwd, 'README.md'), options: {} },
                { target: path.join(cwd, 'CHANGELOG.md'), options: {} }
            );
        }
        return entries;
    }

    // 2) 非 JSON 源码驱动的预设 / 世界书套件（如 ST-PresetAssistant / ST-CharacterDesigner / worldbook_故事插画书）
    if (hasRawCache) {
        return [
            { target: path.join(cwd, 'raw_data_cache'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'scripts'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'docs'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'tests'), options: { includeMarkdown: true } },
            { target: path.join(cwd, '.agents'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'README.md'), options: {} },
            { target: path.join(cwd, 'CHANGELOG.md'), options: {} }
        ];
    }

    // 3) 角色卡 / MVU 模板套件（如 character_card_妹妹的脚是最好的仙品 / mvu-rpg-engine_template）
    if (hasCardOrWbDirs) {
        return [
            { target: path.join(cwd, 'world_book'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'world_book_template'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'chara_card_template'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'regex'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'regex_template'), options: { extensions: [...SCANNABLE_EXTENSIONS, '.md', '.json'] } },
            { target: path.join(cwd, 'scripts'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'docs'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'tests'), options: { includeMarkdown: true } },
            { target: path.join(cwd, '.agents'), options: { includeMarkdown: true } },
            { target: path.join(cwd, 'README.md'), options: {} },
            { target: path.join(cwd, 'CHANGELOG.md'), options: {} },
            { target: path.join(cwd, 'PROJECT_CHANGELOG.md'), options: {} }
        ];
    }

    // 4) 工作空间根目录默认扫描（.agents/ 与根目录 README.md）
    return [
        { target: path.join(cwd, '.agents'), options: { includeMarkdown: true } },
        { target: path.join(cwd, 'README.md'), options: {} }
    ];
}

export function runCli(argv = process.argv.slice(2)) {
    const isCompact = argv.includes('--compact');
    const isJson = argv.includes('--json');
    const failOnError = argv.includes('--fail-on-error');
    const warnAsError = argv.includes('--warn-as-error');
    const explicitMdFlag = argv.includes('--md') || argv.includes('--include-md');
    const targetPaths = argv.filter((arg) => !arg.startsWith('--'));
    const includeMarkdown = targetPaths.length === 0 || explicitMdFlag;

    const scanEntries = targetPaths.length > 0
        ? targetPaths.map((p) => ({
            target: path.resolve(process.cwd(), p),
            options: { includeMarkdown }
        }))
        : resolveDefaultScanEntries(process.cwd(), explicitMdFlag);

    const seenFiles = new Set();
    const allFiles = [];
    for (const entry of scanEntries) {
        if (!fs.existsSync(entry.target)) continue;
        const stat = fs.statSync(entry.target);
        const collected = stat.isDirectory()
            ? collectFiles(entry.target, entry.options)
            : (stat.isFile() ? [entry.target] : []);
        for (const f of collected) {
            const resolved = path.resolve(f);
            if (!seenFiles.has(resolved)) {
                seenFiles.add(resolved);
                allFiles.push(resolved);
            }
        }
    }

    const allViolations = [];
    for (const file of allFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const fileViolations = checkFileContent(file, content);
            allViolations.push(...fileViolations);
        } catch (err) {
            console.error(`读取文件失败: ${file}`, err);
        }
    }

    const normalizedViolations = warnAsError
        ? allViolations.map((v) => (v.severity === 'warn' ? { ...v, severity: 'error' } : v))
        : allViolations;

    const errorCount = normalizedViolations.filter((v) => v.severity === 'error').length;
    const warnCount = normalizedViolations.filter((v) => v.severity === 'warn').length;
    const exitCode = failOnError && errorCount > 0 ? 1 : 0;

    if (isJson) {
        const report = {
            totalFiles: allFiles.length,
            totalViolations: normalizedViolations.length,
            errors: errorCount,
            warnings: warnCount,
            violations: normalizedViolations
        };
        console.log(JSON.stringify(report, null, 2));
        return exitCode;
    }

    if (isCompact) {
        const { text } = formatAgentCompactReport(normalizedViolations, allFiles.length);
        console.log(text);
        return exitCode;
    }

    const { text } = formatHumanReport(normalizedViolations, allFiles.length);
    console.log(text);
    return exitCode;
}

// 跨平台直接执行入口识别
const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (path.resolve(currentFilePath) === entryFilePath || process.argv[1]?.endsWith('check-terms.mjs')) {
    const code = runCli();
    process.exit(code);
}
