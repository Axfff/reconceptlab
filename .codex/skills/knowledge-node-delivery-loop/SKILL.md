---
name: knowledge-node-delivery-loop
description: "Orchestrate the full knowledge-node delivery workflow for this educational site: first create and review a node design with `knowledge-node-design-loop`, then implement that accepted design with `knowledge-node-implementation-review-loop`. Use when the user gives a topic, concept, lecture material, slide, algorithm, or knowledge item and asks Codex to design and implement it, build the next node end to end, or explicitly wants an automatic design-then-implementation pipeline."
---

# Knowledge Node Delivery Loop

## Overview

Use this skill to deliver a knowledge node in two gated phases:

1. Design the node with `knowledge-node-design-loop`.
2. Implement the resulting design with `knowledge-node-implementation-review-loop`.

This skill is an orchestrator. Do not replace either underlying workflow with a shorter ad hoc plan. Load and follow both skills in order.

## Workflow

### 1. Gather Request Context

Identify:

- Repo root, normally `/Users/zhaoj/Project/graphSite`.
- Topic or source material from the user.
- Whether the user provided model preferences for designer, developer, or reviewer subagents.
- Whether the user explicitly wants design only, implementation only, or full delivery.

Default to full delivery when this skill is invoked and the user asks to “create,” “build,” “implement,” “add,” or “deliver” a node from a topic. If the user asks for planning only, use `knowledge-node-design-loop` directly instead.

### 2. Run The Design Phase First

Load:

```text
/Users/zhaoj/Project/graphSite/.codex/skills/knowledge-node-design-loop/SKILL.md
```

Follow that skill exactly:

- Gather local context.
- Spawn the clean-context planning subagent.
- Create or update the design document, usually `docs/<node-id>-design.md`.
- Run the review-update loop until a reviewer returns `COMPLETE` or the loop reaches its maximum.
- Report the design status internally before moving on.

Do not begin production implementation until there is a concrete design document with:

- Stable node id.
- Scope and non-scope.
- Proposed frontmatter.
- Section-by-section visual inventory.
- Formula/notation plan.
- Component/state/test expectations.
- Graph placement.
- Acceptance criteria.

If the design phase fails or remains too ambiguous to implement safely, stop and report the blocker instead of starting implementation.

### 3. Hand Off To Implementation

Before implementation, summarize the design into a compact handoff:

- Node id.
- Design document path.
- Expected routes.
- Expected write scope.
- Non-negotiable teaching requirements.
- Non-negotiable visual/interactive requirements.
- Validation commands.
- Any user-specified model preferences.

If the user requested specific subagent models or efforts, carry those preferences into the implementation skill prompts. Example: developer model `gpt-5.3-codex-spark` with high effort, reviewer model `gpt-5.5` with high effort.

### 4. Run The Implementation Phase

Load:

```text
/Users/zhaoj/Project/graphSite/.codex/skills/knowledge-node-implementation-review-loop/SKILL.md
```

Follow that skill exactly:

- Spawn one worker developer agent to implement from the design document.
- Inspect the developer’s changes locally before review.
- Run up to three fresh clean-context reviewer rounds.
- Require rendered-page review for English and Chinese routes when present.
- Send findings back to the same developer agent for focused updates.
- Run final validation.

Do not skip reviewer rounds because the design phase already had reviewers. Design review and implementation review check different failure modes.

### 5. Validation And Final Report

After implementation review completes, run when practical:

```bash
npm run check
npm run test
npm run build
```

Also perform one rendered route sanity pass using the Browser plugin when available, or a local dev/preview server plus route evidence if Browser is unavailable.

Final response must include:

- Design phase outcome and whether it stopped by `COMPLETE` or max cycles.
- Implementation reviewer outcomes and whether they stopped by `FINISHED` or max cycles.
- Developer/reviewer subagents used, including any requested model preferences.
- Files changed.
- Key implementation and review fixes.
- Commands run and results.
- Rendered-page review method and limitations.
- Remaining risks or follow-up decisions.

## Guardrails

- Never implement before a design document exists unless the user explicitly overrides the design phase.
- Never add graph edges to future nodes whose content does not exist yet.
- Keep Chinese AI-generated pages at `translationStatus: needs-review`.
- Do not revert unrelated dirty worktree changes.
- Do not leave dev-server sessions running unless the user asks for a URL to try.
