# Dunn Index Node Design

## Node Scope

- Stable id: `dunn-index`.
- Topic: internal clustering validation by dividing the minimum inter-cluster distance by the maximum within-cluster diameter.
- Non-scope: all Dunn variants, density-based cluster validity, and robust outlier handling.

## Frontmatter

- English title: `Dunn Index`.
- Chinese title: `Dunn 指数`.
- Difficulty: `intermediate`.
- Concept type: `concept`.
- Tags: `machine-learning`, `metrics`, `clustering`.
- Prerequisites: `silhouette-score`.
- Next: `calinski-harabasz-index`, `davies-bouldin-index`.
- Chinese translation status: `needs-review`.

## Teaching Arc

1. Hook: sometimes the weakest gap and widest cluster determine whether a clustering is usable.
2. Naive attempt: average all distances.
3. Pain: averages can hide one bridge point or one stretched cluster.
4. Invention: compare the closest cross-cluster pair with the widest same-cluster pair.
5. Formal: `Dunn = min intercluster distance / max intracluster diameter`.
6. Interpretation: higher is better; sensitive to outliers because it uses extremes.
7. Implementation and complexity: pairwise distances dominate at `O(n^2)`.

## Visual and Interactive Inventory

- Min-gap versus max-diameter figure.
- Shared preset lab showing Dunn falling sharply for bridge/bad-split presets.
- Static calculation card for the fixture's two extreme distances.

## Formula Plan

- Display set notation after the visual: `min_{i != j} delta(C_i, C_j) / max_l Delta(C_l)`.
- Explain this implementation uses single-link intercluster distance and pairwise cluster diameter.
- Note unavailable when the largest diameter is zero.

## Implementation Plan

- Reuse shared internal clustering helpers.
- Test known simple line examples and preset ordering.

## Graph Placement

- Add node `dunn-index`.
- Add edge `davies-bouldin-index -> dunn-index` (`contrasts`): DB averages worst centroid similarities; Dunn uses the single weakest gap and widest diameter.
- Add edge `calinski-harabasz-index -> dunn-index` (`contrasts`): CH uses squared centroid scatter; Dunn uses pairwise extremes.

## Acceptance Criteria

- Page says Dunn is higher-better but outlier-sensitive.
- Page names the exact distance variant used.
- Lab and static figure show the numerator and denominator as concrete distances.
