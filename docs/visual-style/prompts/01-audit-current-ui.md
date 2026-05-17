# Prompt 01 — Audit the current UI and plan the visual-style implementation

You are working in the ReConcept Lab repository.

First, read:

- `AGENTS.md`
- `docs/codex/visual-style/AGENTS.visual-style.md` if present
- `docs/codex/visual-style/design/VISUAL_STYLE_SPEC.md` if present
- current Astro/React/MDX project files

Goal: audit the current skeleton before changing it.

Tasks:

1. Identify the current framework, routes, styling method, component locations, content locations, and test/build commands.
2. Find existing pages for:
   - home
   - graph
   - roadmaps/topics
   - concept page
   - BFS or any sample node
3. Find existing shared components and global styles.
4. Determine whether Tailwind is installed. If yes, decide whether to use Tailwind utilities plus CSS variables. If not, use plain CSS modules/global CSS without adding Tailwind unless the repo already expects it.
5. Produce a short implementation plan in the Codex response:
   - files to create
   - files to modify
   - order of implementation
   - any risks
6. Do not make large visual changes in this prompt unless the existing structure is trivial and the changes are safe.

Constraints:

- Do not add backend/auth/payment.
- Do not rewrite content architecture unless necessary.
- Keep bilingual `/en` and `/zh` routes working.
- Keep the changes small and reviewable.

After the audit, stop and report the plan.
