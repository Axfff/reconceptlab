import type { Locale } from "../../i18n/locales";
import { f1FromCounts, f1FromPrecisionRecall, f1Presets } from "./f1ScoreTrace";

type ScenarioId =
  | "metric-cards"
  | "naive-vs-harmonic"
  | "extreme-imbalance"
  | "formula-count"
  | "harmonic-balance"
  | "edge-cases"
  | "correctness-panel"
  | "complexity"
  | "common-confusions"
  | "graph-strip";

type ScenarioText = {
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

const text: Record<ScenarioId, ScenarioText> = {
  "metric-cards": {
    title: {
      en: "Metric cards",
      zh: "指标卡片"
    },
    summary: {
      en: "From the fixed confusion-matrix counts, precision is 3/5 and recall is 3/6.",
      zh: "基于固定混淆矩阵计数，精确率为 3/5，召回率为 3/6。"
    }
  },
  "naive-vs-harmonic": {
    title: {
      en: "Arithmetic mean first",
      zh: "先看算术平均"
    },
    summary: {
      en: "Same inputs can look close under arithmetic mean, so the next step is balance-specific comparison.",
      zh: "同一输入在算术平均下看起来接近，需要换成平衡感知比较。"
    }
  },
  "extreme-imbalance": {
    title: {
      en: "Extreme imbalance",
      zh: "极端失衡"
    },
    summary: {
      en: "A high score on one side can still hide weakness in the other.",
      zh: "单侧高分会掩盖另一侧的薄弱。"
    }
  },
  "formula-count": {
    title: {
      en: "Formula and count form",
      zh: "公式与计数形式"
    },
    summary: {
      en: "Both definitions should compute the same value for valid counts.",
      zh: "对于有效计数，两种形式应给出同一结果。"
    }
  },
  "harmonic-balance": {
    title: {
      en: "Harmonic balance",
      zh: "调和平衡"
    },
    summary: {
      en: "The harmonic result moves toward the smaller metric.",
      zh: "调和结果向较小指标偏移。"
    }
  },
  "edge-cases": {
    title: {
      en: "Unavailability and zero branches",
      zh: "不可用与零值分支"
    },
    summary: {
      en: "Branching explicitly separates unavailable from zero.",
      zh: "分支要明确区分“不可用”与“0”。"
    }
  },
  "correctness-panel": {
    title: {
      en: "FP/FN/TN effect panel",
      zh: "FP/FN/TN 影响面板"
    },
    summary: {
      en: "FP and FN affect precision and recall; TN stays outside the formula.",
      zh: "FP 与 FN 影响精确率和召回率，TN 不进入公式。"
    }
  },
  "complexity": {
    title: {
      en: "Complexity",
      zh: "复杂度"
    },
    summary: {
      en: "Count once, compute many; both are explicit and cheap.",
      zh: "先计数后计算，步骤清晰且开销很小。"
    }
  },
  "common-confusions": {
    title: {
      en: "Common confusions",
      zh: "常见误区"
    },
    summary: {
      en: "F1 is neither raw accuracy nor raw recall.",
      zh: "F1 既不是原始准确率，也不是单一召回率。"
    }
  },
  "graph-strip": {
    title: {
      en: "Node connection",
      zh: "节点连接"
    },
    summary: {
      en: "This node depends on precision and recall.",
      zh: "该节点依赖精确率和召回率。"
    }
  }
};

const precision = 3 / 5;
const recall = 3 / 6;
const fixtureResult = f1FromCounts({ tp: 3, fp: 2, fn: 3 });

function unavailableText(locale: Locale) {
  return locale === "en" ? "not available" : "不可用";
}

function percentText(value: number | null, locale: Locale) {
  if (value === null) return unavailableText(locale);
  return `${(value * 100).toFixed(1)}%`;
}

function renderMetricCards(locale: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Precision (P)" : "精确率 P"}</strong>
        <output>{percentText(precision, locale)}</output>
        <progress value={precision} max={1} aria-label={locale === "en" ? "Precision" : "精确率"} />
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Recall (R)" : "召回率 R"}</strong>
        <output>{percentText(recall, locale)}</output>
        <progress value={recall} max={1} aria-label={locale === "en" ? "Recall" : "召回率"} />
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Arithmetic mean" : "算术平均"}</strong>
        <output>{percentText((precision + recall) / 2, locale)}</output>
        <p>{locale === "en" ? "not final" : "暂不代表平衡"}</p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>F1</strong>
        <output>{fixtureResult.value === null ? unavailableText(locale) : percentText(fixtureResult.value, locale)}</output>
        <p>{locale === "en" ? "computed next step" : "下一步计算"}</p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Count form denominator" : "计数分母"} (2TP + FP + FN)</strong>
        <output>{fixtureResult.denominator}</output>
      </article>
    </div>
  );
}

function renderNaiveVsHarmonic(locale: Locale) {
  const mean = (precision + recall) / 2;
  const harmonic = f1FromPrecisionRecall(precision, recall).value;
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Pair used" : "使用输入"}</strong>
        <p>{locale === "en" ? "P = 0.6, R = 0.5" : "P = 0.6，R = 0.5"}</p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Arithmetic mean" : "算术平均"}</strong>
        <output>{percentText(mean, locale)}</output>
      </article>
      <article className="circuit-sat-result-card">
        <strong>F1</strong>
        <output>{harmonic === null ? unavailableText(locale) : percentText(harmonic, locale)}</output>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Quick read" : "快速判断"}</strong>
        <p>
          {locale === "en"
            ? "The average can be similar for different pairs, but the balance score differs."
            : "算术平均在不同配对下可能接近，但平衡分会显著不同。"}
        </p>
      </article>
    </div>
  );
}

function renderExtremeCase(locale: Locale) {
  const cases = f1Presets.filter(
    (preset) => preset.id === "high-precision-low-recall" || preset.id === "low-precision-high-recall"
  );
  return (
    <div className="pnp-card-grid">
      {cases.map((preset) => {
        const result = f1FromCounts(preset.counts);
        const arithmetic = ((result.precision ?? 0) + (result.recall ?? 0)) / 2;
        return (
          <article key={preset.id} className="circuit-sat-result-card">
            <strong>{preset.label[locale]}</strong>
            <p>
              {preset.id === "high-precision-low-recall"
                ? locale === "en"
                  ? "P = 1.0, R = 0.1"
                  : "P = 1.0，R = 0.1"
                : locale === "en"
                  ? "P = 0.1, R = 1.0"
                  : "P = 0.1，R = 1.0"}
            </p>
            <p>{locale === "en" ? "Arithmetic" : "算术平均"} = {percentText(arithmetic, locale)}</p>
            <p>F1 = {result.value === null ? unavailableText(locale) : percentText(result.value, locale)}</p>
          </article>
        );
      })}
    </div>
  );
}

function renderFormulaCount(locale: Locale) {
  const countFormText = `2×TP / (2×TP + FP + FN) = 2×3 / (2×3 + 2 + 3) = ${(fixtureResult.value ?? 0).toFixed(3)}`;
  const metricFormText = `2PR / (P + R) = 2×${precision}×${recall}/(${precision}+${recall})`;
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Metric form" : "指标形式"}</strong>
        <p>{metricFormText}</p>
        <output>{fixtureResult.value === null ? unavailableText(locale) : fixtureResult.value.toFixed(3)}</output>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Count form" : "计数形式"}</strong>
        <p>{countFormText}</p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Agreement check" : "一致性检查"}</strong>
        <p>
          {locale === "en" ? "Both formulas land on 0.545." : "两种公式都落在 0.545。"}
        </p>
      </article>
    </div>
  );
}

function renderHarmonicBalance(locale: Locale) {
  const value = fixtureResult.value;
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>Precision</strong>
        <progress value={precision} max={1} />
      </article>
      <article className="circuit-sat-result-card">
        <strong>Recall</strong>
        <progress value={recall} max={1} />
      </article>
      <article className="circuit-sat-result-card">
        <strong>F1</strong>
        <progress value={value ?? 0} max={1} />
        <output>{value === null ? unavailableText(locale) : percentText(value, locale)}</output>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Balance read" : "平衡读数"}</strong>
        <p>
          {locale === "en"
            ? "The result is closer to the smaller bar, so one weak side limits score."
            : "结果更接近较小的一边，说明弱侧会限制整体分数。"}
        </p>
      </article>
    </div>
  );
}

function renderEdgeCases(locale: Locale) {
  return (
    <table className="pnp-mini-table">
      <caption>{locale === "en" ? "F1 branch table" : "F1 分支表"}</caption>
      <thead>
        <tr>
          <th>{locale === "en" ? "Case" : "情形"}</th>
          <th>TP</th>
          <th>FP</th>
          <th>FN</th>
          <th>2TP + FP + FN</th>
          <th>{locale === "en" ? "Precision value" : "精确率"}</th>
          <th>{locale === "en" ? "Recall value" : "召回率"}</th>
          <th>F1</th>
        </tr>
      </thead>
      <tbody>
        {f1Presets
          .filter((preset) => ["no-positive-evidence", "errors-no-true-positives", "fixture"].includes(preset.id))
          .map((preset) => {
            const result = f1FromCounts(preset.counts);
            return (
              <tr key={preset.id}>
                <th scope="row">{preset.label[locale]}</th>
                <td>{preset.counts.tp}</td>
                <td>{preset.counts.fp}</td>
                <td>{preset.counts.fn}</td>
                <td>{result.denominator}</td>
                <td>{result.precision === null ? unavailableText(locale) : result.precision.toFixed(3)}</td>
                <td>{result.recall === null ? unavailableText(locale) : result.recall.toFixed(3)}</td>
                <td>{result.value === null ? unavailableText(locale) : result.value.toFixed(3)}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

function renderCorrectnessPanel(locale: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>FP</strong>
        <p>{locale === "en" ? "Increases precision denominator only." : "只增加精确率分母。"} </p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>FN</strong>
        <p>{locale === "en" ? "Increases recall denominator only." : "只增加召回率分母。"} </p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>TN</strong>
        <p>{locale === "en" ? "Not used in precision/recall, so not used in F1." : "不参与 precision/recall，因此不影响 F1。"} </p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>Fixture</strong>
        <p>TP=3, FP=2, FN=3, TN=4</p>
      </article>
    </div>
  );
}

function renderComplexity(locale: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Known counts" : "已有计数"}</strong>
        <p>{locale === "en" ? "O(1) time, O(1) space." : "时间 O(1)，空间 O(1)。"}</p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "From examples" : "从原始样本"}</strong>
        <p>{locale === "en" ? "Scan once to get TP/FP/FN, then O(1)." : "先扫描一次得到 TP/FP/FN，再 O(1)。"}</p>
      </article>
    </div>
  );
}

function renderCommonConfusions(locale: Locale) {
  return (
    <div className="pnp-card-grid">
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Not accuracy" : "不是准确率"}</strong>
        <p>{locale === "en" ? "Accuracy mixes TN and FN differently." : "准确率对 TN/FN 的处理不同。"} </p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Not raw recall" : "不是原始召回"}</strong>
        <p>{locale === "en" ? "F1 combines normalized precision and recall." : "F1 先标准化再合成。"} </p>
      </article>
      <article className="circuit-sat-result-card">
        <strong>{locale === "en" ? "Not one-sided" : "不是单侧依赖"}</strong>
        <p>{locale === "en" ? "Both precision and recall must be strong." : "精确率和召回率都要强。"} </p>
      </article>
    </div>
  );
}

function renderGraphStrip(locale: Locale) {
  return (
    <div className="circuit-sat-graph-strip">
      <div>
        <strong>precision</strong>
        <p>{locale === "en" ? "implemented" : "已实现"}</p>
      </div>
      <span>+</span>
      <div>
        <strong>recall</strong>
        <p>{locale === "en" ? "implemented" : "已实现"}</p>
      </div>
      <span>→</span>
      <div>
        <strong>f1-score</strong>
        <p>{locale === "en" ? "implemented" : "已实现"}</p>
      </div>
    </div>
  );
}

export default function F1ScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const copy = text[scenarioId];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{copy.title[lang]}</strong>
        <span>{copy.summary[lang]}</span>
      </figcaption>

      {scenarioId === "metric-cards" ? renderMetricCards(lang) : null}
      {scenarioId === "naive-vs-harmonic" ? renderNaiveVsHarmonic(lang) : null}
      {scenarioId === "extreme-imbalance" ? renderExtremeCase(lang) : null}
      {scenarioId === "formula-count" ? renderFormulaCount(lang) : null}
      {scenarioId === "harmonic-balance" ? renderHarmonicBalance(lang) : null}
      {scenarioId === "edge-cases" ? renderEdgeCases(lang) : null}
      {scenarioId === "correctness-panel" ? renderCorrectnessPanel(lang) : null}
      {scenarioId === "complexity" ? renderComplexity(lang) : null}
      {scenarioId === "common-confusions" ? renderCommonConfusions(lang) : null}
      {scenarioId === "graph-strip" ? renderGraphStrip(lang) : null}
    </figure>
  );
}
