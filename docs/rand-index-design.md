# Rand Index Node Design

## Node Scope

- Stable id: `rand-index`.
- Topic: pairwise external clustering agreement.
- Non-scope: chance adjustment and pair-precision balancing, which are left to `adjusted-rand-index` and `fowlkes-mallows-index`.

## Frontmatter

- English title: `Rand Index`.
- Chinese title: `Rand 指数`.
- Difficulty: `beginner`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `purity`.
- Next: `adjusted-rand-index`, `fowlkes-mallows-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: Purity looks high even when a true class is split across clusters.
2. Naive attempt: keep one majority label per cluster.
3. Pain: that ignores whether pairs that belong together stayed together.
4. Invention: ask two yes/no questions for every unordered pair: same reference label? same predicted cluster?
5. Formal: `RI = (TP + TN) / binom(n, 2)`.
6. Limitation: many easy true-negative pairs can make RI look high.
7. Implementation and complexity: enumerate pairs in `O(n^2)` or compute from contingency counts.

## Visual and Interactive Inventory

- Pair-question panel: same label versus same cluster.
- Pair confusion cards: `TP`, `FP`, `FN`, `TN` with counts from the shared fixture.
- Shared metric lab for preset comparison.
- Static pair-count fallback table.

## Formula Plan

- Introduce `TP`, `FP`, `FN`, `TN` as pair counts, not classifier examples.
- Display formula for total unordered pairs `binom(n, 2) = n(n - 1)/2`.
- Display `RI = (TP + TN) / binom(n, 2)`.

## Implementation Plan

- Reuse shared fixture and `pairStatsFromExamples`.
- Page imports `ClusteringMetricFigure` and `ClusteringMetricLab`.
- Test expected fixture pair counts: `TP=3`, `FP=1`, `FN=4`, `TN=20`, `total=28`.

## Graph Placement

- Add node `rand-index`.
- Add edge `purity -> rand-index` (`contrasts`).
- Add edge `confusion-matrix -> rand-index` (`uses`) because the pair-count table mirrors a confusion matrix over pairs.
- Add edges from `rand-index` to `adjusted-rand-index` and `fowlkes-mallows-index`.

## Acceptance Criteria

- Page explains that cluster names are arbitrary.
- Page states why true negatives can dominate.
- Formula and implementation sketch match the helper functions.
