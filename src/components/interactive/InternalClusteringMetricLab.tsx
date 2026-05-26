import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  formatInternalMetric,
  internalClusteringPresets,
  internalMetricsFromPoints,
  type InternalClusteringPresetId
} from "./internalClusteringMetricsTrace";

const copy = {
  en: {
    title: "Internal clustering metric preset lab",
    preset: "Preset",
    reset: "Reset to compact islands",
    explanation: "Explanation",
    silhouette: "Silhouette",
    ch: "Calinski-Harabasz",
    db: "Davies-Bouldin",
    dunn: "Dunn",
    highBetter: "higher is better",
    lowBetter: "lower is better"
  },
  zh: {
    title: "内部聚类指标预设实验台",
    preset: "预设",
    reset: "重置为紧凑岛屿",
    explanation: "说明",
    silhouette: "轮廓系数",
    ch: "Calinski-Harabasz",
    db: "Davies-Bouldin",
    dunn: "Dunn",
    highBetter: "越高越好",
    lowBetter: "越低越好"
  }
};

export default function InternalClusteringMetricLab({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const presets = useMemo(() => [...internalClusteringPresets], []);
  const [activePresetId, setActivePresetId] = useState<InternalClusteringPresetId>("compact");
  const activePreset = presets.find((preset) => preset.id === activePresetId) ?? presets[0];
  const metrics = internalMetricsFromPoints(activePreset.points);

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
          <button type="button" onClick={() => setActivePresetId("compact")}>
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">{`${labels.explanation}: ${activePreset.explanation[lang]}`}</p>
      </div>

      <div className="pnp-card-grid">
        <article className="pnp-card">
          <strong>{labels.silhouette}</strong>
          <output>{formatInternalMetric(metrics.silhouette.value, lang)}</output>
          <p>{labels.highBetter}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.ch}</strong>
          <output>{formatInternalMetric(metrics.calinskiHarabasz.value, lang)}</output>
          <p>{labels.highBetter}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.db}</strong>
          <output>{formatInternalMetric(metrics.daviesBouldin.value, lang)}</output>
          <p>{labels.lowBetter}</p>
        </article>
        <article className="pnp-card">
          <strong>{labels.dunn}</strong>
          <output>{formatInternalMetric(metrics.dunn.value, lang)}</output>
          <p>{labels.highBetter}</p>
        </article>
        <article className="pnp-card">
          <strong>B_k</strong>
          <output>{formatInternalMetric(metrics.calinskiHarabasz.between, lang)}</output>
        </article>
        <article className="pnp-card">
          <strong>W_k</strong>
          <output>{formatInternalMetric(metrics.calinskiHarabasz.within, lang)}</output>
        </article>
        <article className="pnp-card">
          <strong>{lang === "en" ? "Min gap" : "最小间隔"}</strong>
          <output>{formatInternalMetric(metrics.dunn.minInterclusterDistance, lang)}</output>
        </article>
        <article className="pnp-card">
          <strong>{lang === "en" ? "Max diameter" : "最大直径"}</strong>
          <output>{formatInternalMetric(metrics.dunn.maxIntraclusterDiameter, lang)}</output>
        </article>
      </div>
    </section>
  );
}
