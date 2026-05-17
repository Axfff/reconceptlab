import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type SegmentId = "A" | "B" | "C" | "D";
export type Pair = [SegmentId, SegmentId];
export type SweepEventType = "left" | "right" | "intersection";
export type SweepPhase = "setup" | "endpoint" | "intersection" | "done";

export type Point = { x: number; y: number };

export type Segment = {
  id: SegmentId;
  from: Point;
  to: Point;
};

export type SweepEvent = {
  id: string;
  type: SweepEventType;
  x: number;
  segment?: SegmentId;
  pair?: Pair;
  label: LocalizedText;
};

export type SweepTraceStep = {
  id: string;
  phase: SweepPhase;
  event: SweepEvent;
  sweepX: number;
  statusBefore: SegmentId[];
  statusAfter: SegmentId[];
  queueBefore: string[];
  queueAfter: string[];
  testedPairs: Pair[];
  scheduledEvents: string[];
  removedStaleEvents: string[];
  reportedIntersections: Pair[];
  activePair?: Pair;
  activeSegment?: SegmentId;
  operation: LocalizedText;
  explanation: LocalizedText;
};

export type BentleyScenario = {
  id:
    | "hook-map"
    | "naive-pair-matrix"
    | "output-sensitive-count"
    | "sweep-snapshot"
    | "adjacent-rule-left-c"
    | "left-event-card"
    | "right-event-card"
    | "intersection-event-card"
    | "correctness-frames"
    | "complexity-ledger";
  title: LocalizedText;
  summary: LocalizedText;
  ariaLabel: LocalizedText;
  caption: LocalizedText;
  testId: string;
  traceStepId?: string;
  expectedAnnotation: LocalizedText;
};

export const segments: Segment[] = [
  { id: "A", from: { x: 0.4, y: 1.2 }, to: { x: 9.4, y: 5.7 } },
  { id: "B", from: { x: 0.8, y: 7.68 }, to: { x: 9.0, y: 4.4 } },
  { id: "D", from: { x: 1.3, y: 7.504 }, to: { x: 9.6, y: 8.168 } },
  { id: "C", from: { x: 3.1, y: 3.42 }, to: { x: 9.2, y: 4.64 } }
];

export const finalReportedPairs: Pair[] = [["A", "C"], ["A", "B"], ["B", "C"]];

export const segmentById = new Map(segments.map((segment) => [segment.id, segment]));

const eventDefinitions: SweepEvent[] = [
  {
    id: "left-A",
    type: "left",
    x: 0.4,
    segment: "A",
    label: { en: "left(A)", zh: "左端点(A)" }
  },
  {
    id: "left-B",
    type: "left",
    x: 0.8,
    segment: "B",
    label: { en: "left(B)", zh: "左端点(B)" }
  },
  {
    id: "left-D",
    type: "left",
    x: 1.3,
    segment: "D",
    label: { en: "left(D)", zh: "左端点(D)" }
  },
  {
    id: "left-C",
    type: "left",
    x: 3.1,
    segment: "C",
    label: { en: "left(C)", zh: "左端点(C)" }
  },
  {
    id: "intersect-A-C",
    type: "intersection",
    x: 6,
    pair: ["A", "C"],
    label: { en: "A-C", zh: "A-C" }
  },
  {
    id: "intersect-A-B",
    type: "intersection",
    x: 70 / 9,
    pair: ["A", "B"],
    label: { en: "A-B", zh: "A-B" }
  },
  {
    id: "intersect-B-C",
    type: "intersection",
    x: 26 / 3,
    pair: ["B", "C"],
    label: { en: "B-C", zh: "B-C" }
  },
  {
    id: "right-B",
    type: "right",
    x: 9,
    segment: "B",
    label: { en: "right(B)", zh: "右端点(B)" }
  },
  {
    id: "right-C",
    type: "right",
    x: 9.2,
    segment: "C",
    label: { en: "right(C)", zh: "右端点(C)" }
  },
  {
    id: "right-A",
    type: "right",
    x: 9.4,
    segment: "A",
    label: { en: "right(A)", zh: "右端点(A)" }
  },
  {
    id: "right-D",
    type: "right",
    x: 9.6,
    segment: "D",
    label: { en: "right(D)", zh: "右端点(D)" }
  }
];

export const eventsById = new Map(eventDefinitions.map((event) => [event.id, event]));
export const endpointEventIds = ["left-A", "left-B", "left-D", "left-C", "right-B", "right-C", "right-A", "right-D"];

function event(id: string): SweepEvent {
  const value = eventsById.get(id);
  if (!value) throw new Error(`Unknown sweep event ${id}`);
  return value;
}

export function canonicalPair(pair: Pair): Pair {
  return [...pair].sort() as Pair;
}

export function pairKey(pair: Pair): string {
  return canonicalPair(pair).join("-");
}

function step(input: Omit<SweepTraceStep, "event"> & { eventId: string }): SweepTraceStep {
  const { eventId, ...rest } = input;
  return { ...rest, event: event(eventId) };
}

export const trace: SweepTraceStep[] = [
  step({
    id: "left-A",
    eventId: "left-A",
    phase: "endpoint",
    sweepX: 0.4,
    statusBefore: [],
    statusAfter: ["A"],
    queueBefore: endpointEventIds,
    queueAfter: ["left-B", "left-D", "left-C", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: [],
    activeSegment: "A",
    operation: {
      en: "Insert A into the empty status.",
      zh: "把 A 插入空的扫描线状态。"
    },
    explanation: {
      en: "A becomes active after its left endpoint. With no neighbors, there is no pair to test.",
      zh: "扫描线经过 A 的左端点后，A 变为活跃线段。它没有邻居，所以无需测试线段对。"
    }
  }),
  step({
    id: "left-B",
    eventId: "left-B",
    phase: "endpoint",
    sweepX: 0.8,
    statusBefore: ["A"],
    statusAfter: ["B", "A"],
    queueBefore: ["left-B", "left-D", "left-C", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["left-D", "left-C", "intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["B", "A"]],
    scheduledEvents: ["intersect-A-B"],
    removedStaleEvents: [],
    reportedIntersections: [],
    activeSegment: "B",
    activePair: ["B", "A"],
    operation: {
      en: "Insert B, test its new neighbor A, and schedule A-B.",
      zh: "插入 B，测试它的新邻居 A，并加入 A-B 交点事件。"
    },
    explanation: {
      en: "The status is top-to-bottom. B is above A just to the right of its endpoint, so only B-A is tested.",
      zh: "状态表按从上到下排列。B 在其左端点右侧位于 A 上方，所以只测试 B-A。"
    }
  }),
  step({
    id: "left-D",
    eventId: "left-D",
    phase: "endpoint",
    sweepX: 1.3,
    statusBefore: ["B", "A"],
    statusAfter: ["D", "B", "A"],
    queueBefore: ["left-D", "left-C", "intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["left-C", "intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["D", "B"]],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: [],
    activeSegment: "D",
    activePair: ["D", "B"],
    operation: {
      en: "Insert D above B and test D-B.",
      zh: "把 D 插入到 B 上方，并测试 D-B。"
    },
    explanation: {
      en: "D never intersects the other segments inside their ranges, so this neighbor test schedules nothing.",
      zh: "D 在有效线段范围内不会与其他线段相交，所以这次邻居测试不会加入新事件。"
    }
  }),
  step({
    id: "left-C",
    eventId: "left-C",
    phase: "endpoint",
    sweepX: 3.1,
    statusBefore: ["D", "B", "A"],
    statusAfter: ["D", "B", "C", "A"],
    queueBefore: ["left-C", "intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["intersect-A-C", "intersect-B-C", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["B", "C"], ["C", "A"]],
    scheduledEvents: ["intersect-A-C", "intersect-B-C"],
    removedStaleEvents: ["intersect-A-B"],
    reportedIntersections: [],
    activeSegment: "C",
    activePair: ["C", "A"],
    operation: {
      en: "Insert C between B and A; remove stale A-B; schedule A-C and B-C.",
      zh: "把 C 插入 B 和 A 之间；移除过期的 A-B；加入 A-C 和 B-C。"
    },
    explanation: {
      en: "C splits the former adjacent pair B-A. Under eager cleanup, A-B is removed until A and B become adjacent again.",
      zh: "C 把原来相邻的 B-A 分开。采用主动清理策略时，A-B 会被移除，直到 A 和 B 再次相邻。"
    }
  }),
  step({
    id: "intersect-A-C",
    eventId: "intersect-A-C",
    phase: "intersection",
    sweepX: 6,
    statusBefore: ["D", "B", "C", "A"],
    statusAfter: ["D", "B", "A", "C"],
    queueBefore: ["intersect-A-C", "intersect-B-C", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["B", "A"]],
    scheduledEvents: ["intersect-A-B"],
    removedStaleEvents: ["intersect-B-C"],
    reportedIntersections: [["A", "C"]],
    activePair: ["A", "C"],
    operation: {
      en: "Report A-C, swap their order, remove stale B-C, and reschedule A-B.",
      zh: "报告 A-C，交换二者顺序，移除过期的 B-C，并重新加入 A-B。"
    },
    explanation: {
      en: "After A crosses C, A separates B from C, so B-C is no longer an adjacent scheduled event.",
      zh: "A 穿过 C 后，A 位于 B 和 C 之间，因此 B-C 不再是相邻线段的预定事件。"
    }
  }),
  step({
    id: "intersect-A-B",
    eventId: "intersect-A-B",
    phase: "intersection",
    sweepX: 70 / 9,
    statusBefore: ["D", "B", "A", "C"],
    statusAfter: ["D", "A", "B", "C"],
    queueBefore: ["intersect-A-B", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["intersect-B-C", "right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["D", "A"], ["B", "C"]],
    scheduledEvents: ["intersect-B-C"],
    removedStaleEvents: [],
    reportedIntersections: [["A", "C"], ["A", "B"]],
    activePair: ["A", "B"],
    operation: {
      en: "Report A-B, swap them, and schedule B-C because they are adjacent again.",
      zh: "报告 A-B，交换二者；B 和 C 再次相邻，所以重新加入 B-C。"
    },
    explanation: {
      en: "Only the outer neighbor pairs created by the swap need tests: D-A and B-C.",
      zh: "交换后只需要测试新产生的外侧邻居对：D-A 和 B-C。"
    }
  }),
  step({
    id: "intersect-B-C",
    eventId: "intersect-B-C",
    phase: "intersection",
    sweepX: 26 / 3,
    statusBefore: ["D", "A", "B", "C"],
    statusAfter: ["D", "A", "C", "B"],
    queueBefore: ["intersect-B-C", "right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["right-B", "right-C", "right-A", "right-D"],
    testedPairs: [["A", "C"]],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: finalReportedPairs,
    activePair: ["B", "C"],
    operation: {
      en: "Report B-C and swap them.",
      zh: "报告 B-C，并交换二者的顺序。"
    },
    explanation: {
      en: "The remaining new neighbor test A-C is in the past, so no future event is scheduled.",
      zh: "新邻居 A-C 的交点已经在扫描线左侧，所以不会加入未来事件。"
    }
  }),
  step({
    id: "right-B",
    eventId: "right-B",
    phase: "endpoint",
    sweepX: 9,
    statusBefore: ["D", "A", "C", "B"],
    statusAfter: ["D", "A", "C"],
    queueBefore: ["right-B", "right-C", "right-A", "right-D"],
    queueAfter: ["right-C", "right-A", "right-D"],
    testedPairs: [],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: finalReportedPairs,
    activeSegment: "B",
    operation: {
      en: "Remove B at its right endpoint.",
      zh: "在 B 的右端点移除 B。"
    },
    explanation: {
      en: "B is bottommost, so deletion has only one neighbor and creates no new adjacent pair.",
      zh: "B 位于最下方，因此删除它时只有一个邻居，不会产生新的相邻线段对。"
    }
  }),
  step({
    id: "right-C",
    eventId: "right-C",
    phase: "endpoint",
    sweepX: 9.2,
    statusBefore: ["D", "A", "C"],
    statusAfter: ["D", "A"],
    queueBefore: ["right-C", "right-A", "right-D"],
    queueAfter: ["right-A", "right-D"],
    testedPairs: [],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: finalReportedPairs,
    activeSegment: "C",
    operation: {
      en: "Remove C; no future pair appears.",
      zh: "移除 C；没有新的未来候选对。"
    },
    explanation: {
      en: "A and D are not scheduled because their valid intersection is outside the segment ranges.",
      zh: "A 和 D 不会被加入事件队列，因为它们的交点不在线段有效范围内。"
    }
  }),
  step({
    id: "right-A",
    eventId: "right-A",
    phase: "endpoint",
    sweepX: 9.4,
    statusBefore: ["D", "A"],
    statusAfter: ["D"],
    queueBefore: ["right-A", "right-D"],
    queueAfter: ["right-D"],
    testedPairs: [],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: finalReportedPairs,
    activeSegment: "A",
    operation: {
      en: "Remove A.",
      zh: "移除 A。"
    },
    explanation: {
      en: "The reported list is complete; only D remains active.",
      zh: "交点报告列表已经完成；现在只剩 D 仍然活跃。"
    }
  }),
  step({
    id: "right-D",
    eventId: "right-D",
    phase: "done",
    sweepX: 9.6,
    statusBefore: ["D"],
    statusAfter: [],
    queueBefore: ["right-D"],
    queueAfter: [],
    testedPairs: [],
    scheduledEvents: [],
    removedStaleEvents: [],
    reportedIntersections: finalReportedPairs,
    activeSegment: "D",
    operation: {
      en: "Remove D and finish.",
      zh: "移除 D，扫描结束。"
    },
    explanation: {
      en: "The queue and status are empty, so the sweep is done.",
      zh: "事件队列和状态表都为空，扫描完成。"
    }
  })
];

export function lineY(segment: Segment, x: number): number {
  const slope = (segment.to.y - segment.from.y) / (segment.to.x - segment.from.x);
  return segment.from.y + slope * (x - segment.from.x);
}

export function intersectionPoint(first: Segment, second: Segment): Point | undefined {
  const x1 = first.from.x;
  const y1 = first.from.y;
  const x2 = first.to.x;
  const y2 = first.to.y;
  const x3 = second.from.x;
  const y3 = second.from.y;
  const x4 = second.to.x;
  const y4 = second.to.y;
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator === 0) return undefined;

  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    denominator;
  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    denominator;

  const epsilon = 1e-9;
  const insideFirst = px > Math.min(x1, x2) + epsilon && px < Math.max(x1, x2) - epsilon;
  const insideSecond = px > Math.min(x3, x4) + epsilon && px < Math.max(x3, x4) - epsilon;
  return insideFirst && insideSecond ? { x: px, y: py } : undefined;
}

export function allValidIntersections() {
  const intersections: Array<{ pair: Pair; point: Point }> = [];
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      const point = intersectionPoint(segments[i], segments[j]);
      if (point) intersections.push({ pair: [segments[i].id, segments[j].id], point });
    }
  }
  return intersections.sort((a, b) => a.point.x - b.point.x);
}

export function toScreen(point: Point) {
  return {
    x: 30 + point.x * 34,
    y: 305 - point.y * 30
  };
}

export function segmentPath(segment: Segment) {
  const from = toScreen(segment.from);
  const to = toScreen(segment.to);
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function screenIntersection(pair: Pair): Point | undefined {
  const first = segmentById.get(pair[0]);
  const second = segmentById.get(pair[1]);
  if (!first || !second) return undefined;
  const point = intersectionPoint(first, second);
  return point ? toScreen(point) : undefined;
}

export const scenarios: Record<BentleyScenario["id"], BentleyScenario> = {
  "hook-map": {
    id: "hook-map",
    title: { en: "Report every crossing", zh: "报告每一个交点" },
    summary: {
      en: "The output is the checklist A-C, A-B, B-C, not just a yes/no answer.",
      zh: "输出是 A-C、A-B、B-C 这份清单，而不只是是/否答案。"
    },
    ariaLabel: {
      en: "Four line segments with reported intersections A-C, A-B, and B-C.",
      zh: "四条线段，标出报告的交点 A-C、A-B、B-C。"
    },
    caption: {
      en: "A reporting problem must return all intersecting pairs.",
      zh: "报告问题需要返回所有相交的线段对。"
    },
    testId: "bentley-scenario-hook-map",
    expectedAnnotation: { en: "Reported pairs: A-C, A-B, B-C", zh: "报告线段对：A-C、A-B、B-C" }
  },
  "naive-pair-matrix": {
    id: "naive-pair-matrix",
    title: { en: "All-pairs baseline", zh: "所有成对检查的基线" },
    summary: {
      en: "With four segments there are six possible pairs; three actually intersect.",
      zh: "四条线段共有六个候选线段对，其中三个真的相交。"
    },
    ariaLabel: {
      en: "Pair matrix showing six checks and three reported intersections.",
      zh: "成对检查矩阵，显示六次检查和三个报告交点。"
    },
    caption: {
      en: "The baseline is correct, but it scales as n choose 2.",
      zh: "这个基线算法是正确的，但检查数量按 n 选 2 增长。"
    },
    testId: "bentley-scenario-naive-pair-matrix",
    expectedAnnotation: { en: "6 checks; 3 reports", zh: "6 次检查；3 个报告" }
  },
  "output-sensitive-count": {
    id: "output-sensitive-count",
    title: { en: "Count the useful stops", zh: "数真正有用的停靠点" },
    summary: {
      en: "The sweep processes endpoint events plus the intersections it reports.",
      zh: "扫描处理端点事件，以及最终报告的交点事件。"
    },
    ariaLabel: {
      en: "Event ledger with eight endpoint events and three intersection events.",
      zh: "事件账本，包含八个端点事件和三个交点事件。"
    },
    caption: {
      en: "In general, the count is 2n + k events.",
      zh: "一般情况下，事件数量是 2n + k。"
    },
    testId: "bentley-scenario-output-sensitive-count",
    expectedAnnotation: { en: "2n + k = 8 + 3 = 11 events", zh: "2n + k = 8 + 3 = 11 个事件" }
  },
  "sweep-snapshot": {
    id: "sweep-snapshot",
    title: { en: "Only event moments matter", zh: "只在事件时刻停下" },
    summary: {
      en: "At left(C), the active order changes from D, B, A to D, B, C, A.",
      zh: "在 left(C)，活跃顺序从 D, B, A 变成 D, B, C, A。"
    },
    ariaLabel: {
      en: "Sweep snapshot at left C with status D B C A.",
      zh: "left C 时刻的扫描快照，状态为 D B C A。"
    },
    caption: {
      en: "Between events, the vertical order stays stable.",
      zh: "两个事件之间，垂直顺序保持不变。"
    },
    testId: "bentley-scenario-sweep-snapshot",
    traceStepId: "left-C",
    expectedAnnotation: { en: "Status after: D, B, C, A", zh: "事件后状态：D、B、C、A" }
  },
  "adjacent-rule-left-c": {
    id: "adjacent-rule-left-c",
    title: { en: "Adjacent-segment rule", zh: "相邻线段规则" },
    summary: {
      en: "C splits B-A, so only B-C and C-A are tested.",
      zh: "C 插入 B-A 之间，所以只测试 B-C 和 C-A。"
    },
    ariaLabel: {
      en: "C inserted between B and A, testing only adjacent pairs.",
      zh: "C 插入 B 和 A 之间，只测试相邻线段对。"
    },
    caption: {
      en: "Former neighbor A-B is stale until A and B become adjacent again.",
      zh: "旧邻居 A-B 暂时过期，直到 A 和 B 再次相邻。"
    },
    testId: "bentley-scenario-adjacent-rule-left-c",
    traceStepId: "left-C",
    expectedAnnotation: { en: "Test B-C and C-A; remove stale A-B", zh: "测试 B-C 和 C-A；移除过期 A-B" }
  },
  "left-event-card": {
    id: "left-event-card",
    title: { en: "Left endpoint event", zh: "左端点事件" },
    summary: {
      en: "Insert the segment, clean the former neighbor pair, then test new neighbors.",
      zh: "插入线段，清理旧邻居对，再测试新邻居。"
    },
    ariaLabel: {
      en: "Left endpoint processing for C.",
      zh: "C 的左端点处理过程。"
    },
    caption: {
      en: "Only the local neighborhood of C changes.",
      zh: "只有 C 附近的局部邻居关系发生变化。"
    },
    testId: "bentley-scenario-left-event-card",
    traceStepId: "left-C",
    expectedAnnotation: { en: "Insert C; schedule A-C and B-C", zh: "插入 C；加入 A-C 和 B-C" }
  },
  "right-event-card": {
    id: "right-event-card",
    title: { en: "Right endpoint event", zh: "右端点事件" },
    summary: {
      en: "In this trace, B is bottommost when it exits, so deletion creates no new pair.",
      zh: "在这条轨迹中，B 离开时位于最下方，所以删除它不会产生新线段对。"
    },
    ariaLabel: {
      en: "Right endpoint processing for bottommost B.",
      zh: "最下方线段 B 的右端点处理。"
    },
    caption: {
      en: "A middle deletion would test the newly adjacent above and below neighbors.",
      zh: "如果删除的是中间线段，就要测试新相邻的上方和下方邻居。"
    },
    testId: "bentley-scenario-right-event-card",
    traceStepId: "right-B",
    expectedAnnotation: { en: "Remove B; no new pair", zh: "移除 B；没有新线段对" }
  },
  "intersection-event-card": {
    id: "intersection-event-card",
    title: { en: "Intersection event", zh: "交点事件" },
    summary: {
      en: "Report A-C, swap their order, clean stale B-C, and test the new outer neighbor.",
      zh: "报告 A-C，交换顺序，清理过期 B-C，并测试新的外侧邻居。"
    },
    ariaLabel: {
      en: "Intersection event A C with order swapping.",
      zh: "A C 交点事件，展示顺序交换。"
    },
    caption: {
      en: "Status is read just before and just after the event x-coordinate.",
      zh: "状态按事件 x 坐标的左侧和右侧来读取。"
    },
    testId: "bentley-scenario-intersection-event-card",
    traceStepId: "intersect-A-C",
    expectedAnnotation: { en: "Report A-C; remove B-C; schedule A-B", zh: "报告 A-C；移除 B-C；加入 A-B" }
  },
  "correctness-frames": {
    id: "correctness-frames",
    title: { en: "Why adjacent is enough", zh: "为什么只看相邻就够了" },
    summary: {
      en: "Before two segments cross, they must be adjacent after the previous event.",
      zh: "两条线段相交之前，它们必然在上一个事件后已经相邻。"
    },
    ariaLabel: {
      en: "Three frame proof sketch of adjacent segment rule.",
      zh: "相邻线段规则的三帧证明草图。"
    },
    caption: {
      en: "No event occurs between q and p, so no third segment can slip between the crossing pair.",
      zh: "q 和 p 之间没有事件，因此没有第三条线段能插入相交线段对之间。"
    },
    testId: "bentley-scenario-correctness-frames",
    expectedAnnotation: { en: "previous event q -> adjacent pair -> intersection p", zh: "前一事件 q -> 相邻线段对 -> 交点 p" }
  },
  "complexity-ledger": {
    id: "complexity-ledger",
    title: { en: "Event ledger", zh: "事件账本" },
    summary: {
      en: "Each event changes only a constant number of neighbor pairs.",
      zh: "每个事件只改变常数个邻居线段对。"
    },
    ariaLabel: {
      en: "Complexity ledger for endpoint and intersection events.",
      zh: "端点事件和交点事件的复杂度账本。"
    },
    caption: {
      en: "With logarithmic queue/status operations, the total is O((n + k) log n).",
      zh: "队列和状态表操作为对数时间时，总时间为 O((n + k) log n)。"
    },
    testId: "bentley-scenario-complexity-ledger",
    expectedAnnotation: { en: "8 endpoint events + 3 intersection events", zh: "8 个端点事件 + 3 个交点事件" }
  }
};
