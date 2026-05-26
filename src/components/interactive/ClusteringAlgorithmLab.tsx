import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  clusteringAlgorithmCopy,
  emTrace,
  formatClusterNumber,
  kMeansTrace,
  type ClusteringAlgorithmId
} from "./clusteringAlgorithmTrace";

const copy = {
  en: {
    title: "Clustering algorithm trace lab",
    algorithm: "Algorithm",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    step: "Step",
    visibleState: "Visible state"
  },
  zh: {
    title: "聚类算法轨迹实验台",
    algorithm: "算法",
    previous: "上一步",
    next: "下一步",
    reset: "重置",
    step: "步骤",
    visibleState: "可见状态"
  }
};

const algorithmIds: ClusteringAlgorithmId[] = ["k-means", "k-medoids", "dbscan", "optics", "hdbscan", "em-for-gmm"];

function stepsForAlgorithm(id: ClusteringAlgorithmId, lang: Locale) {
  if (id === "k-means") {
    return kMeansTrace().map((step) => ({
      id: step.id,
      label: step.phase,
      explanation: step.explanation[lang],
      values: [
        ["centers", step.centers.map((center) => `${center.id}=(${formatClusterNumber(center.x, lang)}, ${formatClusterNumber(center.y, lang)})`).join("; ")],
        ["changed points", Object.entries(step.assignments).map(([point, cluster]) => `${point}->${cluster}`).join(", ")]
      ]
    }));
  }

  if (id === "em-for-gmm") {
    return emTrace().map((step) => ({
      id: step.id,
      label: step.id,
      explanation: step.explanation[lang],
      values: [
        [lang === "en" ? "means" : "均值", step.means.map((mean) => formatClusterNumber(mean, lang)).join(", ")],
        [lang === "en" ? "weights" : "权重", step.weights.map((weight) => formatClusterNumber(weight, lang)).join(", ")]
      ]
    }));
  }

  const staticSteps: Record<Exclude<ClusteringAlgorithmId, "k-means" | "em-for-gmm">, { label: Record<Locale, string>; explanation: Record<Locale, string>; values: string[][] }[]> = {
    "k-medoids": [
      {
        label: { en: "pick medoids", zh: "选择中心点" },
        explanation: { en: "Centers must be existing examples, not averaged coordinates.", zh: "中心必须是真实样本，而不是平均坐标。" },
        values: [["candidate", "a2, b2, c2"]]
      },
      {
        label: { en: "test swaps", zh: "测试交换" },
        explanation: { en: "A swap is accepted only if total distance to medoids falls.", zh: "只有总距离下降时才接受交换。" },
        values: [["repair", "reject out as a medoid"]]
      }
    ],
    dbscan: [
      {
        label: { en: "find core points", zh: "寻找核心点" },
        explanation: { en: "A point is core when its epsilon-neighborhood has at least minPts points.", zh: "epsilon 邻域中至少有 minPts 个点时，该点是核心点。" },
        values: [["epsilon", "0.9"], ["minPts", "3"]]
      },
      {
        label: { en: "expand density", zh: "扩张密度" },
        explanation: { en: "Core points connected through neighborhoods form clusters; isolated points stay noise.", zh: "通过邻域连通的核心点形成簇；孤立点保持为噪声。" },
        values: [["clusters", "A, B"], ["noise", "p9, p10"]]
      }
    ],
    optics: [
      {
        label: { en: "order by reachability", zh: "按可达性排序" },
        explanation: { en: "Low reachability runs become valleys; big jumps mark sparse gaps.", zh: "低可达距离形成低谷；大跳跃标记稀疏间隔。" },
        values: [["valleys", "A then B"]]
      }
    ],
    hdbscan: [
      {
        label: { en: "sweep density levels", zh: "扫描密度层级" },
        explanation: { en: "Clusters split as the density requirement becomes stricter.", zh: "密度要求变严格时，簇会分裂。" },
        values: [["stable branches", "A, B"]]
      },
      {
        label: { en: "condense tree", zh: "压缩层级树" },
        explanation: { en: "Short-lived branches become noise or substructure; stable branches are selected.", zh: "短命分支成为噪声或子结构；稳定分支被选出。" },
        values: [["selected", "A, B"]]
      }
    ]
  };

  return staticSteps[id].map((step, index) => ({
    id: `${id}-${index}`,
    label: step.label[lang],
    explanation: step.explanation[lang],
    values: step.values
  }));
}

export default function ClusteringAlgorithmLab({
  lang,
  initialAlgorithm = "k-means"
}: {
  lang: Locale;
  initialAlgorithm?: ClusteringAlgorithmId;
}) {
  const labels = copy[lang];
  const [activeId, setActiveId] = useState<ClusteringAlgorithmId>(initialAlgorithm);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => stepsForAlgorithm(activeId, lang), [activeId, lang]);
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)] ?? steps[0];

  function chooseAlgorithm(id: ClusteringAlgorithmId) {
    setActiveId(id);
    setStepIndex(0);
  }

  return (
    <section className="circuit-sat-demo" aria-label={labels.title}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="circuit-sat-row-grid">
          {algorithmIds.map((id) => (
            <button
              key={id}
              type="button"
              className={id === activeId ? "active" : ""}
              onClick={() => chooseAlgorithm(id)}
              aria-pressed={id === activeId}
              aria-label={`${labels.algorithm}: ${clusteringAlgorithmCopy[id].label[lang]}`}
            >
              {clusteringAlgorithmCopy[id].label[lang]}
            </button>
          ))}
        </div>
        <div className="controls">
          <button type="button" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
            {labels.previous}
          </button>
          <button type="button" onClick={() => setStepIndex(Math.min(steps.length - 1, stepIndex + 1))} disabled={stepIndex >= steps.length - 1}>
            {labels.next}
          </button>
          <button type="button" onClick={() => setStepIndex(0)}>
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">{`${labels.step} ${stepIndex + 1}/${steps.length}: ${activeStep.explanation}`}</p>
      </div>
      <div className="pnp-card-grid">
        <article className="pnp-card accept">
          <strong>{activeStep.label}</strong>
          <p>{clusteringAlgorithmCopy[activeId].short[lang]}</p>
        </article>
        {activeStep.values.map(([label, value]) => (
          <article key={label} className="pnp-card">
            <strong>{label}</strong>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
