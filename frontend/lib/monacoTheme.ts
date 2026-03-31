export const MONACO_THEME_STORAGE_KEY = "moonknight.monaco-theme";
export const MONACO_THEME_CHANGE_EVENT = "moonknight:monaco-theme-change";

import draculaTheme from "@/lib/monacoThemes/dracula.json";
import githubDarkTheme from "@/lib/monacoThemes/github-dark.json";
import monokaiTheme from "@/lib/monacoThemes/monokai.json";
import nordTheme from "@/lib/monacoThemes/nord.json";
import tomorrowNightTheme from "@/lib/monacoThemes/tomorrow-night.json";

export const MONACO_THEME_OPTIONS = [
  "v0-dark",
  "github-dark",
  "monokai",
  "dracula",
  "nord",
  "tomorrow-night",
] as const;

export type MonacoThemeName = (typeof MONACO_THEME_OPTIONS)[number];

export const DEFAULT_MONACO_THEME: MonacoThemeName = "v0-dark";

export const MONACO_THEME_LABELS: Record<MonacoThemeName, string> = {
  "v0-dark": "v0 Dark",
  "github-dark": "GitHub Dark",
  monokai: "Monokai",
  dracula: "Dracula",
  nord: "Nord",
  "tomorrow-night": "Tomorrow Night",
};

const LEGACY_THEME_NAME_MAP: Record<string, MonacoThemeName> = {
  "GitHub Dark": "github-dark",
  Monokai: "monokai",
  Dracula: "dracula",
  Nord: "nord",
  "Tomorrow-Night": "tomorrow-night",
};

const THEME_DATA_BY_NAME: Record<Exclude<MonacoThemeName, "v0-dark">, any> = {
  "github-dark": githubDarkTheme,
  monokai: monokaiTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  "tomorrow-night": tomorrowNightTheme,
};

export function isMonacoThemeName(value: string): value is MonacoThemeName {
  return (MONACO_THEME_OPTIONS as readonly string[]).includes(value);
}

export function getStoredMonacoTheme(): MonacoThemeName {
  if (typeof window === "undefined") {
    return DEFAULT_MONACO_THEME;
  }

  const stored = window.localStorage.getItem(MONACO_THEME_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_MONACO_THEME;
  }

  if (isMonacoThemeName(stored)) {
    return stored;
  }

  const migrated = LEGACY_THEME_NAME_MAP[stored];
  if (migrated) {
    window.localStorage.setItem(MONACO_THEME_STORAGE_KEY, migrated);
    return migrated;
  }

  return DEFAULT_MONACO_THEME;
}

export function setStoredMonacoTheme(theme: MonacoThemeName): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MONACO_THEME_STORAGE_KEY, theme);
}

export async function loadMonacoThemeData(
  theme: Exclude<MonacoThemeName, "v0-dark">,
): Promise<any> {
  return THEME_DATA_BY_NAME[theme];
}