# K-Means Design

## Scope

Node id: `k-means`. Beginner/intermediate algorithm node for hard center-based clustering by alternating assignment and centroid update.

Non-scope: initialization variants such as k-means++, model selection for `k`, convergence proofs beyond monotone objective intuition, mini-batch variants, and high-dimensional preprocessing.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: intermediate`, tags `machine-learning`, `clustering`, `algorithms`, no prerequisites, and next nodes `k-medoids`, `dbscan`, `em-for-gmm`. Chinese is `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: unlabeled points need `k` compact piles. Naive attempt: choose centers once. Pain: fixed centers bake in poor first guesses. Invention: alternate nearest-centroid assignment with centroid-as-mean update. Then formal objective, trace lab, implementation sketch, monotone improvement intuition, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `ClusteringAlgorithmFigure` scenario `centroid-loop`: scatterplot with centers, assignments, and the four deterministic trace steps.
- `ClusteringAlgorithmLab` initial algorithm `k-means`: step/reset controls expose assignment and center-update state in text.
- Contrast figure: shows how K-Means differs from medoids, density methods, hierarchy, and EM.

## Formula And Notation

Use display formula `sum_i ||x_i - mu_{c_i}||^2`, with `x_i`, `mu`, and `c_i` explained in prose as point, centroid, and assigned cluster.

## Components And Tests

Shared deterministic data lives in `src/components/interactive/clusteringAlgorithmTrace.ts`. Tests check final assignment stability and center count.

## Graph Placement

Add `silhouette-score -> k-means` as `applied-in`; add outgoing edges from `k-means` to `k-medoids`, `dbscan`, and `em-for-gmm`.

## Acceptance Criteria

Bilingual MDX renders, formulas compile, trace controls expose state without color-only meaning, graph validation passes, and tests cover trace invariants.
