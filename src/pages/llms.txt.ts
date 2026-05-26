import type { APIRoute } from "astro";
import { localeCodes, type Locale } from "../i18n/locales";
import { t } from "../i18n/ui";
import { getNodesByLocale } from "../lib/content";
import { graphPath, homePath, nodePath, roadmapPath } from "../lib/routes";
import { absoluteUrl, getSiteBase } from "../lib/seo";

export const prerender = true;

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function bullet(title: string, url: string, description: string): string {
  return `- [${title}](${url}): ${compact(description)}`;
}

const localeName: Record<Locale, string> = {
  en: "English",
  zh: "Simplified Chinese"
};

export const GET: APIRoute = async ({ site }) => {
  const siteBase = getSiteBase(site);
  const lines = [
    "# ReConcept Lab",
    "",
    "> A bilingual, visual, interactive computer science knowledge graph for learning concepts by rebuilding them from concrete problems, naive attempts, failures, state traces, invariants, code, and graph relationships.",
    "",
    "## Entry points",
    bullet("English home", absoluteUrl(homePath("en"), siteBase), t("en", "siteDescription")),
    bullet("中文首页", absoluteUrl(homePath("zh"), siteBase), t("zh", "siteDescription")),
    bullet("Knowledge graph", absoluteUrl(graphPath("en"), siteBase), "Browsable map of concept prerequisites, contrasts, motivations, and uses."),
    bullet("Roadmaps", absoluteUrl(roadmapPath("en"), siteBase), "Curated learning paths through the concept graph."),
    bullet("XML sitemap", absoluteUrl("/sitemap.xml", siteBase), "Canonical discovery file for all indexable localized routes."),
    "",
    "## Reading model",
    "- Concept pages are locale-prefixed: `/en/nodes/:id` and `/zh/nodes/:id`.",
    "- Concept IDs are stable across languages, so English and Chinese pages for the same concept share the same `:id`.",
    "- Pages are designed as explorable lab notes: problem, naive idea, failure, invention, visual trace, formal model, implementation, invariant, complexity, confusions, and exercises.",
    ""
  ];

  for (const lang of localeCodes) {
    const entries = (await getNodesByLocale(lang)).filter((entry) => entry.data.status !== "archived");
    lines.push(`## ${localeName[lang]} concept pages`);
    for (const entry of entries) {
      const status = entry.data.status === "draft" ? " Draft." : "";
      lines.push(bullet(entry.data.title, absoluteUrl(nodePath(lang, entry.data.id), siteBase), `${entry.data.summary}${status}`));
    }
    lines.push("");
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
