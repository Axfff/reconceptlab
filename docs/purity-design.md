# Purity Node Design

## Node Scope

- Stable id: `purity`.
- Topic: external clustering evaluation by assigning each predicted cluster to its majority reference class.
- Non-scope: internal clustering objectives, choosing `k`, normalized mutual information, and pair-count chance correction. Those are named as follow-ups only.

## Frontmatter

- English title: `Purity`.
- Chinese title: `纯度（Purity）`.
- Difficulty: `beginner`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: none.
- Next: `rand-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: a teacher has answer-key labels, but a clustering algorithm only outputs group ids.
2. Naive attempt: count exact cluster names as if they were class predictions.
3. Pain: cluster names are arbitrary, so each cluster needs its best matching label.
4. Invention: give each cluster credit for its largest reference-label count.
5. Formal: `purity = (1/n) sum_k max_j |C_k ∩ L_j|`.
6. Limitation: splitting every item into its own cluster can reach `1.0`.
7. Implementation and complexity: build a cluster-by-label contingency table in `O(n)`.
8. Graph connection: motivates pair-based Rand Index.

## Visual and Interactive Inventory

- Fixture card grid near the hook: eight items with reference label and predicted cluster.
- Cluster-majority cards near the formula: each cluster shows member labels, majority count, and contribution.
- Contrast panel near the limitation: fixture versus singleton over-split preset.
- Shared metric lab: switch presets and see purity, RI, ARI, FMI side by side.
- Static no-JS fallback table with cluster majority counts.

## Formula Plan

- Inline vocabulary: predicted cluster `C_k`, reference label `L_j`, item count `n`.
- Display formula for purity with a plain-language reading: "for each predicted cluster, keep the largest answer-key pile."

## Implementation Plan

- Shared deterministic helper: `src/components/interactive/clusteringMetricsTrace.ts`.
- Static/support figure: `ClusteringMetricFigure.tsx`.
- Interactive preset lab: `ClusteringMetricLab.tsx`.
- Tests: `tests/clustering-metrics-trace.test.ts`.

## Graph Placement

- Add node `purity`.
- Add edge `purity -> rand-index` with type `contrasts`: Purity scores clusters by majority labels; Rand Index evaluates item pairs.

## Acceptance Criteria

- English and Chinese MDX pages exist.
- Chinese page keeps `translationStatus: needs-review`.
- Formula renders with KaTeX.
- Shared fixture computes `7/8 = 0.875`.
- Oversplit preset visibly demonstrates the limitation.
