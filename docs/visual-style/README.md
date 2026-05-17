# ReConcept Lab Visual Style Codex Prompt Package

This package is meant to be dropped into the ReConcept Lab repository and used with Codex to implement the unified website visual style.

## Intended stack

The prompts assume the current skeleton is based on:

- Astro
- TypeScript
- MDX
- React components for interactive labs
- English and Simplified Chinese routes, starting with `/en` and `/zh`

If the existing repo uses a slightly different structure, Codex should adapt while preserving the design system and file organization principles.

## How to use

1. Copy this entire package into your repository, for example under:

```text
docs/codex/visual-style/
```

2. Copy or merge `AGENTS.visual-style.md` into the root `AGENTS.md`.

3. Give Codex the prompts in this order:

```text
prompts/01-audit-current-ui.md
prompts/02-implement-design-tokens.md
prompts/03-build-ui-components.md
prompts/04-style-key-pages.md
prompts/05-polish-interactive-labs.md
prompts/06-visual-qa-and-cleanup.md
```

4. After each prompt, review the diff and run:

```bash
npm run check
npm run test
npm run build
```

If the repo does not have all three commands yet, Codex should create or document the closest equivalents.

## Design goal

ReConcept Lab should feel like an **Explorable Lab Notebook**:

> clean like documentation, visual like a knowledge graph, interactive like a simulator, and warm like a learning journal.

The style should be calm, precise, bilingual, accessible, and reusable across many future CS concept pages.
