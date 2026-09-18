import { i18n } from '@lingui/core';

const STORAGE_KEY = 'crag-atlas:locale';

export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const readStoredLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return locales.includes(stored as Locale) ? (stored as Locale) : 'en';
  } catch {
    return 'en';
  }
};

export const activateLocale = async (locale: Locale) => {
  const { messages } = await import(`./locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
};

export { i18n };
