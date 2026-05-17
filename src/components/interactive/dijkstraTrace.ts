import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type DijkstraNodeId = "A" | "B" | "C" | "D" | "E" | "F";
export type NegativeVariantNodeId = "S" | "A" | "B";

export type HeapEntry<NodeId extends string = DijkstraNodeId> = {
  node: NodeId;
  distance: number;
  stale?: boolean;
};

export type DijkstraStep = {
  id: string;
  phase: "start" | "pop" | "skip-stale" | "settle" | "scan-edge" | "relax-update" | "relax-no-change" | "done";
  current?: DijkstraNodeId;
  activeEdge?: [DijkstraNodeId, DijkstraNodeId];
  candidateDistance?: number;
  popped?: HeapEntry;
  heap: HeapEntry[];
  settled: DijkstraNodeId[];
  dist: Record<DijkstraNodeId, number | "Infinity">;
  parent: Partial<Record<DijkstraNodeId, DijkstraNodeId>>;
  explanation: LocalizedText;
};

export type NegativeEdgeWarningStep = {
  id: "negative-settle-A" | "negative-scan-B-A" | "negative-contradiction";
  phase: "settle" | "scan-edge" | "forbidden-candidate";
  current?: NegativeVariantNodeId;
  activeEdge?: [NegativeVariantNodeId, NegativeVariantNodeId];
  candidateDistance?: number;
  settled: NegativeVariantNodeId[];
  caption: LocalizedText;
};

export type MainDijkstraScenario = {
  id:
    | "hook-weighted-map"
    | "bfs-fails"
    | "route-cost-compare"
    | "tentative-table"
    | "relaxation"
    | "formal-state"
    | "code-trace"
    | "correctness-frontier"
    | "heap-stale-entry"
    | "unreachable-node"
    | "path-reconstruction"
    | "complexity";
  variant: "main";
  traceStepId?: string;
  localRule: LocalizedText;
  highlightedNodes?: DijkstraNodeId[];
  highlightedEdges?: Array<[DijkstraNodeId, DijkstraNodeId]>;
  caption: LocalizedText;
  ariaLabel: LocalizedText;
};

export type NegativeEdgeScenario = {
  id: "negative-edge-warning";
  variant: "negative-directed";
  warningStepId: NegativeEdgeWarningStep["id"];
  localRule: LocalizedText;
  highlightedNodes?: NegativeVariantNodeId[];
  highlightedEdges?: Array<[NegativeVariantNodeId, NegativeVariantNodeId]>;
  caption: LocalizedText;
  ariaLabel: LocalizedText;
};

export type DijkstraScenario = MainDijkstraScenario | NegativeEdgeScenario;

export const nodes: DijkstraNodeId[] = ["A", "B", "C", "D", "E", "F"];

export const positions: Record<DijkstraNodeId, { x: number; y: number }> = {
  A: { x: 50, y: 70 },
  C: { x: 145, y: 35 },
  B: { x: 145, y: 120 },
  D: { x: 240, y: 120 },
  E: { x: 330, y: 70 },
  F: { x: 330, y: 170 }
};

export const weightedEdges: Array<[DijkstraNodeId, DijkstraNodeId, number]> = [
  ["A", "B", 4],
  ["A", "C", 1],
  ["C", "B", 2],
  ["B", "D", 1],
  ["C", "D", 5],
  ["C", "E", 8],
  ["D", "E", 3],
  ["D", "F", 6],
  ["E", "F", 1]
];

export const adjacency: Record<DijkstraNodeId, Array<[DijkstraNodeId, number]>> = {
  A: [["B", 4], ["C", 1]],
  B: [["A", 4], ["C", 2], ["D", 1]],
  C: [["A", 1], ["B", 2], ["D", 5], ["E", 8]],
  D: [["B", 1], ["C", 5], ["E", 3], ["F", 6]],
  E: [["C", 8], ["D", 3], ["F", 1]],
  F: [["D", 6], ["E", 1]]
};

export const negativeDirectedVariant = {
  nodes: ["S", "A", "B"] as NegativeVariantNodeId[],
  directedEdges: [
    ["S", "A", 2],
    ["S", "B", 5],
    ["B", "A", -4]
  ] as Array<[NegativeVariantNodeId, NegativeVariantNodeId, number]>
};

export const negativeWarningSteps: NegativeEdgeWarningStep[] = [
  {
    id: "negative-settle-A",
    phase: "settle",
    current: "A",
    settled: ["S", "A"],
    caption: {
      en: "The directed warning variant settles A at cost 2.",
      zh: "这个有向警示变体先以代价 2 确定 A。"
    }
  },
  {
    id: "negative-scan-B-A",
    phase: "scan-edge",
    current: "B",
    activeEdge: ["B", "A"],
    candidateDistance: 1,
    settled: ["S", "A", "B"],
    caption: {
      en: "Later B -> A offers candidate 5 + (-4) = 1.",
      zh: "之后 B -> A 给出候选代价 5 + (-4) = 1。"
    }
  },
  {
    id: "negative-contradiction",
    phase: "forbidden-candidate",
    current: "B",
    activeEdge: ["B", "A"],
    candidateDistance: 1,
    settled: ["S", "A", "B"],
    caption: {
      en: "Settled was supposed to mean final, so the nonnegative-edge promise has failed.",
      zh: "已确定本该表示最终结果，所以非负边这个前提被破坏了。"
    }
  }
];

function heapCompare(a: HeapEntry, b: HeapEntry) {
  return a.distance - b.distance || a.node.localeCompare(b.node);
}

function cloneDist(dist: Record<DijkstraNodeId, number>): Record<DijkstraNodeId, number | "Infinity"> {
  return Object.fromEntries(nodes.map((node) => [node, Number.isFinite(dist[node]) ? dist[node] : "Infinity"])) as Record<DijkstraNodeId, number | "Infinity">;
}

function snapshotHeap(heap: HeapEntry[], dist: Record<DijkstraNodeId, number>, settled: Set<DijkstraNodeId>): HeapEntry[] {
  return [...heap].sort(heapCompare).map((entry) => ({
    ...entry,
    stale: settled.has(entry.node) || entry.distance !== dist[entry.node]
  }));
}

function cloneParent(parent: Partial<Record<DijkstraNodeId, DijkstraNodeId>>) {
  return { ...parent };
}

function explanation(en: string, zh: string): LocalizedText {
  return { en, zh };
}

export function generateDijkstraTrace() {
  const dist = Object.fromEntries(nodes.map((node) => [node, Number.POSITIVE_INFINITY])) as Record<DijkstraNodeId, number>;
  const parent: Partial<Record<DijkstraNodeId, DijkstraNodeId>> = {};
  const settled = new Set<DijkstraNodeId>();
  const heap: HeapEntry[] = [];
  const steps: DijkstraStep[] = [];

  const pushStep = (step: Omit<DijkstraStep, "heap" | "settled" | "dist" | "parent">) => {
    steps.push({
      ...step,
      heap: snapshotHeap(heap, dist, settled),
      settled: nodes.filter((node) => settled.has(node)),
      dist: cloneDist(dist),
      parent: cloneParent(parent)
    });
  };

  dist.A = 0;
  heap.push({ node: "A", distance: 0 });
  pushStep({
    id: "start",
    phase: "start",
    explanation: explanation("Initialize A at distance 0; every other node is Infinity.", "把 A 初始化为距离 0；其他节点都是 Infinity。")
  });

  while (heap.length > 0) {
    heap.sort(heapCompare);
    const entry = heap.shift()!;
    const popId = `pop-${entry.node}-${entry.distance}`;
    pushStep({
      id: popId,
      phase: "pop",
      current: entry.node,
      popped: entry,
      explanation: explanation(`Pop (${entry.node}, ${entry.distance}) from the priority queue.`, `从优先队列取出 (${entry.node}, ${entry.distance})。`)
    });

    if (settled.has(entry.node) || entry.distance !== dist[entry.node]) {
      pushStep({
        id: `skip-stale-${entry.node}-${entry.distance}`,
        phase: "skip-stale",
        current: entry.node,
        popped: entry,
        explanation: explanation(
          `Skip stale (${entry.node}, ${entry.distance}); current dist[${entry.node}] is ${dist[entry.node]}.`,
          `跳过过期条目 (${entry.node}, ${entry.distance})；当前 dist[${entry.node}] 是 ${dist[entry.node]}。`
        )
      });
      continue;
    }

    settled.add(entry.node);
    pushStep({
      id: `settle-${entry.node}`,
      phase: "settle",
      current: entry.node,
      popped: entry,
      explanation: explanation(`Settle ${entry.node}; its distance ${entry.distance} is final.`, `确定 ${entry.node}；它的距离 ${entry.distance} 已经是最终值。`)
    });

    for (const [neighbor, weight] of adjacency[entry.node]) {
      const candidate = dist[entry.node] + weight;
      pushStep({
        id: `scan-${entry.node}-${neighbor}`,
        phase: "scan-edge",
        current: entry.node,
        activeEdge: [entry.node, neighbor],
        candidateDistance: candidate,
        explanation: explanation(
          `Scan ${entry.node}-${neighbor}: candidate ${dist[entry.node]} + ${weight} = ${candidate}.`,
          `扫描 ${entry.node}-${neighbor}：候选代价 ${dist[entry.node]} + ${weight} = ${candidate}。`
        )
      });

      if (settled.has(neighbor)) {
        pushStep({
          id: `relax-no-change-${entry.node}-${neighbor}`,
          phase: "relax-no-change",
          current: entry.node,
          activeEdge: [entry.node, neighbor],
          candidateDistance: candidate,
          explanation: explanation(`${neighbor} is already settled, so do not re-parent it.`, `${neighbor} 已经确定，所以不改写父节点。`)
        });
        continue;
      }

      if (candidate < dist[neighbor]) {
        const previous = dist[neighbor];
        dist[neighbor] = candidate;
        parent[neighbor] = entry.node;
        heap.push({ node: neighbor, distance: candidate });
        pushStep({
          id: `relax-${entry.node}-${neighbor}`,
          phase: "relax-update",
          current: entry.node,
          activeEdge: [entry.node, neighbor],
          candidateDistance: candidate,
          explanation: explanation(
            `Update ${neighbor}: ${Number.isFinite(previous) ? previous : "Infinity"} -> ${candidate}; parent becomes ${entry.node}.`,
            `更新 ${neighbor}：${Number.isFinite(previous) ? previous : "Infinity"} -> ${candidate}；父节点变为 ${entry.node}。`
          )
        });
      } else {
        pushStep({
          id: `relax-no-change-${entry.node}-${neighbor}`,
          phase: "relax-no-change",
          current: entry.node,
          activeEdge: [entry.node, neighbor],
          candidateDistance: candidate,
          explanation: explanation(`No update: candidate ${candidate} is not better than dist[${neighbor}] = ${dist[neighbor]}.`, `不更新：候选 ${candidate} 不优于 dist[${neighbor}] = ${dist[neighbor]}。`)
        });
      }
    }
  }

  pushStep({
    id: "done",
    phase: "done",
    explanation: explanation("All reachable nodes are settled; the distance table is final.", "所有可达节点都已确定；距离表就是最终结果。")
  });

  return steps;
}

export const trace = generateDijkstraTrace();
export const finalStep = trace.find((step) => step.id === "done")!;
export const finalDistances = finalStep.dist;
export const finalParents = finalStep.parent;

export function reconstructPath(target: DijkstraNodeId): DijkstraNodeId[] {
  const path: DijkstraNodeId[] = [target];
  let current: DijkstraNodeId | undefined = target;
  while (current) {
    const next: DijkstraNodeId | undefined = finalParents[current];
    if (!next) break;
    path.push(next);
    current = next;
  }
  return path.reverse();
}

export const complexityCounts = {
  undirectedEdges: weightedEdges.length,
  directedNeighborScans: Object.values(adjacency).reduce((sum, neighbors) => sum + neighbors.length, 0),
  heapPushes: trace.filter((step) => step.phase === "relax-update").length + 1,
  staleSkips: trace.filter((step) => step.phase === "skip-stale").length
};

export const scenarios: Record<DijkstraScenario["id"], DijkstraScenario> = {
  "hook-weighted-map": {
    id: "hook-weighted-map",
    variant: "main",
    traceStepId: "start",
    localRule: { en: "Weights are explicit labels; visual length is not cost.", zh: "权重是明确标签；视觉长度不是代价。" },
    caption: { en: "The map is now weighted: one edge can cost more than two edges.", zh: "地图现在带权：一条边可能比两条边更贵。" },
    ariaLabel: { en: "Weighted graph before Dijkstra starts.", zh: "Dijkstra 开始前的带权图。" }
  },
  "bfs-fails": {
    id: "bfs-fails",
    variant: "main",
    traceStepId: "relax-A-B",
    highlightedEdges: [["A", "B"], ["A", "C"], ["C", "B"]],
    localRule: { en: "First discovered by edge count is not lowest cost.", zh: "按边数第一次发现不等于总代价最低。" },
    caption: { en: "BFS would keep A-B first, but A-C-B costs less.", zh: "BFS 会先保留 A-B，但 A-C-B 代价更低。" },
    ariaLabel: { en: "BFS failure on weighted graph.", zh: "BFS 在带权图中的失败点。" }
  },
  "route-cost-compare": {
    id: "route-cost-compare",
    variant: "main",
    traceStepId: "relax-C-B",
    highlightedEdges: [["A", "B"], ["A", "C"], ["C", "B"]],
    localRule: { en: "Compare total costs, not edge counts.", zh: "比较总代价，而不是边数。" },
    caption: { en: "A-B costs 4; A-C-B costs 3.", zh: "A-B 代价为 4；A-C-B 代价为 3。" },
    ariaLabel: { en: "Route cost comparison for B.", zh: "到 B 的路线代价对比。" }
  },
  "tentative-table": {
    id: "tentative-table",
    variant: "main",
    traceStepId: "relax-C-B",
    localRule: { en: "Priority comes from the smallest tentative distance.", zh: "优先级来自最小暂定距离。" },
    caption: { en: "The priority queue replaces FIFO order.", zh: "优先队列取代先进先出顺序。" },
    ariaLabel: { en: "Tentative distance table and heap after C updates B.", zh: "C 更新 B 后的暂定距离表和堆。" }
  },
  relaxation: {
    id: "relaxation",
    variant: "main",
    traceStepId: "relax-C-B",
    highlightedEdges: [["C", "B"]],
    localRule: { en: "Update when candidate < current tentative distance.", zh: "当候选值小于当前暂定距离时更新。" },
    caption: { en: "C -> B improves B from 4 to 3 and changes parent to C.", zh: "C -> B 把 B 从 4 改善到 3，并把父节点改为 C。" },
    ariaLabel: { en: "Relaxation from C to B.", zh: "从 C 到 B 的松弛。" }
  },
  "formal-state": {
    id: "formal-state",
    variant: "main",
    traceStepId: "scan-D-E",
    localRule: { en: "candidate = dist[current] + weight(current, neighbor).", zh: "candidate = dist[current] + weight(current, neighbor)。" },
    caption: { en: "Formal state names the current node, active edge, candidate, heap, and tables.", zh: "形式化状态命名当前节点、当前边、候选值、堆和表格。" },
    ariaLabel: { en: "Formal Dijkstra state while scanning D-E.", zh: "扫描 D-E 时的 Dijkstra 形式化状态。" }
  },
  "code-trace": {
    id: "code-trace",
    variant: "main",
    traceStepId: "skip-stale-B-4",
    localRule: { en: "Skip when the popped entry is stale.", zh: "弹出的条目过期时跳过。" },
    caption: { en: "The stale-entry guard keeps duplicate heap entries simple.", zh: "过期条目保护让重复堆条目更简单。" },
    ariaLabel: { en: "Code to trace mapping for stale skip.", zh: "过期跳过的代码到追踪映射。" }
  },
  "correctness-frontier": {
    id: "correctness-frontier",
    variant: "main",
    traceStepId: "pop-B-3",
    localRule: { en: "Any hidden alternative starts at cost >= 4 and then adds a nonnegative edge.", zh: "任何隐藏替代路径都先从代价 >= 4 的前沿开始，再加非负边。" },
    caption: { en: "Before settling B, the heap minimum is (B,3); other tentative entries are at least 4.", zh: "确定 B 之前，堆最小项是 (B,3)；其他暂定项至少为 4。" },
    ariaLabel: { en: "Correctness frontier before settling B.", zh: "确定 B 前的正确性前沿。" }
  },
  "heap-stale-entry": {
    id: "heap-stale-entry",
    variant: "main",
    traceStepId: "skip-stale-B-4",
    localRule: { en: "Shown sorted for reading; real heap only promises the next minimum.", zh: "为便于阅读而排序展示；真实堆只保证下一个最小项。" },
    caption: { en: "The old (B,4) entry is stale because dist[B] is already 3.", zh: "旧的 (B,4) 过期了，因为 dist[B] 已经是 3。" },
    ariaLabel: { en: "Stale priority queue entry for B.", zh: "B 的过期优先队列条目。" }
  },
  "negative-edge-warning": {
    id: "negative-edge-warning",
    variant: "negative-directed",
    warningStepId: "negative-contradiction",
    localRule: { en: "This is a directed warning variant, not the main map.", zh: "这是有向警示变体，不是主地图。" },
    highlightedEdges: [["B", "A"]],
    caption: { en: "A later negative edge contradicts the settled-state promise.", zh: "后来的负边与已确定状态的承诺矛盾。" },
    ariaLabel: { en: "Directed negative edge warning for Dijkstra.", zh: "Dijkstra 的有向负边警示。" }
  },
  "unreachable-node": {
    id: "unreachable-node",
    variant: "main",
    traceStepId: "done",
    localRule: { en: "Unreachable nodes stay Infinity and never enter the heap.", zh: "不可达节点保持 Infinity，且永远不进入堆。" },
    caption: { en: "An isolated G would have dist[G] = Infinity and no parent.", zh: "孤立的 G 会保持 dist[G] = Infinity，且没有父节点。" },
    ariaLabel: { en: "Unreachable isolated node case.", zh: "不可达孤立节点情况。" }
  },
  "path-reconstruction": {
    id: "path-reconstruction",
    variant: "main",
    traceStepId: "done",
    highlightedEdges: [["A", "C"], ["C", "B"], ["B", "D"], ["D", "E"], ["E", "F"]],
    localRule: { en: "Follow parent arrows backward, then reverse the result.", zh: "沿父节点箭头向后追踪，然后反转结果。" },
    caption: { en: "F recovers path A -> C -> B -> D -> E -> F.", zh: "F 恢复出的路径是 A -> C -> B -> D -> E -> F。" },
    ariaLabel: { en: "Path reconstruction from F.", zh: "从 F 恢复路径。" }
  },
  complexity: {
    id: "complexity",
    variant: "main",
    traceStepId: "done",
    localRule: { en: "Edge scans plus heap operations give O((V + E) log V).", zh: "边扫描加堆操作得到 O((V + E) log V)。" },
    caption: { en: "9 undirected edges become 18 directed neighbor scans; duplicate pushes create stale skips.", zh: "9 条无向边变成 18 次有向邻居扫描；重复入堆产生过期跳过。" },
    ariaLabel: { en: "Dijkstra complexity counts for the fixture.", zh: "该例子的 Dijkstra 复杂度计数。" }
  }
};
