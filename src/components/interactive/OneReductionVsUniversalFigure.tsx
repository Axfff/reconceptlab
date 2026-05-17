import type { Locale } from "../../i18n/locales";
import { textFor } from "./npHardnessTrace";

export default function OneReductionVsUniversalFigure({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure" aria-label={textFor(lang, "One source is not enough", "一个源问题不够")}>
      <figcaption>
        <strong>{textFor(lang, "One reduction is a hint, not a definition", "单次归约只是一条线索，不是定义")}</strong>
        <span>{textFor(lang, "NP-hardness needs arrows from every source in NP, not one favorite source.", "NP-hardness 需要 NP 中每个源问题都能归约到 H，而不是一个最爱源。")}</span>
      </figcaption>
      <div className="reduction-hardness-grid">
        <div className="reduction-card solved">
          <strong>{textFor(lang, "Invalid target vision", "错误目标视图")}</strong>
          <div className="reduction-arrow-card invalid">
            <strong>{"A <=p H"}</strong>
            <span>{textFor(lang, "single source only", "只有一个源问题")}</span>
          </div>
          <span>{textFor(lang, "missing all other sources", "缺失其他源问题")}</span>
          <p>{textFor(lang, "This can show one concrete reduction example, but not NP-hardness.", "这能显示一个例子归约，不足以证明 NP-hardness。")}</p>
        </div>
        <div className="reduction-card faded">
          <strong>{textFor(lang, "Required NP-hardness view", "NP-hardness 需要的视图")}</strong>
          <span>{textFor(lang, "L1 <=p H", "L1 <=p H")}</span>
          <span>{textFor(lang, "L2 <=p H", "L2 <=p H")}</span>
          <span>{textFor(lang, "..., forall L in NP", "..., 对每个 L in NP")}</span>
          <span className="reduction-status invalid">{textFor(lang, "complete family requirement", "完整族要求")}</span>
        </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "What fails in the one-source view", "单源视图失败点")}</strong>
          <span>{textFor(lang, "Cannot conclude H absorbs all NP problems.", "不能推出 H 包含全部 NP 问题。")}</span>
          <span>{textFor(lang, "Cannot trigger P=NP reasoning for arbitrary L.", "不能对任意 L 触发 P=NP 的条件推理。")}</span>
        </div>
      </div>
    </figure>
  );
}
