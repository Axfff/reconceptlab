# Prompt 03 — Build reusable UI components for the visual style

You are working in the ReConcept Lab repository.

Use:

- `docs/codex/visual-style/design/COMPONENT_SPECS.md`
- `docs/codex/visual-style/design/VISUAL_STYLE_SPEC.md`
- existing project conventions

Goal: create reusable components for the ReConcept Lab design system.

Implement or update components:

1. `Card`
2. `Callout`
3. `IntuitionCallout`
4. `TryItCallout`
5. `PitfallCallout`
6. `InvariantCallout`
7. `LabPanel`
8. `ConceptNodeBadge`
9. `SectionHeader`
10. `ProgressRail` or equivalent
11. `ThemeToggle`
12. `LanguageToggle`

Guidelines:

- Use existing component style if the project already has a convention.
- Keep props simple and typed.
- Components should be usable inside MDX.
- Use semantic HTML where possible.
- Maintain accessible labels and focus states.
- Do not make components depend on page-specific data.
- Use design tokens rather than hardcoded colors.
- Use icons only if the repo already has an icon dependency; otherwise use simple inline SVG or text-safe symbols.

Callout variants:

- `intuition`: blue
- `try`: orange
- `pitfall`: red-orange
- `invariant`: green
- `note`: neutral

LabPanel slots/props should support title, instruction, controls, visualization, state/trace, explanation, and optional children.

Also create or update a small design-system/demo page if practical:

```text
/en/design-system
/zh/design-system
```

This page should preview tokens, buttons/cards, badges, callouts, LabPanel shell, graph node badges, and typography.

Run:

```bash
npm run check
npm run test
npm run build
```

Report changed files and remaining limitations.
