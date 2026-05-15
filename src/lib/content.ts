import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/locales";

export type NodeEntry = CollectionEntry<"nodes">;

export async function getAllNodeEntries(): Promise<NodeEntry[]> {
  return getCollection("nodes");
}

export async function getNodeEntry(id: string, lang: Locale): Promise<NodeEntry | undefined> {
  const entries = await getAllNodeEntries();
  return entries.find((entry) => entry.data.id === id && entry.data.locale === lang);
}

export async function getNodesByLocale(lang: Locale): Promise<NodeEntry[]> {
  const entries = await getAllNodeEntries();
  return entries
    .filter((entry) => entry.data.locale === lang)
    .sort((a, b) => a.data.title.localeCompare(b.data.title, lang));
}

export async function getAvailableNodeLocales(id: string): Promise<Locale[]> {
  const entries = await getAllNodeEntries();
  return entries
    .filter((entry) => entry.data.id === id)
    .map((entry) => entry.data.locale);
}
