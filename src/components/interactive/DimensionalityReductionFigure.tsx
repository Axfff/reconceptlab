import type { Locale } from "../../i18n/locales";
import {
  distance3d,
  formatReductionNumber,
  nearestNeighbors,
  pairwiseDistances,
  pcaVarianceSummary,
  reductionCopy,
  reductionPoints,
  studentSimilarity,
  type DimensionalityReductionId
} from "./dimensionalityReductionTrace";

type ScenarioId =
  | "pca-axis"
  | "mds-distance-map"
  | "isomap-geodesic"
  | "lda-qda-boundary"
  | "sne-neighbors"
  | "graph-strip";

const scenarioText: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "pca-axis": {
    title: { en: "Variance becomes a coordinate", zh: "方差变成坐标" },
    summary: {
      en: "PCA rotates the data toward directions that keep as much spread as possible.",
      zh: "PCA 把数据旋转到尽量保留扩散程度的方向上。"
    }
  },
  "mds-distance-map": {
    title: { en: "Distances become a map", zh: "距离变成地图" },
    summary: {
      en: "MDS starts from pairwise distances and searches for a small layout that preserves them.",
      zh: "MDS 从成对距离出发，寻找能保留这些距离的小地图。"
    }
  },
  "isomap-geodesic": {
    title: { en: "Walk along the surface", zh: "沿着表面行走" },
    summary: {
      en: "Isomap replaces straight-line shortcuts with shortest paths on a neighbor graph.",
      zh: "Isomap 用邻居图上的最短路替代直线抄近路。"
    }
  },
  "lda-qda-boundary": {
    title: { en: "Labels change the question", zh: "标签改变问题" },
    summary: {
      en: "LDA searches for a separating projection; QDA keeps separate class shapes and gets a curved boundary.",
      zh: "LDA 寻找分离投影；QDA 保留不同类别形状并得到弯曲边界。"
    }
  },
  "sne-neighbors": {
    title: { en: "Neighborhoods become probabilities", zh: "邻域变成概率" },
    summary: {
      en: "SNE-family methods care most about which points are local neighbors.",
      zh: "SNE 家族方法最关心哪些点是局部邻居。"
    }
  },
  "graph-strip": {
    title: { en: "Dimensionality reduction path", zh: "降维学习路径" },
    summary: {
      en: "Linear projections, distance-preserving maps, supervised discriminants, and neighbor embeddings solve different pains.",
      zh: "线性投影、保距离地图、监督判别和保邻嵌入分别解决不同痛点。"
    }
  }
};

function scaleX(x: number) {
  return 48 + x * 64;
}

function scaleY(y: number) {
  return 220 - y * 52;
}

function PointCloud({ showLine = false }: { showLine?: boolean }) {
  return (
    <svg viewBox="0 0 360 260" role="img" aria-label="Projected point cloud with two labeled classes">
      <rect x="18" y="18" width="324" height="218" rx="8" fill="var(--surface)" stroke="var(--line)" />
      <line x1="34" y1="220" x2="330" y2="220" stroke="var(--line)" />
      <line x1="48" y1="34" x2="48" y2="228" stroke="var(--line)" />
      {showLine ? <line x1="58" y1="194" x2="310" y2="58" stroke="var(--accent-orange)" strokeWidth="4" strokeLinecap="round" /> : null}
      {reductionPoints.map((point) => (
        <g key={point.id}>
          <circle
            cx={scaleX(point.x)}
            cy={scaleY(point.y)}
            r="8"
            className={point.classId === "blue" ? "accept" : "reject"}
          />
          <text x={scaleX(point.x) + 11} y={scaleY(point.y) + 4}>
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ValueCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="pnp-card">
      <strong>{label}</strong>
      <output>{value}</output>
      <p>{note}</p>
    </article>
  );
}

function renderPca(lang: Locale) {
  const summary = pcaVarianceSummary();
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointCloud showLine />
      </article>
      <ValueCard
        label={lang === "en" ? "PC1 variance" : "PC1 方差"}
        value={formatReductionNumber(summary.pc1, lang)}
        note={lang === "en" ? "spread kept by the first direction" : "第一方向保留的扩散"}
      />
      <ValueCard
        label={lang === "en" ? "z variance" : "z 方差"}
        value={formatReductionNumber(summary.z, lang)}
        note={lang === "en" ? "quieter direction that may be dropped" : "可能被丢弃的较安静方向"}
      />
    </div>
  );
}

function renderMds(lang: Locale) {
  const distances = pairwiseDistances();
  const rows = [
    ["A1-A2", distances["a1-a2"]],
    ["A1-B1", distances["a1-b1"]],
    ["B1-B2", distances["b1-b2"]]
  ];
  return (
    <table className="pnp-mini-table">
      <caption>{lang === "en" ? "Sample original-space distances" : "原空间距离样例"}</caption>
      <thead>
        <tr>
          <th>{lang === "en" ? "Pair" : "样本对"}</th>
          <th>{lang === "en" ? "Distance" : "距离"}</th>
          <th>{lang === "en" ? "Layout pressure" : "布局压力"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([pair, distance]) => (
          <tr key={pair}>
            <th scope="row">{pair}</th>
            <td>{formatReductionNumber(distance as number, lang)}</td>
            <td>{(distance as number) < 1 ? (lang === "en" ? "keep close" : "保持接近") : lang === "en" ? "keep apart" : "保持分开"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderIsomap(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      <ValueCard label={lang === "en" ? "Straight shortcut" : "直线捷径"} value="A1 -> B3" note={lang === "en" ? "too eager on a curved surface" : "在弯曲表面上过于冒进"} />
      <ValueCard label={lang === "en" ? "Neighbor walk" : "邻居步行"} value="A1 -> A2 -> A3 -> B1 -> B2 -> B3" note={lang === "en" ? "approximates geodesic distance" : "近似测地距离"} />
      <article className="pnp-card accept">
        <strong>{lang === "en" ? "Repair" : "修补"}</strong>
        <p>{lang === "en" ? "Run MDS on graph shortest paths, not raw straight-line distances." : "对图最短路做 MDS，而不是对原始直线距离做 MDS。"}</p>
      </article>
    </div>
  );
}

function renderLdaQda(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointCloud showLine />
      </article>
      <ValueCard label="LDA" value={lang === "en" ? "one projection" : "一个投影"} note={lang === "en" ? "shared covariance assumption" : "共享协方差假设"} />
      <ValueCard label="QDA" value={lang === "en" ? "curved boundary" : "弯曲边界"} note={lang === "en" ? "separate covariance per class" : "每个类别独立协方差"} />
    </div>
  );
}

function renderSne(lang: Locale) {
  const anchor = reductionPoints[0];
  const neighbors = nearestNeighbors(anchor.id, 3);
  return (
    <div className="pnp-card-grid">
      {neighbors.map((point) => {
        const distance = distance3d(anchor, point);
        return (
          <ValueCard
            key={point.id}
            label={`${anchor.label} -> ${point.label}`}
            value={formatReductionNumber(studentSimilarity(distance), lang)}
            note={lang === "en" ? "low-dimensional neighbor similarity" : "低维邻居相似度"}
          />
        );
      })}
    </div>
  );
}

function renderGraphStrip(lang: Locale) {
  const ids: DimensionalityReductionId[] = ["pca", "mds", "isomap", "lda", "qda", "sne", "t-sne", "umap"];
  return (
    <div className="pnp-card-grid">
      {ids.map((id) => (
        <article key={id} className={`pnp-card ${id === "pca" || id === "umap" ? "accept" : ""}`}>
          <strong>{reductionCopy[id].label[lang]}</strong>
          <p>{reductionCopy[id].short[lang]}</p>
        </article>
      ))}
    </div>
  );
}

export default function DimensionalityReductionFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const text = scenarioText[scenarioId];
  let body;

  if (scenarioId === "pca-axis") body = renderPca(lang);
  else if (scenarioId === "mds-distance-map") body = renderMds(lang);
  else if (scenarioId === "isomap-geodesic") body = renderIsomap(lang);
  else if (scenarioId === "lda-qda-boundary") body = renderLdaQda(lang);
  else if (scenarioId === "sne-neighbors") body = renderSne(lang);
  else body = renderGraphStrip(lang);

  return (
    <figure className="circuit-sat-demo">
      <figcaption>
        <span>{text.title[lang]}</span>
        {text.summary[lang]}
      </figcaption>
      {body}
    </figure>
  );
}
