import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { bPlusTreeFixture, leafSplitTrace, rangeTraces, type BPlusRangeCaseId } from "./bPlusTreeTrace";
import { BPlusTreeStyles } from "./BPlusTreeAnatomyFigure";

const labels = {
  en: {
    title: "B+-tree range scan",
    range: "Range",
    previous: "Previous range step",
    next: "Next range step",
    reset: "Reset range trace",
    collected: "Collected records",
    reads: "Page reads",
    leaf: "Active leaf",
    splitTitle: "Leaf split trace"
  },
  zh: {
    title: "B+ 树范围扫描",
    range: "范围",
    previous: "上一步范围扫描",
    next: "下一步范围扫描",
    reset: "重置范围追踪",
    collected: "已收集记录",
    reads: "页读取",
    leaf: "当前叶子",
    splitTitle: "叶子分裂追踪"
  }
};

function LeafRow({ activeLeaf, activeKey, collected }: { activeLeaf?: string; activeKey?: number; collected: number[] }) {
  const collectedSet = new Set(collected);
  return (
    <div className="bplus-leaf-row">
      {(["A", "B", "C"] as const).map((id, index) => (
        <div className={activeLeaf === id ? "bplus-leaf is-highlighted" : "bplus-leaf"} key={id}>
          <span className="bplus-label">Leaf {id}</span>
          <div className="bplus-record-strip">
            {bPlusTreeFixture.leaves[id].records.map((record) => (
              <span className={record.key === activeKey || collectedSet.has(record.key) ? "is-highlighted" : ""} key={record.key}>{record.key}:{record.value}</span>
            ))}
          </div>
          {index < 2 ? <small>{"link ->"}</small> : null}
        </div>
      ))}
    </div>
  );
}

export default function BPlusTreeRangeScanDemo({ lang, showSplit = false }: { lang: Locale; showSplit?: boolean }) {
  const [caseId, setCaseId] = useState<BPlusRangeCaseId>("20-70");
  const [stepIndex, setStepIndex] = useState(0);
  const trace = rangeTraces[caseId];
  const step = trace.steps[Math.min(stepIndex, trace.steps.length - 1)];

  return (
    <section className="bplus-range-demo" aria-label={showSplit ? labels[lang].splitTitle : labels[lang].title}>
      {showSplit ? <LeafSplitPanel lang={lang} /> : (
        <div className="bplus-widget-grid">
          <div className="bplus-tree">
            <div className={step.action === "descend" ? "bplus-internal is-active" : "bplus-internal"}>
              <span className="bplus-label">{lang === "en" ? "guide only" : "只导航"}</span>
              <div className="bplus-guide-strip">{bPlusTreeFixture.root.guideKeys.map((key) => <span key={key}>{key}</span>)}</div>
            </div>
            <LeafRow activeLeaf={step.leafId} activeKey={step.activeKey} collected={step.collected} />
          </div>
          <div className="bplus-panel">
            <p className="state-label">{labels[lang].title}</p>
            <label>
              <span>{labels[lang].range}</span>
              <select
                aria-label={lang === "en" ? "Choose B+-tree range query" : "选择 B+ 树范围查询"}
                value={caseId}
                onChange={(event) => {
                  setCaseId(event.target.value as BPlusRangeCaseId);
                  setStepIndex(0);
                }}
              >
                <option value="20-70">[20, 70]</option>
                <option value="20-65">[20, 65] ({lang === "en" ? "stop inside leaf" : "在叶内停止"})</option>
              </select>
            </label>
            <p aria-live="polite">{step.explanation[lang]}</p>
            <div className="bplus-fact-grid">
              <div><strong>{labels[lang].leaf}</strong><span>{step.leafId}</span></div>
              <div><strong>{labels[lang].reads}</strong><span>{step.pageReads}</span></div>
              <div><strong>{labels[lang].collected}</strong><span>{step.collected.join(", ") || "-"}</span></div>
              <div><strong>{lang === "en" ? "Inclusive bounds" : "闭区间边界"}</strong><span>[{trace.lo}, {trace.hi}]</span></div>
            </div>
            <div className="controls">
              <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
              <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.steps.length - 1))} disabled={stepIndex === trace.steps.length - 1}>{labels[lang].next}</button>
              <button type="button" onClick={() => setStepIndex(0)}>{labels[lang].reset}</button>
            </div>
          </div>
        </div>
      )}
      <BPlusTreeStyles />
      <style>{`
        .bplus-range-demo {
          margin: 1.4rem 0;
          padding: 1rem;
          border: 1px solid var(--color-border, #d8e2ef);
          border-radius: 8px;
          background: #ffffff;
        }
        .bplus-widget-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(16rem, .85fr);
          gap: 1rem;
          align-items: start;
        }
        .bplus-panel {
          display: grid;
          gap: .75rem;
        }
        .bplus-panel label {
          display: grid;
          gap: .3rem;
          font-weight: 700;
        }
        .bplus-panel select {
          max-width: 100%;
          padding: .45rem;
          border: 1px solid #9fb4d4;
          border-radius: 6px;
        }
        .bplus-fact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: .5rem;
        }
        .bplus-fact-grid > div {
          padding: .55rem;
          border: 1px solid #d8e2ef;
          border-radius: 8px;
          background: #f8fbff;
        }
        .bplus-fact-grid strong, .bplus-fact-grid span {
          display: block;
        }
        .bplus-internal.is-active {
          border-color: #d97706;
          background: #fff7ed;
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
        }
        .controls button {
          padding: .5rem .7rem;
          border: 1px solid #2f6fbd;
          border-radius: 6px;
          background: #eef6ff;
          color: #17365d;
          font-weight: 700;
        }
        .controls button:disabled {
          opacity: .45;
        }
        .controls button:focus-visible {
          outline: 3px solid #d97706;
          outline-offset: 2px;
        }
        @media (max-width: 760px) {
          .bplus-widget-grid, .bplus-fact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function LeafSplitPanel({ lang }: { lang: Locale }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = leafSplitTrace[stepIndex];
  return (
    <div className="bplus-widget-grid">
      <div className="bplus-tree">
        <div className="bplus-internal is-active">
          <span className="bplus-label">{lang === "en" ? "parent guide keys" : "父节点导航键"}</span>
          <div className="bplus-guide-strip">{step.rootGuideKeys.map((key) => <span className={key === step.copiedSeparator ? "is-highlighted" : ""} key={key}>{key}</span>)}</div>
        </div>
        <div className="bplus-leaf-row">
          {step.leaves.map((leaf) => (
            <div className="bplus-leaf" key={leaf.id}>
              <span className="bplus-label">Leaf {leaf.id}</span>
              <div className="bplus-record-strip">{leaf.records.map((record) => <span className={record.key === step.copiedSeparator ? "is-highlighted" : ""} key={record.key}>{record.key}:{record.value}</span>)}</div>
              {leaf.next ? <small>{`link -> ${leaf.next}`}</small> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="bplus-panel">
        <p className="state-label">{labels[lang].splitTitle}</p>
        <h3>{step.title[lang]}</h3>
        <p aria-live="polite">{step.explanation[lang]}</p>
        <div className="bplus-fact-grid">
          <div><strong>{lang === "en" ? "Copied separator" : "复制的分隔键"}</strong><span>{step.copiedSeparator ?? "-"}</span></div>
          <div><strong>{lang === "en" ? "Records stay in leaves" : "记录仍在叶子"}</strong><span>50, 55</span></div>
        </div>
        <div className="controls">
          <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
          <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, leafSplitTrace.length - 1))} disabled={stepIndex === leafSplitTrace.length - 1}>{labels[lang].next}</button>
          <button type="button" onClick={() => setStepIndex(0)}>{labels[lang].reset}</button>
        </div>
      </div>
    </div>
  );
}
