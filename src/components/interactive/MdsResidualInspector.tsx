import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { MdsFigureStyles } from "./MdsFigure";
import {
  formatMdsNumber,
  getMdsItem,
  mdsLayouts,
  mdsPairs,
  pairLabel,
  residualMeaning,
  residualRows
} from "./mdsTrace";

const labels = {
  en: {
    title: "Residual inspector",
    summary: "Select a pair and inspect how the lower-stress map still distorts it.",
    pair: "Pair",
    target: "Target distance d_ij",
    map: "Map distance delta_ij",
    residual: "Residual r_ij",
    squared: "Squared contribution",
    meaning: "Interpretation",
    invariant: "Invariant",
    invariantText: "Every candidate layout is scored against the same fixed D. Lower stress means better fit to this objective, not proof of globally optimal coordinates or true original axes."
  },
  zh: {
    title: "残差检查器",
    summary: "选择一个样本对，查看较低 stress 地图仍然怎样扭曲它。",
    pair: "样本对",
    target: "目标距离 d_ij",
    map: "地图距离 delta_ij",
    residual: "残差 r_ij",
    squared: "平方贡献",
    meaning: "解释",
    invariant: "不变量",
    invariantText: "每个候选布局都针对同一张固定 D 打分。较低 stress 表示更符合这个目标，不证明坐标全局最优，也不证明坐标轴是真实原始特征。"
  }
};

function canvasPoint(itemId: string) {
  const point = mdsLayouts.improved.find((candidate) => candidate.itemId === itemId);
  if (!point) return { x: 0, y: 0 };
  return {
    x: 52 + point.x * 78,
    y: 232 - point.y * 66
  };
}

function InspectorMap({ lang, pairId }: { lang: Locale; pairId: string }) {
  const pair = mdsPairs.find((candidate) => candidate.id === pairId) ?? mdsPairs[0];
  const a = canvasPoint(pair.a);
  const b = canvasPoint(pair.b);
  return (
    <svg className="mds-map" viewBox="0 0 380 280" role="img" aria-label={lang === "en" ? "Improved MDS layout with selected residual pair" : "带选中残差样本对的改进 MDS 布局"}>
      <rect x="24" y="24" width="332" height="224" rx="8" fill="#f8fbff" stroke="#c8d7e8" />
      <line x1="42" y1="226" x2="332" y2="226" stroke="#94a3b8" />
      <line x1="54" y1="48" x2="54" y2="236" stroke="#94a3b8" />
      <text x="236" y="258">{lang === "en" ? "layout x" : "布局 x"}</text>
      <text x="10" y="66" transform="rotate(-90 10 66)">
        {lang === "en" ? "layout y" : "布局 y"}
      </text>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mds-pair-line" />
      <text x={(a.x + b.x) / 2 + 6} y={(a.y + b.y) / 2 - 6} className="mds-line-label">
        {pairLabel(pair, lang)}
      </text>
      {mdsLayouts.improved.map((point) => {
        const xy = canvasPoint(point.itemId);
        const selected = pair.a === point.itemId || pair.b === point.itemId;
        return (
          <g key={point.itemId}>
            <circle
              cx={xy.x}
              cy={xy.y}
              r={selected ? 11 : 8}
              fill={selected ? "#d97706" : "#2f6fbd"}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text x={xy.x + 12} y={xy.y + 5}>
              {getMdsItem(point.itemId).label[lang]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function MdsResidualInspector({ lang }: { lang: Locale }) {
  const [pairId, setPairId] = useState("dorm-gym");
  const rows = useMemo(() => residualRows("improved"), []);
  const row = rows.find((candidate) => candidate.id === pairId) ?? rows[0];

  return (
    <figure className="mds-inspector">
      <figcaption>
        <span>{labels[lang].title}</span>
        {labels[lang].summary}
      </figcaption>
      <label className="mds-select-label">
        <span>{labels[lang].pair}</span>
        <select value={pairId} onChange={(event) => setPairId(event.currentTarget.value)}>
          {rows.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {pairLabel(candidate, lang)}
            </option>
          ))}
        </select>
      </label>
      <div className="mds-two-column">
        <InspectorMap lang={lang} pairId={row.id} />
        <div className="mds-card-grid inspector-values" aria-live="polite">
          <article className="mds-card">
            <strong>{labels[lang].target}</strong>
            <output>{formatMdsNumber(row.targetDistance, lang, 2)}</output>
          </article>
          <article className="mds-card">
            <strong>{labels[lang].map}</strong>
            <output>{formatMdsNumber(row.mapDistance, lang, 2)}</output>
          </article>
          <article className={row.residual >= 0 ? "mds-card warn" : "mds-card"}>
            <strong>{labels[lang].residual}</strong>
            <output>{row.residual > 0 ? "+" : ""}{formatMdsNumber(row.residual, lang, 2)}</output>
          </article>
          <article className="mds-card">
            <strong>{labels[lang].squared}</strong>
            <output>{formatMdsNumber(row.squaredContribution, lang, 2)}</output>
          </article>
          <article className="mds-card good">
            <strong>{labels[lang].meaning}</strong>
            <p>{residualMeaning(row.residual, lang)}</p>
          </article>
          <article className="mds-card warn">
            <strong>{labels[lang].invariant}</strong>
            <p>{labels[lang].invariantText}</p>
          </article>
        </div>
      </div>
      <MdsFigureStyles />
      <style>{`
        .mds-select-label {
          display: grid;
          gap: .35rem;
          max-width: 24rem;
          margin-bottom: .85rem;
          color: #17365d;
          font-weight: 800;
        }
        .mds-select-label select {
          padding: .5rem .6rem;
          border: 1px solid #2f6fbd;
          border-radius: 6px;
          background: #ffffff;
          color: #17365d;
          font: inherit;
        }
        .mds-select-label select:focus-visible {
          outline: 3px solid #d97706;
          outline-offset: 2px;
        }
        .inspector-values {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 620px) {
          .inspector-values {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </figure>
  );
}
