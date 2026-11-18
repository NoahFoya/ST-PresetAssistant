/**
 * ST-PresetAssistant (ST-预设助手) · 酒馆助手 (JS-Slash-Runner) 悬浮控制面板
 * 单源脚本：经 scripts/sync_ui.py 同步版本号并注入 preset_manifest.json -> extensions.tavern_helper.scripts[0].content
 */
(function (root) {
  "use strict";

  const PRESET_VERSION = "0.3.0";
  const GITHUB_REPO = "NoahFoya/ST-PresetAssistant";
  const GITHUB_CHANGELOG_URL = "https://github.com/" + GITHUB_REPO + "/blob/main/CHANGELOG.md";
  const GITHUB_PACKAGE_URLS = [
    "https://raw.githubusercontent.com/" + GITHUB_REPO + "/main/package.json",
    "https://cdn.jsdelivr.net/gh/" + GITHUB_REPO + "@main/package.json",
  ];
  const ROOT_EL_ID = "yd-floating-root";
  const STYLE_EL_ID = "yd-floating-style";
  const STORAGE_KEY = "yd_assistant_floating_state_v2";
  const THEME_STORAGE_KEY = "yd_assistant_persona_themes_v1";

  const COLOR_SWATCHES = [
    { hex: "#d46b94", name: "绯红" },
    { hex: "#5fa0d0", name: "冰青" },
    { hex: "#c69352", name: "琥珀" },
    { hex: "#59a985", name: "翠玉" },
    { hex: "#9575d8", name: "紫藤" },
    { hex: "#828c9c", name: "石板" },
  ];

  const DEFAULT_PERSONA_COLORS = {
    lilith: "#d46b94",
    lingyin: "#5fa0d0",
    none: "#828c9c",
    custom: "#9575d8",
  };

  const BUILTIN_PERSONAS = {
    yd_persona_lilith: {
      id: "yd_persona_lilith",
      key: "lilith",
      label: "莉莉丝",
      themeKey: "lilith",
    },
    yd_persona_lingyin: {
      id: "yd_persona_lingyin",
      key: "lingyin",
      label: "泠音",
      themeKey: "lingyin",
    },
  };

  const PANEL_TABS = [
    { key: "preset", label: "预设设置" },
    { key: "regex", label: "正则设置" },
    { key: "assistant", label: "助手设置" },
  ];

  const REGEX_BEAUTIFY_PREFIX = "[美化]";
  const BANNED_REGEX_ID = "b2c3d4e5-2106-4e8a-9b10-111122220006";
  const BANNED_REGEX_NAME = "历史禁词清洗";
  const MAX_BANNED_WORDS = 80;
  const MAX_BANNED_WORD_LEN = 40;
  const DEFAULT_BANNED_WORDS = [
    "生理性的",
    "生理性",
    "生理泪水",
    "硬生生",
    "条件反射般",
    "某种意义上",
    "喉咙里滚出轻笑",
    "嘴角勾起一抹弧度",
    "嘴角勾起弧度",
    "死死咬住下唇",
    "眼底闪过一丝",
    "眼底闪过一抹",
    "空气瞬间凝固",
    "倒吸一口凉气",
    "灭顶的快感",
    "瞳孔微缩",
    "瞳孔地震",
    "指节泛白",
    "喉结滚动",
    "指腹摩挲",
    "不可置信",
    "不容置疑",
    "五味杂陈",
    "理智崩塌",
    "眼神失焦",
    "铁锈味",
    "浮木",
    "逼仄",
  ];

  function normalizeHex(hex) {
    const raw = String(hex || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      return ("#" + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3]).toLowerCase();
    }
    return null;
  }

  function hexToRgba(hex, alpha) {
    const clean = normalizeHex(hex) || "#828c9c";
    const n = parseInt(clean.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  function buildThemeFromHex(hex, key) {
    const clean = normalizeHex(hex) || "#828c9c";
    return {
      key: key || "custom",
      accent: clean,
      accentSoft: hexToRgba(clean, 0.16),
      accentBorder: hexToRgba(clean, 0.48),
      glow: hexToRgba(clean, 0.28),
    };
  }

  function getPromptId(p) {
    return String((p && (p.id || p.identifier)) || "").trim();
  }

  function parsePromptEntry(p) {
    if (!p || p.marker) return null;
    const rawName = String((p && p.name) || "").trim();
    const match = rawName.match(/^\[([^\]]+)\]\s*(.+?)\s*\[(单选|多选)\]((?:\s*&\s*[^&\s][^&]*)*)\s*$/);
    if (!match) return null;
    const bindRaw = match[4] || "";
    const bindNames = bindRaw
      ? bindRaw.split("&").map(function (s) { return s.trim(); }).filter(Boolean)
      : [];
    return {
      group: match[1].trim(),
      label: match[2].trim(),
      selectType: match[3] === "单选" ? "single" : "multi",
      bindNames: bindNames,
    };
  }

  function isPromptVisible(entry, prompts) {
    const bindNames = entry && Array.isArray(entry.bindNames) ? entry.bindNames : [];
    if (!bindNames.length) return true;
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    const matched = [];
    safePrompts.forEach(function (p) {
      if (!p) return;
      const pName = String(p.name || "").trim();
      const pParsed = parsePromptEntry(p);
      const hit = bindNames.some(function (t) {
        return pName === t || (pParsed && pParsed.label === t);
      });
      if (hit) matched.push(p);
    });
    if (!matched.length) return true;
    return matched.some(function (p) { return Boolean(p.enabled); });
  }

  function syncBoundVisibility(prompts) {
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    for (let pass = 0; pass <= safePrompts.length; pass++) {
      let changed = false;
      safePrompts.forEach(function (p) {
        if (!p || !p.enabled) return;
        const parsed = parsePromptEntry(p);
        if (!parsed || !parsed.bindNames.length) return;
        if (!isPromptVisible(parsed, safePrompts)) {
          p.enabled = false;
          changed = true;
        }
      });
      if (!changed) break;
    }
  }

  function formatRegexLabel(name) {
    const s = String(name || "").trim();
    if (s.indexOf(REGEX_BEAUTIFY_PREFIX) === 0) {
      return s.slice(REGEX_BEAUTIFY_PREFIX.length).trim() || s;
    }
    return s;
  }

  function buildPresetSections(prompts) {
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    const groupMap = {};
    const groupOrder = [];

    safePrompts.forEach(function (p) {
      const pid = getPromptId(p);
      if (!pid) return;
      const parsed = parsePromptEntry(p);
      if (!parsed) return;
      if (!groupMap[parsed.group]) {
        groupMap[parsed.group] = { key: parsed.group, title: parsed.group, items: [] };
        groupOrder.push(groupMap[parsed.group]);
      }
      groupMap[parsed.group].items.push({
        prompt: p,
        id: pid,
        label: parsed.label,
        selectType: parsed.selectType,
        bindNames: parsed.bindNames,
      });
    });

    return groupOrder;
  }

  function buildVisiblePresetSections(prompts) {
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    return buildPresetSections(safePrompts).map(function (sec) {
      return {
        key: sec.key,
        title: sec.title,
        items: sec.items.filter(function (item) {
          return isPromptVisible(item, safePrompts);
        }),
      };
    }).filter(function (sec) {
      return sec.items.length > 0;
    });
  }

  function normalizeRegexEntry(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    const name = String(raw.script_name || raw.scriptName || id).trim();
    const enabled = typeof raw.enabled === "boolean" ? raw.enabled : !Boolean(raw.disabled);
    return { id: id, name: name, enabled: enabled };
  }

  function mergePresetRegexes(tavernList, presetScripts) {
    const liveMap = {};
    const order = [];
    const liveArr = Array.isArray(tavernList) ? tavernList : [];
    const presetArr = Array.isArray(presetScripts) ? presetScripts : [];

    liveArr.forEach(function (item) {
      const norm = normalizeRegexEntry(item);
      if (!norm) return;
      const key = norm.id || norm.name;
      liveMap[key] = norm;
      order.push(norm);
    });

    if (presetArr.length > 0) {
      const result = [];
      const used = {};
      presetArr.forEach(function (item) {
        const norm = normalizeRegexEntry(item);
        if (!norm) return;
        const match = (norm.id && liveMap[norm.id]) || liveMap[norm.name];
        const merged = match ? { id: norm.id || match.id, name: match.name || norm.name, enabled: match.enabled } : norm;
        used[merged.id || merged.name] = true;
        result.push(merged);
      });
      order.forEach(function (item) {
        const k = item.id || item.name;
        if (!used[k]) result.push(item);
      });
      return result;
    }

    return order;
  }

  function classifyRegexSections(regexList) {
    const safeList = Array.isArray(regexList) ? regexList : [];
    const beautifyItems = [];
    const otherItems = [];

    safeList.forEach(function (rx) {
      if (String(rx.name || "").trim().indexOf(REGEX_BEAUTIFY_PREFIX) === 0) {
        beautifyItems.push(rx);
      } else {
        otherItems.push(rx);
      }
    });

    const groups = [];
    if (beautifyItems.length > 0) {
      groups.push({ key: "beautify", title: "美化设置", items: beautifyItems });
    }
    if (otherItems.length > 0) {
      groups.push({ key: "other", title: "其他设置", items: otherItems });
    }
    return groups;
  }

  function applyRegexToggleToTavernList(list, regexId, nextEnabled) {
    return (Array.isArray(list) ? list : []).map(function (item) {
      if (item && String(item.id || "") === String(regexId)) {
        return Object.assign({}, item, { enabled: Boolean(nextEnabled) });
      }
      return item;
    });
  }

  function applyRegexToggleToPreset(preset, regexId, nextEnabled) {
    if (!preset || !preset.extensions || !Array.isArray(preset.extensions.regex_scripts)) return false;
    let changed = false;
    preset.extensions.regex_scripts.forEach(function (item) {
      if (item && String(item.id || "") === String(regexId)) {
        item.disabled = !Boolean(nextEnabled);
        changed = true;
      }
    });
    return changed;
  }

  function escapeRegexLiteral(text) {
    return String(text || "").replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  }

  function normalizeBannedWords(words) {
    if (!Array.isArray(words)) return [];
    const seen = {};
    const out = [];
    for (let i = 0; i < words.length; i++) {
      const w = String(words[i] || "").trim().slice(0, MAX_BANNED_WORD_LEN);
      if (!w || seen[w]) continue;
      seen[w] = true;
      out.push(w);
      if (out.length >= MAX_BANNED_WORDS) break;
    }
    return out;
  }

  function compileBannedRegex(words) {
    const clean = normalizeBannedWords(words);
    if (clean.length === 0) {
      return "/^(?!)/";
    }
    const sorted = clean.slice().sort(function (a, b) {
      return (b.length - a.length) || (a < b ? -1 : (a > b ? 1 : 0));
    });
    return "/(?:" + sorted.map(escapeRegexLiteral).join("|") + ")/gi";
  }

  function readPresetBannedWords(preset) {
    const ext = preset && preset.extensions;
    const thVars = ext && ext.tavern_helper && ext.tavern_helper.variables;
    if (thVars && Array.isArray(thVars.yd_banned_words)) {
      return normalizeBannedWords(thVars.yd_banned_words);
    }
    return DEFAULT_BANNED_WORDS.slice();
  }

  function applyBannedRegexToTavernList(list, nextFindRegex) {
    return (Array.isArray(list) ? list : []).map(function (item) {
      if (!item) return item;
      const itemId = String(item.id || "");
      const itemName = String(item.script_name || item.scriptName || "");
      if (itemId === BANNED_REGEX_ID || itemName === BANNED_REGEX_NAME) {
        const next = Object.assign({}, item);
        if ("find_regex" in next || !("findRegex" in next)) next.find_regex = nextFindRegex;
        if ("findRegex" in next) next.findRegex = nextFindRegex;
        if ("replace_string" in next || !("replaceString" in next)) next.replace_string = "";
        if ("replaceString" in next) next.replaceString = "";
        return next;
      }
      return item;
    });
  }

  function applyBannedRegexToPreset(preset, nextFindRegex) {
    if (!preset) return false;
    if (!preset.extensions) preset.extensions = {};
    if (!Array.isArray(preset.extensions.regex_scripts)) preset.extensions.regex_scripts = [];
    let found = false;
    preset.extensions.regex_scripts.forEach(function (item) {
      if (!item) return;
      if (String(item.id || "") === BANNED_REGEX_ID || String(item.scriptName || "") === BANNED_REGEX_NAME) {
        item.findRegex = nextFindRegex;
        item.replaceString = "";
        found = true;
      }
    });
    if (!found) {
      preset.extensions.regex_scripts.push({
        id: BANNED_REGEX_ID,
        scriptName: BANNED_REGEX_NAME,
        disabled: false,
        placement: [2],
        findRegex: nextFindRegex,
        replaceString: "",
        trimStrings: [],
        runOnEdit: true,
        markdownOnly: false,
        promptOnly: true,
      });
    }
    return true;
  }

  function writePresetBannedWords(preset, words) {
    if (!preset) return [];
    const clean = normalizeBannedWords(words);
    if (!preset.extensions) preset.extensions = {};
    if (!preset.extensions.tavern_helper) preset.extensions.tavern_helper = { scripts: [], variables: {} };
    if (!preset.extensions.tavern_helper.variables) preset.extensions.tavern_helper.variables = {};
    preset.extensions.tavern_helper.variables.yd_banned_words = clean;
    applyBannedRegexToPreset(preset, compileBannedRegex(clean));
    return clean;
  }

  function addBannedWord(words, rawInput) {
    const current = normalizeBannedWords(words);
    const val = String(rawInput || "").trim();
    if (!val) return { words: current, added: false, reason: "empty" };
    if (val.length > MAX_BANNED_WORD_LEN) return { words: current, added: false, reason: "too_long" };
    if (current.indexOf(val) !== -1) return { words: current, added: false, reason: "duplicate" };
    if (current.length >= MAX_BANNED_WORDS) return { words: current, added: false, reason: "limit" };
    return { words: current.concat([val]), added: true, reason: "ok" };
  }

  function removeBannedWord(words, targetWord) {
    const cleanTarget = String(targetWord || "").trim();
    return normalizeBannedWords(words).filter(function (w) {
      return w !== cleanTarget;
    });
  }

  function discoverPersonas(prompts) {
    const list = [];
    const safePrompts = Array.isArray(prompts) ? prompts : [];

    safePrompts.forEach(function (p) {
      const pid = getPromptId(p);
      if (!pid) return;
      const parsed = parsePromptEntry(p);
      if (!parsed || parsed.group !== "AI人设") return;
      if (BUILTIN_PERSONAS[pid]) {
        list.push(Object.assign({}, BUILTIN_PERSONAS[pid], { label: parsed.label || BUILTIN_PERSONAS[pid].label }));
      } else {
        list.push({
          id: pid,
          key: "custom:" + pid,
          label: parsed.label,
          themeKey: "custom",
        });
      }
    });

    return list;
  }

  function resolveActivePersona(prompts, personas) {
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    const candidates = personas || discoverPersonas(safePrompts);
    for (let i = 0; i < candidates.length; i++) {
      const item = candidates[i];
      if (!item.id) continue;
      const found = safePrompts.find(function (p) { return getPromptId(p) === item.id; });
      if (found && found.enabled) return item;
    }
    return {
      id: null,
      key: "none",
      label: "",
      themeKey: "none",
    };
  }

  function formatVerTag(rawVer) {
    const cleaned = String(rawVer || PRESET_VERSION).trim().replace(/^[vV]/, "");
    return "v" + (cleaned || PRESET_VERSION);
  }

  function resolveVersionLabel(preset) {
    const ext = preset && preset.extensions;
    const thVars = ext && ext.tavern_helper && ext.tavern_helper.variables;
    const rawVer = (thVars && thVars.st_preset_version) || PRESET_VERSION;
    return formatVerTag(rawVer);
  }

  function compareSemver(a, b) {
    const parse = function (v) {
      return String(v || "")
        .trim()
        .replace(/^[vV]/, "")
        .split("-")[0]
        .split(".")
        .map(function (part) {
          const n = parseInt(part, 10);
          return isFinite(n) ? n : 0;
        });
    };
    const pa = parse(a);
    const pb = parse(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va > vb) return 1;
      if (va < vb) return -1;
    }
    return 0;
  }

  async function checkRemoteUpdateOnce(currentVer, customFetch) {
    const fetcher = customFetch || (typeof fetch === "function" ? fetch : null);
    if (!fetcher) {
      return { checked: false, hasUpdate: false, remoteVersion: null };
    }
    for (let i = 0; i < GITHUB_PACKAGE_URLS.length; i++) {
      const url = GITHUB_PACKAGE_URLS[i];
      let timer = null;
      try {
        const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
        if (ctrl) {
          timer = setTimeout(function () { ctrl.abort(); }, 6000);
        }
        const resp = await fetcher(url, {
          method: "GET",
          signal: ctrl ? ctrl.signal : undefined,
        });
        if (!resp || !resp.ok) continue;
        const data = await resp.json();
        const remoteVer = data && typeof data.version === "string" ? data.version.trim() : "";
        if (!remoteVer) continue;
        return {
          checked: true,
          hasUpdate: compareSemver(remoteVer, currentVer) > 0,
          remoteVersion: remoteVer,
          sourceUrl: url,
        };
      } catch (e) {
        // 静默降级尝试下一静态源
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    return { checked: false, hasUpdate: false, remoteVersion: null };
  }

  function readPresetThemes(preset) {
    const ext = preset && preset.extensions;
    const thVars = ext && ext.tavern_helper && ext.tavern_helper.variables;
    const raw = thVars && thVars.yd_persona_themes;
    return raw && typeof raw === "object" ? Object.assign({}, raw) : {};
  }

  function writePresetThemeBinding(preset, personaKey, hex) {
    const clean = normalizeHex(hex);
    if (!preset || !personaKey || !clean) return null;
    if (!preset.extensions) preset.extensions = {};
    if (!preset.extensions.tavern_helper) preset.extensions.tavern_helper = { scripts: [], variables: {} };
    if (!preset.extensions.tavern_helper.variables) preset.extensions.tavern_helper.variables = {};
    const prev = preset.extensions.tavern_helper.variables.yd_persona_themes;
    const map = prev && typeof prev === "object" ? Object.assign({}, prev) : {};
    map[personaKey] = clean;
    preset.extensions.tavern_helper.variables.yd_persona_themes = map;
    return map;
  }

  function getPersonaTheme(activePersona, savedThemes) {
    const pKey = (activePersona && activePersona.key) || "none";
    const tKey = (activePersona && activePersona.themeKey) || "none";
    const boundHex = savedThemes && normalizeHex(savedThemes[pKey]);
    const fallbackHex = DEFAULT_PERSONA_COLORS[tKey] || DEFAULT_PERSONA_COLORS.none;
    return buildThemeFromHex(boundHex || fallbackHex, pKey);
  }

  function applyDynamicToggle(prompts, sec, targetId) {
    const safePrompts = Array.isArray(prompts) ? prompts : [];
    const target = safePrompts.find(function (p) { return getPromptId(p) === targetId; });
    if (!target) return false;

    const targetMeta = parsePromptEntry(target);
    const nextState = !target.enabled;

    if (targetMeta.selectType === "single" && sec && Array.isArray(sec.items)) {
      const singleIds = {};
      sec.items.forEach(function (item) {
        if (item.selectType === "single") singleIds[item.id] = true;
      });
      safePrompts.forEach(function (p) {
        const pid = getPromptId(p);
        if (singleIds[pid]) {
          p.enabled = pid === targetId ? nextState : false;
        }
      });
      syncBoundVisibility(safePrompts);
      return nextState;
    }

    target.enabled = nextState;
    syncBoundVisibility(safePrompts);
    return nextState;
  }

  function clampNumber(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function computePillPosition(xRatio, yRatio, vw, vh, pillW, pillH) {
    const margin = 8;
    const w = Math.max(vw || 1280, pillW + margin * 2);
    const h = Math.max(vh || 720, pillH + margin * 2);
    const availW = Math.max(1, w - pillW - margin * 2);
    const availH = Math.max(1, h - pillH - margin * 2);
    const rx = typeof xRatio === "number" && isFinite(xRatio) ? clampNumber(xRatio, 0, 1) : 0.92;
    const ry = typeof yRatio === "number" && isFinite(yRatio) ? clampNumber(yRatio, 0, 1) : 0.24;
    return {
      left: Math.round(margin + rx * availW),
      top: Math.round(margin + ry * availH),
      xRatio: rx,
      yRatio: ry,
    };
  }

  function posToRatio(left, top, vw, vh, pillW, pillH) {
    const margin = 8;
    const availW = Math.max(1, (vw || 1280) - pillW - margin * 2);
    const availH = Math.max(1, (vh || 720) - pillH - margin * 2);
    return {
      xRatio: clampNumber((left - margin) / availW, 0, 1),
      yRatio: clampNumber((top - margin) / availH, 0, 1),
    };
  }

  function computeDrawerPosition(pillLeft, pillTop, pillW, pillH, vw, vh, drawerW, drawerH) {
    const margin = 8;
    const safeVW = vw || 1280;
    const safeVH = vh || 720;
    const effW = Math.min(drawerW || 344, safeVW - margin * 2);
    const effH = Math.min(drawerH || 480, safeVH - margin * 2);

    // Align right edge with pill when on right half, left edge when on left half, then clamp
    const alignRight = pillLeft + (pillW || 42) / 2 > safeVW / 2;
    const rawLeft = alignRight ? (pillLeft + (pillW || 42) - effW) : pillLeft;
    const left = Math.round(clampNumber(rawLeft, margin, Math.max(margin, safeVW - effW - margin)));

    // Open near pill top without exceeding bottom edge
    const maxTop = Math.max(margin, safeVH - effH - margin);
    const top = Math.round(clampNumber(pillTop, margin, maxTop));
    return { left: left, top: top };
  }

  const CoreEngine = {
    COLOR_SWATCHES: COLOR_SWATCHES,
    DEFAULT_PERSONA_COLORS: DEFAULT_PERSONA_COLORS,
    BUILTIN_PERSONAS: BUILTIN_PERSONAS,
    PRESET_VERSION: PRESET_VERSION,
    GITHUB_REPO: GITHUB_REPO,
    GITHUB_CHANGELOG_URL: GITHUB_CHANGELOG_URL,
    GITHUB_PACKAGE_URLS: GITHUB_PACKAGE_URLS,
    PANEL_TABS: PANEL_TABS,
    BANNED_REGEX_ID: BANNED_REGEX_ID,
    BANNED_REGEX_NAME: BANNED_REGEX_NAME,
    MAX_BANNED_WORDS: MAX_BANNED_WORDS,
    MAX_BANNED_WORD_LEN: MAX_BANNED_WORD_LEN,
    DEFAULT_BANNED_WORDS: DEFAULT_BANNED_WORDS,
    normalizeHex: normalizeHex,
    buildThemeFromHex: buildThemeFromHex,
    getPromptId: getPromptId,
    parsePromptEntry: parsePromptEntry,
    isPromptVisible: isPromptVisible,
    syncBoundVisibility: syncBoundVisibility,
    buildPresetSections: buildPresetSections,
    buildVisiblePresetSections: buildVisiblePresetSections,
    formatRegexLabel: formatRegexLabel,
    normalizeRegexEntry: normalizeRegexEntry,
    mergePresetRegexes: mergePresetRegexes,
    classifyRegexSections: classifyRegexSections,
    applyRegexToggleToTavernList: applyRegexToggleToTavernList,
    applyRegexToggleToPreset: applyRegexToggleToPreset,
    normalizeBannedWords: normalizeBannedWords,
    compileBannedRegex: compileBannedRegex,
    readPresetBannedWords: readPresetBannedWords,
    writePresetBannedWords: writePresetBannedWords,
    applyBannedRegexToTavernList: applyBannedRegexToTavernList,
    applyBannedRegexToPreset: applyBannedRegexToPreset,
    addBannedWord: addBannedWord,
    removeBannedWord: removeBannedWord,
    discoverPersonas: discoverPersonas,
    resolveActivePersona: resolveActivePersona,
    resolveVersionLabel: resolveVersionLabel,
    compareSemver: compareSemver,
    checkRemoteUpdateOnce: checkRemoteUpdateOnce,
    readPresetThemes: readPresetThemes,
    writePresetThemeBinding: writePresetThemeBinding,
    getPersonaTheme: getPersonaTheme,
    applyDynamicToggle: applyDynamicToggle,
    computePillPosition: computePillPosition,
    posToRatio: posToRatio,
    computeDrawerPosition: computeDrawerPosition,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CoreEngine;
  }
  root.__YD_CORE_ENGINE__ = CoreEngine;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  function getHostWin() {
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        return window.parent;
      }
    } catch (e) {}
    return window;
  }

  function getHostDoc() {
    const hw = getHostWin();
    return hw && hw.document ? hw.document : document;
  }

  function resolvePresetApi() {
    const hw = getHostWin();
    const th = window.TavernHelper || (hw && hw.TavernHelper) || null;
    const getPreset = window.getPreset || (th && th.getPreset) || (hw && hw.getPreset) || null;
    const updatePresetWith = window.updatePresetWith || (th && th.updatePresetWith) || (hw && hw.updatePresetWith) || null;
    const replacePreset = window.replacePreset || (th && th.replacePreset) || (hw && hw.replacePreset) || null;
    const getLoadedPresetName = window.getLoadedPresetName || (th && th.getLoadedPresetName) || (hw && hw.getLoadedPresetName) || null;
    if (!getPreset || !updatePresetWith) return null;
    return {
      getPreset: getPreset,
      updatePresetWith: updatePresetWith,
      replacePreset: replacePreset,
      getLoadedPresetName: getLoadedPresetName,
    };
  }

  function resolveRegexApi() {
    const hw = getHostWin();
    const th = window.TavernHelper || (hw && hw.TavernHelper) || null;
    const getTavernRegexes = window.getTavernRegexes || (th && th.getTavernRegexes) || (hw && hw.getTavernRegexes) || null;
    const updateTavernRegexesWith = window.updateTavernRegexesWith || (th && th.updateTavernRegexesWith) || (hw && hw.updateTavernRegexesWith) || null;
    if (!getTavernRegexes || !updateTavernRegexesWith) return null;
    return {
      getTavernRegexes: getTavernRegexes,
      updateTavernRegexesWith: updateTavernRegexesWith,
    };
  }

  function loadPanelState() {
    try {
      const raw = getHostWin().localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const tab = parsed.activeTab;
        return {
          open: Boolean(parsed.open),
          activeTab: (tab === "regex" || tab === "assistant") ? tab : "preset",
          xRatio: typeof parsed.xRatio === "number" ? clampNumber(parsed.xRatio, 0, 1) : 0.92,
          yRatio: typeof parsed.yRatio === "number" ? clampNumber(parsed.yRatio, 0, 1) : 0.24,
        };
      }
    } catch (e) {}
    return { open: false, activeTab: "preset", xRatio: 0.92, yRatio: 0.24 };
  }

  function savePanelState(state) {
    try {
      getHostWin().localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadLocalThemes() {
    try {
      const raw = getHostWin().localStorage.getItem(THEME_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    return {};
  }

  function saveLocalThemes(themes) {
    try {
      getHostWin().localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themes || {}));
    } catch (e) {}
  }

  function ensureStyles(hd) {
    const old = hd.getElementById(STYLE_EL_ID);
    if (old) old.remove();
    const style = hd.createElement("style");
    style.id = STYLE_EL_ID;
    style.textContent = [
      `#${ROOT_EL_ID} {`,
      `  --yd-accent: #d46b94;`,
      `  --yd-accent-soft: rgba(212, 107, 148, 0.16);`,
      `  --yd-accent-border: rgba(212, 107, 148, 0.48);`,
      `  --yd-glow: rgba(212, 107, 148, 0.28);`,
      `  --yd-fg: var(--SmartThemeBodyColor, #ece4ea);`,
      `  --yd-bg: var(--SmartThemeBlurTintColor, rgba(28, 24, 31, 0.94));`,
      `  --yd-surface: color-mix(in srgb, var(--yd-fg) 6%, transparent);`,
      `  --yd-border: color-mix(in srgb, var(--yd-fg) 15%, transparent);`,
      `  position: fixed; z-index: 9998;`,
      `  font-family: var(--mainFontFamily, "PingFang SC", "Microsoft YaHei", sans-serif);`,
      `  color: var(--yd-fg); font-size: 13px; line-height: 1.45;`,
      `}`,
      `#${ROOT_EL_ID} * { box-sizing: border-box; }`,
      `@keyframes yd-sphere-breathe {`,
      `  0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 5px 16px rgba(0,0,0,0.22), 0 0 10px var(--yd-glow); }`,
      `  50% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.26), 0 6px 18px rgba(0,0,0,0.25), 0 0 15px var(--yd-accent-border); }`,
      `}`,
      `@keyframes yd-star-orbit {`,
      `  from { transform: rotate(0deg); }`,
      `  to { transform: rotate(360deg); }`,
      `}`,
      `@keyframes yd-twinkle {`,
      `  0%, 100% { opacity: 0.96; transform: scale(1); }`,
      `  50% { opacity: 0.56; transform: scale(0.9); }`,
      `}`,
      `@keyframes yd-update-pulse {`,
      `  0% { box-shadow: 0 0 0 2px var(--yd-bg), 0 0 0 2px var(--yd-accent); }`,
      `  70% { box-shadow: 0 0 0 2px var(--yd-bg), 0 0 0 5px transparent; }`,
      `  100% { box-shadow: 0 0 0 2px var(--yd-bg), 0 0 0 2px transparent; }`,
      `}`,
      `@keyframes yd-sec-enter {`,
      `  from { opacity: 0; transform: translateY(4px); }`,
      `  to { opacity: 1; transform: translateY(0); }`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill {`,
      `  position: relative; display: inline-flex; align-items: center; justify-content: center; overflow: visible;`,
      `  width: 42px; height: 42px; padding: 0; border-radius: 50%; cursor: grab; user-select: none; touch-action: none;`,
      `  background: radial-gradient(circle at 30% 28%, color-mix(in srgb, var(--yd-accent) 16%, transparent), color-mix(in srgb, var(--yd-bg) 70%, transparent));`,
      `  color: var(--yd-accent); opacity: 0.86;`,
      `  border: 1.5px solid var(--yd-accent-border);`,
      `  box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 5px 16px rgba(0,0,0,0.22), 0 0 10px var(--yd-glow);`,
      `  backdrop-filter: blur(12px) saturate(135%); -webkit-backdrop-filter: blur(12px) saturate(135%);`,
      `  animation: yd-sphere-breathe 5.2s ease-in-out infinite;`,
      `  transition: opacity 0.24s ease, transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease, box-shadow 0.24s ease, visibility 0s linear 0s;`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill:hover {`,
      `  opacity: 1; transform: scale(1.04);`,
      `  border-color: var(--yd-accent);`,
      `  box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 7px 20px rgba(0,0,0,0.26), 0 0 16px var(--yd-accent-border);`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill:active, #${ROOT_EL_ID} .yd-pill.is-dragging {`,
      `  cursor: grabbing; opacity: 1; transform: scale(1.06); animation: none;`,
      `  box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 24px rgba(0,0,0,0.32), 0 0 20px var(--yd-accent-border);`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill-orbit {`,
      `  position: absolute; inset: -7px; width: calc(100% + 14px); height: calc(100% + 14px);`,
      `  color: var(--yd-accent); opacity: 0.64; pointer-events: none;`,
      `  filter: drop-shadow(0 0 4px var(--yd-glow));`,
      `  animation: yd-star-orbit 14s linear infinite;`,
      `  transition: opacity 0.3s ease;`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill:hover .yd-pill-orbit, #${ROOT_EL_ID} .yd-pill.is-dragging .yd-pill-orbit { opacity: 0.94; }`,
      `#${ROOT_EL_ID} .yd-pill-sparkle {`,
      `  width: 21px; height: 21px; display: block; flex-shrink: 0; position: relative; z-index: 1;`,
      `  color: var(--yd-accent); filter: drop-shadow(0 0 5px var(--yd-glow)); pointer-events: none;`,
      `  transition: opacity 0.24s ease;`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill-sparkle path:nth-child(2) { transform-box: fill-box; transform-origin: center; animation: yd-twinkle 4.2s ease-in-out infinite; }`,
      `#${ROOT_EL_ID} .yd-pill-sparkle path:nth-child(3) { transform-box: fill-box; transform-origin: center; animation: yd-twinkle 4.2s ease-in-out 1.8s infinite; }`,
      `#${ROOT_EL_ID} .yd-pill-update-dot {`,
      `  display: none; position: absolute; top: 1px; right: 1px; z-index: 2;`,
      `  width: 8px; height: 8px; border-radius: 50%; background: var(--yd-accent);`,
      `  box-shadow: 0 0 0 2px var(--yd-bg), 0 0 8px var(--yd-accent); pointer-events: none;`,
      `}`,
      `#${ROOT_EL_ID} .yd-pill.has-update .yd-pill-update-dot { display: block; animation: yd-update-pulse 2.6s ease-out infinite; }`,
      `#${ROOT_EL_ID} .yd-drawer {`,
      `  position: fixed; width: min(344px, calc(100vw - 16px)); height: min(460px, calc(100dvh - 24px));`,
      `  display: flex; flex-direction: column; border-radius: 12px; overflow: hidden;`,
      `  background: color-mix(in srgb, var(--yd-bg) 92%, transparent); color: var(--yd-fg);`,
      `  border: 1px solid var(--yd-accent-border);`,
      `  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 36px rgba(0,0,0,0.34), 0 0 20px var(--yd-glow);`,
      `  backdrop-filter: blur(16px) saturate(135%); -webkit-backdrop-filter: blur(16px) saturate(135%);`,
      `  opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-4px) scale(0.97);`,
      `  transition: opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0.24s;`,
      `}`,
      `#${ROOT_EL_ID}.is-open .yd-drawer {`,
      `  opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0) scale(1);`,
      `  transition: opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 0s;`,
      `}`,
      `#${ROOT_EL_ID}.is-open .yd-pill { opacity: 0; visibility: hidden; pointer-events: none; transform: scale(0.86); animation: none; transition: opacity 0.16s ease, transform 0.18s ease, visibility 0s linear 0.18s; }`,
      `#${ROOT_EL_ID}.is-open .yd-pill-orbit { animation: none; }`,
      `#${ROOT_EL_ID} .yd-head {`,
      `  display: flex; align-items: center; justify-content: space-between; gap: 6px;`,
      `  padding: 9px 11px; background: linear-gradient(180deg, color-mix(in srgb, var(--yd-accent) 16%, transparent), color-mix(in srgb, var(--yd-accent) 7%, transparent));`,
      `  border-bottom: 1px dashed var(--yd-accent-border);`,
      `}`,
      `#${ROOT_EL_ID} .yd-head-title { font-weight: 700; font-size: 13px; color: var(--yd-accent); display: flex; align-items: center; gap: 6px; min-width: 0; }`,
      `#${ROOT_EL_ID} .yd-ver-badge { display: inline-flex; align-items: center; gap: 4px; text-decoration: none; cursor: pointer; font-size: 10.5px; font-weight: 600; padding: 1px 6px; border-radius: 999px; background: var(--yd-surface); border: 1px solid var(--yd-accent-border); color: var(--yd-accent); letter-spacing: 0.02em; flex-shrink: 0; transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease; }`,
      `#${ROOT_EL_ID} .yd-ver-badge:hover { background: var(--yd-accent-soft); color: var(--yd-fg); }`,
      `#${ROOT_EL_ID} .yd-ver-badge.is-update { background: var(--yd-accent-soft); border-color: var(--yd-accent); color: var(--yd-fg); box-shadow: 0 0 8px var(--yd-glow); }`,
      `#${ROOT_EL_ID} .yd-head-btns { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }`,
      `#${ROOT_EL_ID} .yd-icon-btn {`,
      `  border: 1px solid var(--yd-border); background: var(--yd-surface); color: var(--yd-fg);`,
      `  border-radius: 6px; padding: 3px 8px; font-size: 11.5px; cursor: pointer; font-family: inherit;`,
      `  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.18s ease, color 0.18s ease, background 0.18s ease;`,
      `}`,
      `#${ROOT_EL_ID} .yd-icon-btn:hover { border-color: var(--yd-accent-border); color: var(--yd-accent); background: var(--yd-accent-soft); }`,
      `#${ROOT_EL_ID} .yd-icon-btn:active { transform: scale(0.97); }`,
      `#${ROOT_EL_ID} .yd-tabs { display: flex; gap: 4px; padding: 6px 11px; border-bottom: 1px solid var(--yd-border); background: color-mix(in srgb, var(--yd-fg) 3%, transparent); flex-shrink: 0; }`,
      `#${ROOT_EL_ID} .yd-tab { flex: 1; border: 1px solid transparent; background: transparent; color: color-mix(in srgb, var(--yd-fg) 72%, transparent); border-radius: 7px; padding: 5px 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: color 0.18s ease, background 0.2s ease, border-color 0.2s ease, transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease; text-align: center; }`,
      `#${ROOT_EL_ID} .yd-tab:hover { color: var(--yd-fg); background: var(--yd-surface); }`,
      `#${ROOT_EL_ID} .yd-tab:active { transform: scale(0.98); }`,
      `#${ROOT_EL_ID} .yd-tab.is-active { background: linear-gradient(135deg, color-mix(in srgb, var(--yd-accent) 20%, transparent), color-mix(in srgb, var(--yd-accent) 10%, transparent)); border-color: var(--yd-accent-border); color: var(--yd-accent); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(0,0,0,0.1); }`,
      `#${ROOT_EL_ID} .yd-card-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--yd-border); background: var(--yd-surface); flex-wrap: wrap; transition: border-color 0.18s ease; }`,
      `#${ROOT_EL_ID} .yd-muted { font-size: 11.5px; opacity: 0.78; line-height: 1.45; }`,
      `#${ROOT_EL_ID} .yd-link-btn { display: inline-flex; align-items: center; gap: 4px; text-decoration: none; border: 1px solid var(--yd-accent-border); background: var(--yd-accent-soft); color: var(--yd-accent); border-radius: 6px; padding: 4px 9px; font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background 0.18s ease, color 0.18s ease; }`,
      `#${ROOT_EL_ID} .yd-link-btn:hover { background: var(--yd-accent); color: #fff; border-color: var(--yd-accent); }`,
      `#${ROOT_EL_ID} .yd-link-btn:active { transform: scale(0.97); }`,
      `#${ROOT_EL_ID} .yd-body { flex: 1; min-height: 0; padding: 10px 11px; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 10px; scrollbar-gutter: stable; }`,
      `#${ROOT_EL_ID} .yd-body.is-entering > .yd-sec { animation: yd-sec-enter 0.2s cubic-bezier(0.22, 1, 0.36, 1) both; }`,
      `@supports (-moz-appearance: none) { #${ROOT_EL_ID} .yd-body { scrollbar-width: thin; scrollbar-color: var(--yd-accent-border) transparent; } }`,
      `#${ROOT_EL_ID} .yd-body::-webkit-scrollbar { width: 5px; }`,
      `#${ROOT_EL_ID} .yd-body::-webkit-scrollbar-track { background: transparent; margin: 6px 0; }`,
      `#${ROOT_EL_ID} .yd-body::-webkit-scrollbar-thumb { background: var(--yd-accent-border); border-radius: 999px; }`,
      `#${ROOT_EL_ID} .yd-body::-webkit-scrollbar-thumb:hover { background: var(--yd-accent); }`,
      `#${ROOT_EL_ID} .yd-body::-webkit-scrollbar-button { display: none; height: 0; width: 0; }`,
      `#${ROOT_EL_ID} .yd-sec { display: flex; flex-direction: column; gap: 6px; }`,
      `#${ROOT_EL_ID} .yd-sec-title { font-size: 11.5px; font-weight: 700; color: var(--yd-accent); letter-spacing: 0.03em; }`,
      `#${ROOT_EL_ID} .yd-sec-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }`,
      `#${ROOT_EL_ID} .yd-sec-head-left { display: flex; align-items: center; gap: 5px; min-width: 0; }`,
      `#${ROOT_EL_ID} .yd-sec-head-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }`,
      `#${ROOT_EL_ID} .yd-sec-count { font-size: 10.5px; opacity: 0.72; font-variant-numeric: tabular-nums; }`,
      `#${ROOT_EL_ID} .yd-help-btn { width: 17px; height: 17px; padding: 0; border-radius: 50%; border: 1px solid var(--yd-accent-border); background: var(--yd-surface); color: var(--yd-accent); font-size: 10.5px; font-weight: 700; line-height: 1; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease; }`,
      `#${ROOT_EL_ID} .yd-help-btn:hover, #${ROOT_EL_ID} .yd-help-btn.is-active { background: var(--yd-accent-soft); border-color: var(--yd-accent); }`,
      `#${ROOT_EL_ID} .yd-mini-link { border: 1px solid var(--yd-border); background: var(--yd-surface); color: var(--yd-fg); border-radius: 5px; padding: 2px 7px; font-size: 11px; cursor: pointer; font-family: inherit; opacity: 0.86; transition: border-color 0.16s ease, color 0.16s ease, opacity 0.16s ease; }`,
      `#${ROOT_EL_ID} .yd-mini-link:hover { border-color: var(--yd-accent-border); color: var(--yd-accent); opacity: 1; }`,
      `#${ROOT_EL_ID} .yd-help-card { padding: 8px 10px; border-radius: 8px; border: 1px dashed var(--yd-accent-border); background: color-mix(in srgb, var(--yd-accent) 7%, var(--yd-surface)); font-size: 11.5px; line-height: 1.52; color: color-mix(in srgb, var(--yd-fg) 90%, transparent); display: flex; flex-direction: column; gap: 3px; animation: yd-sec-enter 0.18s ease-out; }`,
      `#${ROOT_EL_ID} .yd-help-card strong { color: var(--yd-accent); font-weight: 600; }`,
      `#${ROOT_EL_ID} .yd-banned-form { display: flex; gap: 5px; align-items: center; }`,
      `#${ROOT_EL_ID} .yd-input { flex: 1; min-width: 0; height: 28px; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--yd-border); background: var(--yd-surface); color: var(--yd-fg); font-family: inherit; font-size: 12px; outline: none; transition: border-color 0.16s ease; }`,
      `#${ROOT_EL_ID} .yd-input:focus { border-color: var(--yd-accent); }`,
      `#${ROOT_EL_ID} .yd-btn-sm { height: 28px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--yd-accent-border); background: var(--yd-accent-soft); color: var(--yd-accent); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; flex-shrink: 0; transition: background 0.16s ease, color 0.16s ease; }`,
      `#${ROOT_EL_ID} .yd-btn-sm:hover { background: var(--yd-accent); color: #fff; }`,
      `#${ROOT_EL_ID} .yd-banned-tags { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }`,
      `#${ROOT_EL_ID} .yd-banned-tag { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--yd-border); background: var(--yd-surface); color: var(--yd-fg); border-radius: 6px; padding: 2px 4px 2px 7px; font-size: 11.5px; max-width: 100%; }`,
      `#${ROOT_EL_ID} .yd-banned-tag-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }`,
      `#${ROOT_EL_ID} .yd-tag-del { border: none; background: transparent; color: color-mix(in srgb, var(--yd-fg) 62%, transparent); cursor: pointer; font-size: 13px; line-height: 1; padding: 1px 4px; border-radius: 4px; font-family: inherit; transition: color 0.14s ease, background 0.14s ease; }`,
      `#${ROOT_EL_ID} .yd-tag-del:hover { color: #e06c75; background: rgba(224, 108, 117, 0.14); }`,
      `#${ROOT_EL_ID} .yd-chips { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }`,
      `#${ROOT_EL_ID} .yd-chip {`,
      `  border: 1px solid var(--yd-border); background: var(--yd-surface); color: var(--yd-fg);`,
      `  border-radius: 7px; padding: 4px 8px; font-size: 12px; cursor: pointer; font-family: inherit;`,
      `  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;`,
      `}`,
      `#${ROOT_EL_ID} .yd-chip:hover { border-color: var(--yd-accent-border); }`,
      `#${ROOT_EL_ID} .yd-chip:active { transform: scale(0.97); }`,
      `#${ROOT_EL_ID} .yd-chip.is-active {`,
      `  background: linear-gradient(135deg, color-mix(in srgb, var(--yd-accent) 20%, transparent), color-mix(in srgb, var(--yd-accent) 10%, transparent));`,
      `  border-color: var(--yd-accent); color: var(--yd-accent); font-weight: 600;`,
      `  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 0 8px var(--yd-glow);`,
      `}`,
      `#${ROOT_EL_ID} .yd-swatches { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }`,
      `#${ROOT_EL_ID} .yd-swatch {`,
      `  width: 20px; height: 20px; border-radius: 50%; padding: 0; cursor: pointer;`,
      `  border: 2px solid transparent; transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.18s ease, box-shadow 0.18s ease;`,
      `  box-shadow: 0 1px 3px rgba(0,0,0,0.28);`,
      `}`,
      `#${ROOT_EL_ID} .yd-swatch:hover { transform: scale(1.08); }`,
      `#${ROOT_EL_ID} .yd-swatch:active { transform: scale(0.95); }`,
      `#${ROOT_EL_ID} .yd-swatch.is-active { border-color: var(--yd-fg); transform: scale(1.06); box-shadow: 0 0 8px var(--yd-glow); }`,
      `#${ROOT_EL_ID} .yd-color-wrap {`,
      `  position: relative; width: 20px; height: 20px; border-radius: 50%; overflow: hidden;`,
      `  border: 1.5px solid var(--yd-border); display: inline-flex; align-items: center; justify-content: center;`,
      `  background: conic-gradient(#d46b94, #c69352, #59a985, #5fa0d0, #9575d8, #d46b94); cursor: pointer;`,
      `  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);`,
      `}`,
      `#${ROOT_EL_ID} .yd-color-wrap:hover { transform: scale(1.08); }`,
      `#${ROOT_EL_ID} .yd-color-wrap.is-active { border: 2px solid var(--yd-fg); transform: scale(1.06); }`,
      `#${ROOT_EL_ID} .yd-color-input {`,
      `  position: absolute; inset: -4px; width: 28px; height: 28px; opacity: 0; cursor: pointer; border: none; padding: 0;`,
      `}`,
      `#${ROOT_EL_ID} .yd-toast {`,
      `  display: none; font-size: 11.5px; padding: 6px 10px;`,
      `  border-top: 1px solid var(--yd-border); background: var(--yd-accent-soft); color: var(--yd-accent);`,
      `}`,
      `#${ROOT_EL_ID} .yd-toast.show { display: block; animation: yd-sec-enter 0.18s ease-out; }`,
      `@media (max-width: 600px) {`,
      `  #${ROOT_EL_ID} .yd-drawer { width: calc(100vw - 16px); }`,
      `  #${ROOT_EL_ID} .yd-chip { min-height: 32px; padding: 6px 10px; }`,
      `  #${ROOT_EL_ID} .yd-tab { min-height: 32px; padding: 6px; }`,
      `  #${ROOT_EL_ID} .yd-icon-btn { min-height: 28px; padding: 4px 10px; }`,
      `  #${ROOT_EL_ID} .yd-input { height: 32px; font-size: 16px; }`,
      `  #${ROOT_EL_ID} .yd-btn-sm { height: 32px; padding: 0 12px; }`,
      `  #${ROOT_EL_ID} .yd-help-btn { width: 22px; height: 22px; font-size: 12px; }`,
      `  #${ROOT_EL_ID} .yd-tag-del { padding: 2px 6px; font-size: 15px; }`,
      `}`,
      `@media (prefers-reduced-motion: reduce) {`,
      `  #${ROOT_EL_ID} .yd-pill, #${ROOT_EL_ID} .yd-pill-orbit, #${ROOT_EL_ID} .yd-pill-sparkle path, #${ROOT_EL_ID} .yd-pill-update-dot, #${ROOT_EL_ID} .yd-body.is-entering > .yd-sec, #${ROOT_EL_ID} .yd-toast.show { animation: none !important; }`,
      `  #${ROOT_EL_ID} * { transition-duration: 0.01ms !important; }`,
      `}`,
    ].join("\n");
    (hd.head || hd.documentElement).appendChild(style);
  }

  function mountPanel() {
    const hw = getHostWin();
    const hd = getHostDoc();
    if (!hd || !hd.body) return null;

    const existing = hd.getElementById(ROOT_EL_ID);
    if (existing) existing.remove();
    ensureStyles(hd);

    const state = loadPanelState();
    const rootEl = hd.createElement("div");
    rootEl.id = ROOT_EL_ID;
    if (state.open) rootEl.classList.add("is-open");

    const pill = hd.createElement("button");
    pill.type = "button";
    pill.className = "yd-pill";
    pill.title = "ST-预设助手 · 莉莉丝（点击展开，按住拖动）";
    pill.setAttribute("aria-label", "打开 ST-预设助手面板");

    const svgNS = "http://www.w3.org/2000/svg";
    const orbitSvg = hd.createElementNS(svgNS, "svg");
    orbitSvg.setAttribute("class", "yd-pill-orbit");
    orbitSvg.setAttribute("viewBox", "0 0 56 56");
    orbitSvg.setAttribute("aria-hidden", "true");
    const orbitCircle = hd.createElementNS(svgNS, "circle");
    orbitCircle.setAttribute("cx", "28");
    orbitCircle.setAttribute("cy", "28");
    orbitCircle.setAttribute("r", "24");
    orbitCircle.setAttribute("fill", "none");
    orbitCircle.setAttribute("stroke", "currentColor");
    orbitCircle.setAttribute("stroke-width", "0.9");
    orbitCircle.setAttribute("stroke-dasharray", "16 14 7 18");
    orbitCircle.setAttribute("stroke-linecap", "round");
    orbitCircle.setAttribute("opacity", "0.45");
    orbitSvg.appendChild(orbitCircle);
    [
      "M45 7.5L45.7 9.8L48 10.5L45.7 11.2L45 13.5L44.3 11.2L42 10.5L44.3 9.8Z",
      "M7.5 16L8 17.6L9.6 18.1L8 18.6L7.5 20.2L7 18.6L5.4 18.1L7 17.6Z",
    ].forEach(function (d) {
      const star = hd.createElementNS(svgNS, "path");
      star.setAttribute("d", d);
      star.setAttribute("fill", "currentColor");
      star.setAttribute("opacity", "0.88");
      orbitSvg.appendChild(star);
    });
    const orbitDot = hd.createElementNS(svgNS, "circle");
    orbitDot.setAttribute("cx", "25");
    orbitDot.setAttribute("cy", "51.8");
    orbitDot.setAttribute("r", "1.35");
    orbitDot.setAttribute("fill", "currentColor");
    orbitDot.setAttribute("opacity", "0.78");
    orbitSvg.appendChild(orbitDot);

    const sparkleSvg = hd.createElementNS(svgNS, "svg");
    sparkleSvg.setAttribute("class", "yd-pill-sparkle");
    sparkleSvg.setAttribute("viewBox", "0 0 24 24");
    sparkleSvg.setAttribute("fill", "currentColor");
    sparkleSvg.setAttribute("aria-hidden", "true");
    [
      "M10 2.5L11.75 8.25L17.5 10L11.75 11.75L10 17.5L8.25 11.75L2.5 10L8.25 8.25Z",
      "M18.5 3L19.35 5.45L21.8 6.3L19.35 7.15L18.5 9.6L17.65 7.15L15.2 6.3L17.65 5.45Z",
      "M18 15.2L18.7 17.3L20.8 18L18.7 18.7L18 20.8L17.3 18.7L15.2 18L17.3 17.3Z",
    ].forEach(function (d) {
      const pEl = hd.createElementNS(svgNS, "path");
      pEl.setAttribute("d", d);
      sparkleSvg.appendChild(pEl);
    });
    const updateDot = hd.createElement("span");
    updateDot.className = "yd-pill-update-dot";
    pill.appendChild(orbitSvg);
    pill.appendChild(sparkleSvg);
    pill.appendChild(updateDot);

    const drawer = hd.createElement("div");
    drawer.className = "yd-drawer";

    const head = hd.createElement("div");
    head.className = "yd-head";
    const headTitle = hd.createElement("div");
    headTitle.className = "yd-head-title";
    const titleMain = hd.createElement("span");
    titleMain.textContent = "ST-预设助手";
    const verBadge = hd.createElement("a");
    verBadge.className = "yd-ver-badge";
    verBadge.href = GITHUB_CHANGELOG_URL;
    verBadge.target = "_blank";
    verBadge.rel = "noopener noreferrer";
    verBadge.textContent = "v" + PRESET_VERSION;
    verBadge.title = "点击前往 GitHub 查看更新日志";
    headTitle.appendChild(titleMain);
    headTitle.appendChild(verBadge);

    const headBtns = hd.createElement("div");
    headBtns.className = "yd-head-btns";
    const saveBtn = hd.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "yd-icon-btn";
    saveBtn.textContent = "保存";
    saveBtn.title = "将当前预设、正则与AI人设配色写入已加载预设";
    const closeBtn = hd.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "yd-icon-btn";
    closeBtn.textContent = "✕";
    closeBtn.title = "收起";
    headBtns.appendChild(saveBtn);
    headBtns.appendChild(closeBtn);
    head.appendChild(headTitle);
    head.appendChild(headBtns);

    const tabsBar = hd.createElement("div");
    tabsBar.className = "yd-tabs";
    tabsBar.setAttribute("role", "tablist");
    const tabButtons = {};
    PANEL_TABS.forEach(function (tab) {
      const tbtn = hd.createElement("button");
      tbtn.type = "button";
      tbtn.className = "yd-tab" + (state.activeTab === tab.key ? " is-active" : "");
      tbtn.setAttribute("role", "tab");
      tbtn.setAttribute("data-yd-tab", tab.key);
      tbtn.setAttribute("aria-selected", String(state.activeTab === tab.key));
      tbtn.textContent = tab.label;
      tbtn.addEventListener("click", function () {
        if (state.activeTab === tab.key) return;
        state.activeTab = tab.key;
        savePanelState(state);
        renderFromPreset({ preserveScroll: false, reposition: false });
      });
      tabButtons[tab.key] = tbtn;
      tabsBar.appendChild(tbtn);
    });

    const body = hd.createElement("div");
    body.className = "yd-body";
    const toast = hd.createElement("div");
    toast.className = "yd-toast";

    drawer.appendChild(head);
    drawer.appendChild(tabsBar);
    drawer.appendChild(body);
    drawer.appendChild(toast);

    rootEl.appendChild(pill);
    rootEl.appendChild(drawer);
    hd.body.appendChild(rootEl);

    let lastPillMetrics = { w: 42, h: 42 };
    function getPillMetrics() {
      const rect = pill.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        lastPillMetrics = { w: rect.width, h: rect.height };
      }
      return lastPillMetrics;
    }

    function getViewportSize() {
      const vv = hw.visualViewport;
      const vw = (vv && vv.width) || hw.innerWidth || 1280;
      const vh = (vv && vv.height) || hw.innerHeight || 720;
      return { vw: vw, vh: vh };
    }

    function applyRelativePosition() {
      const vp = getViewportSize();
      const vw = vp.vw;
      const vh = vp.vh;
      const pm = getPillMetrics();
      const pos = computePillPosition(state.xRatio, state.yRatio, vw, vh, pm.w, pm.h);
      rootEl.style.left = pos.left + "px";
      rootEl.style.top = pos.top + "px";
      if (state.open) {
        const dw = Math.min(344, vw - 16);
        const dh = Math.min(460, vh - 24);
        const dpos = computeDrawerPosition(pos.left, pos.top, pm.w, pm.h, vw, vh, dw, dh);
        drawer.style.left = dpos.left + "px";
        drawer.style.top = dpos.top + "px";
      }
    }

    applyRelativePosition();

    let toastTimer = null;
    let isSelfUpdating = false;
    let updateCheckResult = null;
    let hasCheckedUpdateOnLoad = false;
    let bannedHelpOpen = false;

    async function runInitialUpdateCheck() {
      if (hasCheckedUpdateOnLoad) return;
      hasCheckedUpdateOnLoad = true;
      let curVer = PRESET_VERSION;
      try {
        const api = resolvePresetApi();
        const preset = api && api.getPreset("in_use");
        curVer = resolveVersionLabel(preset).replace(/^v/i, "");
      } catch (e) {}
      const testFetcher = window.__YD_TEST_FETCH__ || (hw && hw.__YD_TEST_FETCH__) || null;
      const res = await checkRemoteUpdateOnce(curVer, testFetcher);
      updateCheckResult = res;
      if (res && res.hasUpdate && res.remoteVersion) {
        const nextVer = formatVerTag(res.remoteVersion);
        verBadge.textContent = formatVerTag(curVer) + " · 有新版 " + nextVer;
        verBadge.classList.add("is-update");
        verBadge.title = "发现新版本 " + nextVer + "，点击前往 GitHub 查看更新日志";
        pill.classList.add("has-update");
      } else if (res && res.checked) {
        verBadge.title = "当前已是最新版本 (" + formatVerTag(curVer) + ") · 点击前往 GitHub 查看更新日志";
      }
      if (state.open && state.activeTab === "assistant") {
        renderFromPreset({ preserveScroll: true, reposition: false });
      }
    }

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add("show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("show");
      }, 2200);
    }

    function syncHostColors() {
      try {
        const rootStyle = hw.getComputedStyle(hd.documentElement);
        const bodyStyle = hw.getComputedStyle(hd.body);
        const fg = bodyStyle.getPropertyValue("--SmartThemeBodyColor").trim() ||
          rootStyle.getPropertyValue("--SmartThemeBodyColor").trim() ||
          bodyStyle.color || "#ece4ea";
        const bg = bodyStyle.getPropertyValue("--SmartThemeBlurTintColor").trim() ||
          rootStyle.getPropertyValue("--SmartThemeBlurTintColor").trim() ||
          bodyStyle.backgroundColor;
        if (fg) rootEl.style.setProperty("--yd-fg", fg);
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          rootEl.style.setProperty("--yd-bg", bg);
        }
      } catch (e) {}
    }

    function applyThemeColors(theme) {
      rootEl.style.setProperty("--yd-accent", theme.accent);
      rootEl.style.setProperty("--yd-accent-soft", theme.accentSoft);
      rootEl.style.setProperty("--yd-accent-border", theme.accentBorder);
      rootEl.style.setProperty("--yd-glow", theme.glow);
      rootEl.setAttribute("data-yd-persona", theme.key);
      rootEl.setAttribute("data-yd-accent", theme.accent);
    }

    async function mutatePreset(updaterFn, toastMsg) {
      const api = resolvePresetApi();
      if (!api) {
        showToast("未检测到预设接口");
        return;
      }
      isSelfUpdating = true;
      try {
        await api.updatePresetWith("in_use", function (preset) {
          updaterFn(preset);
          return preset;
        }, { render: "debounced" });
        await renderFromPreset({ preserveScroll: true, reposition: false });
        if (toastMsg) showToast(toastMsg);
      } catch (err) {
        showToast("更新失败：" + (err && err.message ? err.message : String(err)));
      } finally {
        setTimeout(function () { isSelfUpdating = false; }, 160);
      }
    }

    function renderSection(titleText, buildFn, containerClass) {
      const sec = hd.createElement("div");
      sec.className = "yd-sec";
      const t = hd.createElement("div");
      t.className = "yd-sec-title";
      t.textContent = titleText;
      sec.appendChild(t);
      const wrap = hd.createElement("div");
      wrap.className = containerClass || "yd-chips";
      sec.appendChild(wrap);
      buildFn(wrap, sec);
      body.appendChild(sec);
    }

    function syncTabButtons() {
      PANEL_TABS.forEach(function (tab) {
        const btn = tabButtons[tab.key];
        if (!btn) return;
        const active = state.activeTab === tab.key;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
    }

    async function toggleRegexItem(rxItem) {
      const api = resolvePresetApi();
      const regexApi = resolveRegexApi();
      const nextEnabled = !rxItem.enabled;
      isSelfUpdating = true;
      try {
        if (regexApi && regexApi.updateTavernRegexesWith) {
          await regexApi.updateTavernRegexesWith(function (list) {
            return applyRegexToggleToTavernList(list, rxItem.id, nextEnabled);
          }, { type: "preset", name: "in_use" });
        }
        if (api && api.updatePresetWith) {
          await api.updatePresetWith("in_use", function (preset) {
            applyRegexToggleToPreset(preset, rxItem.id, nextEnabled);
            return preset;
          }, { render: "debounced" });
        }
        await renderFromPreset({ preserveScroll: true, reposition: false });
      } catch (err) {
        showToast("正则切换失败：" + (err && err.message ? err.message : String(err)));
      } finally {
        setTimeout(function () { isSelfUpdating = false; }, 160);
      }
    }

    function renderPresetTab(prompts) {
      const sections = buildVisiblePresetSections(prompts);
      if (!sections.length) {
        renderSection("预设条目", function (wrap) {
          const empty = hd.createElement("div");
          empty.className = "yd-muted";
          empty.textContent = "当前预设未检测到可管理的条目。";
          wrap.appendChild(empty);
        });
        return;
      }

      sections.forEach(function (sec) {
        renderSection(sec.title, function (wrap) {
          sec.items.forEach(function (item) {
            const btn = hd.createElement("button");
            btn.type = "button";
            btn.className = "yd-chip" + (item.prompt.enabled ? " is-active" : "");
            btn.setAttribute("data-yd-item-id", item.id);
            btn.textContent = item.label;
            btn.addEventListener("click", function () {
              mutatePreset(function (p) {
                const liveSec = buildPresetSections(p.prompts || []).find(function (s) { return s.key === sec.key; }) || sec;
                applyDynamicToggle(p.prompts || [], liveSec, item.id);
              });
            });
            wrap.appendChild(btn);
          });
        });
      });
    }

    function renderRegexTab(preset) {
      const regexApi = resolveRegexApi();
      let liveList = [];
      if (regexApi && regexApi.getTavernRegexes) {
        try {
          liveList = regexApi.getTavernRegexes({ type: "preset", name: "in_use" }) || [];
        } catch (e) {}
      }
      const presetScripts = (preset && preset.extensions && preset.extensions.regex_scripts) || [];
      const merged = mergePresetRegexes(liveList, presetScripts);
      const groups = classifyRegexSections(merged);

      if (!groups.length) {
        renderSection("正则状态", function (wrap) {
          const empty = hd.createElement("div");
          empty.className = "yd-muted";
          empty.textContent = "当前预设未检测到可管理的预设正则条目。";
          wrap.appendChild(empty);
        });
      } else {
        groups.forEach(function (grp) {
          renderSection(grp.title, function (wrap) {
            grp.items.forEach(function (rx) {
              const btn = hd.createElement("button");
              btn.type = "button";
              btn.className = "yd-chip" + (rx.enabled ? " is-active" : "");
              btn.setAttribute("data-yd-regex-id", rx.id || rx.name);
              btn.textContent = formatRegexLabel(rx.name);
              btn.addEventListener("click", function () {
                toggleRegexItem(rx);
              });
              wrap.appendChild(btn);
            });
          });
        });
      }

      renderBannedWordsSection(preset);
    }

    async function mutateBannedWords(nextWords, toastMsg) {
      const api = resolvePresetApi();
      const regexApi = resolveRegexApi();
      const cleanWords = normalizeBannedWords(nextWords);
      const nextFindRegex = compileBannedRegex(cleanWords);
      isSelfUpdating = true;
      try {
        if (regexApi && regexApi.updateTavernRegexesWith) {
          await regexApi.updateTavernRegexesWith(function (list) {
            return applyBannedRegexToTavernList(list, nextFindRegex);
          }, { type: "preset", name: "in_use" });
        }
        if (api && api.updatePresetWith) {
          await api.updatePresetWith("in_use", function (p) {
            writePresetBannedWords(p, cleanWords);
            return p;
          }, { render: "debounced" });
        }
        await renderFromPreset({ preserveScroll: true, reposition: false });
        if (toastMsg) showToast(toastMsg);
      } catch (err) {
        showToast("禁词表更新失败：" + (err && err.message ? err.message : String(err)));
      } finally {
        setTimeout(function () { isSelfUpdating = false; }, 160);
      }
    }

    function renderBannedWordsSection(preset) {
      const words = readPresetBannedWords(preset);
      const sec = hd.createElement("div");
      sec.className = "yd-sec";
      sec.setAttribute("data-yd-section", "banned-words");

      const headRow = hd.createElement("div");
      headRow.className = "yd-sec-head";

      const headLeft = hd.createElement("div");
      headLeft.className = "yd-sec-head-left";
      const titleEl = hd.createElement("span");
      titleEl.className = "yd-sec-title";
      titleEl.textContent = "禁词清洗";
      const countEl = hd.createElement("span");
      countEl.className = "yd-sec-count";
      countEl.textContent = words.length + "/" + MAX_BANNED_WORDS;
      const helpBtn = hd.createElement("button");
      helpBtn.type = "button";
      helpBtn.className = "yd-help-btn" + (bannedHelpOpen ? " is-active" : "");
      helpBtn.textContent = "?";
      helpBtn.title = "查看禁词清洗说明";
      helpBtn.setAttribute("aria-label", "禁词清洗说明");
      helpBtn.setAttribute("aria-expanded", String(bannedHelpOpen));
      headLeft.appendChild(titleEl);
      headLeft.appendChild(countEl);
      headLeft.appendChild(helpBtn);

      const headRight = hd.createElement("div");
      headRight.className = "yd-sec-head-right";
      const resetBtn = hd.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "yd-mini-link";
      resetBtn.setAttribute("data-yd-action", "reset-banned-words");
      resetBtn.textContent = "恢复默认";
      resetBtn.addEventListener("click", function () {
        mutateBannedWords(DEFAULT_BANNED_WORDS, "已恢复默认禁词表（" + DEFAULT_BANNED_WORDS.length + " 条）");
      });
      headRight.appendChild(resetBtn);

      headRow.appendChild(headLeft);
      headRow.appendChild(headRight);
      sec.appendChild(headRow);

      const helpCard = hd.createElement("div");
      helpCard.className = "yd-help-card";
      helpCard.style.display = bannedHelpOpen ? "flex" : "none";
      [
        { k: "作用", v: "发送给模型前，从 AI 历史回复中剔除这些词；不改聊天存档与界面显示。" },
        { k: "定位", v: "用于切断复读传染的辅助手段，不是根治方法。" },
        { k: "录入建议", v: "优先录入修饰语与填充词；谓语型词条剔除后可能留下残句。" },
        { k: "不生效范围", v: "你的输入、模型当前新生成的文本。" },
      ].forEach(function (item) {
        const line = hd.createElement("div");
        const strong = hd.createElement("strong");
        strong.textContent = item.k + "：";
        line.appendChild(strong);
        line.appendChild(hd.createTextNode(item.v));
        helpCard.appendChild(line);
      });
      sec.appendChild(helpCard);

      helpBtn.addEventListener("click", function () {
        bannedHelpOpen = !bannedHelpOpen;
        helpBtn.classList.toggle("is-active", bannedHelpOpen);
        helpBtn.setAttribute("aria-expanded", String(bannedHelpOpen));
        helpCard.style.display = bannedHelpOpen ? "flex" : "none";
      });

      const form = hd.createElement("div");
      form.className = "yd-banned-form";
      const input = hd.createElement("input");
      input.type = "text";
      input.className = "yd-input";
      input.maxLength = MAX_BANNED_WORD_LEN;
      input.placeholder = "输入要剔除的词条（最多 " + MAX_BANNED_WORD_LEN + " 字）...";
      input.setAttribute("aria-label", "新增历史禁词");
      const addBtn = hd.createElement("button");
      addBtn.type = "button";
      addBtn.className = "yd-btn-sm";
      addBtn.setAttribute("data-yd-action", "add-banned-word");
      addBtn.textContent = "添加";

      function submitNewWord() {
        const res = addBannedWord(words, input.value);
        if (!res.added) {
          const msgMap = {
            empty: "请输入要剔除的词条",
            too_long: "单个词条最多 " + MAX_BANNED_WORD_LEN + " 字",
            duplicate: "该词条已存在",
            limit: "禁词表最多支持 " + MAX_BANNED_WORDS + " 条",
          };
          showToast(msgMap[res.reason] || "无法添加词条");
          return;
        }
        input.value = "";
        mutateBannedWords(res.words, "已添加禁词并更新清洗正则");
      }

      addBtn.addEventListener("click", submitNewWord);
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          submitNewWord();
        }
      });
      form.appendChild(input);
      form.appendChild(addBtn);
      sec.appendChild(form);

      const tagsWrap = hd.createElement("div");
      tagsWrap.className = "yd-banned-tags";
      if (words.length === 0) {
        const empty = hd.createElement("div");
        empty.className = "yd-muted";
        empty.textContent = "当前未配置禁词，历史清洗正则处于空匹配状态。";
        tagsWrap.appendChild(empty);
      } else {
        words.forEach(function (w) {
          const tag = hd.createElement("span");
          tag.className = "yd-banned-tag";
          tag.setAttribute("data-yd-banned-word", w);
          const txt = hd.createElement("span");
          txt.className = "yd-banned-tag-text";
          txt.textContent = w;
          txt.title = w;
          const del = hd.createElement("button");
          del.type = "button";
          del.className = "yd-tag-del";
          del.textContent = "×";
          del.title = "删除 " + w;
          del.setAttribute("aria-label", "删除 " + w);
          del.addEventListener("click", function () {
            mutateBannedWords(removeBannedWord(words, w), "已移除禁词：" + w);
          });
          tag.appendChild(txt);
          tag.appendChild(del);
          tagsWrap.appendChild(tag);
        });
      }
      sec.appendChild(tagsWrap);
      body.appendChild(sec);
    }

    function renderAssistantTab(activePersona, theme, mergedThemes, baseVerLabel) {
      renderSection("主题配色", function (wrap) {
        const isPresetColor = COLOR_SWATCHES.some(function (sw) { return sw.hex === theme.accent; });
        function saveAndApplyColor(chosenHex) {
          const nextThemes = Object.assign({}, mergedThemes);
          nextThemes[activePersona.key] = chosenHex;
          saveLocalThemes(nextThemes);
          mutatePreset(function (p) {
            writePresetThemeBinding(p, activePersona.key, chosenHex);
          });
        }

        COLOR_SWATCHES.forEach(function (sw) {
          const dotBtn = hd.createElement("button");
          dotBtn.type = "button";
          dotBtn.className = "yd-swatch" + (theme.accent === sw.hex ? " is-active" : "");
          dotBtn.style.background = sw.hex;
          dotBtn.title = sw.name;
          dotBtn.setAttribute("data-yd-swatch", sw.hex);
          dotBtn.addEventListener("click", function () {
            saveAndApplyColor(sw.hex);
          });
          wrap.appendChild(dotBtn);
        });

        const customWrap = hd.createElement("label");
        customWrap.className = "yd-color-wrap" + (!isPresetColor ? " is-active" : "");
        customWrap.title = "自定义颜色";
        const colorInput = hd.createElement("input");
        colorInput.type = "color";
        colorInput.className = "yd-color-input";
        colorInput.value = theme.accent;
        colorInput.addEventListener("change", function () {
          const chosen = normalizeHex(colorInput.value);
          if (chosen) saveAndApplyColor(chosen);
        });
        customWrap.appendChild(colorInput);
        wrap.appendChild(customWrap);
      }, "yd-swatches");

      renderSection("悬浮球位置", function (wrap) {
        const row = hd.createElement("div");
        row.className = "yd-card-row";
        const coord = hd.createElement("span");
        coord.className = "yd-muted";
        coord.textContent = "相对位置：X " + Math.round(state.xRatio * 100) + "% · Y " + Math.round(state.yRatio * 100) + "%";
        const resetBtn = hd.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "yd-chip";
        resetBtn.setAttribute("data-yd-action", "reset-pill-pos");
        resetBtn.textContent = "重置默认位置";
        resetBtn.addEventListener("click", function () {
          state.xRatio = 0.92;
          state.yRatio = 0.24;
          savePanelState(state);
          applyRelativePosition();
          renderFromPreset({ preserveScroll: true, reposition: false });
          showToast("已恢复默认悬浮球位置");
        });
        row.appendChild(coord);
        row.appendChild(resetBtn);
        wrap.appendChild(row);
      }, "yd-sec");

      renderSection("版本与更新", function (wrap) {
        const row = hd.createElement("div");
        row.className = "yd-card-row";
        const statusEl = hd.createElement("div");
        statusEl.className = "yd-muted";
        let statusText = "当前版本：" + baseVerLabel;
        if (updateCheckResult && updateCheckResult.hasUpdate && updateCheckResult.remoteVersion) {
          statusText += " · 发现新版本 " + formatVerTag(updateCheckResult.remoteVersion);
        } else if (updateCheckResult && updateCheckResult.checked) {
          statusText += " · 已是最新";
        } else if (updateCheckResult && !updateCheckResult.checked) {
          statusText += " · 暂未连接更新源";
        }
        statusEl.textContent = statusText;

        const link = hd.createElement("a");
        link.className = "yd-link-btn";
        link.href = GITHUB_CHANGELOG_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "查看更新日志";

        row.appendChild(statusEl);
        row.appendChild(link);
        wrap.appendChild(row);
      }, "yd-sec");
    }

    async function renderFromPreset(opts) {
      const options = opts || {};
      const preserveScroll = options.preserveScroll !== false;
      const shouldReposition = options.reposition !== false;
      syncHostColors();
      const api = resolvePresetApi();
      if (!api) return;
      let preset;
      try {
        preset = api.getPreset("in_use");
      } catch (e) {
        return;
      }
      const prompts = (preset && preset.prompts) || [];
      const loadedName = api.getLoadedPresetName ? api.getLoadedPresetName() : "";
      const baseVerLabel = resolveVersionLabel(preset);
      if (!updateCheckResult || !updateCheckResult.hasUpdate) {
        verBadge.textContent = baseVerLabel;
      }
      headTitle.title = loadedName ? ("当前酒馆预设：" + loadedName) : "ST-PresetAssistant";

      const personas = discoverPersonas(prompts);
      const activePersona = resolveActivePersona(prompts, personas);
      const mergedThemes = Object.assign({}, loadLocalThemes(), readPresetThemes(preset));
      const theme = getPersonaTheme(activePersona, mergedThemes);
      applyThemeColors(theme);
      const pillPersonaDesc = activePersona.label ? ("ST-预设助手 · " + activePersona.label) : "ST-预设助手";
      pill.title = pillPersonaDesc + (updateCheckResult && updateCheckResult.hasUpdate ? " · 发现新版本" : "") + "（点击展开，按住拖动）";
      pill.setAttribute("aria-label", pillPersonaDesc);

      syncTabButtons();
      const prevScrollTop = preserveScroll ? body.scrollTop : 0;
      body.classList.toggle("is-entering", !preserveScroll);
      body.innerHTML = "";

      if (state.activeTab === "regex") {
        renderRegexTab(preset);
      } else if (state.activeTab === "assistant") {
        renderAssistantTab(activePersona, theme, mergedThemes, baseVerLabel);
      } else {
        renderPresetTab(prompts);
      }

      if (preserveScroll) {
        body.scrollTop = prevScrollTop;
      } else {
        body.scrollTop = 0;
      }
      if (shouldReposition) {
        applyRelativePosition();
      }
    }

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    pill.addEventListener("pointerdown", function (ev) {
      isDragging = true;
      dragStartX = ev.clientX;
      dragStartY = ev.clientY;
      const rect = rootEl.getBoundingClientRect();
      startLeft = parseFloat(rootEl.style.left) || rect.left || 0;
      startTop = parseFloat(rootEl.style.top) || rect.top || 0;
      moved = false;
      try { pill.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    pill.addEventListener("pointermove", function (ev) {
      if (!isDragging) return;
      const dx = ev.clientX - dragStartX;
      const dy = ev.clientY - dragStartY;
      const dragThreshold = ev.pointerType === "touch" ? 8 : 5;
      if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
        moved = true;
        pill.classList.add("is-dragging");
      }
      if (moved) {
        const vp = getViewportSize();
        const vw = vp.vw;
        const vh = vp.vh;
        const pm = getPillMetrics();
        const margin = 8;
        const nextLeft = Math.round(clampNumber(startLeft + dx, margin, Math.max(margin, vw - pm.w - margin)));
        const nextTop = Math.round(clampNumber(startTop + dy, margin, Math.max(margin, vh - pm.h - margin)));
        rootEl.style.left = nextLeft + "px";
        rootEl.style.top = nextTop + "px";
        const ratios = posToRatio(nextLeft, nextTop, vw, vh, pm.w, pm.h);
        state.xRatio = ratios.xRatio;
        state.yRatio = ratios.yRatio;
      }
    });

    function endDrag(ev) {
      if (!isDragging) return;
      isDragging = false;
      pill.classList.remove("is-dragging");
      if (moved) {
        savePanelState(state);
      } else {
        state.open = true;
        rootEl.classList.add("is-open");
        savePanelState(state);
        renderFromPreset({ preserveScroll: false, reposition: true });
      }
      try { pill.releasePointerCapture(ev.pointerId); } catch (e) {}
    }

    pill.addEventListener("pointerup", endDrag);
    pill.addEventListener("pointercancel", function () {
      isDragging = false;
      pill.classList.remove("is-dragging");
    });

    closeBtn.addEventListener("click", function () {
      state.open = false;
      rootEl.classList.remove("is-open");
      savePanelState(state);
      applyRelativePosition();
    });

    saveBtn.addEventListener("click", async function () {
      const api = resolvePresetApi();
      if (!api || !api.replacePreset || !api.getLoadedPresetName) {
        showToast("当前环境不支持保存预设");
        return;
      }
      const name = api.getLoadedPresetName();
      if (!name) {
        showToast("未获取到当前预设名");
        return;
      }
      try {
        const cur = api.getPreset("in_use");
        await api.replacePreset(name, cur);
        showToast("已保存至预设：" + name);
      } catch (err) {
        showToast("保存失败：" + (err && err.message ? err.message : String(err)));
      }
    });

    function handleResize() {
      applyRelativePosition();
    }
    hw.addEventListener("resize", handleResize);
    if (hw.visualViewport) {
      hw.visualViewport.addEventListener("resize", handleResize);
    }

    const themeObs = typeof MutationObserver !== "undefined"
      ? new MutationObserver(syncHostColors)
      : null;
    if (themeObs) {
      themeObs.observe(hd.body, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
      themeObs.observe(hd.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    }

    let cleaned = false;
    function cleanupPanel() {
      if (cleaned) return;
      cleaned = true;
      hw.removeEventListener("resize", handleResize);
      if (hw.visualViewport) {
        hw.visualViewport.removeEventListener("resize", handleResize);
      }
      if (themeObs) themeObs.disconnect();
      const el = hd.getElementById(ROOT_EL_ID);
      if (el) el.remove();
      const st = hd.getElementById(STYLE_EL_ID);
      if (st) st.remove();
    }

    const hwEvents = window.eventOn || (window.TavernHelper && window.TavernHelper.eventOn);
    const tev = window.tavern_events || (hw && hw.tavern_events);
    if (hwEvents && tev && tev.PRESET_CHANGED) {
      hwEvents(tev.PRESET_CHANGED, function () {
        if (!isSelfUpdating) renderFromPreset();
      });
    }

    window.addEventListener("pagehide", cleanupPanel);
    if (typeof window.$ === "function") {
      try { window.$(window).on("pagehide", cleanupPanel); } catch (e) {}
    }

    renderFromPreset();
    runInitialUpdateCheck();
    return { refresh: renderFromPreset, cleanup: cleanupPanel };
  }

  const start = function () {
    mountPanel();
  };

  if (typeof window.$ === "function") {
    window.$(start);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
