# Prompt 06 — Visual QA, accessibility cleanup, and final polish

You are working in the ReConcept Lab repository.

Use:

- `docs/codex/visual-style/design/QA_CHECKLIST.md`
- `docs/codex/visual-style/design/VISUAL_STYLE_SPEC.md`

Goal: perform final visual QA and cleanup after implementing the ReConcept Lab style.

Tasks:

1. Audit all key pages:
   - `/en`
   - `/zh`
   - `/en/graph`
   - `/zh/graph`
   - `/en/roadmaps` or equivalent
   - `/zh/roadmaps` or equivalent
   - `/en/nodes/bfs` or equivalent
   - `/zh/nodes/bfs` or equivalent
2. Fix obvious layout issues:
   - cramped Chinese text
   - overflowing cards
   - inconsistent spacing
   - missing focus states
   - low contrast text
   - inconsistent card radii/shadows
3. Check dark mode if implemented:
   - no pure black backgrounds
   - text contrast remains good
   - brand colors remain meaningful
4. Check responsive layout:
   - mobile navbar
   - concept page sidebar collapse
   - lab panel stacking
   - graph page usability
5. Remove unused CSS/components introduced during implementation.
6. Ensure design tokens are the source of truth.
7. Add minimal documentation:
   - where tokens live
   - how to use callouts in MDX
   - how to embed a LabPanel
8. Do not add new features.

Run:

```bash
npm run check
npm run test
npm run build
```

Final response should include:

- summary of visual work completed
- changed files
- commands run and results
- remaining TODOs
- manual QA steps for the user
