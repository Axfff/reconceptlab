import { describe, expect, it } from "vitest";
import {
  nearestNeighbors,
  neighborProbability,
  pairwiseDistances,
  pcaVarianceSummary,
  reductionPoints,
  reductionSteps,
  studentSimilarity
} from "../src/components/interactive/dimensionalityReductionTrace";

describe("dimensionality reduction trace helpers", () => {
  it("keeps PCA's first fixture direction more informative than the quiet z direction", () => {
    const summary = pcaVarianceSummary();

    expect(summary.pc1).toBeGreaterThan(summary.z);
  });

  it("builds deterministic pairwise distances and nearest neighbors", () => {
    const distances = pairwiseDistances();
    const neighbors = nearestNeighbors("a1", 2);

    expect(Object.keys(distances)).toHaveLength((reductionPoints.length * (reductionPoints.length - 1)) / 2);
    expect(neighbors.map((point) => point.id)).toEqual(["a2", "a3"]);
  });

  it("uses monotone neighbor similarities for SNE-family explanations", () => {
    expect(neighborProbability(0.5)).toBeGreaterThan(neighborProbability(2));
    expect(studentSimilarity(0.5)).toBeGreaterThan(studentSimilarity(2));
  });

  it("has at least two teaching steps for every method", () => {
    for (const steps of Object.values(reductionSteps)) {
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps.every((step) => step.title.en && step.title.zh && step.explanation.en && step.explanation.zh)).toBe(true);
    }
  });
});
