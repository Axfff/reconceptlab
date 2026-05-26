import type { Locale } from "../../i18n/locales";
import {
  centerPcaPoints,
  formatPcaNumber,
  pcaMean,
  pcaPoints,
  principalComponents2d,
  projectOntoDirection,
  reconstructionComparisons,
  type PcaPoint
} from "./pcaTrace";

type ScenarioId = "correlated-table" | "drop-column-loss" | "tilted-axis" | "scale-sensitivity";

const text: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "correlated-table": {
    title: { en: "One pattern, two raw columns", zh: "一个模式，两个原始列" },
    summary: {
      en: "The table looks two-dimensional, but the scatter plot shows height and arm span mostly moving together.",
      zh: "表格看起来是二维的，但散点图显示身高和臂展大多一起变化。"
    }
  },
  "drop-column-loss": {
    title: { en: "Dropping a raw column wastes the diagonal", zh: "直接删原始列会浪费斜向信号" },
    summary: {
      en: "A rotated PC1 coordinate keeps the shared movement better than either raw column alone.",
      zh: "旋转后的 PC1 坐标比单独保留任一原始列更能保留共同变化。"
    }
  },
  "tilted-axis": {
    title: { en: "A rotated coordinate is a measured shadow", zh: "旋转坐标就是被测量的影子" },
    summary: {
      en: "Each centered row casts a coordinate onto the PC1 line; the line is computed from covariance, not assumed.",
      zh: "每个中心化后的行都会投影到 PC1 线上；这条线来自协方差计算，不是假设出来的。"
    }
  },
  "scale-sensitivity": {
    title: { en: "Changing units can rotate PC1", zh: "改变单位可能旋转 PC1" },
    summary: {
      en: "PCA is sensitive to feature scaling because larger numeric spread can dominate the covariance.",
      zh: "PCA 对特征尺度敏感，因为数值扩散更大的列会主导协方差。"
    }
  }
};

function sx(x: number) {
  return 160 + x * 8;
}

function sy(y: number) {
  return 130 - y * 5;
}

function rawSx(x: number) {
  return 42 + (x - 154) * 9;
}

function rawSy(y: number) {
  return 218 - (y - 150) * 6;
}

function Scatter({
  points = pcaPoints,
  showPc = true,
  centered = true,
  label,
  ariaLabel
}: {
  points?: readonly PcaPoint[];
  showPc?: boolean;
  centered?: boolean;
  label: string;
  ariaLabel: string;
}) {
  const plotted = centered
    ? centerPcaPoints(points).map((point) => ({ id: point.id, label: point.label, x: point.x, y: point.y }))
    : points.map((point) => ({ id: point.id, label: point.label, x: point.height, y: point.armSpan }));
  const [pc1] = principalComponents2d(points);
  const maxT = 17;
  const plotX = centered ? sx : rawSx;
  const plotY = centered ? sy : rawSy;
  return (
    <svg viewBox="0 0 320 250" role="img" aria-label={ariaLabel}>
      <rect x="18" y="18" width="284" height="200" rx="8" fill="var(--surface)" stroke="var(--line)" />
      <line x1="38" y1={centered ? sy(0) : rawSy(150)} x2="292" y2={centered ? sy(0) : rawSy(150)} stroke="var(--line)" />
      <line x1={centered ? sx(0) : rawSx(154)} y1="34" x2={centered ? sx(0) : rawSx(154)} y2="208" stroke="var(--line)" />
      <text x="38" y="236">{label}</text>
      {showPc && centered ? (
        <>
          <line
            x1={sx(-pc1.x * maxT)}
            y1={sy(-pc1.y * maxT)}
            x2={sx(pc1.x * maxT)}
            y2={sy(pc1.y * maxT)}
            stroke="var(--rcl-secondary)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x={sx(pc1.x * 13) - 8} y={sy(pc1.y * 13) - 8}>PC1</text>
        </>
      ) : null}
      {plotted.map((point) => (
        <g key={point.id}>
          <circle className="accept" cx={plotX(point.x)} cy={plotY(point.y)} r="7" />
          <text x={plotX(point.x) + 10} y={plotY(point.y) + 4}>{point.label}</text>
        </g>
      ))}
    </svg>
  );
}

function CorrelatedTable({ lang }: { lang: Locale }) {
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <table className="pnp-mini-table">
          <caption>{lang === "en" ? "Fixture measurements in original units" : "原始单位中的固定样例"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "person" : "样本"}</th>
              <th>{lang === "en" ? "height" : "身高"}</th>
              <th>{lang === "en" ? "arm span" : "臂展"}</th>
            </tr>
          </thead>
          <tbody>
            {pcaPoints.map((point) => (
              <tr key={point.id}>
                <th scope="row">{point.label}</th>
                <td>{point.height}</td>
                <td>{point.armSpan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <article className="pnp-card">
        <Scatter
          centered={false}
          showPc={false}
          label={lang === "en" ? "raw scatter: shared rise" : "原始散点：身高和臂展一起上升"}
          ariaLabel={lang === "en" ? "Raw PCA fixture scatter plot" : "原始 PCA 样例散点图"}
        />
      </article>
    </div>
  );
}

function DropColumnLoss({ lang }: { lang: Locale }) {
  const comparisons = reconstructionComparisons();
  const maxError = Math.max(...comparisons.map((row) => row.error));
  return (
    <div className="pnp-card-grid">
      {comparisons.slice(0, 3).map((row) => (
        <article key={row.id} className={`pnp-card ${row.id === "keep-pc1" ? "accept" : ""}`}>
          <strong>{row.label[lang]}</strong>
          <output>{formatPcaNumber(row.error, lang, 1)}</output>
          <div aria-hidden="true" style={{ background: "var(--line)", borderRadius: 999, height: 10, marginTop: 8 }}>
            <div
              style={{
                background: row.id === "keep-pc1" ? "var(--rcl-accent)" : "var(--rcl-secondary)",
                borderRadius: 999,
                height: "100%",
                width: `${Math.max(4, (row.error / maxError) * 100)}%`
              }}
            />
          </div>
          <p>{lang === "en" ? `Sum squared reconstruction error. ${row.explanation.en}` : `平方重构误差总和。${row.explanation.zh}`}</p>
        </article>
      ))}
    </div>
  );
}

function TiltedAxis({ lang }: { lang: Locale }) {
  const centered = centerPcaPoints();
  const [pc1] = principalComponents2d();
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <svg viewBox="0 0 360 260" role="img" aria-label={lang === "en" ? "Centered points projected onto PC1" : "中心化点投影到 PC1"}>
          <rect x="18" y="18" width="324" height="218" rx="8" fill="var(--surface)" stroke="var(--line)" />
          <line x1="38" y1={sy(0)} x2="322" y2={sy(0)} stroke="var(--line)" />
          <line x1={sx(0)} y1="34" x2={sx(0)} y2="224" stroke="var(--line)" />
          <line x1={sx(-pc1.x * 18)} y1={sy(-pc1.y * 18)} x2={sx(pc1.x * 18)} y2={sy(pc1.y * 18)} stroke="var(--rcl-secondary)" strokeWidth="4" strokeLinecap="round" />
          <text x={sx(pc1.x * 15)} y={sy(pc1.y * 15) - 8}>PC1</text>
          {centered.map((point) => {
            const coordinate = projectOntoDirection(point, pc1);
            const shadow = { x: coordinate * pc1.x, y: coordinate * pc1.y };
            return (
              <g key={point.id}>
                <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(shadow.x)} y2={sy(shadow.y)} stroke="var(--muted)" strokeDasharray="4 4" />
                <circle cx={sx(shadow.x)} cy={sy(shadow.y)} r="4" fill="var(--rcl-secondary)" stroke="var(--rcl-secondary)" />
                <circle className="accept" cx={sx(point.x)} cy={sy(point.y)} r="7" />
                <text x={sx(point.x) + 10} y={sy(point.y) + 4}>{point.label}</text>
              </g>
            );
          })}
        </svg>
      </article>
      <article className="pnp-card accept">
        <strong>{lang === "en" ? "Computed PC1" : "计算得到的 PC1"}</strong>
        <output>{`${formatPcaNumber(pc1.angleDegrees, lang, 1)}°`}</output>
        <p>
          {lang === "en"
            ? "This is a unit direction chosen by maximum projected variance, visibly diagonal but not forced to 45 degrees."
            : "这是由最大投影方差选出的单位方向，明显是斜向的，但不是强行设为 45 度。"}
        </p>
      </article>
    </div>
  );
}

function ScaleSensitivity({ lang }: { lang: Locale }) {
  const mean = pcaMean();
  const scaledPoints = pcaPoints.map((point) => ({
    ...point,
    armSpan: mean.y + (point.armSpan - mean.y) * 1.8
  }));
  const [originalPc] = principalComponents2d();
  const [scaledPc] = principalComponents2d(scaledPoints);
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <Scatter
          label={`${lang === "en" ? "original units" : "原始单位"}: ${formatPcaNumber(originalPc.angleDegrees, lang, 1)}°`}
          ariaLabel={lang === "en" ? "Original-unit PCA direction" : "原始单位 PCA 方向"}
        />
      </article>
      <article className="pnp-card reject">
        <Scatter
          points={scaledPoints}
          label={`${lang === "en" ? "arm span scaled larger" : "臂展尺度放大"}: ${formatPcaNumber(scaledPc.angleDegrees, lang, 1)}°`}
          ariaLabel={lang === "en" ? "PCA direction after rescaling arm span" : "放大臂展尺度后的 PCA 方向"}
        />
      </article>
    </div>
  );
}

export default function PcaSupportFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const content = text[scenarioId];
  let body;
  if (scenarioId === "correlated-table") body = <CorrelatedTable lang={lang} />;
  else if (scenarioId === "drop-column-loss") body = <DropColumnLoss lang={lang} />;
  else if (scenarioId === "tilted-axis") body = <TiltedAxis lang={lang} />;
  else body = <ScaleSensitivity lang={lang} />;

  return (
    <figure className="circuit-sat-demo">
      <figcaption>
        <span>{content.title[lang]}</span>
        {content.summary[lang]}
      </figcaption>
      {body}
    </figure>
  );
}
