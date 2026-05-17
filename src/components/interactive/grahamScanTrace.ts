import type { Locale } from "../../i18n/locales";

export type Point = { id: string; x: number; y: number };
export type Orientation = "left" | "right" | "collinear";
export type Phase = "anchor" | "sort" | "scan" | "done";
export type Action = "choose-anchor" | "compare-angle" | "push" | "pop" | "finish";
export type LocalizedText = Record<Locale, string>;

export type GrahamStep = {
  id: string;
  phase: Phase;
  action: Action;
  activePoint?: string;
  activeSortedIndex?: number;
  visibleSortedCount?: number;
  stack: string[];
  sortedOrder: string[];
  poppedPoint?: string;
  triple?: [string, string, string];
  orientation?: Orientation;
  explanation: LocalizedText;
};

export type GrahamScenario = {
  id: "hook-hull" | "anchor-sort" | "right-turn-pop-f" | "same-angle";
  title: LocalizedText;
  summary: LocalizedText;
  ariaLabel: LocalizedText;
  caption: LocalizedText;
  testId: string;
  traceStepId?: string;
  expectedAnnotation: LocalizedText;
  expectedPointLabels: string[];
  state?: {
    beforeStack?: string[];
    afterStack?: string[];
    activePoint?: string;
    triple?: [string, string, string];
    orientation?: Orientation;
    poppedPoint?: string;
  };
  layers: {
    hullPolygon?: string[];
    edges?: Array<{ from: string; to: string; variant?: "hull" | "candidate" | "failed" | "faint" }>;
    rays?: Array<{ from: string; to: string; variant?: "baseline" | "sorted" | "active" | "faint"; label?: string }>;
    activeTriple?: [string, string, string];
    highlightedPoints?: string[];
    violatingPoints?: string[];
  };
};

export const points: Point[] = [
  { id: "A", x: 1, y: 1 },
  { id: "B", x: 3, y: 1 },
  { id: "C", x: 5, y: 1 },
  { id: "D", x: 6, y: 4 },
  { id: "E", x: 4, y: 5 },
  { id: "F", x: 4, y: 2 },
  { id: "G", x: 5, y: 3 },
  { id: "H", x: 1, y: 5 },
  { id: "I", x: 3, y: 3 }
];

export const discriminatingAnchorFixture: Point[] = [
  { id: "L", x: 0, y: 4 },
  { id: "A", x: 1, y: 1 },
  { id: "R", x: 4, y: 2 },
  { id: "T", x: 2, y: 5 }
];

export const sortedOrder = ["B", "C", "F", "G", "D", "I", "E", "H"];
export const finalHull = ["A", "C", "D", "E", "H"];

export const pointById = new Map(points.map((point) => [point.id, point]));

export function lowestLeftmost(input: Point[]): Point {
  if (input.length === 0) throw new Error("lowestLeftmost needs at least one point");
  return [...input].sort((a, b) => a.y - b.y || a.x - b.x)[0];
}

export function orient(p: Point, q: Point, r: Point): number {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

export function orientationOf(triple: [string, string, string]): Orientation {
  const [p, q, r] = triple.map((id) => pointById.get(id));
  if (!p || !q || !r) throw new Error(`Unknown point in triple ${triple.join(",")}`);
  const value = orient(p, q, r);
  if (value > 0) return "left";
  if (value < 0) return "right";
  return "collinear";
}

export function distanceSquared(p: Point, q: Point): number {
  return (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
}

export function toScreen(point: Point) {
  return {
    x: 34 + point.x * 44,
    y: 260 - point.y * 40
  };
}

export function pathFor(ids: string[], close = false) {
  const coords = ids
    .map((id) => pointById.get(id))
    .filter((point): point is Point => Boolean(point))
    .map(toScreen);
  if (coords.length === 0) return "";
  const commands = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`);
  return `${commands.join(" ")}${close ? " Z" : ""}`;
}

export const trace: GrahamStep[] = [
  {
    id: "choose-anchor",
    phase: "anchor",
    action: "choose-anchor",
    activePoint: "A",
    stack: [],
    sortedOrder: [],
    explanation: {
      en: "Choose A as the anchor: it has the smallest y-coordinate, and ties would use the smaller x-coordinate.",
      zh: "选择 A 作为锚点（anchor）：它的 y 坐标最小；如果并列，就选 x 更小的点。"
    }
  },
  {
    id: "sort-complete",
    phase: "sort",
    action: "compare-angle",
    activePoint: "B",
    activeSortedIndex: 0,
    visibleSortedCount: sortedOrder.length,
    stack: [],
    sortedOrder,
    explanation: {
      en: "Sort the other points by polar angle from A, starting from the ray pointing right and rotating counterclockwise.",
      zh: "把其他点按相对 A 的极角（polar angle）排序：从向右的射线开始，逆时针旋转。"
    }
  },
  {
    id: "push-b",
    phase: "scan",
    action: "push",
    activePoint: "B",
    activeSortedIndex: 0,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "B"],
    sortedOrder,
    explanation: {
      en: "Push B. With only A and B, there is not enough boundary yet to test a turn.",
      zh: "压入 B。现在只有 A 和 B，还不足以测试一次转向。"
    }
  },
  {
    id: "pop-b",
    phase: "scan",
    action: "pop",
    activePoint: "C",
    activeSortedIndex: 1,
    visibleSortedCount: sortedOrder.length,
    stack: ["A"],
    sortedOrder,
    poppedPoint: "B",
    triple: ["A", "B", "C"],
    orientation: "collinear",
    explanation: {
      en: "B and C lie on the same ray from A. C is farther, so C makes A, B, C collinear and B is not a corner.",
      zh: "B 和 C 在从 A 出发的同一条射线上。C 更远，所以 A、B、C 共线，B 不是角点。"
    }
  },
  {
    id: "push-c",
    phase: "scan",
    action: "push",
    activePoint: "C",
    activeSortedIndex: 1,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C"],
    sortedOrder,
    explanation: {
      en: "Push C. For a corner-only hull, the farther point remains on this ray.",
      zh: "压入 C。对于只保留角点的凸包，这条射线上保留更远的点。"
    }
  },
  {
    id: "push-f",
    phase: "scan",
    action: "push",
    activePoint: "F",
    activeSortedIndex: 2,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "F"],
    sortedOrder,
    triple: ["A", "C", "F"],
    orientation: "left",
    explanation: {
      en: "A -> C -> F is a left turn, so F can extend the tentative boundary.",
      zh: "A -> C -> F 是左转，所以 F 可以扩展当前候选边界。"
    }
  },
  {
    id: "pop-f",
    phase: "scan",
    action: "pop",
    activePoint: "G",
    activeSortedIndex: 3,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C"],
    sortedOrder,
    poppedPoint: "F",
    triple: ["C", "F", "G"],
    orientation: "right",
    explanation: {
      en: "C -> F -> G is a right turn. F makes the boundary cave inward, so pop F.",
      zh: "C -> F -> G 是右转。F 让边界向内凹，所以弹出 F。"
    }
  },
  {
    id: "push-g",
    phase: "scan",
    action: "push",
    activePoint: "G",
    activeSortedIndex: 3,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "G"],
    sortedOrder,
    triple: ["A", "C", "G"],
    orientation: "left",
    explanation: {
      en: "After removing F, A -> C -> G is a left turn. Push G.",
      zh: "移除 F 后，A -> C -> G 是左转。压入 G。"
    }
  },
  {
    id: "pop-g",
    phase: "scan",
    action: "pop",
    activePoint: "D",
    activeSortedIndex: 4,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C"],
    sortedOrder,
    poppedPoint: "G",
    triple: ["C", "G", "D"],
    orientation: "right",
    explanation: {
      en: "C -> G -> D is another right turn, so G was only a temporary boundary point.",
      zh: "C -> G -> D 也是右转，所以 G 只是临时边界点。"
    }
  },
  {
    id: "push-d",
    phase: "scan",
    action: "push",
    activePoint: "D",
    activeSortedIndex: 4,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "D"],
    sortedOrder,
    triple: ["A", "C", "D"],
    orientation: "left",
    explanation: {
      en: "A -> C -> D is a left turn. D stays on the hull prefix.",
      zh: "A -> C -> D 是左转。D 保留在当前凸包前缀中。"
    }
  },
  {
    id: "push-i",
    phase: "scan",
    action: "push",
    activePoint: "I",
    activeSortedIndex: 5,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "D", "I"],
    sortedOrder,
    triple: ["C", "D", "I"],
    orientation: "left",
    explanation: {
      en: "I looks possible for the moment because C -> D -> I is a left turn.",
      zh: "此刻 I 看起来可能属于边界，因为 C -> D -> I 是左转。"
    }
  },
  {
    id: "pop-i",
    phase: "scan",
    action: "pop",
    activePoint: "E",
    activeSortedIndex: 6,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "D"],
    sortedOrder,
    poppedPoint: "I",
    triple: ["D", "I", "E"],
    orientation: "right",
    explanation: {
      en: "D -> I -> E turns right. I was an interior detour, so pop it.",
      zh: "D -> I -> E 是右转。I 是向内部绕进去的点，所以弹出 I。"
    }
  },
  {
    id: "push-e",
    phase: "scan",
    action: "push",
    activePoint: "E",
    activeSortedIndex: 6,
    visibleSortedCount: sortedOrder.length,
    stack: ["A", "C", "D", "E"],
    sortedOrder,
    triple: ["C", "D", "E"],
    orientation: "left",
    explanation: {
      en: "C -> D -> E is a left turn. Push E.",
      zh: "C -> D -> E 是左转。压入 E。"
    }
  },
  {
    id: "push-h",
    phase: "scan",
    action: "push",
    activePoint: "H",
    activeSortedIndex: 7,
    visibleSortedCount: sortedOrder.length,
    stack: finalHull,
    sortedOrder,
    triple: ["D", "E", "H"],
    orientation: "left",
    explanation: {
      en: "D -> E -> H is a left turn. H closes the last upper-left corner.",
      zh: "D -> E -> H 是左转。H 补上左上方的最后一个角。"
    }
  },
  {
    id: "done",
    phase: "done",
    action: "finish",
    visibleSortedCount: sortedOrder.length,
    stack: finalHull,
    sortedOrder,
    explanation: {
      en: "The scan is done. The hull corners are A, C, D, E, H, and the polygon closes back to A.",
      zh: "扫描完成。凸包角点是 A、C、D、E、H，最后从 H 回到 A 闭合。"
    }
  }
];

export const scenarios: Record<GrahamScenario["id"], GrahamScenario> = {
  "hook-hull": {
    id: "hook-hull",
    title: {
      en: "Rubber-band hull",
      zh: "橡皮筋外边界"
    },
    summary: {
      en: "Only the outside corner points A, C, D, E, and H touch the tight boundary.",
      zh: "只有外侧角点 A、C、D、E、H 会接触绷紧后的边界。"
    },
    ariaLabel: {
      en: "Point set with final convex hull A C D E H outlined.",
      zh: "点集图，标出最终凸包 A C D E H。"
    },
    caption: {
      en: "The rubber band ignores interior points and touches the corner vertices.",
      zh: "橡皮筋会绕过内部点，只接触外侧角点。"
    },
    testId: "graham-scenario-hook-hull",
    expectedAnnotation: {
      en: "Hull: A -> C -> D -> E -> H",
      zh: "凸包：A -> C -> D -> E -> H"
    },
    expectedPointLabels: points.map((point) => point.id),
    layers: {
      hullPolygon: finalHull,
      highlightedPoints: finalHull
    }
  },
  "anchor-sort": {
    id: "anchor-sort",
    title: {
      en: "Anchor and sorted rays",
      zh: "锚点与极角顺序"
    },
    summary: {
      en: "A is the lowest-leftmost anchor. The rays are ordered from the positive x direction counterclockwise.",
      zh: "A 是 lowest-leftmost 锚点。射线从 x 正方向开始按逆时针排序。"
    },
    ariaLabel: {
      en: "Anchor A with numbered rays showing sorted order B C F G D I E H.",
      zh: "锚点 A 以及编号射线，展示排序顺序 B C F G D I E H。"
    },
    caption: {
      en: "Sorted order: B, C, F, G, D, I, E, H.",
      zh: "排序顺序：B、C、F、G、D、I、E、H。"
    },
    testId: "graham-scenario-anchor-sort",
    traceStepId: "sort-complete",
    expectedAnnotation: {
      en: "Sorted order: B, C, F, G, D, I, E, H",
      zh: "排序顺序：B、C、F、G、D、I、E、H"
    },
    expectedPointLabels: points.map((point) => point.id),
    layers: {
      rays: [
        { from: "A", to: "B", variant: "baseline", label: "1" },
        { from: "A", to: "C", variant: "sorted", label: "2" },
        { from: "A", to: "F", variant: "sorted", label: "3" },
        { from: "A", to: "G", variant: "sorted", label: "4" },
        { from: "A", to: "D", variant: "sorted", label: "5" },
        { from: "A", to: "I", variant: "sorted", label: "6" },
        { from: "A", to: "E", variant: "sorted", label: "7" },
        { from: "A", to: "H", variant: "sorted", label: "8" }
      ],
      highlightedPoints: ["A"]
    }
  },
  "right-turn-pop-f": {
    id: "right-turn-pop-f",
    title: {
      en: "Right-turn repair",
      zh: "右转修复"
    },
    summary: {
      en: "When G arrives, C -> F -> G turns right, so F is popped from the stack.",
      zh: "当 G 到来时，C -> F -> G 是右转，所以 F 从栈中弹出。"
    },
    ariaLabel: {
      en: "Right turn C F G with F popped from stack A C F.",
      zh: "C F G 形成右转，F 从栈 A C F 中弹出。"
    },
    caption: {
      en: "Before: A -> C -> F. Active point G proves F is an inward detour.",
      zh: "修复前：A -> C -> F。当前点 G 证明 F 是向内绕进去的点。"
    },
    testId: "graham-scenario-right-turn-pop-f",
    traceStepId: "pop-f",
    expectedAnnotation: {
      en: "orient(C, F, G) = right turn; pop F",
      zh: "orient(C, F, G) = 右转；弹出 F"
    },
    expectedPointLabels: points.map((point) => point.id),
    state: {
      beforeStack: ["A", "C", "F"],
      afterStack: ["A", "C"],
      activePoint: "G",
      triple: ["C", "F", "G"],
      orientation: "right",
      poppedPoint: "F"
    },
    layers: {
      edges: [
        { from: "A", to: "C", variant: "hull" },
        { from: "C", to: "F", variant: "failed" },
        { from: "F", to: "G", variant: "failed" }
      ],
      activeTriple: ["C", "F", "G"],
      highlightedPoints: ["A", "C", "F", "G"]
    }
  },
  "same-angle": {
    id: "same-angle",
    title: {
      en: "Same-angle tie",
      zh: "同极角并列"
    },
    summary: {
      en: "B and C share the same ray from A. C is farther, so B is popped as a collinear middle point.",
      zh: "B 和 C 在从 A 出发的同一条射线上。C 更远，所以 B 作为共线中间点被弹出。"
    },
    ariaLabel: {
      en: "Same ray A B C where B is popped and C remains.",
      zh: "A B C 在同一射线上，B 被弹出，C 保留。"
    },
    caption: {
      en: "Near-to-far sorting makes the farther same-angle point remove the nearer non-corner.",
      zh: "同极角按由近到远排序，让更远的点移除较近的非角点。"
    },
    testId: "graham-scenario-same-angle",
    traceStepId: "pop-b",
    expectedAnnotation: {
      en: "orient(A, B, C) = collinear; pop B",
      zh: "orient(A, B, C) = 共线；弹出 B"
    },
    expectedPointLabels: points.map((point) => point.id),
    state: {
      beforeStack: ["A", "B"],
      afterStack: ["A"],
      activePoint: "C",
      triple: ["A", "B", "C"],
      orientation: "collinear",
      poppedPoint: "B"
    },
    layers: {
      rays: [
        { from: "A", to: "B", variant: "faint", label: "near" },
        { from: "A", to: "C", variant: "active", label: "far" }
      ],
      activeTriple: ["A", "B", "C"],
      highlightedPoints: ["A", "B", "C"]
    }
  }
};
