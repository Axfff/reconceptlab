import type { Locale } from "../../i18n/locales";

export type GeometricClusterPoint = {
  id: string;
  label: Record<Locale, string>;
  x: number;
  y: number;
  cluster: string;
};

export type PointSilhouette = {
  id: string;
  cluster: string;
  ownAverage: number;
  nearestOtherAverage: number;
  nearestOtherCluster: string;
  value: number;
};

export type SilhouetteResult = {
  value: number | null;
  points: PointSilhouette[];
};

export type ClusterSummary = {
  cluster: string;
  size: number;
  centroid: { x: number; y: number };
  scatter: number;
  diameter: number;
  withinSquared: number;
};

export type CalinskiHarabaszResult = {
  between: number;
  within: number;
  k: number;
  n: number;
  value: number | null;
};

export type DaviesBouldinResult = {
  value: number | null;
  rows: {
    cluster: string;
    worstNeighbor: string;
    worstSimilarity: number;
  }[];
};

export type DunnResult = {
  minInterclusterDistance: number;
  maxIntraclusterDiameter: number;
  closestPair: [string, string] | null;
  widestCluster: string | null;
  value: number | null;
};

export type InternalClusteringMetrics = {
  silhouette: SilhouetteResult;
  calinskiHarabasz: CalinskiHarabaszResult;
  daviesBouldin: DaviesBouldinResult;
  dunn: DunnResult;
  summaries: ClusterSummary[];
};

export type InternalClusteringPresetId = "compact" | "stretched" | "bridge" | "badSplit";

export type InternalClusteringPreset = {
  id: InternalClusteringPresetId;
  label: Record<Locale, string>;
  explanation: Record<Locale, string>;
  points: GeometricClusterPoint[];
};

function point(id: string, x: number, y: number, cluster: string): GeometricClusterPoint {
  return {
    id,
    label: { en: id, zh: id },
    x,
    y,
    cluster
  };
}

export const internalClusteringPresets: readonly InternalClusteringPreset[] = [
  {
    id: "compact",
    label: { en: "Compact islands", zh: "紧凑岛屿" },
    explanation: {
      en: "Three compact groups are far apart, so cohesion and separation agree.",
      zh: "三个紧凑组彼此较远，因此簇内紧密和簇间分离是一致的。"
    },
    points: [
      point("p1", 1, 1, "A"),
      point("p2", 1.4, 1.2, "A"),
      point("p3", 0.8, 1.5, "A"),
      point("p4", 6, 1.1, "B"),
      point("p5", 6.4, 1.3, "B"),
      point("p6", 5.8, 1.6, "B"),
      point("p7", 3.3, 6, "C"),
      point("p8", 3.7, 6.2, "C"),
      point("p9", 2.9, 6.4, "C")
    ]
  },
  {
    id: "stretched",
    label: { en: "Stretched clusters", zh: "拉长的簇" },
    explanation: {
      en: "Clusters keep the same rough centers, but their diameters and scatter grow.",
      zh: "簇的大致中心仍分开，但直径和离散度变大。"
    },
    points: [
      point("p1", 0.8, 0.8, "A"),
      point("p2", 2.7, 1.1, "A"),
      point("p3", 0.5, 2.4, "A"),
      point("p4", 5.0, 0.9, "B"),
      point("p5", 7.2, 1.2, "B"),
      point("p6", 6.8, 2.7, "B"),
      point("p7", 2.4, 5.1, "C"),
      point("p8", 4.5, 6.0, "C"),
      point("p9", 3.2, 7.2, "C")
    ]
  },
  {
    id: "bridge",
    label: { en: "Bridge point", zh: "桥接点" },
    explanation: {
      en: "A few points sit near another cluster, shrinking the weakest gap.",
      zh: "少数点靠近另一个簇，使最弱的簇间间隔变小。"
    },
    points: [
      point("p1", 1, 1, "A"),
      point("p2", 1.4, 1.2, "A"),
      point("p3", 3.7, 1.6, "A"),
      point("p4", 4.6, 1.7, "B"),
      point("p5", 6.2, 1.2, "B"),
      point("p6", 6.5, 1.7, "B"),
      point("p7", 3.3, 6, "C"),
      point("p8", 3.7, 6.2, "C"),
      point("p9", 2.9, 6.4, "C")
    ]
  },
  {
    id: "badSplit",
    label: { en: "Bad split", zh: "错误切分" },
    explanation: {
      en: "Each cluster mixes points from different islands, so centroids and pair distances disagree with the visible geometry.",
      zh: "每个簇混合了不同岛屿的点，因此质心和成对距离都与可见几何结构冲突。"
    },
    points: [
      point("p1", 1, 1, "A"),
      point("p2", 1.4, 1.2, "B"),
      point("p3", 0.8, 1.5, "C"),
      point("p4", 6, 1.1, "A"),
      point("p5", 6.4, 1.3, "B"),
      point("p6", 5.8, 1.6, "C"),
      point("p7", 3.3, 6, "A"),
      point("p8", 3.7, 6.2, "B"),
      point("p9", 2.9, 6.4, "C")
    ]
  }
];

export const internalClusteringFixture = internalClusteringPresets[0].points;

export function distance(left: GeometricClusterPoint | { x: number; y: number }, right: GeometricClusterPoint | { x: number; y: number }): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function squaredDistance(left: GeometricClusterPoint | { x: number; y: number }, right: GeometricClusterPoint | { x: number; y: number }): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return dx * dx + dy * dy;
}

export function clusterIds(points: readonly GeometricClusterPoint[]): string[] {
  return [...new Set(points.map((item) => item.cluster))].sort((a, b) => a.localeCompare(b));
}

export function pointsForCluster(points: readonly GeometricClusterPoint[], cluster: string): GeometricClusterPoint[] {
  return points.filter((point) => point.cluster === cluster);
}

export function centroid(points: readonly GeometricClusterPoint[]): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length
  };
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pairDistances(points: readonly GeometricClusterPoint[]): number[] {
  const values: number[] = [];
  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      values.push(distance(points[left], points[right]));
    }
  }
  return values;
}

export function clusterSummariesFromPoints(points: readonly GeometricClusterPoint[]): ClusterSummary[] {
  return clusterIds(points).map((cluster) => {
    const members = pointsForCluster(points, cluster);
    const center = centroid(members);
    const distancesToCenter = members.map((point) => distance(point, center));
    const pairwise = pairDistances(members);
    return {
      cluster,
      size: members.length,
      centroid: center,
      scatter: average(distancesToCenter),
      diameter: pairwise.length === 0 ? 0 : Math.max(...pairwise),
      withinSquared: members.reduce((sum, point) => sum + squaredDistance(point, center), 0)
    };
  });
}

export function silhouetteFromPoints(points: readonly GeometricClusterPoint[]): SilhouetteResult {
  const clusters = clusterIds(points);
  if (clusters.length < 2) return { value: null, points: [] };

  const pointResults = points.map((point) => {
    const ownMembers = points.filter((candidate) => candidate.cluster === point.cluster && candidate.id !== point.id);
    const ownAverage = ownMembers.length === 0 ? 0 : average(ownMembers.map((candidate) => distance(point, candidate)));
    const otherAverages = clusters
      .filter((cluster) => cluster !== point.cluster)
      .map((cluster) => ({
        cluster,
        value: average(pointsForCluster(points, cluster).map((candidate) => distance(point, candidate)))
      }))
      .sort((left, right) => left.value - right.value);
    const nearest = otherAverages[0] ?? { cluster: "", value: 0 };
    const denominator = Math.max(ownAverage, nearest.value);
    const value = ownMembers.length === 0 || denominator === 0 ? 0 : (nearest.value - ownAverage) / denominator;

    return {
      id: point.id,
      cluster: point.cluster,
      ownAverage,
      nearestOtherAverage: nearest.value,
      nearestOtherCluster: nearest.cluster,
      value
    };
  });

  return {
    value: average(pointResults.map((point) => point.value)),
    points: pointResults
  };
}

export function calinskiHarabaszFromPoints(points: readonly GeometricClusterPoint[]): CalinskiHarabaszResult {
  const summaries = clusterSummariesFromPoints(points);
  const k = summaries.length;
  const n = points.length;
  const globalCentroid = centroid(points);
  const within = summaries.reduce((sum, summary) => sum + summary.withinSquared, 0);
  const between = summaries.reduce(
    (sum, summary) => sum + summary.size * squaredDistance(summary.centroid, globalCentroid),
    0
  );
  const value = k < 2 || n <= k || within === 0 ? null : (between / (k - 1)) / (within / (n - k));

  return { between, within, k, n, value };
}

export function daviesBouldinFromPoints(points: readonly GeometricClusterPoint[]): DaviesBouldinResult {
  const summaries = clusterSummariesFromPoints(points);
  if (summaries.length < 2) return { value: null, rows: [] };

  const rows = summaries.map((left) => {
    const rivals = summaries
      .filter((right) => right.cluster !== left.cluster)
      .map((right) => {
        const centerDistance = distance(left.centroid, right.centroid);
        return {
          cluster: right.cluster,
          value: centerDistance === 0 ? Number.POSITIVE_INFINITY : (left.scatter + right.scatter) / centerDistance
        };
      })
      .sort((a, b) => b.value - a.value);
    const worst = rivals[0] ?? { cluster: "", value: Number.POSITIVE_INFINITY };
    return {
      cluster: left.cluster,
      worstNeighbor: worst.cluster,
      worstSimilarity: worst.value
    };
  });

  const hasInfinite = rows.some((row) => !Number.isFinite(row.worstSimilarity));
  return {
    value: hasInfinite ? null : average(rows.map((row) => row.worstSimilarity)),
    rows
  };
}

export function dunnIndexFromPoints(points: readonly GeometricClusterPoint[]): DunnResult {
  const clusters = clusterIds(points);
  const summaries = clusterSummariesFromPoints(points);
  let minInterclusterDistance = Number.POSITIVE_INFINITY;
  let closestPair: [string, string] | null = null;

  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      if (points[left].cluster !== points[right].cluster) {
        const value = distance(points[left], points[right]);
        if (value < minInterclusterDistance) {
          minInterclusterDistance = value;
          closestPair = [points[left].id, points[right].id];
        }
      }
    }
  }

  const widest = summaries.reduce<ClusterSummary | null>(
    (best, current) => (best === null || current.diameter > best.diameter ? current : best),
    null
  );
  const maxIntraclusterDiameter = widest?.diameter ?? 0;
  const value =
    clusters.length < 2 || maxIntraclusterDiameter === 0 || !Number.isFinite(minInterclusterDistance)
      ? null
      : minInterclusterDistance / maxIntraclusterDiameter;

  return {
    minInterclusterDistance: Number.isFinite(minInterclusterDistance) ? minInterclusterDistance : 0,
    maxIntraclusterDiameter,
    closestPair,
    widestCluster: widest?.cluster ?? null,
    value
  };
}

export function internalMetricsFromPoints(points: readonly GeometricClusterPoint[]): InternalClusteringMetrics {
  return {
    silhouette: silhouetteFromPoints(points),
    calinskiHarabasz: calinskiHarabaszFromPoints(points),
    daviesBouldin: daviesBouldinFromPoints(points),
    dunn: dunnIndexFromPoints(points),
    summaries: clusterSummariesFromPoints(points)
  };
}

export function formatInternalMetric(value: number | null, locale: Locale, digits = 3): string {
  if (value === null || Number.isNaN(value)) return locale === "en" ? "not available" : "不可用";
  return Number(value.toFixed(digits)).toString();
}
