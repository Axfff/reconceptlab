import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { centerPcaPoints, formatPcaNumber, pcaMean, pcaPoints } from "./pcaTrace";

const copy = {
  en: {
    title: "Centering toggle",
    raw: "Raw",
    centered: "Centered",
    reset: "Reset",
    current: "current mean",
    mean: "mean vector",
    after: "mean after centering",
    note: "Centering moves the cloud so PCA measures spread around the middle instead of distance from the origin.",
    aria: "Toggle between raw PCA fixture points and centered points"
  },
  zh: {
    title: "中心化切换",
    raw: "原始",
    centered: "中心化",
    reset: "重置",
    current: "当前均值",
    mean: "均值向量",
    after: "中心化后均值",
    note: "中心化把点云移到均值附近，让 PCA 测量围绕中间的扩散，而不是离原点有多远。",
    aria: "在原始 PCA 样例点和中心化点之间切换"
  }
};

function rawSx(x: number) {
  return 32 + (x - 152) * 10;
}

function rawSy(y: number) {
  return 216 - (y - 150) * 5;
}

function centeredSx(x: number) {
  return 170 + x * 9;
}

function centeredSy(y: number) {
  return 126 - y * 5;
}

export default function PcaCenteringFigure({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const [centered, setCentered] = useState(false);
  const mean = pcaMean();
  const centeredPoints = centerPcaPoints();
  const currentMean = centered ? { x: 0, y: 0 } : mean;
  const afterCenteringMean = { x: 0, y: 0 };
  const points = centered
    ? centeredPoints.map((point) => ({ id: point.id, label: point.label, x: point.x, y: point.y }))
    : pcaPoints.map((point) => ({ id: point.id, label: point.label, x: point.height, y: point.armSpan }));
  const sx = centered ? centeredSx : rawSx;
  const sy = centered ? centeredSy : rawSy;

  return (
    <section className="circuit-sat-demo" aria-label={labels.aria}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="controls">
          <button type="button" onClick={() => setCentered(false)} aria-pressed={!centered} disabled={!centered}>
            {labels.raw}
          </button>
          <button type="button" onClick={() => setCentered(true)} aria-pressed={centered} disabled={centered}>
            {labels.centered}
          </button>
          <button type="button" onClick={() => setCentered(false)}>
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">
          {`${labels.mean}: (${formatPcaNumber(mean.x, lang, 1)}, ${formatPcaNumber(mean.y, lang, 1)}); ${labels.current}: (${formatPcaNumber(currentMean.x, lang, 1)}, ${formatPcaNumber(currentMean.y, lang, 1)}); ${labels.after}: (${formatPcaNumber(afterCenteringMean.x, lang, 1)}, ${formatPcaNumber(afterCenteringMean.y, lang, 1)})`}
        </p>
        <p>{labels.note}</p>
      </div>
      <div className="pnp-card-grid">
        <article className="pnp-card">
          <svg viewBox="0 0 340 250" role="img" aria-label={labels.aria}>
            <rect x="18" y="18" width="304" height="210" rx="8" fill="var(--surface)" stroke="var(--line)" />
            <line x1="34" y1={centered ? centeredSy(0) : rawSy(150)} x2="304" y2={centered ? centeredSy(0) : rawSy(150)} stroke="var(--line)" />
            <line x1={centered ? centeredSx(0) : rawSx(152)} y1="32" x2={centered ? centeredSx(0) : rawSx(152)} y2="218" stroke="var(--line)" />
            {!centered ? (
              <g>
                <circle cx={rawSx(mean.x)} cy={rawSy(mean.y)} r="9" fill="var(--rcl-secondary-soft)" stroke="var(--rcl-secondary)" strokeWidth="3" />
                <text x={rawSx(mean.x) + 12} y={rawSy(mean.y) + 4}>{lang === "en" ? "mean" : "均值"}</text>
              </g>
            ) : null}
            {points.map((point) => (
              <g key={point.id}>
                <circle className="accept" cx={sx(point.x)} cy={sy(point.y)} r="7" />
                <text x={sx(point.x) + 10} y={sy(point.y) + 4}>{point.label}</text>
              </g>
            ))}
          </svg>
        </article>
      </div>
    </section>
  );
}
