import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { finalTree, searchTraces, type BTreeNode, type BTreeSearchCaseId } from "./bTreeTrace";
import { BTreeFigureStyles } from "./BTreeNodeFigure";

const labels = {
  en: {
    title: "B-tree search trace",
    target: "Target",
    next: "Next search step",
    previous: "Previous search step",
    reset: "Reset search trace",
    reads: "Page reads",
    status: "Status",
    found: "found",
    missing: "missing",
    current: "Current state"
  },
  zh: {
    title: "B 树查找追踪",
    target: "目标",
    next: "下一步查找",
    previous: "上一步查找",
    reset: "重置查找追踪",
    reads: "页读取",
    status: "状态",
    found: "已找到",
    missing: "未找到",
    current: "当前状态"
  }
};

function NodeView({ node, currentNodeId, childIndex, foundKey }: { node: BTreeNode; currentNodeId?: string; childIndex?: number; foundKey?: number }) {
  const isCurrent = node.id === currentNodeId;
  return (
    <div className="btree-search-unit">
      <div className={`btree-page ${isCurrent ? "is-highlighted" : ""}`}>
        <span className="btree-page-label">{node.leaf ? "leaf" : "root"}</span>
        <div className="btree-key-strip">
          {node.keys.map((key) => <span className={key === foundKey ? "is-highlighted" : ""} key={key}>{key}</span>)}
        </div>
      </div>
      {node.children ? (
        <div className="btree-children">
          {node.children.map((child, index) => (
            <div className={node.id === currentNodeId && childIndex === index ? "btree-chosen-child" : ""} key={child.id}>
              <NodeView node={child} currentNodeId={currentNodeId} childIndex={childIndex} foundKey={foundKey} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BTreeSearchFigure({ lang }: { lang: Locale }) {
  const [caseId, setCaseId] = useState<BTreeSearchCaseId>("17");
  const [stepIndex, setStepIndex] = useState(0);
  const trace = searchTraces[caseId];
  const step = trace.steps[Math.min(stepIndex, trace.steps.length - 1)];
  const foundKey = step.action === "found" ? trace.target : undefined;

  return (
    <section className="btree-widget" aria-label={labels[lang].title}>
      <div className="btree-widget-grid">
        <div>
          <NodeView node={finalTree} currentNodeId={step.nodeId} childIndex={step.childIndex} foundKey={foundKey} />
        </div>
        <div className="btree-state-panel">
          <p className="state-label">{labels[lang].title}</p>
          <label>
            <span>{labels[lang].target}</span>
            <select
              aria-label={lang === "en" ? "Choose B-tree search target" : "选择 B 树查找目标"}
              value={caseId}
              onChange={(event) => {
                setCaseId(event.target.value as BTreeSearchCaseId);
                setStepIndex(0);
              }}
            >
              <option value="17">17</option>
              <option value="10">10 ({lang === "en" ? "internal hit" : "内部命中"})</option>
              <option value="13">13 ({lang === "en" ? "missing" : "不存在"})</option>
            </select>
          </label>
          <p aria-live="polite"><strong>{labels[lang].current}:</strong> {step.explanation[lang]}</p>
          <div className="btree-fact-grid">
            <div><strong>{labels[lang].reads}</strong><span>{step.pageReads}</span></div>
            <div><strong>{labels[lang].status}</strong><span>{step.found ? labels[lang].found : trace.found ? labels[lang].found : labels[lang].missing}</span></div>
            <div><strong>{lang === "en" ? "Range" : "范围"}</strong><span>{step.rangeLabel[lang]}</span></div>
            <div><strong>{lang === "en" ? "Node keys" : "节点键"}</strong><span>[{step.nodeKeys.join(", ")}]</span></div>
          </div>
          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.steps.length - 1))} disabled={stepIndex === trace.steps.length - 1}>{labels[lang].next}</button>
            <button type="button" onClick={() => setStepIndex(0)}>{labels[lang].reset}</button>
          </div>
        </div>
      </div>
      <BTreeFigureStyles />
      <style>{`
        .btree-widget {
          margin: 1.4rem 0;
          padding: 1rem;
          border: 1px solid var(--color-border, #d8e2ef);
          border-radius: 8px;
          background: #ffffff;
        }
        .btree-widget-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(16rem, .85fr);
          gap: 1rem;
          align-items: start;
        }
        .btree-search-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
        }
        .btree-chosen-child {
          outline: 3px solid #d97706;
          outline-offset: 4px;
          border-radius: 8px;
        }
        .btree-state-panel {
          display: grid;
          gap: .8rem;
        }
        .btree-state-panel label {
          display: grid;
          gap: .3rem;
          font-weight: 700;
        }
        .btree-state-panel select {
          max-width: 100%;
          padding: .45rem;
          border: 1px solid #9fb4d4;
          border-radius: 6px;
        }
        .btree-fact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: .5rem;
        }
        .btree-fact-grid > div {
          padding: .55rem;
          border: 1px solid #d8e2ef;
          border-radius: 8px;
          background: #f8fbff;
        }
        .btree-fact-grid strong, .btree-fact-grid span {
          display: block;
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
          .btree-widget-grid, .btree-fact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
