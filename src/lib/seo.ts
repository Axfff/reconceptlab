import { locales, type Locale } from "../i18n/locales";
import { t } from "../i18n/ui";

export const defaultSiteUrl = "https://reconceptlab.com";
export const siteImagePath = "/assets/reconceptlab-logo.png";

export function getSiteBase(site?: URL): URL {
  return site ?? new URL(defaultSiteUrl);
}

export function absoluteUrl(path: string, base: URL): string {
  return new URL(path, base).toString();
}

export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationJsonLd(base: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ReConcept Lab",
    url: absoluteUrl("/", base),
    logo: absoluteUrl(siteImagePath, base)
  };
}

export function websiteJsonLd(lang: Locale, base: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t(lang, "siteTitle"),
    description: t(lang, "siteDescription"),
    inLanguage: locales[lang].htmlLang,
    url: absoluteUrl(`/${lang}/`, base),
    publisher: {
      "@type": "Organization",
      name: "ReConcept Lab"
    }
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
