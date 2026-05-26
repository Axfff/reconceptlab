import type { Locale } from "../../i18n/locales";
import {
  formatMdsNumber,
  getMdsItem,
  mapDistance,
  mdsItems,
  mdsLayouts,
  mdsPairs,
  normalizedStress,
  pairLabel,
  residualMeaning,
  residualRows,
  stress,
  type MdsLayoutId,
  type MdsPair
} from "./mdsTrace";

type ScenarioId = "distance-table" | "constraint-conflict" | "stress-bars" | "notation-pipeline" | "cost";

const scenarioText: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "distance-table": {
    title: { en: "A distance table wants to become a map", zh: "距离表想变成一张地图" },
    summary: {
      en: "The input is a symmetric dissimilarity table D, not original feature columns.",
      zh: "输入是对称的不相似度表 D，而不是原始特征列。"
    }
  },
  "constraint-conflict": {
    title: { en: "Pair promises can fight", zh: "成对承诺会互相拉扯" },
    summary: {
      en: "The naive layout satisfies one promise but compresses or stretches others.",
      zh: "朴素布局满足一个承诺，却会压缩或拉长其他承诺。"
    }
  },
  "stress-bars": {
    title: { en: "Stress accumulates pair mismatch", zh: "Stress 累积成对不匹配" },
    summary: {
      en: "Residual convention: map distance - target distance.",
      zh: "残差约定：地图距离 - 目标距离。"
    }
  },
  "notation-pipeline": {
    title: { en: "Symbols follow the reconstruction pipeline", zh: "符号跟着重建流程走" },
    summary: {
      en: "D names the fixed table; Y names the coordinates MDS is searching for.",
      zh: "D 表示固定距离表；Y 表示 MDS 正在寻找的坐标。"
    }
  },
  cost: {
    title: { en: "The work is pairwise", zh: "主要工作都是成对的" },
    summary: {
      en: "A full stress scan touches every unordered pair.",
      zh: "一次完整 stress 扫描会访问每个无序样本对。"
    }
  }
};

function tableDistance(rowId: string, colId: string) {
  if (rowId === colId) return 0;
  const pair = mdsPairs.find(
    (candidate) => (candidate.a === rowId && candidate.b === colId) || (candidate.a === colId && candidate.b === rowId)
  );
  return pair?.targetDistance ?? 0;
}

function canvasPoint(layoutId: MdsLayoutId, itemId: string) {
  const point = mdsLayouts[layoutId].find((candidate) => candidate.itemId === itemId);
  if (!point) return { x: 0, y: 0 };
  return {
    x: 52 + point.x * 78,
    y: 232 - point.y * 66
  };
}

function DistanceTable({ lang }: { lang: Locale }) {
  return (
    <div className="mds-table-scroll">
      <table className="mds-table">
        <caption>
          {lang === "en"
            ? "Campus study-spot dissimilarities D. Symmetric entries repeat the same promise; the diagonal is zero and ignored."
            : "校园学习地点不相似度表 D。对称位置重复同一个承诺；对角线为 0，并在计算中忽略。"}
        </caption>
        <thead>
          <tr>
            <th scope="col">{lang === "en" ? "From / to" : "从 / 到"}</th>
            {mdsItems.map((item) => (
              <th scope="col" key={item.id}>
                {item.label[lang]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mdsItems.map((rowItem) => (
            <tr key={rowItem.id}>
              <th scope="row">{rowItem.label[lang]}</th>
              {mdsItems.map((colItem) => (
                <td key={colItem.id} className={rowItem.id === colItem.id ? "is-diagonal" : ""}>
                  {formatMdsNumber(tableDistance(rowItem.id, colItem.id), lang, 1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyMap({ lang }: { lang: Locale }) {
  return (
    <svg className="mds-map" viewBox="0 0 380 280" role="img" aria-label={lang === "en" ? "Empty two-dimensional map canvas" : "空的二维地图画布"}>
      <rect x="24" y="24" width="332" height="224" rx="8" fill="#f8fbff" stroke="#c8d7e8" />
      <line x1="42" y1="226" x2="332" y2="226" stroke="#94a3b8" />
      <line x1="54" y1="48" x2="54" y2="236" stroke="#94a3b8" />
      <text x="236" y="258">{lang === "en" ? "layout x" : "布局 x"}</text>
      <text x="10" y="66" transform="rotate(-90 10 66)">
        {lang === "en" ? "layout y" : "布局 y"}
      </text>
      <text x="96" y="128" className="mds-muted">
        {lang === "en" ? "MDS must invent coordinates Y" : "MDS 需要发明坐标 Y"}
      </text>
    </svg>
  );
}

function MapPlot({ lang, layoutId, highlightedPairs }: { lang: Locale; layoutId: MdsLayoutId; highlightedPairs: readonly string[] }) {
  const highlightSet = new Set(highlightedPairs);
  return (
    <svg className="mds-map" viewBox="0 0 380 280" role="img" aria-label={lang === "en" ? `${layoutId} MDS layout` : `${layoutId} MDS 布局`}>
      <rect x="24" y="24" width="332" height="224" rx="8" fill="#f8fbff" stroke="#c8d7e8" />
      <line x1="42" y1="226" x2="332" y2="226" stroke="#94a3b8" />
      <line x1="54" y1="48" x2="54" y2="236" stroke="#94a3b8" />
      <text x="236" y="258">{lang === "en" ? "layout x" : "布局 x"}</text>
      <text x="10" y="66" transform="rotate(-90 10 66)">
        {lang === "en" ? "layout y" : "布局 y"}
      </text>
      {mdsPairs
        .filter((pair) => highlightSet.has(pair.id))
        .map((pair) => {
          const a = canvasPoint(layoutId, pair.a);
          const b = canvasPoint(layoutId, pair.b);
          return (
            <g key={pair.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mds-pair-line" />
              <text x={(a.x + b.x) / 2 + 5} y={(a.y + b.y) / 2 - 5} className="mds-line-label">
                {formatMdsNumber(mapDistance(layoutId, pair), lang, 1)}
              </text>
            </g>
          );
        })}
      {mdsLayouts[layoutId].map((point) => {
        const xy = canvasPoint(layoutId, point.itemId);
        const item = getMdsItem(point.itemId);
        return (
          <g key={point.itemId}>
            <circle cx={xy.x} cy={xy.y} r="9" fill="#2f6fbd" stroke="#ffffff" strokeWidth="2" />
            <text x={xy.x + 12} y={xy.y + 5}>
              {item.label[lang]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function renderDistanceTable(lang: Locale) {
  return (
    <div className="mds-two-column">
      <DistanceTable lang={lang} />
      <div>
        <EmptyMap lang={lang} />
        <p className="mds-note">
          {lang === "en"
            ? "Conventions: entries are nonnegative; D is symmetric; only one unordered pair with i < j contributes to stress."
            : "约定：条目非负；D 对称；stress 中每个满足 i < j 的无序样本对只计一次。"}
        </p>
      </div>
    </div>
  );
}

function ConflictCard({ lang, pairId }: { lang: Locale; pairId: string }) {
  const pair = mdsPairs.find((candidate) => candidate.id === pairId) as MdsPair;
  const actual = mapDistance("naive", pair);
  const residual = actual - pair.targetDistance;
  return (
    <article className="mds-card">
      <strong>{pairLabel(pair, lang)}</strong>
      <span>{lang === "en" ? "target" : "目标"}: {formatMdsNumber(pair.targetDistance, lang, 1)}</span>
      <span>{lang === "en" ? "naive map" : "朴素地图"}: {formatMdsNumber(actual, lang, 2)}</span>
      <p>{residualMeaning(residual, lang)} ({residual > 0 ? "+" : ""}{formatMdsNumber(residual, lang, 2)})</p>
    </article>
  );
}

function renderConstraintConflict(lang: Locale) {
  const pairs = ["library-lab", "library-gym", "dorm-gym"];
  return (
    <div className="mds-two-column">
      <MapPlot lang={lang} layoutId="naive" highlightedPairs={pairs} />
      <div className="mds-card-stack">
        {pairs.map((pairId) => <ConflictCard key={pairId} lang={lang} pairId={pairId} />)}
      </div>
    </div>
  );
}

function StressBarRow({ lang, layoutId, pairId }: { lang: Locale; layoutId: MdsLayoutId; pairId: string }) {
  const row = residualRows(layoutId).find((candidate) => candidate.id === pairId);
  if (!row) return null;
  const width = Math.min(100, Math.abs(row.residual) * 58);
  return (
    <tr>
      <th scope="row">{pairLabel(row, lang)}</th>
      <td>{formatMdsNumber(row.targetDistance, lang, 1)}</td>
      <td>{formatMdsNumber(row.mapDistance, lang, 2)}</td>
      <td>
        <span className="mds-residual-label">
          {row.residual > 0 ? "+" : ""}{formatMdsNumber(row.residual, lang, 2)} {residualMeaning(row.residual, lang)}
        </span>
        <span className={row.residual >= 0 ? "mds-bar positive" : "mds-bar negative"} style={{ width: `${width}px` }} />
      </td>
      <td>{formatMdsNumber(row.squaredContribution, lang, 2)}</td>
    </tr>
  );
}

function StressTable({ lang, layoutId, pairIds }: { lang: Locale; layoutId: MdsLayoutId; pairIds: readonly string[] }) {
  return (
    <div className="mds-table-scroll">
      <table className="mds-table compact">
        <caption>
          {layoutId === "naive"
            ? lang === "en" ? "Naive layout residuals" : "朴素布局残差"
            : lang === "en" ? "Lower-stress layout residuals" : "较低 stress 布局残差"}
        </caption>
        <thead>
          <tr>
            <th scope="col">{lang === "en" ? "Pair" : "样本对"}</th>
            <th scope="col">{lang === "en" ? "Target" : "目标"}</th>
            <th scope="col">{lang === "en" ? "Map" : "地图"}</th>
            <th scope="col">{lang === "en" ? "Residual" : "残差"}</th>
            <th scope="col">{lang === "en" ? "Squared" : "平方项"}</th>
          </tr>
        </thead>
        <tbody>
          {pairIds.map((pairId) => <StressBarRow key={`${layoutId}-${pairId}`} lang={lang} layoutId={layoutId} pairId={pairId} />)}
        </tbody>
      </table>
    </div>
  );
}

function renderStressBars(lang: Locale) {
  const pairIds = ["library-gym", "lab-dorm", "cafe-dorm", "dorm-gym"];
  return (
    <div className="mds-stack">
      <p className="mds-note strong">
        {lang === "en"
          ? "residual = map distance - target distance. Positive means too far / overstretched; negative means too close / compressed."
          : "residual = 地图距离 - 目标距离。正值表示太远 / 被拉长；负值表示太近 / 被压缩。"}
      </p>
      <div className="mds-two-column">
        <StressTable lang={lang} layoutId="naive" pairIds={pairIds} />
        <StressTable lang={lang} layoutId="improved" pairIds={pairIds} />
      </div>
      <div className="mds-card-grid">
        <article className="mds-card warn">
          <strong>{lang === "en" ? "Naive stress" : "朴素 stress"}</strong>
          <output>{formatMdsNumber(stress("naive"), lang, 2)}</output>
        </article>
        <article className="mds-card good">
          <strong>{lang === "en" ? "Improved stress" : "改进 stress"}</strong>
          <output>{formatMdsNumber(stress("improved"), lang, 2)}</output>
        </article>
      </div>
    </div>
  );
}

function renderNotationPipeline(lang: Locale) {
  const steps = [
    ["D", lang === "en" ? "fixed pairwise distance table" : "固定成对距离表"],
    ["Y", lang === "en" ? "candidate map coordinates" : "候选地图坐标"],
    ["delta_ij", lang === "en" ? "distance shown by the map" : "地图显示的距离"],
    ["r_ij", lang === "en" ? "signed residual" : "带符号残差"],
    ["stress(Y)", lang === "en" ? "sum of squared mismatches" : "不匹配平方和"]
  ];
  return (
    <ol className="mds-pipeline">
      {steps.map(([symbol, text]) => (
        <li key={symbol}>
          <strong>{symbol}</strong>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}

function renderCost(lang: Locale) {
  const cards = [
    ["D", lang === "en" ? "store/read all pair distances" : "存储 / 读取所有成对距离", "O(n^2)"],
    ["Y", lang === "en" ? "keep n map points in k dimensions" : "保存 n 个 k 维地图点", "O(nk)"],
    ["delta, r", lang === "en" ? "evaluate every unordered pair" : "评估每个无序样本对", "O(n^2 k)"],
    ["T", lang === "en" ? "repeat pairwise work across updates" : "在多次更新中重复成对工作", "T * O(n^2 k)"]
  ];
  return (
    <div className="mds-card-grid">
      {cards.map(([symbol, text, cost]) => (
        <article className="mds-card" key={symbol}>
          <strong>{symbol}</strong>
          <span>{text}</span>
          <output>{cost}</output>
        </article>
      ))}
      <article className="mds-card warn">
        <strong>{lang === "en" ? "Classical MDS note" : "经典 MDS 提醒"}</strong>
        <p>
          {lang === "en"
            ? "A closed-form classical route can require eigendecomposition, which is more expensive than one stress scan."
            : "经典 MDS 的闭式路线可能需要特征分解，这比一次 stress 扫描更昂贵。"}
        </p>
      </article>
      <article className="mds-card good">
        <strong>{lang === "en" ? "Fixture fit" : "示例拟合"}</strong>
        <p>
          {lang === "en" ? "Normalized stress of the improved map: " : "改进地图的归一化 stress："}
          {formatMdsNumber(normalizedStress("improved"), lang, 3)}
        </p>
      </article>
    </div>
  );
}

export function MdsFigureStyles() {
  return (
    <style>{`
      .mds-figure, .mds-lab, .mds-inspector {
        margin: 1.35rem 0;
        padding: 1rem;
        border: 1px solid var(--color-border, #d8e2ef);
        border-radius: 8px;
        background: #ffffff;
      }
      .mds-figure > figcaption, .mds-lab > figcaption, .mds-inspector > figcaption {
        display: grid;
        gap: .25rem;
        margin-bottom: .85rem;
        color: #475569;
      }
      .mds-figure > figcaption span, .mds-lab > figcaption span, .mds-inspector > figcaption span {
        color: #17365d;
        font-weight: 800;
      }
      .mds-two-column {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr);
        gap: 1rem;
        align-items: start;
      }
      .mds-stack, .mds-card-stack {
        display: grid;
        gap: .75rem;
      }
      .mds-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        gap: .75rem;
      }
      .mds-card {
        display: grid;
        gap: .35rem;
        padding: .75rem;
        border: 1px solid #d8e2ef;
        border-radius: 8px;
        background: #f8fbff;
      }
      .mds-card strong {
        color: #17365d;
      }
      .mds-card output {
        font-size: 1.2rem;
        font-weight: 800;
        color: #2f6fbd;
      }
      .mds-card.good {
        border-color: #8cc7a1;
        background: #f2fbf5;
      }
      .mds-card.warn {
        border-color: #f0b27a;
        background: #fff8ed;
      }
      .mds-note {
        margin: .5rem 0 0;
        color: #475569;
      }
      .mds-note.strong {
        margin: 0;
        font-weight: 700;
        color: #17365d;
      }
      .mds-table-scroll {
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .mds-table {
        width: 100%;
        border-collapse: collapse;
        font-size: .92rem;
      }
      .mds-table caption {
        margin-bottom: .45rem;
        color: #475569;
        text-align: left;
      }
      .mds-table th, .mds-table td {
        padding: .45rem .5rem;
        border: 1px solid #d8e2ef;
        text-align: left;
        vertical-align: top;
      }
      .mds-table th {
        background: #eef6ff;
        color: #17365d;
      }
      .mds-table td {
        background: #ffffff;
      }
      .mds-table td.is-diagonal {
        color: #64748b;
        background: #f8fafc;
      }
      .mds-table.compact {
        font-size: .86rem;
      }
      .katex-display {
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: .2rem;
      }
      .katex-display > .katex {
        white-space: nowrap;
      }
      .mds-map {
        width: 100%;
        height: auto;
        min-height: 220px;
      }
      .mds-map text {
        fill: #17365d;
        font-size: 12px;
      }
      .mds-map .mds-muted {
        fill: #64748b;
        font-size: 14px;
      }
      .mds-pair-line {
        stroke: #d97706;
        stroke-width: 3;
        stroke-linecap: round;
      }
      .mds-line-label {
        fill: #9a3412;
        font-weight: 800;
      }
      .mds-residual-label {
        display: block;
        margin-bottom: .25rem;
      }
      .mds-bar {
        display: block;
        min-width: 8px;
        height: .55rem;
        border-radius: 999px;
      }
      .mds-bar.positive {
        background: #d97706;
      }
      .mds-bar.negative {
        background: #2f6fbd;
      }
      .mds-pipeline {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
        gap: .75rem;
        padding: 0;
        list-style: none;
      }
      .mds-pipeline li {
        display: grid;
        gap: .3rem;
        padding: .75rem;
        border: 1px solid #d8e2ef;
        border-radius: 8px;
        background: #f8fbff;
      }
      .mds-pipeline strong {
        color: #2f6fbd;
        font-size: 1.05rem;
      }
      @media (max-width: 820px) {
        .mds-two-column {
          grid-template-columns: 1fr;
        }
        .mds-table {
          font-size: .8rem;
        }
        .mds-table-scroll .mds-table {
          min-width: 34rem;
        }
        .mds-table-scroll .mds-table.compact {
          min-width: 40rem;
        }
        main table:not(.mds-table) {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    `}</style>
  );
}

export default function MdsFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const text = scenarioText[scenarioId];
  let body;

  if (scenarioId === "distance-table") body = renderDistanceTable(lang);
  else if (scenarioId === "constraint-conflict") body = renderConstraintConflict(lang);
  else if (scenarioId === "stress-bars") body = renderStressBars(lang);
  else if (scenarioId === "notation-pipeline") body = renderNotationPipeline(lang);
  else body = renderCost(lang);

  return (
    <figure className="mds-figure">
      <figcaption>
        <span>{text.title[lang]}</span>
        {text.summary[lang]}
      </figcaption>
      {body}
      <MdsFigureStyles />
    </figure>
  );
}
