import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  bPlusTreeFixture,
  chooseBPlusChild,
  leafChainKeys,
  leafRecordsOnly,
  leafSplitTrace,
  lookupTraces,
  rangeTraces
} from "../src/components/interactive/bPlusTreeTrace";

describe("bPlusTreeTrace", () => {
  it("keeps internal nodes guide-only and leaf chain sorted", () => {
    expect(bPlusTreeFixture.root.guideKeys).toEqual([30, 60]);
    expect(bPlusTreeFixture.root.guideOnly).toBe(true);
    expect(leafRecordsOnly()).toBe(true);
    expect(leafChainKeys(bPlusTreeFixture.leaves)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
  });

  it("routes equality to separators to the right-hand child", () => {
    expect(chooseBPlusChild(29).childId).toBe("A");
    expect(chooseBPlusChild(30).childId).toBe("B");
    expect(chooseBPlusChild(50).childId).toBe("B");
    expect(chooseBPlusChild(60).childId).toBe("C");
  });

  it("matches golden point lookup traces", () => {
    expect(lookupTraces["50"].found).toBe(true);
    expect(lookupTraces["50"].leafId).toBe("B");
    expect(lookupTraces["50"].pageReads).toBe(2);
    expect(lookupTraces["30"].leafId).toBe("B");
    expect(lookupTraces["60"].leafId).toBe("C");
  });

  it("matches golden range scans and stops at upper bound", () => {
    expect(rangeTraces["20-70"].result).toEqual([20, 30, 40, 50, 60, 70]);
    expect(rangeTraces["20-70"].result).not.toContain(80);
    expect(rangeTraces["20-65"].result).toEqual([20, 30, 40, 50, 60]);
    expect(rangeTraces["20-65"].steps.at(-1)).toMatchObject({
      action: "stop",
      leafId: "C",
      activeKey: 70
    });
  });

  it("copies the separator on leaf split and rewires leaf links", () => {
    const after = leafSplitTrace[1];
    expect(after.rootGuideKeys).toEqual([30, 50, 60]);
    expect(after.copiedSeparator).toBe(50);
    expect(after.leaves.map((leaf) => leaf.records.map((record) => record.key))).toEqual([[10, 20], [30, 40], [50, 55], [60, 70, 80]]);
    expect(after.leaves.map((leaf) => leaf.next)).toEqual(["B-left", "B-right", "C", null]);
    expect(after.leaves[2].records.map((record) => record.key)).toContain(50);
  });

  it("keeps interactive controls accessible by label", () => {
    const lookupSource = readFileSync("src/components/interactive/BPlusTreeLookupFigure.tsx", "utf8");
    const rangeSource = readFileSync("src/components/interactive/BPlusTreeRangeScanDemo.tsx", "utf8");
    expect(lookupSource).toContain("aria-label");
    expect(lookupSource).toContain("Reset lookup trace");
    expect(rangeSource).toContain("aria-label");
    expect(rangeSource).toContain("Reset range trace");
  });
});
