# CS Knowledge Graph

A multilingual, visual, interactive computer science knowledge graph built with Astro, MDX, TypeScript, and React islands.

The site teaches concepts through progressive reinvention: start with a concrete problem, try a naive idea, show where it breaks, then introduce the algorithm or abstraction.

## Run Locally

```bash
npm install
npm run check
npm run test
npm run build
npm run dev
```

## Folder Structure

```text
src/content/nodes/<concept-id>/<locale>.mdx  Concept pages
src/data/graph.ts                           Language-independent graph topology
src/i18n                                    Locale and UI strings
src/components                              Astro layout and React visual widgets
src/pages/[lang]                            Locale-prefixed routes
scripts/validate-content.ts                 Content and graph validation
tests                                       Vitest coverage for validation
```

## Add A Concept Node

1. Add `src/content/nodes/<concept-id>/en.mdx`.
2. Add `src/content/nodes/<concept-id>/zh.mdx` or document that the translation is missing.
3. Add the concept to `src/data/graph.ts`.
4. Add localized edge reasons for every new connection.
5. Run `npm run validate`, then `npm run check`, `npm run test`, and `npm run build`.

Use stable language-independent IDs in URLs, such as `/en/nodes/bfs` and `/zh/nodes/bfs`.

## i18n

Supported locales live in `src/i18n/locales.ts`. Shared UI copy lives in `src/i18n/ui.ts`. English is the default locale. Simplified Chinese routes use `/zh/` and render with `html lang="zh-Hans"`.

## Validation

`scripts/validate-content.ts` checks frontmatter path consistency, supported locales, graph edge endpoints, prerequisite IDs, edge types, English page presence, and missing Chinese pages.

## Next Steps

- Expand Dijkstra from placeholder to a full progressive page.
- Add a reusable edge-relaxation interactive primitive.
- Add richer graph filtering once the concept library grows.
