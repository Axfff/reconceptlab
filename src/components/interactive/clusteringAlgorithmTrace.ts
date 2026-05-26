import type { Locale } from "../../i18n/locales";

export type ClusteringAlgorithmId = "k-means" | "k-medoids" | "dbscan" | "optics" | "hdbscan" | "em-for-gmm";

export type AlgorithmPoint = {
  id: string;
  label: Record<Locale, string>;
  x: number;
  y: number;
};

export type Center = {
  id: string;
  x: number;
  y: number;
};

export type KMeansStep = {
  id: string;
  phase: "assign" | "update" | "done";
  centers: Center[];
  assignments: Record<string, string>;
  explanation: Record<Locale, string>;
};

export type DensityRole = "core" | "border" | "noise";

export type DensityPoint = AlgorithmPoint & {
  role: DensityRole;
  cluster: string | null;
};

export type OpticsRow = {
  pointId: string;
  coreDistance: number | null;
  reachability: number | null;
  clusterHint: string | null;
};

export type HdbscanLevel = {
  lambda: number;
  clusters: {
    id: string;
    points: string[];
    stability: number;
  }[];
};

export type EmPoint = {
  id: string;
  x: number;
};

export type EmStep = {
  id: string;
  means: [number, number];
  variances: [number, number];
  weights: [number, number];
  responsibilities: Record<string, [number, number]>;
  explanation: Record<Locale, string>;
};

export const clusteringAlgorithmCopy: Record<ClusteringAlgorithmId, { label: Record<Locale, string>; short: Record<Locale, string> }> = {
  "k-means": {
    label: { en: "K-Means", zh: "K-Means" },
    short: {
      en: "Move centroids until squared-distance clusters stop changing.",
      zh: "不断移动质心，直到平方距离簇基本稳定。"
    }
  },
  "k-medoids": {
    label: { en: "K-Medoids", zh: "K-Medoids" },
    short: {
      en: "Use real data points as centers so outliers have less leverage.",
      zh: "用真实样本点做中心，降低离群点的影响。"
    }
  },
  dbscan: {
    label: { en: "DBSCAN", zh: "DBSCAN" },
    short: {
      en: "Grow dense neighborhoods and leave isolated points as noise.",
      zh: "从高密度邻域扩张簇，并把孤立点留作噪声。"
    }
  },
  optics: {
    label: { en: "OPTICS", zh: "OPTICS" },
    short: {
      en: "Order points by density reachability instead of choosing one fixed radius.",
      zh: "按密度可达性排序点，而不是只选一个固定半径。"
    }
  },
  hdbscan: {
    label: { en: "HDBSCAN", zh: "HDBSCAN" },
    short: {
      en: "Keep clusters that stay stable across density levels.",
      zh: "保留在多个密度层级中保持稳定的簇。"
    }
  },
  "em-for-gmm": {
    label: { en: "EM for GMM", zh: "GMM 的 EM" },
    short: {
      en: "Alternate soft membership estimates with Gaussian parameter updates.",
      zh: "在软成员概率估计和高斯参数更新之间交替。"
    }
  }
};

function point(id: string, x: number, y: number): AlgorithmPoint {
  return { id, x, y, label: { en: id.toUpperCase(), zh: id.toUpperCase() } };
}

export const centroidFixture: readonly AlgorithmPoint[] = [
  point("a1", 0.9, 1.0),
  point("a2", 1.3, 1.4),
  point("a3", 1.8, 0.8),
  point("b1", 5.5, 1.1),
  point("b2", 6.1, 1.6),
  point("b3", 6.4, 0.8),
  point("c1", 3.0, 5.4),
  point("c2", 3.5, 6.1),
  point("c3", 4.0, 5.2),
  point("out", 8.0, 5.8)
];

export const densityFixture: readonly DensityPoint[] = [
  { ...point("p1", 1.0, 1.0), role: "core", cluster: "A" },
  { ...point("p2", 1.5, 1.2), role: "core", cluster: "A" },
  { ...point("p3", 1.2, 1.7), role: "core", cluster: "A" },
  { ...point("p4", 2.1, 1.5), role: "border", cluster: "A" },
  { ...point("p5", 5.4, 1.1), role: "core", cluster: "B" },
  { ...point("p6", 5.9, 1.5), role: "core", cluster: "B" },
  { ...point("p7", 6.5, 1.1), role: "core", cluster: "B" },
  { ...point("p8", 6.0, 2.0), role: "border", cluster: "B" },
  { ...point("p9", 3.6, 3.0), role: "noise", cluster: null },
  { ...point("p10", 8.2, 5.6), role: "noise", cluster: null }
];

export const emFixture: readonly EmPoint[] = [
  { id: "x1", x: 0.8 },
  { id: "x2", x: 1.1 },
  { id: "x3", x: 1.4 },
  { id: "x4", x: 4.7 },
  { id: "x5", x: 5.1 },
  { id: "x6", x: 5.5 }
];

export function distance(left: AlgorithmPoint | Center, right: AlgorithmPoint | Center): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function squaredDistance(left: AlgorithmPoint | Center, right: AlgorithmPoint | Center): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return dx * dx + dy * dy;
}

export function formatClusterNumber(value: number | null, lang: Locale): string {
  if (value === null || !Number.isFinite(value)) return lang === "en" ? "not defined" : "未定义";
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

function nearestCenter(pointToAssign: AlgorithmPoint, centers: readonly Center[]) {
  return centers
    .map((center) => ({ center, value: squaredDistance(pointToAssign, center) }))
    .sort((left, right) => left.value - right.value || left.center.id.localeCompare(right.center.id))[0].center;
}

export function assignToCenters(points: readonly AlgorithmPoint[], centers: readonly Center[]): Record<string, string> {
  return Object.fromEntries(points.map((item) => [item.id, nearestCenter(item, centers).id]));
}

function recomputeCenters(points: readonly AlgorithmPoint[], assignments: Record<string, string>, centers: readonly Center[]): Center[] {
  return centers.map((center) => {
    const members = points.filter((item) => assignments[item.id] === center.id);
    if (members.length === 0) return center;
    return {
      id: center.id,
      x: members.reduce((sum, item) => sum + item.x, 0) / members.length,
      y: members.reduce((sum, item) => sum + item.y, 0) / members.length
    };
  });
}

export function kMeansTrace(): KMeansStep[] {
  const initialCenters: Center[] = [
    { id: "C1", x: 1.0, y: 1.0 },
    { id: "C2", x: 6.2, y: 1.0 },
    { id: "C3", x: 3.4, y: 5.6 }
  ];
  const firstAssignments = assignToCenters(centroidFixture, initialCenters);
  const updatedCenters = recomputeCenters(centroidFixture, firstAssignments, initialCenters);
  const secondAssignments = assignToCenters(centroidFixture, updatedCenters);
  const finalCenters = recomputeCenters(centroidFixture, secondAssignments, updatedCenters);

  return [
    {
      id: "assign-1",
      phase: "assign",
      centers: initialCenters,
      assignments: firstAssignments,
      explanation: {
        en: "Assign every point to the nearest current centroid by squared distance.",
        zh: "按平方距离，把每个点分给当前最近的质心。"
      }
    },
    {
      id: "update-1",
      phase: "update",
      centers: updatedCenters,
      assignments: firstAssignments,
      explanation: {
        en: "Move each centroid to the mean of the points assigned to it.",
        zh: "把每个质心移动到分给它的样本均值处。"
      }
    },
    {
      id: "assign-2",
      phase: "assign",
      centers: updatedCenters,
      assignments: secondAssignments,
      explanation: {
        en: "Reassign with the moved centroids; only points near boundaries can change.",
        zh: "用移动后的质心重新分配；只有边界附近的点可能改变。"
      }
    },
    {
      id: "done",
      phase: "done",
      centers: finalCenters,
      assignments: secondAssignments,
      explanation: {
        en: "Assignments and centroids agree for this fixture, so the local optimum is stable.",
        zh: "在这个固定样本中，分配和质心已经一致，因此局部最优稳定。"
      }
    }
  ];
}

export function totalMedoidCost(points: readonly AlgorithmPoint[], medoidIds: readonly string[]): number {
  const medoids = medoidIds.map((id) => points.find((item) => item.id === id)).filter((item): item is AlgorithmPoint => Boolean(item));
  return points.reduce((sum, item) => sum + Math.min(...medoids.map((medoid) => distance(item, medoid))), 0);
}

export const kMedoidsChoices = [
  {
    id: "centroid-like",
    medoids: ["a2", "b2", "c2"],
    label: { en: "representative medoids", zh: "代表性中心点" }
  },
  {
    id: "outlier-pulled",
    medoids: ["a2", "b2", "out"],
    label: { en: "outlier as medoid", zh: "离群点做中心点" }
  },
  {
    id: "bad-swap",
    medoids: ["a1", "b1", "c1"],
    label: { en: "bad swap candidate", zh: "较差交换候选" }
  }
] as const;

export const dbscanParams = { epsilon: 0.9, minPts: 3 };

export function neighborsWithin(points: readonly AlgorithmPoint[], pointId: string, epsilon: number): string[] {
  const anchor = points.find((item) => item.id === pointId);
  if (!anchor) return [];
  return points.filter((item) => distance(anchor, item) <= epsilon).map((item) => item.id);
}

export const opticsRows: readonly OpticsRow[] = [
  { pointId: "p1", coreDistance: 0.54, reachability: null, clusterHint: "A" },
  { pointId: "p2", coreDistance: 0.58, reachability: 0.54, clusterHint: "A" },
  { pointId: "p3", coreDistance: 0.71, reachability: 0.58, clusterHint: "A" },
  { pointId: "p4", coreDistance: null, reachability: 0.72, clusterHint: "A" },
  { pointId: "p9", coreDistance: null, reachability: 1.95, clusterHint: null },
  { pointId: "p5", coreDistance: 0.64, reachability: 2.26, clusterHint: "B" },
  { pointId: "p6", coreDistance: 0.64, reachability: 0.64, clusterHint: "B" },
  { pointId: "p7", coreDistance: 0.78, reachability: 0.64, clusterHint: "B" },
  { pointId: "p8", coreDistance: null, reachability: 0.78, clusterHint: "B" },
  { pointId: "p10", coreDistance: null, reachability: 3.86, clusterHint: null }
];

export const hdbscanLevels: readonly HdbscanLevel[] = [
  {
    lambda: 0.25,
    clusters: [
      { id: "wide-density", points: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"], stability: 0.8 }
    ]
  },
  {
    lambda: 0.9,
    clusters: [
      { id: "A", points: ["p1", "p2", "p3", "p4"], stability: 2.9 },
      { id: "B", points: ["p5", "p6", "p7", "p8"], stability: 3.1 }
    ]
  },
  {
    lambda: 1.6,
    clusters: [
      { id: "A-core", points: ["p1", "p2", "p3"], stability: 1.4 },
      { id: "B-core", points: ["p5", "p6", "p7"], stability: 1.5 }
    ]
  }
];

function gaussian1d(x: number, mean: number, variance: number): number {
  return Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}

function expectation(points: readonly EmPoint[], means: [number, number], variances: [number, number], weights: [number, number]) {
  return Object.fromEntries(
    points.map((item) => {
      const left = weights[0] * gaussian1d(item.x, means[0], variances[0]);
      const right = weights[1] * gaussian1d(item.x, means[1], variances[1]);
      const total = left + right;
      return [item.id, [left / total, right / total] as [number, number]];
    })
  );
}

function maximize(points: readonly EmPoint[], responsibilities: Record<string, [number, number]>) {
  const totals: [number, number] = [0, 0];
  const means: [number, number] = [0, 0];
  for (const item of points) {
    const responsibility = responsibilities[item.id];
    totals[0] += responsibility[0];
    totals[1] += responsibility[1];
    means[0] += responsibility[0] * item.x;
    means[1] += responsibility[1] * item.x;
  }
  means[0] /= totals[0];
  means[1] /= totals[1];
  const variances: [number, number] = [0, 0];
  for (const item of points) {
    const responsibility = responsibilities[item.id];
    variances[0] += responsibility[0] * (item.x - means[0]) ** 2;
    variances[1] += responsibility[1] * (item.x - means[1]) ** 2;
  }
  variances[0] = Math.max(variances[0] / totals[0], 0.05);
  variances[1] = Math.max(variances[1] / totals[1], 0.05);
  return {
    means,
    variances,
    weights: [totals[0] / points.length, totals[1] / points.length] as [number, number]
  };
}

export function emTrace(): EmStep[] {
  const start = {
    means: [1.6, 4.4] as [number, number],
    variances: [1.2, 1.2] as [number, number],
    weights: [0.5, 0.5] as [number, number]
  };
  const firstResponsibilities = expectation(emFixture, start.means, start.variances, start.weights);
  const firstUpdate = maximize(emFixture, firstResponsibilities);
  const secondResponsibilities = expectation(emFixture, firstUpdate.means, firstUpdate.variances, firstUpdate.weights);
  const secondUpdate = maximize(emFixture, secondResponsibilities);

  return [
    {
      id: "expect-1",
      ...start,
      responsibilities: firstResponsibilities,
      explanation: {
        en: "E-step: compute how much each Gaussian explains every point.",
        zh: "E 步：计算每个高斯成分解释每个点的程度。"
      }
    },
    {
      id: "max-1",
      ...firstUpdate,
      responsibilities: firstResponsibilities,
      explanation: {
        en: "M-step: refit means, variances, and weights using soft membership.",
        zh: "M 步：用软成员权重重新拟合均值、方差和混合权重。"
      }
    },
    {
      id: "expect-2",
      ...firstUpdate,
      responsibilities: secondResponsibilities,
      explanation: {
        en: "Another E-step sharpens the memberships after the Gaussians move.",
        zh: "高斯成分移动后，再做一次 E 步会让成员概率更清晰。"
      }
    },
    {
      id: "max-2",
      ...secondUpdate,
      responsibilities: secondResponsibilities,
      explanation: {
        en: "The two components now sit near the two visible piles.",
        zh: "两个成分现在贴近两个可见的数据堆。"
      }
    }
  ];
}
