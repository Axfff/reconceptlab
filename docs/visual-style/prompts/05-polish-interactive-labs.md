# Prompt 05 — Polish interactive labs and algorithm-state visuals

You are working in the ReConcept Lab repository.

Goal: make the interactive lab area visually consistent with ReConcept Lab's Explorable Lab Notebook style.

Focus on the existing BFS or sample interactive component.

Tasks:

1. Wrap the lab in the shared `LabPanel`.
2. Ensure the lab has title, one-sentence instruction, controls, visualization area, queue/stack/state trace area, current-step explanation, and reset/step/play controls.
3. Apply state semantics:
   - active/current item: orange
   - visited/solved: green
   - unvisited/default: blue-gray
   - blocked/error/pitfall: red-orange
4. Do not rely on color alone: add labels, outlines, symbols, or state text.
5. Add or improve keyboard accessibility for controls.
6. Respect `prefers-reduced-motion`.
7. Keep animation durations: fast 120ms, normal 220ms, slow 420ms.
8. Make the component responsive.
9. If the lab uses algorithm traces, keep the trace data deterministic and easy to inspect.
10. Add or update tests for trace/state behavior if the repo has component tests.

Nice to have:
- a small "Think!" prediction card
- a "Show answer" action
- a step counter like "Step 1 / 10"

Constraints:

- Do not replace working logic with a decorative mock.
- Do not use random animation.
- Do not introduce a large animation library unless already used.

Run:

```bash
npm run check
npm run test
npm run build
```

Report changed files and how to manually test the lab.
