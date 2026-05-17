import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type RoomId = "lobby" | "hall" | "lab" | "stairs" | "cafe";

export type RoomNode = {
  id: RoomId;
  label: LocalizedText;
  x: number;
  y: number;
};

export type GraphBasicsEdge = {
  from: RoomId;
  to: RoomId;
  directed?: boolean;
  weight?: number;
};

export type RouteStatus = "unchanged" | "valid-needs-review" | "stale" | "missing";

export type GraphBasicsScenario = {
  id:
    | "room-map"
    | "route-sentences"
    | "door-change-pain"
    | "modeling-choice"
    | "formal-sets"
    | "route-advice-vs-adjacency"
    | "adjacency-list"
    | "adjacency-matrix"
    | "directed-edge"
    | "weighted-edge"
    | "common-confusions";
  title: LocalizedText;
  summary: LocalizedText;
  ariaLabel: LocalizedText;
  activeNode?: RoomId;
  highlightedNodes?: RoomId[];
  highlightedEdges?: Array<[RoomId, RoomId]>;
  variantEdges?: GraphBasicsEdge[];
  highlightedRows?: RoomId[];
  highlightedMatrixCells?: Array<{ row: RoomId; column: RoomId; value: 0 | 1 }>;
  routeCardStatuses?: Array<{
    route: RoomId[];
    status: RouteStatus;
    note: LocalizedText;
  }>;
  representation?: "picture" | "list" | "matrix";
  caption: LocalizedText;
};

export const rooms: RoomNode[] = [
  { id: "lobby", label: { en: "Lobby", zh: "大厅" }, x: 72, y: 92 },
  { id: "hall", label: { en: "Hall", zh: "走廊" }, x: 182, y: 92 },
  { id: "lab", label: { en: "Lab", zh: "实验室" }, x: 292, y: 54 },
  { id: "stairs", label: { en: "Stairs", zh: "楼梯" }, x: 80, y: 188 },
  { id: "cafe", label: { en: "Cafe", zh: "咖啡区" }, x: 244, y: 188 }
];

export const roomIds = rooms.map((room) => room.id);

export const undirectedEdges: Array<[RoomId, RoomId]> = [
  ["lobby", "hall"],
  ["lobby", "stairs"],
  ["hall", "lab"],
  ["hall", "cafe"],
  ["stairs", "cafe"]
];

export const weightedVariant: GraphBasicsEdge[] = [
  { from: "lobby", to: "hall", weight: 2 },
  { from: "lobby", to: "stairs", weight: 5 }
];

export const directedVariant: GraphBasicsEdge[] = [
  { from: "cafe", to: "lab", directed: true }
];

export function roomLabel(id: RoomId, lang: Locale): string {
  return rooms.find((room) => room.id === id)?.label[lang] ?? id;
}

export function neighborsFor(edges: Array<[RoomId, RoomId]> = undirectedEdges): Record<RoomId, RoomId[]> {
  const adjacency: Record<RoomId, RoomId[]> = {
    lobby: [],
    hall: [],
    lab: [],
    stairs: [],
    cafe: []
  };
  for (const [from, to] of edges) {
    adjacency[from].push(to);
    adjacency[to].push(from);
  }
  return adjacency;
}

export const adjacency = neighborsFor();

export function matrixValue(row: RoomId, column: RoomId): 0 | 1 {
  return adjacency[row].includes(column) ? 1 : 0;
}

export const routeCards: RoomId[][] = [
  ["lobby", "hall", "lab"],
  ["stairs", "cafe", "hall", "lab"],
  ["cafe", "hall", "lab"]
];

export const scenarios: Record<GraphBasicsScenario["id"], GraphBasicsScenario> = {
  "room-map": {
    id: "room-map",
    title: { en: "Rooms become nodes", zh: "房间变成节点" },
    summary: {
      en: "Keep only rooms and direct doors. Ignore room size, hallway shape, and physical distance for now.",
      zh: "现在只保留房间和直接相连的门，先忽略房间大小、走廊形状和实际距离。"
    },
    ariaLabel: {
      en: "Five-room graph showing Lobby, Hall, Lab, Stairs, and Cafe connected by doors.",
      zh: "五个房间的图：大厅、走廊、实验室、楼梯和咖啡区由门连接。"
    },
    caption: {
      en: "A graph model keeps the direct-connection facts and throws away floorplan details that do not matter yet.",
      zh: "图模型保留直接连接关系，暂时丢掉当前问题不需要的平面图细节。"
    }
  },
  "route-sentences": {
    id: "route-sentences",
    title: { en: "Route cards feel natural", zh: "路线卡片很自然" },
    summary: {
      en: "Complete route advice is easy to read for a few trips, but it mixes raw structure with human decisions.",
      zh: "少量路线建议很容易读，但它把原始结构和人为决策混在了一起。"
    },
    ariaLabel: { en: "Route cards shown next to the room graph.", zh: "房间图旁边显示路线卡片。" },
    highlightedEdges: [["lobby", "hall"], ["hall", "lab"], ["stairs", "cafe"], ["cafe", "hall"]],
    routeCardStatuses: routeCards.map((route) => ({
      route,
      status: "unchanged",
      note: { en: "Base advice card", zh: "原始建议卡片" }
    })),
    caption: {
      en: "Route cards describe full trips, not reusable local facts.",
      zh: "路线卡片描述完整行程，而不是可复用的局部事实。"
    }
  },
  "door-change-pain": {
    id: "door-change-pain",
    title: { en: "One new door means advice needs review", zh: "新增一扇门，建议就要复查" },
    summary: {
      en: "The deliberate Cafe-Lab variant changes the graph fact. The route cards now need a human audit.",
      zh: "刻意加入 Cafe-Lab 这条变体边后，图事实改变了，路线卡片需要人工复查。"
    },
    ariaLabel: { en: "Cafe-Lab door added and route card statuses shown.", zh: "加入 Cafe-Lab 这扇门，并显示路线卡片状态。" },
    variantEdges: [{ from: "cafe", to: "lab" }],
    highlightedEdges: [["cafe", "lab"]],
    routeCardStatuses: [
      {
        route: ["lobby", "hall", "lab"],
        status: "unchanged",
        note: { en: "Still valid.", zh: "仍然有效。" }
      },
      {
        route: ["stairs", "cafe", "hall", "lab"],
        status: "valid-needs-review",
        note: { en: "Still reaches Lab, but now needs review.", zh: "仍能到实验室，但现在需要复查。" }
      },
      {
        route: ["cafe", "hall", "lab"],
        status: "stale",
        note: { en: "Advice should become Cafe -> Lab.", zh: "建议应改成 Cafe -> Lab。" }
      },
      {
        route: ["cafe", "lab"],
        status: "missing",
        note: { en: "New direct advice is missing.", zh: "缺少新的直接建议。" }
      }
    ],
    caption: {
      en: "Graph fact changed; advice cards now need review.",
      zh: "图事实改变了；建议卡片现在需要复查。"
    }
  },
  "modeling-choice": {
    id: "modeling-choice",
    title: { en: "Choose what the model keeps", zh: "选择模型保留什么" },
    summary: {
      en: "For this page, keep rooms and direct doors. Reject storing every full route.",
      zh: "这一页保留房间和直接连接的门，不把每条完整路线都存下来。"
    },
    ariaLabel: { en: "Modeling choice table for kept, ignored, and rejected details.", zh: "建模选择表：保留、忽略和拒绝的内容。" },
    caption: {
      en: "A graph is a modeling choice, not an inevitable copy of the building.",
      zh: "图是一种建模选择，不是对建筑的必然复制。"
    }
  },
  "formal-sets": {
    id: "formal-sets",
    title: { en: "Picture to notation", zh: "从图像到记号" },
    summary: {
      en: "Lobby becomes a member of V; the Lobby-Hall door becomes an edge in E.",
      zh: "大厅成为 V 中的一个元素；大厅-走廊这扇门成为 E 中的一条边。"
    },
    ariaLabel: { en: "Lobby card maps to lobby in V and Lobby-Hall maps to an edge in E.", zh: "大厅卡片对应 V 中的 lobby，大厅-走廊对应 E 中的一条边。" },
    highlightedEdges: [["lobby", "hall"]],
    highlightedNodes: ["lobby", "hall"],
    caption: { en: "Notation records the same direct facts as the picture.", zh: "形式记号记录的是和图像相同的直接事实。" }
  },
  "route-advice-vs-adjacency": {
    id: "route-advice-vs-adjacency",
    title: { en: "Store local facts, not every trip", zh: "存局部事实，而不是每次行程" },
    summary: {
      en: "The adjacency row for Cafe survives route changes better than a list of full advice cards.",
      zh: "Cafe 的邻接行比一组完整路线建议更容易随结构变化而维护。"
    },
    ariaLabel: { en: "Route advice array contrasted with adjacency object.", zh: "路线建议数组与邻接对象对比。" },
    highlightedRows: ["cafe"],
    caption: {
      en: "One stored undirected edge creates two neighbor facts.",
      zh: "一条存储的无向边会产生两个邻居事实。"
    }
  },
  "adjacency-list": {
    id: "adjacency-list",
    title: { en: "Adjacency list", zh: "邻接表" },
    summary: { en: "Each row lists the rooms one direct door away.", zh: "每一行列出一步门就能到达的房间。" },
    ariaLabel: { en: "Adjacency list for the five-room graph.", zh: "五房间图的邻接表。" },
    highlightedRows: ["hall"],
    caption: { en: "Hall connects directly to Lobby, Lab, and Cafe.", zh: "走廊直接连接大厅、实验室和咖啡区。" }
  },
  "adjacency-matrix": {
    id: "adjacency-matrix",
    title: { en: "Adjacency matrix", zh: "邻接矩阵" },
    summary: {
      en: "Rows and columns are lookup labels, not physical positions.",
      zh: "行和列是查询标签，不是物理位置。"
    },
    ariaLabel: { en: "Matrix lookup for Lab to Cafe is zero.", zh: "矩阵中 Lab 到 Cafe 的查询结果是 0。" },
    highlightedMatrixCells: [{ row: "lab", column: "cafe", value: 0 }],
    caption: { en: "Cell (Lab, Cafe) is 0 because there is no direct door.", zh: "(Lab, Cafe) 单元格是 0，因为没有直接门。" }
  },
  "directed-edge": {
    id: "directed-edge",
    title: { en: "One-way edge", zh: "单向边" },
    summary: {
      en: "Cafe -> Lab changes only Cafe's row. It does not add Lab -> Cafe.",
      zh: "Cafe -> Lab 只改变 Cafe 这一行，不会自动加入 Lab -> Cafe。"
    },
    ariaLabel: { en: "Directed Cafe to Lab edge with one changed adjacency row.", zh: "从 Cafe 指向 Lab 的有向边，只改变一行邻接表。" },
    variantEdges: directedVariant,
    highlightedRows: ["cafe"],
    caption: { en: "Direction decides which row gets the neighbor.", zh: "方向决定哪一行得到这个邻居。" }
  },
  "weighted-edge": {
    id: "weighted-edge",
    title: { en: "Cost labels do not change adjacency", zh: "代价标签不改变邻接关系" },
    summary: {
      en: "Hall and Stairs are both still one neighbor step from Lobby, even with costs 2 and 5.",
      zh: "即使代价分别是 2 和 5，走廊和楼梯仍然都是大厅的一步邻居。"
    },
    ariaLabel: { en: "Lobby-Hall and Lobby-Stairs both one neighbor step with different costs.", zh: "大厅到走廊和大厅到楼梯都是一步邻居，但代价不同。" },
    variantEdges: weightedVariant,
    highlightedEdges: [["lobby", "hall"], ["lobby", "stairs"]],
    caption: { en: "Weight changes cost, not whether a room is adjacent.", zh: "权重改变代价，不改变是否相邻。" }
  },
  "common-confusions": {
    id: "common-confusions",
    title: { en: "Four common mix-ups", zh: "四个常见混淆" },
    summary: {
      en: "Edge vs path, neighbor vs reachable, directed reversal, and weight vs adjacency.",
      zh: "边与路径、邻居与可达、有向反转、权重与邻接。"
    },
    ariaLabel: { en: "Common graph vocabulary confusions using the room fixture.", zh: "使用房间例子的常见图词汇混淆。" },
    caption: { en: "The same fixture keeps the vocabulary grounded.", zh: "同一个例子让词汇始终有具体参照。" }
  }
};

export const exerciseExpectations = {
  selectLobbyNeighbors: ["hall", "stairs"],
  directedCafeLabRow: ["lab"],
  labCafeMatrixCell: 0,
  edgeVsPath: {
    edge: ["hall", "lab"],
    path: ["lobby", "hall", "lab"]
  }
} as const;
