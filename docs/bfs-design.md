# Breadth-First Search Node Design

## Node Scope

`bfs` stays a beginner algorithm node between `graph-basics` and `dijkstra`.

In scope:

- BFS as layer-by-layer graph search on an unweighted graph.
- Why first-in, first-out queue order preserves increasing edge distance.
- Queue, frontier, discovered/visited set, expanded nodes, distance/layers, and parent/predecessor.
- Shortest paths by number of edges.
- Deterministic trace data shared by section figures, exercises, and an improved `QueueWaveDemo`.

Out of scope:

- Weighted shortest paths beyond a contrast with Dijkstra.
- Priority queues, negative weights, A*, bidirectional BFS, multi-source BFS, DFS as a full node, or formal graph theory proofs.
- Runtime-generated visualization state or network-dependent demos.

## Proposed Frontmatter

English page:

```yaml
id: bfs
locale: en
title: Breadth-First Search
summary: Find shortest paths in an unweighted graph by expanding from the start in distance layers.
status: draft
translationStatus: source
difficulty: beginner
conceptType: algorithm
tags:
  - graphs
  - algorithms
prerequisites:
  - graph-basics
next:
  - dijkstra
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

Chinese page:

```yaml
id: bfs
locale: zh
title: 广度优先搜索
summary: 在无权图中从起点按距离层向外扩张，找到按边数计算的最短路径。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: algorithm
tags:
  - graphs
  - algorithms
prerequisites:
  - graph-basics
next:
  - dijkstra
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

## Teaching Arc

1. Hook problem: from one room, find all rooms reachable in 0, 1, 2, and 3 doors.
2. First naive idea: follow one hallway chain deeply before checking nearby alternatives.
3. Pain point: deep wandering can discover a far room before a closer one, so discovery order does not equal shortest edge distance.
4. Core invention: keep discovered-but-not-expanded rooms in a queue and process older discoveries first.
5. Visual anchors: every section uses the same graph and trace unless explicitly marked as a variant.
6. Formal version: BFS starts at source `s`, discovers undiscovered neighbors, records distance and parent, and processes queue order.
7. Implementation sketch: TypeScript with adjacency list, `visited`, `queue`, `distance`, and `parent`.
8. Correctness intuition: queue order keeps `[remaining layer k | newly discovered layer k+1]`, so layer `k + 1` nodes wait behind any remaining layer `k` nodes.
9. Complexity: adjacency-list BFS is `O(V + E)` time and `O(V)` space.
10. Common confusions: BFS versus DFS, queue versus stack, visited timing, unweighted versus weighted, parent versus distance.
11. Connections: graph basics provides adjacency; Dijkstra generalizes the frontier idea for weights.
12. Exercises: predict queue states, distances, parents, and failure under stack or weighted edges.

## Vocabulary Scaffolding

Introduce terms inline before relying on them:

- Queue / 队列（queue）: first-in, first-out waiting line.
- Frontier / 前沿（frontier）: discovered nodes waiting to expand, represented by the queue in this page.
- Discovered / visited / 已发现/已访问（discovered/visited）: nodes already seen and enqueued, so they are not enqueued again. This page uses `discovered` for the state label and may map it to a code set named `visited`.
- Expanded / 已展开（expanded）: nodes already dequeued and processed. Expanded is separate from discovered.
- Distance / layer / 距离/层（distance/layer）: number of edges from the start in an unweighted graph.
- Parent / predecessor / 父节点/前驱（parent/predecessor）: the node that first discovered this node; used to reconstruct a shortest path tree.
- Unweighted graph / 无权图（unweighted graph）: each edge counts as one step; visual edge length is irrelevant.

## Shared Trace Fixture

Replace the current tree-like `A-F` demo with a small undirected room graph that has repeated attempts to reach `G`, so discovered/visited state and `parent` matter. Corridors are two-way, so adjacency is symmetric. Render corridors as undirected lines, not arrows.

```ts
const nodes = ["A", "B", "C", "D", "E", "F", "G"];

const adjacency = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B", "G"],
  E: ["B", "G"],
  F: ["C", "G"],
  G: ["D", "E", "F"]
};
```

Golden BFS from `A`:

- `distance[A] = 0`
- `distance[B] = 1`, `parent[B] = A`
- `distance[C] = 1`, `parent[C] = A`
- `distance[D] = 2`, `parent[D] = B`
- `distance[E] = 2`, `parent[E] = B`
- `distance[F] = 2`, `parent[F] = C`
- `distance[G] = 3`, `parent[G] = D` under deterministic neighbor order

Canonical order rule:

- The exported fixture order is canonical: `nodes` order controls table/display order, and each `adjacency[node]` array controls neighbor scan order.
- Every scenario, section-level figure, trace table, exercise, and comparison widget renders neighbors in that exported order unless it is explicitly marked as a separate variant fixture.
- Tests should fail if rendered neighbor order, trace scan order, queue order, or final parent choice diverges from the exported fixture. In this fixture, `D` scans `G` before `E` and `F` later try the already-discovered `G`, so `parent[G]` stays `D`.

Golden queue states:

1. Start: queue `[A]`, discovered `{A}`, expanded `{}`.
2. Expand `A`: discover `B`, then `C`; each discovery immediately marks visited, assigns distance/parent, and enqueues; queue `[B, C]`; expanded `{A}`.
3. Expand `B`: skip `A`, discover `D`, then `E`; queue `[C, D, E]`; expanded `{A, B}`.
4. Expand `C`: skip `A`, discover `F`; queue `[D, E, F]`; expanded `{A, B, C}`.
5. Expand `D`: skip `B`, discover `G`; queue `[E, F, G]`; expanded `{A, B, C, D}`.
6. Expand `E`: skip `B` and `G` because both are already discovered; queue `[F, G]`.
7. Expand `F`: skip `C` and `G` because both are already discovered; queue `[G]`.
8. Expand `G`: queue `[]`; expanded `{A, B, C, D, E, F, G}`.

State legend:

- `unseen`: not yet discovered and not in the queue.
- `discovered/queued`: already found and either in the queue or waiting to be expanded; code may store this in `visited`.
- `expanded`: already dequeued and fully scanned.

Trace granularity rule:

- First discovery is one atomic visual step: mark discovered/visited, assign `distance`, assign `parent`, and enqueue.
- The code may perform those operations as adjacent lines, but the trace must not expose an unsupported state such as `G` discovered but not queued.
- Distance and parent changes are annotations inside the `discover` step, not separate trace rows or phases.

Required fine-grained trace around `D`:

| Trace ID | `BfsStep.phase` | Visible state change |
|---|---|---|
| `after-expand-C` | `finish-node` | Queue is `[D, E, F]`; `D` is next; discovered `{A, B, C, D, E, F}`; expanded `{A, B, C}`. |
| `after-dequeue-D` | `dequeue` | Queue changes from `[D, E, F]` to `[E, F]`; current node becomes `D`. |
| `skip-D-B` | `skip-discovered` | Edge label says `skip D-B`; `B` is already expanded. |
| `scan-D-G` | `scan-neighbor` | Edge label says `scanning edge D-G`; `G` is still unseen. |
| `discover-G-from-D` | `discover` | Atomic step: `visited.add(G)`, `distance[G] = distance[D] + 1 = 3`, `parent[G] = D`, and `queue.push(G)`; queue becomes `[E, F, G]`. |
| `after-expand-D` | `finish-node` | `D` moves to expanded; queue remains `[E, F, G]`. |
| `after-dequeue-E` | `dequeue` | Queue changes from `[E, F, G]` to `[F, G]`; current node becomes `E`. |
| `skip-E-G` | `skip-discovered` | Edge label says `skip E-G`; `G` is already discovered and keeps parent `D`. |
| `after-dequeue-F` | `dequeue` | Queue changes from `[F, G]` to `[G]`; current node becomes `F`. |
| `skip-F-G` | `skip-discovered` | Edge label says `skip F-G`; `G` is already discovered and keeps parent `D`. |

Tiny delayed-marking caution:

| Step | Main visited-on-discovery behavior | If marking is delayed until dequeue without a guard |
|---|---|---|
| `E` scans `G` | Skip: `G` already discovered from `D`. | `E` may enqueue duplicate `G`. |
| `F` scans `G` | Skip: `G` already discovered from `D`. | `F` may enqueue another duplicate `G`. |

Important golden expectations:

- `G` is not re-parented by `E` or `F` after first discovery.
- Neighbor order is deterministic display/trace order, not a property of BFS correctness.
- Visual edge length never represents distance; one unweighted edge always counts as one step.
- The main algorithm teaches discovered/visited-on-discovery/enqueue. Visited-on-dequeue is only an optional caution, because it can create duplicate queue entries unless another guard prevents duplicates.

## Stack-Comparison Variant

Use the main fixture first when introducing the failure mode: show a deep wandering order on the same room graph, highlighting `A -> B -> D -> G` while closer layer-1/2 alternatives `C` and `F` are still unchecked. That local transition keeps the learner on the shared example and makes the pain concrete: a deep policy can reach `G` before nearby options have been expanded.

Only after that, switch to the queue-versus-stack micro-widget below. Its job is narrower: isolate FIFO queue order versus LIFO stack order without the extra cross-edges of the room graph.

The comparison graph is a directed toy graph. Render arrows and label it `directed order toy`, so learners do not expect symmetric corridors as in the main room graph:

```ts
const stackComparisonAdjacency = {
  A: ["C", "B"],
  B: ["D"],
  C: ["X"],
  D: ["E"],
  E: ["X"],
  X: []
};
```

Stack convention: scan outgoing neighbors left-to-right, push each discovered neighbor in that order, and pop the rightmost item next. The visual stack must show a `top` marker on the rightmost item. With this directed variant's explicit neighbor order, a stack that processes the most recently discovered node first expands `B -> D -> E` before returning to `C`, so it can discover `X` through the longer path before the closer two-edge path `A -> C -> X` is expanded. The table should prove only this narrow point: FIFO queue order preserves nondecreasing layer expansion, while a stack-like policy can expose deeper nodes before all closer alternatives are expanded. It should not claim DFS never finds a shortest path in every graph.

## Section-Level Visual Inventory

No major section should be prose-only. Short prose bridges are acceptable between adjacent visual states.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Static graph with rings from `A`: layer 0, 1, 2, 3. | What result are we trying to produce before naming BFS? |
| First naive idea | Split figure: deep path `A -> B -> D -> G` highlighted while `C` remains near but unchecked. | Why might following one path feel natural? |
| Where it breaks | Local main-graph transition showing deep wandering visits `G` before `C/F`, followed by the directed stack-comparison toy graph to isolate FIFO versus LIFO order. | Why can discovery order lie without FIFO? |
| Core invention | Queue strip plus graph figure at trace step 3: `C` waits before `D` and `E`. | How does FIFO repair the distance order? |
| Interactive visual demo | Improved `QueueWaveDemo`: step/reset, optional play/pause, graph, queue, discovered/visited set, expanded set, distance table, parent table, and current explanation. | How does the whole trace unfold? |
| Formal version | Trace-linked state table: `current`, `queue`, newly discovered neighbors, skipped discovered neighbors, with rows bound to IDs such as `after-dequeue-D`, `scan-D-G`, `discover-G-from-D`, and `skip-E-G`. | How does the story map to algorithm state? |
| Implementation sketch | Code-to-trace table for `const current = queue[head++]`, neighbor loop, `visited.add`, `distance[neighbor]`, `parent[neighbor]`, and `push`. | Which code line creates each visible state change? |
| Correctness intuition | Layer barrier figure with split queue `[remaining layer k | newly discovered layer k+1]`. | Why does first discovery give shortest edge distance? |
| Complexity | Edge-scan checklist over the fixture; each adjacency row checked once. | Why is the work `O(V + E)`? |
| Common confusions | Four mini-cards with concrete local visuals: queue/stack strip with `top` marker, delayed-marking duplicate-`G` queue strip, weighted counterexample with edge weights, and parent-vs-distance tree/path reconstruction. | Which mistakes break or misread BFS? |
| Connections | Local graph snippet `graph-basics -> bfs -> dijkstra`. | How does BFS fit in the concept graph? |
| Exercises | Prediction widgets using frozen trace states: next queue, next parent, true/false weighted claim. | Can the learner apply the trace rules without a new example? |

Section-level snapshot rule:

- Each static figure or local widget must be understandable without first using the master demo.
- Each snapshot needs a caption, visible queue state, current node or current edge, and one local rule sentence such as `When a neighbor is first discovered, mark it visited, set its distance and parent, then enqueue it.`
- Snapshot data must reference concrete trace IDs rather than anonymous step numbers. Required IDs include `start`, `after-expand-A`, `after-expand-B`, `after-expand-C`, `after-dequeue-D`, `scan-D-G`, `discover-G-from-D`, `after-expand-D`, `skip-E-G`, `skip-F-G`, and `done`.

Implementation sketch convention:

```ts
const queue: MainBfsNodeId[] = [start];
let head = 0;
const visited = new Set<MainBfsNodeId>([start]);
const distance: Partial<Record<MainBfsNodeId, number>> = { [start]: 0 };
const parent: Partial<Record<MainBfsNodeId, MainBfsNodeId>> = {};

while (head < queue.length) {
  const current = queue[head++];
  for (const neighbor of adjacency[current]) {
    if (visited.has(neighbor)) continue;
    visited.add(neighbor);
    distance[neighbor] = distance[current] + 1;
    parent[neighbor] = current;
    queue.push(neighbor);
  }
}
```

The start trace state maps directly to these initialized structures: queue `[A]`, discovered/visited `{A}`, `distance[A] = 0`, and no parent for `A`. The visual dequeue operation maps to `const current = queue[head++]`, not `queue.shift()`, so the TypeScript implementation preserves `O(V + E)` time. Each `discover` trace step maps to the adjacent block `visited.add`, `distance[...]`, `parent[...]`, and `queue.push(...)`.

Common-confusion mini-card visuals:

- Queue versus stack: two horizontal strips on the directed toy graph; queue removes from the left/front, stack pops from the right/top, with `X` discovered through the longer stack path highlighted.
- Delayed marking: duplicate-`G` queue strip showing `[F, G, G]` or `[G, G]` in the caution variant, next to the main behavior where `E-G` and `F-G` are skipped after `discover-G-from-D`.
- Weighted edges: separate weighted triangle with visible labels `A-B = 10`, `A-C = 1`, `C-B = 1`, plus badges `fewest edges: A-B` and `lowest cost: A-C-B`.
- Parent versus distance: shortest-path tree from the main trace with parent arrows, and a reconstruction strip `G <- D <- B <- A` reversed into `A -> B -> D -> G`; distance labels remain numbers, not arrows.

Weighted-edge counterexample:

- Use a separate weighted mini-graph with edges `A-B` weight `10`, `A-C` weight `1`, and `C-B` weight `1`.
- BFS reaches `B` by the one-edge path `A-B`, so it finds the path with the fewest edges.
- The lowest-total-cost path is `A-C-B` with cost `2`, so the figure must label `fewest edges` separately from `lowest total cost`.

## Component And State Model

Future implementation targets:

```text
src/components/interactive/bfsTrace.ts
src/components/interactive/BfsScenarioFigure.tsx
src/components/interactive/QueueWaveDemo.tsx
src/components/interactive/BfsPredictionPrompt.tsx
```

Suggested trace types:

```ts
type MainBfsNodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type StackComparisonNodeId = "A" | "B" | "C" | "D" | "E" | "X";
type WeightedCounterexampleNodeId = "A" | "B" | "C";

type BfsStep<NodeId extends string = MainBfsNodeId> = {
  id: string;
  phase: "start" | "dequeue" | "scan-neighbor" | "discover" | "skip-discovered" | "finish-node" | "done";
  current?: NodeId;
  activeNeighbor?: NodeId;
  queue: NodeId[];
  discovered: NodeId[];
  expanded: NodeId[];
  distance: Partial<Record<NodeId, number>>;
  parent: Partial<Record<NodeId, NodeId>>;
  newlyDiscovered?: NodeId[];
  skipped?: NodeId[];
  explanation: Record<Locale, string>;
};

type BfsScenario<NodeId extends string = MainBfsNodeId> = {
  id:
    | "hook-layers"
    | "naive-deep-path"
    | "queue-vs-stack"
    | "fifo-repair"
    | "formal-state"
    | "code-trace"
    | "layer-barrier"
    | "edge-scan-cost"
    | "visited-timing"
    | "weighted-counterexample"
    | "parent-vs-distance";
  traceStepId?: string;
  highlightedNodes?: NodeId[];
  highlightedEdges?: Array<[NodeId, NodeId]>;
  comparisonMode?: "bfs" | "stack";
  stackTop?: NodeId;
  caption: Record<Locale, string>;
  ariaLabel: Record<Locale, string>;
};
```

Scenario figures should bind to exact trace IDs, not duplicate state manually. `QueueWaveDemo` should consume the same exported main trace. The stack comparison and weighted counterexample should use their own typed fixtures, not unsafe casts into `MainBfsNodeId`. Tests should assert queue order, neighbor scan order, rendered neighbor order, final distances, final parents, and skipped discovered/visited cases.

`BfsStep.phase` must stay aligned with the trace granularity. `discover` means the compound first-discovery transaction; it includes visited/discovered marking, distance assignment, parent assignment, and enqueue. Use `finish-node` for snapshots such as `after-expand-D` where no neighbor state changes but the current node becomes expanded.

Layer-barrier detail:

- Show the queue as a split strip: `[remaining layer k | newly discovered layer k+1]`.
- The invariant is not that layer `k + 1` is absent while layer `k` is processing. It is that all remaining layer-`k` nodes stay in front of newly discovered layer-`k + 1` nodes, so no layer-`k + 1` node is expanded before layer `k` is exhausted.
- Example after expanding `B`: queue `[C | D, E]`, where `C` is the remaining layer-1 node and `D, E` are newly discovered layer-2 nodes.

## Accessibility And Mobile

- SVG must have `role="img"` and a localized `aria-label`.
- Do not rely on color alone; pair color with labels like `current`, `unseen`, `discovered/queued`, `expanded`, and `skipped`.
- Queue, distance, and parent tables should be real text, not only SVG.
- Controls need descriptive labels: `Next BFS step`, `Previous BFS step`, `Reset BFS trace`, and optional `Play BFS trace`.
- Previous and next controls should be disabled at trace boundaries, with labels still clear to screen readers.
- Use `aria-live="polite"` for the current step explanation.
- Respect reduced motion; step changes must work without animation.
- Mobile layout should stack graph, queue, and tables vertically. The queue strip must wrap without changing node order.
- Mobile tables should collapse into compact key-value rows instead of shrinking columns until labels become unreadable.
- Tap targets should be at least 44px high.
- Exercises must be keyboard-operable.
- Edge state must include non-color annotations such as `scanning edge D-G`, `discover: G`, and `skip: G already discovered`.

## Graph Placement

Keep the current graph chain:

```text
graph-basics -> bfs -> dijkstra
```

Recommended `graph-basics -> bfs` edge:

```ts
{
  from: "graph-basics",
  to: "bfs",
  type: "prerequisite",
  reason: {
    en: "BFS repeatedly asks for each node's immediate neighbors, so it depends on nodes, edges, and adjacency.",
    zh: "BFS 会反复查看每个节点的直接邻居，因此需要节点、边和邻接关系这些图的基础。"
  }
}
```

Recommended `bfs -> dijkstra` edge:

```ts
{
  from: "bfs",
  to: "dijkstra",
  type: "generalizes",
  reason: {
    en: "Dijkstra keeps BFS's frontier-and-distance idea, but chooses the next node by smallest total cost instead of queue order.",
    zh: "Dijkstra 保留 BFS 的前沿和距离思想，但按当前总成本最小来选择下一个节点，而不是只按队列顺序。"
  }
}
```

## Acceptance Criteria

- English and Chinese BFS pages follow the progressive teaching arc.
- Chinese page keeps `translationStatus: needs-review` until human-reviewed.
- Every major section has a trace-linked visual, widget, table, or explicit local scaffold.
- `QueueWaveDemo` uses shared deterministic trace data.
- Final BFS distances, parents, queue states, and skipped discovered-neighbor states are testable.
- The page explains BFS shortest paths only for unweighted graphs.
- Queue order, discovered/visited-on-discovery, and no-reparent behavior are visible in the trace and exercises.
- Section-level snapshots are independently understandable: caption, visible queue, current node/edge, and local rule sentence.
- Every scenario references an existing exported trace ID, except explicitly separate variant fixtures such as `queue-vs-stack` and `weighted-counterexample`.
- No figure duplicates trace state manually; figures derive queue, discovered, expanded, distance, parent, current node, and current edge from shared trace or typed variant trace data.
- Accessibility labels, keyboard controls, visible state text, and mobile stacking are present.
- Previous/next controls disable at trace boundaries; mobile tables collapse to readable key-value rows.
- Non-color edge annotations communicate scan, discover, and skip states.
- Graph edge reasons are localized and consistent with `src/data/graph.ts`.

## Validation Commands

After implementation:

```bash
npm run check
npm run test
npm run build
```

For faster content-only iteration, `npm run validate` can be run before the full check/test/build sequence.
