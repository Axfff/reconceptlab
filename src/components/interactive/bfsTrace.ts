import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type MainBfsNodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type StackComparisonNodeId = "A" | "B" | "C" | "D" | "E" | "X";
export type WeightedCounterexampleNodeId = "A" | "B" | "C";

export type BfsPhase = "start" | "dequeue" | "scan-neighbor" | "discover" | "skip-discovered" | "finish-node" | "done";

export type BfsStep<NodeId extends string = MainBfsNodeId> = {
  id: string;
  phase: BfsPhase;
  current?: NodeId;
  activeNeighbor?: NodeId;
  queue: NodeId[];
  discovered: NodeId[];
  expanded: NodeId[];
  distance: Partial<Record<NodeId, number>>;
  parent: Partial<Record<NodeId, NodeId>>;
  newlyDiscovered?: NodeId[];
  skipped?: NodeId[];
  explanation: LocalizedText;
};

export type BfsScenario<NodeId extends string = MainBfsNodeId> = {
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
  caption: LocalizedText;
  ariaLabel: LocalizedText;
};

export const nodes: MainBfsNodeId[] = ["A", "B", "C", "D", "E", "F", "G"];

export const adjacency: Record<MainBfsNodeId, MainBfsNodeId[]> = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B", "G"],
  E: ["B", "G"],
  F: ["C", "G"],
  G: ["D", "E", "F"]
};

export const positions: Record<MainBfsNodeId, { x: number; y: number }> = {
  A: { x: 170, y: 38 },
  B: { x: 95, y: 105 },
  C: { x: 245, y: 105 },
  D: { x: 58, y: 185 },
  E: { x: 142, y: 185 },
  F: { x: 245, y: 185 },
  G: { x: 170, y: 255 }
};

export const undirectedEdges: Array<[MainBfsNodeId, MainBfsNodeId]> = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["B", "E"],
  ["C", "F"],
  ["D", "G"],
  ["E", "G"],
  ["F", "G"]
];

const baseDistance: Partial<Record<MainBfsNodeId, number>> = { A: 0 };
const baseParent: Partial<Record<MainBfsNodeId, MainBfsNodeId>> = {};

export const trace: BfsStep[] = [
  {
    id: "start",
    phase: "start",
    current: "A",
    queue: ["A"],
    discovered: ["A"],
    expanded: [],
    distance: baseDistance,
    parent: baseParent,
    explanation: {
      en: "Start at A. It is discovered, queued, and has distance 0.",
      zh: "从 A 开始。A 已发现、已入队，距离为 0。"
    }
  },
  {
    id: "after-expand-A",
    phase: "finish-node",
    current: "A",
    queue: ["B", "C"],
    discovered: ["A", "B", "C"],
    expanded: ["A"],
    distance: { A: 0, B: 1, C: 1 },
    parent: { B: "A", C: "A" },
    newlyDiscovered: ["B", "C"],
    explanation: {
      en: "Expand A. B and C are first discovered, assigned distance 1, and queued in that order.",
      zh: "展开 A。B 和 C 第一次被发现，距离设为 1，并按这个顺序入队。"
    }
  },
  {
    id: "after-expand-B",
    phase: "finish-node",
    current: "B",
    queue: ["C", "D", "E"],
    discovered: ["A", "B", "C", "D", "E"],
    expanded: ["A", "B"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2 },
    parent: { B: "A", C: "A", D: "B", E: "B" },
    newlyDiscovered: ["D", "E"],
    skipped: ["A"],
    explanation: {
      en: "Expand B. A is already expanded; D and E join behind C as layer-2 nodes.",
      zh: "展开 B。A 已经展开；D 和 E 作为第 2 层节点排在 C 后面。"
    }
  },
  {
    id: "after-expand-C",
    phase: "finish-node",
    current: "C",
    queue: ["D", "E", "F"],
    discovered: ["A", "B", "C", "D", "E", "F"],
    expanded: ["A", "B", "C"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C" },
    newlyDiscovered: ["F"],
    skipped: ["A"],
    explanation: {
      en: "C expands before D and E because it was queued earlier. F joins the layer-2 group.",
      zh: "C 比 D 和 E 更早入队，所以先展开。F 加入第 2 层。"
    }
  },
  {
    id: "after-dequeue-D",
    phase: "dequeue",
    current: "D",
    queue: ["E", "F"],
    discovered: ["A", "B", "C", "D", "E", "F"],
    expanded: ["A", "B", "C"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C" },
    explanation: {
      en: "Dequeue D. The queue still holds E and F before any newly discovered layer-3 node.",
      zh: "取出 D。队列里 E 和 F 仍排在任何新发现的第 3 层节点前面。"
    }
  },
  {
    id: "scan-D-G",
    phase: "scan-neighbor",
    current: "D",
    activeNeighbor: "G",
    queue: ["E", "F"],
    discovered: ["A", "B", "C", "D", "E", "F"],
    expanded: ["A", "B", "C"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C" },
    explanation: {
      en: "Scan edge D-G. G is unseen, so this edge can discover it.",
      zh: "扫描边 D-G。G 还未出现，所以这条边可以发现它。"
    }
  },
  {
    id: "discover-G-from-D",
    phase: "discover",
    current: "D",
    activeNeighbor: "G",
    queue: ["E", "F", "G"],
    discovered: ["A", "B", "C", "D", "E", "F", "G"],
    expanded: ["A", "B", "C"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C", G: "D" },
    newlyDiscovered: ["G"],
    explanation: {
      en: "Discover G as one compound step: mark it visited, set distance 3, set parent D, then enqueue it.",
      zh: "用一个复合步骤发现 G：标记已访问，距离设为 3，父节点设为 D，然后入队。"
    }
  },
  {
    id: "after-expand-D",
    phase: "finish-node",
    current: "D",
    queue: ["E", "F", "G"],
    discovered: ["A", "B", "C", "D", "E", "F", "G"],
    expanded: ["A", "B", "C", "D"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C", G: "D" },
    explanation: {
      en: "D is finished. G waits behind E and F, preserving the layer barrier.",
      zh: "D 处理完成。G 排在 E 和 F 后面，保持层级屏障。"
    }
  },
  {
    id: "skip-E-G",
    phase: "skip-discovered",
    current: "E",
    activeNeighbor: "G",
    queue: ["F", "G"],
    discovered: ["A", "B", "C", "D", "E", "F", "G"],
    expanded: ["A", "B", "C", "D", "E"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C", G: "D" },
    skipped: ["G"],
    explanation: {
      en: "E also reaches G, but G was already discovered from D. Do not re-parent it.",
      zh: "E 也能到 G，但 G 已经由 D 发现。不要改写它的父节点。"
    }
  },
  {
    id: "skip-F-G",
    phase: "skip-discovered",
    current: "F",
    activeNeighbor: "G",
    queue: ["G"],
    discovered: ["A", "B", "C", "D", "E", "F", "G"],
    expanded: ["A", "B", "C", "D", "E", "F"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C", G: "D" },
    skipped: ["G"],
    explanation: {
      en: "F tries G too. The first discovery still wins, so parent[G] remains D.",
      zh: "F 也尝试 G。第一次发现仍然有效，所以 parent[G] 保持为 D。"
    }
  },
  {
    id: "done",
    phase: "done",
    queue: [],
    discovered: ["A", "B", "C", "D", "E", "F", "G"],
    expanded: ["A", "B", "C", "D", "E", "F", "G"],
    distance: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { B: "A", C: "A", D: "B", E: "B", F: "C", G: "D" },
    explanation: {
      en: "The queue is empty. Every reachable node has its shortest edge distance from A.",
      zh: "队列为空。每个可达节点都得到了从 A 出发按边数计算的最短距离。"
    }
  }
];

export const stackComparisonAdjacency: Record<StackComparisonNodeId, StackComparisonNodeId[]> = {
  A: ["C", "B"],
  B: ["D"],
  C: ["X"],
  D: ["E"],
  E: ["X"],
  X: []
};

export const stackComparisonPositions: Record<StackComparisonNodeId, { x: number; y: number }> = {
  A: { x: 55, y: 70 },
  C: { x: 160, y: 30 },
  B: { x: 160, y: 110 },
  D: { x: 250, y: 110 },
  E: { x: 330, y: 110 },
  X: { x: 330, y: 30 }
};

export const weightedCounterexample = {
  nodes: ["A", "B", "C"] as WeightedCounterexampleNodeId[],
  edges: [
    ["A", "B", 10],
    ["A", "C", 1],
    ["C", "B", 1]
  ] as Array<[WeightedCounterexampleNodeId, WeightedCounterexampleNodeId, number]>
};

export const finalDistance = trace.find((step) => step.id === "done")!.distance as Record<MainBfsNodeId, number>;
export const finalParent = trace.find((step) => step.id === "done")!.parent as Partial<Record<MainBfsNodeId, MainBfsNodeId>>;

export const scenarios: Record<BfsScenario["id"], BfsScenario> = {
  "hook-layers": {
    id: "hook-layers",
    traceStepId: "done",
    highlightedNodes: ["A", "B", "C", "D", "E", "F", "G"],
    caption: { en: "The target result is a set of distance layers from A.", zh: "目标结果是从 A 出发的一组距离层。" },
    ariaLabel: { en: "BFS graph with distance layers from A.", zh: "从 A 出发按距离分层的 BFS 图。" }
  },
  "naive-deep-path": {
    id: "naive-deep-path",
    highlightedEdges: [["A", "B"], ["B", "D"], ["D", "G"]],
    caption: { en: "A deep walk can reach G before closer alternatives are expanded.", zh: "一条深入路径可能先到 G，而近处选择还没展开。" },
    ariaLabel: { en: "Deep path A to B to D to G highlighted.", zh: "高亮 A 到 B 到 D 到 G 的深入路径。" }
  },
  "queue-vs-stack": {
    id: "queue-vs-stack",
    comparisonMode: "stack",
    stackTop: "B",
    caption: { en: "FIFO keeps layers; LIFO can expose deeper nodes first.", zh: "先进先出保持层次；后进先出可能先暴露更深节点。" },
    ariaLabel: { en: "Queue versus stack comparison.", zh: "队列与栈的对比。" }
  },
  "fifo-repair": {
    id: "fifo-repair",
    traceStepId: "after-expand-B",
    caption: { en: "C stays in front of newly discovered D and E.", zh: "C 保持排在新发现的 D 和 E 前面。" },
    ariaLabel: { en: "Queue after expanding B shows C before D and E.", zh: "展开 B 后队列中 C 在 D 和 E 前。" }
  },
  "formal-state": {
    id: "formal-state",
    traceStepId: "discover-G-from-D",
    caption: { en: "A first discovery sets visited, distance, parent, and queue together.", zh: "第一次发现会同时设置 visited、distance、parent 和队列。" },
    ariaLabel: { en: "Formal BFS state while discovering G from D.", zh: "从 D 发现 G 时的 BFS 形式化状态。" }
  },
  "code-trace": {
    id: "code-trace",
    traceStepId: "discover-G-from-D",
    caption: { en: "The code block for discovery maps to one visible trace step.", zh: "发现节点的代码块对应一个可见追踪步骤。" },
    ariaLabel: { en: "Code to trace mapping for discovering G.", zh: "发现 G 的代码到追踪映射。" }
  },
  "layer-barrier": {
    id: "layer-barrier",
    traceStepId: "after-expand-B",
    caption: { en: "Queue split: [remaining layer 1 | new layer 2] = [C | D, E].", zh: "队列分割：[剩余第 1 层 | 新第 2 层] = [C | D, E]。" },
    ariaLabel: { en: "Layer barrier queue after expanding B.", zh: "展开 B 后的层级屏障队列。" }
  },
  "edge-scan-cost": {
    id: "edge-scan-cost",
    traceStepId: "done",
    caption: { en: "Each adjacency row is scanned once, so work is V plus E.", zh: "每个邻接行扫描一次，所以工作量是 V 加 E。" },
    ariaLabel: { en: "BFS edge scan cost checklist.", zh: "BFS 边扫描成本清单。" }
  },
  "visited-timing": {
    id: "visited-timing",
    traceStepId: "skip-E-G",
    caption: { en: "Marking on discovery prevents duplicate G entries.", zh: "发现时标记可以避免重复的 G 入队。" },
    ariaLabel: { en: "Visited timing duplicate G caution.", zh: "访问时机与重复 G 的提醒。" }
  },
  "weighted-counterexample": {
    id: "weighted-counterexample",
    caption: { en: "Fewest edges and lowest total cost can disagree.", zh: "边数最少和总代价最低可能不一致。" },
    ariaLabel: { en: "Weighted graph where BFS edge count differs from total cost.", zh: "边数与总代价不同的带权图。" }
  },
  "parent-vs-distance": {
    id: "parent-vs-distance",
    traceStepId: "done",
    caption: { en: "Distances are numbers; parents recover a path tree.", zh: "距离是数字；父节点恢复路径树。" },
    ariaLabel: { en: "BFS parent tree and distance table.", zh: "BFS 父节点树和距离表。" }
  }
};
