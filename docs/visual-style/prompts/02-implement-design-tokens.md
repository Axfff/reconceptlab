# Prompt 02 — Implement ReConcept Lab design tokens

You are working in the ReConcept Lab repository.

Use the visual style package as guidance:

- `docs/codex/visual-style/design/DESIGN_TOKENS.css`
- `docs/codex/visual-style/design/VISUAL_STYLE_SPEC.md`
- `docs/codex/visual-style/design/I18N_STYLE_NOTES.md`

Goal: implement the design-token foundation for the Explorable Lab Notebook visual style.

Tasks:

1. Add or update global CSS variables for backgrounds, text, brand colors, semantic state colors, concept category colors, borders, shadows, radius, typography, layout widths, and motion durations.
2. Add light and dark theme variables.
3. Add a `.rcl-graph-paper` utility class or equivalent for subtle graph-paper backgrounds.
4. Add base body/page styles: font family, background, text color, link styles, selection style.
5. Add visible focus styles.
6. Add `prefers-reduced-motion` support.
7. Ensure the token system works for both English and Simplified Chinese text.
8. If Tailwind is used, map tokens cleanly without scattering hardcoded colors.
9. Do not restyle every page yet; focus on foundation.

Acceptance checks:

- The site still builds.
- Existing pages are not visually broken.
- Light/dark variables are present.
- There is a clear place for future components to consume tokens.

Run available checks:

```bash
npm run check
npm run test
npm run build
```

Report what changed and any commands that failed.
