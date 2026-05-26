import { describe, expect, it } from "vitest";
import {
  calinskiHarabaszFromPoints,
  daviesBouldinFromPoints,
  distance,
  dunnIndexFromPoints,
  formatInternalMetric,
  internalClusteringPresets,
  internalMetricsFromPoints,
  silhouetteFromPoints,
  type GeometricClusterPoint,
  type InternalClusteringPresetId
} from "../src/components/interactive/internalClusteringMetricsTrace";

function preset(id: InternalClusteringPresetId) {
  const found = internalClusteringPresets.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing preset ${id}`);
  return found;
}

const simpleLine: GeometricClusterPoint[] = [
  { id: "a1", label: { en: "a1", zh: "a1" }, x: 0, y: 0, cluster: "A" },
  { id: "a2", label: { en: "a2", zh: "a2" }, x: 0, y: 2, cluster: "A" },
  { id: "b1", label: { en: "b1", zh: "b1" }, x: 6, y: 0, cluster: "B" },
  { id: "b2", label: { en: "b2", zh: "b2" }, x: 6, y: 2, cluster: "B" }
];

describe("internal clustering metric helpers", () => {
  it("computes Euclidean distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("computes known values for a two-cluster line fixture", () => {
    const silhouette = silhouetteFromPoints(simpleLine);
    const ch = calinskiHarabaszFromPoints(simpleLine);
    const db = daviesBouldinFromPoints(simpleLine);
    const dunn = dunnIndexFromPoints(simpleLine);

    expect(silhouette.value).toBeCloseTo((6.162277660168379 - 2) / 6.162277660168379);
    expect(ch.between).toBeCloseTo(36);
    expect(ch.within).toBeCloseTo(4);
    expect(ch.value).toBeCloseTo(18);
    expect(db.value).toBeCloseTo(1 / 3);
    expect(dunn.minInterclusterDistance).toBeCloseTo(6);
    expect(dunn.maxIntraclusterDiameter).toBeCloseTo(2);
    expect(dunn.value).toBeCloseTo(3);
  });

  it("keeps the compact preset stronger than bad split for higher-better metrics", () => {
    const compact = internalMetricsFromPoints(preset("compact").points);
    const badSplit = internalMetricsFromPoints(preset("badSplit").points);

    expect(compact.silhouette.value ?? 0).toBeGreaterThan(badSplit.silhouette.value ?? 0);
    expect(compact.calinskiHarabasz.value ?? 0).toBeGreaterThan(badSplit.calinskiHarabasz.value ?? 0);
    expect(compact.dunn.value ?? 0).toBeGreaterThan(badSplit.dunn.value ?? 0);
    expect(compact.daviesBouldin.value ?? Number.POSITIVE_INFINITY).toBeLessThan(
      badSplit.daviesBouldin.value ?? Number.POSITIVE_INFINITY
    );
  });

  it("handles degenerate cases without NaN", () => {
    const singletonClusters: GeometricClusterPoint[] = [
      { id: "a", label: { en: "a", zh: "a" }, x: 0, y: 0, cluster: "A" },
      { id: "b", label: { en: "b", zh: "b" }, x: 5, y: 0, cluster: "B" }
    ];
    const oneCluster = simpleLine.map((point) => ({ ...point, cluster: "A" }));

    expect(silhouetteFromPoints(singletonClusters).points.map((point) => point.value)).toEqual([0, 0]);
    expect(calinskiHarabaszFromPoints(singletonClusters).value).toBeNull();
    expect(dunnIndexFromPoints(singletonClusters).value).toBeNull();
    expect(silhouetteFromPoints(oneCluster).value).toBeNull();
    expect(daviesBouldinFromPoints(oneCluster).value).toBeNull();
  });

  it("formats unavailable metrics by locale", () => {
    expect(formatInternalMetric(null, "en")).toBe("not available");
    expect(formatInternalMetric(null, "zh")).toBe("不可用");
    expect(formatInternalMetric(1 / 3, "en")).toBe("0.333");
  });
});
