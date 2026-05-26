# QDA Node Design

## Scope

Teach Quadratic Discriminant Analysis as the supervised contrast to LDA when class covariance shapes differ. Be explicit that QDA is primarily a classifier, not a standard dimensionality-reduction projection.

## Frontmatter

- id: `qda`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `lda`
- next: `sne`

## Teaching Arc

Start where LDA's single shared covariance shape is too rigid. QDA lets each class keep its own covariance, so the boundary bends. The learning goal is to understand the assumption repair and the risk of overfitting.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `lda-qda-boundary`: linear versus curved boundary.
- `DimensionalityReductionLab` initialized to `qda`: shared covariance breaks -> quadratic boundary.
- Graph-strip connection to neighbor embeddings.

## Formula Plan

Use the discriminant score `\log p(x\mid c)+\log p(c)` and the phrase "one covariance matrix per class."

## Acceptance Criteria

The page does not falsely present QDA as a mainstream dimensionality-reduction algorithm; it explains why it appears in this requested cluster.
