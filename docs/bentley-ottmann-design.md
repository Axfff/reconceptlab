# Bentley-Ottmann Node Design

## Node Scope

`bentley-ottmann` should be a coarse-grained algorithm node for reporting all intersections among a set of non-vertical line segments using a left-to-right sweep line.

In scope:

- Segment-intersection reporting, not just decision.
- Why all-pairs checking is correct but wasteful when the number of reported intersections `k` is small.
- The plane-sweep idea: process only discrete events where the active order can change.
- Sweep-line status as a top-to-bottom ordered set of active segments.
- Future event queue as a priority queue ordered by x-coordinate.
- The adjacent-segment rule: test segment pairs only when they become neighbors in the status.
- Left endpoint, right endpoint, and intersection event handling.
- Stale scheduled events and why the first version needs an explicit cleanup convention.
- Correctness intuition for why every real intersection is eventually scheduled.
- Output-sensitive running time `O((n + k) log n)` under the slide deck's general-position assumptions.

Out of scope for the first page:

- Degenerate cases: vertical segments, equal event x-coordinates, endpoint-on-segment cases, overlapping collinear segments, and three-way intersections.
- Robust predicates, exact arithmetic, floating-point failure modes, and production computational-geometry engineering.
- Splitting `plane-sweep`, `event-queue`, `sweep-line-status`, `balanced-bst`, or `orientation-test` into separate production nodes. Mention them inline and split later when multiple pages reuse them.
- A full proof of every data-structure operation. The page should explain the operations the algorithm needs and why they are logarithmic in a balanced ordered set.

## Proposed Frontmatter

English page:

```yaml
id: bentley-ottmann
locale: en
title: Bentley-Ottmann Sweep Line
summary: Report all segment intersections by sweeping left to right and checking only local neighbors.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: algorithm
tags:
  - geometry
  - algorithms
  - sweep-line
prerequisites:
  - closest-pair-divide-and-conquer
  - graham-scan
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Chinese page:

```yaml
id: bentley-ottmann
locale: zh
title: Bentley-Ottmann 扫描线算法
summary: 从左到右扫描线段，只在局部相邻关系变化时检查候选交点，从而报告所有交点。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: algorithm
tags:
  - geometry
  - algorithms
  - sweep-line
prerequisites:
  - closest-pair-divide-and-conquer
  - graham-scan
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

## Teaching Arc

1. Hook problem: overlay road, river, and boundary segments on a map; every crossing must be reported, not only detected. The hook figure should reveal the checklist `A-C`, `A-B`, `B-C` so learners see that the output is a list of crossings.
2. First naive idea: compare every pair of segments and report the pairs that intersect.
3. Where it breaks: `O(n^2)` checks are unavoidable in the worst case, but wasteful when the actual output size `k` is much smaller.
4. Core invention: move a vertical sweep line and stop only at events, because the active vertical order is stable between events.
5. Working memory: reported intersections to the left, active segments in top-to-bottom order, and future events to the right.
6. Local discovery rule: only pairs that become adjacent in the sweep-line status need to be tested.
7. Interactive visual demo: step through the fixed trace and show geometry, status, event queue, tested pairs, scheduled events, stale removals, and reported intersections together.
8. Formal version: define segment set `S`, event types, status order at `x0`, and `testAndSchedule`.
9. Implementation sketch: pseudocode for endpoint and intersection events.
10. Correctness intuition: immediately before two segments cross, no third active segment can be between them, so they must have become adjacent after the previous event.
11. Complexity: `2n + k` processed events, constant many ordered-set/priority-queue operations per event, each `O(log n)`.
12. Common confusions and exercises: stale events, active vs all segments, discovered vs reported intersections, and why the assumptions matter.

## Vocabulary Scaffolding

Introduce these terms inline before using them in the formal algorithm:

- Segment-intersection reporting: output every pair of segments that intersect.
- Output-sensitive: runtime depends on input size `n` and output size `k`.
- Sweep line: an imaginary vertical line moving from left to right.
- Event: an x-position where the status can change: a left endpoint, right endpoint, or discovered intersection.
- Active segment: a segment whose left endpoint has been processed but whose right endpoint has not.
- Sweep-line status: active segments ordered from top to bottom by their y-value at the current sweep x.
- Future event queue: a priority queue of unprocessed endpoint and intersection events.
- Priority queue: a collection where `extractMin` always removes the next event by event-time order, here left-to-right x-coordinate.
- Balanced ordered set: a data structure that keeps the active segments sorted by their current vertical order while supporting insert, delete, and immediate above/below neighbor queries in `O(log n)`.
- Above/below neighbor: the immediate segment above or below another segment in the top-to-bottom status order. Implementation sections may call these API operations `successor` and `predecessor`.
- Neighbor: the immediate above or below segment in the status order.
- Stale event: a scheduled intersection between two segments that should be removed because another event made them non-adjacent before that intersection.
- `intersectionPoint` / geometric primitive: a small geometry helper that answers whether two segments intersect in the future and, if so, returns the point. The tutorial treats this helper as `O(1)`.
- General position: simplifying assumptions that remove ties and multi-way cases in the first implementation.

## Local Conventions

- Coordinates use ordinary math axes: x increases rightward and y increases upward. SVG implementations invert y only while rendering.
- Status lists are written top-to-bottom. In `[D, B, C, A]`, `D` is highest and `A` is lowest at the current sweep x.
- Status before an event is ordered just to the left of that event x; status after an event is ordered just to the right of that event x. Left endpoint insertions use the just-right order so the new segment is placed where it will appear immediately after it starts.
- Event-time order is increasing x-coordinate. Under the general-position contract, no two events share the same x, so the first version does not need tie batches.
- Section figures should label above/below neighbors directly on the status list and use a small `x - epsilon / x / x + epsilon` marker when an event changes order.
- `BentleyOttmannScenarioFigure` should expose reusable annotations for the coordinate-system note, top-to-bottom status meaning, above/below neighbor labels, and event-time ordering so these conventions appear consistently without repeating prose.

## General-Position Contract

The tutorial should state the slide assumptions before the algorithm trace:

- No segment is vertical.
- No two endpoints or intersection points have the same x-coordinate.
- No endpoint lies on another segment.
- No three segments intersect at one common point.

These are teaching assumptions, not claims about the full real-world problem. The common-confusions section should explain that production implementations need tie handling and robust geometry, but the first node intentionally keeps the event logic visible.

## Stale-Event Policy

Use one named policy throughout the tutorial: **eager adjacent-only cleanup**.

Under this policy, the queue keeps intersection events only for pairs that are currently adjacent in the sweep-line status. Whenever an insertion, deletion, or swap makes a scheduled pair non-adjacent, the trace marks that event as stale and removes it immediately. This keeps the visual queue small and makes stale-event handling explicit. A production implementation may instead leave stale events in the heap and discard them when extracted, but that lazy policy is not used in this tutorial trace.

Because the tutorial chooses eager cleanup, future intersection events need stable event ids plus queue support for deletion by id. A production version can use a removable priority queue with an index map or event handles so stale-event removal is still `O(log n)`. A plain heap without deletion handles would need a lazy stale-event policy instead, with validity checked when an event is extracted.

## Primitive Tools Box

Before the trace, include a compact "tools we treat as primitives" box:

- Priority queue: gives the next x-event and supports inserting or removing scheduled intersection events by stable id.
- Sweep-line status: gives the segment immediately above and immediately below a segment or insertion position.
- Geometry helper: `intersectionPoint(a, b)` answers whether a pair intersects at a valid future point.

## Deterministic Trace Fixture

Use one shared math-space fixture for the page, section figures, exercises, and master demo. Coordinates use ordinary geometry axes with y increasing upward; SVG renderers should invert y for screen space.

```ts
const segments = [
  { id: "A", from: { x: 0.4, y: 1.2 }, to: { x: 9.4, y: 5.7 } },
  { id: "B", from: { x: 0.8, y: 7.68 }, to: { x: 9.0, y: 4.4 } },
  { id: "D", from: { x: 1.3, y: 7.504 }, to: { x: 9.6, y: 8.168 } },
  { id: "C", from: { x: 3.1, y: 3.42 }, to: { x: 9.2, y: 4.64 } }
];
```

Fixture expectations:

- Supporting lines:
  - `A`: `y = 1 + 0.5x`
  - `B`: `y = 8 - 0.4x`
  - `C`: `y = 2.8 + 0.2x`
  - `D`: `y = 7.4 + 0.08x`
- True intersections inside segment ranges:
  - `A-C` at `x = 6.000`, `y = 4.000`
  - `A-B` at `x = 7.778`, `y = 4.889`
  - `B-C` at `x = 8.667`, `y = 4.533`
- `D` is a high active segment that enters and leaves without intersecting the other segments.
- At `C`'s left endpoint, `C` inserts between `A` and `B`, so the previously scheduled `A-B` event becomes stale and is removed.
- At `C`'s left endpoint, `B-C` is scheduled because `B` and `C` become adjacent.
- After the `A-C` intersection, `A` separates `B` and `C`, so `B-C` is removed as stale. `A-B` is rescheduled because `A` and `B` become adjacent again.
- After the `A-B` intersection, `B` and `C` become adjacent again, so `B-C` is rescheduled and later reported.
- Final reported intersections, in event order: `A-C`, `A-B`, `B-C`.

Required trace IDs:

| Trace ID | Event | Status after | Key local lesson |
|---|---|---|---|
| `left-A` | left endpoint of `A` | `[A]` | The first active segment enters the status. |
| `left-B` | left endpoint of `B` | `[B, A]` | New neighbors are tested; schedule `A-B`. |
| `left-D` | left endpoint of `D` | `[D, B, A]` | Inserting above `B` only changes local neighbors. |
| `left-C` | left endpoint of `C` | `[D, B, C, A]` | `C` splits former pair `B-A`; remove stale `A-B`, schedule `A-C` and `B-C`. |
| `intersect-A-C` | intersection `A-C` | `[D, B, A, C]` | Report `A-C`, swap `A` and `C`; remove stale `B-C`, reschedule `A-B`. |
| `intersect-A-B` | intersection `A-B` | `[D, A, B, C]` | Report `A-B`, swap `A` and `B`; reschedule `B-C`. |
| `intersect-B-C` | intersection `B-C` | `[D, A, C, B]` | Report `B-C`, swap `B` and `C`. |
| `right-B` | right endpoint of `B` | `[D, A, C]` | `B` is bottommost after `intersect-B-C`, so deletion has only one neighbor and creates no newly adjacent pair. |
| `right-C` | right endpoint of `C` | `[D, A]` | Local deletion only affects former neighbors. |
| `right-A` | right endpoint of `A` | `[D]` | Status shrinks as segments end. |
| `right-D` | right endpoint of `D` | `[]` | The sweep finishes with an empty status. |

Golden queue expectations:

- Initial queue contains only eight endpoint events.
- `A-B` is first scheduled at `left-B`.
- That `A-B` event is removed as stale at `left-C`.
- `A-C` and `B-C` are scheduled at `left-C`.
- `B-C` is removed as stale at `intersect-A-C` because `A` now separates `B` and `C`.
- `A-B` is scheduled again at `intersect-A-C`.
- `B-C` is scheduled again at `intersect-A-B`.
- Every reported intersection was previously scheduled while the two segments were adjacent.
- The demo should expose both `queueBefore` and `queueAfter` so learners can see dynamic insertion and stale removal.

## Section-Level Visual Inventory

Every major section should include nearby visual support unless the visual would duplicate an adjacent stronger widget.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Static map-overlay style figure with the fixture segments drawn like roads, crossings hidden first and then revealed into a reporting checklist: `A-C`, `A-B`, `B-C`. | What are we trying to output, and how is reporting different from a yes/no decision? |
| First naive idea | Pair-check matrix for `A, B, C, D`, showing all six possible pairs and the three true intersections. | Why is all-pairs checking simple and correct? |
| Where it breaks | Output-sensitive count strip: brute force checks `n(n-1)/2`; sweep processes `2n+k` events. | Why should runtime depend on the output size `k`? |
| Core invention | Stepped sweep snapshot at `left-C`, with the vertical line, active segments, and status list. | What changes only at event x-positions? |
| Working memory | Three-column lab note: reported intersections, status order, event queue. Bind it to trace IDs. | What does the algorithm remember while sweeping? |
| Adjacent-segment rule | Before/after mini-figure for `left-C`: `B-A` were neighbors, `C` inserts between them, so only `B-C` and `C-A` are tested. | Why do we test local neighbors instead of all active pairs? |
| Interactive visual demo | `BentleyOttmannDemo` with step, reset, optional play/pause, geometry canvas, status list, queue strip, tested-pair log, and current explanation. | How does the whole sweep unfold? |
| Left endpoint event | Trace-linked card using `left-C`: insert `C`, find above/below, remove stale `A-B`, test `A-C` and `B-C`. | What exactly happens when a segment starts? |
| Right endpoint event | Trace-linked card using `right-B`: remove bottommost `B`; because only the above neighbor `C` exists, no newly adjacent pair is created. Add a separate small non-trace schematic where deleting a middle segment makes its above and below neighbors adjacent and triggers one neighbor test. | What exactly happens when a segment ends? |
| Intersection event | Trace-linked card using `intersect-A-C`: show `x - epsilon / x / x + epsilon`, report, swap, remove stale `B-C`, and test the new outer neighbors. | Why does crossing reverse vertical order? |
| Formal version | Definitions panel for `status(x)`, event type, active segment, and `testAndSchedule`. | How does the story map to mathematical objects? |
| Implementation sketch | Small status-list figure before pseudocode: a highlighted segment with `successor = above` and `predecessor = below`, followed by a code-to-trace table mapping each pseudocode branch to trace IDs. | Which code line creates each visible state change? |
| Correctness intuition | Three-frame proof sketch for the adjacent rule: after previous event `q`, no event between, just before crossing `p`. | Why can no intersection be missed? |
| Complexity | Event ledger and operation table: endpoint events, intersection events, status operations, queue operations. | Where does `O((n+k) log n)` come from? |
| Common confusions | Mini-cards for stale events, active vs all segments, scheduled vs reported, and general-position assumptions. | Which implementation details are easy to misread? |
| Connections | Local graph snippet connecting `closest-pair-divide-and-conquer`, `graham-scan`, and `bentley-ottmann`. | How does this node fit into the geometry cluster? |
| Exercises | Prediction widgets bound to `left-C`, `intersect-A-C`, and `right-B`. | Can the learner apply the local-neighbor rule? |

Section-level snapshot rule:

- Each figure must show the current sweep x, status order, and the local neighbor pairs being tested.
- Each snapshot should have a caption stating the local rule, not only the visual state.
- Static section figures should be generated from the same trace fixture as the master demo.
- Avoid relying on color alone: use labels such as `active`, `tested`, `scheduled`, `stale`, and `reported`.

## Components and State Model

Prefer one shared trace module and two renderer levels:

```text
src/components/interactive/bentleyOttmannTrace.ts
src/components/interactive/BentleyOttmannDemo.tsx
src/components/interactive/BentleyOttmannScenarioFigure.tsx
```

`BentleyOttmannScenarioFigure` should render section-level static or lightly stepped scenarios. `BentleyOttmannDemo` should be the full controller. Both should use the same exported trace and scenario definitions.

Suggested types:

```ts
type LocaleText = Record<"en" | "zh", string>;
type SegmentId = "A" | "B" | "C" | "D";
type Pair = [SegmentId, SegmentId];

type SweepEventType = "left" | "right" | "intersection";

type SweepEventRef = {
  id: string;
  type: SweepEventType;
  x: number;
  label: LocaleText;
  segment?: SegmentId;
  pair?: Pair;
  stale?: boolean;
};

type SweepTraceStep = {
  id: string;
  event: SweepEventRef;
  sweepX: number;
  statusBefore: SegmentId[];
  statusAfter: SegmentId[];
  queueBefore: SweepEventRef[];
  queueAfter: SweepEventRef[];
  testedPairs: Pair[];
  scheduledEvents: SweepEventRef[];
  removedStaleEvents: SweepEventRef[];
  reportedIntersections: Pair[];
  activePair?: Pair;
  explanation: LocaleText;
};

type BentleyScenario = {
  id:
    | "hook-map"
    | "naive-pair-matrix"
    | "output-sensitive-count"
    | "sweep-snapshot"
    | "working-memory"
    | "adjacent-rule-left-c"
    | "left-event-card"
    | "right-event-card"
    | "intersection-event-card"
    | "formal-status"
    | "code-trace-map"
    | "correctness-frames"
    | "complexity-ledger"
    | "stale-event-card"
    | "exercise-next-test";
  traceStepId?: string;
  title: LocaleText;
  ariaLabel: LocaleText;
  caption: LocaleText;
};
```

Trace implementation notes:

- Store event queue entries by stable event id, not by display label.
- For eager stale removal, back the queue with a removable priority queue, an index map, or event handles so `queue.removeIfScheduled(pair)` can delete by stable event id in `O(log n)`.
- Use canonical pair order for event identities, but display pair names in local status order when explaining neighbor tests.
- Mark stale events explicitly in trace data before removal; do not silently drop them from the visual.
- `testAndSchedule(a, b)` should emit a tested-pair trace entry even when no future intersection exists.
- `testAndSchedule(a, b)` should schedule only intersections strictly inside both segments' x-ranges and strictly to the right of the current `sweepX`.
- The trace builder may use exact rational or fixed decimal values for fixture intersections; UI should display rounded x labels.
- The trace/demo may model status as an ordered array changed only by explicit insert, delete, and adjacent swap events. Production ordered structures must not rely on a silently mutable comparator whose meaning changes as `sweepX` moves, because that can invalidate balanced-tree invariants.

## Interactive Demo Requirements

`BentleyOttmannDemo` should expose:

- Step backward, step forward, reset, and optional play/pause.
- A reduced-motion mode that jumps between event states instead of animating the sweep line.
- Geometry canvas with segment labels, current sweep line, active segments, current event marker, tested pair highlights, scheduled intersection markers, stale marker, and reported intersections.
- Status list ordered top-to-bottom with above/below labels around the active segment or pair.
- Event queue strip ordered left-to-right, with endpoint, scheduled intersection, and stale-removal state distinctions.
- Text explanation for the current step.
- Current operation log: inserted/deleted/swapped segment, tested pairs, scheduled events, removed stale events, reported pair.

Controls should be useful, not decorative:

- Step controls let the learner inspect local status changes.
- Reset returns to the initial endpoint queue.
- Play/pause is optional because the algorithm is easier to learn by stepping; if included, it must respect reduced motion.
- A small toggle between `all pair checks` and `sweep checks` is useful in the naive/pain section, not necessarily in the master demo.

## Implementation Sketch

Before the pseudocode, show a small vertical status-list figure:

```text
top
  above segment       successor(s)
  current segment s
  below segment       predecessor(s)
bottom
```

Use above/below wording in prose first, then name `successor` and `predecessor` as the API terms.

The tutorial pseudocode should stay language-neutral or TypeScript-like and match the trace vocabulary:

```ts
const queue = new EventQueue();
const status = new SweepStatus();
const reported = [];

for (const segment of segments) {
  queue.insert(leftEndpointEvent(segment));
  queue.insert(rightEndpointEvent(segment));
}

while (!queue.isEmpty()) {
  const event = queue.extractMin();
  sweepX = event.x;

  if (event.type === "left") {
    const s = event.segment;
    const aboveBefore = status.successorAtInsertionPoint(s);
    const belowBefore = status.predecessorAtInsertionPoint(s);
    status.insert(s);
    queue.removeIfScheduled(aboveBefore, belowBefore);
    testAndSchedule(aboveBefore, s);
    testAndSchedule(s, belowBefore);
  }

  if (event.type === "right") {
    const s = event.segment;
    const above = status.successor(s);
    const below = status.predecessor(s);
    status.delete(s);
    testAndSchedule(above, below);
  }

  if (event.type === "intersection") {
    const [a, b] = event.pair;
    if (!status.areAdjacent(a, b)) continue; // defensive check for stale extracted events
    const upperBefore = status.upperOfPair(a, b);
    const lowerBefore = status.lowerOfPair(a, b);
    const aboveOuter = status.successor(upperBefore);
    const belowOuter = status.predecessor(lowerBefore);

    reported.push(event.pair);
    queue.removeIfScheduled(aboveOuter, upperBefore);
    queue.removeIfScheduled(lowerBefore, belowOuter);

    status.swapAdjacent(upperBefore, lowerBefore);

    const newUpper = lowerBefore;
    const newLower = upperBefore;
    testAndSchedule(aboveOuter, newUpper);
    testAndSchedule(newLower, belowOuter);
  }
}

function testAndSchedule(a, b) {
  if (!a || !b) return;
  const point = intersectionPoint(a, b);
  if (
    point &&
    point.x > sweepX &&
    point.x > minX(a) &&
    point.x < maxX(a) &&
    point.x > minX(b) &&
    point.x < maxX(b) &&
    !queue.hasIntersection(a, b)
  ) {
    queue.insert(intersectionEvent(a, b, point));
  }
}
```

Important wording:

- Use above/below in learner-facing prose. Reserve `successor`/`predecessor` for implementation APIs, with `successor` as above and `predecessor` as below in this page.
- In a real ordered set, `successor`/`predecessor` depend on the status comparator at the current sweep x.
- The trace can update status by explicit array insert/delete/swap operations. A production balanced tree needs a comparator discipline that preserves tree invariants; do not let `sweepX` drift underneath a tree that assumes keys are fixed.
- Intersection extraction should verify the pair is still adjacent before reporting. Under the eager cleanup invariant this check should always pass, but making it explicit documents the stale-event branch and protects against queue bugs.
- Intersection events should name `upperBefore` and `lowerBefore` before swapping. After the swap, only the new outer neighbor pairs can create newly scheduled future events: `aboveOuter` with `newUpper`, and `newLower` with `belowOuter`.
- The eager adjacent-only cleanup policy removes scheduled events for pairs that stop being adjacent before testing the post-swap outer neighbors. In the fixture, `intersect-A-C` removes stale `B-C`, then schedules `A-B`.
- Right endpoint cleanup relies on the same future-only rule: `intersectionPoint(a, b)` / `testAndSchedule` never schedules an event at or beyond a segment's right endpoint, so a segment should not carry a future valid intersection event after its right endpoint is processed.

## Correctness Intuition

The proof section should be visual first:

1. Let `p` be a true future intersection of two segments.
2. Let `q` be the event immediately before `p`.
3. No event occurs between `q` and `p`, so no active segment can start, end, or cross another segment in that open interval.
4. Just before the sweep reaches `p`, the two crossing segments are adjacent in vertical order.
5. Therefore, they were already adjacent immediately after processing `q`.
6. The adjacent-segment rule tests newly adjacent pairs after every event, so the event for `p` is scheduled before the sweep reaches it.

Use the fixture's `A-C` and `A-B` sequence to make the argument concrete, then generalize.

## Complexity

State the count and assumptions explicitly:

- Endpoint events: `2n`.
- Intersection events reported: `k`.
- Total processed events under the general-position assumptions: `2n + k`.
- Each event performs a constant number of operations on:
  - sweep-line status: insert, delete, predecessor, successor, swap.
  - event queue: insert, extract-min, remove stale event.
- Each ordered-set or priority-queue operation costs `O(log n)`.
- Under eager stale removal, queue deletion is counted as `O(log n)` only if scheduled events have stable ids and the queue supports deletion by id through an index map or handles. A lazy heap can keep `insert` and `extractMin` simple, but it needs a different stale-event policy and does not match this trace's queue behavior.
- Stale removals and reschedules remain constant per processed event because each endpoint, deletion, or swap changes only a constant number of neighbor pairs.
- Geometric primitives are treated as `O(1)` for this node: compare two active segments at current x and compute a candidate intersection.
- Total runtime: `O((n + k) log n)`.
- Space: `O(n + k)` if all scheduled/reported intersections are stored; the live active status is `O(n)`.

## Common Confusions

Required mini-cards:

- Active does not mean intersecting now: it means the segment crosses the current sweep line.
- Scheduled is not reported: an intersection is reported only when its event is extracted.
- Stale events are normal: a future intersection can be removed when the pair stops being adjacent before reaching it.
- The status order is dynamic: comparing the same two segments can reverse after their intersection.
- General-position assumptions hide ties: same x-coordinate events need a deterministic batch-processing convention in production.
- The algorithm does not avoid all pair relationships forever: in dense inputs `k` can still be `Theta(n^2)`, so the output itself can be quadratic.

## Graph Placement

Add `bentley-ottmann` to the geometry cluster after `closest-pair-divide-and-conquer` and `graham-scan`.

Suggested graph node:

```ts
{
  id: "bentley-ottmann",
  label: {
    en: "Bentley-Ottmann Sweep Line",
    zh: "Bentley-Ottmann 扫描线"
  },
  status: "draft",
  conceptType: "algorithm",
  position: { x: 770, y: 235 }
}
```

Suggested edges:

```ts
{
  from: "closest-pair-divide-and-conquer",
  to: "bentley-ottmann",
  type: "contrasts",
  reason: {
    en: "Both avoid naive pair checking in geometry, but closest pair uses recursive spatial filtering while Bentley-Ottmann uses a dynamic sweep line.",
    zh: "二者都在几何问题中避免朴素的成对检查，但最近点对使用递归空间过滤，而 Bentley-Ottmann 使用动态扫描线。"
  }
}
```

```ts
{
  from: "graham-scan",
  to: "bentley-ottmann",
  type: "motivates",
  reason: {
    en: "Graham Scan introduces geometric ordering and local turn tests; Bentley-Ottmann extends the idea of maintaining an order as events change it.",
    zh: "Graham 扫描引入了几何排序和局部转向测试；Bentley-Ottmann 进一步维护会随事件变化的动态顺序。"
  }
}
```

Optional future edges after supporting nodes exist:

- `balanced-bst -> bentley-ottmann`, `implemented-by`
- `priority-queue -> bentley-ottmann`, `implemented-by`
- `orientation-test -> bentley-ottmann`, `uses`
- `plane-sweep -> bentley-ottmann`, `generalizes` or `uses`

## Accessibility and Mobile

- Use semantic buttons with descriptive labels: `Next event`, `Previous event`, `Reset sweep`, `Play sweep`.
- Provide a text explanation for the current event and status changes.
- Represent state by both color and text labels. For example, scheduled intersections use a marker plus the label `scheduled`; stale events use a strikethrough or badge plus the word `stale`.
- Ensure focus states are visible for all controls.
- Use touch targets of at least 44px for controls and queue/event chips that can be tapped.
- Keyboard focus order should match the visual reading order.
- Respect reduced motion by replacing animated sweep movement with discrete state jumps.
- The geometry canvas should have an accessible summary of current sweep x, active segments, and reported intersections.
- When stepping the demo, update the current event explanation or operation log through a polite live region.
- Provide a textual event table equivalent to the canvas state, including event id, status before/after, tested pairs, scheduled events, stale removals, and reported intersections.
- Mobile layout order: event title and explanation, geometry figure, controls, status list, event queue, operation log.
- Status and operation log content must be readable without horizontal panning.
- Avoid making the event queue require precise horizontal dragging for core comprehension; if it scrolls, keep the current and next event pinned or repeated in fixed text above the scroll area.

## Acceptance Criteria

- The page starts from a concrete reporting problem before naming the algorithm.
- The all-pairs baseline is shown as correct, then made painful through output-sensitive reasoning.
- Every major section has section-level visual support or a documented reason for prose-only treatment.
- The master demo and section figures share one deterministic trace.
- The trace explicitly shows active status, future queue, local neighbor tests, scheduled intersections, stale removals, swaps, and reported intersections.
- Golden trace validation checks stable event ids, `statusBefore`/`statusAfter` arrays, `queueBefore`/`queueAfter` mutations, tested pairs, scheduled events, stale removals, and reported-intersection order.
- Geometry fixture tests verify computed intersections and event x-order: `A-C`, then `A-B`, then `B-C`, with no valid intersections involving `D`.
- Golden trace validation has focused expectations for `left-C`, `intersect-A-C`, and `intersect-A-B`: `left-C` removes stale `A-B` and schedules `A-C` plus `B-C`; `intersect-A-C` reports `A-C`, removes stale `B-C`, and schedules `A-B`; `intersect-A-B` reports `A-B` and schedules `B-C`.
- Golden trace validation checks `right-B` as a one-neighbor deletion: after `intersect-B-C`, `B` is bottommost, so removing it creates no newly adjacent pair and schedules no new intersection.
- The eager adjacent-only cleanup policy is named and the trace obeys it: no future intersection event remains in the queue for a pair that is not currently adjacent.
- The `left-C` and `intersect-A-C` stale-event moments are visible and explained.
- The adjacent-segment correctness argument is both visual and textual.
- Complexity is tied to `2n + k` processed events and `O(log n)` data-structure operations.
- Chinese content generated in the implementation pass uses `translationStatus: needs-review`.
- Future implementation runs `npm run check`, `npm run test`, and `npm run build` when practical.

## Validation Commands for Future Implementation

When production content and components are added:

```bash
npm run check
npm run test
npm run build
```
