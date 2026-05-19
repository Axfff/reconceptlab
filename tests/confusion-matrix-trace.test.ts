import { describe, expect, it } from "vitest";
import {
  buildConfusionMatrixTrace,
  confusionMatrixExamples,
  countMatrix,
  defaultTrace,
  finalCounts,
  labelForCell,
  swappedFinalCounts,
  swappedTrace
} from "../src/components/interactive/confusionMatrixTrace";

describe("confusion-matrix trace fixture", () => {
  it("matches the required golden matrix totals", () => {
    expect(confusionMatrixExamples).toHaveLength(12);
    expect(finalCounts).toEqual({ tp: 3, fp: 2, tn: 4, fn: 3 });
    expect(swappedFinalCounts).toEqual({ tp: 4, fp: 3, tn: 3, fn: 2 });
  });

  it("maps each fixture example to the expected cell", () => {
    const mapping: Record<string, "tp" | "fp" | "tn" | "fn"> = {
      e1: "tp",
      e2: "tn",
      e3: "fp",
      e4: "fn",
      e5: "tp",
      e6: "tn",
      e7: "tn",
      e8: "fn",
      e9: "fp",
      e10: "tp",
      e11: "tn",
      e12: "fn"
    };

    expect(defaultTrace).toHaveLength(confusionMatrixExamples.length);
    defaultTrace.forEach((step, index) => {
      expect(step.example.id).toBe(confusionMatrixExamples[index]?.id);
      expect(step.cell).toBe(mapping[step.example.id]);
    });
  });

  it("starts from zero and increments exactly one cell per step", () => {
    const [first] = defaultTrace;
    expect(first?.before).toMatchObject({ tp: 0, fp: 0, tn: 0, fn: 0 });

    for (const step of defaultTrace) {
      const before = { ...step.before };
      const after = { ...step.after };
      const changed = Object.entries(after).filter(([cell, value]) => {
        return value !== before[cell as keyof typeof after];
      });

      expect(changed).toHaveLength(1);
      const [cell, value] = changed[0];
      expect(value - before[cell as keyof typeof before]).toBe(1);

      expect(before.tp + before.fp + before.tn + before.fn).toBe(step.index);
      expect(after.tp + after.fp + after.tn + after.fn).toBe(step.index + 1);
    }
  });

  it("keeps label function localized and typed", () => {
    expect(labelForCell("tp", "en")).toMatchObject({ code: "TP", full: "True Positive" });
    expect(labelForCell("fp", "zh")).toMatchObject({ code: "FP", full: "假正例（false positive）" });
  });

  it("includes swapped-positive labels for the same fixture", () => {
    expect(swappedTrace).toHaveLength(confusionMatrixExamples.length);
    expect(swappedTrace[0]?.cell).toBe("tn");
    expect(swappedTrace.at(-1)?.after).toEqual(swappedFinalCounts);
  });

  it("recomputes the same counts from fixture when replayed", () => {
    const replay = buildConfusionMatrixTrace(confusionMatrixExamples);
    expect(replay).toEqual(defaultTrace);
    expect(replay[replay.length - 1]?.after).toEqual(countMatrix(confusionMatrixExamples));
  });

  it("provides the required after-e9 invariant snapshot", () => {
    const step9 = defaultTrace[8];
    expect(step9).toBeDefined();
    expect(step9!.after).toEqual({ tp: 2, fp: 2, tn: 3, fn: 2 });
  });
});
