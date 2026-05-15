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
  }
];

export const graphEdges: GraphEdge[] = [
  {
    from: "graph-basics",
    to: "bfs",
    type: "prerequisite",
    reason: {
      en: "BFS needs the ideas of nodes, edges, and adjacency.",
      zh: "BFS 需要节点、边和邻接关系这些图的基本概念。"
    }
  },
  {
    from: "bfs",
    to: "dijkstra",
    type: "generalizes",
    reason: {
      en: "Dijkstra keeps BFS's expanding frontier, but replaces the queue with a priority queue for weighted edges.",
      zh: "Dijkstra 保留 BFS 的扩张前沿，但用优先队列处理带权边。"
    }
  }
];
