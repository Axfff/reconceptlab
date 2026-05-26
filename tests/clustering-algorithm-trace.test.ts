import { describe, expect, it } from "vitest";
import {
  centroidFixture,
  dbscanParams,
  densityFixture,
  emFixture,
  emTrace,
  kMeansTrace,
  kMedoidsChoices,
  neighborsWithin,
  totalMedoidCost
} from "../src/components/interactive/clusteringAlgorithmTrace";

describe("clusteringAlgorithmTrace", () => {
  it("keeps k-means assignments and centers stable at the final step", () => {
    const steps = kMeansTrace();
    const final = steps.at(-1);

    expect(final?.id).toBe("done");
    expect(final?.assignments.a1).toBe("C1");
    expect(final?.assignments.b2).toBe("C2");
    expect(final?.assignments.c2).toBe("C3");
    expect(final?.centers).toHaveLength(3);
  });

  it("makes an outlier medoid more expensive than representative medoids", () => {
    const representative = kMedoidsChoices.find((choice) => choice.id === "centroid-like");
    const outlier = kMedoidsChoices.find((choice) => choice.id === "outlier-pulled");

    expect(representative).toBeDefined();
    expect(outlier).toBeDefined();
    expect(totalMedoidCost(centroidFixture, representative?.medoids ?? [])).toBeLessThan(
      totalMedoidCost(centroidFixture, outlier?.medoids ?? [])
    );
  });

  it("classifies the DBSCAN fixture neighborhood used by the figure", () => {
    expect(neighborsWithin(densityFixture, "p1", dbscanParams.epsilon)).toEqual(["p1", "p2", "p3"]);
    expect(densityFixture.find((point) => point.id === "p9")?.role).toBe("noise");
  });

  it("normalizes EM responsibilities for every point", () => {
    const final = emTrace().at(-1);
    expect(final).toBeDefined();

    for (const point of emFixture) {
      const responsibility = final?.responsibilities[point.id] ?? [0, 0];
      expect(responsibility[0] + responsibility[1]).toBeCloseTo(1, 6);
    }
  });
});
