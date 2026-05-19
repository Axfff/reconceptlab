import type { Locale } from "../../i18n/locales";
import {
  confusionMatrixExamples,
  finalCounts,
  labelForCell,
  classifyExample,
  positiveLabel
} from "./confusionMatrixTrace";
import {
  precisionFromCounts,
  precisionUnavailableText,
  type PrecisionResult
} from "./precisionTrace";
import { predictedPositiveExamples } from "./precisionTrace";

type ScenarioId = "hook-funnel" | "accuracy-vs-precision" | "precision-column" | "common-confusions" | "graph-strip";

type ScenarioText = {
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

const text: Record<ScenarioId, ScenarioText> = {
  "hook-funnel": {
    title: { en: "Spam alarm funnel", zh: "垃圾邮件告警漏斗" },
    summary: { en: "12 evaluated emails become 5 spam alarms before precision applies.", zh: "先经过 12 封邮件，只有 5 封会进入“预测为 spam”告警口。" }
  },
  "accuracy-vs-precision": {
    title: { en: "Accuracy vs precision contrast", zh: "准确率与精确率对比" },
    summary: {
      en: "Accuracy uses all predictions. Precision uses only predicted-positive examples.",
      zh: "准确率使用所有预测；精确率只看“预测为正类”的邮件。"
    }
  },
  "precision-column": {
    title: { en: "Predicted-positive column", zh: "预测正类列" },
    summary: { en: "This column has only TP and FP.", zh: "该列只包含“真正例”和“假正例”。" }
  },
  "common-confusions": {
    title: { en: "Common confusions", zh: "常见误区" },
    summary: {
      en: "A high precision does not mean no missed spam, and recall is a different question.",
      zh: "高精确率不等于不漏报，而“漏报率”属于另一类问题。"
    }
  },
  "graph-strip": {
    title: { en: "Graph strip", zh: "图谱走向" },
    summary: {
      en: "Precision is implemented as a follow-up from confusion-matrix and stays scoped to binary alarms.",
      zh: "精确率是混淆矩阵的后续，且问题只限于二分类正例预测。"
    }
  }
};

const predictedPositives = predictedPositiveExamples(confusionMatrixExamples, positiveLabel);
const outsideDenominator = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) !== "tp" && classifyExample(entry, positiveLabel) !== "fp");
const missedSpam = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "fn");

function englishBinary(value: string, lang: Locale) {
  return value === "spam" ? (lang === "en" ? "spam" : "垃圾邮件（spam）") : (lang === "en" ? "not-spam" : "非垃圾邮件（not-spam）");
}

function statusClass(cell: "tp" | "fp") {
  return cell === "tp" ? "circuit-sat-result-card accept" : "circuit-sat-result-card reject";
}

function accuracyAndPrecisionFinal(): PrecisionResult {
  return precisionFromCounts({
    tp: finalCounts.tp,
    fp: finalCounts.fp
  });
}

function card(
  entry: {
    id: string;
    subject: Record<Locale, string>;
    note: Record<Locale, string>;
    actual: "spam" | "not-spam";
    prediction: "spam" | "not-spam";
    cell: "tp" | "fp" | "tn" | "fn";
  },
  lang: Locale,
  extraClass = ""
) {
  const meta = labelForCell(entry.cell, lang);
  const shouldShowCell = entry.cell === "tp" || entry.cell === "fp";
  return (
    <article key={entry.id} className={`pnp-card ${extraClass}`}>
      <strong>{entry.id}</strong>
      <p>{entry.subject[lang]}</p>
      <p className="circuit-sat-legend">{entry.note[lang]}</p>
      <p>
        {`actual: ${englishBinary(entry.actual, lang)}, predicted: ${englishBinary(entry.prediction, lang)}${shouldShowCell ? `, ${meta.code}: ${meta.full}` : ""}`}
      </p>
    </article>
  );
}

function renderAccuracyVsPrecision(locale: Locale) {
  const precision = accuracyAndPrecisionFinal();
  const accuracyNumerator = finalCounts.tp + finalCounts.tn;
  const accuracy = accuracyNumerator / 12;
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <strong>{locale === "en" ? "Accuracy" : "准确率（accuracy）"}</strong>
        <p>{`${locale === "en" ? "Question:" : "问题："} ${locale === "en" ? "How many of all emails were correct?" : "全部邮件里有多少是对的？"}`}</p>
        <p>{`(${accuracyNumerator} / 12 = ${(accuracy * 100).toFixed(1)}%)`}</p>
      </article>
      <article className="pnp-card">
        <strong>{locale === "en" ? "Precision" : "精确率（precision）"}</strong>
        <p>{`${locale === "en" ? "Question:" : "问题："} ${locale === "en" ? "How many spam alarms were correct?" : "有多少个“spam 预警”是对的？"}`}</p>
        <p>{`(${precision.numerator} / ${precision.denominator} = ${(precision.value ?? 0).toFixed(3).replace(/\.?0+$/, "")})`}</p>
      </article>
    </div>
  );
}

function renderPrecisionColumn(locale: Locale) {
  const tp = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "tp");
  const fp = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "fp");
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <strong>TP ({tp.length})</strong>
        <p>{locale === "en" ? "Predicted spam and actually spam." : "预测为 spam 且真实为 spam（对告警）。"}</p>
        <div className="pnp-card-grid">
          {tp.map((entry) => card({ ...entry, cell: "tp" }, locale, statusClass("tp")))}
        </div>
      </article>
      <article className="pnp-card">
        <strong>FP ({fp.length})</strong>
        <p>{locale === "en" ? "Predicted spam and actually not-spam." : "预测为 spam 但真实为 not-spam（误报）。"}</p>
        <div className="pnp-card-grid">
          {fp.map((entry) => card({ ...entry, cell: "fp" }, locale, statusClass("fp")))}
        </div>
      </article>
      <article className="pnp-card">
        <strong>{locale === "en" ? "Ignored by precision denominator" : "精确率分母中不计入"}</strong>
        <p>{`${locale === "en" ? "TN + FN outside denominator" : "TN + FN 在分母之外"} (${outsideDenominator.length})`}</p>
        <p>{outsideDenominator.map((entry) => entry.id).join(", ")}</p>
      </article>
    </div>
  );
}

function renderCommonConfusions(locale: Locale) {
  const tableRows: Array<{ row: string; point: string }> = [
    { row: "e3", point: locale === "en" ? "False alarm (FP) — hurts trust." : "误报（FP）— 会降低信心。" },
    { row: "e4", point: locale === "en" ? "Missed spam (FN) — ignored by precision denominator." : "漏报（FN）— 不在分母内。" },
    { row: "e8", point: locale === "en" ? "Missed spam (FN) — still outside precision denominator." : "漏报（FN）— 同样在分母之外。" },
    { row: "e12", point: locale === "en" ? "Missed spam (FN) — still outside precision denominator." : "漏报（FN）— 仍在分母之外。" }
  ];

  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <strong>{locale === "en" ? "Boundary check" : "分母边界检查"}</strong>
        <table className="pnp-mini-table">
          <thead>
            <tr>
              <th>{locale === "en" ? "Example" : "示例"}</th>
              <th>{locale === "en" ? "Why precision still reads 3/5" : "为何精确率仍是 3/5"}</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.row}>
                <th scope="row">{row.row}</th>
                <td>{row.point}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <article className="pnp-card">
        <strong>{locale === "en" ? "Missed spam outside denominator" : "分母外的漏报（spam）"}</strong>
        <p>{missedSpam.map((entry) => entry.id).join(", ")}</p>
      </article>
      <article className="pnp-card">
        <strong>{locale === "en" ? "Zero-denominator display" : "零分母展示"}</strong>
        <p>{precisionUnavailableText(locale)}</p>
      </article>
    </div>
  );
}

function renderGraphStrip(locale: Locale) {
  return (
    <div className="circuit-sat-graph-strip">
      <div>
        <strong>confusion-matrix</strong>
        <p>{locale === "en" ? "implemented" : "已实现"}</p>
      </div>
      <span>→</span>
      <div>
        <strong>precision</strong>
        <p>{locale === "en" ? "implemented" : "已实现"}</p>
      </div>
    </div>
  );
}

export default function PrecisionScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const copy = text[scenarioId];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{copy.title[lang]}</strong>
        <span>{copy.summary[lang]}</span>
      </figcaption>

      {scenarioId === "hook-funnel" ? (
        <div className="demo-grid">
          <section>
            <h4>{lang === "en" ? "All 12 evaluated emails" : "全部 12 封评估邮件"}</h4>
            <p>{lang === "en" ? "Each email has an actual label and a predicted label." : "每封邮件都保留真实标签和模型预测。"}
            </p>
            <div className="pnp-card-grid">
              {confusionMatrixExamples.map((entry) => card(
                { ...entry, cell: classifyExample(entry, positiveLabel) },
                lang,
                entry.prediction === positiveLabel ? statusClass(classifyExample(entry, positiveLabel) as "tp" | "fp") : ""
              ))}
            </div>
          </section>
          <section>
            <h4>{lang === "en" ? "Predicted-spam alarms only (5)" : "仅“预测为 spam”告警（5 条）"}</h4>
            <p>{localeMessage(lang)}</p>
            <div className="pnp-card-grid">
              {predictedPositives.map((entry) => {
                const cell = classifyExample(entry, positiveLabel) as "tp" | "fp";
                return card({ ...entry, cell }, lang, statusClass(cell));
              })}
            </div>
          </section>
        </div>
      ) : null}

      {scenarioId === "accuracy-vs-precision" ? renderAccuracyVsPrecision(lang) : null}
      {scenarioId === "precision-column" ? renderPrecisionColumn(lang) : null}
      {scenarioId === "common-confusions" ? renderCommonConfusions(lang) : null}
      {scenarioId === "graph-strip" ? renderGraphStrip(lang) : null}
    </figure>
  );
}

function localeMessage(lang: Locale) {
  return lang === "en"
    ? `These are the five messages used as denominator in precision: ${predictedPositives.map((example) => example.id).join(", ")}.`
    : `这 5 封邮件进入精确率分母：${predictedPositives.map((entry) => entry.id).join(", ")}。`;
}
