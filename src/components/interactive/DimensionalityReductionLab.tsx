import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  reductionCopy,
  reductionSteps,
  type DimensionalityReductionId
} from "./dimensionalityReductionTrace";

const ids: DimensionalityReductionId[] = ["pca", "mds", "isomap", "lda", "qda", "sne", "t-sne", "umap"];

export default function DimensionalityReductionLab({
  lang,
  initialMethod
}: {
  lang: Locale;
  initialMethod: DimensionalityReductionId;
}) {
  const [method, setMethod] = useState<DimensionalityReductionId>(initialMethod);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => reductionSteps[method], [method]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const labels = {
    title: lang === "en" ? "Dimensionality reduction trace lab" : "降维追踪实验室",
    method: lang === "en" ? "Method" : "方法",
    previous: lang === "en" ? "Previous step" : "上一步",
    next: lang === "en" ? "Next step" : "下一步",
    reset: lang === "en" ? "Reset" : "重置",
    step: lang === "en" ? "Step" : "步骤"
  };

  function chooseMethod(nextMethod: DimensionalityReductionId) {
    setMethod(nextMethod);
    setStepIndex(0);
  }

  return (
    <section className="circuit-sat-demo" aria-label={labels.title}>
      <figcaption>
        <span>{reductionCopy[method].label[lang]}</span>
        {reductionCopy[method].short[lang]}
      </figcaption>
      <div className="demo-controls" role="group" aria-label={labels.method}>
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            className={id === method ? "active" : ""}
            onClick={() => chooseMethod(id)}
            aria-pressed={id === method}
          >
            {reductionCopy[id].label[lang]}
          </button>
        ))}
      </div>
      <div className="pnp-card-grid">
        <article className="pnp-card accept">
          <strong>{`${labels.step} ${stepIndex + 1}/${steps.length}: ${step.title[lang]}`}</strong>
          <p>{step.explanation[lang]}</p>
        </article>
        <article className="pnp-card">
          <strong>{lang === "en" ? "Working formula" : "工作公式"}</strong>
          <output>{step.formula}</output>
          <p>{step.metric[lang]}</p>
        </article>
      </div>
      <div className="demo-controls" role="group" aria-label={lang === "en" ? "Step controls" : "步骤控制"}>
        <button type="button" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
          {labels.previous}
        </button>
        <button type="button" onClick={() => setStepIndex(Math.min(steps.length - 1, stepIndex + 1))} disabled={stepIndex === steps.length - 1}>
          {labels.next}
        </button>
        <button type="button" onClick={() => setStepIndex(0)}>
          {labels.reset}
        </button>
      </div>
    </section>
  );
}
