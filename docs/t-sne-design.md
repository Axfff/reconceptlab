# t-SNE Node Design

## Scope

Teach t-SNE as SNE plus two practical repairs: symmetric pair probabilities and a heavy-tailed low-dimensional similarity. Avoid using it as a cluster-validity tool.

## Frontmatter

- id: `t-sne`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `sne`
- next: `umap`

## Teaching Arc

Begin with SNE's crowding problem: too many moderately distant high-dimensional neighbors compete for limited 2D area. t-SNE uses a Student-t tail so non-neighbors can move far apart.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `sne-neighbors`: neighbor probabilities.
- `DimensionalityReductionLab` initialized to `t-sne`: crowding -> heavy tail.
- Common-confusions section warns that visual cluster sizes and gaps are not reliable quantitative evidence.

## Formula Plan

Use `$q_{ij} \propto (1+\|y_i-y_j\|^2)^{-1}$` with a plain-language note: far points still have enough low-dimensional probability mass to be pushed apart.

## Acceptance Criteria

The page explains why t-SNE is good for local exploration but risky for reading global distances.
