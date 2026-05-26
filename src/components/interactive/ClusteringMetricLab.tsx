import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  adjustedRandIndexFromExamples,
  clusteringPresets,
  formatClusteringMetric,
  fowlkesMallowsIndexFromExamples,
  pairStatsFromExamples,
  purityFromExamples,
  randIndexFromExamples,
  type ClusteringPresetId
} from "./clusteringMetricsTrace";

const copy = {
  en: {
    title: "Clustering metric preset lab",
    preset: "Preset",
    reset: "Reset to fixture",
    explanation: "Explanation",
    purity: "Purity",
    ri: "Rand Index",
    ari: "Adjusted Rand Index",
    fmi: "Fowlkes-Mallows Index"
  },
  zh: {
    title: "聚类指标预设实验台",
    preset: "预设",
    reset: "重置为固定样本",
    explanation: "说明",
    purity: "纯度",
    ri: "Rand 指数",
    ari: "调整 Rand 指数",
    fmi: "Fowlkes-Mallows 指数"
  }
};

export default function ClusteringMetricLab({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const presets = useMemo(() => [...clusteringPresets], []);
  const [activePresetId, setActivePresetId] = useState<ClusteringPresetId>("fixture");
  const activePreset = presets.find((preset) => preset.id === activePresetId) ?? presets[0];
  const pairStats = pairStatsFromExamples(activePreset.items);
  const purity = purityFromExamples(activePreset.items);
  const ri = randIndexFromExamples(activePreset.items);
  const ari = adjustedRandIndexFromExamples(activePreset.items);
  const fmi = fowlkesMallowsIndexFromExamples(activePreset.items);

  return (
    <section className="circuit-sat-demo" aria-label={labels.title}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="circuit-sat-row-grid">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === activePreset.id ? "active" : ""}
              onClick={() => setActivePresetId(preset.id)}
              aria-pressed={preset.id === activePreset.id}
              aria-label={`${labels.preset}: ${preset.label[lang]}`}
            >
              {preset.label[lang]}
            </button>
          ))}
        </div>
        <div className="controls">
          <button type="button" onClick={() => setActivePresetId("fixture")}>
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">{`${labels.explanation}: ${activePreset.explanation[lang]}`}</p>
      </div>

      <div className="pnp-card-grid">
        <article className="pnp-card">
          <strong>{labels.purity}</strong>
          <output>{formatClusteringMetric(purity.value, lang)}</output>
          <p>{`${purity.numerator}/${purity.denominator}`}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.ri}</strong>
          <output>{formatClusteringMetric(ri.value, lang)}</output>
          <p>{`${ri.numerator}/${ri.denominator}`}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.ari}</strong>
          <output>{formatClusteringMetric(ari.value, lang)}</output>
          <p>{`S=${ari.observedSamePairs}, E=${formatClusteringMetric(ari.expectedIndex, lang)}`}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.fmi}</strong>
          <output>{formatClusteringMetric(fmi.value, lang)}</output>
          <p>{`pair P=${formatClusteringMetric(fmi.pairPrecision, lang)}, pair R=${formatClusteringMetric(fmi.pairRecall, lang)}`}</p>
        </article>
        <article className="pnp-card">
          <strong>TP</strong>
          <output>{pairStats.tp}</output>
        </article>
        <article className="pnp-card">
          <strong>FP</strong>
          <output>{pairStats.fp}</output>
        </article>
        <article className="pnp-card">
          <strong>FN</strong>
          <output>{pairStats.fn}</output>
        </article>
        <article className="pnp-card">
          <strong>TN</strong>
          <output>{pairStats.tn}</output>
        </article>
      </div>
    </section>
  );
}
