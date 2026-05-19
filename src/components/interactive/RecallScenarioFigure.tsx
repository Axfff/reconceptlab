import type { Locale } from "../../i18n/locales";
import {
  confusionMatrixExamples,
  finalCounts,
  labelForCell,
  classifyExample,
  positiveLabel
} from "./confusionMatrixTrace";

type ScenarioId =
  | "hook-funnel"
  | "accuracy-vs-recall"
  | "missed-spam"
  | "actual-positive-row"
  | "recall-fraction"
  | "common-confusions"
  | "edge-case"
  | "implementation"
  | "graph-strip";

type ScenarioText = {
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

const text: Record<ScenarioId, ScenarioText> = {
  "hook-funnel": {
    title: { en: "From 12 messages to 6 actual spam", zh: "从 12 封邮件到 6 封真实 spam" },
    summary: {
      en: "Recall only asks about what was really positive, so the denominator is fixed to actual spam rows.",
      zh: "召回率只回答“真实为正类”问题，所以分母是实际 spam 的样本。"
    }
  },
  "accuracy-vs-recall": {
    title: { en: "Accuracy vs recall contrast", zh: "准确率与召回率对比" },
    summary: {
      en: "Accuracy uses all 12 predictions; recall uses only actual spam examples.",
      zh: "准确率看全部 12 条，召回率只看真实为 spam 的 6 条。"
    }
  },
  "missed-spam": {
    title: { en: "Missed spam pain", zh: "漏报带来的压力" },
    summary: {
      en: "False negatives are outside the actual-positive numerator but inside the denominator because they were real positives.",
      zh: "假负例（FN）是漏报，计入 actual-positive 分母。"
    }
  },
  "actual-positive-row": {
    title: { en: "Actual-positive matrix row", zh: "真实正类行" },
    summary: {
      en: "Rows are actual labels, columns are predictions. Recall reads the actual-positive row: TP + FN.",
      zh: "行是真实标签，列是模型预测。召回率读真实正类行的 TP + FN。"
    }
  },
  "recall-fraction": {
    title: { en: "Numerator / denominator split", zh: "分子 / 分母拆分" },
    summary: {
      en: "For this fixture, caught spam is `TP`, and all real spam is `TP + FN`.",
      zh: "在该样本中，命中 spam 的数是 TP，所有真实 spam 是 TP + FN。"
    }
  },
  "common-confusions": {
    title: { en: "Common confusions", zh: "常见误区" },
    summary: {
      en: "Recall is a coverage metric over real positives, not a trust metric over alarms.",
      zh: "召回率衡量真实正类覆盖率，不是告警可信度。"
    }
  },
  "edge-case": {
    title: { en: "Zero-denominator edge case", zh: "零分母边界情况" },
    summary: {
      en: "When there is no actual-positive example, recall is undefined and rendered as not available.",
      zh: "如果没有真实正类样本，召回率未定义，应显示不可用。"
    }
  },
  implementation: {
    title: { en: "Implementation branch table", zh: "实现分支表" },
    summary: {
      en: "Keep the same scan or counts, then branch on denominator zero before formatting.",
      zh: "先得到 TP/FN 计数，再在分母为零时分支，最后再格式化输出。"
    }
  },
  "graph-strip": {
    title: { en: "Graph strip", zh: "图谱走向" },
    summary: {
      en: "Recall is implemented from confusion-matrix and can optionally be contrasted with precision.",
      zh: "召回率由混淆矩阵派生，后续可与精确率进行边界对比。"
    }
  }
};

function binaryLabel(value: "spam" | "not-spam", lang: Locale) {
  return value === "spam" ? (lang === "en" ? "spam" : "垃圾邮件（spam）") : (lang === "en" ? "not-spam" : "非垃圾邮件（not-spam）");
}

function statusClass(cell: "tp" | "fp" | "tn" | "fn") {
  return cell === "tp" ? "accept" : cell === "fn" ? "reject" : "";
}

function EmailCard({
  id,
  subject,
  note,
  actual,
  prediction,
  cell,
  lang
}: {
  id: string;
  subject: string;
  note: string;
  actual: "spam" | "not-spam";
  prediction: "spam" | "not-spam";
  cell: "tp" | "fp" | "tn" | "fn";
  lang: Locale;
}) {
  const meta = labelForCell(cell, lang);
  return (
    <article className={`pnp-card ${statusClass(cell)}`}>
      <strong>{id}</strong>
      <p>{subject}</p>
      <p>{note}</p>
      <p>{`actual: ${binaryLabel(actual, lang)}, predicted: ${binaryLabel(prediction, lang)} (${meta.code}: ${meta.full})`}</p>
    </article>
  );
}

export default function RecallScenarioFigure({
  lang,
  scenarioId
}: {
  lang: Locale;
  scenarioId: ScenarioId;
}) {
  const t = text[scenarioId];
  const tpExamples = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "tp");
  const fnExamples = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "fn");
  const fpExamples = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "fp");
  const tnExamples = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === "tn");
  const actualSpam = [...tpExamples, ...fnExamples];
  const outsideActual = [...fpExamples, ...tnExamples];
  const total = confusionMatrixExamples.length;
  const totalCorrect = finalCounts.tp + finalCounts.tn;
  const recallResult = { numerator: finalCounts.tp, denominator: finalCounts.tp + finalCounts.fn, value: finalCounts.tp / (finalCounts.tp + finalCounts.fn) };

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{t.title[lang]}</strong>
        <span>{t.summary[lang]}</span>
      </figcaption>

      {scenarioId === "hook-funnel" ? (
        <div className="pnp-card-grid">
          {confusionMatrixExamples.map((entry) => (
            <EmailCard
              key={entry.id}
              id={entry.id}
              subject={entry.subject[lang]}
              note={entry.note[lang]}
              actual={entry.actual}
              prediction={entry.prediction}
              cell={classifyExample(entry, positiveLabel)}
              lang={lang}
            />
          ))}
          <article className="pnp-card">
            <strong>{lang === "en" ? "Recall denominator summary" : "召回率分母摘要"}</strong>
            <p>{`actual positives = TP + FN = ${actualSpam.length}`}</p>
            <p>{lang === "en" ? "TP ids:" : "TP 标识："} {tpExamples.map((entry) => entry.id).join(", ")}</p>
            <p>{lang === "en" ? "FN ids:" : "FN 标识："} {fnExamples.map((entry) => entry.id).join(", ")}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "accuracy-vs-recall" ? (
        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{lang === "en" ? "Accuracy question" : "准确率问题"}</strong>
            <p>{lang === "en" ? "All 12 predictions are in scope." : "全部 12 条预测都在分母内。"}</p>
            <p>{`${lang === "en" ? "Numerator =" : "分子 ="} TP + TN = ${totalCorrect}`}</p>
            <p>{`Accuracy = ${totalCorrect} / ${total} = ${(totalCorrect / total * 100).toFixed(1)}%`}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Recall question" : "召回率问题"}</strong>
            <p>{lang === "en" ? "Only actual-positive examples are in scope." : "仅真实正类样本在分母中。"}</p>
            <p>{`${lang === "en" ? "Denominator = TP + FN = " : "分母 = TP + FN = "}${recallResult.denominator}`}</p>
            <p>{`${lang === "en" ? "Numerator = TP = " : "分子 = TP = "}${recallResult.numerator}`}</p>
            <p>{`Recall = ${recallResult.numerator}/${recallResult.denominator} = ${recallResult.value.toFixed(1)}`}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Outside recall denominator" : "召回率分母之外"}</strong>
            <p>{`${lang === "en" ? "Actual negatives (6):" : "真实负类（6）:"} ${outsideActual.map((entry) => entry.id).join(", ")}`}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "missed-spam" ? (
        <div className="pnp-card-grid">
          {fnExamples.map((entry) => (
            <EmailCard
              key={entry.id}
              id={entry.id}
              subject={entry.subject[lang]}
              note={entry.note[lang]}
              actual={entry.actual}
              prediction={entry.prediction}
              cell="fn"
              lang={lang}
            />
          ))}
          <article className="pnp-card">
            <strong>{lang === "en" ? "Why it hurts" : "为什么受影响"}</strong>
            <p>{lang === "en" ? "These are real spam emails that were not caught." : "这些都是真实垃圾邮件但没有被捕获。"}</p>
            <p>{lang === "en" ? `Missed count: ${fnExamples.length}` : `漏报数量：${fnExamples.length}`}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Recall denominator check" : "召回率分母核验"}</strong>
            <p>{lang === "en" ? "Each missed sample still contributes to the denominator." : "每个漏报仍然计入分母（FN）。"}</p>
            <p>{lang === "en" ? "Formula: TP + FN." : "公式：TP + FN。"}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "actual-positive-row" ? (
        <div>
          <p className="circuit-sat-legend">
            {lang === "en"
              ? "Positive-label orientation: rows are actual, columns are predicted."
              : "方向约定：行是实际标签，列是预测标签。"}
          </p>
          <table className="pnp-mini-table">
            <caption>{lang === "en" ? "Actual-positive row (row-level view)" : "真实正类行（按行查看）"}</caption>
            <thead>
              <tr>
                <th>{lang === "en" ? "actual \\ predicted" : "真实 \\ 预测"}</th>
                <th>{lang === "en" ? "predicted spam" : "预测为 spam"}</th>
                <th>{lang === "en" ? "predicted not-spam" : "预测为非垃圾"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{lang === "en" ? "actual spam" : "真实 spam"}</th>
                <td>{`TP (${tpExamples.length}): ${tpExamples.map((entry) => entry.id).join(", ")}`}</td>
                <td>{`FN (${fnExamples.length}): ${fnExamples.map((entry) => entry.id).join(", ")}`}</td>
              </tr>
            </tbody>
          </table>
          <p className="circuit-sat-legend">
            {lang === "en" ? `Recall reads TP + FN = ${recallResult.denominator}.` : `召回率读取 TP + FN = ${recallResult.denominator}。`}
          </p>
        </div>
      ) : null}

      {scenarioId === "recall-fraction" ? (
        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{lang === "en" ? "Numerator (caught real spam)" : "分子（捕获的真实 spam）"}</strong>
            <p>{lang === "en" ? "TP from the actual-positive row." : "来自真实正类行的 TP。"}
            </p>
            <p>{tpExamples.length} ({tpExamples.map((entry) => entry.id).join(", ")})</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Denominator (all actual spam)" : "分母（所有真实 spam）"}</strong>
            <p>{lang === "en" ? "TP + FN from the actual-positive row." : "真实正类行里的 TP + FN。"}
            </p>
            <p>{recallResult.denominator} ({actualSpam.map((entry) => entry.id).join(", ")})</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Result" : "结果"}</strong>
            <p>{`Recall = ${recallResult.numerator}/${recallResult.denominator} = ${recallResult.value.toFixed(3)}`}</p>
            <p>{lang === "en" ? "Meaning: 3 out of 6 real spam were caught." : "含义：6 封真实 spam 中，抓住了 3 封。"}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "edge-case" ? (
        <table className="pnp-mini-table">
          <caption>{lang === "en" ? "Zero-denominator convention table" : "零分母约定对照表"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "Case" : "情形"}</th>
              <th>{lang === "en" ? "TP" : "TP"}</th>
              <th>{lang === "en" ? "FN" : "FN"}</th>
              <th>{lang === "en" ? "Denominator (TP + FN)" : "分母（TP + FN）"}</th>
              <th>{lang === "en" ? "Internal value" : "内部值"}</th>
              <th>{lang === "en" ? "Rendered" : "渲染值"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{lang === "en" ? "No actual positives" : "没有真实正类"}</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>{lang === "en" ? "null" : "null"}</td>
              <td>{lang === "en" ? "not available" : "不可用"}</td>
            </tr>
          </tbody>
        </table>
      ) : null}

      {scenarioId === "implementation" ? (
        <table className="pnp-mini-table">
          <caption>{lang === "en" ? "Recall implementation branch" : "召回率实现分支表"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "Step" : "步骤"}</th>
              <th>{lang === "en" ? "Numerator" : "分子"} (tp)</th>
              <th>{lang === "en" ? "Denominator" : "分母"} (tp + fn)</th>
              <th>{lang === "en" ? "Branch" : "分支"}</th>
              <th>{lang === "en" ? "Result" : "结果"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>tp</td>
              <td>tp + fn</td>
              <td>{lang === "en" ? "if denominator==0" : "若分母==0"}</td>
              <td>{lang === "en" ? "null" : "null"}</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>tp</td>
              <td>tp + fn</td>
              <td>{lang === "en" ? "else" : "否则"}</td>
              <td>tp / (tp + fn)</td>
            </tr>
          </tbody>
        </table>
      ) : null}

      {scenarioId === "common-confusions" ? (
        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{lang === "en" ? "Not accuracy" : "不是准确率"}</strong>
            <p>{lang === "en" ? "Accuracy counts true negatives too; recall ignores TN/FP." : "准确率会计入 TN，而召回率不计 TN/FP。"} </p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Not a raw count" : "不是原始计数"}</strong>
            <p>{lang === "en" ? "3 caught is not enough; denominator must be all real spam." : "仅报‘命中了3个’不完整，必须除以全部真实 spam。"} </p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Precision contrast" : "与精确率对照"}</strong>
            <p>{lang === "en" ? "Precision asks: of predicted positives, how many were correct?" : "精确率问：‘预测为正的有多少对？’"} </p>
            <p>{lang === "en" ? "Recall asks: of real positives, how many were caught?" : "召回率问：‘真实正类有多少被抓到？’"}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "graph-strip" ? (
        <div className="circuit-sat-graph-strip">
          <div>
            <strong>{lang === "en" ? "confusion-matrix" : "混淆矩阵"}</strong>
            <p>{lang === "en" ? "implemented" : "已实现"}</p>
          </div>
          <span>→</span>
          <div>
            <strong>{lang === "en" ? "recall" : "召回率"}</strong>
            <p>{lang === "en" ? "implemented" : "已实现"}</p>
          </div>
          <span>↔</span>
          <div>
            <strong>{lang === "en" ? "precision (contrast)" : "精确率（对照）"}</strong>
            <p>{lang === "en" ? "contrast" : "对照读取不同分母"}</p>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
