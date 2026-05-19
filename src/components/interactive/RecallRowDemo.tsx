import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { confusionMatrixExamples, positiveLabel, labelForCell } from "./confusionMatrixTrace";
import {
  buildRecallTrace,
  recallFromCounts,
  recallUnavailableText,
  type RecallTraceStep
} from "./recallTrace";

const autoIntervalMs = 1100;

const labels = {
  en: {
    title: "Recall over actual spam",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    play: "Play",
    pause: "Pause",
    notAvailable: recallUnavailableText("en"),
    actual: "Actual",
    predicted: "Predicted",
    cell: "Cell",
    caught: "Caught positives",
    seen: "Actual positives seen",
    value: "Running recall",
    subject: "Subject",
    step: "Step"
  },
  zh: {
    title: "真实垃圾邮件召回追踪",
    previous: "上一步",
    next: "下一步",
    reset: "重置",
    play: "播放",
    pause: "暂停",
    notAvailable: recallUnavailableText("zh"),
    actual: "真实标签",
    predicted: "预测标签",
    cell: "格子",
    caught: "捕获正类",
    seen: "真实正类已见",
    value: "运行中召回率",
    subject: "主题",
    step: "步骤"
  }
};

function binaryLabel(value: "spam" | "not-spam", lang: Locale) {
  if (value === "spam") return lang === "en" ? "spam" : "垃圾邮件（spam）";
  return lang === "en" ? "not-spam" : "非垃圾邮件（not-spam）";
}

function valueToText(value: number | null, locale: Locale) {
  if (value === null) return labels[locale].notAvailable;
  if (value === 1) return "1.0";
  return value.toFixed(3).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function percentText(value: number | null, locale: Locale) {
  if (value === null) return labels[locale].notAvailable;
  return `${(value * 100).toFixed(1)}%`;
}

function runningRecallFromStep(step: RecallTraceStep) {
  return recallFromCounts({ tp: step.caughtPositives, fn: step.actualPositivesSeen - step.caughtPositives });
}

function ledgerCaption(locale: Locale) {
  return locale === "en"
    ? "Recall trace over actual-positive emails (no-JS fallback)"
    : "真实正类召回追踪账本（无 JS 回退）";
}

export default function RecallRowDemo({ lang }: { lang: Locale }) {
  const trace = useMemo(() => buildRecallTrace(confusionMatrixExamples, positiveLabel), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const state = trace[stepIndex];
  const canPlay = trace.length > 0 && stepIndex < trace.length - 1;

  useEffect(() => {
    if (!isPlaying) return;
    if (!canPlay) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setInterval(() => {
      setStepIndex((value) => {
        if (value >= trace.length - 1) return value;
        return value + 1;
      });
    }, autoIntervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, canPlay, trace.length]);

  useEffect(() => {
    if (stepIndex >= trace.length - 1) {
      setIsPlaying(false);
    }
  }, [stepIndex, trace.length]);

  const finalStep = trace.at(-1);
  const finalRecall = finalStep ? runningRecallFromStep(finalStep) : { numerator: 0, denominator: 0, value: null };

  if (!state) return null;

  const recall = runningRecallFromStep(state);
  const cellMeta = labelForCell(state.cell, lang);
  const interpretation = `${state.example.id}: ${state.example.subject[lang]}. ${labels[lang].actual} ${binaryLabel(state.example.actual, lang)}, ${labels[lang].predicted} ${binaryLabel(state.example.prediction, lang)}. ${labels[lang].cell}: ${cellMeta.code} (${cellMeta.full}). ${labels[lang].caught} ${state.caughtPositives}/${state.actualPositivesSeen}, ${labels[lang].value}: ${valueToText(recall.value, lang)}.`;

  return (
    <section className="circuit-sat-demo" aria-label={labels[lang].title}>
      <div className="state-panel">
        <p className="state-label">{labels[lang].title}</p>
        <p aria-live="polite">{interpretation}</p>

        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{labels[lang].step}</strong>
            <p>{`${state.index + 1}/${trace.length}`}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].subject}</strong>
            <p>{state.example.subject[lang]}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Current id" : "当前样本"} </strong>
            <p>{state.example.id}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].actual}</strong>
            <p>{binaryLabel(state.example.actual, lang)}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].predicted}</strong>
            <p>{binaryLabel(state.example.prediction, lang)}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].cell}</strong>
            <p>{`${cellMeta.code} (${cellMeta.full})`}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].caught}</strong>
            <p>{`${state.caughtPositives}/${state.actualPositivesSeen}`}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].value}</strong>
            <p>{valueToText(recall.value, lang)}</p>
            <p>{lang === "en" ? "percent" : "百分比"}: {percentText(recall.value, lang)}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Final fixture value" : "最终固定值"} </strong>
            <p>{finalRecall.value === null ? labels[lang].notAvailable : `${finalRecall.numerator}/${finalRecall.denominator} = ${valueToText(finalRecall.value, lang)}`}</p>
          </article>
        </div>
      </div>

      <div className="controls">
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          disabled={stepIndex === 0}
          aria-label={labels[lang].previous}
        >
          {labels[lang].previous}
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.min(trace.length - 1, value + 1))}
          disabled={stepIndex >= trace.length - 1}
          aria-label={labels[lang].next}
        >
          {labels[lang].next}
        </button>
        <button
          type="button"
          onClick={() => {
            setStepIndex(0);
            setIsPlaying(false);
          }}
          aria-label={labels[lang].reset}
        >
          {labels[lang].reset}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          disabled={!canPlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? labels[lang].pause : labels[lang].play}
        >
          {isPlaying ? labels[lang].pause : labels[lang].play}
        </button>
      </div>

      <table className="pnp-mini-table">
        <caption>{ledgerCaption(lang)}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Step" : "步骤"}</th>
            <th>{lang === "en" ? "Email" : "邮件"}</th>
            <th>{lang === "en" ? "Subject" : "主题"}</th>
            <th>{lang === "en" ? "Cell" : "格子"}</th>
            <th>{lang === "en" ? "Caught" : "已捕获"}</th>
            <th>{lang === "en" ? "Actual positives seen" : "真实正类已见"}</th>
            <th>{lang === "en" ? labels[lang].value : "运行中召回率"}</th>
            <th>{lang === "en" ? "Actual" : "真实"}</th>
            <th>{lang === "en" ? "Predicted" : "预测"}</th>
          </tr>
        </thead>
        <tbody>
          {trace.map((step) => {
            const rowRecall = runningRecallFromStep(step);
            const valueText = rowRecall.value === null ? labels[lang].notAvailable : `${rowRecall.numerator}/${rowRecall.denominator} = ${valueToText(rowRecall.value, lang)}`;
            const meta = labelForCell(step.cell, lang);
            return (
              <tr key={step.example.id} className={step.index === stepIndex ? "active" : ""}>
                <th scope="row">{step.index + 1}</th>
                <td>{step.example.id}</td>
                <td>{step.example.subject[lang]}</td>
                <td>{`${meta.code} (${meta.full})`}</td>
                <td>{step.caughtPositives}</td>
                <td>{step.actualPositivesSeen}</td>
                <td>{valueText}</td>
                <td>{binaryLabel(step.example.actual, lang)}</td>
                <td>{binaryLabel(step.example.prediction, lang)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
