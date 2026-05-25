import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config.js';

export function resolveLocale(req) {
  const queryLang = req.query.lang?.split('-')[0];
  if (queryLang && SUPPORTED_LOCALES.includes(queryLang)) {
    return queryLang;
  }

  const headerLang = req.headers['accept-language']
    ?.split(',')[0]
    ?.split('-')[0];

  if (headerLang && SUPPORTED_LOCALES.includes(headerLang)) {
    return headerLang;
  }

  return DEFAULT_LOCALE;
}

export function pickLocalized(value, locale) {
  if (value && typeof value === 'object' && locale in value) {
    return value[locale];
  }

  if (value && typeof value === 'object' && DEFAULT_LOCALE in value) {
    return value[DEFAULT_LOCALE];
  }

  return value;
}
