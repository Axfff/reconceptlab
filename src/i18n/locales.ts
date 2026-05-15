export const defaultLocale = "en" as const;

export const locales = {
  en: {
    label: "English",
    htmlLang: "en"
  },
  zh: {
    label: "中文",
    htmlLang: "zh-Hans"
  }
} as const;

export type Locale = keyof typeof locales;

export const localeCodes = Object.keys(locales) as Locale[];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && value in locales);
}
