# Prompt 04 — Apply visual style to key pages

You are working in the ReConcept Lab repository.

Use:

- `docs/codex/visual-style/design/PAGE_SPECS.md`
- `docs/codex/visual-style/design/VISUAL_STYLE_SPEC.md`
- reusable components created in the previous prompt

Goal: apply the Explorable Lab Notebook visual language to the key website pages.

Style these pages if they exist; create minimal versions only if missing:

1. Home page
2. Knowledge graph page
3. Roadmaps page
4. Concept detail page for BFS or the sample node
5. Design system/demo page if present

Home page requirements:

- navbar
- hero with graph-paper background
- headline:
  - EN: Re-invent computer science visually.
  - ZH: 用可视化和交互，重新发明计算机科学概念。
- CTA buttons:
  - Start Exploring
  - Explore the Graph
- small visual motif with lab flask / graph nodes / mini code card / mini concept graph
- "How it works" section:
  - Intuition first
  - Experiment
  - Re-invent the idea
  - Connect and apply

Graph page requirements:

- title and subtitle
- filter panel
- graph canvas or placeholder visualization
- edge legend
- selected concept preview card
- fit/reset controls if easy

Roadmaps page requirements:

- route cards for:
  - CS Foundations
  - Data Structures & Algorithms
  - Systems Basics
  - Theory Foundations
- progress placeholder
- topic badges

Concept page requirements:

- breadcrumb
- title and badges
- language toggle
- progress indicator
- sidebar on desktop
- sectioned article layout
- callouts
- lab panel
- connections section

Bilingual requirements:

- `/en` and `/zh` should both look good.
- Chinese text should not overflow.
- UI strings should come from existing i18n utilities or a small dictionary.

Constraints:

- Do not overbuild the graph engine.
- Do not introduce heavy new visualization dependencies unless already used.
- It is okay to use a polished static graph placeholder for now if the graph engine is not ready.

Run:

```bash
npm run check
npm run test
npm run build
```

Report changed files, screenshots instructions if available, and any limitations.
