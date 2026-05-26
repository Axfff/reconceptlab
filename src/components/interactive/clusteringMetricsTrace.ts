import type { Locale } from "../../i18n/locales";

export type ClusterItem = {
  id: string;
  label: Record<Locale, string>;
  truth: string;
  cluster: string;
};

export type PairStats = {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  total: number;
};

export type PurityResult = {
  numerator: number;
  denominator: number;
  value: number | null;
  contributions: {
    cluster: string;
    size: number;
    majorityLabel: string;
    majorityCount: number;
  }[];
};

export type RandResult = {
  numerator: number;
  denominator: number;
  value: number | null;
};

export type AdjustedRandResult = {
  observedSamePairs: number;
  clusterPairSum: number;
  classPairSum: number;
  totalPairs: number;
  expectedIndex: number;
  maxIndex: number;
  numerator: number;
  denominator: number;
  value: number | null;
};

export type FowlkesMallowsResult = {
  pairPrecision: number | null;
  pairRecall: number | null;
  numerator: number;
  denominator: number;
  value: number | null;
};

export type ClusteringPresetId = "fixture" | "perfect" | "oversplit" | "merged";

export type ClusteringPreset = {
  id: ClusteringPresetId;
  label: Record<Locale, string>;
  items: ClusterItem[];
  explanation: Record<Locale, string>;
};

const baseLabels = [
  {
    id: "a",
    label: { en: "Ada", zh: "Ada" },
    truth: "graph"
  },
  {
    id: "b",
    label: { en: "Ben", zh: "Ben" },
    truth: "graph"
  },
  {
    id: "c",
    label: { en: "Cy", zh: "Cy" },
    truth: "graph"
  },
  {
    id: "d",
    label: { en: "Di", zh: "Di" },
    truth: "tree"
  },
  {
    id: "e",
    label: { en: "Eli", zh: "Eli" },
    truth: "tree"
  },
  {
    id: "f",
    label: { en: "Fay", zh: "Fay" },
    truth: "tree"
  },
  {
    id: "g",
    label: { en: "Gus", zh: "Gus" },
    truth: "hash"
  },
  {
    id: "h",
    label: { en: "Han", zh: "Han" },
    truth: "hash"
  }
] as const;

function withClusters(clusters: readonly string[]): ClusterItem[] {
  return baseLabels.map((item, index) => ({
    ...item,
    cluster: clusters[index] ?? "unknown"
  }));
}

export const clusteringPresets: readonly ClusteringPreset[] = [
  {
    id: "fixture",
    label: {
      en: "Fixture",
      zh: "固定样本"
    },
    items: withClusters(["A", "A", "B", "B", "C", "C", "D", "D"]),
    explanation: {
      en: "One mixed cluster and two split true classes make Purity look high while pair metrics reveal damage.",
      zh: "一个混合簇和两个被拆开的真实类别会让纯度看起来高，但成对指标会暴露损失。"
    }
  },
  {
    id: "perfect",
    label: {
      en: "Perfect match",
      zh: "完全匹配"
    },
    items: withClusters(["G", "G", "G", "T", "T", "T", "H", "H"]),
    explanation: {
      en: "Clusters match the reference labels up to arbitrary cluster names.",
      zh: "簇与参考标签完全一致，只是簇名可以任意命名。"
    }
  },
  {
    id: "oversplit",
    label: {
      en: "Singleton over-split",
      zh: "单点过度拆分"
    },
    items: withClusters(["A", "B", "C", "D", "E", "F", "G", "H"]),
    explanation: {
      en: "Every cluster is pure, but no same-label pair is recovered.",
      zh: "每个簇都很纯，但没有任何同标签样本对被放在一起。"
    }
  },
  {
    id: "merged",
    label: {
      en: "All merged",
      zh: "全部合并"
    },
    items: withClusters(["M", "M", "M", "M", "M", "M", "M", "M"]),
    explanation: {
      en: "All true groups are recovered as pairs, but many unrelated pairs are forced together.",
      zh: "所有同标签样本对都被放在一起，但大量无关样本对也被强行合并。"
    }
  }
];

export const clusteringFixture = clusteringPresets[0].items;

export function choose2(count: number): number {
  return count < 2 ? 0 : (count * (count - 1)) / 2;
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function contingencyTable(items: readonly ClusterItem[]) {
  const clusters = uniqueSorted(items.map((item) => item.cluster));
  const labels = uniqueSorted(items.map((item) => item.truth));
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = `${item.cluster}\u0000${item.truth}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return {
    clusters,
    labels,
    count(cluster: string, label: string) {
      return counts.get(`${cluster}\u0000${label}`) ?? 0;
    },
    clusterSize(cluster: string) {
      return labels.reduce((sum, label) => sum + (counts.get(`${cluster}\u0000${label}`) ?? 0), 0);
    },
    labelSize(label: string) {
      return clusters.reduce((sum, cluster) => sum + (counts.get(`${cluster}\u0000${label}`) ?? 0), 0);
    }
  };
}

export function purityFromExamples(items: readonly ClusterItem[]): PurityResult {
  const table = contingencyTable(items);
  const contributions = table.clusters.map((cluster) => {
    const counts = table.labels.map((label) => ({
      label,
      count: table.count(cluster, label)
    }));
    const majority = counts.reduce((best, current) => (current.count > best.count ? current : best), counts[0]);
    return {
      cluster,
      size: table.clusterSize(cluster),
      majorityLabel: majority?.label ?? "",
      majorityCount: majority?.count ?? 0
    };
  });
  const numerator = contributions.reduce((sum, contribution) => sum + contribution.majorityCount, 0);
  const denominator = items.length;

  return {
    numerator,
    denominator,
    value: denominator === 0 ? null : numerator / denominator,
    contributions
  };
}

export function pairStatsFromExamples(items: readonly ClusterItem[]): PairStats {
  const stats: PairStats = { tp: 0, fp: 0, fn: 0, tn: 0, total: 0 };

  for (let left = 0; left < items.length; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      const sameTruth = items[left].truth === items[right].truth;
      const sameCluster = items[left].cluster === items[right].cluster;
      stats.total += 1;

      if (sameTruth && sameCluster) stats.tp += 1;
      else if (!sameTruth && sameCluster) stats.fp += 1;
      else if (sameTruth && !sameCluster) stats.fn += 1;
      else stats.tn += 1;
    }
  }

  return stats;
}

export function randIndexFromPairs(stats: PairStats): RandResult {
  const numerator = stats.tp + stats.tn;
  return {
    numerator,
    denominator: stats.total,
    value: stats.total === 0 ? null : numerator / stats.total
  };
}

export function randIndexFromExamples(items: readonly ClusterItem[]): RandResult {
  return randIndexFromPairs(pairStatsFromExamples(items));
}

export function adjustedRandIndexFromExamples(items: readonly ClusterItem[]): AdjustedRandResult {
  const table = contingencyTable(items);
  const totalPairs = choose2(items.length);
  const observedSamePairs = table.clusters.reduce(
    (clusterSum, cluster) =>
      clusterSum + table.labels.reduce((labelSum, label) => labelSum + choose2(table.count(cluster, label)), 0),
    0
  );
  const clusterPairSum = table.clusters.reduce((sum, cluster) => sum + choose2(table.clusterSize(cluster)), 0);
  const classPairSum = table.labels.reduce((sum, label) => sum + choose2(table.labelSize(label)), 0);
  const expectedIndex = totalPairs === 0 ? 0 : (clusterPairSum * classPairSum) / totalPairs;
  const maxIndex = (clusterPairSum + classPairSum) / 2;
  const numerator = observedSamePairs - expectedIndex;
  const denominator = maxIndex - expectedIndex;

  if (denominator === 0) {
    const perfect = observedSamePairs === clusterPairSum && observedSamePairs === classPairSum;
    return {
      observedSamePairs,
      clusterPairSum,
      classPairSum,
      totalPairs,
      expectedIndex,
      maxIndex,
      numerator,
      denominator,
      value: perfect ? 1 : null
    };
  }

  return {
    observedSamePairs,
    clusterPairSum,
    classPairSum,
    totalPairs,
    expectedIndex,
    maxIndex,
    numerator,
    denominator,
    value: numerator / denominator
  };
}

export function fowlkesMallowsIndexFromPairs(stats: PairStats): FowlkesMallowsResult {
  const precisionDenominator = stats.tp + stats.fp;
  const recallDenominator = stats.tp + stats.fn;
  const denominator = Math.sqrt(precisionDenominator * recallDenominator);

  return {
    pairPrecision: precisionDenominator === 0 ? null : stats.tp / precisionDenominator,
    pairRecall: recallDenominator === 0 ? null : stats.tp / recallDenominator,
    numerator: stats.tp,
    denominator,
    value: denominator === 0 ? null : stats.tp / denominator
  };
}

export function fowlkesMallowsIndexFromExamples(items: readonly ClusterItem[]): FowlkesMallowsResult {
  return fowlkesMallowsIndexFromPairs(pairStatsFromExamples(items));
}

export function formatClusteringMetric(value: number | null, locale: Locale): string {
  if (value === null || Number.isNaN(value)) return locale === "en" ? "not available" : "不可用";
  return Number(value.toFixed(3)).toString();
}

export function labelName(label: string, locale: Locale): string {
  const names: Record<string, Record<Locale, string>> = {
    graph: { en: "graph", zh: "图（graph）" },
    tree: { en: "tree", zh: "树（tree）" },
    hash: { en: "hash", zh: "哈希（hash）" }
  };
  return names[label]?.[locale] ?? label;
}
