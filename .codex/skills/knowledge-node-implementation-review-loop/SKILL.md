---
name: knowledge-node-implementation-review-loop
description: Implement a designed knowledge-graph node through a developer-agent and independent clean-context reviewer loop. Use when the user asks Codex to implement a node/page/component from a design plan with subagent review, especially when the implementation must be checked by fresh reviewers against the plan, tests, accessibility, mobile behavior, and the actual rendered webpage before finishing.
---

# Knowledge Node Implementation Review Loop

## Overview

Use this workflow to implement a learner-facing knowledge node from an existing design document, then verify it through independent clean-context review-update rounds.

This is an implementation workflow, not a planning workflow. It assumes a design document already exists, usually produced by `knowledge-node-design-loop`.

The standard loop is:

1. Gather implementation context.
2. Spawn one developer agent to implement the design.
3. Inspect the developer's changes locally.
4. Run up to three clean-context review rounds.
5. In each review, require both code review and rendered webpage review.
6. Apply reviewer findings through the developer agent.
7. Run validation and summarize.

Default maximum review count: **3**. If a reviewer returns `FINISHED`, stop the review loop early. Every reviewer must be a fresh independent subagent with clean context, not the developer agent, not a reused reviewer, and not a fork of the current conversation.

## Workflow

### 1. Gather Context

Identify:

- Repo root.
- Design plan file.
- Target node id and expected content/component/test files.
- Existing content conventions, graph data, layout/style patterns, and validation scripts.
- The route(s) that should render after implementation, usually `/en/nodes/<id>/` and `/zh/nodes/<id>/`.

Read only enough local context to implement safely:

- `AGENTS.md`
- `README.md`
- The design plan.
- Existing adjacent node MDX/component/test patterns.
- `src/data/graph.ts`
- `tests/validate-content.test.ts`
- Shared layout/style files if new visual components need styles.

Do not revert unrelated dirty worktree changes.

### 2. Spawn Developer Agent

Spawn one `worker` developer agent. Give it:

- Repo root.
- Design plan path.
- Exact target node id.
- Expected write scope.
- Testing expectations.
- Reminder that it is not alone in the codebase and must not revert unrelated changes.

Tell it to edit files directly in its forked workspace and report changed files, deviations, and commands run.

Developer prompt skeleton:

```text
Developer implementation agent.

Repo root: <repo>
Design plan: <plan-file>
Target node: <node-id>

Task: Implement the designed knowledge node end to end.

You are not alone in the codebase. Do not revert or overwrite unrelated changes.

Expected write scope:
- MDX content under src/content/nodes/<node-id>/.
- Deterministic trace/helper data under src/components/interactive/ when needed.
- Interactive/static teaching components under src/components/interactive/.
- Focused tests under tests/.
- Graph/content integration in src/data/graph.ts and tests/validate-content.test.ts.
- Minimal shared styles if needed.
- Plan list status only if implementation is actually complete.

Key requirements from the design:
<summarize the non-negotiable teaching, visual, accessibility, and graph requirements>

Run targeted tests when practical. Parent agent will run final validation.

Final response:
- Files changed.
- Any deviations from design.
- Commands run and results.
```

### 3. Inspect Developer Changes Locally

Before spawning a reviewer, inspect the implementation yourself:

- `git status --short`
- New/modified MDX pages.
- Trace/helper data and tests.
- Main interactive components.
- `src/data/graph.ts`
- `tests/validate-content.test.ts`
- Any shared styles.

Look for obvious blockers before asking a reviewer.

### 4. Review-Update Loop

Run up to three review rounds.

For each round:

1. Spawn a fresh independent clean-context reviewer agent.
2. Ask it to review the implementation against the design.
3. Require review of both:
   - code/content/tests/graph integration
   - actual rendered webpage behavior and appearance
4. If the reviewer returns `FINISHED`, stop.
5. If it returns findings, send those findings to the developer agent for a focused update.
6. Inspect the update locally.
7. Continue to the next round if needed.

Use a fresh independent reviewer for each round. Do not reuse reviewer agents across rounds. Do not fork the parent conversation context into the reviewer unless the user explicitly requires it; instead, give the reviewer only the repo root, design file path, target files/routes, and review instructions. The reviewer should not see the developer agent's reasoning or prior review discussion unless a specific finding must be rechecked. Reuse the same developer agent for updates when possible, because it already owns the implementation context.

### 5. Rendered Webpage Review Requirement

The reviewer must not stop at static code inspection.

Reviewer should verify the actual rendered page using the best available method:

1. Prefer the Browser plugin / browser skill for local rendered page inspection when available.
2. If Browser is unavailable, use a local dev server plus `curl` for route sanity, and rely on `npm run build` output for route generation.
3. If a screenshot-capable browser tool is available, inspect at least one desktop and one narrow/mobile viewport.
4. Check both English and Chinese routes when the node is bilingual.

Rendered-page review should check:

- Page loads at expected routes.
- MDX imports render without hydration/runtime errors.
- Interactive widgets are visible and not blank.
- Controls can be operated with keyboard/mouse where practical.
- Reveal/step state is visible in text, not only color.
- No obvious horizontal overflow or overlapping text on mobile.
- Major sections have nearby visual support as promised by the design.
- Chinese text wraps acceptably and keeps `translationStatus: needs-review`.
- Future nodes are visually marked as future/unimplemented when routes do not exist.

If a reviewer cannot inspect the rendered webpage because tools are unavailable, it must say so explicitly and compensate with build output, route generation, and component/MDX inspection. Do not report rendered-page review as complete if it was not performed.

### 6. Reviewer Prompt Template

```text
Clean-context reviewer round <N>.

Repo root: <repo>

Task: Independently review implementation of <node-id> against <plan-file>. Do not edit files.

You are a fresh clean-context reviewer. Do not assume the developer implementation is correct. Judge only from the design, repository files, validation output you run or inspect, and the rendered webpage.

Read:
- Design plan: <plan-file>
- Node content: src/content/nodes/<node-id>/en.mdx and zh.mdx if present
- Trace/helpers and tests relevant to the node
- Interactive/static components relevant to the node
- src/data/graph.ts
- tests/validate-content.test.ts
- Shared styles if relevant

Also inspect the actual rendered webpage:
- Start or use the local dev server if needed.
- Check /en/nodes/<node-id>/ and /zh/nodes/<node-id>/ when present.
- Prefer browser screenshots/interaction checks; if unavailable, state the limitation and use build/route/curl evidence.

Focus:
1. Does implementation match the design's teaching scope and sequencing?
2. Are learner-facing sections self-contained, bounded, and visually supported?
3. Are claims accurate, especially around complexity, correctness, reductions, and future nodes?
4. Are deterministic traces/tests consistent with the visuals and page text?
5. Are controls and reveal states accessible: labels, keyboard operation, visible state, no color-only semantics?
6. Does the rendered page show blank widgets, hydration errors, overflow, cramped Chinese text, or incoherent layout?
7. Are graph/content integrations valid, without dangling endpoint edges?

Return one of:
- FINISHED, with concise rationale and residual risks.
- Or prioritized findings with concrete file/line references, rendered-page observations, and suggested fixes.
```

### 7. Developer Update Prompt Template

```text
Developer update after review round <N>.

Apply only these reviewer findings. Do not revert unrelated changes.

Findings:
<paste findings>

Keep the implementation aligned with <plan-file>.
Run targeted tests/checks when practical.

Final response:
- Files changed.
- What changed.
- Commands run and results.
```

### 8. Validation

After the review loop finishes, run when practical:

```bash
npm run check
npm run test
npm run build
```

If `npm run check` fails inside the sandbox because `tsx` cannot create an IPC pipe, rerun it with escalation according to the active permissions policy.

For frontend/content nodes, also do one rendered route sanity pass:

- Prefer Browser plugin inspection of `/en/nodes/<id>/` and `/zh/nodes/<id>/`.
- If Browser is unavailable, use `npm run build` route output and `curl` against a local dev server if already running or practical to start.

Do not leave needed dev-server sessions running at the end unless the user asked for a URL to try.

## Acceptance Checklist

Before final response, confirm:

- Design requirements are implemented or deviations are explained.
- English and Chinese content exist when expected.
- Chinese AI-generated content uses `translationStatus: needs-review`.
- Graph edges only point to existing nodes.
- Tests cover deterministic traces and major edge cases.
- Rendered page was reviewed, or the limitation is explicitly stated.
- Review loop stopped because either a reviewer returned `FINISHED` or the max review count was reached.
- Final validation commands and results are reported.

## Final Response

Report:

- Developer agent used.
- Reviewer agents used and round outcomes.
- Files changed.
- Key implementation and review fixes.
- Commands run and results.
- Rendered-page review method and any limitation.
- Remaining risks or follow-up decisions.
