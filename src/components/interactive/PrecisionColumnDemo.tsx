import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { confusionMatrixExamples, labelForCell, positiveLabel } from "./confusionMatrixTrace";
import {
  buildPrecisionTrace,
  precisionFromCounts,
  precisionUnavailableText,
  type PrecisionTraceStep
} from "./precisionTrace";

const autoIntervalMs = 1100;

const labels = {
  en: {
    title: "Precision over predicted spam alarms",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    play: "Play",
    pause: "Pause",
    notAvailable: precisionUnavailableText("en"),
    actual: "Actual",
    predicted: "Predicted",
    cell: "Cell",
    trusted: "Trusted alarms",
    all: "All alarms",
    value: "Running precision",
    subject: "Subject"
  },
  zh: {
    title: "预测 spam 告警精确率",
    previous: "上一步",
    next: "下一步",
    reset: "重置",
    play: "播放",
    pause: "暂停",
    notAvailable: precisionUnavailableText("zh"),
    actual: "真实",
    predicted: "预测",
    cell: "格子",
    trusted: "可信告警",
    all: "全部告警",
    value: "运行中精确率",
    subject: "主题"
  }
};

function binaryLabel(value: string, lang: Locale) {
  if (value === "spam") return lang === "en" ? "spam" : "垃圾邮件（spam）";
  return lang === "en" ? "not-spam" : "非垃圾邮件（not-spam）";
}

function valueToText(value: number | null, locale: Locale) {
  if (value === null) return labels[locale].notAvailable;
  if (value === 1) return "1.0";
  return `${Number(value.toFixed(3)).toString()}${value < 1 ? "" : ""}`;
}

function precisionFromStep(step: PrecisionTraceStep) {
  return precisionFromCounts({
    tp: step.trustedAlarms,
    fp: step.allAlarms - step.trustedAlarms
  });
}

function ledgerCaption(locale: Locale) {
  return locale === "en" ? "Precision trace over predicted-spam emails" : "精确率追踪账本（仅预测为 spam）";
}

export default function PrecisionColumnDemo({ lang }: { lang: Locale }) {
  const trace = useMemo(() => buildPrecisionTrace(confusionMatrixExamples, positiveLabel), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const state = trace[stepIndex] ?? trace[0];
  const precision = state ? precisionFromStep(state) : { numerator: 0, denominator: 0, value: null };
  const canPlay = stepIndex < trace.length - 1;

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= trace.length - 1) {
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
  }, [isPlaying, trace.length, stepIndex]);

  if (!state) return null;

  const cellMeta = labelForCell(state.cell, lang);
  const percentText = precision.value === null ? labels[lang].notAvailable : `${(precision.value * 100).toFixed(1)}%`;

  const interpretation = precision.value === null
    ? labels[lang].notAvailable
    : `${state.trustedAlarms}/${state.allAlarms} = ${valueToText(precision.value, lang)}`;

  const finalPrecision = precisionFromCounts({
    tp: trace[trace.length - 1]?.trustedAlarms ?? 0,
    fp: (trace[trace.length - 1]?.allAlarms ?? 0) - (trace[trace.length - 1]?.trustedAlarms ?? 0)
  });

  return (
    <section className="circuit-sat-demo" aria-label={labels[lang].title}>
      <div className="state-panel">
        <p className="state-label">{labels[lang].title}</p>
        <p aria-live="polite">
          {lang === "en"
            ? `${state.example.id} → ${state.cell.toUpperCase()}: ${state.example.subject.en}. ${labels[lang].actual} ${binaryLabel(state.example.actual, lang)}, ${labels[lang].predicted} ${binaryLabel(state.example.prediction, lang)}. ${labels[lang].cell}: ${cellMeta.code} (${cellMeta.full}). ${labels[lang].value}: ${interpretation}.`
            : `${state.example.id} → ${state.cell.toUpperCase()}：${state.example.subject.zh}。${labels[lang].actual} ${binaryLabel(state.example.actual, lang)}，${labels[lang].predicted} ${binaryLabel(state.example.prediction, lang)}，${labels[lang].cell}：${cellMeta.code}（${cellMeta.full}）。${labels[lang].value}：${interpretation}。`}
        </p>

        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{labels[lang].subject}</strong>
            <p>{lang === "en" ? state.example.subject.en : state.example.subject.zh}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Current step" : "当前步骤"}</strong>
            <p>{state.index + 1}/{trace.length}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].trusted}</strong>
            <p>{state.trustedAlarms}/{state.allAlarms}</p>
          </article>
          <article className="pnp-card">
            <strong>{labels[lang].value}</strong>
            <p>{precision.value === null ? labels[lang].notAvailable : valueToText(precision.value, lang)}</p>
            <p>{lang === "en" ? "percent" : "百分比"}: {percentText}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Final fixture value" : "最终值（固定样本）"}</strong>
            <p>{finalPrecision.value === null ? labels[lang].notAvailable : `${finalPrecision.numerator}/${finalPrecision.denominator} = ${valueToText(finalPrecision.value, lang)}`}</p>
          </article>
        </div>
      </div>

      <div className="controls">
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          disabled={stepIndex === 0}
        >
          {labels[lang].previous}
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.min(trace.length - 1, value + 1))}
          disabled={stepIndex === trace.length - 1}
        >
          {labels[lang].next}
        </button>
        <button type="button" onClick={() => {
          setStepIndex(0);
          setIsPlaying(false);
        }}>
          {labels[lang].reset}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          disabled={!canPlay}
          aria-pressed={isPlaying}
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
            <th>{lang === "en" ? "Actual" : "真实"}</th>
            <th>{lang === "en" ? "Predicted" : "预测"}</th>
            <th>{lang === "en" ? "Cell" : "格子"}</th>
            <th>{lang === "en" ? "Trusted alarms" : "可信告警"}</th>
            <th>{lang === "en" ? "All alarms" : "全部告警"}</th>
            <th>{lang === "en" ? "Precision" : "精确率"}</th>
          </tr>
        </thead>
        <tbody>
          {trace.map((step) => {
            const stepPrecision = precisionFromStep(step);
            const precisionText = stepPrecision.value === null ? labels[lang].notAvailable : `${stepPrecision.numerator}/${stepPrecision.denominator} = ${valueToText(stepPrecision.value, lang)}`;
            return (
              <tr key={step.example.id}>
                <th scope="row">{step.index + 1}</th>
                <td>{step.example.id}</td>
                <td>{binaryLabel(step.example.actual, lang)}</td>
                <td>{binaryLabel(step.example.prediction, lang)}</td>
                <td>{`${step.cell} (${labelForCell(step.cell, lang).code})`}</td>
                <td>{step.trustedAlarms}</td>
                <td>{step.allAlarms}</td>
                <td>{precisionText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
