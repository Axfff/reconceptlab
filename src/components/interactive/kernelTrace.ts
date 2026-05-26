import type { Locale } from "../../i18n/locales";

export type KernelPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type KernelName = "linear" | "polynomial" | "rbf" | "sigmoid";

export type KernelParams = {
  gamma: number;
  coef0: number;
  degree: number;
};

export type KernelRow = {
  point: KernelPoint;
  dot: number;
  squaredDistance: number;
  value: number;
};

export const kernelPoints: KernelPoint[] = [
  { id: "a", label: "A", x: 1, y: 1 },
  { id: "b", label: "B", x: 2, y: 1 },
  { id: "c", label: "C", x: -1, y: 2 },
  { id: "d", label: "D", x: 0, y: -2 }
];

export const defaultKernelParams: KernelParams = {
  gamma: 0.5,
  coef0: 1,
  degree: 2
};

export const rbfGammaValues = [0.1, 0.5, 1] as const;

export const rbfPainPoints: KernelPoint[] = [
  { id: "a", label: "A", x: 1, y: 1 },
  { id: "b", label: "B", x: 2, y: 1 },
  { id: "e", label: "E", x: 4, y: 4 }
];

export const kernelCopy: Record<
  KernelName,
  {
    label: Record<Locale, string>;
    formula: string;
    explanation: Record<Locale, string>;
  }
> = {
  linear: {
    label: { en: "Linear kernel", zh: "线性核" },
    formula: "x * z",
    explanation: {
      en: "Keeps the original coordinates and measures ordinary alignment.",
      zh: "保留原始坐标，度量普通的方向对齐。"
    }
  },
  polynomial: {
    label: { en: "Polynomial kernel", zh: "多项式核" },
    formula: "(gamma x * z + c)^d",
    explanation: {
      en: "Adds interaction terms without writing every expanded feature.",
      zh: "不用写出所有展开特征，也能加入特征交互项。"
    }
  },
  rbf: {
    label: { en: "RBF kernel", zh: "RBF 核" },
    formula: "exp(-gamma ||x - z||^2)",
    explanation: {
      en: "Turns nearness into similarity; far points fade toward zero.",
      zh: "把距离近转成相似度高；远点会衰减到接近 0。"
    }
  },
  sigmoid: {
    label: { en: "Sigmoid kernel", zh: "Sigmoid 核" },
    formula: "tanh(gamma x * z + c)",
    explanation: {
      en: "Squashes an affine dot product, but is not valid for every parameter choice.",
      zh: "压缩仿射点积，但不是所有参数选择都有效。"
    }
  }
};

export function dotProduct(a: KernelPoint, b: KernelPoint) {
  return a.x * b.x + a.y * b.y;
}

export function squaredDistance(a: KernelPoint, b: KernelPoint) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function quadraticFeatureMap(point: KernelPoint) {
  return [point.x ** 2, Math.SQRT2 * point.x * point.y, point.y ** 2];
}

export function dot(valuesA: readonly number[], valuesB: readonly number[]) {
  return valuesA.reduce((sum, value, index) => sum + value * (valuesB[index] ?? 0), 0);
}

export function linearKernel(a: KernelPoint, b: KernelPoint) {
  return dotProduct(a, b);
}

export function polynomialKernel(a: KernelPoint, b: KernelPoint, params: KernelParams = defaultKernelParams) {
  return (params.gamma * dotProduct(a, b) + params.coef0) ** params.degree;
}

export function rbfKernel(a: KernelPoint, b: KernelPoint, params: Pick<KernelParams, "gamma"> = defaultKernelParams) {
  return Math.exp(-params.gamma * squaredDistance(a, b));
}

export function sigmoidKernel(a: KernelPoint, b: KernelPoint, params: Pick<KernelParams, "gamma" | "coef0"> = defaultKernelParams) {
  return Math.tanh(params.gamma * dotProduct(a, b) + params.coef0);
}

export function kernelValue(name: KernelName, a: KernelPoint, b: KernelPoint, params: KernelParams = defaultKernelParams) {
  if (name === "linear") return linearKernel(a, b);
  if (name === "polynomial") return polynomialKernel(a, b, params);
  if (name === "rbf") return rbfKernel(a, b, params);
  return sigmoidKernel(a, b, params);
}

export function kernelRows(name: KernelName, anchor: KernelPoint = kernelPoints[0], params: KernelParams = defaultKernelParams) {
  return kernelPoints.map((point) => ({
    point,
    dot: dotProduct(anchor, point),
    squaredDistance: squaredDistance(anchor, point),
    value: kernelValue(name, anchor, point, params)
  }));
}

export function kernelRowsForPoints(
  name: KernelName,
  anchor: KernelPoint,
  points: readonly KernelPoint[],
  params: KernelParams = defaultKernelParams
): KernelRow[] {
  return points.map((point) => ({
    point,
    dot: dotProduct(anchor, point),
    squaredDistance: squaredDistance(anchor, point),
    value: kernelValue(name, anchor, point, params)
  }));
}

export function labKernelRows(name: KernelName, anchor: KernelPoint = kernelPoints[0], rbfGamma = defaultKernelParams.gamma) {
  const params = name === "rbf" ? { ...defaultKernelParams, gamma: rbfGamma } : defaultKernelParams;
  return kernelRows(name, anchor, params);
}

export const rbfPainRows = kernelRowsForPoints("rbf", rbfPainPoints[0], rbfPainPoints, defaultKernelParams);

export const rbfDecayRows = [0, 1, 5, 10, 18].map((squaredDistanceValue) => ({
  squaredDistance: squaredDistanceValue,
  exponent: -defaultKernelParams.gamma * squaredDistanceValue,
  value: Math.exp(-defaultKernelParams.gamma * squaredDistanceValue)
}));

export function formatKernelNumber(value: number, lang: Locale) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 3
  }).format(value);
}
