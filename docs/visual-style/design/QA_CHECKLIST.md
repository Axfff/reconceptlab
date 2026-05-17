# Visual QA Checklist

Use this before merging visual style work.

## Build quality

- [ ] `npm run check` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] no TypeScript errors
- [ ] no broken imports
- [ ] no console errors on core pages

## Page coverage

- [ ] home page styled
- [ ] graph page styled
- [ ] roadmap page styled
- [ ] concept page styled
- [ ] interactive lab styled
- [ ] bilingual page layout works
- [ ] mobile layout works

## Accessibility

- [ ] visible keyboard focus state
- [ ] sufficient color contrast
- [ ] interactive controls have accessible names
- [ ] graph/lab states use text, shape, or labels in addition to color
- [ ] reduced-motion preference respected
- [ ] language attribute is correct for `/en` and `/zh`

## Visual consistency

- [ ] uses design tokens, not random hardcoded colors
- [ ] cards have consistent radius/border/shadow
- [ ] callouts use consistent icon/title/color system
- [ ] lab panels use consistent controls/visualization/state trace layout
- [ ] graph node states match visual semantics
- [ ] dark mode is not pure black
- [ ] Chinese text does not overflow or feel cramped

## Content friendliness

- [ ] MDX pages can use callout components easily
- [ ] interactive components can be embedded inside MDX
- [ ] concept metadata badges are reusable
- [ ] future pages can follow the same pattern
