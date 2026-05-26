# MDS Node Redesign

## Node Identity

- Stable id: `mds`
- English route: `/en/nodes/mds`
- Chinese route: `/zh/nodes/mds`
- Topic: Multidimensional Scaling as distance-table-to-map reconstruction

## Scope

Teach MDS as the answer to a concrete problem: learners have pairwise dissimilarities but no useful coordinates, and they want a low-dimensional map whose visible distances imitate that table.

The page should make the learner feel the constraint conflict: placing one pair correctly is easy, but every point participates in many pairwise promises. MDS is the smallest useful invention that turns those promises into a single stress objective.

Use a concrete fixture throughout: five campus study spots labeled `Library`, `Lab`, `Cafe`, `Dorm`, and `Gym`. The input table `D` is their pairwise dissimilarity table, not original feature columns. Introduce table conventions early: values are nonnegative, symmetric, the diagonal is ignored or zero, each unordered pair is counted once with `i < j`, and "dissimilarity" is allowed even when the numbers are not a perfect geometric distance.

## Non-Scope

- Full eigendecomposition proof for classical MDS.
- SMACOF derivation or numerical optimization internals.
- Deep taxonomy of classical, metric, and nonmetric MDS.
- Manifold learning beyond the Isomap handoff.
- Runtime-generated or random visualization state.

Mention variants only to avoid confusion: classical MDS has a closed-form route for Euclidean distances, while metric and nonmetric variants optimize related stress ideas.

## Frontmatter

English:

```yaml
id: mds
locale: en
title: Multidimensional Scaling
summary: Build a low-dimensional map whose distances imitate an original pairwise-distance table.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: algorithm
tags:
  - machine-learning
  - dimensionality-reduction
  - distances
prerequisites:
  - pca
next:
  - isomap
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

Chinese:

```yaml
id: mds
locale: zh
title: 多维尺度分析
summary: 构造低维地图，让地图中的距离尽量模仿原始成对距离表。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: algorithm
tags:
  - machine-learning
  - dimensionality-reduction
  - distances
prerequisites:
  - pca
next:
  - isomap
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

## Teaching Arc

1. Hook problem: five objects have only a pairwise distance table. A learner needs a map, not a spreadsheet.
2. Table bridge: explain pairwise dissimilarity conventions before any formula or map. The table is fixed input `D`.
3. Naive attempt: place the closest pair first, then add more points by eye.
4. Pain: each new point changes several distance promises at once; local repairs create global distortion.
5. Core invention: give each item a low-dimensional point and minimize total distance mismatch, called stress.
6. Trace anchor: every figure uses the same deterministic fixture, so table entries, pair labels, residual bars, and lab steps agree.
7. Formal version: define original distances `$d_{ij}$`, map points `$y_i$`, map distances `$\delta_{ij}$`, signed residuals, and stress.
8. Implementation sketch: read or compute a distance matrix, initialize map coordinates, reduce stress, then inspect residual distortion.
9. Correctness intuition: all candidate layouts are judged against the same fixed table `D`; lower stress is better only under that chosen objective. The trace demonstrates a lower-stress layout, not global optimality or recovery of "the true axes".
10. Complexity: the distance table, residuals, and full stress scans are pairwise, so learners should expect quadratic scaling.
11. Graph connections: PCA contrasts with coordinate/variance preservation; Isomap reuses the MDS layout step after replacing raw distances with graph shortest paths.

## Visual And Interactive Inventory

All visual surfaces should share deterministic trace data from `src/components/interactive/mdsTrace.ts`.

### 1. Hook: Distance Table To Empty Map

Component: `MdsFigure` with `scenarioId="distance-table"`.

Learner question: "How can a table become a picture?"

Show the `Library`, `Lab`, `Cafe`, `Dorm`, `Gym` symmetric dissimilarity table beside an empty map canvas. Include row/column labels, a caption, and a short convention bridge: nonnegative entries, diagonal ignored/zero, symmetric lookups, and one unordered pair counted by `i < j`. This should be static because the section only introduces the input/output mismatch.

### 2. Naive Placement

Component: `MdsTraceLab` in constrained `mode="naive"` or a static `MdsFigure` trace snapshot.

Learner question: "Why not just draw the nearest pairs correctly?"

Step through only the naive flow: `distance table -> closest pair -> add more points -> conflict appears`. Do not expose the full residual/improvement lab yet. Highlight satisfied pairs and distorted pairs with both text labels and visual styling. Controls, if interactive: previous, next, reset.

### 3. Constraint Conflict

Component: `MdsFigure` with `scenarioId="constraint-conflict"`.

Learner question: "What exactly is fighting what?"

Use the same pair labels as the trace. Show that one pair wants to be close, another wants to be far, and a third is over-stretched by the naive layout.

Label the first visible map axes as layout coordinates, for example `layout x` and `layout y`, so learners do not read them as original measured features.

### 4. Stress As Accumulated Mismatch

Component: `MdsFigure` with `scenarioId="stress-bars"`.

Learner question: "What does stress count?"

Compare naive and improved layouts with per-pair residual bars. Show original distance, map distance, residual, and squared contribution for representative pairs.

Pin the residual convention in the visual: `residual = map distance - target distance`. Positive means the map is too far or overstretched; negative means the map is too close or compressed.

### 5. Master Trace Lab

Component: `MdsTraceLab`.

Learner question: "How does the whole MDS idea move from table to lower-stress map?"

Steps:

1. Read pairwise distances.
2. Start from a rough layout.
3. Inspect pair residuals.
4. Move to a lower-stress layout.
5. Accept remaining distortion.

Expose current step text, total stress, selected residual rows, and the current layout. This later lab owns the full table -> residuals -> improved layout flow. It should be deterministic and should not simulate random optimization.

### 6. Formal Notation Pipeline

Component: `MdsFigure` with `scenarioId="notation-pipeline"`.

Learner question: "Which symbol names which object?"

Show `D -> Y -> delta -> residual -> stress` as a compact pipeline. Use it next to the formulas so symbols do not float away from the visual.

### 7. Implementation State Table

Use a small table in MDX or `MdsFigure` if shared rendering is cleaner.

Learner question: "What state does an implementation carry?"

Rows: distance matrix `D`, current coordinates `Y`, residuals, total stress, stopping/inspection.

### 8. Residual Inspector And Correctness Intuition

Component: `MdsResidualInspector`.

Learner question: "How can a map be useful if some pairs are still wrong?"

Allow the learner to select a pair. Show original distance, map distance, signed residual, squared contribution, and plain-language interpretation. The selected state must be visible in text, not color alone.

Repeat the invariant: every candidate layout is scored against the same fixed `D`. Lower stress means better fit to this objective, not proof that the displayed layout is globally optimal. The improved fixture should still contain at least one visible nonzero residual.

### 9. Cost Figure

Component: `MdsFigure` with `scenarioId="cost"`.

Learner question: "Why does MDS get expensive?"

Cards: store/read `D`, initialize `Y`, evaluate all pairs, update/inspect. Pair this with `$O(n^2)$` storage and `$O(n^2 k)$` full stress evaluation.

State the rough optimization cost as `T` evaluations or updates, each dominated by pairwise work. Mention that classical MDS can require eigendecomposition and may be more expensive than a single stress scan.

### 10. Common Confusions

Use concise cards in MDX or a lightweight figure.

Required confusions:

- Axes are map coordinates, not necessarily original features.
- Low stress is not the same as zero stress.
- MDS preserves pairwise distances, while PCA preserves high-variance coordinate directions.
- Classical, metric, and nonmetric MDS differ in solver or distance interpretation, but this node focuses on the shared distance-preserving idea.

### 11. Graph Connections

Keep `DimensionalityReductionFigure` with `scenarioId="graph-strip"` or use a concise MDS-specific card strip. Include explicit prose links to PCA and Isomap.

## Formula And Notation Plan

Inline formulas:

- `$D$`: original pairwise-distance table.
- `$d_{ij}$`: original target dissimilarity or distance between item `i` and item `j`.
- `$Y$`: reconstructed map coordinates.
- `$y_i$`: map point for item `i`.
- `$r_{ij}$`: signed residual for pair `i, j`.
- `$n$`: number of items.
- `$k$`: output dimension.

Display formula for map distance:

```tex
\delta_{ij} = \lVert y_i - y_j \rVert_2
```

Plain-language explanation: `$\delta_{ij}$` is the distance the reconstructed map shows for the same pair.

Display formula for signed residual:

```tex
r_{ij} = \delta_{ij} - d_{ij}
```

Plain-language explanation: positive residual means the map places the pair too far apart, and negative residual means the map compresses the pair too close together.

Display formula for stress:

```tex
\text{stress}(Y) = \sum_{i<j}(\delta_{ij} - d_{ij})^2
```

Plain-language explanation: every unordered pair contributes one squared mismatch; MDS searches for coordinates where the total mismatch is small for the chosen fixed table `D`.

Optional normalized stress may be shown only in the residual inspector if needed:

```tex
\frac{\sum_{i<j}(\delta_{ij}-d_{ij})^2}{\sum_{i<j}d_{ij}^2}
```

Do not derive classical MDS. Name it only as a related solver path.

## Components And State Model

Add:

- `src/components/interactive/mdsTrace.ts`
- `src/components/interactive/MdsFigure.tsx`
- `src/components/interactive/MdsTraceLab.tsx`
- `src/components/interactive/MdsResidualInspector.tsx`

Expected trace exports:

- `mdsItems`
- `mdsTargetDistances`
- `mdsNaiveLayout`
- `mdsImprovedLayout`
- `mdsTraceSteps`
- `canonicalPairKey(leftId, rightId)`
- `targetDistance(leftId, rightId)`
- `mapDistance(layout, leftId, rightId)`
- `pairResiduals(layout)`
- `stress(layout)`
- `residualForPair(layout, leftId, rightId)`
- `formatMdsNumber(value, lang)`

Trace expectations:

- Use the five fixture items `Library`, `Lab`, `Cafe`, `Dorm`, and `Gym` so the table is readable and memorable.
- Store pair distances once with canonical unordered keys, for example `Library|Lab` after sorting ids by the fixture order.
- Support lookup as both `(i, j)` and `(j, i)` while returning the same canonical pair row.
- Keep pair order deterministic by fixture order and `i < j`.
- Derive all residuals with `residual = mapDistance - targetDistance`.
- Ensure improved layout stress is lower than naive layout stress.
- Include at least one residual that remains nonzero in the improved layout, so "better" does not imply perfect.

## Test Expectations

Add `tests/mds-trace.test.ts` covering:

- Pair count is `n * (n - 1) / 2`.
- The conceptual distance table is nonnegative, has ignored/zero diagonal behavior by convention, and is symmetric by lookup helper.
- Canonical pair keys follow fixture order, count each unordered pair once with `i < j`, and lookup works for both `(i, j)` and `(j, i)`.
- `mapDistance` is deterministic.
- `pairResiduals` are sorted consistently.
- Residual sign follows `map distance - target distance`; positive rows are interpreted as too far/overstretched and negative rows as too close/compressed.
- Improved layout stress is lower than naive layout stress, while at least one improved residual remains nonzero.
- `stress(layout)` scores against the fixed table `D`; tests should assert trace improvement, not global optimality.
- `residualForPair` returns target distance, map distance, signed residual, and squared contribution.
- `mdsTraceSteps` include English and Chinese text.

Existing validation tests should not need schema changes unless content fixtures require another sample entry.

## Graph Placement

Keep the existing `mds` graph node near PCA and Isomap.

Update edge reasons if helpful:

- `pca -> mds`, type `contrasts`
  - EN: "PCA starts from coordinates and preserves high-variance directions, while MDS starts from pairwise distances and preserves distance relationships."
  - ZH: "PCA 从坐标出发并保留高方差方向，而 MDS 从成对距离出发并保留距离关系。"
- `mds -> isomap`, type `generalizes`
  - EN: "Isomap keeps MDS's distance-table-to-map step but replaces raw distances with neighbor-graph shortest-path distances."
  - ZH: "Isomap 保留 MDS 的距离表到地图步骤，但用邻居图最短路距离替代原始距离。"

Do not add edges to nodes that do not already have content.

## Accessibility And Mobile Requirements

- SVGs must have localized `role="img"` and `aria-label`.
- Tables need captions and scoped headers.
- Controls must be buttons with clear labels, disabled states where appropriate, and visible selected/current state.
- Do not rely on color alone; pair status must also appear as text such as "close enough", "overstretched", or "too short".
- Mobile layout should stack explanation, visual, controls, residual table, and current-state text.
- Avoid horizontal overflow in tables and formulas; the existing layout can scroll formulas when needed.
- Chinese text must stay concise and keep `translationStatus: needs-review`.

## Acceptance Criteria

- English and Chinese MDS pages follow the full problem -> naive attempt -> pain -> invention -> formal -> implementation -> correctness -> complexity -> connections arc.
- Visual support appears near each major learner question, not only in one lab.
- All new MDS visuals share deterministic trace data.
- The node stays bounded to distance-table-to-map reconstruction.
- Graph edges remain localized and valid.
- Chinese page keeps `translationStatus: needs-review`.
- `npm run check`, `npm run test`, and `npm run build` pass when practical.
