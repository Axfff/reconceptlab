# Adjusted Rand Index Node Design

## Node Scope

- Stable id: `adjusted-rand-index`.
- Topic: chance-adjusted Rand agreement using the contingency table margins.
- Non-scope: deriving the hypergeometric expectation in depth, permutation tests, and information-theoretic clustering metrics.

## Frontmatter

- English title: `Adjusted Rand Index`.
- Chinese title: `调整 Rand 指数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `rand-index`.
- Next: `fowlkes-mallows-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: RI can stay high because many pairs are different in both partitions.
2. Naive attempt: accept raw RI.
3. Pain: two random partitions with the same margins can still agree by chance.
4. Invention: subtract expected pair agreement from the observed same-same pair count.
5. Formal: use contingency counts `n_ij`, cluster sizes `a_i`, class sizes `b_j`, and total pairs `T`.
6. Interpretation: `1` means perfect match, around `0` means chance-level for those margins, negative means worse than expected.
7. Implementation and complexity: compute from contingency table in `O(n + rc)`.

## Visual and Interactive Inventory

- Raw RI versus ARI comparison cards.
- Contingency-margin card showing `sum_ij binom(n_ij, 2)`, row-pair sum, column-pair sum, expected term, and maximum term.
- Shared metric lab for presets.
- Static calculation fallback table.

## Formula Plan

- Display:
  `ARI = (S - E) / (M - E)`.
- Define `S = sum_ij binom(n_ij, 2)`, `E = A B / T`, `M = (A + B) / 2`.
- Pair each symbol with plain-language text; do not derive the expectation deeply.

## Implementation Plan

- Reuse `adjustedRandIndexFromExamples`.
- Tests cover fixture value `4/9`, perfect value `1`, singleton oversplit value `0`, and formatting.

## Graph Placement

- Add node `adjusted-rand-index`.
- Add edge `rand-index -> adjusted-rand-index` (`generalizes`): ARI keeps pair agreement but subtracts chance agreement.

## Acceptance Criteria

- Page explains the difference between raw RI and chance-adjusted ARI.
- Page includes a branch note for degenerate margins.
- Chinese page keeps formulas unchanged and explains symbols in Simplified Chinese.
