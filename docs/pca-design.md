# PCA Node Redesign

## Design Status

- Node id: `pca`
- Expected routes: `/en/nodes/pca/`, `/zh/nodes/pca/`
- Phase: accepted for implementation after design review
- Review loop: pending

## Scope

Teach Principal Component Analysis as the smallest useful repair for a data table where several measurements move together along a few linear directions. The learner should feel why dropping raw columns is wasteful, then see PCA as "center, rotate toward maximum variance, keep the first rotated coordinates."

Include:

- A concrete table with correlated measurements.
- Why dropping one raw feature is not the same as choosing the best direction.
- Centering before measuring spread.
- Maximum projected variance and principal directions.
- Projection, approximate reconstruction, explained variance, and basic complexity.
- PCA's limits: unsupervised, linear, sensitive to feature scaling, and not a curved-manifold method.

Do not include:

- Full eigendecomposition proof.
- Whitening, kernel PCA, probabilistic PCA, or randomized SVD internals.
- A linear algebra chapter on eigenvectors or covariance.
- Detailed manifold-learning treatment beyond links to existing nodes.
- Supervised dimensionality reduction beyond a short LDA contrast.

## Proposed Frontmatter

English:

```yaml
id: pca
locale: en
title: Principal Component Analysis
summary: Compress a data table by rotating centered data toward the directions where it varies most.
status: draft
translationStatus: source
difficulty: beginner
conceptType: algorithm
tags:
  - machine-learning
  - dimensionality-reduction
  - linear-algebra
prerequisites:
  - feature-map
next:
  - mds
  - lda
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

Chinese:

```yaml
id: pca
locale: zh
title: 主成分分析
summary: 通过把中心化数据旋转到变化最大的方向，压缩一张数据表。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: algorithm
tags:
  - machine-learning
  - dimensionality-reduction
  - linear-algebra
prerequisites:
  - feature-map
next:
  - mds
  - lda
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

## Teaching Arc

1. Start with a small dataset of measurements where `height` and `arm span` mostly move together and a third measurement is quieter.
2. Try the naive repair: drop one column or keep the column with the largest spread.
3. Show the pain: the signal is diagonal, so neither original column is the best one-dimensional summary.
4. Introduce PCA: center the cloud, measure spread along candidate directions, rotate to the direction with maximum variance, and keep the leading coordinates.
5. Connect the picture to notation only after the learner has seen the state changes.
6. Show implementation state: raw table -> centered table -> covariance/variance summary -> components -> projected codes -> reconstruction.
7. State the invariant: after centering, PC1 maximizes projected variance; later PCs are orthogonal and capture the largest remaining variance.
8. Explain the cost in terms of rows `n`, features `d`, and kept components `k`.
9. Close with confusions, graph connections, and prediction questions.

## Section-by-Section Visual Inventory

Every section should either include a visual/widget or explain why prose is enough.

1. Hook problem: use `PcaSupportFigure` with scenario `correlated-table`. Show a tiny table and the same points in a scatter plot. Learner question: "Why does this table feel bigger than the actual pattern?"
2. Naive idea: use `PcaSupportFigure` with scenario `drop-column-loss`. Compare keeping `height`, keeping `arm span`, and keeping the diagonal mixture with retained-variance bars. Learner question: "Why does choosing one raw column miss shared movement?"
3. Pain and invention: use `PcaSupportFigure` with scenario `tilted-axis`. Show original axes, candidate diagonal axis, projected ticks, and the PC1 label. Learner question: "What does a rotated coordinate mean?"
4. Centering: use `PcaCenteringFigure`. Toggle raw/centered state, show mean vector and mean-after-centering output. Learner question: "Why subtract the mean before measuring spread?"
5. Feature scaling caution: use `PcaSupportFigure` with scenario `scale-sensitivity`. Show the same centered pattern twice: once in original units, once with one feature rescaled. Label the larger-scale axis and show PC1 rotating toward it. Learner question: "Why can changing units change what PCA thinks is important?"
6. Variance sweep: use `PcaVarianceSweep`. Provide a labeled range input plus step buttons for candidate directions, projection ticks, variance readout, and a PC1 badge at the maximum. Learner question: "How does PCA choose the first direction?"
7. Formal notation: use `PcaProjectionEquationFigure`. Show the pipeline `X -> X_c -> W_k -> Z -> reconstructed X` with formula labels. Learner question: "Which object is data, direction, code, and reconstruction?"
8. Trace lab: use PCA-specific `PcaTraceLab`, not the all-method dimensionality-reduction lab. Steps: raw table, center, covariance/variance, choose components, project, reconstruct. Controls: previous, next, reset, and a `keep 1` / `keep 2` toggle. Learner question: "What state changes at each algorithm step?"
9. Implementation sketch: pair a code block with a compact state table. No extra widget needed because the trace lab directly precedes it.
10. Correctness intuition: use `PcaReconstructionToggle`. Compare dropping raw `height`, dropping raw `arm span`, keeping PC1, and keeping PC1+PC2 with reconstruction-error bars. Learner question: "Why does maximum variance relate to squared reconstruction error?"
11. Complexity: use `PcaCostFigure`. Cards for centering, covariance, eigendecomposition/SVD, selecting components, and projection. Learner question: "Which step becomes expensive as `n` or `d` grows?"
12. Common confusions: use `PcaMisconceptionCards`. Cards for labels, sign flips, high variance vs prediction, curved manifolds, and feature scaling. Learner question: "What should I not over-read from PCA?"
13. Connections: use the existing `DimensionalityReductionFigure` `graph-strip` plus short text links to `feature-map`, `mds`, and `lda`.

## Formula And Notation Plan

Add a short beginner vocabulary bridge before formulas and before symbols become dense. Keep it plain, visual, and local to PCA:

- Variance: "how spread out the projected dots are." Visual label: `spread along this line`.
- Unit direction: "an arrow with length 1, so long arrows do not win just because they are longer." Visual label: `unit direction w`.
- Projection: "the shadow a point makes on a chosen line." Visual label: `projected coordinate`.
- Orthogonal: "at a right angle; later components must look in a new right-angle direction." Visual label: `90 degrees from PC1`.
- Covariance: "a summary of which feature values rise and fall together." Visual label: `move together summary`.
- Eigenvector: "a direction that covariance stretches without turning." Visual label: `stable direction`.
- Linear mixture: "a new feature made by adding weighted old features, such as some height plus some arm span." Visual label: `rotated feature = weighted mix`.

Introduce notation in words after that bridge and before formulas:

- `n`: number of rows/items.
- `d`: number of original features.
- `k`: number of components kept.
- `X`: raw data matrix with shape `n x d`.
- `mu`: feature-mean vector.
- `X_c`: centered data matrix.
- `W_k`: the first `k` principal directions.
- `Z`: compressed coordinates.

Use formulas near their visuals:

```tex
X_c = X - \mathbf{1}\mu^T
```

Plain meaning: subtract each feature average so PCA studies spread around the cloud center.

```tex
C = \frac{1}{n}X_c^T X_c
```

Plain meaning: covariance summarizes how features vary together. Mention that some libraries use `1/(n-1)` without changing the direction story here.

```tex
\max_{\lVert w\rVert=1}\operatorname{Var}(X_cw)
= \max_{\lVert w\rVert=1} w^T Cw
```

Plain meaning: try unit directions and choose the one where projected points are most spread out.

```tex
Cw_j = \lambda_j w_j
```

Plain meaning: each principal direction is a stable covariance direction; `lambda_j` is the variance carried by that direction.

```tex
Z = X_c W_k
```

Plain meaning: replace each row with coordinates along the kept directions.

```tex
\hat X = ZW_k^T + \mu
```

Plain meaning: expand the compressed coordinates and add the mean back to approximate the original table.

```tex
\text{explained variance ratio}_j = \frac{\lambda_j}{\sum_i \lambda_i}
```

Plain meaning: the share of total spread captured by component `j`.

## Complexity Plan

State costs with `n` rows, `d` original features, and `k` kept components:

- Centering: $O(nd)$ because every table entry is touched once to subtract its feature mean.
- Covariance: $O(nd^2)$ because every pair of features must be compared across the rows.
- Eigendecomposition of the full `d x d` covariance matrix: $O(d^3)$, usually the expensive part when there are many features.
- Projection to kept components: $O(ndk)$ because each row is multiplied by `k` component directions.

Plain-language interpretation: more rows mainly make the scanning and projection steps longer; more features can make the covariance and full eigendecomposition steps grow much faster. Note that practical PCA libraries may use SVD directly on the centered matrix, truncated SVD, or randomized methods, which change the exact cost profile while preserving the same teaching story for this node.

## Components And State Model

Add PCA-specific helpers and components under `src/components/interactive/`:

- `pcaTrace.ts`
- `PcaSupportFigure.tsx`
- `PcaCenteringFigure.tsx`
- `PcaVarianceSweep.tsx`
- `PcaProjectionEquationFigure.tsx`
- `PcaTraceLab.tsx`
- `PcaReconstructionToggle.tsx`
- `PcaCostFigure.tsx`
- `PcaMisconceptionCards.tsx`

Use one deterministic fixture across all PCA visuals. The fixture should make the leading component easy to inspect and should compute actual 2D PCA quantities rather than treating `(x + y) / sqrt(2)` as a hidden constant unless the fixture is deliberately symmetric.

Fixture conventions to make tests and visuals unambiguous:

- Store raw fixture points in original units. Helpers that need centered data should center internally unless their name explicitly says `Centered`.
- `varianceAlongDirection(points, degrees)` accepts raw points, centers them before computing variance, and interprets `degrees` as counterclockwise degrees from the positive x-axis.
- Normalize sweep angles modulo 180 degrees, not 360, because a PCA direction and its opposite represent the same component line.
- Canonicalize each principal component sign so the largest-magnitude coordinate is positive; if coordinates tie exactly, choose the sign with positive x.
- Avoid fixtures with ties or near-symmetry. PC1 should be visibly diagonal but not exactly 45 degrees, and the two eigenvalues should differ enough that small floating-point changes do not flip the chosen component.
- Use population covariance with `1/n` consistently for implementation and tests unless a helper name documents otherwise. If the page mentions library differences, keep the visual numbers from the site helper.
- Reconstruction-error comparisons should use the centered, unstandardized fixture data. The scaling caution is a separate visual, not the basis for the default error bars.

Reconstruction baselines:

- `keep raw height`: keep the original `height` column and reconstruct discarded columns with their feature means.
- `keep raw arm span`: keep the original `arm span` column and reconstruct discarded columns with their feature means.
- `keep PC1`: project centered rows to PC1, reconstruct through `ZW_k^T + mu`, and compare with the raw table after adding the mean back.
- `keep PC1+PC2`: same reconstruction path with two components.
- Squared reconstruction error is the sum or mean of squared differences in the original centered, unstandardized feature space. The UI should state which aggregate it shows and use that aggregate consistently.

Suggested helper exports:

- `pcaPoints`
- `centerPcaPoints(points)`
- `pcaMean(points)`
- `covariance2d(points)`
- `principalComponents2d(points)`
- `projectOntoDirection(point, direction)`
- `varianceAlongDirection(points, degrees)`
- `varianceSweep`
- `reconstructionComparisons`
- `pcaTraceSteps`

## Tests

Add focused tests in `tests/pca-trace.test.ts`:

- Centered means are approximately zero.
- Covariance values are deterministic.
- Principal components are orthonormal.
- PC1 variance is greater than the raw-column alternatives for the fixture.
- The sweep maximum matches the computed PC1 direction within a small angular tolerance.
- Projection and reconstruction comparisons are deterministic.
- PC1 reconstruction error is lower than dropping either correlated raw feature for the fixture.
- Trace steps have English and Chinese titles/explanations.

Existing `tests/dimensionality-reduction-trace.test.ts` may keep its broad shared-trace check.

## Accessibility And Mobile Requirements

- SVGs need localized `role="img"` and `aria-label`.
- Controls need visible labels, keyboard-operable buttons/range inputs, `aria-pressed` on toggles, and disabled states where relevant.
- Every color-coded state also needs text, shape, label, or numeric output.
- Respect reduced motion by making state transitions instant.
- Use stable panel dimensions so stepping does not resize the layout unexpectedly.
- On narrow screens, stack explanation/state text before visuals, then metrics, then controls.
- Keep long formulas scroll-safe and wrap labels cleanly in Chinese.
- Chinese first-use terms should be bilingual: `主成分（principal component）`, `协方差（covariance）`, `投影（projection）`.

## Graph Placement

Keep existing graph node position. Update `src/data/graph.ts` only if the PCA node or these exact existing edge reasons need to be added or aligned during implementation; do not otherwise change unrelated graph topology. Keep graph edges only to existing nodes:

- `feature-map -> pca`, `motivates`
  - en: "Feature maps show that a representation can rewrite inputs; PCA learns a linear representation from the data itself."
  - zh: "特征映射说明输入可以被改写成新的表示；PCA 则从数据本身学到一个线性表示。"
- `pca -> mds`, `contrasts`
  - en: "PCA preserves coordinate variance after rotation, while MDS starts from pairwise distances and tries to preserve those distances."
  - zh: "PCA 在旋转后保留坐标方差，而 MDS 从成对距离出发并尝试保留这些距离。"
- `pca -> lda`, `contrasts`
  - en: "PCA ignores labels and keeps high-variance directions; LDA uses labels to keep directions that separate classes."
  - zh: "PCA 忽略标签并保留高方差方向；LDA 使用标签来保留能分开类别的方向。"

Do not add new PCA edges to future or absent nodes.

## Acceptance Criteria

- English and Chinese PCA pages follow the concrete problem -> naive attempt -> pain -> invention -> formalization arc.
- Chinese page keeps `translationStatus: needs-review`.
- Multiple local visuals/widgets support the page; the trace lab is not the only visual surface.
- The same deterministic fixture appears across the table, centering, variance sweep, projection, and reconstruction explanations.
- Formulas appear after intuition and each important formula has a plain-language explanation.
- The page explicitly states PCA is unsupervised, linear, sensitive to scaling, and not a manifold-unfolding method.
- Graph edges only target existing nodes and have localized reasons.
- PCA trace helpers have deterministic tests.
- Components are keyboard accessible, mobile-friendly, and avoid color-only meaning.
- Final validation should run, when practical: `npm run check`, `npm run test`, `npm run build`.
