import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { pathEncodingTrace, textFor, yesNo } from "./reductionTrace";

const labels = {
  "receive-edge-list": {
    en: "Receive x in A",
    zh: "接收 A 中的 x"
  },
  "build-adjacency-map": {
    en: "Compute f(x)",
    zh: "计算 f(x)"
  },
  "solve-adjacency-map": {
    en: "Call B solver",
    zh: "调用 B 求解器"
  },
  "return-path-answer": {
    en: "Return same answer",
    zh: "返回同一答案"
  }
} as const;

export default function ReductionProofPipeline({ lang }: { lang: Locale }) {
  const trace = pathEncodingTrace();
  const [index, setIndex] = useState(0);
  const step = trace[index];

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Reduction proof pipeline", "归约证明流水线")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Proof pipeline: a B solver becomes an A solver", "证明流水线：B 求解器变成 A 求解器")}</strong>
          <p>{textFor(lang, "Step through the same path-encoding example used in the hook.", "逐步查看开头使用的同一个路径编码例子。")}</p>
        </div>
        <span className="pnp-badge">{index + 1} / {trace.length}</span>
      </div>
      <div className="reduction-pipeline">
        {trace.map((traceStep, traceIndex) => (
          <div key={traceStep.id} className={`reduction-card ${traceIndex === index ? "active" : traceIndex < index ? "solved" : ""}`}>
            <strong>{labels[traceStep.id][lang]}</strong>
            <span>{traceStep.explanation[lang]}</span>
            {"sourceAnswer" in traceStep ? <b>{textFor(lang, "source", "源问题")} {yesNo(traceStep.sourceAnswer, lang)}</b> : null}
            {"targetAnswer" in traceStep ? <b>{textFor(lang, "target", "目标问题")} {yesNo(traceStep.targetAnswer, lang)}</b> : null}
          </div>
        ))}
      </div>
      <div className="pnp-tabs" aria-label={textFor(lang, "Proof controls", "证明控制")}>
        <button type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
          {textFor(lang, "Back", "上一步")}
        </button>
        <button type="button" onClick={() => setIndex(Math.min(trace.length - 1, index + 1))} disabled={index === trace.length - 1}>
          {textFor(lang, "Step reduction proof", "推进归约证明")}
        </button>
        <button type="button" onClick={() => setIndex(0)}>
          {textFor(lang, "Reset proof", "重置证明")}
        </button>
      </div>
      <p className="reduction-feedback valid" aria-live="polite">{step.explanation[lang]}</p>
      <div className="pnp-transcript" aria-label={textFor(lang, "Proof transcript", "证明文字记录")}>
        {trace.map((traceStep, traceIndex) => (
          <div key={traceStep.id} className={traceIndex === index ? "active" : ""}>
            <strong>{labels[traceStep.id][lang]}</strong>
            <span>{traceStep.explanation[lang]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
