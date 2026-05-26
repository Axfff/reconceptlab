import type { Locale } from "../../i18n/locales";

export type DimensionalityReductionId = "pca" | "mds" | "isomap" | "lda" | "qda" | "sne" | "t-sne" | "umap";

export type ReductionPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  classId: "blue" | "orange";
};

export type ReductionStep = {
  id: string;
  title: Record<Locale, string>;
  explanation: Record<Locale, string>;
  formula: string;
  metric: Record<Locale, string>;
};

export const reductionCopy: Record<
  DimensionalityReductionId,
  { label: Record<Locale, string>; short: Record<Locale, string> }
> = {
  pca: {
    label: { en: "PCA", zh: "PCA" },
    short: {
      en: "Keep the directions where centered data varies most.",
      zh: "保留中心化数据变化最大的方向。"
    }
  },
  mds: {
    label: { en: "MDS", zh: "MDS" },
    short: {
      en: "Place points so low-dimensional distances imitate the original distance table.",
      zh: "摆放点，让低维距离尽量模仿原始距离表。"
    }
  },
  isomap: {
    label: { en: "Isomap", zh: "Isomap" },
    short: {
      en: "Use neighbor-graph shortest paths before applying an MDS-style layout.",
      zh: "先用邻居图最短路估计流形距离，再做类似 MDS 的布局。"
    }
  },
  lda: {
    label: { en: "LDA", zh: "LDA" },
    short: {
      en: "Use labels to find projections that separate class means while keeping classes tight.",
      zh: "利用标签寻找投影方向，让类均值分开，同时让类内保持紧。"
    }
  },
  qda: {
    label: { en: "QDA", zh: "QDA" },
    short: {
      en: "Let each class keep its own covariance, creating quadratic boundaries rather than one shared projection.",
      zh: "让每个类别保留自己的协方差，形成二次边界，而不是一个共享投影。"
    }
  },
  sne: {
    label: { en: "SNE", zh: "SNE" },
    short: {
      en: "Match neighbor probabilities between high and low dimensions.",
      zh: "匹配高维与低维中的邻居概率。"
    }
  },
  "t-sne": {
    label: { en: "t-SNE", zh: "t-SNE" },
    short: {
      en: "Repair SNE's crowding problem with a heavy-tailed low-dimensional similarity.",
      zh: "用低维重尾相似度修补 SNE 的拥挤问题。"
    }
  },
  umap: {
    label: { en: "UMAP", zh: "UMAP" },
    short: {
      en: "Build a fuzzy neighbor graph, then optimize a low-dimensional graph with similar membership strengths.",
      zh: "构造模糊邻居图，再优化具有相似成员强度的低维图。"
    }
  }
};

export const reductionPoints: readonly ReductionPoint[] = [
  { id: "a1", label: "A1", x: 0.2, y: 0.8, z: 0.2, classId: "blue" },
  { id: "a2", label: "A2", x: 0.7, y: 1.2, z: 0.1, classId: "blue" },
  { id: "a3", label: "A3", x: 1.2, y: 1.0, z: 0.3, classId: "blue" },
  { id: "b1", label: "B1", x: 3.0, y: 2.5, z: 1.2, classId: "orange" },
  { id: "b2", label: "B2", x: 3.6, y: 2.7, z: 1.1, classId: "orange" },
  { id: "b3", label: "B3", x: 4.0, y: 3.1, z: 1.4, classId: "orange" }
];

export function formatReductionNumber(value: number, lang: Locale): string {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

export function distance3d(left: ReductionPoint, right: ReductionPoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

export function pairwiseDistances(points = reductionPoints): Record<string, number> {
  const values: Record<string, number> = {};
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      values[`${points[i].id}-${points[j].id}`] = distance3d(points[i], points[j]);
    }
  }
  return values;
}

export function nearestNeighbors(anchorId: string, k: number, points = reductionPoints): ReductionPoint[] {
  const anchor = points.find((point) => point.id === anchorId);
  if (!anchor) return [];
  return points
    .filter((point) => point.id !== anchorId)
    .map((point) => ({ point, distance: distance3d(anchor, point) }))
    .sort((left, right) => left.distance - right.distance || left.point.id.localeCompare(right.point.id))
    .slice(0, k)
    .map((entry) => entry.point);
}

export function projectPca1(point: ReductionPoint): number {
  return (point.x + point.y) / Math.SQRT2;
}

export function variance(values: readonly number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

export function pcaVarianceSummary(points = reductionPoints) {
  return {
    pc1: variance(points.map(projectPca1)),
    z: variance(points.map((point) => point.z))
  };
}

export function neighborProbability(distance: number, temperature = 1): number {
  return Math.exp(-(distance * distance) / (2 * temperature * temperature));
}

export function studentSimilarity(distance: number): number {
  return 1 / (1 + distance * distance);
}

export const reductionSteps: Record<DimensionalityReductionId, ReductionStep[]> = {
  pca: [
    {
      id: "center",
      title: { en: "Center the cloud", zh: "先把点云居中" },
      explanation: {
        en: "Subtract the mean so the algorithm studies variation around the middle, not distance from the origin.",
        zh: "减去均值，让算法研究围绕中心的变化，而不是离原点有多远。"
      },
      formula: "x_i - mean(x)",
      metric: { en: "mean becomes 0", zh: "均值变为 0" }
    },
    {
      id: "variance",
      title: { en: "Find high-variance directions", zh: "寻找高方差方向" },
      explanation: {
        en: "The first principal component is the direction with the largest projected variance.",
        zh: "第一主成分是投影方差最大的方向。"
      },
      formula: "max variance(w^T x)",
      metric: { en: "PC1 variance is larger than the z direction", zh: "PC1 方差大于 z 方向方差" }
    },
    {
      id: "project",
      title: { en: "Drop the quieter directions", zh: "丢掉较安静的方向" },
      explanation: {
        en: "Keep the leading coordinates and accept that the discarded directions lose some detail.",
        zh: "保留前几个坐标，并接受被丢弃方向会损失一些细节。"
      },
      formula: "Z = XW_k",
      metric: { en: "2D code replaces 3D input", zh: "用二维编码替代三维输入" }
    }
  ],
  mds: [
    {
      id: "distances",
      title: { en: "Start with a distance table", zh: "从距离表开始" },
      explanation: {
        en: "MDS does not need raw coordinates if it can compare every pair of items.",
        zh: "如果能比较每一对样本，MDS 不一定需要原始坐标。"
      },
      formula: "D_ij = distance(i,j)",
      metric: { en: "pair distances are the input", zh: "成对距离是输入" }
    },
    {
      id: "layout",
      title: { en: "Place points in a small map", zh: "在小地图中摆点" },
      explanation: {
        en: "Move low-dimensional points until their distances resemble the table.",
        zh: "移动低维点，使低维距离接近原距离表。"
      },
      formula: "min sum(d_ij - ||y_i-y_j||)^2",
      metric: { en: "stress goes down", zh: "stress 下降" }
    }
  ],
  isomap: [
    {
      id: "neighbors",
      title: { en: "Connect local neighbors", zh: "连接局部邻居" },
      explanation: {
        en: "Euclidean shortcuts can cut through a curved manifold, so Isomap first builds a neighbor graph.",
        zh: "欧氏距离可能穿过弯曲流形抄近路，因此 Isomap 先构造邻居图。"
      },
      formula: "k-nearest-neighbor graph",
      metric: { en: "local edges only", zh: "只保留局部边" }
    },
    {
      id: "geodesic",
      title: { en: "Measure graph shortest paths", zh: "测量图最短路" },
      explanation: {
        en: "Shortest paths along the graph approximate distances along the surface.",
        zh: "图上的最短路近似沿曲面行走的距离。"
      },
      formula: "D_geo(i,j) = shortest path",
      metric: { en: "curved distance replaces shortcut", zh: "曲面距离替代直线捷径" }
    },
    {
      id: "mds",
      title: { en: "Lay out geodesic distances", zh: "布局测地距离" },
      explanation: {
        en: "The final map uses MDS on the graph-distance table.",
        zh: "最终地图对图距离表使用 MDS。"
      },
      formula: "MDS(D_geo)",
      metric: { en: "unrolled map", zh: "展开后的地图" }
    }
  ],
  lda: [
    {
      id: "labels",
      title: { en: "Use labels deliberately", zh: "有意使用标签" },
      explanation: {
        en: "LDA is supervised: it looks for directions that make known classes easier to separate.",
        zh: "LDA 是监督式方法：它寻找让已知类别更容易分开的方向。"
      },
      formula: "class labels y_i",
      metric: { en: "classes are part of the input", zh: "类别是输入的一部分" }
    },
    {
      id: "ratio",
      title: { en: "Separate means, compress classes", zh: "拉开均值，压紧类内" },
      explanation: {
        en: "A good projection has far-apart class centers and small within-class spread.",
        zh: "好的投影让类中心相距远，同时类内扩散小。"
      },
      formula: "max w^T S_B w / w^T S_W w",
      metric: { en: "between/within ratio rises", zh: "类间/类内比值上升" }
    }
  ],
  qda: [
    {
      id: "shared-breaks",
      title: { en: "When one shared covariance is too stiff", zh: "一个共享协方差太僵硬时" },
      explanation: {
        en: "QDA keeps separate covariance shapes for each class instead of forcing one shared oval.",
        zh: "QDA 为每个类别保留独立协方差形状，而不是强迫共用一个椭圆。"
      },
      formula: "Sigma_c for each class c",
      metric: { en: "class shapes differ", zh: "类别形状可以不同" }
    },
    {
      id: "boundary",
      title: { en: "Quadratic boundary, not a standard projection", zh: "二次边界，而非常规投影" },
      explanation: {
        en: "QDA is mainly a classifier; this node uses it to contrast LDA's linear projection assumptions.",
        zh: "QDA 主要是分类器；本节点用它对比 LDA 的线性投影假设。"
      },
      formula: "log p(x|c) + log p(c)",
      metric: { en: "curved decision line", zh: "弯曲决策线" }
    }
  ],
  sne: [
    {
      id: "probabilities",
      title: { en: "Turn distances into neighbor probabilities", zh: "把距离变成邻居概率" },
      explanation: {
        en: "SNE asks which points would choose each other as neighbors in high dimension.",
        zh: "SNE 询问高维中哪些点会把彼此当作邻居。"
      },
      formula: "p_j|i proportional to exp(-d^2)",
      metric: { en: "near pairs get high probability", zh: "近邻对概率更高" }
    },
    {
      id: "match",
      title: { en: "Match those probabilities in 2D", zh: "在二维中匹配概率" },
      explanation: {
        en: "The map is optimized so low-dimensional neighbor probabilities resemble the high-dimensional ones.",
        zh: "优化地图，使低维邻居概率接近高维邻居概率。"
      },
      formula: "min KL(P || Q)",
      metric: { en: "local neighborhoods preserved", zh: "局部邻域被保留" }
    }
  ],
  "t-sne": [
    {
      id: "crowding",
      title: { en: "Notice the crowding problem", zh: "看到拥挤问题" },
      explanation: {
        en: "Many moderately distant high-dimensional neighbors cannot all fit at moderate distances in 2D.",
        zh: "高维中许多中等距离邻居无法都以中等距离塞进二维。"
      },
      formula: "too many neighbors, too little area",
      metric: { en: "points crowd near the center", zh: "点容易挤在中心" }
    },
    {
      id: "heavy-tail",
      title: { en: "Use a heavy tail in the map", zh: "在地图中使用重尾" },
      explanation: {
        en: "t-SNE uses a Student-t similarity in low dimension so non-neighbors can be pushed farther apart.",
        zh: "t-SNE 在低维使用 Student-t 相似度，让非邻居更容易被推远。"
      },
      formula: "q_ij proportional to (1 + ||y_i-y_j||^2)^-1",
      metric: { en: "clearer local islands", zh: "局部小岛更清楚" }
    }
  ],
  umap: [
    {
      id: "fuzzy-graph",
      title: { en: "Build a fuzzy neighbor graph", zh: "构造模糊邻居图" },
      explanation: {
        en: "UMAP records local neighbor strength instead of only yes-or-no edges.",
        zh: "UMAP 记录局部邻居强度，而不只是有边或无边。"
      },
      formula: "weighted k-neighbor graph",
      metric: { en: "edge strengths encode local trust", zh: "边权编码局部可信度" }
    },
    {
      id: "optimize",
      title: { en: "Optimize a matching low-dimensional graph", zh: "优化匹配的低维图" },
      explanation: {
        en: "Nearby pairs are pulled together and sampled non-neighbors are pushed apart.",
        zh: "近邻对被拉近，被采样的非邻居被推远。"
      },
      formula: "attraction plus repulsion",
      metric: { en: "fast neighbor-preserving embedding", zh: "快速保邻嵌入" }
    }
  ]
};
