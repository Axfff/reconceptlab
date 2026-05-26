import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { formatPcaNumber, reconstructionComparisons } from "./pcaTrace";

const copy = {
  en: {
    title: "Reconstruction comparison",
    summary: "The bars show total squared reconstruction error in the original unstandardized two-feature space.",
    aria: "Compare PCA reconstruction errors against raw-column baselines",
    error: "sum squared error"
  },
  zh: {
    title: "重构对比",
    summary: "条形图显示原始、未标准化二维特征空间中的平方重构误差总和。",
    aria: "比较 PCA 重构误差和原始列基线",
    error: "平方误差总和"
  }
};

export default function PcaReconstructionToggle({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const comparisons = reconstructionComparisons();
  const [activeId, setActiveId] = useState("keep-pc1");
  const active = comparisons.find((row) => row.id === activeId) ?? comparisons[2];
  const maxError = Math.max(...comparisons.map((row) => row.error));

  return (
    <section className="circuit-sat-demo" aria-label={labels.aria}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="circuit-sat-row-grid">
          {comparisons.map((row) => (
            <button
              key={row.id}
              type="button"
              className={row.id === activeId ? "active" : ""}
              aria-pressed={row.id === activeId}
              onClick={() => setActiveId(row.id)}
            >
              {row.label[lang]}
              <span>{formatPcaNumber(row.error, lang, 2)}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite">{`${active.label[lang]}: ${labels.error} ${formatPcaNumber(active.error, lang, 2)}. ${active.explanation[lang]}`}</p>
        <p>{labels.summary}</p>
      </div>
      <div className="pnp-card-grid">
        {comparisons.map((row) => (
          <article key={row.id} className={`pnp-card ${row.id === activeId ? "accept" : ""}`}>
            <strong>{row.label[lang]}</strong>
            <output>{formatPcaNumber(row.error, lang, 2)}</output>
            <div aria-hidden="true" style={{ background: "var(--line)", borderRadius: 999, height: 10, marginTop: 8 }}>
              <div
                style={{
                  background: row.id.includes("pc") ? "var(--rcl-accent)" : "var(--rcl-secondary)",
                  borderRadius: 999,
                  height: "100%",
                  width: `${Math.max(row.error === 0 ? 0 : 4, (row.error / maxError) * 100)}%`
                }}
              />
            </div>
            <p>{row.explanation[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

