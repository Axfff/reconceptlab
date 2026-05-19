import { describe, expect, it } from "vitest";
import {
  actualPositiveExamples,
  buildRecallTrace,
  recallFromCounts,
  recallUnavailableText,
  recallFixture
} from "../src/components/interactive/recallTrace";
import {
  confusionMatrixExamples,
  labelForCell,
  positiveLabel
} from "../src/components/interactive/confusionMatrixTrace";

describe("recall trace fixture", () => {
  it("uses only actual-positive examples in fixture order", () => {
    const trace = buildRecallTrace(confusionMatrixExamples, positiveLabel);
    expect(trace.map((step) => step.example.id)).toEqual([
      "e1",
      "e4",
      "e5",
      "e8",
      "e10",
      "e12"
    ]);
  });

  it("exposes a helper for extracting actual-positive examples", () => {
    const actualPositives = actualPositiveExamples(confusionMatrixExamples, positiveLabel);
    expect(actualPositives.map((entry) => entry.id)).toEqual(["e1", "e4", "e5", "e8", "e10", "e12"]);
  });

  it("tracks caught positives and running recall through all six steps", () => {
    expect(recallFixture).toHaveLength(6);
    expect(recallFixture[0]).toMatchObject({
      index: 0,
      example: { id: "e1", actual: "spam", prediction: "spam" },
      cell: "tp",
      caughtPositives: 1,
      actualPositivesSeen: 1
    });
    expect(recallFixture[1]).toMatchObject({
      index: 1,
      example: { id: "e4", actual: "spam", prediction: "not-spam" },
      cell: "fn",
      caughtPositives: 1,
      actualPositivesSeen: 2,
      value: 0.5
    });
    expect(recallFixture[2]).toMatchObject({
      index: 2,
      example: { id: "e5", actual: "spam", prediction: "spam" },
      cell: "tp",
      caughtPositives: 2,
      actualPositivesSeen: 3
    });
    expect(recallFixture[2]!.value).toBeCloseTo(2 / 3);
    expect(recallFixture[3]).toMatchObject({
      index: 3,
      example: { id: "e8", actual: "spam", prediction: "not-spam" },
      cell: "fn",
      caughtPositives: 2,
      actualPositivesSeen: 4,
      value: 0.5
    });
    expect(recallFixture[4]).toMatchObject({
      index: 4,
      example: { id: "e10", actual: "spam", prediction: "spam" },
      cell: "tp",
      caughtPositives: 3,
      actualPositivesSeen: 5
    });
    expect(recallFixture[4]!.value).toBeCloseTo(3 / 5);
    expect(recallFixture[5]).toMatchObject({
      index: 5,
      example: { id: "e12", actual: "spam", prediction: "not-spam" },
      cell: "fn",
      caughtPositives: 3,
      actualPositivesSeen: 6
    });
    expect(recallFixture[5]!.value).toBeCloseTo(0.5);
  });

  it("computes final recall from counts as 3/6 = 0.5", () => {
    const result = recallFromCounts({ tp: 3, fn: 3 });
    expect(result).toEqual({ numerator: 3, denominator: 6, value: 0.5 });
  });

  it("renders recall as not available when denominator is zero", () => {
    const zero = recallFromCounts({ tp: 0, fn: 0 });
    expect(zero.value).toBeNull();
    expect(recallUnavailableText("en")).toBe("not available");
    expect(recallUnavailableText("zh")).toBe("不可用");
  });

  it("supports localized cell labels for trace steps", () => {
    const first = recallFixture[0]!;
    const second = recallFixture[1]!;
    expect(labelForCell(first.cell, "en")).toMatchObject({ code: "TP", full: "True Positive" });
    expect(labelForCell(first.cell, "zh")).toMatchObject({ code: "TP", full: "真正例（true positive）" });
    expect(labelForCell(second.cell, "en")).toMatchObject({ code: "FN", full: "False Negative" });
    expect(labelForCell(second.cell, "zh")).toMatchObject({ code: "FN", full: "假负例（false negative）" });
  });
});
