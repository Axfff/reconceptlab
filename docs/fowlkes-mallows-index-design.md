# Fowlkes-Mallows Index Node Design

## Node Scope

- Stable id: `fowlkes-mallows-index`.
- Topic: pairwise clustering score using the geometric mean of pair precision and pair recall.
- Non-scope: classifier F1, beta-weighted variants, internal validation, and chance adjustment.

## Frontmatter

- English title: `Fowlkes-Mallows Index`.
- Chinese title: `Fowlkes-Mallows 指数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `rand-index`.
- Next: `adjusted-rand-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: RI rewards true negatives, but a clustering metric often needs to focus on pairs placed together.
2. Naive attempt: use pair precision only.
3. Pain: pair precision ignores same-label pairs that were split apart.
4. Invention: combine pair precision and pair recall with a geometric mean.
5. Formal: `FMI = TP / sqrt((TP + FP)(TP + FN))`.
6. Interpretation: high only when predicted same-cluster pairs are trustworthy and true same-label pairs are recovered.
7. Implementation and complexity: reuse pair counts.

## Visual and Interactive Inventory

- Pair-positive focus panel: highlights `TP`, `FP`, `FN` and fades `TN`.
- Pair precision/recall cards.
- Shared metric lab for presets.
- Static no-JS fallback table.

## Formula Plan

- Display both forms:
  `FMI = sqrt(pair precision * pair recall)`.
  `FMI = TP / sqrt((TP + FP)(TP + FN))`.
- Explain why `TN` is absent.

## Implementation Plan

- Reuse `fowlkesMallowsIndexFromExamples`.
- Tests cover fixture value `3 / sqrt(28)`, perfect value `1`, merged-cluster behavior, and unavailable denominator branch.

## Graph Placement

- Add node `fowlkes-mallows-index`.
- Add edge `rand-index -> fowlkes-mallows-index` (`contrasts`): both use pair counts, but FMI ignores true negatives.
- Add edge `adjusted-rand-index -> fowlkes-mallows-index` (`contrasts`): ARI adjusts chance; FMI focuses on co-clustered pairs.

## Acceptance Criteria

- Page clearly says `TN` is not used.
- Pair precision and pair recall are introduced before the combined formula.
- Interactive lab exposes denominator-zero as `not available` / `不可用`.
