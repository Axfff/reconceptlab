# Calinski-Harabasz Index Node Design

## Node Scope

- Stable id: `calinski-harabasz-index`.
- Topic: internal clustering validation by comparing between-cluster centroid dispersion with within-cluster dispersion.
- Non-scope: ANOVA derivation, probabilistic clustering, and distance metrics beyond Euclidean examples.

## Frontmatter

- English title: `Calinski-Harabasz Index`.
- Chinese title: `Calinski-Harabasz 指数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `silhouette-score`.
- Next: `davies-bouldin-index`, `dunn-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: per-point silhouette is useful but can be expensive and detailed.
2. Naive attempt: use only average distance to cluster centroids.
3. Pain: tight clusters still need to be far from the global center and each other.
4. Invention: compare between-cluster scatter `B_k` with within-cluster scatter `W_k`.
5. Formal: `CH = (B_k / (k - 1)) / (W_k / (n - k))`.
6. Interpretation: higher is better because clusters are far apart relative to their internal spread.
7. Implementation and complexity: centroid and squared-distance pass is `O(nk)` after assignments.

## Visual and Interactive Inventory

- Centroid scatter figure showing global centroid, cluster centroids, within arrows, and between arrows.
- Formula ledger for `B_k`, `W_k`, `k`, and `n`.
- Shared preset lab comparing how CH reacts to stretched or merged clusters.

## Formula Plan

- Introduce `W_k` as sum of squared distances from points to their own centroid.
- Introduce `B_k` as cluster-size-weighted squared distance from each cluster centroid to the global centroid.
- Pair the ratio with "higher is better"; note undefined when `k < 2` or `n <= k`.

## Implementation Plan

- Reuse shared internal clustering helpers.
- Test that compact clusters score higher than stretched/bad-split presets and degenerate cluster counts return `null`.

## Graph Placement

- Add node `calinski-harabasz-index`.
- Add edge `silhouette-score -> calinski-harabasz-index` (`contrasts`): per-point nearest-cluster comparison versus centroid scatter ratio.

## Acceptance Criteria

- Page says CH is internal and does not use reference labels.
- Page explains both the numerator and denominator in plain language.
- Page warns that larger score is better, unlike Davies-Bouldin.
