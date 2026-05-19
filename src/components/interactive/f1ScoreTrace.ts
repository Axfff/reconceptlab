import type { Locale } from "../../i18n/locales";
import { precisionFromCounts, precisionUnavailableText } from "./precisionTrace";
import { recallFromCounts, recallUnavailableText } from "./recallTrace";
import { finalCounts, type MatrixCounts } from "./confusionMatrixTrace";

const unavailableText: Record<Locale, string> = {
  en: "not available",
  zh: "不可用"
};

export type F1PresetId =
  | "fixture"
  | "high-precision-low-recall"
  | "low-precision-high-recall"
  | "both-strong"
  | "no-positive-evidence"
  | "errors-no-true-positives";

export type F1Result = {
  precision: number | null;
  recall: number | null;
  numerator: number;
  denominator: number;
  value: number | null;
};

export type F1Preset = {
  id: F1PresetId;
  label: Record<Locale, string>;
  counts: Pick<MatrixCounts, "tp" | "fp" | "fn">;
  explanation: Record<Locale, string>;
};

const f1PresetsList: F1Preset[] = [
  {
    id: "fixture",
    label: {
      en: "Fixture",
      zh: "固定样本"
    },
    counts: {
      tp: finalCounts.tp,
      fp: finalCounts.fp,
      fn: finalCounts.fn
    },
    explanation: {
      en: "Using the fixed confusion counts gives a balanced score close to 0.545.",
      zh: "固定混淆矩阵计数产生的平衡分数约为 0.545。"
    }
  },
  {
    id: "high-precision-low-recall",
    label: {
      en: "High precision, low recall",
      zh: "高精确率，低召回率"
    },
    counts: {
      tp: 1,
      fp: 0,
      fn: 9
    },
    explanation: {
      en: "Almost no misses are tolerated by precision, but recall is weak.",
      zh: "精确率很高，模型很谨慎；但召回率很弱。"
    }
  },
  {
    id: "low-precision-high-recall",
    label: {
      en: "Low precision, high recall",
      zh: "低精确率，高召回率"
    },
    counts: {
      tp: 1,
      fp: 9,
      fn: 0
    },
    explanation: {
      en: "Recall catches all positives, but precision is diluted by false alarms.",
      zh: "召回率覆盖全部正类，但误报拖累了精确率。"
    }
  },
  {
    id: "both-strong",
    label: {
      en: "Both strong",
      zh: "双高"
    },
    counts: {
      tp: 9,
      fp: 1,
      fn: 1
    },
    explanation: {
      en: "Balanced counts keep both metrics near the same level.",
      zh: "两侧都强，平衡分数也接近。"
    }
  },
  {
    id: "no-positive-evidence",
    label: {
      en: "No positive-side evidence",
      zh: "无正类证据"
    },
    counts: {
      tp: 0,
      fp: 0,
      fn: 0
    },
    explanation: {
      en: "No TP/FP/FN counts means the denominator in count-form is zero, so F1 is unavailable.",
      zh: "TP/FP/FN 都为 0，计数分母为 0，F1 不可用。"
    }
  },
  {
    id: "errors-no-true-positives",
    label: {
      en: "Errors with no true positives",
      zh: "无 TP 的错误"
    },
    counts: {
      tp: 0,
      fp: 2,
      fn: 3
    },
    explanation: {
      en: "There are false alarms and misses but no TP, so precision, recall, arithmetic mean, and F1 are all defined as zero.",
      zh: "存在误报和漏报但没有 TP，因此精确率、召回率、算术平均和 F1 都是有定义的 0。"
    }
  }
];

export const f1Presets: readonly F1Preset[] = f1PresetsList;

export function f1FromPrecisionRecall(
  precision: number | null,
  recall: number | null
): F1Result {
  if (precision === null || recall === null) {
    return {
      precision,
      recall,
      numerator: 0,
      denominator: 0,
      value: null
    };
  }

  const numerator = 2 * precision * recall;
  const denominator = precision + recall;
  if (denominator === 0) {
    return {
      precision,
      recall,
      numerator,
      denominator,
      value: 0
    };
  }

  return {
    precision,
    recall,
    numerator,
    denominator,
    value: numerator / denominator
  };
}

export function f1FromCounts(counts: Pick<MatrixCounts, "tp" | "fp" | "fn">): F1Result {
  const precision = precisionFromCounts({ tp: counts.tp, fp: counts.fp });
  const recall = recallFromCounts({ tp: counts.tp, fn: counts.fn });
  const numerator = 2 * counts.tp;
  const denominator = 2 * counts.tp + counts.fp + counts.fn;

  if (denominator === 0) {
    return {
      precision: precision.value,
      recall: recall.value,
      numerator,
      denominator,
      value: null
    };
  }

  if (counts.tp === 0) {
    return {
      precision: precision.value,
      recall: recall.value,
      numerator,
      denominator,
      value: 0
    };
  }

  return {
    precision: precision.value,
    recall: recall.value,
    numerator,
    denominator,
    value: numerator / denominator
  };
}

export function arithmeticMean(
  precision: number | null,
  recall: number | null
): number | null {
  if (precision === null || recall === null) return null;
  return (precision + recall) / 2;
}

export function formatMetric(value: number | null, locale: Locale): string {
  if (value === null) return unavailableText[locale];
  return Number(value.toFixed(3)).toString();
}

export function formatPercent(value: number | null, locale: Locale): string {
  if (value === null) return unavailableText[locale];
  return `${(value * 100).toFixed(1)}%`;
}

export const precisionUnavailable = precisionUnavailableText;
export const recallUnavailable = recallUnavailableText;
