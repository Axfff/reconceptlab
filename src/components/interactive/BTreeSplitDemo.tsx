import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { nonRootSplitBeforeDescentTrace, rootSplitTrace, type BTreeNode, type BTreeSplitStep } from "./bTreeTrace";
import { BTreeFigureStyles } from "./BTreeNodeFigure";

type SplitMode = "root" | "non-root";

const labels = {
  en: {
    rootTitle: "Root split repair",
    nonRootTitle: "Split before descent",
    root: "Root split for inserting 6",
    nonRoot: "Non-root split before inserting 17",
    previous: "Previous split step",
    next: "Next split step",
    reset: "Reset split trace",
    promoted: "Promoted key",
    inserted: "Inserted key"
  },
  zh: {
    rootTitle: "根分裂修复",
    nonRootTitle: "下降前分裂",
    root: "插入 6 时的根分裂",
    nonRoot: "插入 17 前的非根分裂",
    previous: "上一步分裂",
    next: "下一步分裂",
    reset: "重置分裂追踪",
    promoted: "提升键",
    inserted: "插入键"
  }
};

function TreeNode({ node, highlightedIds, promotedKey }: { node: BTreeNode; highlightedIds: string[]; promotedKey?: number }) {
  return (
    <div className="btree-split-unit">
      <div className={`btree-page ${highlightedIds.includes(node.id) ? "is-highlighted" : ""}`}>
        <span className="btree-page-label">{node.leaf ? "leaf" : "root"}</span>
        <div className="btree-key-strip">
          {node.keys.map((key) => <span className={key === promotedKey ? "is-highlighted" : ""} key={key}>{key}</span>)}
        </div>
      </div>
      {node.children ? (
        <div className="btree-children">
          {node.children.map((child) => <TreeNode key={child.id} node={child} highlightedIds={highlightedIds} promotedKey={promotedKey} />)}
        </div>
      ) : null}
    </div>
  );
}

export default function BTreeSplitDemo({ lang, mode = "root" }: { lang: Locale; mode?: SplitMode }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps: BTreeSplitStep[] = mode === "root" ? rootSplitTrace : nonRootSplitBeforeDescentTrace;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <section className="btree-split-demo" aria-label={mode === "root" ? labels[lang].rootTitle : labels[lang].nonRootTitle}>
      <div className="btree-split-grid">
        <TreeNode node={step.root} highlightedIds={step.highlightedNodeIds} promotedKey={step.promotedKey} />
        <div className="btree-split-panel">
          <p className="state-label">{mode === "root" ? labels[lang].root : labels[lang].nonRoot}</p>
          <h3>{step.title[lang]}</h3>
          <p aria-live="polite">{step.explanation[lang]}</p>
          <div className="btree-fact-grid">
            <div><strong>{labels[lang].inserted}</strong><span>{step.insertedKey ?? "-"}</span></div>
            <div><strong>{labels[lang].promoted}</strong><span>{step.promotedKey ?? "-"}</span></div>
          </div>
          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, steps.length - 1))} disabled={stepIndex === steps.length - 1}>{labels[lang].next}</button>
            <button type="button" onClick={() => setStepIndex(0)}>{labels[lang].reset}</button>
          </div>
        </div>
      </div>
      <BTreeFigureStyles />
      <style>{`
        .btree-split-demo {
          margin: 1.4rem 0;
          padding: 1rem;
          border: 1px solid var(--color-border, #d8e2ef);
          border-radius: 8px;
          background: #ffffff;
        }
        .btree-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(16rem, .9fr);
          gap: 1rem;
          align-items: start;
        }
        .btree-split-unit {
          display: flex;
          flex-direction: column;
          gap: .75rem;
          align-items: center;
        }
        .btree-split-panel {
          display: grid;
          gap: .7rem;
        }
        .btree-split-panel h3 {
          margin: 0;
          font-size: 1.05rem;
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
          .btree-split-grid, .btree-fact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
