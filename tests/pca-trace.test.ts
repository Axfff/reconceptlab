import { describe, expect, it } from "vitest";
import {
  centerPcaPoints,
  covariance2d,
  pcaPoints,
  pcaTraceSteps,
  principalComponents2d,
  reconstructionComparisons,
  varianceAlongDirection,
  varianceSweep
} from "../src/components/interactive/pcaTrace";

function angularDistance(left: number, right: number) {
  const raw = Math.abs(left - right) % 180;
  return Math.min(raw, 180 - raw);
}

describe("PCA trace helpers", () => {
  it("centers the fixture means at approximately zero", () => {
    const centered = centerPcaPoints();
    const meanX = centered.reduce((sum, point) => sum + point.x, 0) / centered.length;
    const meanY = centered.reduce((sum, point) => sum + point.y, 0) / centered.length;

    expect(meanX).toBeCloseTo(0, 12);
    expect(meanY).toBeCloseTo(0, 12);
  });

  it("computes deterministic population covariance values", () => {
    const covariance = covariance2d();

    expect(covariance.xx).toBeCloseTo(46.6666666667, 10);
    expect(covariance.xy).toBeCloseTo(67.3333333333, 10);
    expect(covariance.yy).toBeCloseTo(98.3333333333, 10);
  });

  it("returns orthonormal principal components", () => {
    const [pc1, pc2] = principalComponents2d();
    const dot = pc1.x * pc2.x + pc1.y * pc2.y;

    expect(Math.hypot(pc1.x, pc1.y)).toBeCloseTo(1, 12);
    expect(Math.hypot(pc2.x, pc2.y)).toBeCloseTo(1, 12);
    expect(dot).toBeCloseTo(0, 12);
    expect(pc1.eigenvalue).toBeGreaterThan(pc2.eigenvalue);
  });

  it("makes PC1 variance greater than either raw-column alternative", () => {
    const [pc1] = principalComponents2d();
    const covariance = covariance2d();

    expect(pc1.eigenvalue).toBeGreaterThan(covariance.xx);
    expect(pc1.eigenvalue).toBeGreaterThan(covariance.yy);
  });

  it("matches the sweep maximum to the computed PC1 direction", () => {
    const [pc1] = principalComponents2d();
    const best = varianceSweep.reduce((left, right) => (left.variance > right.variance ? left : right));

    expect(angularDistance(best.degrees, pc1.angleDegrees)).toBeLessThanOrEqual(1);
    expect(best.variance).toBeCloseTo(varianceAlongDirection(pcaPoints, best.degrees), 12);
  });

  it("keeps deterministic reconstruction comparisons", () => {
    const comparisons = reconstructionComparisons();

    expect(comparisons.map((row) => row.id)).toEqual(["keep-height", "keep-arm-span", "keep-pc1", "keep-pc1-pc2"]);
    expect(comparisons[0].error).toBeCloseTo(590, 10);
    expect(comparisons[1].error).toBeCloseTo(280, 10);
    expect(comparisons[2].error).toBeCloseTo(2.2864688966, 10);
    expect(comparisons[3].error).toBeCloseTo(0, 10);
  });

  it("reconstructs with PC1 better than dropping either correlated raw feature", () => {
    const comparisons = reconstructionComparisons();
    const pc1 = comparisons.find((row) => row.id === "keep-pc1");
    const rawBaselines = comparisons.filter((row) => row.id === "keep-height" || row.id === "keep-arm-span");

    expect(pc1).toBeDefined();
    expect(rawBaselines.every((row) => pc1!.error < row.error)).toBe(true);
  });

  it("has localized trace steps", () => {
    expect(pcaTraceSteps).toHaveLength(6);
    expect(pcaTraceSteps.every((step) => step.title.en && step.title.zh && step.explanation.en && step.explanation.zh)).toBe(true);
  });
});

