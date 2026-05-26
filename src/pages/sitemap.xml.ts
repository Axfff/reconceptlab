import type { APIRoute } from "astro";
import { localeCodes, locales, type Locale } from "../i18n/locales";
import { getAllNodeEntries } from "../lib/content";
import { graphPath, homePath, nodePath, roadmapPath } from "../lib/routes";
import { absoluteUrl, getSiteBase } from "../lib/seo";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

type SitemapUrl = {
  path: string;
  lastmod: string;
  alternates: Array<{ lang: Locale | "x-default"; path: string }>;
};

function renderUrl(entry: SitemapUrl, siteBase: URL): string {
  const loc = absoluteUrl(entry.path, siteBase);
  const alternates = entry.alternates
    .map((alternate) => {
      const hreflang = alternate.lang === "x-default" ? "x-default" : locales[alternate.lang].htmlLang;
      return `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(absoluteUrl(alternate.path, siteBase))}" />`;
    })
    .join("\n");

  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    alternates,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    "  </url>"
  ]
    .filter(Boolean)
    .join("\n");
}

export const GET: APIRoute = async ({ site }) => {
  const siteBase = getSiteBase(site);
  const nodeEntries = (await getAllNodeEntries()).filter((entry) => entry.data.status !== "archived");
  const newestNodeDate = nodeEntries.reduce<Date>(
    (newest, entry) => (entry.data.updatedAt > newest ? entry.data.updatedAt : newest),
    new Date("2026-05-15")
  );
  const siteLastmod = dateOnly(newestNodeDate);

  const localizedAlternates = (pathFor: (lang: Locale) => string) => [
    ...localeCodes.map((lang) => ({ lang, path: pathFor(lang) })),
    { lang: "x-default" as const, path: pathFor("en") }
  ];

  const urls: SitemapUrl[] = localeCodes.flatMap((lang) => [
    {
      path: homePath(lang),
      lastmod: siteLastmod,
      alternates: localizedAlternates(homePath)
    },
    {
      path: graphPath(lang),
      lastmod: siteLastmod,
      alternates: localizedAlternates(graphPath)
    },
    {
      path: roadmapPath(lang),
      lastmod: siteLastmod,
      alternates: localizedAlternates(roadmapPath)
    }
  ]);

  for (const entry of nodeEntries) {
    const availableLocales = nodeEntries
      .filter((candidate) => candidate.data.id === entry.data.id)
      .map((candidate) => candidate.data.locale);

    urls.push({
      path: nodePath(entry.data.locale, entry.data.id),
      lastmod: dateOnly(entry.data.updatedAt),
      alternates: [
        ...availableLocales.map((lang) => ({ lang, path: nodePath(lang, entry.data.id) })),
        ...(availableLocales.includes("en") ? [{ lang: "x-default" as const, path: nodePath("en", entry.data.id) }] : [])
      ]
    });
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls.map((entry) => renderUrl(entry, siteBase)),
    "</urlset>"
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};
