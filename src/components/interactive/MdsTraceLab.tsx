import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { MdsFigureStyles } from "./MdsFigure";
import {
  formatMdsNumber,
  getMdsItem,
  mapDistance,
  mdsLayouts,
  mdsPairs,
  mdsTraceSteps,
  pairLabel,
  residualMeaning,
  residualRows,
  stress,
  type MdsLayoutId
} from "./mdsTrace";

type LabMode = "full" | "naive";

const labels = {
  en: {
    fullTitle: "MDS trace lab",
    naiveTitle: "Naive placement trace",
    previous: "Previous step",
    next: "Next step",
    reset: "Reset trace",
    step: "Step",
    stress: "Total stress",
    target: "Target",
    map: "Map",
    residual: "Residual",
    squared: "Squared contribution",
    controls: "Trace controls"
  },
  zh: {
    fullTitle: "MDS 追踪实验室",
    naiveTitle: "朴素摆点追踪",
    previous: "上一步",
    next: "下一步",
    reset: "重置追踪",
    step: "步骤",
    stress: "总 stress",
    target: "目标",
    map: "地图",
    residual: "残差",
    squared: "平方贡献",
    controls: "追踪控制"
  }
};

function canvasPoint(layoutId: MdsLayoutId, itemId: string) {
  const point = mdsLayouts[layoutId].find((candidate) => candidate.itemId === itemId);
  if (!point) return { x: 0, y: 0 };
  return {
    x: 52 + point.x * 78,
    y: 232 - point.y * 66
  };
}

function LayoutMap({
  lang,
  layoutId,
  highlightedPairIds
}: {
  lang: Locale;
  layoutId: MdsLayoutId;
  highlightedPairIds: readonly string[];
}) {
  const highlighted = new Set(highlightedPairIds);
  return (
    <svg className="mds-map" viewBox="0 0 380 280" role="img" aria-label={lang === "en" ? "Current MDS layout with highlighted pair distances" : "当前 MDS 布局与高亮样本对距离"}>
      <rect x="24" y="24" width="332" height="224" rx="8" fill="#f8fbff" stroke="#c8d7e8" />
      <line x1="42" y1="226" x2="332" y2="226" stroke="#94a3b8" />
      <line x1="54" y1="48" x2="54" y2="236" stroke="#94a3b8" />
      <text x="236" y="258">{lang === "en" ? "layout x" : "布局 x"}</text>
      <text x="10" y="66" transform="rotate(-90 10 66)">
        {lang === "en" ? "layout y" : "布局 y"}
      </text>
      {mdsPairs
        .filter((pair) => highlighted.has(pair.id))
        .map((pair) => {
          const a = canvasPoint(layoutId, pair.a);
          const b = canvasPoint(layoutId, pair.b);
          return (
            <g key={pair.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mds-pair-line" />
              <text x={(a.x + b.x) / 2 + 6} y={(a.y + b.y) / 2 - 6} className="mds-line-label">
                {formatMdsNumber(mapDistance(layoutId, pair), lang, 1)}
              </text>
            </g>
          );
        })}
      {mdsLayouts[layoutId].map((point) => {
        const xy = canvasPoint(layoutId, point.itemId);
        return (
          <g key={point.itemId}>
            <circle cx={xy.x} cy={xy.y} r="9" fill="#2f6fbd" stroke="#ffffff" strokeWidth="2" />
            <text x={xy.x + 12} y={xy.y + 5}>
              {getMdsItem(point.itemId).label[lang]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ResidualTable({ lang, layoutId, pairIds }: { lang: Locale; layoutId: MdsLayoutId; pairIds: readonly string[] }) {
  const rows = residualRows(layoutId).filter((row) => pairIds.includes(row.id));
  return (
    <div className="mds-table-scroll">
      <table className="mds-table compact">
        <caption>{lang === "en" ? "Selected pair residuals" : "选中样本对残差"}</caption>
        <thead>
          <tr>
            <th scope="col">{lang === "en" ? "Pair" : "样本对"}</th>
            <th scope="col">{labels[lang].target}</th>
            <th scope="col">{labels[lang].map}</th>
            <th scope="col">{labels[lang].residual}</th>
            <th scope="col">{labels[lang].squared}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{pairLabel(row, lang)}</th>
              <td>{formatMdsNumber(row.targetDistance, lang, 1)}</td>
              <td>{formatMdsNumber(row.mapDistance, lang, 2)}</td>
              <td>
                {row.residual > 0 ? "+" : ""}{formatMdsNumber(row.residual, lang, 2)}
                <br />
                {residualMeaning(row.residual, lang)}
              </td>
              <td>{formatMdsNumber(row.squaredContribution, lang, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MdsTraceLab({ lang, mode = "full" }: { lang: Locale; mode?: LabMode }) {
  const steps = useMemo(() => (mode === "naive" ? mdsTraceSteps.slice(0, 4) : mdsTraceSteps), [mode]);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <figure className="mds-lab" aria-label={mode === "naive" ? labels[lang].naiveTitle : labels[lang].fullTitle}>
      <figcaption>
        <span>{mode === "naive" ? labels[lang].naiveTitle : labels[lang].fullTitle}</span>
        {lang === "en"
          ? "A deterministic trace using the same Library, Lab, Cafe, Dorm, and Gym fixture as the table."
          : "这个确定性追踪使用与距离表相同的图书馆、实验室、咖啡馆、宿舍、体育馆示例。"}
      </figcaption>
      <div className="mds-two-column">
        <LayoutMap lang={lang} layoutId={step.layoutId} highlightedPairIds={step.highlightedPairIds} />
        <div className="mds-stack">
          <article className="mds-card good" aria-live="polite">
            <strong>{`${labels[lang].step} ${stepIndex + 1}/${steps.length}: ${step.title[lang]}`}</strong>
            <p>{step.explanation[lang]}</p>
          </article>
          <article className={step.layoutId === "naive" ? "mds-card warn" : "mds-card good"}>
            <strong>{labels[lang].stress}</strong>
            <output>{formatMdsNumber(stress(step.layoutId), lang, 2)}</output>
            <p>
              {lang === "en"
                ? "Every candidate layout is judged against the same fixed table D."
                : "每个候选布局都针对同一张固定表 D 打分。"}
            </p>
          </article>
        </div>
      </div>
      <ResidualTable lang={lang} layoutId={step.layoutId} pairIds={step.highlightedPairIds} />
      <div className="mds-controls" role="group" aria-label={labels[lang].controls}>
        <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
          {labels[lang].previous}
        </button>
        <button type="button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={stepIndex === steps.length - 1}>
          {labels[lang].next}
        </button>
        <button type="button" onClick={() => setStepIndex(0)}>
          {labels[lang].reset}
        </button>
      </div>
      <MdsFigureStyles />
      <style>{`
        .mds-controls {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
          margin-top: .85rem;
        }
        .mds-controls button {
          padding: .52rem .72rem;
          border: 1px solid #2f6fbd;
          border-radius: 6px;
          background: #eef6ff;
          color: #17365d;
          font-weight: 800;
        }
        .mds-controls button:disabled {
          opacity: .48;
        }
        .mds-controls button:focus-visible {
          outline: 3px solid #d97706;
          outline-offset: 2px;
        }
      `}</style>
    </figure>
  );
}
