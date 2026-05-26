# DBSCAN Design

## Scope

Node id: `dbscan`. Density clustering node focused on core, border, noise, `epsilon`, `minPts`, and density-connected expansion.

Non-scope: OPTICS/HDBSCAN extraction details, spatial-index implementation internals, and formal topology of density connectivity.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: intermediate`, prerequisite `k-means`, next `optics` and `hdbscan`, and Chinese `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: clusters are not always round center-shaped blobs. Naive attempt: force every point into some cluster. Pain: outliers and bridges are hidden. Invention: core points grow dense regions; border points attach; sparse points can remain noise. Then implementation sketch, reachability invariant, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `density-neighborhood` figure: fixed density fixture marks core, border, and noise with neighborhood card values.
- `ClusteringAlgorithmLab` initial algorithm `dbscan`: exposes find-core and expand-density steps.
- Contrast figure: center methods versus density methods.

## Formula And Notation

Avoid heavy formulas. Define `epsilon` and `minPts` inline and keep the algorithm visual-first.

## Components And Tests

Use `densityFixture`, `dbscanParams`, and `neighborsWithin`. Test asserts `p1` has the expected core neighborhood and `p9` is noise.

## Graph Placement

Add `k-means -> dbscan` as `contrasts`; add `dbscan -> optics` and `dbscan -> hdbscan`.

## Acceptance Criteria

Page clearly states DBSCAN does not require `k`, can label noise, and struggles with varying densities when only one `epsilon` is used.
