# OPTICS Design

## Scope

Node id: `optics`. Advanced density-ordering node that builds from DBSCAN and explains reachability ordering across distance scales.

Non-scope: every extraction algorithm, priority-queue implementation optimization, and full proof of OPTICS ordering properties.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: advanced`, prerequisite `dbscan`, next `hdbscan`, and Chinese `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: one DBSCAN radius is brittle under varying density. Naive attempt: run DBSCAN for many `epsilon` values. Pain: repeated work and many disconnected outputs. Invention: produce one reachability ordering with core distance and reachability distance. Then trace lab, implementation sketch, density-order invariant, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `reachability-order` figure: compact table of OPTICS order, core distance, reachability distance, and cluster hints.
- `ClusteringAlgorithmLab` initial algorithm `optics`: shows ordering-by-reachability state.
- Graph strip: DBSCAN to OPTICS to HDBSCAN.

## Formula And Notation

Use prose definitions for core distance and reachability distance. Avoid deriving OPTICS priority update math in this node.

## Components And Tests

Use deterministic `opticsRows`; existing build validation verifies MDX/component integration.

## Graph Placement

Add `dbscan -> optics` as `generalizes`; add `optics -> hdbscan` as `motivates`.

## Acceptance Criteria

Page must say OPTICS is an ordering plus extraction choice, not automatically one final clustering.
