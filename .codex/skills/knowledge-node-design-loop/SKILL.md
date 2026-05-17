---
name: knowledge-node-design-loop
description: Create and refine a knowledge-graph node implementation plan for this educational site. Use when the user gives a topic, lecture slide, concept, algorithm, or knowledge item and asks Codex to plan a node/page/component before implementation, especially when they want clean-context subagent planning, beginner-focused review, visual/interactive design improvements, or repeated review-update loops.
---

# Knowledge Node Design Loop

## Overview

Use this workflow to turn a topic or knowledge item into a reviewed implementation plan for a learner-facing knowledge graph node. The expected output is usually a design document or plan entry, not production implementation, unless the user explicitly asks to implement after planning.

This site is intentionally visual and interactive. The design loop should not concentrate the learning experience into one isolated "interactive demo" section. For every useful section, algorithm step, state transition, edge case, and conceptual point, explicitly ask whether a visual, static diagram, trace-linked figure, micro-widget, table, or interactive control would reduce cognitive load. Add it when it is useful; if a section stays prose-only, document why.

Concept MDX pages support KaTeX-rendered formulas with `$...$` for inline math and `$$...$$` for display math; literal dollar signs should be escaped as `\$`. Use formulas when they make definitions, invariants, recurrences, reductions, geometric predicates, or complexity claims more precise, and pair important notation with a plain-language interpretation. Do not let formulas replace the progressive teaching arc or nearby visuals.

The standard loop is:

1. Gather local context and topic source.
2. Draft an initial implementation plan with a clean-context planning subagent.
3. Run up to three review-update cycles, stopping early if a reviewer marks the design complete.
4. Summarize the final plan, open issues, and changed files.

## Workflow

### 1. Gather Context

Identify:

- The repository root.
- Existing planning docs, graph data, content conventions, and design principles.
- The source topic material: user prompt, PDF/slides, existing notes, or a named concept.
- The desired granularity: coarse node vs fine-grained supporting nodes.

Read local project instructions first, especially `AGENTS.md`, `README.md`, and existing docs under `docs/`. If the source is a PDF or slide deck, extract enough text to identify the concept, learning arc, and visual opportunities.

Avoid committing or implementing production code during this skill unless the user explicitly asks.

### 2. Draft Initial Plan With A Clean-Context Subagent

Spawn one clean-context subagent for the initial plan. Do not fork conversation context unless the task truly requires it. Give the subagent only:

- Repo root.
- Topic/source path or extracted topic summary.
- Relevant target file names if known.
- Planning requirements.

Ask for an implementation plan that includes:

- Stable node id.
- Scope and non-scope.
- Beginner teaching arc: concrete problem -> naive attempt -> pain -> invention -> visual anchors throughout -> formal -> implementation -> invariant/correctness -> complexity -> connections.
- Frontmatter proposal for English and Chinese pages when applicable.
- Graph placement and suggested edge reasons.
- Section-by-section visual and interactive widget design, including static figures, micro-widgets, master demos, and trace-linked annotations.
- Formula opportunities and notation plan, including which formulas belong inline vs display and how each will be explained in words.
- Accessibility and mobile considerations.
- Acceptance criteria and validation commands.

After the subagent returns, inspect the output and create or update the plan document yourself. Keep the document concise and practical.

### 3. Review-Update Loop

Run up to three cycles unless the user requests a different number. If a reviewer says the current design is good enough and returns `COMPLETE`, stop the loop early and do not spawn a writer for that cycle.

For each cycle:

1. Spawn a fresh clean-context reviewer subagent.
2. Ask it to review the current plan document without editing files.
3. Focus the review on beginner clarity, hidden assumptions, visual/interactive density, accessibility, mobile UX, teaching-arc fit, and implementation risks.
4. Wait for findings.
5. If the reviewer returns `COMPLETE`, record the rationale and stop the loop.
6. Otherwise, spawn a separate fresh clean-context writer subagent.
7. Give it only the current plan file path and the reviewer findings.
8. Instruct it to edit only the plan document unless a plan-list pointer also needs updating.
9. After it finishes, inspect the diff before starting the next cycle.

Use different subagents for reviewer and writer. Do not reuse a subagent across cycles.

### 4. Reviewer Prompt Template

```text
Clean-context review cycle <N>.

Repo root: <repo>.

Review <plan-file> for a beginner-facing knowledge node design about <topic>.
You may inspect <plan-list-or-context-file> for context only. Do not edit files.

Focus on:
1. Beginner clarity gaps, hidden assumptions, ambiguous conventions, confusing wording.
2. Visual/interactive opportunities for every useful section, step, state transition, edge case, and conceptual point. Suggest static figures, micro-widgets, trace-linked diagrams, controls, annotations, accessibility text, and mobile treatment wherever they would help.
3. Places where the plan relies too heavily on one master demo instead of embedding visual support near the learner's current question.
4. Fit with the teaching arc: concrete problem -> naive attempt -> pain -> invention -> visual anchors throughout -> formal -> implementation -> invariant/correctness -> complexity -> connections.
5. Formula use: missing helpful notation, unexplained symbols, formulas that need plain-language interpretation, or math that should be split into a future node.
6. Risks that would make the future implementation inconsistent, hard to test, or misleading.

Return one of:
- `COMPLETE`, with a concise rationale, if the design is good enough to implement without another review-update cycle.
- Or prioritized, concrete findings. If the design is strong but not complete, identify the top refinements.
```

### 5. Writer Prompt Template

```text
Clean-context writer cycle <N>.

Repo root: <repo>.

Task: Edit <plan-file> to apply the review findings below. Do not edit other files unless absolutely necessary.
You are not alone in the codebase; do not revert unrelated changes.

Findings to apply:
<paste reviewer findings>

Keep the design concise and practical. Preserve the chosen node granularity.
Final response should summarize changed file and key changes.
```

## Plan Document Checklist

A strong plan should include:

- Node id and scope.
- What not to split out yet.
- Proposed frontmatter.
- Teaching arc.
- Inline vocabulary scaffolding for beginner prerequisites.
- Section-by-section visual inventory. Every major section should either define a useful visual/widget or explain why prose is better.
- Formula and notation inventory. Every important formula should have a nearby plain-language explanation and, when useful, a visual or trace connection.
- Interactive component names and state models.
- Deterministic trace or golden expectations for each visual/widget that depends on algorithm state.
- Visual elements, labels, annotations, and captions.
- Controls, including why a control is useful rather than decorative.
- Accessibility requirements.
- Mobile layout guidance.
- Common confusions and edge cases.
- Implementation sketch or pseudocode.
- Graph placement and edge reasons.
- Acceptance criteria.

## Visual/Interactive Density Standards

Default to dense visual scaffolding:

- Treat visuals as part of the explanation, not as optional decoration after the prose.
- Put a diagram, trace-linked figure, micro-widget, state table, or compact interactive control close to the section or step it explains.
- A master demo is valuable, but it should not be the only visual surface for a complex algorithm.
- For each visual, name the exact learner question it answers.
- Static figures are appropriate when the concept is a single relationship or before/after state.
- Interactive controls are appropriate when the learner benefits from stepping, comparing, toggling, dragging, filtering, or revealing state.
- Avoid empty interaction. Do not add controls that merely animate without exposing new reasoning.
- If a section remains prose-only, record the reason in the plan.

Prefer deterministic visuals and demos:

- Use fixed examples or generated trace data from code.
- Show current state in text, not only color.
- For interactive demos, include step and reset controls at minimum.
- Expose the algorithm's working memory directly, such as queue, stack, frontier, current triple, distance table, or candidate set.
- Add labels for why a state changed.
- Include at least one representative failure/repair step.
- Include mobile layout notes when multiple panels are involved.

Do not let a spec-only page pass if the site's teaching goal requires visual state changes. Do not let a single-demo page pass when section-level visuals would materially help. If the first implementation cannot include a useful widget, mark it as a temporary exception and state the missing acceptance criterion clearly.

## Final Response

Report:

- Subagents used by role and cycle.
- Whether the review loop stopped because a reviewer returned `COMPLETE` or because the max cycle count was reached.
- Files changed.
- Key improvements made.
- Commands run, or explicitly say no tests were run for docs-only edits.
- Remaining implementation decisions.
