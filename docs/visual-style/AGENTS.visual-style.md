# ReConcept Lab Visual Style Instructions

Use these instructions when implementing or editing the ReConcept Lab frontend.

## Brand

- Product name: ReConcept Lab
- English tagline: Re-invent computer science visually.
- Chinese tagline: 用可视化和交互，重新发明计算机科学概念。
- Visual style name: Explorable Lab Notebook
- Core metaphor: scientific lab + connected knowledge graph + progressive notebook

## Visual goals

The website should feel:

- curious
- precise
- calm
- visual
- progressive
- scientific
- interactive
- warm-tech

Avoid:

- generic SaaS dashboard appearance
- pure hacker terminal style
- childish educational cartoon style
- noisy decorative animation
- overusing gradients, neon glows, or AI-generated abstract blobs

## Implementation principles

1. Use design tokens, not one-off colors.
2. Build reusable components before page-specific styling.
3. Keep pages bilingual-ready: English and Simplified Chinese must both look good.
4. Make interactive labs visually consistent.
5. Keep algorithm states deterministic and inspectable.
6. Maintain accessibility:
   - visible focus states
   - good contrast
   - no color-only meaning
   - reduced-motion support
   - semantic HTML where possible
7. Do not add backend, auth, payments, or analytics unless explicitly requested.
8. Do not rewrite content architecture unless necessary for the style system.
9. Keep the implementation small and reviewable.
10. Prefer clarity over decorative cleverness.

## Required visual semantics

- Blue = core knowledge, graph structure, stable concept
- Orange = active experiment, current step, call to action
- Green = insight, correct prediction, solved state
- Red-orange = pitfall, error, misconception
- Navy/gray = serious text, structure, calm background

## Required components

At minimum, support these reusable components:

- Card
- Callout
- IntuitionCallout
- TryItCallout
- PitfallCallout
- InvariantCallout
- LabPanel
- ConceptNodeBadge
- SectionHeader
- ProgressRail or progress indicator
- LanguageToggle
- ThemeToggle

## Page-level targets

Style these key pages:

- Home page
- Knowledge graph page
- Roadmaps page
- Concept detail page
- Interactive lab area
- Design-system/demo page if the repo has one, or create a minimal internal demo route

## Validation

Before finishing a task, run the available project checks:

```bash
npm run check
npm run test
npm run build
```

If any command does not exist, explain what exists and add a minimal useful command only if appropriate.
