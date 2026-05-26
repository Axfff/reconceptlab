# LDA Node Design

## Scope

Teach Linear Discriminant Analysis as supervised projection for class separation. Keep the classifier generative model secondary; focus on between-class versus within-class scatter.

## Frontmatter

- id: `lda`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `pca`
- next: `qda`

## Teaching Arc

Begin with labeled points where high variance is not the same as good class separation. PCA ignores labels and can keep the wrong direction. LDA uses labels to find a projection that separates class means while keeping each class tight.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `lda-qda-boundary`: shared projection and QDA contrast.
- `DimensionalityReductionLab` initialized to `lda`: labels -> scatter ratio.
- A nearby formula card explains the ratio.

## Formula Plan

Use `\max_w \frac{w^T S_B w}{w^T S_W w}` and explain `S_B` as between-class scatter and `S_W` as within-class scatter.

## Acceptance Criteria

The page clearly says LDA is supervised and not a replacement for unsupervised PCA.
