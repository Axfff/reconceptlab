import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { bPlusTreeFixture, lookupTraces, type BPlusLookupCaseId } from "./bPlusTreeTrace";
import { BPlusTreeStyles } from "./BPlusTreeAnatomyFigure";

const labels = {
  en: {
    title: "B+-tree point lookup",
    target: "Target",
    previous: "Previous lookup step",
    next: "Next lookup step",
    reset: "Reset lookup trace",
    reads: "Page reads",
    leaf: "Chosen leaf",
    convention: "Equality to a separator goes right"
  },
  zh: {
    title: "B+ 树点查找",
    target: "目标",
    previous: "上一步查找",
    next: "下一步查找",
    reset: "重置查找追踪",
    reads: "页读取",
    leaf: "选中的叶子",
    convention: "等于分隔键时向右走"
  }
};

export default function BPlusTreeLookupFigure({ lang }: { lang: Locale }) {
  const [caseId, setCaseId] = useState<BPlusLookupCaseId>("50");
  const [stepIndex, setStepIndex] = useState(0);
  const trace = lookupTraces[caseId];
  const step = trace.steps[Math.min(stepIndex, trace.steps.length - 1)];

  return (
    <section className="bplus-widget" aria-label={labels[lang].title}>
      <div className="bplus-widget-grid">
        <div className="bplus-tree">
          <div className={step.action === "read-root" || step.action === "choose-child" ? "bplus-internal is-active" : "bplus-internal"}>
            <span className="bplus-label">{lang === "en" ? "guide only" : "只导航"}</span>
            <div className="bplus-guide-strip">
              {bPlusTreeFixture.root.guideKeys.map((key) => <span className={trace.target === key ? "is-highlighted" : ""} key={key}>{key}</span>)}
            </div>
          </div>
          <div className="bplus-interval-row">
            {bPlusTreeFixture.root.childIntervals.map((interval, index) => (
              <span className={step.childId === bPlusTreeFixture.root.children[index] ? "is-active" : ""} key={interval.en}>{interval[lang]}</span>
            ))}
          </div>
          <div className="bplus-leaf-row">
            {(["A", "B", "C"] as const).map((id) => (
              <div className={step.childId === id ? "bplus-leaf is-highlighted" : "bplus-leaf"} key={id}>
                <span className="bplus-label">Leaf {id}</span>
                <div className="bplus-record-strip">
                  {bPlusTreeFixture.leaves[id].records.map((record) => <span className={record.key === step.foundKey ? "is-highlighted" : ""} key={record.key}>{record.key}:{record.value}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bplus-panel">
          <p className="state-label">{labels[lang].title}</p>
          <label>
            <span>{labels[lang].target}</span>
            <select
              aria-label={lang === "en" ? "Choose B+-tree lookup target" : "选择 B+ 树查找目标"}
              value={caseId}
              onChange={(event) => {
                setCaseId(event.target.value as BPlusLookupCaseId);
                setStepIndex(0);
              }}
            >
              <option value="50">50</option>
              <option value="30">30 ({lang === "en" ? "separator equality" : "分隔键相等"})</option>
              <option value="60">60 ({lang === "en" ? "separator equality" : "分隔键相等"})</option>
            </select>
          </label>
          <p aria-live="polite">{step.explanation[lang]}</p>
          <div className="bplus-fact-grid">
            <div><strong>{labels[lang].reads}</strong><span>{step.pageReads}</span></div>
            <div><strong>{labels[lang].leaf}</strong><span>{step.childId ?? "-"}</span></div>
            <div><strong>{lang === "en" ? "Interval" : "区间"}</strong><span>{step.interval?.[lang] ?? "-"}</span></div>
            <div><strong>{lang === "en" ? "Convention" : "约定"}</strong><span>{labels[lang].convention}</span></div>
          </div>
          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.steps.length - 1))} disabled={stepIndex === trace.steps.length - 1}>{labels[lang].next}</button>
            <button type="button" onClick={() => setStepIndex(0)}>{labels[lang].reset}</button>
          </div>
        </div>
      </div>
      <BPlusTreeStyles />
      <style>{`
        .bplus-widget {
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
        .bplus-internal.is-active, .bplus-interval-row .is-active {
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
