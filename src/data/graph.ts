import type { Locale } from "../i18n/locales";

export const edgeTypes = [
  "prerequisite",
  "generalizes",
  "special-case",
  "contrasts",
  "uses",
  "motivates",
  "fails-when",
  "implemented-by",
  "applied-in"
] as const;

export type EdgeType = (typeof edgeTypes)[number];
export type LocalizedText = Record<Locale, string>;

export type GraphNode = {
  id: string;
  label: LocalizedText;
  status: "draft" | "published" | "archived";
  conceptType: "concept" | "algorithm" | "data-structure" | "system" | "math" | "tool";
  position: { x: number; y: number };
};

export type GraphEdge = {
  from: string;
  to: string;
  type: EdgeType;
  reason: LocalizedText;
};

export const graphNodes: GraphNode[] = [
  {
    id: "graph-basics",
    label: {
      en: "Graph Basics",
      zh: "图的基础"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 150 }
  },
  {
    id: "bfs",
    label: {
      en: "Breadth-First Search",
      zh: "广度优先搜索"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 90 }
  },
  {
    id: "dijkstra",
    label: {
      en: "Dijkstra's Algorithm",
      zh: "Dijkstra 算法"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 540, y: 150 }
  },
  {
    id: "closest-pair-divide-and-conquer",
    label: {
      en: "Closest Pair D&C",
      zh: "最近点对分治"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 235 }
  },
  {
    id: "graham-scan",
    label: {
      en: "Graham Scan",
      zh: "Graham 扫描"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 540, y: 235 }
  },
  {
    id: "bentley-ottmann",
    label: {
      en: "Bentley-Ottmann Sweep Line",
      zh: "Bentley-Ottmann 扫描线"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 770, y: 235 }
  },
  {
    id: "p-vs-np",
    label: {
      en: "P vs NP",
      zh: "P 与 NP"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 420 }
  },
  {
    id: "polynomial-time-reductions",
    label: {
      en: "Polynomial-Time Reductions",
      zh: "多项式时间归约"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 420 }
  },
  {
    id: "np-hardness",
    label: {
      en: "NP-Hardness",
      zh: "NP-Hardness"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 540, y: 420 }
  },
  {
    id: "circuit-sat",
    label: {
      en: "Circuit-SAT",
      zh: "电路可满足性"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 770, y: 420 }
  },
  {
    id: "circuit-sat-to-sat",
    label: {
      en: "Circuit-SAT to SAT",
      zh: "从 Circuit-SAT 到 SAT 的归约"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 885, y: 520 }
  },
  {
    id: "sat",
    label: {
      en: "Boolean Satisfiability (SAT)",
      zh: "布尔可满足性（SAT）"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 1000, y: 420 }
  }
];

export const graphEdges: GraphEdge[] = [
  {
    from: "graph-basics",
    to: "bfs",
    type: "prerequisite",
    reason: {
      en: "BFS repeatedly asks for each node's immediate neighbors, so it depends on nodes, edges, and adjacency.",
      zh: "BFS 会反复查看每个节点的直接邻居，因此需要节点、边和邻接关系这些图的基础。"
    }
  },
  {
    from: "bfs",
    to: "dijkstra",
    type: "generalizes",
    reason: {
      en: "Dijkstra keeps BFS's frontier-and-distance idea, but chooses the next node by smallest tentative total cost instead of FIFO queue order.",
      zh: "Dijkstra 保留 BFS 的前沿和距离思想，但按当前暂定总代价最小来选择下一个节点，而不是按先进先出的队列顺序。"
    }
  },
  {
    from: "closest-pair-divide-and-conquer",
    to: "graham-scan",
    type: "contrasts",
    reason: {
      en: "Both are geometric algorithms, but closest pair uses divide and conquer while Graham Scan uses ordering plus a stack invariant.",
      zh: "二者都是几何算法，但最近点对分治依赖递归合并，Graham 扫描依赖排序和栈不变量。"
    }
  },
  {
    from: "closest-pair-divide-and-conquer",
    to: "bentley-ottmann",
    type: "contrasts",
    reason: {
      en: "Both avoid naive pair checking in geometry, but closest pair uses recursive spatial filtering while Bentley-Ottmann uses a dynamic sweep line.",
      zh: "二者都在几何问题中避免朴素的成对检查，但最近点对使用递归空间过滤，而 Bentley-Ottmann 使用动态扫描线。"
    }
  },
  {
    from: "graham-scan",
    to: "bentley-ottmann",
    type: "motivates",
    reason: {
      en: "Graham Scan introduces geometric ordering and local turn tests; Bentley-Ottmann extends that idea to an order maintained by changing events.",
      zh: "Graham 扫描引入几何排序和局部转向测试；Bentley-Ottmann 将这种思想扩展为随事件变化而维护的动态顺序。"
    }
  },
  {
    from: "p-vs-np",
    to: "polynomial-time-reductions",
    type: "prerequisite",
    reason: {
      en: "Reductions compare decision problems using polynomial time, so learners first need the P vs NP vocabulary of decision problems and polynomial-time algorithms.",
      zh: "归约用多项式时间来比较判定问题，因此学习者需要先理解 P 与 NP 中的判定问题和多项式时间算法。"
    }
  },
  {
    from: "polynomial-time-reductions",
    to: "np-hardness",
    type: "prerequisite",
    reason: {
      en: "NP-hardness is defined by polynomial-time reductions from every NP problem to a target.",
      zh: "NP-hardness 定义为 NP 的每个问题都向目标问题的多项式时间归约。"
    }
  },
  {
    from: "np-hardness",
    to: "circuit-sat",
    type: "prerequisite",
    reason: {
      en: "Circuit-SAT is the first concrete source problem after the general NP-hardness definition.",
      zh: "电路可满足性是在一般 NP-hardness 定义之后的第一个具体源问题。"
    }
  },
  {
    from: "p-vs-np",
    to: "circuit-sat",
    type: "uses",
    reason: {
      en: "Circuit-SAT uses the P vs NP idea that a proposed assignment can serve as a polynomial-time checkable certificate.",
      zh: "电路可满足性使用了 P 与 NP 中“候选赋值可作为多项式时间可检查证书”的思想。"
    }
  },
  {
    from: "polynomial-time-reductions",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "This reduction is the first concrete SAT-facing use of polynomial-time reductions.",
      zh: "该归约是多项式时间归约在 SAT 方向上的第一处具体实现。"
    }
  },
  {
    from: "circuit-sat",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "The reduction starts from a concrete circuit-SAT source instance and emits a SAT formula.",
      zh: "该归约从具体的 Circuit-SAT 源实例出发，产生一个 SAT 公式。"
    }
  },
  {
    from: "circuit-sat",
    to: "sat",
    type: "motivates",
    reason: {
      en: "SAT asks the same search-for-an-assignment question as Circuit-SAT, but the object is a Boolean formula instead of a gate circuit.",
      zh: "SAT 询问的仍是“是否存在一个满足赋值”，但对象从门电路换成了布尔公式。"
    }
  },
  {
    from: "sat",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "The target language and satisfiability structure are fixed by SAT before introducing this concrete reduction.",
      zh: "在介绍这一具体归约前，先有 SAT 的目标语言与可满足性形式框架。"
    }
  }
];
