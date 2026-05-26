# HDBSCAN Design

## Scope

Node id: `hdbscan`. Advanced density-hierarchy node focused on stability across density levels and condensed hierarchy intuition.

Non-scope: exact mutual-reachability MST implementation details, all cluster-selection modes, and library-specific parameters beyond minimum cluster size.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: advanced`, prerequisites `dbscan` and `optics`, no next nodes, and Chinese `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: different regions need different density scales. Naive attempt: choose the prettiest cut by eye. Pain: short-lived branches can look real at one threshold. Invention: build a density hierarchy, condense small branches, and select stable clusters. Then trace lab, implementation sketch, hierarchy intuition, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `density-hierarchy` figure: three density levels with clusters and stability cards.
- `ClusteringAlgorithmLab` initial algorithm `hdbscan`: sweep density then condense tree.
- Contrast figure: differentiates HDBSCAN from DBSCAN and OPTICS.

## Formula And Notation

Use a plain-language display approximation for stable clusters rather than deriving stability integrals.

## Components And Tests

Use deterministic `hdbscanLevels`; no runtime model calls.

## Graph Placement

Add `dbscan -> hdbscan` as `generalizes` and `optics -> hdbscan` as `motivates`.

## Acceptance Criteria

Page must not claim HDBSCAN is parameter-free or merely automatic-`epsilon` DBSCAN.
