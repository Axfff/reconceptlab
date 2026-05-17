# Graham Scan Node Design

## Node Scope

`graham-scan` should be a coarse-grained algorithm node for computing the convex hull of a finite set of 2D points.

Do not split out separate nodes for convex combinations, supporting lines, polar angle sorting, cross products, or orientation tests yet. Mention them inside the page as supporting ideas. Split them later only if multiple geometry pages start reusing them.

## Proposed Frontmatter

```yaml
id: graham-scan
locale: en
title: Graham Scan
summary: Build a convex hull by sorting points around an anchor and maintaining a left-turn stack.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: algorithm
tags:
  - geometry
  - algorithms
  - convex-hull
prerequisites: []
next: []
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

Chinese page should use:

```yaml
translationStatus: needs-review
title: Graham 扫描
summary: 围绕锚点按极角排序，并用保持左转的栈逐步构造凸包。
```

## Teaching Arc

### Hook Problem

You are given scattered points and want the tight outer boundary around them. A beginner-safe picture: stretch a rubber band around all the points and let it snap tight. The convex hull is the polygon touched by that band. Points strictly inside the band do not appear on the hull.

The page returns the hull corner vertices in counterclockwise order, not every point that happens to lie on a flat boundary edge. With this convention, a middle point on a straight boundary segment can be removed.

Implementation coordinate convention: algorithm and trace points are written in math-space coordinates, with `y` increasing upward. The SVG or screen renderer must map those points into screen-space by inverting `y`, so a mathematical left turn is still drawn as a visual left turn.

Implementation migration blocker: current shipped MDX prose/code sketch and `GrahamScanDemo` explanations may still use the old leftmost-lowest convention. Update those first, before adding the new page visuals, so no rendered page mixes conventions. The implementation must use `lowestLeftmost` consistently in prose, helper names, trace generation, demo explanations, and tests; `leftmostLowest` should not remain in Graham Scan code, copy, or fixtures.

Mini-scaffolding to define inline before the algorithm:

- Anchor: the fixed starting point. This page chooses the lowest-leftmost point: smallest `y`; if two points tie, choose the smallest `x`. This is the standard beginner-safe convention for starting the polar sweep from the positive `x` direction.
- Polar angle: the angle of the ray from the anchor to another point. This page starts from the positive `x` direction, like a ray pointing right from the anchor, then rotates counterclockwise.
- Counterclockwise order: the order you meet rays as they rotate left around the anchor from that positive-`x` baseline.
- Orientation: first explain it without algebra: walk from `p` to `q`, then ask whether `r` is to your left, to your right, or straight ahead. Then connect that picture to `orient(p, q, r)`, the cross product sign for the turn from `p -> q` to `q -> r`; positive means left turn, negative means right turn, zero means collinear.
- Stack: a last-in-first-out list holding the current tentative hull corners.

### First Naive Idea

Try every possible directed edge between two points and ask whether all other points lie on one side of that edge. Imagine testing whether a fence segment from `P` to `Q` could be part of the outer fence: if every other point is on the same side of the directed segment, the segment may be a boundary edge.

This matches the geometry idea of a supporting line, but it is expensive: roughly `n^2` candidate directed edges, and each candidate scans up to `n` other points, so the pain is about `O(n^3)`. It also gives boundary fragments without a clean traversal order for walking around the hull.

### Pain Point

The naive view can discover possible edges, but it does not explain which edge comes next or how to repair a bad local choice. Without a traversal order around the outside, it is unclear which local test removes inner points.

### Core Invention

Pick the lowest-leftmost point as an anchor, sort all other points by polar angle around it, and scan in that angular order. In beginner language: choose the lowest point; if there is a tie, choose the leftmost one. Then point a ray to the right from the anchor and list the other points in the order that ray would hit them as it rotates counterclockwise.

Maintain a stack of candidate hull vertices. When a new point would make a right turn or stay collinear with the last stack edge, pop the stack because the middle point cannot be an outer hull vertex. When the new point makes a left turn, keep it.

Same-angle proof-by-example: with anchor `A(1, 1)`, points `B(3, 1)` and `C(5, 1)` lie on the same ray. `B` is nearer and `C` is farther. If same-angle points are sorted near-to-far, the scan sees `B` before `C`; adding `C` makes `A, B, C` collinear, so `B` is popped. The farther point `C` remains, which is exactly what a corner-only hull should keep for that ray.

### Visual Intuition

The learner should see Graham Scan as "wrapping while correcting mistakes." The stack is a tentative boundary. A right turn means the boundary caves inward, so the previous candidate must be removed.

Correctness bridge to make explicit: after polar-angle sorting, the scan never goes backward around the anchor. So when the latest triple makes a right turn, the middle stack point creates an inward dent relative to the angular sweep. When the latest triple is collinear, the middle point lies on a flat segment rather than at a corner under this page's corner-vertices-only convention. In both cases, popping it restores the best known counterclockwise boundary prefix.

## Interactive Demo Design

Create a future component:

```text
src/components/interactive/GrahamScanDemo.tsx
```

The master demo remains the full algorithm walkthrough, but the page must not rely on one isolated demo section. Add section-level visual support wherever it removes real cognitive load: hook, naive edge testing, why naive fragments are painful, anchor/sort, scan state, orientation formula, implementation variables, correctness repair, complexity, common confusions, and exercise references. A section may stay prose-only only when the design explicitly explains why a visual would be decorative rather than useful.

### Section-Level Visual Plan

| Page section | Support type | Recommendation |
|---|---:|---|
| Hook problem | Static visual | Show the shared point set with a faint rubber-band hull outline around `A, C, D, E, H`. Purpose: define "outside boundary" before naming the algorithm. |
| First naive idea | Supporting-edge comparison | Add a side-by-side figure: one valid supporting edge, such as `C -> D`, and one failed candidate, such as `C -> E`, with violating points explicitly marked. This lets learners see why "try every edge" is plausible before they feel its cost. |
| Where it breaks | Fragment/order visual | Show that valid-looking boundary fragments do not automatically form a walk around the hull. Contrast unordered candidate edges with the later angular sweep order. |
| Core invention | Static or stepped anchor/sort visual | Show the anchor label, a positive-`x` baseline ray, and ordered rays/chips numbered `1` through `8` for `B, C, F, G, D, I, E, H`. Prefer stepped controls if revealing the rotating ray one point at a time helps the learner. |
| Interactive visual demo | Full interactive master demo | Keep `GrahamScanDemo` with step/reset, plot, phase list, sorted strip, stack, orientation annotation, pop/push explanation, and final hull. This is the master algorithm controller, not the only visual on the page. |
| Formal version | Orientation triple diagram | Place a compact `p, q, r` diagram next to the formula, with left/right/collinear examples or a toggle if space allows. The formula should be connected to the same visual turn test used in the demo. |
| Implementation sketch | Code/trace alignment table or micro-widget | Keep the code primary, but add a compact table mapping `sorted`, `hull`, `while orient <= 0`, `pop`, and `push` to trace fields. If interactive, clicking a code line should highlight the corresponding trace state. |
| Correctness intuition | Static or stepped before/after repair visual | Show one right-turn repair from the fixed trace, preferably stack path `A -> C -> F`, new point `G`, then `F` removed. Add the later `C, G, D` repair when explaining repeated repairs. |
| Complexity | Cost comparison bar | Add a compact visual that separates `O(n log n)` sorting from `O(n)` stack work and contrasts it with the naive edge test cost. |
| Common confusions | Edge-case mini-cards | Show the same-angle `B/C` case because it is part of the trace. Add a small duplicate-points or fewer-than-three-points card if learners might misread those as algorithm failures. |
| Connections in the graph | Graph-local visual | Reuse or link to the graph explorer context; when more geometry nodes exist, add a small relationship visual contrasting Graham Scan with closest-pair divide and conquer. |
| Exercises | Visual references | Exercises should point learners back to named visual states, such as the `B/C` same-angle state, the `C, F, G` right-turn state, and the later `C, G, D` repair that removes `G`. |

### Shared Visual Data Rule

Avoid one-off geometry examples that drift from the master demo. Use one shared source of truth for all Graham visuals, for example:

```text
src/components/interactive/grahamScanTrace.ts
```

It should export:

```ts
points;
sortedOrder;
finalHull;
trace;
pointById;
orientation helpers;
screen mapping helpers;
```

Use one generic static renderer, for example `GrahamScenarioFigure`, over selected scenario configs from that shared data. Current and near-term scenario ids should include:

```text
hook-hull
naive-edge
naive-fragments
anchor-sort
orientation-triple
right-turn-pop-f
right-turn-pop-g
same-angle
complexity-cost
duplicate-points
```

The implementation may stage these over multiple passes, but the plan should keep the visual inventory visible so prose-only gaps are intentional, not accidental.

Prefer this component split:

```text
GrahamScenarioFigure
GrahamScanDemo
```

`GrahamScenarioFigure` should handle static and lightly annotated section visuals by receiving scenario configs. Small focused widgets may wrap the same scenario data when learner-controlled reveal, compare, or toggle behavior is useful. `GrahamScanDemo` remains the separate full controller with step/reset state. This keeps the page visually consistent without fragmenting the implementation into many one-off components.

Suggested config shape:

```ts
type LocalizedText = Record<Locale, string>;

type GrahamScenario = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  ariaLabel: LocalizedText;
  caption?: LocalizedText;
  testId?: string;
  traceStepId?: string;
  traceStepIndex?: number;
  expectedAnnotation: LocalizedText;
  expectedPointLabels: string[];
  state?: {
    beforeStack?: string[];
    afterStack?: string[];
    activePoint?: string;
    triple?: [string, string, string];
    orientation?: "left" | "right" | "collinear";
    poppedPoint?: string;
  };
  layers: {
    hullPolygon?: string[];
    edges?: Array<{ from: string; to: string; variant?: "hull" | "candidate" | "failed" | "faint" }>;
    rays?: Array<{ from: string; to: string; variant?: "baseline" | "sorted" | "active" | "faint" }>;
    activeTriple?: [string, string, string];
    highlightedPoints?: string[];
    violatingPoints?: string[];
  };
};
```

Static scenario configs must bind to exact trace states instead of restating geometry by hand. `traceStepId` is preferred over `traceStepIndex` if stable ids are available. For example:

- `anchor-sort`: bound to the completed sort state; `activePoint` unset; annotation says `A` is the lowest-leftmost anchor, the baseline points right, and the visible sorted order is `B, C, F, G, D, I, E, H`.
- `right-turn-pop-f`: bound to the `G` pop step; `beforeStack: ["A", "C", "F"]`, `afterStack: ["A", "C"]`, `activePoint: "G"`, `triple: ["C", "F", "G"]`, `orientation: "right"`, `poppedPoint: "F"`.
- `same-angle`: bound to the `C` collinear pop step; `beforeStack: ["A", "B"]`, `afterStack: ["A"]`, `activePoint: "C"`, `triple: ["A", "B", "C"]`, `orientation: "collinear"`, `poppedPoint: "B"`.

Prefer a small separate edge-case fixture for duplicate handling or fewer-than-three-points handling rather than forcing those cases into the main shared trace.

The learner should repeatedly recognize the same story: `B` removed by `C`, `F` removed by `G`, `G` removed by `D`, `I` removed by `E`, and final hull `A, C, D, E, H`.

### Interaction Level Guidance

Use interaction intentionally and often enough to answer local learner questions:

- The master demo controls the whole algorithm trace.
- Section visuals should still be rich: static figures, before/after comparisons, trace-linked tables, toggles, and compact stepped reveal controls are all valid.
- Add controls when manipulation exposes reasoning, such as revealing sorted rays, switching valid vs failed candidate edges, stepping through a pop repair, or highlighting code-to-trace correspondence.
- Avoid empty controls that merely animate or duplicate the master demo without adding local insight.
- If a section has no widget, document why a widget would not help.

Each visual needs a short caption or adjacent explanation that states the geometric point being shown.

### State Model

Use deterministic trace data:

```ts
type Point = { id: string; x: number; y: number };

type GrahamStep = {
  id: string;
  phase: "anchor" | "sort" | "scan" | "done";
  action?: "choose-anchor" | "compare-angle" | "push" | "pop" | "finish";
  activePoint?: string;
  activeSortedIndex?: number;
  visibleSortedCount?: number;
  stack: string[];
  sortedOrder: string[];
  poppedPoint?: string;
  triple?: [string, string, string];
  orientation?: "left" | "right" | "collinear";
  explanation: Record<Locale, string>;
};
```

Generate the trace from a fixed point set in code. Do not call a model or randomize at runtime.

Keep macro phase separate from the local action: for example, a step can be `{ phase: "scan", action: "pop" }` or `{ phase: "scan", action: "push" }`. This avoids treating pop and push as separate high-level phases in the UI.

`sortedOrder` is the full canonical sorted list for trace generation, tests, and deterministic rendering once the sort is known. It is not necessarily the learner-visible prefix during the sorting explanation. Use `visibleSortedCount` or equivalent scenario guidance to reveal only the prefix the learner should currently see. During scanning, `activeSortedIndex` points into the full `sortedOrder`. If one active point triggers repeated pops, keep the same `activePoint` and `activeSortedIndex` across those pop steps; update `triple`, `orientation`, `poppedPoint`, and `stack` one pop at a time. The eventual push for that same active point is a separate step with the same active point and index.

The fixed set must include at least one pop and at least one same-angle/collinear case from the anchor, for example:

```text
A(1, 1) anchor
B(3, 1)
C(5, 1) same angle as B, farther from A
D(6, 4)
E(4, 5)
F(4, 2)
G(5, 3) creates a visible `orient(C, F, G) = right turn` pop
H(1, 5)
I(3, 3) interior
```

The same trace must later show `D` removing `G`: after `F` has been popped and `G` has been pushed, scanning `D` makes `orient(C, G, D) = right turn`, so `G` is popped before `D` is pushed. Without this step, the trace cannot end at the final hull `A, C, D, E, H`.

Add a small discriminating anchor-convention test fixture where the smallest-`x` point differs from the smallest-`y` point. It does not need to be a page visual. For example:

```text
L(0, 4) leftmost but not lowest
A(1, 1) lowest-leftmost expected anchor
R(4, 2)
T(2, 5)
```

The fixture must fail under a leftmost-lowest implementation and pass only when `lowestLeftmost` chooses `A`. Use this fixture to check the helper name, generated trace anchor, demo explanation text, and page prose all say lowest-leftmost rather than leftmost-lowest.

Under the convention above, the expected sorted order is:

```text
B, C, F, G, D, I, E, H
```

The expected final corner-only hull is:

```text
A, C, D, E, H
```

Quick consistency check for page authors: `B` is popped when `C` arrives because `A, B, C` are collinear on the same ray; `F` is popped when `G` arrives; `G` is popped when `D` arrives; `I` is popped when `E` arrives. The final hull should close back from `H` to `A` in the drawing.

### Visual Elements

- Scatter plot of 8 to 10 labeled points.
- Visible phase indicator: Anchor -> Sort -> Scan -> Done. The current phase must also be announced in the state summary.
- Anchor highlighted with text label, not only color.
- Anchor/sort first-pass figure is static: anchor label, positive-`x` baseline ray, numbered rays or chips `1` through `8`, and full order `B, C, F, G, D, I, E, H`.
- Sorted-order strip showing the polar-angle order from the anchor.
- Visible stack panel showing the current hull stack as point ids.
- Next-point label, such as "Next: G".
- Optional faint rays from anchor to points during the sorting phase.
- Stack boundary drawn as connected directed segments.
- Current triple `(p, q, r)` highlighted during the scan.
- Explicit orientation annotation, such as `orient(C, F, G) = right turn` or `orient(C, G, D) = right turn`.
- Popped point shown with a temporary "removed from stack" label.
- Final hull drawn as a closed polygon.

Mobile layout guidance: use a fixed SVG `viewBox` and scale the plot responsively rather than recalculating geometry per viewport. Show the plot first, then a compact text summary and controls. Sorted-order and stack chips may wrap or horizontally scroll. Point labels should use stable offsets with enough spacing; when labels would collide on narrow screens, fall back to shorter ids, leader lines, or a below-plot legend. Every plot, including static section figures, should have a text summary below it so the key geometric claim is not available only through the drawing.

### Controls

- Step.
- Reset.
- Optional phase tabs later: Anchor, Sort, Scan.

Keep the first version step/reset only.

### Accessibility

- Buttons need localized labels.
- Current state needs an `aria-live` text summary.
- Do not rely on red/green alone for right/left turns.
- Labels should say "left turn", "right turn", or "collinear" explicitly.
- Static section visuals need `role="img"` and localized `aria-label` text.
- If a rotating ray is animated later, it must also work as stepped states and respect reduced-motion preferences.

If the anchor/sort visual becomes stepped, give it keyboard-accessible Previous/Next buttons, keep focus order as figure summary -> controls -> sorted-order chips, disable terminal controls at the first and last step, and update an `aria-live="polite"` summary with the currently revealed point/ray. The static version still needs localized caption and `aria-label` text.

### Testability Acceptance Criteria

Tests should cover:

- Anchor convention and sorted order: lowest-leftmost anchor `A`, sorted order `B, C, F, G, D, I, E, H`.
- Discriminating anchor fixture: when the leftmost point is not the lowest point, `lowestLeftmost` still chooses the smallest-`y`, then smallest-`x`, anchor; no Graham prose, helper, trace generator, demo explanation, or test fixture refers to `leftmostLowest`.
- Final corner-only hull: `A, C, D, E, H`.
- Pop sequence: `B, F, G, I`.
- Repeated-pop behavior: if the same active point causes multiple pops, `activePoint` and `activeSortedIndex` stay fixed while `triple`, `poppedPoint`, and `stack` change one pop at a time.
- Static scenario config binding: every required static scenario points at the intended trace step and asserts `beforeStack`, `afterStack`, `activePoint`, `triple`, `orientation`, `poppedPoint`, and expected visible annotation where applicable.
- Static scenario render tests: each required static figure renders a visible caption or summary, localized `aria-label`, expected point labels, and expected scenario annotation.
- Screen mapping: inverting `y` for SVG preserves the visual meaning of math-space left/right orientation.
- Static and interactive visuals expose localized captions or summaries plus `aria-label`/`aria-live` text.
- State is never communicated by color alone; labels or annotations explicitly say anchor, active triple, left turn, right turn, collinear, violating point, and popped point.

### Expected Insight

The key learner takeaway is:

```text
After polar-angle sorting, any right turn or collinear middle point in the
tentative boundary proves the middle point is inside or on a non-corner part
of the hull, so it can be popped safely under the corner-vertices convention.
```

For the first page, use this convention: deduplicate points, choose the lowest-leftmost anchor, sort same-angle points by increasing distance from the anchor, and pop on `orient <= 0` so collinear middle points are removed. This returns hull corners only.

## Page Outline

1. Hook problem: tight outer boundary.
2. First naive idea: try all boundary edges and one-side tests.
3. Where it breaks: expensive checks, no traversal order, and no local repair rule.
4. Core invention: anchor, polar-angle order, left-turn stack.
5. Interactive visual demo.
6. Formal version: convex hull vertices in counterclockwise order.
7. Implementation sketch.
8. Correctness intuition: right turns expose non-extreme middle points.
9. Complexity: `O(n log n)` sorting plus `O(n)` stack scan.
10. Common confusions: duplicates, fewer than 3 distinct points, same-angle ties, and the collinear boundary convention.
11. Connections in the graph.
12. Exercises.

## Common Confusions To Include

- Duplicates: remove exact duplicate coordinates before choosing the anchor.
- Fewer than 3 distinct points: return the distinct points directly; there is no polygon to build.
- Same-angle ties: sort nearer points before farther points so the stack pop removes inner points on the same ray.
- Collinear boundary points: this page returns corner vertices only, so `orient <= 0` intentionally pops middle points on flat edges. A later variant can explain how to keep every boundary point.

## Implementation Sketch For Page

```ts
function orient(p: Point, q: Point, r: Point) {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function grahamScan(points: Point[]) {
  const unique = uniquePoints(points);
  if (unique.length <= 2) return unique;

  const anchor = lowestLeftmost(unique);
  const sorted = unique
    .filter((p) => p.id !== anchor.id)
    .sort((a, b) => {
      const turn = orient(anchor, a, b);
      if (turn !== 0) return turn > 0 ? -1 : 1;
      return distanceSquared(anchor, a) - distanceSquared(anchor, b);
    });

  const hull = [anchor];

  for (const point of sorted) {
    while (hull.length >= 2 && orient(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
      hull.pop();
    }
    hull.push(point);
  }

  return hull;
}
```

## Graph Placement

For now, add `graham-scan` as a standalone geometry algorithm node near `closest-pair-divide-and-conquer`.

Do not add fine-grained prerequisite nodes yet. Use page prose to introduce convex hull, polar angle, and orientation test inline.

Clarify in page copy and graph prose that `closest-pair-divide-and-conquer` is a neighboring geometry algorithm, not a prerequisite for Graham Scan. Future graph links may include orientation tests, convex hull variants, or other geometry primitives once they are reused by multiple pages.

Suggested graph node:

```ts
{
  id: "graham-scan",
  label: {
    en: "Graham Scan",
    zh: "Graham 扫描"
  },
  status: "draft",
  conceptType: "algorithm",
  position: { x: 540, y: 235 }
}
```

Suggested edge:

```ts
{
  from: "closest-pair-divide-and-conquer",
  to: "graham-scan",
  type: "contrasts",
  reason: {
    en: "Both are geometric algorithms, but closest pair uses divide-and-conquer while Graham Scan uses ordering plus a stack invariant.",
    zh: "二者都是几何算法，但最近点对分治依赖递归合并，Graham 扫描依赖排序和栈不变量。"
  }
}
```

This is a thematic edge, not a prerequisite.

## Acceptance Criteria For Implementation

- Add bilingual MDX pages for `graham-scan`.
- Add graph node and localized edge reason.
- Keep the first implementation coarse-grained.
- Before adding new visuals, update existing MDX prose/code sketch and `GrahamScanDemo` explanations from leftmost-lowest to lowest-leftmost.
- Embed `GrahamScanDemo`; do not ship a spec-only page.
- Demo includes a visible stack panel, sorted-order strip, next-point label, and orientation annotation.
- Add required section visuals: hook hull, anchor/sort, at least one right-turn repair, same-angle handling, and a documented backlog or implementation for every other useful section-level widget.
- Reuse one deterministic point set, sorted order, final hull, and trace data across all Graham visuals.
- Keep the master demo as the full algorithm controller, while section-level widgets provide local explanations near the relevant prose.
- Do not silently defer naive edge testing, formal orientation, complexity, or edge-case visuals. Either implement the useful widget or record why it is staged for a later pass.
- Mobile layout is checked for label overlap and horizontal overflow.
- Do not introduce alternate point sets except for explicitly framed small edge-case fixtures.
- Verify the discriminating anchor fixture, sorted order, final hull, pop sequence `B, F, G, I`, repeated-pop active point/index behavior, trace-bound static scenario configs, static scenario render output, y-inversion orientation preservation, captions/aria summaries, and non-color-only state.
- Run `npm run check`, `npm run test`, and `npm run build`.
