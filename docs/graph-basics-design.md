# Graph Basics Node Design

## Node Scope

`graph-basics` stays a coarse-grained beginner concept node for modeling pairwise relationships so later graph algorithms have a concrete representation to operate on.

In scope:

- Modeling real objects as nodes and relationships as edges.
- Immediate neighbors, adjacency, paths, directed edges, weighted edges, adjacency lists, and adjacency matrices.
- A shared five-node "rooms and doors" fixture used across every prose example, code snippet, figure, matrix, exercise, and test unless a section explicitly labels itself as a deliberate variant.
- Preparation for BFS's repeated neighbor expansion and Dijkstra's later use of edge costs.

Out of scope:

- Full BFS or Dijkstra execution.
- Trees, DAGs, cycles, connectivity, shortest-path proofs, priority queues, CSR, incidence matrices, or dynamic graph storage.
- Formal graph theory vocabulary beyond what a first graph page needs.

## Proposed Frontmatter

English page:

```yaml
id: graph-basics
locale: en
title: Graph Basics
summary: Model relationships with nodes, edges, and adjacency so search algorithms can move one local step at a time.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - graphs
  - modeling
prerequisites: []
next:
  - bfs
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

Chinese page:

```yaml
id: graph-basics
locale: zh
title: 图的基础
summary: 用节点、边和邻接关系描述对象之间的关系，让搜索算法能一步一步沿着关系移动。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - graphs
  - modeling
prerequisites: []
next:
  - bfs
createdAt: 2026-05-15
updatedAt: 2026-05-15
```

## Teaching Arc

1. Hook problem: navigate rooms connected by doors.
2. First naive idea: write route sentences for every useful trip.
3. Pain point: one door change can make many route sentences stale because structure and decisions are mixed.
4. Core invention: separate objects from relationships with nodes, edges, and adjacency.
5. Visual anchors: show the same room fixture as a floorplan-like picture, graph picture, adjacency list, matrix, and algorithm input.
6. Modeling-choice checkpoint: decide what the graph keeps, what it throws away, and one tempting alternative it rejects.
7. Formal version: `G = (V, E)` plus directed/undirected and weighted/unweighted variants.
8. Implementation sketch: contrast route advice arrays with a typed adjacency-list object in TypeScript.
9. Representation invariant: every direct connection in the model appears in the representation according to the chosen direction convention.
10. Complexity/tradeoff: adjacency list versus matrix for listing neighbors, checking one edge, adding an edge, and sparse/dense graphs.
11. Common confusions: node versus value, edge versus path, neighbor versus reachable, one-way directed edges, and weight as cost rather than edge count.
12. Connections: BFS repeats the local neighbor question; Dijkstra is reached through BFS and later adds costs to that same graph structure.
13. Exercises: predict neighbors, convert a picture to an adjacency list, choose a representation, and identify what changes when doors become one-way or weighted.

## Vocabulary Scaffolding

Introduce terms inline before formal notation:

- Node / vertex: one object in the model. Chinese: `节点（node）/ 顶点（vertex）`.
- Edge: one relationship or connection. Chinese: `边（edge）`.
- Adjacent / neighbor: directly connected in one step. Chinese: `邻接（adjacent）/ 邻居（neighbor）`.
- Path: several edges chained together, not one edge. Chinese: `路径（path）`.
- Directed: an edge has an allowed direction. Chinese: `有向（directed）`.
- Weighted: an edge carries a cost. Chinese: `带权（weighted）`.
- Adjacency list: each node stores its immediate neighbors. Chinese: `邻接表（adjacency list）`.
- Adjacency matrix: a table answers whether two nodes are connected. Chinese: `邻接矩阵（adjacency matrix）`.

## Section-Level Visual Inventory

Every major section should have nearby visual support unless the visual would duplicate a stronger adjacent figure.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Static room map with `Lobby`, `Hall`, `Lab`, `Stairs`, and `Cafe`; doors drawn as edges. Include callouts: kept facts are rooms and direct doors; ignored for now are room size, exact hallway shape, and physical distance. | What concrete situation are we trying to model? |
| First naive idea | Route cards beside the same map: `Lobby -> Hall -> Lab`, `Stairs -> Cafe -> Hall -> Lab`, and `Cafe -> Hall -> Lab`. | Why does writing complete routes feel natural at first? |
| Where it breaks | Before/after figure that adds the deliberate variant door `Cafe-Lab`; label the left change `Graph fact changed` and the right maintenance work `Advice cards now need review`. Mark exactly which route cards stay `unchanged`, become `valid-needs-review`, become `stale`, or are `missing`. Keep the new `Cafe-Lab` annotation visible next to the affected cards. | Why are routes the wrong unit to maintain? |
| Core invention | Toggle micro-widget: `Room picture` / `Graph picture` / `Neighbor facts`. Repeat the abstraction callouts so learners see that visual length and physical size are not part of the graph yet. | What information does a graph keep and what does it ignore? |
| Modeling-choice checkpoint | Small figure with three columns: `Keep` rooms and direct doors; `Throw away` room size, exact hallway bends, and decoration; `Reject for this page` full route advice such as `Cafe -> Hall -> Lab`. Add a one-line why: local connection facts survive route changes better than full advice sentences. | Why do `V` and `E` feel like a chosen model rather than inevitable notation? |
| Interactive visual demo | `GraphBasicsExplorer`: reusable neighbor-inspection widget/local lens. Select a node, highlight its immediate neighbors, and show the matching adjacency-list row. Other sections still get their own local figures or micro-states. | From here, what can an algorithm see in one step? |
| Formal version | Formal bridge figure: `Lobby` room card -> node circle -> `lobby in V`; door `Lobby-Hall` -> highlighted edge -> `{lobby, hall} in E`. Include compact `V = {...}` and `E = {...}` views. | How does the picture become notation without changing meaning? |
| Implementation sketch | Contrast `routeAdvice = [["cafe", "hall", "lab"], ...]` with `adjacency = { cafe: ["hall", "stairs"], ... }`, then align `lobby: ["hall", "stairs"]` to highlighted edges. When adjacency lists first appear, include the local convention: stored fact `["lobby", "hall"]` renders as neighbor facts `lobby -> hall` and `hall -> lobby` in an undirected graph. | Which graph facts does each code row encode, and why is adjacency easier to maintain than full advice? |
| Representation invariant | Checklist table comparing map facts with adjacency-list rows. | How do we know the representation preserves the direct connections? |
| Complexity/tradeoff | Side-by-side adjacency list and matrix for the same fixture. Include a matrix guardrail: rows and columns are lookup labels, not physical positions. For `Lab` to `Cafe`, trace from the Lab node in the map to the `Lab` row header, then to the `Cafe` column header, then to cell `(lab,cafe) = 0`. | Why are there multiple representations? |
| Directed variant | Tiny one-way-door moment using the same rooms: `Cafe -> Lab` adds `lab` only to Cafe's row. Mini visual: arrow from Cafe to Lab, then one highlighted adjacency-list row. Prediction prompt: `Which row changes: Cafe, Lab, or both?` | What changes when a door has direction? |
| Weighted variant | Tiny cost-label moment using the same rooms: two highlighted doors from `Lobby`, both labeled `1 neighbor step`, with explicit cost badges `2` and `5`. Prediction prompt: `Are Hall and Stairs both still neighbors of Lobby?` Caption: `Weight changes later cost decisions, not adjacency.` | What changes when a direct edge carries cost? |
| Common confusions | Mini-cards using exact fixture examples for edge/path, neighbor/reachable, directed reversal, and weight/cost. | Which terms are easy to mix up before algorithms start? |
| Connections | Local graph snippet: `graph-basics -> bfs -> dijkstra`, with localized edge reasons. | How does this page support later nodes? |
| Exercises | Prediction widgets or static prompts using the same fixture. | Can the learner apply the representation rules? |

The short transition between the hook and naive idea may stay prose-primary because it only names the story setup already shown by the room map.

Route cards are human-maintained advice, not an algorithm and not a shortest-path solver. The pain section should emphasize that facts changed and the advice must be re-audited. Use `shorter` only as a parenthetical observation, e.g. `still valid, but now needs review (a shorter route exists)`, and do not imply the page is computing optimal routes.

## Deterministic Fixture

Use one shared fixture for all prose examples, code snippets, static figures, micro-widgets, matrices, exercises, and tests. Any exception must be named as a deliberate variant in the section text and in scenario data.

```ts
const rooms = [
  { id: "lobby", label: { en: "Lobby", zh: "大厅" }, x: 80, y: 90 },
  { id: "hall", label: { en: "Hall", zh: "走廊" }, x: 190, y: 90 },
  { id: "lab", label: { en: "Lab", zh: "实验室" }, x: 310, y: 55 },
  { id: "stairs", label: { en: "Stairs", zh: "楼梯" }, x: 85, y: 190 },
  { id: "cafe", label: { en: "Cafe", zh: "咖啡区" }, x: 240, y: 190 }
];

const undirectedEdges = [
  ["lobby", "hall"],
  ["lobby", "stairs"],
  ["hall", "lab"],
  ["hall", "cafe"],
  ["stairs", "cafe"]
];
```

Golden expectations:

- `neighbors("lobby") = ["hall", "stairs"]`
- `neighbors("hall") = ["lobby", "lab", "cafe"]`
- `neighbors("lab") = ["hall"]`
- `neighbors("stairs") = ["lobby", "cafe"]`
- `neighbors("cafe") = ["hall", "stairs"]`
- Undirected adjacency list has `2 * edgeCount = 10` neighbor entries.
- The matrix is symmetric for the undirected fixture.
- Undirected fixture edges are stored once in fixture data but rendered and read as two neighbor facts. For example, stored edge `["lobby", "hall"]` means `Hall` appears in Lobby's row and `Lobby` appears in Hall's row.
- Adjacency-list neighbor order is deterministic display order derived from the shared fixture edge order. It has no graph-theory meaning unless a later algorithm page explicitly defines an ordering rule.
- Directed variants render arrows and create only one adjacency-list entry. For example, `lab -> hall` means the `lab` row contains `hall`; the `hall` row does not contain `lab` unless another directed edge says so.
- In directed matrices, row means "from" and column means "to": cell `(lab, hall) = 1` for `lab -> hall`, while `(hall, lab) = 0`.
- Weighted variant for Dijkstra prep keeps the same adjacency facts and only adds cost labels, such as `lobby-hall: 2` and `lobby-stairs: 5`. Do not describe a weighted frontier on this page.
- The floorplan and graph drawings must not imply visual length is weight. If a weighted example is shown, weights appear only as explicit cost badges or labels.

Naive route-card pain states:

- Base route cards use only the five-node fixture: `Lobby -> Hall -> Lab`, `Stairs -> Cafe -> Hall -> Lab`, and `Cafe -> Hall -> Lab`.
- The `Cafe-Lab` door is a deliberate variant used only in the pain section and any matching tests.
- In the before/after figure, annotate the new door as `Graph fact changed`; annotate the card set as `Advice cards now need review`.
- Route cards are maintained advice. They are not generated by an algorithm in this node, and `shorter` only appears as a parenthetical reason a human should re-audit an otherwise valid card.
- After adding `Cafe-Lab`, mark `Lobby -> Hall -> Lab` as unchanged: it is still a valid two-door route.
- After adding `Cafe-Lab`, mark `Stairs -> Cafe -> Hall -> Lab` as `valid-needs-review` because it still reaches Lab, but a human should re-audit it (`Stairs -> Cafe -> Lab` is shorter).
- Mark `Cafe -> Hall -> Lab` as stale because the card's advice should become `Cafe -> Lab`.
- Mark the card collection as incomplete until it includes the new direct route `Cafe -> Lab` and any derived route that now uses it, such as `Stairs -> Cafe -> Lab`.

Common confusion examples must use the same fixture:

- Edge versus path: `Hall-Lab` is one edge; `Lobby -> Hall -> Lab` is a path.
- Neighbor versus reachable: `Lab` is reachable from `Lobby`, but it is not Lobby's neighbor.
- Directed reversal: `Lab -> Hall` does not allow `Hall -> Lab`.
- Weight versus adjacency: `Lobby-Hall` with cost `2` and `Lobby-Stairs` with cost `5` are both still one neighbor step from Lobby.

## Component And State Model

Future implementation targets:

```text
src/components/interactive/graphBasicsTrace.ts
src/components/interactive/GraphBasicsFigure.tsx
src/components/interactive/GraphBasicsExplorer.tsx
src/components/interactive/GraphRepresentationCompare.tsx
```

Suggested types:

```ts
type GraphBasicsNode = {
  id: string;
  label: Record<Locale, string>;
  x: number;
  y: number;
};

type GraphBasicsEdge = {
  from: string;
  to: string;
  directed?: boolean;
  weight?: number;
};

type GraphBasicsScenario = {
  id:
    | "room-map"
    | "route-sentences"
    | "door-change-pain"
    | "modeling-choice"
    | "node-neighbor"
    | "formal-sets"
    | "route-advice-vs-adjacency"
    | "adjacency-list"
    | "adjacency-matrix"
    | "directed-edge"
    | "weighted-edge"
    | "bfs-prep"
    | "dijkstra-prep";
  activeNode?: string;
  highlightedNodes?: string[];
  highlightedEdges?: Array<[string, string]>;
  variantEdges?: GraphBasicsEdge[];
  highlightedRows?: string[];
  highlightedMatrixCells?: Array<{ row: string; column: string; value: 0 | 1 }>;
  routeCardStatuses?: Array<{
    route: string[];
    status: "unchanged" | "valid-needs-review" | "stale" | "missing";
    note: Record<Locale, string>;
  }>;
  representation?: "picture" | "list" | "matrix";
  caption?: Record<Locale, string>;
  explanation: Record<Locale, string>;
};
```

`GraphBasicsFigure` renders static section scenarios from the shared fixture. `GraphBasicsExplorer` is a reusable neighbor-inspection widget/local lens: keyboard-select a node, highlight one-step neighbors, show the matching adjacency row, and expose a reset control. It must not run BFS; it only exposes the local question BFS later repeats. It should not be the only visual anchor on the page; local figures still carry the hook, pain, modeling-choice, representation, directed, weighted, and exercise moments.

`GraphRepresentationCompare` toggles between adjacency list and matrix and supports conceptual operations such as "list all neighbors of Hall", "check whether Lab connects to Cafe", and "add edge Cafe-Lab".

`GraphRepresentationCompare` must have deterministic golden operation states:

| Operation | Highlighted list rows | Highlighted matrix cells | Result text |
|---|---|---|---|
| Reset | none | none | `Choose an operation to compare the two representations.` |
| List neighbors of Hall | `hall: ["lobby", "lab", "cafe"]` | `(hall,lobby)`, `(hall,lab)`, `(hall,cafe)` and symmetric cells if the undirected matrix shows both directions | `Hall connects to Lobby, Lab, and Cafe.` |
| Check whether Lab connects to Cafe | `lab: ["hall"]` and `cafe: ["hall", "stairs"]` | Step 1: highlight `Lab` row header. Step 2: highlight `Cafe` column header. Step 3: highlight `(lab,cafe) = 0`. Optionally also show `(cafe,lab) = 0` after the convention is established. | `No direct door connects Lab and Cafe in the base fixture.` |
| Add edge Cafe-Lab | New deliberate variant rows for `cafe` and `lab` | `(cafe,lab)` and `(lab,cafe)` | `Adding Cafe-Lab changes adjacency, so both representations need one new connection.` |

Reset returns to the base five-node fixture, clears selected operation and highlights, restores the result text above, and removes the deliberate `Cafe-Lab` variant.

Exercise states should be named and deterministic. Feedback must name the misconception, not only say wrong.

| Exercise state | Prompt | Expected answer | Required feedback state |
|---|---|---|---|
| `select-lobby-neighbors` | Select every room adjacent to Lobby. | `Hall` and `Stairs`; not `Lab` or `Cafe`. | If learner selects `Lab`, explain: `Lab is reachable from Lobby through Hall, but it is not one direct door away.` |
| `convert-directed-edge` | Convert a new one-way door `Cafe -> Lab` into an adjacency-list row change. | Add `lab` to `cafe`; do not add `cafe` to `lab`. | If learner also adds `cafe` to `lab`, explain: `That would add the reverse door Lab -> Cafe, which the one-way arrow did not say.` |
| `fill-matrix-cell` | Fill matrix cell `(lab,cafe)` for the base undirected fixture. | `0`, because Lab and Cafe do not share a direct door. | If learner enters `1`, explain: `Lab can reach Cafe through Hall, but this cell asks for one direct edge from Lab to Cafe.` |
| `edge-vs-path` | Identify whether `Hall-Lab` and `Lobby -> Hall -> Lab` are an edge or a path. | `Hall-Lab` is one edge; `Lobby -> Hall -> Lab` is a path with two edges. | If learner calls the two-edge route an edge, explain: `An edge is one direct connection; chaining two edges makes a path.` |

## Accessibility And Mobile

- The room map must have an `aria-label` such as `Five-room graph showing Lobby, Hall, Lab, Stairs, and Cafe connected by doors`.
- Every static figure needs a visible caption plus a concise `aria-label` or visually hidden summary. The caption should explain the teaching point; the accessibility summary should describe the encoded graph state without requiring sight.
- Graph nodes must be reachable as keyboard buttons. Use roving `tabindex` or a native list of buttons; arrow keys move between node buttons, `Enter`/`Space` selects, and `Escape` clears selection when a selection exists.
- Do not rely on color alone; use labels, stroke styles, summaries, and table highlights.
- Use `aria-live="polite"` for selected-node explanations, e.g. `Hall is selected. Its neighbors are Lobby, Lab, and Cafe.`
- Matrix views need a caption that states the convention, e.g. `Rows are from rooms; columns are to rooms; 1 means a direct door.`
- Adjacency matrices should use real table semantics where possible: `<table>`, `<caption>`, row headers, column headers, and cell values. If an SVG matrix is necessary, provide an equivalent semantic table or text fallback with the same row/column convention.
- Provide a textual adjacency-list fallback beside or below visuals.
- On mobile, stack in this order: visual, live selected-node summary, controls, then list/matrix representation.
- In the route-card pain section on mobile, stack before/after panels vertically. Keep each status label adjacent to the affected route card, and repeat or pin the new `Cafe-Lab` annotation so learners do not need to compare distant panels to understand what changed.
- Matrix views should scroll horizontally or collapse into row chips on narrow screens. Collapsed chips use the format `Row Hall connects to columns: Lobby, Lab, Cafe` so the row/column convention remains visible.
- Respect reduced motion with instant state changes or minimal transitions.

## Graph Placement

Keep the existing graph node:

```ts
{
  id: "graph-basics",
  label: { en: "Graph Basics", zh: "图的基础" },
  status: "draft",
  conceptType: "concept"
}
```

Recommended edge to BFS:

```ts
{
  from: "graph-basics",
  to: "bfs",
  type: "prerequisite",
  reason: {
    en: "BFS repeats the graph-basics question: from this node, which adjacent neighbors can be visited next?",
    zh: "BFS 会反复使用图的基础问题：从当前节点出发，哪些相邻节点可以下一步访问？"
  }
}
```

Do not add a direct `graph-basics -> dijkstra` edge or direct `next: dijkstra` in graph-basics frontmatter for now. Current topology reaches Dijkstra through BFS:

```ts
{
  from: "bfs",
  to: "dijkstra",
  type: "generalizes",
  reason: {
    en: "Dijkstra keeps BFS's expanding frontier, but replaces the queue with a priority queue for weighted edges.",
    zh: "Dijkstra 保留 BFS 的扩张前沿，但用优先队列处理带权边。"
  }
}
```

## Acceptance Criteria

- English and Chinese pages follow the progressive teaching arc.
- Chinese page keeps `translationStatus: needs-review` until human-reviewed.
- Every major section has a visual/widget plan or a stated prose-only reason.
- Every prose example, code snippet, static figure, matrix, exercise, and test uses the five-node fixture unless the section is explicitly marked as a deliberate variant.
- Route-card pain is concrete: adding `Cafe-Lab` marks exact route cards or advice as `unchanged`, `valid-needs-review`, `stale`, or `missing`, with `shorter` used only as a parenthetical observation.
- The modeling-choice checkpoint appears before formal notation and shows what the page keeps, throws away, rejects, and why.
- Golden neighbor lists, directed row/column conventions, and undirected matrix symmetry are testable.
- Adjacency-list order is deterministic fixture/display order and is explicitly described as having no graph meaning by itself.
- `GraphRepresentationCompare` has golden states for selected operation, highlighted list rows, highlighted matrix cells, result text, and reset behavior.
- Accessible summaries are present for static figures, the room map, selected-node state, and matrix convention.
- Directed and weighted variants are split into separate local moments, each with a mini visual and prediction prompt.
- Matrix cell reading traces from the Lab node to the `Lab` row header, `Cafe` column header, and `(lab,cafe) = 0` cell; captions state that rows and columns are lookup labels, not physical positions.
- Implementation sketch contrasts route advice arrays with adjacency objects.
- Mobile matrix behavior is specified as horizontal scroll or collapsed row chips that preserve the row/column convention.
- The route-card pain section has a mobile layout rule: vertical before/after stack, statuses adjacent to affected cards, and visible `Cafe-Lab` annotation.
- Named exercise states, expected answers, and common wrong-answer feedback cover selecting Lab as Lobby's neighbor, adding a reverse directed edge, filling `(lab,cafe) = 1`, and calling a two-edge path an edge.
- No section relies only on the reusable neighbor-inspection widget when a nearby local figure would reduce cognitive load.
- The page distinguishes edge, path, neighbor, reachable, directed, weighted, adjacency list, and adjacency matrix.
- Weighted examples use explicit cost labels only and never imply edge length equals cost.
- BFS and Dijkstra preparation is explicit but does not teach those algorithms in full.
- Graph edges use allowed edge types and localized reasons.
- Visual components are keyboard-accessible, mobile-friendly, and deterministic.

## Validation Commands

After implementation:

```bash
npm run validate
npm run check
npm run test
npm run build
```
