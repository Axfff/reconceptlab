# Davies-Bouldin Index Node Design

## Node Scope

- Stable id: `davies-bouldin-index`.
- Topic: internal clustering validation by averaging each cluster's worst similarity to another cluster.
- Non-scope: full derivation of alternative scatter definitions and density-based validation.

## Frontmatter

- English title: `Davies-Bouldin Index`.
- Chinese title: `Davies-Bouldin 指数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `silhouette-score`.
- Next: `dunn-index`, `calinski-harabasz-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: a clustering can look good on average while one cluster has a dangerously similar neighbor.
2. Naive attempt: inspect only mean within-cluster spread.
3. Pain: spread is only meaningful relative to centroid separation.
4. Invention: for each cluster, compare its worst neighbor using `(S_i + S_j) / M_ij`.
5. Formal: `DB = (1/k) sum_i max_{j != i} R_ij`.
6. Interpretation: lower is better; small values mean every cluster's worst rival is still well separated.
7. Implementation and complexity: compute cluster scatter and centroid distances.

## Visual and Interactive Inventory

- Worst-rival figure highlighting one cluster's maximum `R_ij`.
- Shared preset lab showing DB rising when clusters stretch or bridge.
- Static table with each cluster's scatter and worst rival.

## Formula Plan

- Define `S_i` as average distance from points in cluster `i` to centroid `i`.
- Define `M_ij` as centroid distance.
- Explain why DB reverses the direction: lower values are better.

## Implementation Plan

- Reuse shared internal clustering helpers.
- Test compact preset has lower DB than stretched/bad-split presets and overlapping centroids return `null`.

## Graph Placement

- Add node `davies-bouldin-index`.
- Add edge `calinski-harabasz-index -> davies-bouldin-index` (`contrasts`): CH is higher-better global scatter, DB is lower-better average worst rival.

## Acceptance Criteria

- Page states lower DB is better.
- Page makes the "worst neighbor" max operation visible, not just formulaic.
- Chinese page keeps formulas unchanged and explains variables clearly.
