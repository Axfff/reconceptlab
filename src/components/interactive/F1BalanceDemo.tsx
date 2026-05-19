import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  arithmeticMean,
  f1FromCounts,
  formatMetric,
  f1Presets,
  type F1PresetId
} from "./f1ScoreTrace";

const labels = {
  en: {
    title: "F1 preset balance lab",
    preset: "Preset",
    reset: "Reset to fixture",
    precision: "Precision",
    recall: "Recall",
    mean: "Arithmetic mean",
    f1: "F1",
  tp: "TP",
  fp: "FP",
  fn: "FN",
  tn: "TN",
  explanation: "Explanation"
  },
  zh: {
    title: "F1 平衡实验台",
    preset: "预设",
    reset: "重置为固定样本",
    precision: "精确率",
    recall: "召回率",
    mean: "算术平均",
    f1: "F1",
    tp: "TP",
    fp: "FP",
  fn: "FN",
  tn: "TN",
  explanation: "说明"
  }
};

function explanationText(presetId: F1PresetId, locale: Locale) {
  const found = f1Presets.find((preset) => preset.id === presetId);
  return found ? found.explanation[locale] : "";
}

function tnLabelForPreset(presetId: F1PresetId, locale: Locale) {
  if (presetId === "fixture") {
    return locale === "en" ? "4" : "4（来自固定样本）";
  }
  return locale === "en" ? "not required for F1" : "F1 计算中未使用";
}

export default function F1BalanceDemo({ lang }: { lang: Locale }) {
  const copy = labels[lang];
  const presets = useMemo(() => [...f1Presets], []);
  const fixture = presets.find((preset) => preset.id === "fixture")?.id ?? "fixture";
  const [activePresetId, setActivePresetId] = useState<F1PresetId>(fixture);

  const activePreset = presets.find((preset) => preset.id === activePresetId) ?? presets[0];
  const activeResult = f1FromCounts(activePreset.counts);
  const average = arithmeticMean(activeResult.precision, activeResult.recall);
  const presetCounts = {
    tp: activePreset.counts.tp,
    fp: activePreset.counts.fp,
    fn: activePreset.counts.fn
  };
  const tnText = tnLabelForPreset(activePreset.id, lang);

  return (
    <section className="circuit-sat-demo" aria-label={copy.title}>
      <div className="state-panel">
        <p className="state-label">{copy.title}</p>
        <div className="circuit-sat-row-grid">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === activePreset.id ? "active" : ""}
              onClick={() => setActivePresetId(preset.id)}
              aria-pressed={preset.id === activePreset.id}
              aria-label={`${copy.preset}: ${preset.label[lang]}`}
            >
              {preset.label[lang]}
            </button>
          ))}
        </div>

        <div className="controls">
          <button type="button" onClick={() => setActivePresetId(fixture)}>
            {copy.reset}
          </button>
        </div>

        <p aria-live="polite">
          {`${copy.explanation}: ${explanationText(activePreset.id, lang)} (TP=${presetCounts.tp}, FP=${presetCounts.fp}, FN=${presetCounts.fn}, TN=${tnText})`}
        </p>
      </div>

      <div className="pnp-card-grid">
        <article className="pnp-card">
          <strong>{copy.precision}</strong>
          <output>{formatMetric(activeResult.precision, lang)}</output>
          <p>Numerator = TP, Denominator = TP + FP</p>
        </article>
        <article className="pnp-card">
          <strong>{copy.recall}</strong>
          <output>{formatMetric(activeResult.recall, lang)}</output>
          <p>Numerator = TP, Denominator = TP + FN</p>
        </article>
        <article className="pnp-card">
          <strong>{copy.mean}</strong>
          <output>{formatMetric(average, lang)}</output>
          <p> (P + R) / 2 </p>
        </article>
        <article className="pnp-card">
          <strong>{copy.f1}</strong>
          <output>{formatMetric(activeResult.value, lang)}</output>
          <p>2TP / (2TP + FP + FN)</p>
        </article>
        <article className="pnp-card">
          <strong>{copy.tp}</strong>
          <output>{presetCounts.tp}</output>
        </article>
        <article className="pnp-card">
          <strong>{copy.fp}</strong>
          <output>{presetCounts.fp}</output>
        </article>
        <article className="pnp-card">
          <strong>{copy.fn}</strong>
          <output>{presetCounts.fn}</output>
        </article>
        <article className="pnp-card">
          <strong>{copy.tn}</strong>
          <output>{tnText}</output>
        </article>
      </div>
    </section>
  );
}
