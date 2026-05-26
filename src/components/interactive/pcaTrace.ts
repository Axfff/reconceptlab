import type { Locale } from "../../i18n/locales";

export type PcaPoint = {
  id: string;
  label: string;
  height: number;
  armSpan: number;
};

export type PcaVector = {
  x: number;
  y: number;
};

export type PcaComponent = PcaVector & {
  eigenvalue: number;
  explainedVarianceRatio: number;
  angleDegrees: number;
};

export type PcaTraceStep = {
  id: string;
  title: Record<Locale, string>;
  explanation: Record<Locale, string>;
  metric: Record<Locale, string>;
};

export const pcaPoints: readonly PcaPoint[] = [
  { id: "a", label: "A", height: 156, armSpan: 153 },
  { id: "b", label: "B", height: 160, armSpan: 160 },
  { id: "c", label: "C", height: 164, armSpan: 164 },
  { id: "d", label: "D", height: 168, armSpan: 173 },
  { id: "e", label: "E", height: 172, armSpan: 176 },
  { id: "f", label: "F", height: 176, armSpan: 182 }
] as const;

export function formatPcaNumber(value: number, lang: Locale, fractionDigits = 2): string {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(1, fractionDigits)
  }).format(value);
}

export function pcaMean(points: readonly PcaPoint[] = pcaPoints): PcaVector {
  return {
    x: points.reduce((sum, point) => sum + point.height, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.armSpan, 0) / points.length
  };
}

export function centerPcaPoints(points: readonly PcaPoint[] = pcaPoints) {
  const mean = pcaMean(points);
  return points.map((point) => ({
    id: point.id,
    label: point.label,
    x: point.height - mean.x,
    y: point.armSpan - mean.y
  }));
}

export function covariance2d(points: readonly PcaPoint[] = pcaPoints) {
  const centered = centerPcaPoints(points);
  const n = centered.length;
  const xx = centered.reduce((sum, point) => sum + point.x * point.x, 0) / n;
  const xy = centered.reduce((sum, point) => sum + point.x * point.y, 0) / n;
  const yy = centered.reduce((sum, point) => sum + point.y * point.y, 0) / n;
  return { xx, xy, yy };
}

function canonicalize(vector: PcaVector): PcaVector {
  const largestIsX = Math.abs(vector.x) >= Math.abs(vector.y);
  const signAnchor = largestIsX ? vector.x : vector.y;
  if (signAnchor < 0 || (signAnchor === 0 && vector.x < 0)) {
    return { x: -vector.x, y: -vector.y };
  }
  return vector;
}

function normalize(vector: PcaVector): PcaVector {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) return { x: 1, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

function angleFromVector(vector: PcaVector): number {
  const degrees = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
  return normalizeAngle(degrees);
}

export function normalizeAngle(degrees: number): number {
  return ((degrees % 180) + 180) % 180;
}

export function principalComponents2d(points: readonly PcaPoint[] = pcaPoints): [PcaComponent, PcaComponent] {
  const { xx, xy, yy } = covariance2d(points);
  const trace = xx + yy;
  const delta = Math.sqrt((xx - yy) ** 2 + 4 * xy ** 2);
  const eigenvalues = [(trace + delta) / 2, (trace - delta) / 2];
  const totalVariance = eigenvalues[0] + eigenvalues[1];

  const components = eigenvalues.map((eigenvalue, index) => {
    let vector: PcaVector;
    if (Math.abs(xy) > 1e-12) {
      vector = normalize({ x: xy, y: eigenvalue - xx });
    } else {
      const firstIsX = xx >= yy;
      vector = index === 0 ? (firstIsX ? { x: 1, y: 0 } : { x: 0, y: 1 }) : firstIsX ? { x: 0, y: 1 } : { x: 1, y: 0 };
    }
    const signed = canonicalize(vector);
    return {
      ...signed,
      eigenvalue,
      explainedVarianceRatio: totalVariance === 0 ? 0 : eigenvalue / totalVariance,
      angleDegrees: angleFromVector(signed)
    };
  }) as [PcaComponent, PcaComponent];

  return components;
}

export function projectOntoDirection(point: PcaVector, direction: PcaVector): number {
  const unit = normalize(direction);
  return point.x * unit.x + point.y * unit.y;
}

export function variance(values: readonly number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

export function varianceAlongDirection(points: readonly PcaPoint[] = pcaPoints, degrees: number): number {
  const radians = (normalizeAngle(degrees) * Math.PI) / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  return variance(centerPcaPoints(points).map((point) => projectOntoDirection(point, direction)));
}

export const varianceSweep = Array.from({ length: 180 }, (_, degrees) => ({
  degrees,
  variance: varianceAlongDirection(pcaPoints, degrees)
}));

function squaredError(left: PcaVector, right: PcaVector): number {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2;
}

function reconstructWithComponents(k: 1 | 2, points: readonly PcaPoint[] = pcaPoints) {
  const mean = pcaMean(points);
  const centered = centerPcaPoints(points);
  const components = principalComponents2d(points).slice(0, k);
  return centered.map((point, index) => {
    const reconstructedCentered = components.reduce(
      (sum, component) => {
        const coordinate = projectOntoDirection(point, component);
        return {
          x: sum.x + coordinate * component.x,
          y: sum.y + coordinate * component.y
        };
      },
      { x: 0, y: 0 }
    );
    return {
      id: point.id,
      label: point.label,
      height: reconstructedCentered.x + mean.x,
      armSpan: reconstructedCentered.y + mean.y,
      code: components.map((component) => projectOntoDirection(point, component)),
      original: points[index]
    };
  });
}

export function projectedCodes(k: 1 | 2 = 1, points: readonly PcaPoint[] = pcaPoints) {
  return reconstructWithComponents(k, points).map((row) => ({
    id: row.id,
    label: row.label,
    code: row.code
  }));
}

export function reconstructionComparisons(points: readonly PcaPoint[] = pcaPoints) {
  const mean = pcaMean(points);
  const centered = centerPcaPoints(points);
  const pc1 = reconstructWithComponents(1, points);
  const pc2 = reconstructWithComponents(2, points);
  const sumSquaredError = (reconstructed: readonly PcaVector[]) =>
    centered.reduce((sum, point, index) => sum + squaredError(point, reconstructed[index]), 0);

  return [
    {
      id: "keep-height",
      label: { en: "keep raw height", zh: "保留原始身高" },
      explanation: {
        en: "Arm span is replaced by its feature mean.",
        zh: "臂展被替换为这一列的均值。"
      },
      error: sumSquaredError(points.map((point) => ({ x: point.height - mean.x, y: 0 })))
    },
    {
      id: "keep-arm-span",
      label: { en: "keep raw arm span", zh: "保留原始臂展" },
      explanation: {
        en: "Height is replaced by its feature mean.",
        zh: "身高被替换为这一列的均值。"
      },
      error: sumSquaredError(points.map((point) => ({ x: 0, y: point.armSpan - mean.y })))
    },
    {
      id: "keep-pc1",
      label: { en: "keep PC1", zh: "保留 PC1" },
      explanation: {
        en: "One rotated coordinate follows the shared movement.",
        zh: "一个旋转后的坐标跟随共同变化。"
      },
      error: points.reduce(
        (sum, point, index) => sum + squaredError({ x: point.height, y: point.armSpan }, { x: pc1[index].height, y: pc1[index].armSpan }),
        0
      )
    },
    {
      id: "keep-pc1-pc2",
      label: { en: "keep PC1 + PC2", zh: "保留 PC1 + PC2" },
      explanation: {
        en: "Both PCA coordinates rebuild the original two-feature table.",
        zh: "两个 PCA 坐标可以重建原始的二维表。"
      },
      error: points.reduce(
        (sum, point, index) => sum + squaredError({ x: point.height, y: point.armSpan }, { x: pc2[index].height, y: pc2[index].armSpan }),
        0
      )
    }
  ];
}

export const pcaTraceSteps: readonly PcaTraceStep[] = [
  {
    id: "raw-table",
    title: { en: "Raw table", zh: "原始表格" },
    explanation: {
      en: "The two measurements mostly rise together, so the table is wider than the real pattern.",
      zh: "两个测量值大多一起上升，所以表格比真正的模式更宽。"
    },
    metric: { en: "2 raw columns", zh: "2 个原始列" }
  },
  {
    id: "center",
    title: { en: "Center each column", zh: "中心化每一列" },
    explanation: {
      en: "Subtract the feature means so spread is measured around the cloud center.",
      zh: "减去每个特征的均值，让扩散围绕点云中心来测量。"
    },
    metric: { en: "centered means: 0, 0", zh: "中心化后均值：0, 0" }
  },
  {
    id: "covariance",
    title: { en: "Summarize shared movement", zh: "概括共同变化" },
    explanation: {
      en: "Covariance is large and positive, so height and arm span tend to move in the same direction.",
      zh: "协方差很大且为正，说明身高和臂展倾向于同向变化。"
    },
    metric: { en: "covariance xy is positive", zh: "xy 协方差为正" }
  },
  {
    id: "components",
    title: { en: "Choose principal directions", zh: "选择主方向" },
    explanation: {
      en: "PC1 is the unit direction with the largest projected variance; PC2 is the right-angle leftover direction.",
      zh: "PC1 是投影方差最大的单位方向；PC2 是与它成直角的剩余方向。"
    },
    metric: { en: "PC1 explains most spread", zh: "PC1 解释大部分扩散" }
  },
  {
    id: "project",
    title: { en: "Project to compact codes", zh: "投影成紧凑编码" },
    explanation: {
      en: "Each row becomes coordinates along the kept principal directions.",
      zh: "每一行变成沿保留主方向的坐标。"
    },
    metric: { en: "Z = X_c W_k", zh: "Z = X_c W_k" }
  },
  {
    id: "reconstruct",
    title: { en: "Reconstruct approximately", zh: "近似重构" },
    explanation: {
      en: "Expanding the kept code and adding the mean back gives the closest linear PCA reconstruction.",
      zh: "展开保留的编码并把均值加回去，就得到 PCA 的最近线性重构。"
    },
    metric: { en: "X_hat = Z W_k^T + mean", zh: "X_hat = Z W_k^T + mean" }
  }
] as const;
