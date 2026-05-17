import { defaultLocale, type Locale } from "../i18n/locales";

export function homePath(lang: Locale = defaultLocale): string {
  return `/${lang}/`;
}

export function graphPath(lang: Locale): string {
  return `/${lang}/graph`;
}

export function roadmapPath(lang: Locale): string {
  return `/${lang}/roadmaps`;
}

export function nodePath(lang: Locale, id: string): string {
  return `/${lang}/nodes/${id}`;
}

export function localizedPath(pathname: string, nextLang: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return homePath(nextLang);
  parts[0] = nextLang;
  return `/${parts.join("/")}${pathname.endsWith("/") ? "/" : ""}`;
}
