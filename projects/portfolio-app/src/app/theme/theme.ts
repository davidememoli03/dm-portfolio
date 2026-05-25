export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dm-portfolio.theme';
export const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

const VALID_THEMES = new Set<ThemePreference>(THEME_OPTIONS);

export function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
  if (stored && VALID_THEMES.has(stored)) {
    return stored;
  }

  return 'system';
}

export function storeTheme(theme: ThemePreference): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(theme: ThemePreference): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (theme === 'system') {
    delete root.dataset['theme'];
  } else {
    root.dataset['theme'] = theme;
  }
}

export function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme !== 'system') {
    return theme;
  }
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
