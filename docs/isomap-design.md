# Isomap Node Design

## Scope

Teach Isomap as "MDS after replacing straight distances with neighbor-graph shortest paths." Keep manifold learning intuition concrete; defer topology assumptions and proofs.

## Frontmatter

- id: `isomap`
- conceptType: `algorithm`
- difficulty: `intermediate`
- prerequisites: `mds`
- next: `sne`, `umap`

## Teaching Arc

Start with a curved surface where straight-line distance cuts through the fold. MDS on raw distances flattens incorrectly. Isomap builds a local neighbor graph, measures shortest paths, then lays out those geodesic distances.

## Visuals And Interaction

- `DimensionalityReductionFigure` with `isomap-geodesic`: shortcut versus neighbor walk.
- `DimensionalityReductionLab` initialized to `isomap`: neighbors -> geodesic -> MDS.
- Graph-strip visual near connections.

## Formula Plan

Use `$D_{geo}(i,j)$` for graph shortest-path distance and `$MDS(D_{geo})$` for the final layout step.

## Acceptance Criteria

The page distinguishes Euclidean shortcuts from graph geodesics and avoids dangling graph edges.
