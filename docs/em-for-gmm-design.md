# EM For GMM Design

## Scope

Node id: `em-for-gmm`. Advanced probabilistic clustering node focused on Gaussian mixture soft membership and expectation-maximization updates.

Non-scope: full latent-variable derivation, covariance regularization, model selection criteria, and non-Gaussian mixture models.

## Frontmatter

English and Chinese pages use `conceptType: algorithm`, `difficulty: advanced`, prerequisite `k-means`, no next nodes, tags include `probability`, and Chinese `translationStatus: needs-review`.

## Teaching Arc

Concrete problem: boundary points can plausibly belong to multiple clouds. Naive attempt: assign each point to its most likely Gaussian. Pain: hard assignment discards uncertainty. Invention: responsibilities give fractional membership; M-step refits weighted Gaussian parameters. Then formula, trace lab, implementation sketch, local-likelihood intuition, cost, confusions, and exercises.

## Visual And Interactive Inventory

- `soft-membership` figure: final means, weights, and responsibility table.
- `ClusteringAlgorithmLab` initial algorithm `em-for-gmm`: E-step and M-step trace with means and weights.
- Graph strip: relates EM to K-Means and the wider clustering algorithm family.

## Formula And Notation

Use display formula for responsibility `r_ij` and explain numerator as component fit times mixture weight, denominator as normalization across components.

## Components And Tests

Use one-dimensional `emFixture` and deterministic `emTrace`. Test asserts responsibilities for every point sum to 1.

## Graph Placement

Add `k-means -> em-for-gmm` as `generalizes` because EM keeps alternating updates but replaces hard assignments with soft responsibilities.

## Acceptance Criteria

Page must clearly state EM for GMM is soft clustering, components can overlap, component count is preselected, and initialization matters.
