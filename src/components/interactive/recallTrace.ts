import type { Locale } from "../../i18n/locales";
import {
  classifyExample,
  confusionMatrixExamples,
  type ConfusionMatrixExample,
  type MatrixCounts,
  positiveLabel
} from "./confusionMatrixTrace";

const unavailableText: Record<Locale, string> = {
  en: "not available",
  zh: "不可用"
};

export type RecallResult = {
  numerator: number;
  denominator: number;
  value: number | null;
};

export type RecallTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: "tp" | "fn";
  caughtPositives: number;
  actualPositivesSeen: number;
  value: number | null;
};

export function actualPositiveExamples(
  examples: readonly ConfusionMatrixExample[],
  label = positiveLabel
): ConfusionMatrixExample[] {
  return examples.filter((example) => example.actual === label);
}

export function recallFromCounts(counts: Pick<MatrixCounts, "tp" | "fn">): RecallResult {
  const denominator = counts.tp + counts.fn;
  if (denominator === 0) {
    return {
      numerator: counts.tp,
      denominator,
      value: null
    };
  }

  return {
    numerator: counts.tp,
    denominator,
    value: counts.tp / denominator
  };
}

export function buildRecallTrace(
  examples: readonly ConfusionMatrixExample[],
  label = positiveLabel
): RecallTraceStep[] {
  let caught = 0;
  let seen = 0;

  return actualPositiveExamples(examples, label).map((example, index) => {
    const cell = classifyExample(example, label);
    if (cell !== "tp" && cell !== "fn") {
      throw new Error(`Unexpected cell ${cell} in recall trace build`);
    }

    seen += 1;
    if (cell === "tp") {
      caught += 1;
    }

    const result = recallFromCounts({ tp: caught, fn: seen - caught });
    return {
      index,
      example,
      cell,
      caughtPositives: caught,
      actualPositivesSeen: seen,
      value: result.value
    };
  });
}

export function recallUnavailableText(locale: Locale): string {
  return unavailableText[locale];
}

export const recallFixture = buildRecallTrace(confusionMatrixExamples, positiveLabel);
