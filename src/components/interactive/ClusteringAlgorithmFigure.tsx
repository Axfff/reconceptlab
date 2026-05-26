import type { Locale } from "../../i18n/locales";
import {
  centroidFixture,
  clusteringAlgorithmCopy,
  dbscanParams,
  densityFixture,
  emFixture,
  emTrace,
  formatClusterNumber,
  hdbscanLevels,
  kMeansTrace,
  kMedoidsChoices,
  neighborsWithin,
  opticsRows,
  totalMedoidCost,
  type AlgorithmPoint,
  type Center,
  type ClusteringAlgorithmId
} from "./clusteringAlgorithmTrace";

type ScenarioId =
  | "centroid-loop"
  | "medoid-robustness"
  | "density-neighborhood"
  | "reachability-order"
  | "density-hierarchy"
  | "soft-membership"
  | "algorithm-contrast"
  | "graph-strip";

const scenarioText: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "centroid-loop": {
    title: { en: "Centroids chase assignments", zh: "质心追着分配移动" },
    summary: {
      en: "K-Means alternates nearest-center assignment with mean recomputation.",
      zh: "K-Means 在最近质心分配和均值重算之间交替。"
    }
  },
  "medoid-robustness": {
    title: { en: "Centers can be real points", zh: "中心可以是真实样本点" },
    summary: {
      en: "K-Medoids pays distance to chosen examples, so an outlier center is visibly expensive.",
      zh: "K-Medoids 计算到所选样本的距离，因此离群中心会显得很昂贵。"
    }
  },
  "density-neighborhood": {
    title: { en: "Dense neighborhoods grow clusters", zh: "稠密邻域长成簇" },
    summary: {
      en: "DBSCAN starts from core points, absorbs border points, and leaves sparse points as noise.",
      zh: "DBSCAN 从核心点开始，吸收边界点，并把稀疏点留作噪声。"
    }
  },
  "reachability-order": {
    title: { en: "A density walk, not one epsilon", zh: "一次密度行走，而非单个 epsilon" },
    summary: {
      en: "OPTICS records reachability distances so valleys in the ordering reveal clusters at several scales.",
      zh: "OPTICS 记录可达距离，让排序中的低谷显示多个尺度的簇。"
    }
  },
  "density-hierarchy": {
    title: { en: "Stable branches survive", zh: "稳定分支留下来" },
    summary: {
      en: "HDBSCAN condenses a density hierarchy and favors clusters that persist.",
      zh: "HDBSCAN 压缩密度层级，并偏好持续存在的簇。"
    }
  },
  "soft-membership": {
    title: { en: "Membership can be fractional", zh: "成员关系可以是小数" },
    summary: {
      en: "EM for GMM treats each point as partly explained by each Gaussian, then refits the Gaussians.",
      zh: "GMM 的 EM 让每个点被多个高斯成分部分解释，再重新拟合这些成分。"
    }
  },
  "algorithm-contrast": {
    title: { en: "Which pain does each algorithm repair?", zh: "每个算法修补哪种痛点？" },
    summary: {
      en: "The family splits by center assumptions, density assumptions, hierarchy, and soft probability.",
      zh: "这组算法按中心假设、密度假设、层级和软概率分开。"
    }
  },
  "graph-strip": {
    title: { en: "Clustering algorithm path", zh: "聚类算法路径" },
    summary: {
      en: "Start with centroid partitions, repair center robustness, then move to density and probability.",
      zh: "先从质心划分开始，再修补中心鲁棒性，随后进入密度和概率视角。"
    }
  }
};

const clusterColor: Record<string, string> = {
  C1: "var(--accent-blue)",
  C2: "var(--accent-orange)",
  C3: "var(--accent-green)",
  A: "var(--accent-blue)",
  B: "var(--accent-orange)",
  C: "var(--accent-green)"
};

function scaleX(point: AlgorithmPoint | Center) {
  return 32 + point.x * 36;
}

function scaleY(point: AlgorithmPoint | Center) {
  return 258 - point.y * 34;
}

function PointPlot({
  points,
  assignments = {},
  centers = [],
  highlightIds = []
}: {
  points: readonly AlgorithmPoint[];
  assignments?: Record<string, string>;
  centers?: readonly Center[];
  highlightIds?: readonly string[];
}) {
  return (
    <svg viewBox="0 0 340 285" role="img" aria-label="Cluster point plot">
      <rect x="14" y="14" width="312" height="246" rx="8" fill="var(--surface)" stroke="var(--line)" />
      {points.map((point) => {
        const cluster = assignments[point.id] ?? "C1";
        const highlighted = highlightIds.includes(point.id);
        return (
          <g key={point.id}>
            <circle
              cx={scaleX(point)}
              cy={scaleY(point)}
              r={highlighted ? 9 : 7}
              fill={clusterColor[cluster] ?? "var(--muted)"}
              stroke={highlighted ? "var(--text)" : "var(--surface)"}
              strokeWidth={highlighted ? 3 : 2}
            />
            <text x={scaleX(point) + 10} y={scaleY(point) + 4}>{point.id}</text>
          </g>
        );
      })}
      {centers.map((center) => (
        <g key={center.id}>
          <rect
            x={scaleX(center) - 7}
            y={scaleY(center) - 7}
            width="14"
            height="14"
            fill={clusterColor[center.id] ?? "var(--accent-blue)"}
            stroke="var(--text)"
          />
          <text x={scaleX(center) + 10} y={scaleY(center) - 10}>{center.id}</text>
        </g>
      ))}
    </svg>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="circuit-sat-result-card">
      <strong>{label}</strong>
      <output>{value}</output>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function renderCentroidLoop(lang: Locale) {
  const steps = kMeansTrace();
  const last = steps.at(-1) ?? steps[0];
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointPlot points={centroidFixture} assignments={last.assignments} centers={last.centers} />
      </article>
      {steps.map((step, index) => (
        <MetricCard key={step.id} label={`${index + 1}. ${step.phase}`} value={step.id} note={step.explanation[lang]} />
      ))}
    </div>
  );
}

function renderMedoids(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointPlot points={centroidFixture} highlightIds={["a2", "b2", "c2", "out"]} />
      </article>
      {kMedoidsChoices.map((choice) => (
        <MetricCard
          key={choice.id}
          label={choice.label[lang]}
          value={formatClusterNumber(totalMedoidCost(centroidFixture, choice.medoids), lang)}
          note={`${lang === "en" ? "medoids" : "中心点"}: ${choice.medoids.join(", ")}`}
        />
      ))}
    </div>
  );
}

function renderDensity(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointPlot
          points={densityFixture}
          assignments={Object.fromEntries(densityFixture.map((point) => [point.id, point.cluster === "B" ? "C2" : point.cluster === "A" ? "C1" : "noise"]))}
          highlightIds={["p1", "p4", "p9"]}
        />
      </article>
      <MetricCard label="epsilon" value={formatClusterNumber(dbscanParams.epsilon, lang)} />
      <MetricCard label="minPts" value={String(dbscanParams.minPts)} />
      <MetricCard label={lang === "en" ? "p1 neighbors" : "p1 邻居"} value={neighborsWithin(densityFixture, "p1", dbscanParams.epsilon).join(", ")} note={lang === "en" ? "core point" : "核心点"} />
      <MetricCard label={lang === "en" ? "p9 role" : "p9 角色"} value={lang === "en" ? "noise" : "噪声"} />
    </div>
  );
}

function renderOptics(lang: Locale) {
  return (
    <table className="pnp-mini-table">
      <caption>{lang === "en" ? "OPTICS reachability ordering" : "OPTICS 可达性排序"}</caption>
      <thead>
        <tr>
          <th>{lang === "en" ? "Order" : "顺序"}</th>
          <th>{lang === "en" ? "Point" : "点"}</th>
          <th>{lang === "en" ? "Core dist." : "核心距离"}</th>
          <th>{lang === "en" ? "Reachability" : "可达距离"}</th>
          <th>{lang === "en" ? "Hint" : "提示"}</th>
        </tr>
      </thead>
      <tbody>
        {opticsRows.map((row, index) => (
          <tr key={row.pointId}>
            <td>{index + 1}</td>
            <th scope="row">{row.pointId}</th>
            <td>{formatClusterNumber(row.coreDistance, lang)}</td>
            <td>{formatClusterNumber(row.reachability, lang)}</td>
            <td>{row.clusterHint ?? (lang === "en" ? "gap/noise" : "间隔/噪声")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderHdbscan(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      {hdbscanLevels.map((level) => (
        <article key={level.lambda} className="pnp-card">
          <strong>{`lambda = ${formatClusterNumber(level.lambda, lang)}`}</strong>
          {level.clusters.map((cluster) => (
            <p key={cluster.id}>{`${cluster.id}: ${cluster.points.join(", ")} | stability ${formatClusterNumber(cluster.stability, lang)}`}</p>
          ))}
        </article>
      ))}
    </div>
  );
}

function renderEm(lang: Locale) {
  const steps = emTrace();
  const last = steps.at(-1) ?? steps[0];
  return (
    <div className="pnp-card-grid">
      <MetricCard label={lang === "en" ? "Mean 1" : "均值 1"} value={formatClusterNumber(last.means[0], lang)} />
      <MetricCard label={lang === "en" ? "Mean 2" : "均值 2"} value={formatClusterNumber(last.means[1], lang)} />
      <MetricCard label={lang === "en" ? "Weight 1" : "权重 1"} value={formatClusterNumber(last.weights[0], lang)} />
      <MetricCard label={lang === "en" ? "Weight 2" : "权重 2"} value={formatClusterNumber(last.weights[1], lang)} />
      <table className="pnp-mini-table">
        <caption>{lang === "en" ? "Final soft memberships" : "最终软成员概率"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Point" : "点"}</th>
            <th>x</th>
            <th>{lang === "en" ? "Gaussian 1" : "高斯 1"}</th>
            <th>{lang === "en" ? "Gaussian 2" : "高斯 2"}</th>
          </tr>
        </thead>
        <tbody>
          {emFixture.map((point) => (
            <tr key={point.id}>
              <th scope="row">{point.id}</th>
              <td>{formatClusterNumber(point.x, lang)}</td>
              <td>{formatClusterNumber(last.responsibilities[point.id][0], lang)}</td>
              <td>{formatClusterNumber(last.responsibilities[point.id][1], lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderContrast(lang: Locale) {
  const ids: ClusteringAlgorithmId[] = ["k-means", "k-medoids", "dbscan", "optics", "hdbscan", "em-for-gmm"];
  return (
    <div className="pnp-card-grid">
      {ids.map((id) => (
        <article key={id} className="pnp-card">
          <strong>{clusteringAlgorithmCopy[id].label[lang]}</strong>
          <p>{clusteringAlgorithmCopy[id].short[lang]}</p>
        </article>
      ))}
    </div>
  );
}

function renderGraphStrip(lang: Locale) {
  const nodes: ClusteringAlgorithmId[] = ["k-means", "k-medoids", "dbscan", "optics", "hdbscan", "em-for-gmm"];
  return (
    <div className="circuit-sat-graph-strip">
      {nodes.map((id, index) => (
        <div key={id}>
          <strong>{index + 1}. {clusteringAlgorithmCopy[id].label[lang]}</strong>
          <p>{id}</p>
        </div>
      ))}
    </div>
  );
}

export default function ClusteringAlgorithmFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const caption = scenarioText[scenarioId];
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{caption.title[lang]}</strong>
        <span>{caption.summary[lang]}</span>
      </figcaption>
      {scenarioId === "centroid-loop" ? renderCentroidLoop(lang) : null}
      {scenarioId === "medoid-robustness" ? renderMedoids(lang) : null}
      {scenarioId === "density-neighborhood" ? renderDensity(lang) : null}
      {scenarioId === "reachability-order" ? renderOptics(lang) : null}
      {scenarioId === "density-hierarchy" ? renderHdbscan(lang) : null}
      {scenarioId === "soft-membership" ? renderEm(lang) : null}
      {scenarioId === "algorithm-contrast" ? renderContrast(lang) : null}
      {scenarioId === "graph-strip" ? renderGraphStrip(lang) : null}
    </figure>
  );
}
