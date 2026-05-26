# UMAP Node Design

## Scope

Teach UMAP as fuzzy-neighbor-graph matching. Keep the topological formalism light; focus on local membership strengths, attraction, repulsion, and interpretation caveats.

## Frontmatter

- id: `umap`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `isomap`, `t-sne`
- next: []

## Teaching Arc

Start with t-SNE's useful local maps but expensive, interpretation-sensitive workflow. UMAP constructs a weighted neighbor graph, then optimizes a low-dimensional graph with similar edge memberships.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `graph-strip`: the whole cluster.
- `DimensionalityReductionLab` initialized to `umap`: fuzzy graph -> optimize.
- Connections compare Isomap's graph distances and t-SNE's neighbor probabilities.

## Formula Plan

Use "weighted k-neighbor graph" and "attraction plus repulsion" rather than a full cross-entropy derivation; deeper topology can be a future node.

## Acceptance Criteria

The node is bounded, practical, and clearly warns against over-reading cluster areas or axis meanings.
