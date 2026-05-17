import type { Locale } from "../../i18n/locales";
import { sourceRows, textFor } from "./npHardnessTrace";

export default function NpHardnessHubFigure({ lang }: { lang: Locale }) {
  const requiredRows = sourceRows.slice(0, 4);
  const anyRow = sourceRows[4];

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Hub first: target H receives reductions from many NP sources", "先看中心点：H 接收来自多个 NP 源问题的归约")}</strong>
        <span>{textFor(lang, "These arrows are definition obligations, not built translations. They show required comparisons for NP-hardness.", "这些箭头是定义前提，不是已经构造完成的归约。它们表示 NP-hardness 所要求的比较关系。")}</span>
      </figcaption>
      <div className="reduction-quantifier" aria-label={textFor(lang, "Required source arrows into H", "H 的必需源箭头")}>
        <div className="reduction-card solved">
          <strong>{textFor(lang, "decision problem L", "判定问题 L")}</strong>
          <span>{textFor(lang, "source instance x", "源实例 x")}</span>
          <span className="reduction-status yes">{textFor(lang, "source answer preserved", "答案保持")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>{textFor(lang, "required", "要求的映射")}</strong>
          <span>{"L <=p H"}</span>
          <span>{textFor(lang, "all source decisions must map this way", "每个源判定实例都要能这样映射")}</span>
          <span className="reduction-status invalid">{textFor(lang, "not constructed here", "当前未构造")}</span>
        </div>
        <div className="reduction-card">
          <strong>H</strong>
          <span>{textFor(lang, "Target decision problem", "目标判定问题")}</span>
          <span>{textFor(lang, "Question: given y, is y in H?", "问题：给定 y，是否 y ∈ H？")}</span>
        </div>
      </div>
      <div className="reduction-pipeline">
        {requiredRows.map((row) => (
          <div key={row.id} className="reduction-card">
            <strong>{row.label[lang]}</strong>
            <span>{row.instance[lang]}</span>
            <span>{textFor(lang, "target form", "目标形式")}: {row.targetInstanceForm}</span>
            <span>{textFor(lang, "requires", "要求")}: x ∈ L ↔ f(x) ∈ H</span>
            <span className={`reduction-status ${row.sourceAnswer === "yes" ? "yes" : row.sourceAnswer === "no" ? "no" : "invalid"}`}>
              {row.sourceAnswer === "yes" ? textFor(lang, "Yes source", "源 Yes") : row.sourceAnswer === "no" ? textFor(lang, "No source", "源 No") : textFor(lang, "symbolic", "符号化")}
              {" → "}
              {row.targetAnswer === "yes" ? textFor(lang, "Yes target", "目标 Yes") : row.targetAnswer === "no" ? textFor(lang, "No target", "目标 No") : textFor(lang, "symbolic", "符号化")}
            </span>
          </div>
        ))}
        <div className="reduction-card faded">
          <strong>{anyRow.label[lang]}</strong>
          <span>{anyRow.instance[lang]}</span>
          <span>{textFor(lang, "formal placeholder for ∀L in NP", "∀L∈NP 的形式占位")}</span>
          <span>{textFor(lang, "symbolic only", "仅符号化")}</span>
        </div>
      </div>
      <p className="reduction-note" aria-live="polite">
        {textFor(lang, "The node on this page is a conditional definition target; no row here should be treated as an actual completed hardness proof.", "本页的结论是条件定义目标；任何行都不代表某个真实完成的困难性证明。")}
      </p>
    </figure>
  );
}
