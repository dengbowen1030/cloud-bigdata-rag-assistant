export const SETTINGS_STORAGE_KEY = "edurag-pro-system-settings-v1";

export const themeOptions = [
  {
    key: "aurora",
    emoji: "🪐",
    name: "智感星云",
    english: "Aurora Intelligence",
    description: "极光紫、霓虹粉与绯红渐变，适合 AI RAG 日常使用。",
    accent: "#7C3AED",
    gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #EC4899 100%)",
    previewBg:
      "radial-gradient(circle at 18% 18%, rgba(236,72,153,.26), transparent 26%), radial-gradient(circle at 84% 10%, rgba(124,58,237,.28), transparent 28%), linear-gradient(135deg, #fffaff, #f7f4ff)",
    previewPanel: "rgba(255,255,255,.72)",
    previewSidebar: "rgba(255,255,255,.58)",
    text: "#1D1D1F",
  },
  {
    key: "cupertino",
    emoji: "🍏",
    name: "库比蒂诺白",
    english: "Cupertino Classic",
    description: "原生 macOS 浅色风格，极简、理性、长时间工作不疲劳。",
    accent: "#007AFF",
    gradient: "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
    previewBg: "linear-gradient(135deg, #FFFFFF, #F5F5F7)",
    previewPanel: "rgba(255,255,255,.86)",
    previewSidebar: "rgba(245,245,247,.82)",
    text: "#1D1D1F",
  },
  {
    key: "space",
    emoji: "🌑",
    name: "深空钛金",
    english: "Pro Space Gray",
    description: "深夜沉浸式暗色丙烯酸材质，适合日志审计和接口联调。",
    accent: "#8AD8FF",
    gradient: "linear-gradient(135deg, #8E8E93 0%, #D1D5DB 42%, #8AD8FF 100%)",
    previewBg: "linear-gradient(135deg, #1C1C1E, #121212)",
    previewPanel: "rgba(255,255,255,.10)",
    previewSidebar: "rgba(255,255,255,.075)",
    text: "#F5F5F7",
  },
  {
    key: "starlight",
    emoji: "🪙",
    name: "星光流沙",
    english: "Starlight Luxury",
    description: "香槟金与暖白毛玻璃，适合成果汇报和数据概览展示。",
    accent: "#B8A38F",
    gradient: "linear-gradient(135deg, #E5D5C5 0%, #D3BFA8 45%, #B8A38F 100%)",
    previewBg: "radial-gradient(circle at 80% 20%, rgba(229,213,197,.40), transparent 30%), linear-gradient(135deg, #FFFDF8, #FAF6F0)",
    previewPanel: "rgba(255,255,255,.70)",
    previewSidebar: "rgba(250,246,240,.72)",
    text: "#2F2923",
  },
  {
    key: "sage",
    emoji: "🌲",
    name: "苍岭鼠尾草",
    english: "Alpine Sage",
    description: "莫兰迪绿色系，成熟稳重，适合知识库管理与切片整理。",
    accent: "#115E59",
    gradient: "linear-gradient(135deg, #115E59 0%, #0F766E 45%, #2DD4BF 100%)",
    previewBg: "radial-gradient(circle at 16% 20%, rgba(45,212,191,.18), transparent 28%), linear-gradient(135deg, #FFFFFF, #F4F7F6)",
    previewPanel: "rgba(255,255,255,.72)",
    previewSidebar: "rgba(244,247,246,.76)",
    text: "#102A27",
  },
];

export const defaultSystemSettings = {
  theme: "aurora",
  appearance: "auto",
  glassBlur: 25,
  reduceMotion: false,
  compactMode: false,
  showShortcutHint: true,
  roundedLevel: "large",
};

export function loadSystemSettings() {
  if (typeof window === "undefined") return defaultSystemSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSystemSettings;
    return { ...defaultSystemSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSystemSettings;
  }
}

export function saveSystemSettings(settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function applySystemSettings(settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = settings.theme || defaultSystemSettings.theme;
  root.dataset.appearance = settings.appearance || defaultSystemSettings.appearance;
  root.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
  root.dataset.compact = settings.compactMode ? "true" : "false";
  root.dataset.shortcutHint = settings.showShortcutHint ? "true" : "false";
  root.dataset.rounded = settings.roundedLevel || defaultSystemSettings.roundedLevel;
  root.style.setProperty("--settings-blur", `${settings.glassBlur ?? defaultSystemSettings.glassBlur}px`);
}
