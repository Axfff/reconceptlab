# K-Medoids Design

## Scope

Node id: `k-medoids`. Algorithm node contrasting medoids with K-Means centroids and focusing on real-example centers plus swap-based local improvement.

Non-scope: full PAM/CLARA/CLARANS taxonomy, proof of optimal medoid search hardness, and distance-metric design as a separate topic.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: intermediate`, prerequisite `k-means`, next `dbscan`, and Chinese `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: means can drift into empty space or toward outliers. Naive attempt: manually ignore outliers. Pain: manual exceptions are not repeatable. Invention: centers must be actual samples and swaps are accepted only when total distance falls. Then objective, trace lab, implementation sketch, local-search intuition, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `medoid-robustness` figure: representative medoids versus an outlier-as-medoid candidate with total distance cards.
- `ClusteringAlgorithmLab` initial algorithm `k-medoids`: exposes pick-medoid and test-swap states.
- Graph strip: places medoids after K-Means and before density methods.

## Formula And Notation

Use display formula `sum_i d(x_i, m_{c_i})`; explain `m_c` as the chosen real example for cluster `c`.

## Components And Tests

Reuse `centroidFixture` and `kMedoidsChoices`. Test verifies representative medoids are cheaper than using the outlier as a medoid.

## Graph Placement

Add `k-means -> k-medoids` as `contrasts`.

## Acceptance Criteria

Page makes the centroid/medoid distinction visible, keeps centers as real examples, and does not imply K-Medoids automatically solves model selection.
