import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  type MatrixTraceStep,
  labelForCell,
  swappedTrace,
  defaultTrace,
  type ConfusionMatrixExample
} from "./confusionMatrixTrace";

const autoIntervalMs = 1100;

type Legend = {
  title: string;
  previous: string;
  next: string;
  reset: string;
  play: string;
  pause: string;
};

const legend: Record<Locale, Legend> = {
  en: {
    title: "Confusion matrix trace",
    previous: "Previous step",
    next: "Next step",
    reset: "Reset",
    play: "Play",
    pause: "Pause"
  },
  zh: {
    title: "混淆矩阵追踪",
    previous: "上一步",
    next: "下一步",
    reset: "重置",
    play: "播放",
    pause: "暂停"
  }
};

function binaryLabel(binary: ConfusionMatrixExample["actual"], lang: Locale) {
  if (binary === "spam") return lang === "en" ? "spam" : "垃圾邮件";
  return lang === "en" ? "not-spam" : "非垃圾邮件";
}

function currentMatrixCounts(step: MatrixTraceStep, lang: Locale) {
  const counts = step.after;
  const tp = counts.tp.toLocaleString();
  const fp = counts.fp.toLocaleString();
  const tn = counts.tn.toLocaleString();
  const fn = counts.fn.toLocaleString();
  return (
    <table className="pnp-mini-table">
      <caption>{lang === "en" ? "Current matrix counts" : "当前计数表"}</caption>
      <thead>
        <tr>
          <th>{lang === "en" ? "actual \\ predicted" : "真实 \\ 预测"}</th>
          <th>{lang === "en" ? "positive" : "正类"} 1</th>
          <th>{lang === "en" ? "negative" : "负类"} 0</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{lang === "en" ? "actual=positive" : "真实=正类"}</th>
          <td>TP: {tp}</td>
          <td>FN: {fn}</td>
        </tr>
        <tr>
          <th scope="row">{lang === "en" ? "actual=negative" : "真实=负类"}</th>
          <td>FP: {fp}</td>
          <td>TN: {tn}</td>
        </tr>
      </tbody>
    </table>
  );
}

function activeTraceRow(stepIndex: number, lang: Locale) {
  return (
    <table className="pnp-mini-table">
      <caption>{lang === "en" ? "Step ledger (active row marked)" : "步骤账本（当前行已标注）"}</caption>
      <thead>
        <tr>
          <th>{lang === "en" ? "Current" : "当前步"}</th>
          <th>Step</th>
          <th>Id</th>
          <th>{lang === "en" ? "Subject" : "主题"}</th>
          <th>{lang === "en" ? "Actual" : "真实"}</th>
          <th>{lang === "en" ? "Predicted" : "预测"}</th>
          <th>Cell</th>
        </tr>
      </thead>
      <tbody>
        {defaultTrace.map((traceStep) => {
          const isActive = traceStep.index === stepIndex;
          const cell = labelForCell(traceStep.cell, lang);
          return (
            <tr key={traceStep.example.id} className={isActive ? "active" : ""}>
              <th scope="row">{isActive ? (lang === "en" ? "active" : "当前") : ""}</th>
              <td>{traceStep.index + 1}</td>
              <td>{traceStep.example.id}</td>
              <td>{traceStep.example.subject[lang]}</td>
              <td>{binaryLabel(traceStep.example.actual, lang)}</td>
              <td>{binaryLabel(traceStep.example.prediction, lang)}</td>
              <td>{`${cell.code}: ${cell.full}`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ConfusionMatrixDemo({ lang }: { lang: Locale }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const state = defaultTrace[stepIndex];
  const swappedCurrent = swappedTrace[stepIndex];
  const finalCounts = defaultTrace.at(-1)?.after;
  const totalCorrect = finalCounts ? finalCounts.tp + finalCounts.tn : 0;
  const totalWrong = finalCounts ? finalCounts.fp + finalCounts.fn : 0;

  const cell = labelForCell(state.cell, lang);
  const changedCount = useMemo(
    () => `${state.before[state.cell]} → ${state.after[state.cell]}`,
    [state]
  );

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIndex((value) => {
        if (value >= defaultTrace.length - 1) return value;
        return value + 1;
      });
    }, autoIntervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (stepIndex === defaultTrace.length - 1) {
      setIsPlaying(false);
    }
  }, [stepIndex]);

  const canPlay = stepIndex < defaultTrace.length - 1;

  return (
    <section className="confusion-matrix-demo" aria-label={legend[lang].title}>
      <div className="pnp-card-grid">
        <article className="pnp-card">
          <strong>{legend[lang].title}</strong>
          <p>
            {lang === "en"
              ? `Step ${state.index + 1} of ${defaultTrace.length}: add ${state.example.id} to ${cell.full} (${cell.code}).`
              : `第 ${state.index + 1}/${defaultTrace.length} 步：将 ${state.example.id} 计入 ${cell.full}（${cell.code}）。`}
          </p>
          <p>
            {`${lang === "en" ? "Actual" : "真实"}: ${binaryLabel(state.example.actual, lang)}; ${lang === "en" ? "Predicted" : "预测"}: ${binaryLabel(state.example.prediction, lang)}.`}
          </p>
          <p aria-live="polite">{state.explanation[lang]}</p>
        </article>
        <article className="pnp-card">
          <strong>{lang === "en" ? "Current counts" : "当前计数"}</strong>
          <p>{`TP=${state.after.tp}, FP=${state.after.fp}, TN=${state.after.tn}, FN=${state.after.fn}`}</p>
          <p>{lang === "en" ? `total = ${state.after.tp + state.after.fp + state.after.tn + state.after.fn}` : `总计 = ${state.after.tp + state.after.fp + state.after.tn + state.after.fn}`}</p>
          <p>{lang === "en" ? `${cell.code} changed: ${changedCount}.` : `${cell.code} 变更：${changedCount}。`}</p>
        </article>
        <article className="pnp-card">
          <strong>{lang === "en" ? "Final invariants" : "最终不变量"}</strong>
          <p>{`TP + FP + TN + FN = ${finalCounts ? finalCounts.tp + finalCounts.fp + finalCounts.tn + finalCounts.fn : 0}`}</p>
          <p>{lang === "en" ? `right = TP + TN = ${totalCorrect}` : `正确 = TP + TN = ${totalCorrect}`}</p>
          <p>{lang === "en" ? `wrong = FP + FN = ${totalWrong}` : `错误 = FP + FN = ${totalWrong}`}</p>
        </article>
      </div>

      <div className="controls">
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          disabled={stepIndex === 0}
        >
          {legend[lang].previous}
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.min(defaultTrace.length - 1, value + 1))}
          disabled={stepIndex === defaultTrace.length - 1}
        >
          {legend[lang].next}
        </button>
        <button type="button" onClick={() => setStepIndex(0)}>
          {legend[lang].reset}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          disabled={!canPlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? legend[lang].pause : legend[lang].play}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        {currentMatrixCounts(state, lang)}
      </div>
      <div style={{ marginTop: 10 }}>
        {activeTraceRow(stepIndex, lang)}
      </div>
      <div className="pnp-demo-header" style={{ marginTop: 8 }}>
        <p>{lang === "en"
          ? "Swap-check preview (positive = not-spam): the current step updates:"
          : "切换正类到 not-spam 时（为方便对照）当前步会改到："}
        </p>
        <p>{`TP=${swappedCurrent.after.tp}, FP=${swappedCurrent.after.fp}, TN=${swappedCurrent.after.tn}, FN=${swappedCurrent.after.fn}`}</p>
      </div>
    </section>
  );
}
