import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  covariance2d,
  formatPcaNumber,
  pcaMean,
  pcaPoints,
  pcaTraceSteps,
  principalComponents2d,
  projectedCodes,
  reconstructionComparisons
} from "./pcaTrace";

const copy = {
  en: {
    title: "PCA trace lab",
    previous: "Previous",
    next: "Next",
    reset: "Reset",
    keep1: "Keep 1",
    keep2: "Keep 2",
    visible: "Visible state",
    step: "Step",
    table: "state table",
    mean: "mean",
    covariance: "covariance",
    component: "component",
    code: "code",
    error: "sum squared error"
  },
  zh: {
    title: "PCA 追踪实验台",
    previous: "上一步",
    next: "下一步",
    reset: "重置",
    keep1: "保留 1 个",
    keep2: "保留 2 个",
    visible: "可见状态",
    step: "步骤",
    table: "状态表",
    mean: "均值",
    covariance: "协方差",
    component: "主成分",
    code: "编码",
    error: "平方误差总和"
  }
};

function rowsForStep(stepId: string, k: 1 | 2, lang: Locale): [string, string][] {
  const mean = pcaMean();
  const covariance = covariance2d();
  const components = principalComponents2d();
  const codes = projectedCodes(k);
  const comparisons = reconstructionComparisons();

  if (stepId === "raw-table") {
    return pcaPoints.slice(0, 4).map((point) => [point.label, `${point.height}, ${point.armSpan}`]);
  }
  if (stepId === "center") {
    return [
      [copy[lang].mean, `(${formatPcaNumber(mean.x, lang, 1)}, ${formatPcaNumber(mean.y, lang, 1)})`],
      ["A", `(${formatPcaNumber(pcaPoints[0].height - mean.x, lang, 1)}, ${formatPcaNumber(pcaPoints[0].armSpan - mean.y, lang, 1)})`]
    ];
  }
  if (stepId === "covariance") {
    return [
      ["C_xx", formatPcaNumber(covariance.xx, lang, 2)],
      ["C_xy", formatPcaNumber(covariance.xy, lang, 2)],
      ["C_yy", formatPcaNumber(covariance.yy, lang, 2)]
    ];
  }
  if (stepId === "components") {
    return components.map((component, index) => [
      `PC${index + 1}`,
      `(${formatPcaNumber(component.x, lang, 3)}, ${formatPcaNumber(component.y, lang, 3)}), ${formatPcaNumber(component.explainedVarianceRatio * 100, lang, 1)}%`
    ]);
  }
  if (stepId === "project") {
    return codes.slice(0, 4).map((row) => [
      row.label,
      row.code.map((value) => formatPcaNumber(value, lang, 2)).join(", ")
    ]);
  }
  return comparisons
    .filter((row) => (k === 1 ? row.id !== "keep-pc1-pc2" : row.id === "keep-pc1-pc2" || row.id === "keep-pc1"))
    .map((row) => [row.label[lang], formatPcaNumber(row.error, lang, 2)]);
}

export default function PcaTraceLab({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const [stepIndex, setStepIndex] = useState(0);
  const [k, setK] = useState<1 | 2>(1);
  const step = pcaTraceSteps[stepIndex];
  const rows = useMemo(() => rowsForStep(step.id, k, lang), [step.id, k, lang]);

  return (
    <section className="circuit-sat-demo" aria-label={labels.title}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="controls">
          <button type="button" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
            {labels.previous}
          </button>
          <button type="button" onClick={() => setStepIndex(Math.min(pcaTraceSteps.length - 1, stepIndex + 1))} disabled={stepIndex === pcaTraceSteps.length - 1}>
            {labels.next}
          </button>
          <button type="button" onClick={() => setStepIndex(0)}>
            {labels.reset}
          </button>
        </div>
        <div className="circuit-sat-row-grid compact" role="group" aria-label={lang === "en" ? "Components to keep" : "保留的主成分数量"}>
          <button type="button" className={k === 1 ? "active" : ""} aria-pressed={k === 1} onClick={() => setK(1)}>
            {labels.keep1}
          </button>
          <button type="button" className={k === 2 ? "active" : ""} aria-pressed={k === 2} onClick={() => setK(2)}>
            {labels.keep2}
          </button>
        </div>
        <p aria-live="polite">{`${labels.step} ${stepIndex + 1}/${pcaTraceSteps.length}: ${step.title[lang]}. ${step.explanation[lang]}`}</p>
      </div>

      <div className="pnp-card-grid">
        <article className="pnp-card accept">
          <strong>{step.title[lang]}</strong>
          <p>{step.metric[lang]}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.table}</strong>
          <table className="pnp-mini-table">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}

