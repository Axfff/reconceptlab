# Silhouette Score Node Design

## Node Scope

- Stable id: `silhouette-score`.
- Topic: internal clustering validation by comparing each point's average distance to its own cluster with the nearest other cluster.
- Non-scope: supervised/external clustering metrics, high-dimensional distance engineering, and model selection beyond reading the score.

## Frontmatter

- English title: `Silhouette Score`.
- Chinese title: `轮廓系数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: none.
- Next: `calinski-harabasz-index`, `davies-bouldin-index`, `dunn-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: no answer key is available, only point positions and cluster assignments.
2. Naive attempt: judge by whether points look close to their own cluster.
3. Pain: compactness alone misses whether another cluster is even closer.
4. Invention: for each point compare `a(i)`, its own-cluster average distance, with `b(i)`, the nearest other-cluster average distance.
5. Formal: `s(i) = (b(i) - a(i)) / max(a(i), b(i))`; average over points.
6. Interpretation: near `1` is well placed, near `0` is boundary-like, negative suggests likely wrong assignment.
7. Implementation and complexity: pairwise distances dominate at `O(n^2)`.

## Visual and Interactive Inventory

- Geometry fixture panel showing colored clusters and point labels.
- Per-point silhouette table for a selected point.
- Shared preset lab comparing compact, stretched, bridge, and bad-split clusterings.
- Graph strip connecting the four internal validation metrics.

## Formula Plan

- Define `a(i)` and `b(i)` in prose before showing the formula.
- Show the display formula for `s(i)` and the mean score.
- Explain singleton clusters use score `0` in this implementation to avoid rewarding one-point clusters.

## Implementation Plan

- Add shared deterministic helpers in `internalClusteringMetricsTrace.ts`.
- Add reusable figures/lab in `InternalClusteringMetricFigure.tsx` and `InternalClusteringMetricLab.tsx`.
- Add focused tests for silhouette ranges, singleton handling, and preset ordering.

## Graph Placement

- Add node `silhouette-score`.
- Add contrast edge from `fowlkes-mallows-index` to `silhouette-score`: external metrics need labels, silhouette uses geometry only.
- Add motivate edges from `silhouette-score` to the other internal metrics.

## Acceptance Criteria

- Page explicitly distinguishes internal from external clustering evaluation.
- Page explains why both cohesion and separation matter.
- Chinese page keeps formulas unchanged and uses `translationStatus: needs-review`.
