import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  collectLeafDepths,
  everyNodeRespectsMaxKeys,
  finalTree,
  insertionSequence,
  minimumDegree,
  nonRootSplitBeforeDescentTrace,
  rootSplitTrace,
  searchTraces
} from "../src/components/interactive/bTreeTrace";

describe("bTreeTrace", () => {
  it("keeps the CLRS insertion fixture and final tree shape stable", () => {
    expect(minimumDegree).toBe(2);
    expect(insertionSequence).toEqual([10, 20, 5, 6, 12, 30, 7, 17]);
    expect(finalTree.keys).toEqual([10, 20]);
    expect(finalTree.children?.map((child) => child.keys)).toEqual([[5, 6, 7], [12, 17], [30]]);
  });

  it("preserves occupancy bounds and equal leaf depth", () => {
    expect(everyNodeRespectsMaxKeys(finalTree, minimumDegree)).toBe(true);
    expect(new Set(collectLeafDepths(finalTree)).size).toBe(1);
  });

  it("matches the golden search traces", () => {
    expect(searchTraces["17"].found).toBe(true);
    expect(searchTraces["17"].pageReads).toBe(2);
    expect(searchTraces["17"].steps.find((step) => step.action === "choose-child")?.rangeLabel.en).toBe("10 < key < 20");

    expect(searchTraces["10"].found).toBe(true);
    expect(searchTraces["10"].pageReads).toBe(1);
    expect(searchTraces["10"].resultNodeId).toBe("root");

    expect(searchTraces["13"].found).toBe(false);
    expect(searchTraces["13"].pageReads).toBe(2);
    expect(searchTraces["13"].steps.at(-1)?.action).toBe("missing");
  });

  it("covers root split and non-root split-before-descent", () => {
    expect(rootSplitTrace[0].root.keys).toEqual([5, 10, 20]);
    expect(rootSplitTrace[1].promotedKey).toBe(10);
    expect(rootSplitTrace[1].root.children?.map((child) => child.keys)).toEqual([[5], [20]]);
    expect(rootSplitTrace[2].root.children?.[0].keys).toEqual([5, 6]);

    expect(nonRootSplitBeforeDescentTrace[0].root.children?.[1].keys).toEqual([12, 20, 30]);
    expect(nonRootSplitBeforeDescentTrace[1].promotedKey).toBe(20);
    expect(nonRootSplitBeforeDescentTrace[1].root.keys).toEqual([10, 20]);
    expect(nonRootSplitBeforeDescentTrace[2].root.children?.map((child) => child.keys)).toEqual([[5, 6, 7], [12, 17], [30]]);
  });

  it("keeps interactive controls accessible by label", () => {
    const searchSource = readFileSync("src/components/interactive/BTreeSearchFigure.tsx", "utf8");
    const splitSource = readFileSync("src/components/interactive/BTreeSplitDemo.tsx", "utf8");
    expect(searchSource).toContain("aria-label");
    expect(searchSource).toContain("Reset search trace");
    expect(splitSource).toContain("aria-label");
    expect(splitSource).toContain("Reset split trace");
  });
});
