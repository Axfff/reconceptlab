import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  centerPcaPoints,
  formatPcaNumber,
  normalizeAngle,
  principalComponents2d,
  projectOntoDirection,
  varianceAlongDirection
} from "./pcaTrace";

const copy = {
  en: {
    title: "Variance sweep",
    angle: "candidate direction",
    previous: "Rotate left",
    next: "Rotate right",
    pc1: "Jump to PC1",
    reset: "Reset",
    variance: "projected variance",
    badge: "PC1 maximum",
    note: "PCA tests unit directions and chooses the one whose projected coordinates are most spread out.",
    aria: "Sweep PCA candidate directions and read projected variance"
  },
  zh: {
    title: "方差扫描",
    angle: "候选方向",
    previous: "向左旋转",
    next: "向右旋转",
    pc1: "跳到 PC1",
    reset: "重置",
    variance: "投影方差",
    badge: "PC1 最大值",
    note: "PCA 测试单位方向，并选择投影坐标最分散的那一条。",
    aria: "扫描 PCA 候选方向并读取投影方差"
  }
};

function sx(x: number) {
  return 160 + x * 8;
}

function sy(y: number) {
  return 126 - y * 5;
}

function svgNumber(value: number) {
  return Number(value.toFixed(3));
}

export default function PcaVarianceSweep({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const [pc1] = principalComponents2d();
  const [degrees, setDegrees] = useState(Math.round(pc1.angleDegrees));
  const variance = varianceAlongDirection(undefined, degrees);
  const pc1Variance = pc1.eigenvalue;
  const centered = centerPcaPoints();
  const radians = (normalizeAngle(degrees) * Math.PI) / 180;
  const direction = useMemo(() => ({ x: svgNumber(Math.cos(radians)), y: svgNumber(Math.sin(radians)) }), [radians]);
  const nearPc1 = Math.abs(normalizeAngle(degrees - pc1.angleDegrees)) < 1 || Math.abs(normalizeAngle(pc1.angleDegrees - degrees)) < 1;

  function rotate(delta: number) {
    setDegrees((value) => Math.round(normalizeAngle(value + delta)));
  }

  return (
    <section className="circuit-sat-demo" aria-label={labels.aria}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <label className="circuit-sat-slider">
          <span>{labels.angle}</span>
          <input
            type="range"
            min="0"
            max="179"
            value={degrees}
            onChange={(event) => setDegrees(Number(event.currentTarget.value))}
            aria-label={labels.angle}
          />
          <output>{`${formatPcaNumber(degrees, lang, 0)}°`}</output>
        </label>
        <div className="controls">
          <button type="button" onClick={() => rotate(-5)}>
            {labels.previous}
          </button>
          <button type="button" onClick={() => rotate(5)}>
            {labels.next}
          </button>
          <button type="button" onClick={() => setDegrees(Math.round(pc1.angleDegrees))}>
            {labels.pc1}
          </button>
          <button type="button" onClick={() => setDegrees(0)}>
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">
          {`${labels.variance}: ${formatPcaNumber(variance, lang, 2)} / ${formatPcaNumber(pc1Variance, lang, 2)} ${nearPc1 ? labels.badge : ""}`}
        </p>
        <p>{labels.note}</p>
      </div>
      <div className="pnp-card-grid">
        <article className={`pnp-card ${nearPc1 ? "accept" : ""}`}>
          <svg viewBox="0 0 340 250" role="img" aria-label={labels.aria}>
            <rect x="18" y="18" width="304" height="210" rx="8" fill="var(--surface)" stroke="var(--line)" />
            <line x1="36" y1={sy(0)} x2="306" y2={sy(0)} stroke="var(--line)" />
            <line x1={sx(0)} y1="32" x2={sx(0)} y2="218" stroke="var(--line)" />
            <line
              x1={svgNumber(sx(-direction.x * 18))}
              y1={svgNumber(sy(-direction.y * 18))}
              x2={svgNumber(sx(direction.x * 18))}
              y2={svgNumber(sy(direction.y * 18))}
              stroke={nearPc1 ? "var(--rcl-accent)" : "var(--rcl-secondary)"}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {centered.map((point) => {
              const coordinate = projectOntoDirection(point, direction);
              const shadow = { x: svgNumber(coordinate * direction.x), y: svgNumber(coordinate * direction.y) };
              return (
                <g key={point.id}>
                  <line
                    x1={svgNumber(sx(point.x))}
                    y1={svgNumber(sy(point.y))}
                    x2={svgNumber(sx(shadow.x))}
                    y2={svgNumber(sy(shadow.y))}
                    stroke="var(--muted)"
                    strokeDasharray="4 4"
                  />
                  <circle cx={svgNumber(sx(shadow.x))} cy={svgNumber(sy(shadow.y))} r="4" fill="var(--rcl-secondary)" stroke="var(--rcl-secondary)" />
                  <circle className="accept" cx={svgNumber(sx(point.x))} cy={svgNumber(sy(point.y))} r="7" />
                  <text x={svgNumber(sx(point.x) + 10)} y={svgNumber(sy(point.y) + 4)}>{point.label}</text>
                </g>
              );
            })}
          </svg>
        </article>
        <article className="pnp-card">
          <strong>{nearPc1 ? labels.badge : labels.angle}</strong>
          <output>{formatPcaNumber(variance, lang, 2)}</output>
          <p>{labels.variance}</p>
        </article>
      </div>
    </section>
  );
}
