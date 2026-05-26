import type { Locale } from "../../i18n/locales";

const copy = {
  en: {
    title: "PCA notation map",
    summary: "Each symbol is one object in the same pipeline: raw table, centered table, directions, compressed code, reconstruction.",
    aria: "PCA formula pipeline from raw data to reconstruction",
    raw: "raw data",
    centered: "centered data",
    directions: "kept directions",
    code: "compressed code",
    recon: "reconstruction",
    mean: "subtract feature means",
    project: "project onto directions",
    expand: "expand and add mean"
  },
  zh: {
    title: "PCA 记号地图",
    summary: "每个符号都是同一条流水线中的对象：原始表、中心化表、方向、压缩编码、重构。",
    aria: "从原始数据到重构的 PCA 公式流水线",
    raw: "原始数据",
    centered: "中心化数据",
    directions: "保留方向",
    code: "压缩编码",
    recon: "重构",
    mean: "减去特征均值",
    project: "投影到方向上",
    expand: "展开并加回均值"
  }
};

export default function PcaProjectionEquationFigure({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const steps = [
    { label: labels.raw, formula: "X", note: "n x d" },
    { label: labels.centered, formula: "X_c = X - 1mu^T", note: labels.mean },
    { label: labels.directions, formula: "W_k", note: "d x k" },
    { label: labels.code, formula: "Z = X_c W_k", note: labels.project },
    { label: labels.recon, formula: "X_hat = ZW_k^T + mu", note: labels.expand }
  ];

  return (
    <figure className="circuit-sat-demo">
      <figcaption>
        <span>{labels.title}</span>
        {labels.summary}
      </figcaption>
      <div className="pnp-card-grid" role="list" aria-label={labels.aria}>
        {steps.map((step) => (
          <article key={step.label} className={`pnp-card ${step.formula === "W_k" || step.formula.startsWith("Z") ? "accept" : ""}`} role="listitem">
            <strong>{step.label}</strong>
            <output>{step.formula}</output>
            <p>{step.note}</p>
          </article>
        ))}
      </div>
    </figure>
  );
}

