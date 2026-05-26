import { describe, expect, it } from "vitest";
import {
  adjustedRandIndexFromExamples,
  choose2,
  clusteringFixture,
  clusteringPresets,
  formatClusteringMetric,
  fowlkesMallowsIndexFromExamples,
  pairStatsFromExamples,
  purityFromExamples,
  randIndexFromExamples,
  type ClusteringPresetId
} from "../src/components/interactive/clusteringMetricsTrace";

function preset(id: ClusteringPresetId) {
  const found = clusteringPresets.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing preset ${id}`);
  return found;
}

describe("clustering metrics helpers", () => {
  it("computes combination counts", () => {
    expect(choose2(0)).toBe(0);
    expect(choose2(1)).toBe(0);
    expect(choose2(8)).toBe(28);
  });

  it("computes fixture purity from cluster majorities", () => {
    const purity = purityFromExamples(clusteringFixture);
    expect(purity.numerator).toBe(7);
    expect(purity.denominator).toBe(8);
    expect(purity.value).toBeCloseTo(7 / 8);
    expect(purity.contributions.map((entry) => entry.majorityCount)).toEqual([2, 1, 2, 2]);
  });

  it("computes fixture pair counts and Rand Index", () => {
    const stats = pairStatsFromExamples(clusteringFixture);
    expect(stats).toEqual({ tp: 3, fp: 1, fn: 4, tn: 20, total: 28 });

    const ri = randIndexFromExamples(clusteringFixture);
    expect(ri.numerator).toBe(23);
    expect(ri.denominator).toBe(28);
    expect(ri.value).toBeCloseTo(23 / 28);
  });

  it("computes fixture Adjusted Rand Index", () => {
    const ari = adjustedRandIndexFromExamples(clusteringFixture);
    expect(ari.observedSamePairs).toBe(3);
    expect(ari.clusterPairSum).toBe(4);
    expect(ari.classPairSum).toBe(7);
    expect(ari.expectedIndex).toBeCloseTo(1);
    expect(ari.maxIndex).toBeCloseTo(5.5);
    expect(ari.value).toBeCloseTo(4 / 9);
  });

  it("computes fixture Fowlkes-Mallows Index", () => {
    const fmi = fowlkesMallowsIndexFromExamples(clusteringFixture);
    expect(fmi.pairPrecision).toBeCloseTo(3 / 4);
    expect(fmi.pairRecall).toBeCloseTo(3 / 7);
    expect(fmi.value).toBeCloseTo(3 / Math.sqrt(28));
  });

  it("shows Purity's singleton over-splitting limitation", () => {
    const overSplit = preset("oversplit").items;
    expect(purityFromExamples(overSplit).value).toBe(1);
    expect(randIndexFromExamples(overSplit).value).toBeCloseTo(21 / 28);
    expect(adjustedRandIndexFromExamples(overSplit).value).toBe(0);
    expect(fowlkesMallowsIndexFromExamples(overSplit).value).toBeNull();
  });

  it("handles perfect and merged presets", () => {
    const perfect = preset("perfect").items;
    expect(purityFromExamples(perfect).value).toBe(1);
    expect(randIndexFromExamples(perfect).value).toBe(1);
    expect(adjustedRandIndexFromExamples(perfect).value).toBe(1);
    expect(fowlkesMallowsIndexFromExamples(perfect).value).toBe(1);

    const merged = preset("merged").items;
    expect(purityFromExamples(merged).value).toBeCloseTo(3 / 8);
    expect(randIndexFromExamples(merged).value).toBeCloseTo(7 / 28);
    expect(adjustedRandIndexFromExamples(merged).value).toBe(0);
    expect(fowlkesMallowsIndexFromExamples(merged).value).toBeCloseTo(7 / Math.sqrt(28 * 7));
  });

  it("formats unavailable metrics by locale", () => {
    expect(formatClusteringMetric(null, "en")).toBe("not available");
    expect(formatClusteringMetric(null, "zh")).toBe("不可用");
    expect(formatClusteringMetric(4 / 9, "en")).toBe("0.444");
  });
});
