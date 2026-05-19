import { describe, expect, it } from "vitest";
import {
  buildPrecisionTrace,
  precisionFromCounts,
  precisionUnavailableText,
  precisionFixture
} from "../src/components/interactive/precisionTrace";
import {
  confusionMatrixExamples,
  finalCounts,
  labelForCell,
  positiveLabel
} from "../src/components/interactive/confusionMatrixTrace";

describe("precision trace fixture", () => {
  it("uses only predicted-positive examples in fixture order", () => {
    const trace = buildPrecisionTrace(confusionMatrixExamples, positiveLabel);
    const ids = trace.map((step) => step.example.id);
    expect(ids).toEqual(["e1", "e3", "e5", "e9", "e10"]);
  });

  it("records a TP/FP-only column with running precision", () => {
    const trace = precisionFixture;
    expect(trace).toHaveLength(5);
    expect(trace[0]).toMatchObject({
      index: 0,
      example: { id: "e1", actual: "spam", prediction: "spam" },
      cell: "tp",
      trustedAlarms: 1,
      allAlarms: 1
    });
    expect(trace[1]).toMatchObject({
      index: 1,
      example: { id: "e3", actual: "not-spam", prediction: "spam" },
      cell: "fp",
      trustedAlarms: 1,
      allAlarms: 2
    });
    expect(trace.at(-1)).toMatchObject({
      index: 4,
      example: { id: "e10", actual: "spam", prediction: "spam" },
      cell: "tp",
      trustedAlarms: 3,
      allAlarms: 5
    });
  });

  it("computes the running precision values for the fixture", () => {
    const trace = precisionFixture;
    expect(precisionFromCounts({ tp: trace[0]!.trustedAlarms, fp: trace[0]!.allAlarms - trace[0]!.trustedAlarms }).value).toBe(1);
    expect(precisionFromCounts({ tp: trace[1]!.trustedAlarms, fp: trace[1]!.allAlarms - trace[1]!.trustedAlarms }).value).toBe(0.5);
    expect(precisionFromCounts({ tp: trace[2]!.trustedAlarms, fp: trace[2]!.allAlarms - trace[2]!.trustedAlarms }).value).toBeCloseTo(2 / 3);
    expect(precisionFromCounts({ tp: trace[3]!.trustedAlarms, fp: trace[3]!.allAlarms - trace[3]!.trustedAlarms }).value).toBe(0.5);
    expect(precisionFromCounts({ tp: trace[4]!.trustedAlarms, fp: trace[4]!.allAlarms - trace[4]!.trustedAlarms }).value).toBeCloseTo(0.6);
  });

  it("final precision is 3/5 = 0.6 from fixture counts", () => {
    const result = precisionFromCounts(finalCounts);
    expect(result).toEqual({ numerator: 3, denominator: 5, value: 0.6 });
  });

  it("renders precision as not-available when denominator is zero", () => {
    const zero = precisionFromCounts({ tp: 0, fp: 0 });
    expect(zero.value).toBeNull();
    expect(precisionUnavailableText("en")).toBe("not available");
    expect(precisionUnavailableText("zh")).toBe("不可用");
  });

  it("supports localized cell labels for the trace", () => {
    const finalTrace = precisionFixture;
    expect(finalTrace).toHaveLength(5);
    expect(labelForCell(finalTrace[0]!.cell, "en")).toMatchObject({ code: "TP", full: "True Positive" });
    expect(labelForCell(finalTrace[1]!.cell, "en")).toMatchObject({ code: "FP", full: "False Positive" });
    expect(labelForCell(finalTrace[0]!.cell, "zh")).toMatchObject({ code: "TP", full: "真正例（true positive）" });
    expect(labelForCell(finalTrace[1]!.cell, "zh")).toMatchObject({ code: "FP", full: "假正例（false positive）" });
  });
});
