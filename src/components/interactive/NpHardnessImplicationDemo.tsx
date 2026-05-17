import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  answerLabel,
  defaultImplicationSource,
  implicationTraceForSource,
  sourceById,
  sourceIdList,
  sourceLabels,
  textFor,
  type NpHardnessSourceId
} from "./npHardnessTrace";

const labels: Record<NpHardnessSourceId, Record<Locale, string>> = {
  "circuit-sat-preview": {
    en: "Choose Circuit-SAT preview source",
    zh: "选择 Circuit-SAT 预览源问题"
  },
  "sat-preview": {
    en: "Choose SAT preview source",
    zh: "选择 SAT 预览源问题"
  },
  "clique-preview": {
    en: "Choose Clique preview source",
    zh: "选择 Clique 预览源问题"
  },
  "independent-set-preview": {
    en: "Choose Independent Set preview source",
    zh: "选择独立集预览源问题"
  },
  "any-np-problem": {
    en: "Choose any L in NP source",
    zh: "选择任意 L in NP 的源问题"
  }
};

const stepLabels: Record<"choose-source" | "receive-instance" | "reduce-to-h" | "solve-h" | "return-source-answer", Record<Locale, string>> = {
  "choose-source": { en: "Choose source", zh: "选择源问题" },
  "receive-instance": { en: "Receive source instance", zh: "接收源实例" },
  "reduce-to-h": { en: "Reduce to H", zh: "归约到 H" },
  "solve-h": { en: "Call solveH", zh: "调用 solveH" },
  "return-source-answer": { en: "Return source answer", zh: "返回源答案" }
};

export default function NpHardnessImplicationDemo({ lang }: { lang: Locale }) {
  const [sourceId, setSourceId] = useState<NpHardnessSourceId>(defaultImplicationSource);
  const [index, setIndex] = useState(0);
  const trace = implicationTraceForSource(sourceId);

  const selectSource = (nextSourceId: NpHardnessSourceId) => {
    setSourceId(nextSourceId);
    setIndex(0);
  };

  const step = trace[index];
  const maxIndex = trace.length - 1;

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "NP-hardness implication demo", "NP-hardness 推论流水线演示")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Implication pipeline from an arbitrary chosen source", "从已选源问题到结论的推理流水线")}</strong>
          <p>{textFor(lang, "For any concrete source L with a valid reduction, this is the same five-step conditional flow.", "对每个有有效归约的具体源问题 L，条件性流程都相同：五步。")}</p>
        </div>
        <span className="pnp-badge">{index + 1}/{trace.length}</span>
      </div>
      <div className="pnp-tabs" aria-label={textFor(lang, "Source picker", "源问题选择器")}>
        {sourceIdList.map((candidateId) => (
          <button
            key={candidateId}
            type="button"
            className={candidateId === sourceId ? "active" : ""}
            aria-pressed={candidateId === sourceId}
            onClick={() => selectSource(candidateId)}
          >
            {labels[candidateId][lang]}
          </button>
        ))}
      </div>
      <div className="reduction-pipeline" aria-label={textFor(lang, "Reduction pipeline", "归约流水线")}>
        {trace.map((traceStep, traceIndex) => {
          const isYesNo = sourceById(sourceId).sourceAnswer === "symbolic" ? false : true;
          return (
            <div
              key={traceStep.id}
              className={`reduction-card ${traceIndex <= index ? "solved" : ""} ${traceIndex === index ? "active" : ""}`}
            >
              <strong>{stepLabels[traceStep.id][lang]}</strong>
              <span>{traceStep.explanation[lang]}</span>
              {traceStep.id === "choose-source" ? (
                <span>{sourceLabels[traceStep.sourceId][lang]}</span>
              ) : (
                <>
                  {"sourceAnswer" in traceStep && isYesNo ? <b>{textFor(lang, "source", "源")}: {answerLabel(traceStep.sourceAnswer, lang)}</b> : null}
                  {"targetAnswer" in traceStep && isYesNo ? <b>{textFor(lang, "target", "目标")}: {answerLabel(traceStep.targetAnswer, lang)}</b> : null}
                  {"assumesPolynomialSolverForH" in traceStep ? <span>{textFor(lang, "assumption", "假设")}: solveH ∈ P</span> : null}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="pnp-tabs" aria-label={textFor(lang, "Demo controls", "演示控制")}>
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
          {textFor(lang, "Back one step", "上一步")}
        </button>
        <button type="button" onClick={() => setIndex((value) => Math.min(maxIndex, value + 1))} disabled={index === maxIndex}>
          {textFor(lang, "Step implication", "推进推导")}
        </button>
        <button type="button" onClick={() => setIndex(0)}>
          {textFor(lang, "Reset implication", "重置推导")}
        </button>
      </div>
      <p className="reduction-feedback valid" aria-live="polite">
        {step.explanation[lang]}
      </p>
      <div className="pnp-transcript" aria-label={textFor(lang, "Pipeline transcript", "流水线文字记录")}>
        {trace.map((traceStep) => (
          <div key={traceStep.id} className={traceStep.id === step.id ? "active" : ""}>
            <strong>{stepLabels[traceStep.id][lang]}</strong>
            <span>{traceStep.explanation[lang]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
