import { describe, expect, it } from "vitest";
import {
  arithmeticMean,
  f1FromCounts,
  f1FromPrecisionRecall,
  f1Presets,
  formatMetric,
  type F1PresetId
} from "../src/components/interactive/f1ScoreTrace";
import { finalCounts } from "../src/components/interactive/confusionMatrixTrace";

describe("f1 score helpers", () => {
  it("builds the fixture F1 from counts", () => {
    const result = f1FromCounts({ tp: finalCounts.tp, fp: finalCounts.fp, fn: finalCounts.fn });
    expect(result.numerator).toBe(6);
    expect(result.denominator).toBe(11);
    expect(result.precision).toBeCloseTo(3 / 5);
    expect(result.recall).toBeCloseTo(3 / 6);
    expect(result.value).toBeCloseTo(6 / 11);
  });

  it("falls back to unavailable when required source metric is missing", () => {
    const metric = f1FromPrecisionRecall(null, 0);
    expect(metric.value).toBeNull();
    expect(metric.precision).toBeNull();
    expect(metric.recall).toBe(0);
  });

  it("returns zero when counts have no true positives but still have FN or FP", () => {
    const result = f1FromCounts({ tp: 0, fp: 0, fn: 6 });
    expect(result.precision).toBeNull();
    expect(result.value).toBe(0);
    expect(result.denominator).toBe(6);
    expect(result.numerator).toBe(0);
  });

  it("returns zero when count denominator is non-zero but precision/recall are zero", () => {
    const result = f1FromCounts({ tp: 0, fp: 2, fn: 3 });
    expect(result.denominator).toBe(5);
    expect(result.value).toBe(0);
  });

  it("handles no-positive-evidence branch with unavailable F1", () => {
    const noEvidence = f1Presets.find((preset) => preset.id === "no-positive-evidence" as F1PresetId);
    expect(noEvidence).toBeTruthy();
    if (!noEvidence) return;
    const result = f1FromCounts(noEvidence.counts);
    expect(result.denominator).toBe(0);
    expect(result.value).toBeNull();
  });

  it("computes arithmetic mean only from available precision and recall", () => {
    const available = arithmeticMean(0.6, 0.5);
    expect(available).toBeCloseTo(0.55);
    expect(arithmeticMean(null, 0.5)).toBeNull();
    expect(arithmeticMean(1, null)).toBeNull();
  });

  it("builds preset expectations and agrees with metric and count formulations for fixture", () => {
    const fixture = f1Presets.find((preset) => preset.id === "fixture");
    expect(fixture).toBeTruthy();
    if (!fixture) return;

    const byCounts = f1FromCounts(fixture.counts);
    const byMetric = f1FromPrecisionRecall(byCounts.precision, byCounts.recall);

    expect(byCounts.value).toBeCloseTo(byMetric.value ?? 0);
    expect(byCounts.denominator).toBe(11);
    expect(formatMetric(byCounts.value, "en")).toBe("0.545");
    expect(formatMetric(byCounts.value, "zh")).toBe("0.545");
  });

  it("includes all required preset ids", () => {
    const ids = f1Presets.map((preset) => preset.id).sort();
    expect(ids).toEqual([
      "both-strong",
      "errors-no-true-positives",
      "fixture",
      "high-precision-low-recall",
      "low-precision-high-recall",
      "no-positive-evidence"
    ]);
  });
});
