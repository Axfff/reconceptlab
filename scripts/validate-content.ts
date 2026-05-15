import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
import { edgeTypes, graphEdges, graphNodes } from "../src/data/graph";
import { localeCodes, type Locale } from "../src/i18n/locales";

export type ContentRecord = {
  conceptIdFromPath: string;
  localeFromPath: string;
  filePath: string;
  data: {
    id?: string;
    locale?: string;
    prerequisites?: string[];
  };
};

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

export function readContentRecords(contentRoot: string): ContentRecord[] {
  if (!fs.existsSync(contentRoot)) return [];

  return fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((conceptDir) => {
      const conceptPath = path.join(contentRoot, conceptDir.name);
      return fs
        .readdirSync(conceptPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map((file) => {
          const filePath = path.join(conceptPath, file.name);
          const parsed = matter(fs.readFileSync(filePath, "utf8"));
          return {
            conceptIdFromPath: conceptDir.name,
            localeFromPath: file.name.replace(/\.mdx$/, ""),
            filePath,
            data: parsed.data
          };
        });
    });
}

export function validateKnowledgeGraph(records: ContentRecord[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const localeSet = new Set<string>(localeCodes);
  const graphNodeIds = new Set(graphNodes.map((node) => node.id));
  const edgeTypeSet = new Set<string>(edgeTypes);
  const seenContentKeys = new Set<string>();
  const contentByConcept = new Map<string, Set<string>>();

  for (const record of records) {
    const id = record.data.id;
    const locale = record.data.locale;
    const key = `${id}:${locale}`;

    if (!id) errors.push(`${record.filePath}: missing frontmatter id`);
    if (!locale) errors.push(`${record.filePath}: missing frontmatter locale`);
    if (id && id !== record.conceptIdFromPath) {
      errors.push(`${record.filePath}: id "${id}" does not match directory "${record.conceptIdFromPath}"`);
    }
    if (locale && locale !== record.localeFromPath) {
      errors.push(`${record.filePath}: locale "${locale}" does not match file name "${record.localeFromPath}"`);
    }
    if (locale && !localeSet.has(locale)) {
      errors.push(`${record.filePath}: unsupported locale "${locale}"`);
    }
    if (id && locale) {
      if (seenContentKeys.has(key)) errors.push(`${record.filePath}: duplicate content page for ${key}`);
      seenContentKeys.add(key);
      const localesForConcept = contentByConcept.get(id) ?? new Set<string>();
      localesForConcept.add(locale);
      contentByConcept.set(id, localesForConcept);
    }

    for (const prerequisite of record.data.prerequisites ?? []) {
      if (!graphNodeIds.has(prerequisite)) {
        errors.push(`${record.filePath}: prerequisite "${prerequisite}" is not a graph node`);
      }
    }
  }

  for (const node of graphNodes) {
    const conceptLocales = contentByConcept.get(node.id);
    if (!conceptLocales?.has("en")) {
      errors.push(`graph node "${node.id}" is missing English content`);
    }
    if (!conceptLocales?.has("zh")) {
      warnings.push(`graph node "${node.id}" is missing Chinese content`);
    }
  }

  for (const edge of graphEdges) {
    if (!graphNodeIds.has(edge.from)) errors.push(`edge from "${edge.from}" points to a missing graph node`);
    if (!graphNodeIds.has(edge.to)) errors.push(`edge to "${edge.to}" points to a missing graph node`);
    if (!edgeTypeSet.has(edge.type)) errors.push(`edge ${edge.from} -> ${edge.to} has invalid type "${edge.type}"`);
    for (const locale of localeCodes) {
      if (!edge.reason[locale as Locale]) {
        errors.push(`edge ${edge.from} -> ${edge.to} is missing ${locale} reason`);
      }
    }
  }

  const duplicateGraphIds = graphNodes
    .map((node) => node.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  for (const duplicateId of new Set(duplicateGraphIds)) {
    errors.push(`duplicate graph node id "${duplicateId}"`);
  }

  return { errors, warnings };
}

export function validateContentRoot(contentRoot: string): ValidationResult {
  return validateKnowledgeGraph(readContentRecords(contentRoot));
}

function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..");
  const contentRoot = path.join(repoRoot, "src/content/nodes");
  const result = validateContentRoot(contentRoot);

  for (const warning of result.warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`Error: ${error}`);
    }
    process.exit(1);
  }

  console.log("Content validation passed.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
