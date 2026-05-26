# SNE Node Design

## Scope

Teach Stochastic Neighbor Embedding as matching high-dimensional and low-dimensional neighbor probabilities. Keep optimization details bounded and leave t-SNE's heavy-tail repair for its own node.

## Frontmatter

- id: `sne`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `isomap`, `qda`
- next: `t-sne`

## Teaching Arc

Start with a map where global distances are hard to preserve, but local neighborhoods matter. SNE converts distances into conditional probabilities and optimizes a map whose probabilities match.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `sne-neighbors`: local neighbor similarities.
- `DimensionalityReductionLab` initialized to `sne`: probabilities -> KL matching.
- Use t-SNE as the next repair for crowding.

## Formula Plan

Use `$p_{j|i}$` for high-dimensional neighbor probability and `KL(P || Q)` for mismatch.

## Acceptance Criteria

The node stresses local-neighborhood preservation and names crowding as the reason t-SNE follows.
