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

export type PrecisionResult = {
  numerator: number;
  denominator: number;
  value: number | null;
};

export type PrecisionTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: "tp" | "fp";
  trustedAlarms: number;
  allAlarms: number;
  value: number;
};

export function predictedPositiveExamples(
  examples: readonly ConfusionMatrixExample[],
  label = positiveLabel
): ConfusionMatrixExample[] {
  return examples.filter((example) => example.prediction === label);
}

export function precisionFromCounts(counts: Pick<MatrixCounts, "tp" | "fp">): PrecisionResult {
  const denominator = counts.tp + counts.fp;
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

function precisionFromExampleCounts(tp: number, fp: number): PrecisionResult {
  return precisionFromCounts({ tp, fp });
}

export function buildPrecisionTrace(
  examples: readonly ConfusionMatrixExample[],
  label = positiveLabel
): PrecisionTraceStep[] {
  const predictedExamples = predictedPositiveExamples(examples, label);
  let trusted = 0;
  let alarms = 0;

  return predictedExamples.map((example, index) => {
    const cell = classifyExample(example, label);
    if (cell !== "tp" && cell !== "fp") {
      throw new Error(`Unexpected cell ${cell} in precision trace build`);
    }
    alarms += 1;
    if (cell === "tp") trusted += 1;
    const result = precisionFromExampleCounts(trusted, alarms - trusted);
    return {
      index,
      example,
      cell: (cell === "tp" || cell === "fp") ? cell : "fp",
      trustedAlarms: trusted,
      allAlarms: alarms,
      value: result.value ?? 0
    };
  });
}

export function precisionUnavailableText(locale: Locale): string {
  return unavailableText[locale];
}

export const precisionFixture = buildPrecisionTrace(confusionMatrixExamples);
