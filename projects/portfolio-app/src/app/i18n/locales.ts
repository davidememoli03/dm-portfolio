export interface SupportedLocale {
  code: string;
  label: string;
}

export const LANGUAGE_STORAGE_KEY = 'dm-portfolio.lang';

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
];

export function getStoredLanguage(): string {
  if (typeof window === 'undefined') {
    return 'it';
  }

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.some((locale) => locale.code === stored)) {
    return stored;
  }

  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.some((locale) => locale.code === browserLang)) {
    return browserLang;
  }

  return 'it';
}

export function storeLanguage(language: string): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
