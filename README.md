# CS Knowledge Graph

A multilingual, visual, interactive computer science knowledge graph built with Astro, MDX, TypeScript, and React islands.

The site teaches concepts through progressive reinvention: start with a concrete problem, try a naive idea, show where it breaks, then introduce the algorithm or abstraction.

Visual and interactive support should be woven through the learning path. Prefer nearby figures, trace-linked diagrams, compact state tables, and micro-widgets for useful sections and steps instead of relying on one isolated demo.

MDX node pages support KaTeX-rendered formulas. Use `$...$` for inline math, `$$...$$` for display math, and `\$` for literal dollar signs.

## Visual Style

The visual style is **Explorable Lab Notebook**: precise documentation, connected graph thinking, interactive lab panels, and a warm learning-journal tone. The imported prompt package is organized in `docs/visual-style/`, including design tokens, component specs, page specs, i18n notes, QA checklist, and staged Codex prompts.

## Run Locally

```bash
npm install
npm run check
npm run test
npm run build
npm run dev
```

## Deploy On Cloudflare

For Cloudflare Workers & Pages Git deployments, keep this as a static Astro site:

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`, or whichever branch Cloudflare is configured to deploy
- Environment variable: set `PUBLIC_SITE_URL` to the canonical production origin, for example `https://reconceptlab.com`

The repository includes Cloudflare Pages static config in `public/_headers` and `public/_redirects`. Those files are copied into `dist` during the Astro build. `_redirects` sends the bare root `/` to `/en/`, and `_headers` adds crawl-friendly sitemap discovery, security headers, and long-lived caching for hashed Astro assets.

This site does not need the Astro Cloudflare adapter unless it later adds server-side rendering, Pages Functions, or Worker code. With the current static architecture, Cloudflare can deploy the generated `dist` assets directly.

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
5. Add formulas where they clarify invariants, definitions, recurrences, or complexity, and pair important notation with plain-language explanation.
6. Run `npm run validate`, then `npm run check`, `npm run test`, and `npm run build`.

Use stable language-independent IDs in URLs, such as `/en/nodes/bfs` and `/zh/nodes/bfs`.

## Formula Rendering

Formula support is configured in `astro.config.mjs` with `remark-math` and `rehype-katex`; KaTeX styles are loaded globally from `src/components/Layout.astro`. Long display formulas can scroll horizontally on small screens.

## i18n

Supported locales live in `src/i18n/locales.ts`. Shared UI copy lives in `src/i18n/ui.ts`. English is the default locale. Simplified Chinese routes use `/zh/` and render with `html lang="zh-Hans"`.

## Validation

`scripts/validate-content.ts` checks frontmatter path consistency, supported locales, graph edge endpoints, prerequisite IDs, edge types, English page presence, and missing Chinese pages.

## Next Steps

- Expand Dijkstra from placeholder to a full progressive page.
- Add a reusable interactive demo for closest-pair divide and conquer.
- Add a reusable edge-relaxation interactive primitive.
- Add richer graph filtering once the concept library grows.

See [docs/knowledge-node-plan.md](docs/knowledge-node-plan.md) for the current content plan.
