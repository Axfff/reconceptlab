# Closest Pair Divide and Conquer Node Design

## Node Scope

`closest-pair-divide-and-conquer` stays a coarse-grained algorithm node for finding the closest pair of 2D points by combining divide and conquer with a grid-based cross-boundary merge.

In scope:

- Why checking all pairs is correct but too slow.
- Splitting points by `x` coordinate and recursively solving the left and right halves.
- Using `r = min(rLeft, rRight)` as the threshold after recursion.
- Making the packing invariant explicit: after the recursive calls, neither half contains a same-side pair closer than `r`, so a small grid window can contain only a constant number of relevant candidates from each side.
- Showing that any better pair must cross the split and have distance less than `r`.
- Using grid cells of side `r / sqrt(2)` so the cross-boundary search checks a fixed local cell window, then distance-filters the actual pairs.
- Explaining the packing idea visually without splitting it into a separate lemma node yet.
- Sharing one deterministic trace across section figures, micro-widgets, and the master demo.

Out of scope for this node:

- Plane-sweep closest pair.
- Dynamic closest pair.
- Higher-dimensional closest pair.
- A full proof of randomized hashing or deterministic dictionary variants.
- Separate nodes for Euclidean distance, packing lemma, hash grids, or recursion trees until multiple pages reuse them.

## Proposed Frontmatter

English page:

```yaml
id: closest-pair-divide-and-conquer
locale: en
title: Closest Pair by Divide and Conquer
summary: Find the nearest two points faster than checking every pair by combining recursion with a local grid search across the split.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: algorithm
tags:
  - geometry
  - algorithms
  - divide-and-conquer
prerequisites: []
next:
  - graham-scan
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

Chinese page:

```yaml
translationStatus: needs-review
title: 分治法求最近点对
summary: 结合递归和分割线附近的局部网格搜索，比枚举所有点对更快地找到最近的两个点。
```

## Teaching Arc

1. Hook problem: many map points, find the nearest two.
2. First naive idea: compare every pair.
3. Where it breaks: a best-so-far distance can reject a known far pair after you compare it, but a plain list still has no cheap way to find only the points that might be nearby.
4. Core invention: recursion handles same-side pairs; the threshold band limits possible cross-boundary winners, then a local grid organizes the remaining band points.
5. Interactive visual demo: step through one merge level with split, `r`, threshold band, grid window, active cell, candidate pairs, and final winning cross pair.
6. Formal version: define `P`, `PL`, `PR`, `rLeft`, `rRight`, `r`, and unresolved cross candidates.
7. Implementation sketch: recursive skeleton plus `closestCrossPair`.
8. Correctness intuition: every pair is same-side or cross-side; grid filtering removes only pairs that cannot beat `r`.
9. Complexity: sort by `x` once up front, carry ordered lists through recursion, use expected `O(1)` hash-grid lookups, and get `T(n) = 2T(n / 2) + O(n)`, so expected `O(n log n)`.
10. Common confusions: grid is not the whole algorithm, boundary cells, ties, duplicates, expected-time hash table assumption.
11. Connections in the graph: contrast with Graham Scan.
12. Exercises: predict checked cells, explain why same-side pairs are not revisited, and vary `r`.

## Section-Level Visual Inventory

Every major section should have a nearby visual unless the visual would duplicate a stronger adjacent widget.

| Priority | Page section | Support | Learner question answered |
|---|---|---|---|
| P0 | Hook problem | Static scatterplot with all points and no final pair revealed yet; a later reveal state can highlight the answer. | What is the concrete problem before any algorithm appears? |
| P0 | First naive idea | Pair-count micro-table for `n = 5`, `20`, `1,000`, plus a sampled checked-pair highlight on the scatterplot. | Why does all-pairs checking become painful? |
| P0 | Where it breaks | Radius-`r` local-neighborhood visual: one active point, a known far pair rejected only after comparison, and the missing "find nearby candidates" query made explicit. | Why does a best-so-far distance help conceptually but not yet operationally? |
| P0 | Core invention | Trace-linked figure showing split line, `rLeft`, `rRight`, chosen `r`, and solved same-side pairs. Include a small table that states the packing invariant: each half has no same-side pair closer than `r`, so each small cell/window can hold only constant relevant candidates. | Why does recursion create a useful threshold and local occupancy bound? |
| P0 | Recursion/base case | Compact recursion-row figure: full set splits into left/right halves, `n <= 3` leaves use brute force, and the merge receives two already-solved halves. | Why is this a divide-and-conquer algorithm before any grid appears? |
| P0 | Threshold band | Separate band visual before any grid is shown: outside-band cross pairs cannot beat `r`, inside-band pairs still need organization. | Why is the band a filter, not the whole merge algorithm? |
| P0 | Grid merge | Static or stepped grid figure with cell side `r / sqrt(2)`, occupied cells, one active cell, and neighbor offsets `dx,dy in [-2,2]` highlighted before distance filtering. Add a section-level "cell distance ruler" / active-neighbor figure showing why offsets with `abs(dx) >= 3` or `abs(dy) >= 3` cannot contain strict improvements. | How does the grid turn cross checking into local checking without relying on only 8 adjacent cells? |
| P0 | Interactive visual demo | `ClosestPairDemo` with Step, Reset, mode toggle for `All cross pairs` / `Band only` / `Grid window`, passive active-window highlighting, counters, and candidate categories. | What changes when the merge uses the band and grid instead of all left-right pairs? |
| P1 | Formal version | Pair-classification table: left-left, right-right, cross; solved vs unresolved. | Are any possible pairs accidentally ignored? |
| P1 | Implementation sketch | Code-to-trace table mapping `sortByX once`, recursive calls with carried order, `n <= 3` brute force, `r`, band filter, grid build, neighbor checks, and final return. Keep this as a section-level widget or figure, not a master-demo feature. | Which code line corresponds to which visual state? |
| P1 | Correctness intuition | Before/after candidate-filter diagram: same-side-already-solved, outside-band, outside-neighbor-window, checked-loses, and checked-wins. | Why is it safe to skip distant cross pairs? |
| P1 | Complexity | Recursion tree with `O(n)` expected merge work per level, no per-level re-sort, and `log n` levels. | Where does expected `O(n log n)` come from? |
| P1 | Common confusions | Mini-cards for boundary cell assignment, tied distances, and duplicate coordinates. | Which implementation conventions avoid ambiguous behavior? |
| P2 | Exercises | Prediction micro-widgets: choose neighbor cells, choose the winning pair, and compare all-pairs vs grid counts. | Can the learner apply the trace logic without being told? |

## Deterministic Trace Fixture

Use one math-space point set for the main story. Coordinates use ordinary geometry axes with `y` increasing upward; SVG renderers should invert `y` for screen space.

```ts
points = [
  { id: "A", x: 0.8, y: 5.2 },
  { id: "B", x: 1.6, y: 1.2 },
  { id: "C", x: 2.4, y: 3.7 },
  { id: "D", x: 3.6, y: 6.0 },
  { id: "E", x: 4.2, y: 2.2 },
  { id: "F", x: 4.6, y: 4.1 },
  { id: "G", x: 5.3, y: 4.0 },
  { id: "H", x: 5.8, y: 2.8 },
  { id: "I", x: 6.7, y: 5.9 },
  { id: "J", x: 7.5, y: 1.5 },
  { id: "K", x: 8.2, y: 4.6 },
  { id: "L", x: 9.1, y: 2.3 }
];
```

Fixture expectations:

- Split line: `splitX = 5.0`, with `A` through `F` on the left and `G` through `L` on the right.
- The recursive mechanics shown in the page should split by `x`-sorted order, use brute force for `n <= 3`, and carry precomputed sorted orders through recursion so readers do not think the implementation re-sorts from scratch at each level.
- Left recursive closest pair: `E-F`, distance about `1.94`.
- Right recursive closest pair: `G-H`, distance about `1.30`.
- Merge threshold: `r = dist(G, H)`.
- Packing invariant after recursion: no pair entirely inside the left half and no pair entirely inside the right half is closer than `r`. The grid occupancy explanation depends on this invariant; it is not merely a geometric claim about arbitrary points.
- Grid cell side: `r / sqrt(2)`, about `0.92`.
- Main story grid origin: `{ x: 0, y: 0 }`. Keep this origin pinned in fixtures, exported trace metadata, and determinism tests so cell ids do not drift when render bounds change.
- Final closest pair: cross-boundary pair `F-G`, distance about `0.71`.
- Tempting but losing cross pairs include `E-H` and `F-H`; they help show why candidate checks still compare distances.
- A separate edge-case fixture should cover exact grid-boundary assignment, ties, and duplicate coordinates without cluttering the main trace.

Grid and comparison conventions:

- Run duplicate-coordinate detection before grid construction. If any two point ids have identical coordinates, return that pair with distance `0`; otherwise `cellSize = r / sqrt(2)` is well-defined.
- Assign cells with half-open intervals `[origin + k * cellSize, origin + (k + 1) * cellSize)`, using `Math.floor((coord - origin) / cellSize)`. Points exactly on a positive grid boundary go to the cell on the right or above.
- Store all threshold-band points in the grid with a side label (`left` or `right`). The merge trace may inspect all occupied cells, but it must emit and count candidate pairs only when the two points are on opposite sides of the split. Same-side pairs are already handled by recursion and must not be rechecked during merge comparisons.
- Iterate active points from the left side only, in stable `x`-sorted order with point id as a tie-breaker. For each active left point, inspect right-side points in the configured neighboring cells in stable cell-offset order, then stable point-id order.
- Canonicalize every emitted pair as lexicographic point-id pair order, dedupe before counting, and test the exact emitted order. This prevents the same cross pair from appearing once as `F-G` and later as `G-F`, and prevents candidate-count drift if the grid traversal changes.
- Search a safe fixed neighbor window for each active cell: `dx,dy in [-2,2]`. This deliberately avoids implying that only the 8 adjacent cells are enough when the cell side is `r / sqrt(2)`.
- Explain the window with direct cell geometry: with `cellSize = r / sqrt(2)`, offsets with `abs(dx) >= 3` or `abs(dy) >= 3` have minimum coordinate separation of at least `2 * cellSize`, and `2 * cellSize > r`, so they cannot contain a strict improvement. The `[-2,2]` window may include extra cells; keep the Euclidean distance check as the final filter.
- After collecting points from the fixed window, still compute Euclidean distance and keep only pairs with distance `< r` as strict improvements. Pairs with distance `>= r` are checked losses.
- Ties at exactly `r` do not replace the current best pair. If several strict improvements have the same distance, keep a deterministic tie-breaker such as lexicographic point-id pair order.
- Include a boundary-crossing test where points in cells separated by more than immediate adjacency can still be within the safe `[-2,2]` window, and verify that the distance filter decides the result.

Golden trace expectations:

- The trace module should export canonical golden arrays/counts before UI implementation proceeds.
- `allCrossPairs`: every left-right pair across the split, expected count `6 * 6 = 36`.
- `bandOnlyCrossPairs`: `E-G`, `E-H`, `F-G`, `F-H`, expected checked count `4`.
- `gridWindowCrossPairs`: `E-G`, `E-H`, `F-G`, `F-H`, expected checked count `4` for the current fixture and `[-2,2]` window. The grid mode is still useful because it demonstrates the local lookup rule that keeps this count constant as the band grows.
- `activeFGridWindowPairs`: `F-G`, `F-H`, in that order.
- Emitted cross-pair order is left-active order, then neighbor-cell offset order, then right-point id order, after canonicalization and dedupe. The current golden order is exact, not only a set comparison.
- If the implementation changes the fixture, update the exported golden arrays/counts and the tests together instead of leaving totals implicit.

Edge-case scenario expectations:

| Scenario | Input points | Expected result | Required caption |
|---|---|---|---|
| Boundary cell assignment | Use `origin = 0`, `cellSize = 1`, with `P(1, 0.5)`, `Q(0.999, 0.5)`, and `R(2, 1)`. | `Q` is in cell `0,0`; `P` is in `1,0`; `R` is in `2,1`. | Half-open cells put exact positive boundaries in the cell to the right or above. |
| Tie at threshold | Current recursive best has distance `r`; a cross pair has distance exactly `r`. | Keep the current best pair; the cross pair is a checked loss, not a strict improvement. | The merge searches for pairs closer than `r`, not tied with `r`. |
| Duplicate coordinates | `P(2, 3)` and `Q(2, 3)` plus any other points. | Return `P-Q` with distance `0` before grid construction. | Duplicates are a base/early-exit case so `cellSize` never depends on `r = 0`. |

## State Model

Create shared trace data:

```text
src/components/interactive/closestPairTrace.ts
```

Core types:

```ts
type Point = { id: string; x: number; y: number };
type Pair = [string, string];
type CellKey = `${number},${number}`;

type ClosestPairStep = {
  id: string;
  phase: "naive" | "split" | "recurse" | "threshold" | "grid" | "check" | "done";
  activePair?: Pair;
  activeCell?: CellKey;
  activeNeighborOffsets?: { dx: number; dy: number }[];
  neighborCells?: CellKey[];
  splitX?: number;
  rLeft?: number;
  rRight?: number;
  r?: number;
  cellSize?: number;
  bestPair?: Pair;
  bestDistance?: number;
  checkedPairs: Pair[];
  visiblePairs?: Pair[];
  pairCategories?: Partial<Record<
    "same-side-already-solved" |
    "outside-band" |
    "outside-neighbor-window" |
    "checked-loses" |
    "checked-wins",
    Pair[]
  >>;
  explanation: Record<Locale, string>;
};

type ClosestPairScenario = {
  id:
    | "hook-map"
    | "naive-pair-count"
    | "split-after-recursion"
    | "threshold-band"
    | "radius-neighborhood"
    | "packing-occupancy"
    | "cell-distance-ruler"
    | "grid-cell-size"
    | "active-neighbor-cells"
    | "grid-boundary-crossing"
    | "pair-classification"
    | "code-trace-map"
    | "candidate-filter"
    | "complexity-tree"
    | "coordinate-distance-scaffold"
    | "recursion-scaffold"
    | "boundary-cell-rule"
    | "tie-distance"
    | "duplicate-points";
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  ariaLabel: Record<Locale, string>;
  traceStepId?: string;
  expectedAnnotation: Record<Locale, string>;
  layers: {
    splitLine?: boolean;
    grid?: boolean;
    band?: boolean;
    radius?: boolean;
    highlightedPairs?: Pair[];
    fadedPairs?: Pair[];
    activeCells?: CellKey[];
    neighborCells?: CellKey[];
    tables?: "pair-count" | "classification" | "code-trace" | "complexity" | "packing-occupancy" | "coordinate-distance";
  };
};
```

Stable trace step ids should include:

```text
naive-sample
radius-r-pain
split-created
left-right-solved
threshold-chosen
threshold-band-only
grid-built
active-cell-f
active-window-f
active-f-golden-pairs
check-f-g
check-f-h
cross-pair-wins
done
```

Scenario configs must bind to stable trace step ids when they show algorithm state.

## Component Plan

Add these implementation targets:

```text
src/components/interactive/ClosestPairScenarioFigure.tsx
src/components/interactive/ClosestPairDemo.tsx
src/components/interactive/closestPairTrace.ts
```

`ClosestPairScenarioFigure` should handle static and lightly annotated section visuals from scenario configs.

`ClosestPairDemo` should be the master controller:

- Step and reset controls.
- Toggle between `All cross pairs`, `Band only`, and `Grid window`.
- Passive active-window highlighting for the current merge step. Keep click/focus active-cell offset reveal primarily in the section-level `cell-distance-ruler` / `active-neighbor-cells` figure, where the geometry explanation is local and less likely to bloat the master demo.
- Current phase list.
- Current `r`, cell size, active cell, active pair, checked-pair count, and best pair.
- Local `aria-live` explanation plus a concise state summary for skipped/candidate categories.
- Plot with split line, grid, highlighted cells, active pair, best pair, and faded skipped pairs.
- No random runtime state.

Keep `ClosestPairDemo` focused on the merge: stepping, three comparison modes, passive active-window context, counters, candidate categories, and the plot. Put active-cell offset inspection, sample-`r` exploration, and code-line-to-trace highlighting in section-level figures/widgets where they support the surrounding prose without bloating the master demo.

Use shared styles with existing interactive cards where possible, but avoid forcing Graham-specific CSS names onto closest-pair widgets.

## Bilingual Copy Notes

English should introduce the concrete map-point problem first, then name the algorithm.

Chinese should use clear Simplified Chinese with first-use bilingual terms:

- 分治（divide and conquer）
- 最近点对（closest pair）
- 跨边界点对（cross-boundary pair）
- 网格（grid）
- 单元格（cell）
- 哈希表（hash table）
- packing 思想（packing argument）

Keep Chinese pages generated by AI at `translationStatus: needs-review`.

## Inline Scaffolding

Because this node has no graph prerequisites yet, the page should include compact inline scaffolding instead of assuming prior nodes:

- Coordinates: show points as `(x, y)` on ordinary geometry axes, with a note that SVG screen rendering may invert `y`.
- Euclidean distance: define `dist(P, Q) = sqrt((Px - Qx)^2 + (Py - Qy)^2)` before using `r`.
- Recursion: explain that the algorithm splits the `x`-sorted point order, solves each half, and merges the two answers.
- Asymptotic complexity: briefly unpack `T(n) = 2T(n / 2) + O(n)` and why carrying sorted order avoids an accidental extra sort at every level.

## Graph Placement

The node already exists in `src/data/graph.ts`.

Keep the existing contrast edge to `graham-scan`, with this meaning:

- Closest pair uses recursion plus a local cross-boundary merge.
- Graham Scan uses angular ordering plus a stack invariant.

Do not add prerequisite edges until reusable geometry or divide-and-conquer support nodes exist.

Update `docs/knowledge-node-plan.md` so `closest-pair-divide-and-conquer` points to this design document.

## Accessibility And Mobile Requirements

- Every SVG figure needs localized `role="img"` and `aria-label`.
- Every visual needs a visible caption or nearby text summary.
- The interactive demo needs an `aria-live="polite"` current-step explanation.
- Do not rely on color alone: label sides, split line, `r`, grid cells, active pair, best pair, and skipped pair categories.
- Controls must have visible focus states and localized labels.
- Respect reduced motion; all learning states must be reachable by stepping.
- Mobile layout should show the plot first, then the state summary, then controls.
- Use a fixed SVG `viewBox`; do not recompute geometry from viewport width.
- If point labels or cell labels collide on narrow screens, show fewer in-plot labels, keep short ids plus a legend, and put the detailed active-cell/category summary below the plot rather than shrinking text with viewport width.
- Tables may horizontally scroll when wrapping would make them unreadable.

## Tests And Acceptance Criteria

Implementation should add or update tests for:

- Trace determinism: fixed points, split, pinned main `gridOrigin`, `rLeft`, `rRight`, `r`, final pair.
- `cellSize = r / Math.sqrt(2)`.
- Duplicate coordinates return distance `0` before grid construction.
- Grid cell assignment uses half-open cells, including a separate boundary convention fixture.
- Candidate generation checks exactly the configured `dx,dy in [-2,2]` neighbor-window cells for each active cell, then distance-filters actual pairs.
- Candidate generation uses stable left-side active-point iteration only, canonicalizes point-id pair order, dedupes before counting, and asserts exact emitted order.
- Golden candidate arrays/counts match the fixture: `allCrossPairs` count `36`, `bandOnlyCrossPairs` count `4`, `gridWindowCrossPairs` count `4`, and `activeFGridWindowPairs = [F-G, F-H]`.
- Packing invariant annotations are present in the core-invention figure/table and explain why each same-side cell occupancy is bounded after recursion.
- Threshold comparison uses strict `< r`; exact ties keep the current best pair, with deterministic tie handling for equal strict improvements.
- Boundary-crossing fixture proves a pair outside immediate adjacency is still considered by the safe fixed window when appropriate.
- Cross-boundary winning pair `F-G` is found.
- Same-side pairs are not rechecked during the merge trace.
- No duplicate cross pairs are emitted in all-cross, band-only, grid-window, or active-point views.
- Pair categories are mutually exclusive: a canonical pair can appear in exactly one of same-side-already-solved, outside-band, outside-neighbor-window, checked-loses, or checked-wins for a given trace step.
- Threshold-band and grid-window states are distinct, and outside-band pairs are categorized separately from outside-neighbor-window pairs.
- Scenario configs bind to valid trace step ids.
- Static figures expose localized captions, labels, expected point ids, and `aria-label`s.
- Section-level active-neighbor figure exposes click/focus offset inspection; master demo exposes step/reset controls, `All cross pairs` / `Band only` / `Grid window` mode toggle, passive active-window highlighting, and `aria-live` state.
- No color-only state for side, active cell, active pair, best pair, or skipped pair.

Expected verification after implementation:

```bash
npm run check
npm run test
npm run build
```

## Implementation Staging

1. Planning pass: add this design doc and update `docs/knowledge-node-plan.md`.
2. Trace foundation: implement `closestPairTrace.ts` with deterministic points, distance helpers, cell helpers, trace steps, and scenario configs.
3. Static visual pass: add `ClosestPairScenarioFigure` and embed P0/P1 figures through English and Chinese MDX.
4. Master widget pass: add `ClosestPairDemo` with step/reset, all-cross/band/grid-window modes, passive active-window context, counters, and candidate categories.
5. Content rewrite: replace the existing “Interactive visual to build next” placeholder with the actual visual sections.
6. Tests: cover trace helpers, scenario bindings, rendering assumptions, and accessibility basics.
7. Polish: mobile label pass, bilingual copy pass, `npm run check`, `npm run test`, and `npm run build`.

Main redesign target: learners should leave with one clear idea: recursion removes same-side work, and the grid makes the remaining cross-boundary search local instead of quadratic.
