import type { Locale } from "../../i18n/locales";

export type Point = { id: string; x: number; y: number };
export type Pair = [string, string];
export type Side = "left" | "right";
export type CellKey = `${number},${number}`;
export type Phase = "naive" | "split" | "recurse" | "threshold" | "grid" | "check" | "done";
export type PairCategory =
  | "same-side-already-solved"
  | "outside-band"
  | "outside-neighbor-window"
  | "checked-loses"
  | "checked-wins";
export type LocalizedText = Record<Locale, string>;

export type ClosestPairStep = {
  id: string;
  phase: Phase;
  activePair?: Pair;
  activeCell?: CellKey;
  activePoint?: string;
  activeNeighborOffsets?: Array<{ dx: number; dy: number }>;
  neighborCells?: CellKey[];
  checkedPairs: Pair[];
  visiblePairs?: Pair[];
  pairCategories?: Partial<Record<PairCategory, Pair[]>>;
  bestPair?: Pair;
  bestDistance?: number;
  explanation: LocalizedText;
};

export type ClosestPairScenario = {
  id:
    | "hook-map"
    | "naive-pair-count"
    | "radius-neighborhood"
    | "split-after-recursion"
    | "recursion-scaffold"
    | "threshold-band"
    | "packing-occupancy"
    | "cell-distance-ruler"
    | "grid-cell-size"
    | "active-neighbor-cells"
    | "pair-classification"
    | "code-trace-map"
    | "candidate-filter"
    | "complexity-tree"
    | "boundary-cell-rule"
    | "tie-distance"
    | "duplicate-points";
  title: LocalizedText;
  summary: LocalizedText;
  ariaLabel: LocalizedText;
  caption: LocalizedText;
  testId: string;
  traceStepId?: string;
  expectedAnnotation: LocalizedText;
  layers: {
    splitLine?: boolean;
    band?: boolean;
    grid?: boolean;
    radiusPoint?: string;
    highlightedPairs?: Pair[];
    fadedPairs?: Pair[];
    activePairs?: Pair[];
    checkedPairs?: Pair[];
    activeCells?: CellKey[];
    neighborCells?: CellKey[];
    highlightedPoints?: string[];
    table?: "pair-count" | "classification" | "code-trace" | "complexity" | "packing" | "edge-case";
  };
};

export const points: Point[] = [
  { id: "A", x: 0.8, y: 5.2 },
  { id: "B", x: 1.6, y: 1.2 },
  { id: "C", x: 2.4, y: 3.7 },
  { id: "D", x: 3.6, y: 6.0 },
  { id: "E", x: 4.2, y: 2.2 },
  { id: "F", x: 4.6, y: 4.1 },
  { id: "G", x: 5.3, y: 4.0 },
  { id: "H", x: 5.8, y: 2.8 },
  { id: "I", x: 6.7, y: 5.9 },
  { id: "J", x: 7.5, y: 1.5 },
  { id: "K", x: 8.2, y: 4.6 },
  { id: "L", x: 9.1, y: 2.3 }
];

export const pointById = new Map(points.map((point) => [point.id, point]));
export const splitX = 5.0;
export const gridOrigin = { x: 0, y: 0 };
export const leftIds = ["A", "B", "C", "D", "E", "F"];
export const rightIds = ["G", "H", "I", "J", "K", "L"];
export const leftClosestPair: Pair = ["E", "F"];
export const rightClosestPair: Pair = ["G", "H"];
export const finalPair: Pair = ["F", "G"];
export const rLeft = distanceById(leftClosestPair);
export const rRight = distanceById(rightClosestPair);
export const r = Math.min(rLeft, rRight);
export const cellSize = r / Math.sqrt(2);
export const bandOnlyCrossPairs: Pair[] = [["E", "G"], ["E", "H"], ["F", "G"], ["F", "H"]];
export const gridWindowCrossPairs: Pair[] = [["E", "G"], ["E", "H"], ["F", "G"], ["F", "H"]];
export const activeFGridWindowPairs: Pair[] = [["F", "G"], ["F", "H"]];
export const allCrossPairs: Pair[] = leftIds.flatMap((left) => rightIds.map((right): Pair => canonicalPair([left, right])));

export const boundaryFixture = {
  origin: { x: 0, y: 0 },
  cellSize: 1,
  points: [
    { id: "P", x: 1, y: 0.5 },
    { id: "Q", x: 0.999, y: 0.5 },
    { id: "R", x: 2, y: 1 }
  ],
  expectedCells: {
    P: "1,0",
    Q: "0,0",
    R: "2,1"
  } satisfies Record<string, CellKey>
};

export const duplicateFixture: Point[] = [
  { id: "P", x: 2, y: 3 },
  { id: "Q", x: 2, y: 3 },
  { id: "R", x: 5, y: 4 }
];

export const tieFixture = {
  currentBest: ["P", "Q"] as Pair,
  tiedCrossPair: ["R", "S"] as Pair,
  distance: 2
};

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceById(pair: Pair): number {
  const [a, b] = pair.map((id) => pointById.get(id));
  if (!a || !b) throw new Error(`Unknown point in pair ${pair.join("-")}`);
  return distance(a, b);
}

export function formatDistance(value: number): string {
  return value.toFixed(2);
}

export function canonicalPair(pair: Pair): Pair {
  return [...pair].sort() as Pair;
}

export function pairKey(pair: Pair): string {
  return canonicalPair(pair).join("-");
}

export function sideOf(pointId: string): Side {
  if (leftIds.includes(pointId)) return "left";
  if (rightIds.includes(pointId)) return "right";
  throw new Error(`Unknown side for point ${pointId}`);
}

export function cellFor(point: Point, origin = gridOrigin, size = cellSize): CellKey {
  return `${Math.floor((point.x - origin.x) / size)},${Math.floor((point.y - origin.y) / size)}`;
}

export function cellForId(pointId: string): CellKey {
  const point = pointById.get(pointId);
  if (!point) throw new Error(`Unknown point ${pointId}`);
  return cellFor(point);
}

export function offsetBetween(from: CellKey, to: CellKey) {
  const [fromX, fromY] = parseCell(from);
  const [toX, toY] = parseCell(to);
  return { dx: toX - fromX, dy: toY - fromY };
}

export function parseCell(cell: CellKey): [number, number] {
  return cell.split(",").map(Number) as [number, number];
}

export function neighborCells(cell: CellKey): CellKey[] {
  const [x, y] = parseCell(cell);
  const cells: CellKey[] = [];
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -2; dy <= 2; dy += 1) {
      cells.push(`${x + dx},${y + dy}`);
    }
  }
  return cells;
}

export function isInBand(point: Point): boolean {
  return Math.abs(point.x - splitX) < r;
}

export function isOppositeSide(pair: Pair): boolean {
  return sideOf(pair[0]) !== sideOf(pair[1]);
}

export function toScreen(point: Point) {
  return {
    x: 30 + point.x * 30,
    y: 235 - point.y * 30
  };
}

export function pairPath(pair: Pair) {
  const coords = pair
    .map((id) => pointById.get(id))
    .filter((point): point is Point => Boolean(point))
    .map(toScreen);
  if (coords.length !== 2) return "";
  return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
}

export function cellRect(cell: CellKey) {
  const [cellX, cellY] = parseCell(cell);
  const bottomLeft = toScreen({
    id: "",
    x: gridOrigin.x + cellX * cellSize,
    y: gridOrigin.y + cellY * cellSize
  });
  return {
    x: bottomLeft.x,
    y: bottomLeft.y - cellSize * 30,
    width: cellSize * 30,
    height: cellSize * 30
  };
}

export function firstDuplicate(input: Point[]): Pair | undefined {
  const seen = new Map<string, string>();
  for (const point of input) {
    const key = `${point.x},${point.y}`;
    const existing = seen.get(key);
    if (existing) return canonicalPair([existing, point.id]);
    seen.set(key, point.id);
  }
  return undefined;
}

const fCell = cellForId("F");
const activeWindowF = neighborCells(fCell);

export const trace: ClosestPairStep[] = [
  {
    id: "naive-sample",
    phase: "naive",
    activePair: ["A", "B"],
    checkedPairs: [["A", "B"]],
    visiblePairs: [["A", "B"], ["F", "G"]],
    explanation: {
      en: "The naive method compares every pair. With 12 points, that is 66 checks before we can be sure.",
      zh: "朴素方法会比较每一对点。12 个点就需要 66 次检查，才能确定答案。"
    }
  },
  {
    id: "radius-r-pain",
    phase: "naive",
    activePoint: "F",
    activePair: ["F", "I"],
    checkedPairs: [["F", "I"]],
    pairCategories: {
      "checked-loses": [["F", "I"]],
      "checked-wins": [["F", "G"]]
    },
    explanation: {
      en: "A small distance threshold helps reject a far pair after checking it, but a plain list cannot jump directly to nearby candidates.",
      zh: "较小的距离阈值可以在检查后排除远点对，但普通列表不能直接找到附近候选点。"
    }
  },
  {
    id: "split-created",
    phase: "split",
    checkedPairs: [],
    explanation: {
      en: "Sort by x and split at x = 5.0. Same-side pairs will be solved recursively.",
      zh: "按 x 坐标排序，并在 x = 5.0 处分割。同侧点对交给递归解决。"
    }
  },
  {
    id: "left-right-solved",
    phase: "recurse",
    checkedPairs: [],
    bestPair: rightClosestPair,
    bestDistance: r,
    pairCategories: {
      "same-side-already-solved": [leftClosestPair, rightClosestPair]
    },
    explanation: {
      en: "The left half reports E-F, the right half reports G-H, so r becomes 1.30 from G-H.",
      zh: "左半边得到 E-F，右半边得到 G-H，因此 r 取 G-H 的距离 1.30。"
    }
  },
  {
    id: "threshold-chosen",
    phase: "threshold",
    checkedPairs: [],
    bestPair: rightClosestPair,
    bestDistance: r,
    pairCategories: {
      "same-side-already-solved": [leftClosestPair, rightClosestPair],
      "outside-band": [["A", "I"], ["B", "J"], ["C", "K"], ["D", "L"]]
    },
    explanation: {
      en: "Any better cross pair must have both points within distance r of the split line.",
      zh: "任何更好的跨边界点对，都必须让两个点都位于分割线两侧距离 r 以内。"
    }
  },
  {
    id: "threshold-band-only",
    phase: "threshold",
    checkedPairs: bandOnlyCrossPairs,
    visiblePairs: bandOnlyCrossPairs,
    bestPair: rightClosestPair,
    bestDistance: r,
    explanation: {
      en: "The band leaves four cross pairs in this fixture, but a larger input still needs a local lookup rule.",
      zh: "这个例子中带状区域留下 4 个跨边界点对；更大的输入仍然需要局部查找规则。"
    }
  },
  {
    id: "grid-built",
    phase: "grid",
    checkedPairs: [],
    bestPair: rightClosestPair,
    bestDistance: r,
    explanation: {
      en: "Use cell side r / sqrt(2). After recursion, the packing invariant keeps each local window small.",
      zh: "使用边长 r / sqrt(2) 的格子。递归后的 packing 不变量保证每个局部窗口很小。"
    }
  },
  {
    id: "active-cell-f",
    phase: "grid",
    activePoint: "F",
    activeCell: fCell,
    activeNeighborOffsets: activeWindowF.map((cell) => offsetBetween(fCell, cell)),
    neighborCells: activeWindowF,
    checkedPairs: [],
    visiblePairs: activeFGridWindowPairs,
    bestPair: rightClosestPair,
    bestDistance: r,
    explanation: {
      en: "Focus on F's cell. The safe local window is dx,dy in [-2,2], then actual distances decide the result.",
      zh: "聚焦 F 所在格子。安全局部窗口是 dx、dy 都在 [-2,2] 内，然后再用真实距离判断。"
    }
  },
  {
    id: "active-window-f",
    phase: "grid",
    activePoint: "F",
    activeCell: fCell,
    neighborCells: activeWindowF,
    checkedPairs: activeFGridWindowPairs,
    visiblePairs: activeFGridWindowPairs,
    bestPair: rightClosestPair,
    bestDistance: r,
    explanation: {
      en: "F only emits right-side candidates from the local window: F-G, then F-H.",
      zh: "F 只从局部窗口中发出右侧候选：先 F-G，再 F-H。"
    }
  },
  {
    id: "active-f-golden-pairs",
    phase: "check",
    activePoint: "F",
    activeCell: fCell,
    activePair: ["F", "G"],
    neighborCells: activeWindowF,
    checkedPairs: activeFGridWindowPairs,
    visiblePairs: activeFGridWindowPairs,
    bestPair: rightClosestPair,
    bestDistance: r,
    explanation: {
      en: "The canonical active-F candidate order is F-G, then F-H. Tests lock this order.",
      zh: "F 的标准候选顺序是 F-G，然后 F-H。测试会固定这个顺序。"
    }
  },
  {
    id: "check-f-g",
    phase: "check",
    activePoint: "F",
    activePair: ["F", "G"],
    checkedPairs: [["F", "G"]],
    bestPair: finalPair,
    bestDistance: distanceById(finalPair),
    pairCategories: {
      "checked-wins": [["F", "G"]]
    },
    explanation: {
      en: "F-G has distance 0.71, which is strictly smaller than r = 1.30, so it becomes the new best pair.",
      zh: "F-G 的距离是 0.71，严格小于 r = 1.30，因此成为新的最佳点对。"
    }
  },
  {
    id: "check-f-h",
    phase: "check",
    activePoint: "F",
    activePair: ["F", "H"],
    checkedPairs: [["F", "G"], ["F", "H"]],
    bestPair: finalPair,
    bestDistance: distanceById(finalPair),
    pairCategories: {
      "checked-wins": [["F", "G"]],
      "checked-loses": [["F", "H"]]
    },
    explanation: {
      en: "F-H is checked but loses. The grid narrows the search; distance comparisons still choose the winner.",
      zh: "F-H 会被检查，但不会胜出。网格缩小搜索范围，真正的胜者仍由距离比较决定。"
    }
  },
  {
    id: "cross-pair-wins",
    phase: "done",
    activePair: finalPair,
    checkedPairs: gridWindowCrossPairs,
    bestPair: finalPair,
    bestDistance: distanceById(finalPair),
    pairCategories: {
      "checked-wins": [finalPair],
      "checked-loses": [["E", "G"], ["E", "H"], ["F", "H"]]
    },
    explanation: {
      en: "The merge finds F-G across the split, so the final closest pair is not inside either recursive half.",
      zh: "合并步骤找到跨边界的 F-G，所以最终最近点对并不在任一递归半边内部。"
    }
  },
  {
    id: "done",
    phase: "done",
    activePair: finalPair,
    checkedPairs: gridWindowCrossPairs,
    bestPair: finalPair,
    bestDistance: distanceById(finalPair),
    explanation: {
      en: "Done: recursion removed same-side work, and the grid kept cross-boundary work local.",
      zh: "完成：递归消除了同侧重复工作，网格让跨边界检查保持局部。"
    }
  }
];

export const scenarios: Record<ClosestPairScenario["id"], ClosestPairScenario> = {
  "hook-map": {
    id: "hook-map",
    title: {
      en: "Find the nearest two points",
      zh: "找到最近的两个点"
    },
    summary: {
      en: "The hook shows the point cloud without revealing the final pair yet.",
      zh: "开场只展示点云，暂时不揭晓最终点对。"
    },
    ariaLabel: {
      en: "Scatterplot of twelve labeled points for the closest pair problem.",
      zh: "最近点对问题的 12 个带标签点的散点图。"
    },
    caption: {
      en: "The task is simple to state: among all point pairs, find the nearest one.",
      zh: "任务很容易说清楚：在所有点对中找到最近的一对。"
    },
    testId: "closest-scenario-hook-map",
    expectedAnnotation: {
      en: "Goal: nearest pair hidden until the merge earns it",
      zh: "目标：最近点对要等合并过程推出"
    },
    layers: {}
  },
  "naive-pair-count": {
    id: "naive-pair-count",
    title: {
      en: "All pairs get expensive",
      zh: "枚举所有点对会变贵"
    },
    summary: {
      en: "The number of pair checks grows quadratically.",
      zh: "点对检查数量会按平方级增长。"
    },
    ariaLabel: {
      en: "Naive pair count table with a sampled pair highlighted.",
      zh: "朴素点对数量表，并高亮一个示例点对。"
    },
    caption: {
      en: "For 1,000 points, all-pairs means 499,500 distance checks.",
      zh: "1,000 个点时，枚举所有点对需要 499,500 次距离检查。"
    },
    testId: "closest-scenario-naive-pair-count",
    traceStepId: "naive-sample",
    expectedAnnotation: {
      en: "n(n - 1) / 2 checks",
      zh: "n(n - 1) / 2 次检查"
    },
    layers: {
      table: "pair-count",
      activePairs: [["A", "B"]]
    }
  },
  "radius-neighborhood": {
    id: "radius-neighborhood",
    title: {
      en: "A threshold is not a search structure",
      zh: "阈值还不是查找结构"
    },
    summary: {
      en: "Knowing r helps reject a far pair after checking it, but not find the near candidates.",
      zh: "知道 r 可以在检查后排除远点对，但还不能直接找到近候选。"
    },
    ariaLabel: {
      en: "Point F with a radius r circle and a far checked pair.",
      zh: "点 F 的半径 r 圆，以及一个被检查后排除的远点对。"
    },
    caption: {
      en: "The missing operation is: give me only the points near F.",
      zh: "缺少的操作是：只把 F 附近的点给我。"
    },
    testId: "closest-scenario-radius-neighborhood",
    traceStepId: "radius-r-pain",
    expectedAnnotation: {
      en: "Plain lists cannot query nearby points cheaply",
      zh: "普通列表不能便宜地查询附近点"
    },
    layers: {
      radiusPoint: "F",
      activePairs: [["F", "I"]],
      highlightedPoints: ["F"]
    }
  },
  "split-after-recursion": {
    id: "split-after-recursion",
    title: {
      en: "Split, then reuse solved halves",
      zh: "先分割，再复用已解半边"
    },
    summary: {
      en: "The recursive calls already found E-F on the left and G-H on the right.",
      zh: "递归已经在左边找到 E-F，在右边找到 G-H。"
    },
    ariaLabel: {
      en: "Split line with left and right closest pairs highlighted.",
      zh: "分割线以及左右两边已找到的最近点对。"
    },
    caption: {
      en: "Same-side pairs are not rechecked during the merge.",
      zh: "合并阶段不会重新检查同侧点对。"
    },
    testId: "closest-scenario-split-after-recursion",
    traceStepId: "left-right-solved",
    expectedAnnotation: {
      en: "Left: E-F; right: G-H",
      zh: "左侧：E-F；右侧：G-H"
    },
    layers: {
      splitLine: true,
      highlightedPairs: [leftClosestPair, rightClosestPair]
    }
  },
  "recursion-scaffold": {
    id: "recursion-scaffold",
    title: {
      en: "Base cases feed the merge",
      zh: "基本情况供给合并"
    },
    summary: {
      en: "Small leaves use brute force; the merge receives two solved halves.",
      zh: "小叶子用暴力法；合并阶段接收两个已解半边。"
    },
    ariaLabel: {
      en: "Recursion scaffold showing split, brute force leaves, and merge.",
      zh: "递归脚手架，展示分割、暴力叶子和合并。"
    },
    caption: {
      en: "This is divide and conquer before it is a grid trick.",
      zh: "它先是分治算法，然后才用网格优化合并。"
    },
    testId: "closest-scenario-recursion-scaffold",
    expectedAnnotation: {
      en: "n <= 3: brute force",
      zh: "n <= 3：暴力法"
    },
    layers: {
      table: "classification"
    }
  },
  "threshold-band": {
    id: "threshold-band",
    title: {
      en: "Only the threshold band remains",
      zh: "只剩阈值带状区域"
    },
    summary: {
      en: "A better cross pair must have both points within r of the split line.",
      zh: "更好的跨边界点对必须让两点都在分割线两侧距离 r 以内。"
    },
    ariaLabel: {
      en: "Threshold band around the split line with outside pairs faded.",
      zh: "分割线周围的阈值带，并淡化带外点对。"
    },
    caption: {
      en: "The band filters impossible cross pairs, but it still needs a local lookup rule.",
      zh: "带状区域过滤不可能的跨边界点对，但仍需要局部查找规则。"
    },
    testId: "closest-scenario-threshold-band",
    traceStepId: "threshold-band-only",
    expectedAnnotation: {
      en: "Band cross pairs: E-G, E-H, F-G, F-H",
      zh: "带内跨边界点对：E-G、E-H、F-G、F-H"
    },
    layers: {
      splitLine: true,
      band: true,
      activePairs: bandOnlyCrossPairs,
      fadedPairs: [["A", "I"], ["B", "J"], ["C", "K"], ["D", "L"]]
    }
  },
  "packing-occupancy": {
    id: "packing-occupancy",
    title: {
      en: "Packing invariant",
      zh: "Packing 不变量"
    },
    summary: {
      en: "After recursion, a half cannot hide another pair closer than r.",
      zh: "递归之后，任一半边内部都不能再藏着小于 r 的点对。"
    },
    ariaLabel: {
      en: "Packing table explaining constant local occupancy.",
      zh: "解释局部常数占用的 packing 表。"
    },
    caption: {
      en: "This is why each local grid window has only constant relevant candidates.",
      zh: "这就是为什么每个局部网格窗口只有常数个相关候选。"
    },
    testId: "closest-scenario-packing-occupancy",
    traceStepId: "grid-built",
    expectedAnnotation: {
      en: "No same-side pair is closer than r",
      zh: "没有同侧点对比 r 更近"
    },
    layers: {
      table: "packing"
    }
  },
  "cell-distance-ruler": {
    id: "cell-distance-ruler",
    title: {
      en: "Why a 5 by 5 window is enough",
      zh: "为什么 5 x 5 窗口足够"
    },
    summary: {
      en: "Offsets with abs(dx) or abs(dy) at least 3 are already too far to beat r.",
      zh: "abs(dx) 或 abs(dy) 至少为 3 的格子已经太远，不可能优于 r。"
    },
    ariaLabel: {
      en: "Cell distance ruler showing the active cell and the safe neighbor window.",
      zh: "格子距离尺，展示当前格子和安全邻居窗口。"
    },
    caption: {
      en: "The window is conservative; the Euclidean distance check still decides.",
      zh: "这个窗口偏保守；最终仍由欧氏距离检查决定。"
    },
    testId: "closest-scenario-cell-distance-ruler",
    traceStepId: "active-cell-f",
    expectedAnnotation: {
      en: "dx,dy in [-2,2]",
      zh: "dx、dy 都在 [-2,2]"
    },
    layers: {
      grid: true,
      activeCells: [fCell],
      neighborCells: activeWindowF
    }
  },
  "grid-cell-size": {
    id: "grid-cell-size",
    title: {
      en: "Grid cells organize the band",
      zh: "网格组织带内点"
    },
    summary: {
      en: "Use cells of side r / sqrt(2), store band points with side labels, and emit only left-right pairs.",
      zh: "使用边长 r / sqrt(2) 的格子，带内点保留左右标签，只发出左右跨边界点对。"
    },
    ariaLabel: {
      en: "Grid over the threshold band with occupied cells.",
      zh: "阈值带上的网格和非空格子。"
    },
    caption: {
      en: "The grid is a lookup structure, not the distance test itself.",
      zh: "网格是查找结构，不是距离测试本身。"
    },
    testId: "closest-scenario-grid-cell-size",
    traceStepId: "grid-built",
    expectedAnnotation: {
      en: `cell side = ${formatDistance(cellSize)}`,
      zh: `格子边长 = ${formatDistance(cellSize)}`
    },
    layers: {
      splitLine: true,
      band: true,
      grid: true,
      highlightedPoints: ["E", "F", "G", "H"]
    }
  },
  "active-neighbor-cells": {
    id: "active-neighbor-cells",
    title: {
      en: "Active F window",
      zh: "F 的当前窗口"
    },
    summary: {
      en: "F emits F-G and F-H from the local window; F-G wins.",
      zh: "F 从局部窗口发出 F-G 和 F-H；F-G 胜出。"
    },
    ariaLabel: {
      en: "F active cell with neighbor cells and candidate pairs.",
      zh: "F 的当前格子、邻居格子和候选点对。"
    },
    caption: {
      en: "Only left-side active points emit candidates, which prevents duplicate pair counts.",
      zh: "只有左侧当前点发出候选，避免重复计数。"
    },
    testId: "closest-scenario-active-neighbor-cells",
    traceStepId: "active-window-f",
    expectedAnnotation: {
      en: "F-G, then F-H",
      zh: "先 F-G，再 F-H"
    },
    layers: {
      splitLine: true,
      grid: true,
      activeCells: [fCell],
      neighborCells: activeWindowF,
      activePairs: activeFGridWindowPairs,
      highlightedPairs: [finalPair]
    }
  },
  "pair-classification": {
    id: "pair-classification",
    title: {
      en: "Every pair has a category",
      zh: "每个点对都有类别"
    },
    summary: {
      en: "Left-left and right-right are solved recursively; only cross pairs reach the merge.",
      zh: "左左、右右点对已由递归解决；只有跨边界点对进入合并。"
    },
    ariaLabel: {
      en: "Pair classification table for the merge.",
      zh: "合并阶段的点对分类表。"
    },
    caption: {
      en: "The merge is not ignoring same-side pairs; it is reusing their recursive answers.",
      zh: "合并不是忽略同侧点对，而是在复用递归答案。"
    },
    testId: "closest-scenario-pair-classification",
    expectedAnnotation: {
      en: "same-side solved; cross unresolved",
      zh: "同侧已解决；跨边界待解决"
    },
    layers: {
      table: "classification"
    }
  },
  "code-trace-map": {
    id: "code-trace-map",
    title: {
      en: "Code maps to trace state",
      zh: "代码对应追踪状态"
    },
    summary: {
      en: "The implementation sketch should point to visible trace states.",
      zh: "实现草图应当对应可见的追踪状态。"
    },
    ariaLabel: {
      en: "Code-to-trace table for closest pair divide and conquer.",
      zh: "最近点对分治的代码到追踪状态表。"
    },
    caption: {
      en: "Carry sorted order, brute force small leaves, then merge with the band and grid.",
      zh: "保留排序顺序，小叶子用暴力法，然后用带状区域和网格合并。"
    },
    testId: "closest-scenario-code-trace-map",
    expectedAnnotation: {
      en: "sort once -> recurse -> merge",
      zh: "排序一次 -> 递归 -> 合并"
    },
    layers: {
      table: "code-trace"
    }
  },
  "candidate-filter": {
    id: "candidate-filter",
    title: {
      en: "Skipped pairs have reasons",
      zh: "跳过点对有原因"
    },
    summary: {
      en: "Each pair is solved, outside the band, outside the window, checked and losing, or checked and winning.",
      zh: "每个点对要么已解决、在带外、在窗口外、检查后失败，或检查后胜出。"
    },
    ariaLabel: {
      en: "Candidate filter diagram with pair categories.",
      zh: "带点对类别的候选过滤图。"
    },
    caption: {
      en: "The categories must be mutually exclusive in the trace.",
      zh: "这些类别在追踪中必须互斥。"
    },
    testId: "closest-scenario-candidate-filter",
    traceStepId: "cross-pair-wins",
    expectedAnnotation: {
      en: "F-G is checked-wins",
      zh: "F-G 属于 checked-wins"
    },
    layers: {
      splitLine: true,
      band: true,
      highlightedPairs: [finalPair],
      checkedPairs: [["E", "G"], ["E", "H"], ["F", "H"]]
    }
  },
  "complexity-tree": {
    id: "complexity-tree",
    title: {
      en: "Linear merge at each level",
      zh: "每层线性合并"
    },
    summary: {
      en: "Sort once, carry order, and spend expected O(n) work per recursion level.",
      zh: "只排序一次，传递顺序，每层递归期望花 O(n) 工作。"
    },
    ariaLabel: {
      en: "Recursion tree showing O n merge work per level and log n levels.",
      zh: "递归树，展示每层 O(n) 合并工作和 log n 层。"
    },
    caption: {
      en: "This gives expected O(n log n), not O(n log^2 n).",
      zh: "因此得到期望 O(n log n)，不是 O(n log^2 n)。"
    },
    testId: "closest-scenario-complexity-tree",
    expectedAnnotation: {
      en: "T(n) = 2T(n/2) + O(n)",
      zh: "T(n) = 2T(n/2) + O(n)"
    },
    layers: {
      table: "complexity"
    }
  },
  "boundary-cell-rule": {
    id: "boundary-cell-rule",
    title: {
      en: "Boundary cells are half-open",
      zh: "边界格子是左闭右开"
    },
    summary: {
      en: "Exact positive grid boundaries go to the cell on the right or above.",
      zh: "正向网格边界上的点进入右侧或上方格子。"
    },
    ariaLabel: {
      en: "Boundary cell assignment mini-card.",
      zh: "边界格子分配小卡片。"
    },
    caption: {
      en: "Q is in 0,0; P is in 1,0; R is in 2,1.",
      zh: "Q 在 0,0；P 在 1,0；R 在 2,1。"
    },
    testId: "closest-scenario-boundary-cell-rule",
    expectedAnnotation: {
      en: "floor((coord - origin) / cellSize)",
      zh: "floor((coord - origin) / cellSize)"
    },
    layers: {
      table: "edge-case"
    }
  },
  "tie-distance": {
    id: "tie-distance",
    title: {
      en: "Ties do not replace r",
      zh: "并列距离不会替换 r"
    },
    summary: {
      en: "The merge looks for pairs strictly closer than r.",
      zh: "合并阶段寻找严格小于 r 的点对。"
    },
    ariaLabel: {
      en: "Tie distance edge-case card.",
      zh: "距离并列边界情况卡片。"
    },
    caption: {
      en: "A cross pair at exactly r is checked-loses.",
      zh: "距离正好等于 r 的跨边界点对属于 checked-loses。"
    },
    testId: "closest-scenario-tie-distance",
    expectedAnnotation: {
      en: "strict < r",
      zh: "严格 < r"
    },
    layers: {
      table: "edge-case"
    }
  },
  "duplicate-points": {
    id: "duplicate-points",
    title: {
      en: "Duplicates exit before the grid",
      zh: "重复点在网格前返回"
    },
    summary: {
      en: "Duplicate coordinates give distance 0, so cellSize should never be built from r = 0.",
      zh: "重复坐标的距离为 0，因此不应根据 r = 0 构造格子边长。"
    },
    ariaLabel: {
      en: "Duplicate coordinate edge-case card.",
      zh: "重复坐标边界情况卡片。"
    },
    caption: {
      en: "P-Q returns immediately with distance 0.",
      zh: "P-Q 会以距离 0 立即返回。"
    },
    testId: "closest-scenario-duplicate-points",
    expectedAnnotation: {
      en: "duplicate -> distance 0",
      zh: "重复点 -> 距离 0"
    },
    layers: {
      table: "edge-case"
    }
  }
};
