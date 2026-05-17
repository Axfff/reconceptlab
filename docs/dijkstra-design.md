# Dijkstra Node Design

## Node Scope

`dijkstra` is an intermediate algorithm node after `bfs`, focused on single-source shortest paths in graphs with nonnegative edge weights.

In scope:

- Why BFS is insufficient when edges have different costs.
- Dijkstra as BFS's frontier idea ordered by smallest tentative total cost.
- Weight/cost edges, tentative distance, relaxation, settled/finalized nodes, priority queue/min-heap, stale priority-queue entries, and the nonnegative-edge requirement.
- Deterministic trace data shared by section figures, exercises, and a future master demo.
- Implementation with adjacency lists and a min-heap style priority queue.

Out of scope:

- Negative weights and Bellman-Ford beyond a warning/counterexample.
- A*, heuristics, bidirectional Dijkstra, all-pairs shortest paths, Fibonacci heaps, path counting, dynamic graphs, or proof-heavy graph theory.
- Runtime-generated visualization state or network-dependent demos.

## Proposed Frontmatter

English page:

```yaml
id: dijkstra
locale: en
title: Dijkstra's Algorithm
summary: Find lowest-cost paths in a nonnegative weighted graph by always settling the cheapest tentative node next.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: algorithm
tags:
  - graphs
  - algorithms
  - shortest-paths
prerequisites:
  - bfs
next: []
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

Chinese page:

```yaml
id: dijkstra
locale: zh
title: Dijkstra 算法
summary: 在非负带权图中，每次确定当前暂定总代价最低的节点，从而找到从起点出发的最低代价路径。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: algorithm
tags:
  - graphs
  - algorithms
  - shortest-paths
prerequisites:
  - bfs
next: []
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

## Teaching Arc

1. Hook problem: travel from one room or city to all others when each road has a different travel time.
2. First naive idea: reuse BFS and count the number of edges.
3. Pain point: fewer edges can cost more than a longer-looking route.
4. Core invention: keep tentative best-known costs and always settle the unsettled node with the smallest tentative cost.
5. Visual anchors: every section uses one shared weighted graph and named trace states unless explicitly marked as a variant.
6. Formal version: define source `s`, edge weight `w(u, v) >= 0`, `dist[v]`, `parent[v]`, settled set, and relaxation.
7. Implementation sketch: adjacency list, `dist`, `parent`, `settled`, min-heap entries `{ node, distance }`, and stale-entry skip.
8. Correctness intuition: when all remaining edges are nonnegative, the cheapest tentative unsettled node cannot later be improved through a more expensive prefix.
9. Complexity: `O((V + E) log V)` with a binary heap and duplicate heap entries; `O(V + E)` space. For the fixture, 9 undirected edges become 18 directed neighbor scans, and duplicate heap pushes create the visible stale skips.
10. Common confusions: BFS versus Dijkstra, discovered versus settled, tentative versus final distance, heap entry versus node state, stale entries, negative edges.
11. Connections: Dijkstra generalizes BFS frontier ordering from FIFO to lowest total cost.
12. Exercises: predict relaxation, next heap pop, stale-entry skip, final path, and why a negative edge breaks the promise.

## Vocabulary Scaffolding

Introduce these inline before formal notation:

- Weight / cost: a number on an edge, such as travel time or risk. Chinese: `权重/代价（weight/cost）`.
- Tentative distance: the best total cost found so far, not yet guaranteed final. Chinese: `暂定距离（tentative distance）`.
- Relaxation: try going through the current node to improve a neighbor's tentative distance. Chinese: `松弛（relaxation）`.
- Settled / finalized: a node whose tentative distance is now proven final. Chinese: `已确定/已最终确定（settled/finalized）`.
- Priority queue / min-heap: a frontier structure that removes the smallest distance entry first. Chinese: `优先队列/最小堆（priority queue/min-heap）`.
- Stale entry: an old heap entry whose distance is worse than the current `dist[node]`; skip it. Chinese: `过期条目（stale entry）`.
- Nonnegative edge: every edge weight is `>= 0`; this is the condition that makes settling safe. Chinese: `非负边（nonnegative edge）`.

## Shared Trace Fixture

Use one undirected weighted graph for the main story:

```ts
const nodes = ["A", "B", "C", "D", "E", "F"];

const weightedEdges = [
  ["A", "B", 4],
  ["A", "C", 1],
  ["C", "B", 2],
  ["B", "D", 1],
  ["C", "D", 5],
  ["C", "E", 8],
  ["D", "E", 3],
  ["D", "F", 6],
  ["E", "F", 1]
] as const;
```

Unreachable-edge-case fixture for one compact figure:

```ts
const disconnectedNodes = ["A", "B", "C", "D", "E", "F", "G"] as const;
```

`G` is isolated: it has no incident edges, never enters the heap after reachable work from `A` finishes, and remains `dist[G] = Infinity`, `parent[G] = undefined`, unsettled. This figure should sit near the final table or common confusions so learners see that Dijkstra computes all reachable distances and leaves unreachable nodes explicitly marked.

Golden shortest paths from `A`:

- `dist[A] = 0`, `parent[A] = undefined`
- `dist[C] = 1`, `parent[C] = A`
- `dist[B] = 3`, `parent[B] = C`
- `dist[D] = 4`, `parent[D] = B`
- `dist[E] = 7`, `parent[E] = D`
- `dist[F] = 8`, `parent[F] = E`

Dijkstra computes the complete distance table for all reachable nodes, not only one destination:

| Node | Final distance from `A` | Parent |
|---|---:|---|
| `A` | `0` | none |
| `B` | `3` | `C` |
| `C` | `1` | `A` |
| `D` | `4` | `B` |
| `E` | `7` | `D` |
| `F` | `8` | `E` |

The page may inspect `F` as one recovered path example, highlighted as `A -> C -> B -> D -> E -> F`, but the algorithm output is the full table above.

Route reconstruction visual:

```text
F --parent--> E --parent--> D --parent--> B --parent--> C --parent--> A
reverse
A -> C -> B -> D -> E -> F
```

Place this near the formal version or final table. The visual should show backward parent-arrow following first, then the explicit reverse step, so learners do not confuse parent pointers with forward adjacency.

Derived undirected adjacency for the main fixture:

```ts
const adjacency = {
  A: [
    ["B", 4],
    ["C", 1]
  ],
  B: [
    ["A", 4],
    ["C", 2],
    ["D", 1]
  ],
  C: [
    ["A", 1],
    ["B", 2],
    ["D", 5],
    ["E", 8]
  ],
  D: [
    ["B", 1],
    ["C", 5],
    ["E", 3],
    ["F", 6]
  ],
  E: [
    ["C", 8],
    ["D", 3],
    ["F", 1]
  ],
  F: [
    ["D", 6],
    ["E", 1]
  ]
} as const;
```

Canonical scan order is the order shown above, derived by expanding `weightedEdges` into both directions and preserving first appearance. Scans toward already settled nodes should appear as visible `relax-no-change` steps when they teach the invariant or explain why no re-parenting happens; dense demo playback may collapse them, but the canonical trace keeps testable IDs for them.

Compact implementation pseudocode with exact guard order:

```ts
dist[source] = 0;
heap.push({ node: source, distance: 0 });

while (!heap.isEmpty()) {
  const entry = heap.popMin();
  const { node, distance } = entry;

  // Guard 1: duplicate heap entry is stale because a better distance is current.
  if (distance !== dist[node]) {
    emitSkipStale(entry);
    continue;
  }

  // Guard 2: the node was already finalized by an earlier fresh entry.
  if (settled.has(node)) {
    emitSkipStale(entry);
    continue;
  }

  settled.add(node);
  emitSettled(node, entry);

  for (const [neighbor, weight] of adjacency[node]) {
    emitScanEdge(node, neighbor);

    if (settled.has(neighbor)) {
      emitRelaxNoChange("neighbor-settled");
      continue;
    }

    const candidate = dist[node] + weight;
    if (candidate < dist[neighbor]) {
      dist[neighbor] = candidate;
      parent[neighbor] = node;
      heap.push({ node: neighbor, distance: candidate });
      emitRelaxUpdate(neighbor);
    } else {
      emitRelaxNoChange("candidate-not-better");
    }
  }
}
```

Settled is added only after both heap-entry guards pass. Scans to settled neighbors are still visible as no-change steps, but they never relax, never push a heap entry, and never change `parent`.

Precise canonical trace contract. Heap entries are displayed in canonical `[distance,nodeId]` order, with the visible caveat: "shown sorted for reading; real heap only promises the next minimum." For `pop-*` and `skip-stale-*` rows, the popped entry must be recorded separately from the visible remaining heap so visuals/tests can distinguish entries such as `(B,3)` and `(B,4)`. For `skip-stale-*` rows, the stale entry named in the step ID has just been popped; the heap columns show the remaining heap before and after the skip guard.

| Step ID | Phase | Heap before | Heap after | Dist / parent change | Explanation |
|---|---|---|---|---|---|
| `start` | `start` | `[]` | `[(A,0)]` | `dist[A]=0`; others `Infinity`; no parents | Initialize the source. |
| `pop-A` | `pop` | `[(A,0)]` | `[]` | none | `A` is the cheapest heap entry. |
| `settle-A` | `settle` | `[]` | `[]` | settled adds `A` | `A` is now final. |
| `scan-A-B` | `scan-edge` | `[]` | `[]` | candidate `0+4=4` | Check the road from `A` to `B`. |
| `relax-A-B` | `relax-update` | `[]` | `[(B,4)]` | `dist[B]: Infinity -> 4`; `parent[B]=A` | First known path to `B`. |
| `scan-A-C` | `scan-edge` | `[(B,4)]` | `[(B,4)]` | candidate `0+1=1` | Check the road from `A` to `C`. |
| `relax-A-C` | `relax-update` | `[(B,4)]` | `[(C,1),(B,4)]` | `dist[C]: Infinity -> 1`; `parent[C]=A` | `C` becomes the next cheapest tentative node. |
| `pop-C` | `pop` | `[(C,1),(B,4)]` | `[(B,4)]` | none | Pop the cheapest tentative node. |
| `settle-C` | `settle` | `[(B,4)]` | `[(B,4)]` | settled adds `C` | `C` is final before scanning its neighbors. |
| `scan-C-A` | `scan-edge` | `[(B,4)]` | `[(B,4)]` | candidate `1+1=2` | Reverse edge to settled `A`; no re-parenting. |
| `relax-no-change-C-A` | `relax-no-change` | `[(B,4)]` | `[(B,4)]` | none | `A` is already settled at `0`. |
| `scan-C-B` | `scan-edge` | `[(B,4)]` | `[(B,4)]` | candidate `1+2=3` | Try reaching `B` through `C`. |
| `relax-C-B` | `relax-update` | `[(B,4)]` | `[(B,3),(B,4)]` | `dist[B]: 4 -> 3`; `parent[B]: A -> C` | Duplicate heap entries are allowed; `(B,4)` becomes stale. |
| `scan-C-D` | `scan-edge` | `[(B,3),(B,4)]` | `[(B,3),(B,4)]` | candidate `1+5=6` | Try reaching `D` through `C`. |
| `relax-C-D` | `relax-update` | `[(B,3),(B,4)]` | `[(B,3),(B,4),(D,6)]` | `dist[D]: Infinity -> 6`; `parent[D]=C` | First known path to `D`. |
| `scan-C-E` | `scan-edge` | `[(B,3),(B,4),(D,6)]` | `[(B,3),(B,4),(D,6)]` | candidate `1+8=9` | Try reaching `E` through `C`. |
| `relax-C-E` | `relax-update` | `[(B,3),(B,4),(D,6)]` | `[(B,3),(B,4),(D,6),(E,9)]` | `dist[E]: Infinity -> 9`; `parent[E]=C` | First known path to `E`. |
| `pop-B-3` | `pop` | `[(B,3),(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | none | Pop the fresh `B` entry. |
| `settle-B` | `settle` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | settled adds `B` | `B` is final at cost `3`. |
| `scan-B-A` | `scan-edge` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | candidate `3+4=7` | Reverse edge to settled `A`. |
| `relax-no-change-B-A` | `relax-no-change` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | none | Settled `A` remains `0`. |
| `scan-B-C` | `scan-edge` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | candidate `3+2=5` | Reverse edge to settled `C`. |
| `relax-no-change-B-C` | `relax-no-change` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | none | Settled `C` remains `1`. |
| `scan-B-D` | `scan-edge` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,6),(E,9)]` | candidate `3+1=4` | Try reaching `D` through `B`. |
| `relax-B-D` | `relax-update` | `[(B,4),(D,6),(E,9)]` | `[(B,4),(D,4),(D,6),(E,9)]` | `dist[D]: 6 -> 4`; `parent[D]: C -> B` | `(D,6)` becomes stale. |
| `pop-B-4` | `pop` | `[(B,4),(D,4),(D,6),(E,9)]` | `[(D,4),(D,6),(E,9)]` | none | The old `B` entry reaches the top. |
| `skip-stale-B-4` | `skip-stale` | `[(D,4),(D,6),(E,9)]` | `[(D,4),(D,6),(E,9)]` | none | Skip because `B` is already settled and `4 > dist[B]`. |
| `pop-D-4` | `pop` | `[(D,4),(D,6),(E,9)]` | `[(D,6),(E,9)]` | none | Pop the fresh `D` entry. |
| `settle-D` | `settle` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | settled adds `D` | `D` is final at cost `4`. |
| `scan-D-B` | `scan-edge` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | candidate `4+1=5` | Reverse edge to settled `B`. |
| `relax-no-change-D-B` | `relax-no-change` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | none | Settled `B` remains `3`. |
| `scan-D-C` | `scan-edge` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | candidate `4+5=9` | Reverse edge to settled `C`. |
| `relax-no-change-D-C` | `relax-no-change` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | none | Settled `C` remains `1`. |
| `scan-D-E` | `scan-edge` | `[(D,6),(E,9)]` | `[(D,6),(E,9)]` | candidate `4+3=7` | Try reaching `E` through `D`. |
| `relax-D-E` | `relax-update` | `[(D,6),(E,9)]` | `[(D,6),(E,7),(E,9)]` | `dist[E]: 9 -> 7`; `parent[E]: C -> D` | `(E,9)` becomes stale. |
| `scan-D-F` | `scan-edge` | `[(D,6),(E,7),(E,9)]` | `[(D,6),(E,7),(E,9)]` | candidate `4+6=10` | Try reaching `F` through `D`. |
| `relax-D-F` | `relax-update` | `[(D,6),(E,7),(E,9)]` | `[(D,6),(E,7),(E,9),(F,10)]` | `dist[F]: Infinity -> 10`; `parent[F]=D` | First known path to `F`. |
| `pop-D-6` | `pop` | `[(D,6),(E,7),(E,9),(F,10)]` | `[(E,7),(E,9),(F,10)]` | none | The old `D` entry reaches the top. |
| `skip-stale-D-6` | `skip-stale` | `[(E,7),(E,9),(F,10)]` | `[(E,7),(E,9),(F,10)]` | none | Skip because `D` is already settled and `6 > dist[D]`. |
| `pop-E-7` | `pop` | `[(E,7),(E,9),(F,10)]` | `[(E,9),(F,10)]` | none | Pop the fresh `E` entry. |
| `settle-E` | `settle` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | settled adds `E` | `E` is final at cost `7`. |
| `scan-E-C` | `scan-edge` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | candidate `7+8=15` | Reverse edge to settled `C`. |
| `relax-no-change-E-C` | `relax-no-change` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | none | Settled `C` remains `1`. |
| `scan-E-D` | `scan-edge` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | candidate `7+3=10` | Reverse edge to settled `D`. |
| `relax-no-change-E-D` | `relax-no-change` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | none | Settled `D` remains `4`. |
| `scan-E-F` | `scan-edge` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | candidate `7+1=8` | Try reaching `F` through `E`. |
| `relax-E-F` | `relax-update` | `[(E,9),(F,10)]` | `[(E,9),(F,8),(F,10)]` | `dist[F]: 10 -> 8`; `parent[F]: D -> E` | `(F,10)` becomes stale. |
| `pop-F-8` | `pop` | `[(E,9),(F,8),(F,10)]` | `[(E,9),(F,10)]` | none | Pop the fresh `F` entry. |
| `settle-F` | `settle` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | settled adds `F` | `F` is final at cost `8`. |
| `scan-F-D` | `scan-edge` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | candidate `8+6=14` | Reverse edge to settled `D`. |
| `relax-no-change-F-D` | `relax-no-change` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | none | Settled `D` remains `4`. |
| `scan-F-E` | `scan-edge` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | candidate `8+1=9` | Reverse edge to settled `E`. |
| `relax-no-change-F-E` | `relax-no-change` | `[(E,9),(F,10)]` | `[(E,9),(F,10)]` | none | Settled `E` remains `7`. |
| `pop-E-9` | `pop` | `[(E,9),(F,10)]` | `[(F,10)]` | none | The old `E` entry reaches the top. |
| `skip-stale-E-9` | `skip-stale` | `[(F,10)]` | `[(F,10)]` | none | Skip because `E` is already settled and `9 > dist[E]`. |
| `pop-F-10` | `pop` | `[(F,10)]` | `[]` | none | The old `F` entry reaches the top. |
| `skip-stale-F-10` | `skip-stale` | `[]` | `[]` | none | Skip because `F` is already settled and `10 > dist[F]`. |
| `done` | `done` | `[]` | `[]` | final path to `F`: `A -> C -> B -> D -> E -> F` | All reachable nodes are settled. |

Important trace moments for prose summaries:

- Start: `dist[A] = 0`, all others `Infinity`, heap `[(A, 0)]`.
- Settle `A`: relax `A-B` to `4`, `A-C` to `1`; heap `[(C, 1), (B, 4)]`.
- Settle `C`: improve `B` from `4` to `3`, set `D` to `6`, set `E` to `9`; heap now includes stale future entry `(B, 4)`.
- Settle `B` at `3`: improve `D` from `6` to `4`.
- Skip stale `(B, 4)` if popped after `B` is already settled or if its entry distance is greater than `dist[B]`.
- Settle `D`: improve `E` from `9` to `7`, set `F` to `10`.
- Settle `E`: improve `F` from `10` to `8`.
- Done: final parent path to `F` is `A -> C -> B -> D -> E -> F`, total cost `8`.

Canonical ordering:

- Node display follows `nodes`.
- Adjacency scan order follows the derived adjacency object above.
- Heap visualization sorts by `[distance, nodeId]` for deterministic display and testing, while every heap figure/demo visibly explains: "shown sorted for reading; real heap only promises the next minimum."
- Zero-weight edges are allowed. Equal tentative-distance ties can be settled in deterministic `[distance, nodeId]` order for display and tests, but the tie order is not part of Dijkstra's correctness.

Negative-edge warning variant:

Keep this separate from the undirected main fixture and type it separately from the main `DijkstraNodeId` union. Label the visual as a directed graph and explicitly say it is not the same map as the main example. Use a tiny directed graph so the page does not imply that adding one negative undirected edge merely causes a wrong answer; an undirected negative edge creates a two-edge negative cycle by going back and forth.

```ts
const negativeDirectedVariant = {
  nodes: ["S", "A", "B"],
  directedEdges: [
    ["S", "A", 2],
    ["S", "B", 5],
    ["B", "A", -4]
  ]
} as const;
```

If Dijkstra settles `A` at cost `2` before scanning `B -> A`, the later directed negative edge would offer cost `1`. This is a warning about the nonnegative-edge precondition, not part of the main undirected trace. The visual should emphasize that the settled-state promise fails: `A` was labeled final at `2`, but a later path proposes `1`. Bellman-Ford belongs only as a named future contrast.

The warning visual is a three-panel static figure:

1. Directed variant, not the main map: settle `A = 2` from `S -> A`.
2. Later inspect `B -> A`: candidate `5 + (-4) = 1`.
3. Show the contradiction label: "settled was supposed to mean final, but `1 < 2`."

The implementation should show the forbidden candidate and contradiction without mutating the settled state, re-parenting `A`, or mixing these `S/A/B` nodes into the main fixture trace.

## Section-Level Visual Inventory

No major section should be prose-only. Short transition paragraphs are fine when adjacent figures already carry the state.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Static weighted map from `A` bound to `traceStepId: "start"`; edge badges show costs, and a sidebar compares "few roads" with "cheap route." | What changed from BFS's equal-step world? |
| First naive idea | BFS-style layer figure on the same graph, highlighting direct `A-B` cost `4` before cheaper `A-C-B` cost `3`. Include trace strip: queue `[B,C]`, `parent[B]=A`, then `C -> B` ignored by BFS-style visited rule. | Why does counting edges feel tempting? |
| Where it breaks | Before/after route cards: `A -> B = 4` versus `A -> C -> B = 3`; label "first discovered/final by edge count" separately from "lowest cost." | Why is first discovery no longer enough? |
| Core invention | Tentative-distance table plus min-heap strip bound to `traceStepId: "relax-A-C"` and `traceStepId: "relax-C-B"`. Add a tiny queue-vs-priority-queue comparison: FIFO queue pops first-in; priority queue pops the smallest label. Do not teach heap-tree mechanics here. | What replaces FIFO queue order? |
| Relaxation scaffold | Micro-widget or static trace row bound to `traceStepId: "scan-C-B"` and `traceStepId: "relax-C-B"`: old `dist[B] = 4`, candidate `dist[C] + 2 = 3`, update parent to `C`. | What does relaxation actually change? |
| Master demo | `DijkstraTraceDemo`: graph, heap, settled set, tentative table, parent table, active edge, step/reset, optional play. | How does the whole algorithm unfold? |
| Formal version | Trace-linked state table with `current`, `active edge`, `candidate`, `dist`, `parent`, `heap`, `settled`, plus the route reconstruction visual for `F`: follow parents backward, then reverse. | How does the story map to formal state? |
| Implementation sketch | Code-to-trace table mapping initialization, heap pop, stale-entry guard, settled add, neighbor loop, relaxation, heap push. | Which code line creates each visible state change? |
| Correctness intuition | Two-state "no cheaper hidden path" micro-sequence bound to `traceStepId: "pop-B-3"` and `traceStepId: "settle-B"`: before settling, heap min is `(B,3)` while other tentative entries are `>= 4`; any hypothetical path to `B` through an unsettled node must first reach the frontier at cost `>= 4`, then add a nonnegative edge, so `>= 4 + 0 > 3`. Then show `B` becoming settled. | Why is it safe to finalize the cheapest node? |
| Complexity | Edge-scan and heap-operation checklist over the fixture: 9 undirected edges expand to 18 directed neighbor scans; 10 total heap pushes, including the source plus 9 successful relaxation pushes, create duplicate entries for `B`, `D`, `E`, and `F`, causing 4 stale skips. Connect these concrete counts to `O((V + E) log V)`. | Where does `log V` enter? |
| Common confusions | Mini-cards: BFS vs Dijkstra, tentative vs settled, stale heap entry bound to `traceStepId: "pop-B-4"` / `traceStepId: "skip-stale-B-4"`, directed negative-edge warning, zero-weight/tie note. | Which terms are easy to mix up? |
| Connections | Local graph snippet `graph-basics -> bfs -> dijkstra`. | How does this node fit? |
| Exercises | Prediction prompts bound to trace IDs: next heap pop, relax or skip, stale entry, reconstruct path, negative-edge warning. | Can learners apply the invariant? |

Section-level snapshot rule:

Every figure, widget, and exercise prompt bound to the trace must declare:

- `traceStepId`: the exact canonical ID, such as `relax-C-B` or `skip-stale-B-4`.
- learner-facing caption: one sentence that names the local takeaway.
- current node and active edge, if any.
- visible heap, sorted by the canonical display order.
- visible heap caveat text: "shown sorted for reading; real heap only promises the next minimum."
- visible distance table and parent changes relevant to the step.
- local rule sentence, such as "Update when candidate < current tentative distance" or "Skip a stale heap entry when it is worse than `dist[node]`."

## Component And State Model

Future implementation targets:

```text
src/components/interactive/dijkstraTrace.ts
src/components/interactive/DijkstraScenarioFigure.tsx
src/components/interactive/DijkstraTraceDemo.tsx
src/components/interactive/DijkstraPredictionPrompt.tsx
```

Suggested types:

```ts
type DijkstraNodeId = "A" | "B" | "C" | "D" | "E" | "F";
type NegativeVariantNodeId = "S" | "A" | "B";
type HeapEntry = {
  node: DijkstraNodeId;
  distance: number;
  stale?: boolean;
};

type DijkstraStep = {
  id: string;
  phase:
    | "start"
    | "pop"
    | "skip-stale"
    | "settle"
    | "scan-edge"
    | "relax-update"
    | "relax-no-change"
    | "done";
  current?: DijkstraNodeId;
  popped?: HeapEntry;
  activeEdge?: [DijkstraNodeId, DijkstraNodeId];
  candidateDistance?: number;
  heap: HeapEntry[];
  settled: DijkstraNodeId[];
  dist: Record<DijkstraNodeId, number | "Infinity">;
  parent: Partial<Record<DijkstraNodeId, DijkstraNodeId>>;
  explanation: Record<Locale, string>;
};

type NegativeEdgeWarningStep = {
  id: "negative-settle-A" | "negative-scan-B-A" | "negative-contradiction";
  phase: "settle" | "scan-edge" | "forbidden-candidate";
  current?: NegativeVariantNodeId;
  activeEdge?: [NegativeVariantNodeId, NegativeVariantNodeId];
  candidateDistance?: number;
  settled: NegativeVariantNodeId[];
  caption: Record<Locale, string>;
};

type MainDijkstraScenario = {
  id:
    | "hook-weighted-map"
    | "bfs-fails"
    | "route-cost-compare"
    | "tentative-table"
    | "relaxation"
    | "formal-state"
    | "code-trace"
    | "correctness-frontier"
    | "unreachable-node"
    | "route-reconstruction"
    | "heap-stale-entry"
    | "complexity";
  variant: "main";
  traceStepId?: string;
  localRule: Record<Locale, string>;
  highlightedNodes?: DijkstraNodeId[];
  highlightedEdges?: Array<[DijkstraNodeId, DijkstraNodeId]>;
  caption: Record<Locale, string>;
  ariaLabel: Record<Locale, string>;
};

type NegativeEdgeScenario = {
  id: "negative-edge-warning";
  variant: "negative-directed";
  warningStepId: NegativeEdgeWarningStep["id"];
  localRule: Record<Locale, string>;
  highlightedNodes?: NegativeVariantNodeId[];
  highlightedEdges?: Array<[NegativeVariantNodeId, NegativeVariantNodeId]>;
  caption: Record<Locale, string>;
  ariaLabel: Record<Locale, string>;
};

type DijkstraScenario = MainDijkstraScenario | NegativeEdgeScenario;
```

Golden expectations:

- `generateDijkstraTrace(mainFixture)` is the source of truth for the full canonical trace. The long table in this design is a readable contract, not hand-written runtime data.
- Tests assert selected golden snapshots by ID, including `start`, `relax-A-C`, `scan-C-B`, `relax-C-B`, `pop-B-3`, `pop-B-4`, `skip-stale-B-4`, and `done`.
- Final distances and parents match the fixture above.
- `C -> B` improves `B` from `4` to `3`.
- `B -> D` improves `D` from `6` to `4`.
- `D -> E` improves `E` from `9` to `7`.
- `E -> F` improves `F` from `10` to `8`.
- Stale entries for `B`, `D`, `E`, and `F` are emitted when duplicate heap entries are used; at minimum `skip-stale-B-4` must be visible in teaching figures and tests.
- Pop and stale-skip snapshots expose `popped` or an equivalent field so `(B,3)` and `(B,4)` remain distinguishable after the heap display removes the popped entry.
- No settled node is re-parented.
- Every section figure derives state from `dijkstraTrace.ts`, not duplicated local data. Scenario fixtures may select and annotate generated steps, but they should not retype the canonical state table.
- The negative-edge warning uses its own tiny fixture/component state or generic scenario node typing so `S`, `A`, and `B` are representable without weakening the main trace types.
- The disconnected-node scenario shows isolated `G` with `dist[G] = Infinity`, no parent, no heap entry, and no settled state after reachable work completes.
- Route reconstruction scenario follows `parent` arrows from `F` backward to `A`, then reverses them into `A -> C -> B -> D -> E -> F`.

## Accessibility And Mobile

- SVG figures need localized `role="img"` / `aria-label`.
- Do not rely on color alone; label states as `current`, `settled`, `tentative`, `unseen`, `stale`, `updated`, and `no change`.
- Distance and heap state must be rendered as real text as well as graphics.
- Controls need descriptive labels: `Next Dijkstra step`, `Previous Dijkstra step`, `Reset Dijkstra trace`.
- Use `aria-live="polite"` for current-step explanation.
- Reduced motion must preserve step-by-step comprehension without animation.
- Static figures stack graph above the trace table on mobile.
- The master demo keeps the current-step summary sticky above the graph/table stack so learners do not lose the explanation while stepping.
- Mobile stacks graph, heap, and tables vertically.
- Heap chips must wrap while preserving displayed priority order and must not require horizontal scrolling.
- Tables collapse into readable key-value rows on small screens.
- Tap targets at least 44px.
- Exercises must be keyboard-operable, and answer feedback appears adjacent to the trace snapshot it explains.

## Graph Placement

Keep:

```text
graph-basics -> bfs -> dijkstra
```

Recommended existing `bfs -> dijkstra` edge update:

```ts
{
  from: "bfs",
  to: "dijkstra",
  type: "generalizes",
  reason: {
    en: "Dijkstra keeps BFS's frontier-and-distance idea, but chooses the next node by smallest tentative total cost instead of FIFO queue order.",
    zh: "Dijkstra 保留 BFS 的前沿和距离思想，但按当前暂定总代价最小来选择下一个节点，而不是按先进先出的队列顺序。"
  }
}
```

Optional future edge from `graph-basics` to `dijkstra` only if cross-links are supported without clutter:

```ts
{
  from: "graph-basics",
  to: "dijkstra",
  type: "prerequisite",
  reason: {
    en: "Dijkstra uses nodes, edges, adjacency, and explicit edge weights from the graph model.",
    zh: "Dijkstra 使用图模型中的节点、边、邻接关系，以及明确的边权重。"
  }
}
```

## Acceptance Criteria

- English and Chinese pages follow the progressive teaching arc.
- Chinese page keeps `translationStatus: needs-review` until human-reviewed.
- Every major section has a visual, trace table, widget, or explicit reason if prose is better.
- The main demo and section figures share one deterministic trace fixture.
- The undirected main fixture and directed negative-edge warning variant are clearly separated.
- The derived adjacency includes reverse neighbors and exact scan order.
- Figure snapshots include trace ID, caption, current node/edge, visible heap, visible distance table, and a local rule sentence.
- Scenario captions, `ariaLabel`s, current-step explanations, controls, local rules, and exercise feedback are present in both `en` and `zh`; Chinese copy remains `translationStatus: needs-review`.
- Heap figures and demos visibly include the sorted-display caveat: "shown sorted for reading; real heap only promises the next minimum."
- Vocabulary is introduced inline before formal notation.
- The page states the nonnegative-edge requirement before correctness.
- Relaxation, settled/finalized nodes, priority queue behavior, and stale-entry skipping are visible.
- Stale-entry visuals/tests can identify the exact popped heap entry independently of the remaining heap display.
- Disconnected/unreachable-node handling is visible with isolated `G`, `dist[G] = Infinity`, `parent[G] = none`, and no heap entry after reachable work finishes.
- Correctness is shown as a two-state micro-sequence around settling `B`, including the inequality `alternative via unsettled frontier >= 4 + 0 > 3`.
- Negative-edge guardrail labels the graph as directed and separate from the main map, and shows the settled-state promise failing.
- Path recovery for `F` is shown by following parent arrows backward and reversing the result.
- Tests in the style of `dijkstra-trace.test.ts` cover final distances and parents, stale skip IDs, scenario `traceStepId` bindings, no re-parenting of settled nodes, and exact canonical adjacency and heap ordering.
- Tests generate the full trace from the fixture and assert selected golden snapshots instead of duplicating the long canonical table as static test data.
- Final distances, parents, heap states, relaxation updates, `relax-no-change` scans, and stale skips are testable.
- The page distinguishes all-destinations output from one inspected destination: Dijkstra computes all reachable distances, while `F` is highlighted only to demonstrate path recovery.
- BFS is described as insufficient for weighted costs, not "wrong" for unweighted graphs.
- The BFS failure convention says naive BFS marks `B` discovered/final by edge count when first seen and refuses to revise parent/cost under its visited rule.
- Zero-weight edges and equal-distance ties are handled explicitly.
- Accessibility labels, keyboard controls, text equivalents, and mobile layouts are present.
- Graph edge reasons are localized and consistent with `src/data/graph.ts`.

## Validation Commands

After implementation:

```bash
npm run validate
npm run check
npm run test
npm run build
```
