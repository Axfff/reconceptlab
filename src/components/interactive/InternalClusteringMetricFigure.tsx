import type { Locale } from "../../i18n/locales";
import {
  formatInternalMetric,
  internalClusteringFixture,
  internalClusteringPresets,
  internalMetricsFromPoints,
  type GeometricClusterPoint
} from "./internalClusteringMetricsTrace";

type ScenarioId =
  | "geometry-fixture"
  | "silhouette-point"
  | "ch-scatter"
  | "db-worst-rival"
  | "dunn-extremes"
  | "metric-contrast"
  | "graph-strip";

const text: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "geometry-fixture": {
    title: { en: "Cluster geometry without labels", zh: "没有参考标签的聚类几何" },
    summary: {
      en: "Internal metrics inspect distances and assigned clusters, not answer-key labels.",
      zh: "内部指标查看距离和簇分配，而不是答案标签。"
    }
  },
  "silhouette-point": {
    title: { en: "One point asks two distance questions", zh: "一个点提出两个距离问题" },
    summary: {
      en: "`a(i)` is the average distance inside its cluster; `b(i)` is the nearest other-cluster average.",
      zh: "`a(i)` 是同簇平均距离；`b(i)` 是最近其他簇的平均距离。"
    }
  },
  "ch-scatter": {
    title: { en: "Between scatter versus within scatter", zh: "簇间离散度对簇内离散度" },
    summary: {
      en: "CH rewards centroids that are far from the global center while points stay close to their own centroid.",
      zh: "CH 奖励远离全局中心的簇质心，同时要求点靠近自己的簇质心。"
    }
  },
  "db-worst-rival": {
    title: { en: "Worst neighboring cluster", zh: "最危险的邻居簇" },
    summary: {
      en: "DB asks each cluster which other cluster is most similar after combining spread and centroid distance.",
      zh: "DB 让每个簇找出在离散度和质心距离下最相似的另一个簇。"
    }
  },
  "dunn-extremes": {
    title: { en: "Weakest gap versus widest cluster", zh: "最弱间隔对最宽簇" },
    summary: {
      en: "Dunn uses extremes: closest cross-cluster pair divided by the largest cluster diameter.",
      zh: "Dunn 使用极值：最近跨簇样本对距离除以最大簇直径。"
    }
  },
  "metric-contrast": {
    title: { en: "Internal metric contrast", zh: "内部指标对比" },
    summary: {
      en: "Higher is better for Silhouette, CH, and Dunn; lower is better for DB.",
      zh: "Silhouette、CH 和 Dunn 越高越好；DB 越低越好。"
    }
  },
  "graph-strip": {
    title: { en: "Internal clustering metric path", zh: "内部聚类指标路径" },
    summary: {
      en: "Move from point-level comparison to centroid scatter, worst rivals, and distance extremes.",
      zh: "从点级比较，走向质心离散、最坏邻居和距离极值。"
    }
  }
};

const clusterColor: Record<string, string> = {
  A: "var(--accent-blue)",
  B: "var(--accent-orange)",
  C: "var(--accent-green)"
};

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="circuit-sat-result-card">
      <strong>{label}</strong>
      <output>{value}</output>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function scaleX(point: GeometricClusterPoint | { x: number; y: number }) {
  return 38 + point.x * 36;
}

function scaleY(point: GeometricClusterPoint | { x: number; y: number }) {
  return 270 - point.y * 32;
}

function ScatterPlot({
  points,
  highlightIds = [],
  showCentroids = false
}: {
  points: readonly GeometricClusterPoint[];
  highlightIds?: string[];
  showCentroids?: boolean;
}) {
  const metrics = internalMetricsFromPoints(points);

  return (
    <svg viewBox="0 0 340 300" role="img" aria-label="Cluster scatter plot">
      <rect x="18" y="18" width="304" height="248" rx="8" fill="var(--surface)" stroke="var(--line)" />
      {showCentroids
        ? metrics.summaries.map((summary) => (
            <g key={`centroid-${summary.cluster}`}>
              <line
                x1={scaleX(summary.centroid)}
                y1={scaleY(summary.centroid)}
                x2={170}
                y2={145}
                stroke={clusterColor[summary.cluster] ?? "var(--accent-blue)"}
                strokeDasharray="5 5"
              />
              <rect
                x={scaleX(summary.centroid) - 5}
                y={scaleY(summary.centroid) - 5}
                width="10"
                height="10"
                fill={clusterColor[summary.cluster] ?? "var(--accent-blue)"}
              />
            </g>
          ))
        : null}
      {points.map((point) => {
        const highlighted = highlightIds.includes(point.id);
        return (
          <g key={point.id}>
            <circle
              cx={scaleX(point)}
              cy={scaleY(point)}
              r={highlighted ? 9 : 7}
              fill={clusterColor[point.cluster] ?? "var(--accent-blue)"}
              stroke={highlighted ? "var(--text)" : "var(--surface)"}
              strokeWidth={highlighted ? 3 : 2}
            />
            <text x={scaleX(point) + 10} y={scaleY(point) + 4}>
              {point.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function renderGeometry(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <ScatterPlot points={internalClusteringFixture} />
      </article>
      <article className="pnp-card">
        <strong>{lang === "en" ? "What the metric sees" : "指标能看到什么"}</strong>
        <p>{lang === "en" ? "point coordinates, distances, and cluster ids A/B/C" : "点坐标、距离，以及簇编号 A/B/C"}</p>
      </article>
      <article className="pnp-card reject">
        <strong>{lang === "en" ? "What it does not see" : "指标看不到什么"}</strong>
        <p>{lang === "en" ? "reference labels such as graph/tree/hash" : "graph/tree/hash 这样的参考标签"}</p>
      </article>
    </div>
  );
}

function renderSilhouette(lang: Locale) {
  const result = internalMetricsFromPoints(internalClusteringFixture).silhouette;
  const point = result.points.find((entry) => entry.id === "p2") ?? result.points[0];
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <ScatterPlot points={internalClusteringFixture} highlightIds={[point.id]} />
      </article>
      <MetricCard label="a(i)" value={formatInternalMetric(point.ownAverage, lang)} note={lang === "en" ? "mean distance to own cluster" : "到同簇点的平均距离"} />
      <MetricCard label="b(i)" value={formatInternalMetric(point.nearestOtherAverage, lang)} note={lang === "en" ? `nearest other cluster: ${point.nearestOtherCluster}` : `最近其他簇：${point.nearestOtherCluster}`} />
      <MetricCard label="s(i)" value={formatInternalMetric(point.value, lang)} note="(b - a) / max(a, b)" />
      <MetricCard label={lang === "en" ? "Mean silhouette" : "平均轮廓系数"} value={formatInternalMetric(result.value, lang)} />
    </div>
  );
}

function renderCh(lang: Locale) {
  const metrics = internalMetricsFromPoints(internalClusteringFixture);
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <ScatterPlot points={internalClusteringFixture} showCentroids />
      </article>
      <MetricCard label="B_k" value={formatInternalMetric(metrics.calinskiHarabasz.between, lang)} note={lang === "en" ? "between-cluster scatter" : "簇间离散度"} />
      <MetricCard label="W_k" value={formatInternalMetric(metrics.calinskiHarabasz.within, lang)} note={lang === "en" ? "within-cluster scatter" : "簇内离散度"} />
      <MetricCard label="CH" value={formatInternalMetric(metrics.calinskiHarabasz.value, lang)} note={lang === "en" ? "higher is better" : "越高越好"} />
    </div>
  );
}

function renderDb(lang: Locale) {
  const metrics = internalMetricsFromPoints(internalClusteringFixture);
  return (
    <div className="pnp-card-grid">
      {metrics.daviesBouldin.rows.map((row) => (
        <MetricCard
          key={row.cluster}
          label={`${lang === "en" ? "Cluster" : "簇"} ${row.cluster}`}
          value={formatInternalMetric(row.worstSimilarity, lang)}
          note={lang === "en" ? `worst rival: ${row.worstNeighbor}` : `最危险邻居：${row.worstNeighbor}`}
        />
      ))}
      <MetricCard label="DB" value={formatInternalMetric(metrics.daviesBouldin.value, lang)} note={lang === "en" ? "lower is better" : "越低越好"} />
    </div>
  );
}

function renderDunn(lang: Locale) {
  const metrics = internalMetricsFromPoints(internalClusteringFixture);
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <ScatterPlot points={internalClusteringFixture} highlightIds={metrics.dunn.closestPair ? [...metrics.dunn.closestPair] : []} />
      </article>
      <MetricCard label={lang === "en" ? "Closest cross-cluster pair" : "最近跨簇样本对"} value={metrics.dunn.closestPair?.join(" - ") ?? "-"} />
      <MetricCard label={lang === "en" ? "Minimum gap" : "最小间隔"} value={formatInternalMetric(metrics.dunn.minInterclusterDistance, lang)} />
      <MetricCard label={lang === "en" ? "Widest diameter" : "最大簇直径"} value={formatInternalMetric(metrics.dunn.maxIntraclusterDiameter, lang)} note={metrics.dunn.widestCluster ?? ""} />
      <MetricCard label="Dunn" value={formatInternalMetric(metrics.dunn.value, lang)} note={lang === "en" ? "higher is better" : "越高越好"} />
    </div>
  );
}

function renderMetricContrast(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      {internalClusteringPresets.map((preset) => {
        const metrics = internalMetricsFromPoints(preset.points);
        return (
          <article key={preset.id} className="circuit-sat-result-card">
            <strong>{preset.label[lang]}</strong>
            <p>Silhouette: {formatInternalMetric(metrics.silhouette.value, lang)}</p>
            <p>CH: {formatInternalMetric(metrics.calinskiHarabasz.value, lang)}</p>
            <p>DB: {formatInternalMetric(metrics.daviesBouldin.value, lang)}</p>
            <p>Dunn: {formatInternalMetric(metrics.dunn.value, lang)}</p>
          </article>
        );
      })}
    </div>
  );
}

function renderGraphStrip(lang: Locale) {
  const nodes = [
    { id: "silhouette-score", label: lang === "en" ? "Silhouette" : "轮廓系数" },
    { id: "calinski-harabasz-index", label: lang === "en" ? "Calinski-Harabasz" : "Calinski-Harabasz" },
    { id: "davies-bouldin-index", label: lang === "en" ? "Davies-Bouldin" : "Davies-Bouldin" },
    { id: "dunn-index", label: lang === "en" ? "Dunn" : "Dunn" }
  ];
  return (
    <div className="circuit-sat-graph-strip">
      {nodes.map((node, index) => (
        <div key={node.id}>
          <strong>{index + 1}. {node.label}</strong>
          <p>{node.id}</p>
        </div>
      ))}
    </div>
  );
}

export default function InternalClusteringMetricFigure({
  lang,
  scenarioId
}: {
  lang: Locale;
  scenarioId: ScenarioId;
}) {
  const caption = text[scenarioId];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{caption.title[lang]}</strong>
        <span>{caption.summary[lang]}</span>
      </figcaption>
      {scenarioId === "geometry-fixture" ? renderGeometry(lang) : null}
      {scenarioId === "silhouette-point" ? renderSilhouette(lang) : null}
      {scenarioId === "ch-scatter" ? renderCh(lang) : null}
      {scenarioId === "db-worst-rival" ? renderDb(lang) : null}
      {scenarioId === "dunn-extremes" ? renderDunn(lang) : null}
      {scenarioId === "metric-contrast" ? renderMetricContrast(lang) : null}
      {scenarioId === "graph-strip" ? renderGraphStrip(lang) : null}
    </figure>
  );
}
