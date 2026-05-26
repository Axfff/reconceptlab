import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;

export type MdsItemId = "library" | "lab" | "cafe" | "dorm" | "gym";
export type MdsLayoutId = "naive" | "improved";

export type MdsItem = {
  id: MdsItemId;
  label: LocalizedText;
};

export type MdsPoint = {
  itemId: MdsItemId;
  x: number;
  y: number;
};

export type MdsPair = {
  id: string;
  a: MdsItemId;
  b: MdsItemId;
  targetDistance: number;
  note: LocalizedText;
};

export type MdsResidualMeasurement = {
  targetDistance: number;
  mapDistance: number;
  residual: number;
  squaredContribution: number;
};

export type MdsResidualRow = MdsPair & MdsResidualMeasurement;

export type MdsTraceStep = {
  id: string;
  title: LocalizedText;
  explanation: LocalizedText;
  layoutId: MdsLayoutId;
  highlightedPairIds: string[];
};

export const mdsItems: readonly MdsItem[] = [
  { id: "library", label: { en: "Library", zh: "图书馆" } },
  { id: "lab", label: { en: "Lab", zh: "实验室" } },
  { id: "cafe", label: { en: "Cafe", zh: "咖啡馆" } },
  { id: "dorm", label: { en: "Dorm", zh: "宿舍" } },
  { id: "gym", label: { en: "Gym", zh: "体育馆" } }
] as const;

export const mdsPairs: readonly MdsPair[] = [
  {
    id: "library-lab",
    a: "library",
    b: "lab",
    targetDistance: 1.4,
    note: { en: "closest academic pair", zh: "最近的学习地点对" }
  },
  {
    id: "library-cafe",
    a: "library",
    b: "cafe",
    targetDistance: 2.0,
    note: { en: "near, but not adjacent", zh: "接近，但不是贴在一起" }
  },
  {
    id: "library-dorm",
    a: "library",
    b: "dorm",
    targetDistance: 3.2,
    note: { en: "should stay fairly far", zh: "应该保持较远" }
  },
  {
    id: "library-gym",
    a: "library",
    b: "gym",
    targetDistance: 3.6,
    note: { en: "one of the longest promises", zh: "最长的距离承诺之一" }
  },
  {
    id: "lab-cafe",
    a: "lab",
    b: "cafe",
    targetDistance: 1.6,
    note: { en: "small triangle with Library", zh: "与图书馆形成小三角" }
  },
  {
    id: "lab-dorm",
    a: "lab",
    b: "dorm",
    targetDistance: 2.7,
    note: { en: "medium-far promise", zh: "中等偏远的承诺" }
  },
  {
    id: "lab-gym",
    a: "lab",
    b: "gym",
    targetDistance: 2.4,
    note: { en: "medium distance", zh: "中等距离" }
  },
  {
    id: "cafe-dorm",
    a: "cafe",
    b: "dorm",
    targetDistance: 1.5,
    note: { en: "near social pair", zh: "较近的生活地点对" }
  },
  {
    id: "cafe-gym",
    a: "cafe",
    b: "gym",
    targetDistance: 2.7,
    note: { en: "should not collapse", zh: "不应该塌在一起" }
  },
  {
    id: "dorm-gym",
    a: "dorm",
    b: "gym",
    targetDistance: 2.2,
    note: { en: "visible remaining distortion", zh: "可见的残余失真" }
  }
] as const;

export const mdsLayouts: Record<MdsLayoutId, readonly MdsPoint[]> = {
  naive: [
    { itemId: "library", x: 0, y: 0 },
    { itemId: "lab", x: 1.4, y: 0 },
    { itemId: "cafe", x: 0.7, y: 1.0 },
    { itemId: "dorm", x: 1.2, y: 1.4 },
    { itemId: "gym", x: 2.0, y: 0.8 }
  ],
  improved: [
    { itemId: "library", x: 0, y: 0 },
    { itemId: "lab", x: 1.35, y: 0.1 },
    { itemId: "cafe", x: 1.0, y: 1.7 },
    { itemId: "dorm", x: 2.3, y: 2.6 },
    { itemId: "gym", x: 3.5, y: 1.3 }
  ]
} as const;

export const mdsTraceSteps: readonly MdsTraceStep[] = [
  {
    id: "read-table",
    title: { en: "Read the fixed distance table", zh: "读取固定距离表" },
    explanation: {
      en: "Every unordered pair has one target distance. The diagonal is ignored, and the same table will score every candidate map.",
      zh: "每个无序样本对都有一个目标距离。对角线忽略，同一张表会用来评分每个候选地图。"
    },
    layoutId: "naive",
    highlightedPairIds: ["library-lab", "library-cafe"]
  },
  {
    id: "closest-pair",
    title: { en: "Place the closest pair first", zh: "先摆最近的一对" },
    explanation: {
      en: "Library and Lab are easy to satisfy by themselves: draw them about 1.4 units apart.",
      zh: "只看图书馆和实验室很容易：把它们摆到约 1.4 个单位远。"
    },
    layoutId: "naive",
    highlightedPairIds: ["library-lab"]
  },
  {
    id: "add-more",
    title: { en: "Add more points by eye", zh: "凭感觉加入更多点" },
    explanation: {
      en: "Cafe, Dorm, and Gym each promise several distances at once, so a local repair can damage another pair.",
      zh: "咖啡馆、宿舍和体育馆各自同时承诺多个距离，所以局部修补可能伤害另一对。"
    },
    layoutId: "naive",
    highlightedPairIds: ["library-dorm", "library-gym", "dorm-gym"]
  },
  {
    id: "inspect-residuals",
    title: { en: "Turn mismatch into stress", zh: "把不匹配变成 stress" },
    explanation: {
      en: "Each pair gets a signed residual: map distance minus target distance. Squared residuals accumulate into stress.",
      zh: "每对都有带符号残差：地图距离减去目标距离。残差平方累加成 stress。"
    },
    layoutId: "naive",
    highlightedPairIds: ["library-gym", "lab-dorm", "dorm-gym"]
  },
  {
    id: "lower-stress",
    title: { en: "Compare with a lower-stress layout", zh: "比较一个较低 stress 的布局" },
    explanation: {
      en: "The improved map does not make every pair perfect, but it reduces total mismatch against the same fixed table.",
      zh: "改进地图没有让每一对都完美，但它针对同一张固定表降低了总不匹配。"
    },
    layoutId: "improved",
    highlightedPairIds: ["library-gym", "cafe-dorm", "dorm-gym"]
  }
] as const;

export function formatMdsNumber(value: number, lang: Locale, fractionDigits = 2): string {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: Math.abs(value - Math.round(value)) < 1e-9 ? 0 : 1
  }).format(value);
}

export function getMdsItem(id: MdsItemId): MdsItem {
  const item = mdsItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown MDS item: ${id}`);
  return item;
}

export function getMdsPair(id: string): MdsPair {
  const pair = mdsPairs.find((candidate) => candidate.id === id);
  if (!pair) throw new Error(`Unknown MDS pair: ${id}`);
  return pair;
}

export function canonicalPairKey(leftId: MdsItemId, rightId: MdsItemId): string {
  if (leftId === rightId) {
    throw new Error(`MDS pair key requires two distinct items: ${leftId}`);
  }

  const leftIndex = mdsItems.findIndex((item) => item.id === leftId);
  const rightIndex = mdsItems.findIndex((item) => item.id === rightId);
  if (leftIndex === -1) throw new Error(`Unknown MDS item: ${leftId}`);
  if (rightIndex === -1) throw new Error(`Unknown MDS item: ${rightId}`);

  return leftIndex < rightIndex ? `${leftId}-${rightId}` : `${rightId}-${leftId}`;
}

export function targetDistance(leftId: MdsItemId, rightId: MdsItemId): number {
  return getMdsPair(canonicalPairKey(leftId, rightId)).targetDistance;
}

export function getMdsPoint(layoutId: MdsLayoutId, itemId: MdsItemId): MdsPoint {
  const point = mdsLayouts[layoutId].find((candidate) => candidate.itemId === itemId);
  if (!point) throw new Error(`Unknown MDS point: ${layoutId}/${itemId}`);
  return point;
}

export function pairLabel(pair: Pick<MdsPair, "a" | "b">, lang: Locale): string {
  return `${getMdsItem(pair.a).label[lang]} - ${getMdsItem(pair.b).label[lang]}`;
}

export function mapDistance(layoutId: MdsLayoutId, pair: Pick<MdsPair, "a" | "b">): number;
export function mapDistance(layoutId: MdsLayoutId, leftId: MdsItemId, rightId: MdsItemId): number;
export function mapDistance(layoutId: MdsLayoutId, pairOrLeftId: Pick<MdsPair, "a" | "b"> | MdsItemId, rightId?: MdsItemId): number {
  const leftId = typeof pairOrLeftId === "string" ? pairOrLeftId : pairOrLeftId.a;
  const resolvedRightId = typeof pairOrLeftId === "string" ? rightId : pairOrLeftId.b;
  if (!resolvedRightId) throw new Error("mapDistance requires a pair or two item ids.");

  const a = getMdsPoint(layoutId, leftId);
  const b = getMdsPoint(layoutId, resolvedRightId);
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function residualForPair(layoutId: MdsLayoutId, leftId: MdsItemId, rightId: MdsItemId): MdsResidualMeasurement {
  const target = targetDistance(leftId, rightId);
  const distance = mapDistance(layoutId, leftId, rightId);
  const residual = distance - target;
  return {
    targetDistance: target,
    mapDistance: distance,
    residual,
    squaredContribution: residual ** 2
  };
}

export function pairResiduals(layoutId: MdsLayoutId): MdsResidualRow[] {
  return mdsPairs.map((pair) => {
    const residual = residualForPair(layoutId, pair.a, pair.b);
    return {
      ...pair,
      ...residual
    };
  });
}

export function residualRows(layoutId: MdsLayoutId): MdsResidualRow[] {
  return pairResiduals(layoutId);
}

export function stress(layoutId: MdsLayoutId): number {
  return pairResiduals(layoutId).reduce((sum, row) => sum + row.squaredContribution, 0);
}

export function normalizedStress(layoutId: MdsLayoutId): number {
  const numerator = stress(layoutId);
  const denominator = mdsPairs.reduce((sum, pair) => sum + pair.targetDistance ** 2, 0);
  return numerator / denominator;
}

export function residualMeaning(residual: number, lang: Locale): string {
  if (Math.abs(residual) < 0.05) {
    return lang === "en" ? "nearly matched" : "几乎匹配";
  }
  if (residual > 0) {
    return lang === "en" ? "too far / overstretched" : "太远 / 被拉长";
  }
  return lang === "en" ? "too close / compressed" : "太近 / 被压缩";
}
