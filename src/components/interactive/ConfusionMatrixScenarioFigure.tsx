import type { Locale } from "../../i18n/locales";
import {
  classifyExample,
  confusionMatrixExamples,
  defaultTrace,
  exampleById,
  labelForCell,
  positiveLabel,
  sumCounts
} from "./confusionMatrixTrace";

type ScenarioId =
  | "hook-grid"
  | "naive-tally"
  | "e3-e4-mistake-contrast"
  | "quadrant-seed"
  | "orientation"
  | "invariant"
  | "branch-table"
  | "common-confusions"
  | "graph-strip";

type ScenarioFigureText = {
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

const text: Record<ScenarioId, ScenarioFigureText> = {
  "hook-grid": {
    title: { en: "Spam fixture", zh: "垃圾邮件数据集合" },
    summary: {
      en: "Each evaluated email has an actual label and a model prediction.",
      zh: "每封邮件都有真实标签和模型预测。"
    }
  },
  "naive-tally": {
    title: { en: "Right versus wrong split", zh: "正确/错误二分" },
    summary: {
      en: "Total correctness ignores which type of mistake is made.",
      zh: "总正确率会忽略错误类型。"
    }
  },
  "e3-e4-mistake-contrast": {
    title: { en: "A false alarm and a miss", zh: "误报与漏报" },
    summary: {
      en: "Two wrong labels can have opposite user impact.",
      zh: "两种错误都算错，却会产生完全不同影响。"
    }
  },
  "quadrant-seed": {
    title: { en: "Core 2×2 idea", zh: "核心 2×2 分桶" },
    summary: {
      en: "Two binary questions define four buckets.",
      zh: "两个二元问题定义了四个分桶。"
    }
  },
  orientation: {
    title: { en: "Matrix orientation", zh: "矩阵方向" },
    summary: {
      en: "Rows are reality (actual); columns are model output (prediction).",
      zh: "行是现实（真实标签），列是模型输出（预测标签）。"
    }
  },
  invariant: {
    title: { en: "Trace invariant", zh: "轨迹不变量" },
    summary: {
      en: "Every example enters exactly one cell.",
      zh: "每条样本只会进入且仅进入一个分桶。"
    }
  },
  "branch-table": {
    title: { en: "Implementation branches", zh: "实现分支" },
    summary: {
      en: "Four conditions map each case to one counter update.",
      zh: "四个条件分别映射到一个计数器更新。"
    }
  },
  "common-confusions": {
    title: { en: "Common confusions", zh: "常见误区" },
    summary: {
      en: "Naming and orientation errors are the top sources of confusion.",
      zh: "命名与方向错误是最常见的误解来源。"
    }
  },
  "graph-strip": {
    title: { en: "Graph strip", zh: "图谱走向" },
    summary: {
      en: "Current follow-up nodes are planned but not yet implemented.",
      zh: "当前后续节点尚未实现，仅用于学习路径提示。"
    }
  }
};

function labelBinary(value: string, lang: Locale) {
  return value === "spam"
    ? lang === "en"
      ? "spam"
      : "垃圾邮件（spam）"
    : lang === "en"
      ? "not-spam"
      : "非垃圾邮件（not-spam）";
}

function statusClass(cell: string) {
  switch (cell) {
    case "tp":
      return "circuit-sat-result-card accept";
    case "tn":
      return "circuit-sat-result-card reject";
    case "fp":
      return "circuit-sat-switch current";
    default:
      return "circuit-sat-gate";
  }
}

function statusLabel(cell: "tp" | "fp" | "tn" | "fn", lang: Locale) {
  const meta = labelForCell(cell, lang);
  return `${meta.code}: ${meta.full}`;
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
  return (
    <article className={`pnp-card ${statusClass(cell)}`} style={{ borderColor: "var(--line)", borderWidth: "2px" }}>
      <strong>{id}</strong>
      <p style={{ marginTop: 6 }}>{subject}</p>
      <p>{note}</p>
      <div className="pnp-legend" style={{ marginTop: 8 }}>
        <span>{`actual: ${labelBinary(actual, lang)}`}</span>
        <span>{`pred: ${labelBinary(prediction, lang)}`}</span>
        <span>{statusLabel(cell, lang)}</span>
      </div>
    </article>
  );
}

function emailCards(lang: Locale) {
  return confusionMatrixExamples.map((entry) => (
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
  ));
}

function confusionCount(counts: Record<string, number>, cell: "tp" | "fp" | "tn" | "fn") {
  return counts[cell] ?? 0;
}

export default function ConfusionMatrixScenarioFigure({
  lang,
  scenarioId
}: {
  lang: Locale;
  scenarioId: ScenarioId;
}) {
  const t = text[scenarioId];
  const e3 = exampleById("e3");
  const e4 = exampleById("e4");
  const trace = defaultTrace;
  const afterE9 = trace[8]?.after;
  const final = trace.at(-1)?.after ?? { tp: 0, fp: 0, tn: 0, fn: 0 };

  const branchRows = [
    { actual: "positive", predicted: "positive", cell: "tp" as const },
    { actual: "negative", predicted: "positive", cell: "fp" as const },
    { actual: "negative", predicted: "negative", cell: "tn" as const },
    { actual: "positive", predicted: "negative", cell: "fn" as const }
  ];

  const originalMatrixRows = [
    { row: "positive", colPositive: 3, colNegative: 3, labels: ["TP", "FN"] },
    { row: "negative", colPositive: 2, colNegative: 4, labels: ["FP", "TN"] }
  ] as const;

  const swappedMatrixRows = [
    { row: "positive", colPositive: 4, colNegative: 2, labels: ["TP", "FN"] },
    { row: "negative", colPositive: 3, colNegative: 3, labels: ["FP", "TN"] }
  ] as const;

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{t.title[lang]}</strong>
        <span>{t.summary[lang]}</span>
      </figcaption>

      {scenarioId === "hook-grid" ? (
        <div className="pnp-card-grid">
          {emailCards(lang)}
        </div>
      ) : null}

      {scenarioId === "naive-tally" ? (
        <div className="pnp-card-grid">
          {(["tp", "tn"] as const).map((cell) => {
            const entries = confusionMatrixExamples.filter((entry) => classifyExample(entry, positiveLabel) === cell);
            return (
              <article key={cell} className={`pnp-card ${statusClass(cell)}`} style={{ borderColor: "var(--line)", borderWidth: "2px" }}>
                <strong>{statusLabel(cell, lang)} + {(cell === "tp" || cell === "tn") ? (lang === "en" ? "correct" : "正确") : (lang === "en" ? "wrong" : "错误")}</strong>
                <p>{`${cell === "tp" || cell === "tn" ? (lang === "en" ? "Count: " : "计数：") : ""}${entries.length}`}</p>
                <p>{entries.map((entry) => entry.id).join(", ") || (lang === "en" ? "none yet" : "暂无")}</p>
              </article>
            );
          })}
          <article className="pnp-card">
            <strong>{lang === "en" ? "Right vs wrong total" : "总正确/错误"}</strong>
            <p>{`${lang === "en" ? "Correct = TP + TN = " : "正确 = TP + TN = "} ${confusionCount(final, "tp") + confusionCount(final, "tn")}`}</p>
            <p>{`${lang === "en" ? "Wrong = FP + FN = " : "错误 = FP + FN = "} ${confusionCount(final, "fp") + confusionCount(final, "fn")}`}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "e3-e4-mistake-contrast" && e3 && e4 ? (
        <div className="pnp-card-grid">
          <article className="pnp-card circuit-sat-row-grid">
            <h4 style={{ margin: 0 }}>e3</h4>
            <p>{e3.subject[lang]}</p>
            <p>{e3.note[lang]}</p>
            <p>{`${lang === "en" ? "Actual" : "真实"}: ${labelBinary(e3.actual, lang)}, ${lang === "en" ? "Predicted" : "预测"}: ${labelBinary(e3.prediction, lang)} (${statusLabel(classifyExample(e3), lang)})`}</p>
          </article>
          <article className="pnp-card circuit-sat-row-grid">
            <h4 style={{ margin: 0 }}>e4</h4>
            <p>{e4.subject[lang]}</p>
            <p>{e4.note[lang]}</p>
            <p>{`${lang === "en" ? "Actual" : "真实"}: ${labelBinary(e4.actual, lang)}, ${lang === "en" ? "Predicted" : "预测"}: ${labelBinary(e4.prediction, lang)} (${statusLabel(classifyExample(e4), lang)})`}</p>
          </article>
        </div>
      ) : null}

      {scenarioId === "quadrant-seed" ? (
        <div>
          <p className="circuit-sat-legend" style={{ display: "block", marginBottom: 8 }}>
            {lang === "en" ? "Seeded examples: e1->TP, e3->FP, e2->TN, e4->FN." : "种子示例：e1→TP，e3→FP，e2→TN，e4→FN。"}
          </p>
          <table className="pnp-mini-table">
            <caption>{lang === "en" ? "Seeded matrix counts (not full fixture)" : "种子示例计数（非完整统计）"}</caption>
            <thead>
              <tr>
                <th>{lang === "en" ? "actual" : "真实"}</th>
                <th>{lang === "en" ? "pred=spam" : "预测=垃圾邮件"}</th>
                <th>{lang === "en" ? "pred=not-spam" : "预测=非垃圾邮件"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{lang === "en" ? "actual=spam" : "真实=垃圾邮件"}</th>
                <td>1 (e1)</td>
                <td>1 (e4)</td>
              </tr>
              <tr>
                <th scope="row">{lang === "en" ? "actual=not-spam" : "真实=非垃圾邮件"}</th>
                <td>1 (e3)</td>
                <td>1 (e2)</td>
              </tr>
            </tbody>
          </table>
          <p>
            {lang === "en"
              ? "The two labels are the row partition (actual), and the two columns are the prediction partition."
              : "两类真实标签构成行，两个预测标签构成列。"}
          </p>
        </div>
      ) : null}

      {scenarioId === "orientation" ? (
        <table className="pnp-mini-table">
          <caption>{lang === "en" ? "Orientation for this node" : "本页方向约定"}</caption>
          <thead>
            <tr>
              <th />
              <th>{lang === "en" ? "predicted=positive" : "预测为正类"}</th>
              <th>{lang === "en" ? "predicted=negative" : "预测为负类"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{lang === "en" ? "actual=positive" : "真实为正类"}</th>
              <td>TP</td>
              <td>FN</td>
            </tr>
            <tr>
              <th scope="row">{lang === "en" ? "actual=negative" : "真实为负类"}</th>
              <td>FP</td>
              <td>TN</td>
            </tr>
          </tbody>
        </table>
      ) : null}

      {scenarioId === "invariant" && afterE9 ? (
        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>After e9</strong>
            <p>TP=2, FP=2, TN=3, FN=2</p>
            <p>total = 9</p>
            <p>formula: TP + FP + TN + FN = {sumCounts(afterE9)}</p>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Final" : "最终"}</strong>
            <p>TP={final.tp}, FP={final.fp}, TN={final.tn}, FN={final.fn}</p>
            <p>{lang === "en" ? `total = ${sumCounts(final)}` : `总数 = ${sumCounts(final)}`}</p>
          </article>
          <p className="pnp-badge">
            {lang === "en"
              ? "Invariant: the table is complete and disjoint."
              : "不变量：每条样本恰好映射到一个单元。"}
          </p>
        </div>
      ) : null}

      {scenarioId === "branch-table" ? (
        <table className="pnp-mini-table">
          <caption>{lang === "en" ? "Implementation branches" : "实现分支"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "if actual == positive?" : "若真实是正类？"}</th>
              <th>{lang === "en" ? "if prediction == positive?" : "若预测是正类？"}</th>
              <th>{lang === "en" ? "update" : "更新"}</th>
              <th>{lang === "en" ? "interpretation" : "含义"}</th>
            </tr>
          </thead>
          <tbody>
            {branchRows.map((row) => {
              const label = labelForCell(row.cell, lang);
              return (
                <tr key={`${row.actual}-${row.predicted}`}>
                  <td>
                    {lang === "en"
                      ? row.actual
                      : row.actual === "positive"
                        ? "真实正类"
                        : "真实负类"}
                  </td>
                  <td>
                    {lang === "en"
                      ? row.predicted
                      : row.predicted === "positive"
                        ? "预测正类"
                        : "预测负类"}
                  </td>
                  <td><code>{`${label.code}++`}</code></td>
                  <td>{label.full}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}

      {scenarioId === "common-confusions" ? (
        <div className="pnp-card-grid">
          <article className="pnp-card">
            <strong>{lang === "en" ? "Positive-class definition" : "正类定义"}</strong>
            <p>{lang === "en"
              ? "Current table: positive means spam (1 means spam)."
              : "当前表：正类是 spam（1 表示垃圾邮件）。"}
            </p>
            <table className="pnp-mini-table">
              <caption>{lang === "en" ? "positive=spam" : "正类 = spam"}</caption>
              <thead>
                <tr>
                  <th />
                  <th>{lang === "en" ? "predicted=spam" : "预测=垃圾邮件"}</th>
                  <th>{lang === "en" ? "predicted=not-spam" : "预测=非垃圾邮件"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{lang === "en" ? "actual=spam" : "真实=垃圾邮件"}</th>
                  <td>{`${originalMatrixRows[0]!.colPositive} (${originalMatrixRows[0]!.labels[0]})`}</td>
                  <td>{`${originalMatrixRows[0]!.colNegative} (${originalMatrixRows[0]!.labels[1]})`}</td>
                </tr>
                <tr>
                  <th scope="row">{lang === "en" ? "actual=not-spam" : "真实=非垃圾邮件"}</th>
                  <td>{`${originalMatrixRows[1]!.colPositive} (${originalMatrixRows[1]!.labels[0]})`}</td>
                  <td>{`${originalMatrixRows[1]!.colNegative} (${originalMatrixRows[1]!.labels[1]})`}</td>
                </tr>
              </tbody>
            </table>
          </article>
          <article className="pnp-card">
            <strong>{lang === "en" ? "Positive-class swap" : "切换正类"}</strong>
            <p>{lang === "en"
              ? "If positive=not-spam, TP/FP/TN/FN re-meaning changes."
              : "若正类改成 not-spam，不同单元格含义发生重分配。"}
            </p>
            <table className="pnp-mini-table">
              <caption>{lang === "en" ? "positive=not-spam" : "正类 = not-spam"}</caption>
              <thead>
                <tr>
                  <th />
                  <th>{lang === "en" ? "predicted=not-spam" : "预测=非垃圾邮件"}</th>
                  <th>{lang === "en" ? "predicted=spam" : "预测=垃圾邮件"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{lang === "en" ? "actual=not-spam" : "真实=非垃圾邮件"}</th>
                  <td>{`${swappedMatrixRows[0]!.colPositive} (${swappedMatrixRows[0]!.labels[0]})`}</td>
                  <td>{`${swappedMatrixRows[0]!.colNegative} (${swappedMatrixRows[0]!.labels[1]})`}</td>
                </tr>
                <tr>
                  <th scope="row">{lang === "en" ? "actual=spam" : "真实=垃圾邮件"}</th>
                  <td>{`${swappedMatrixRows[1]!.colPositive} (${swappedMatrixRows[1]!.labels[0]})`}</td>
                  <td>{`${swappedMatrixRows[1]!.colNegative} (${swappedMatrixRows[1]!.labels[1]})`}</td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>
      ) : null}

      {scenarioId === "graph-strip" ? (
        <div className="circuit-sat-graph-strip">
          <div>
            <strong>confusion-matrix</strong>
            <p>{lang === "en" ? "implemented" : "已实现"}</p>
          </div>
          <span>→</span>
          <div className="future">
            <strong>precision</strong>
            <p>{lang === "en" ? "planned follow-up" : "计划后续"}</p>
          </div>
          <span>→</span>
          <div className="future">
            <strong>recall</strong>
            <p>{lang === "en" ? "planned follow-up" : "计划后续"}</p>
          </div>
          <span>→</span>
          <div className="future">
            <strong>f1-score</strong>
            <p>{lang === "en" ? "planned follow-up" : "计划后续"}</p>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
