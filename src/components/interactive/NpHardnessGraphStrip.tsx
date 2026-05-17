import type { Locale } from "../../i18n/locales";
import { textFor } from "./npHardnessTrace";

export default function NpHardnessGraphStrip({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure" aria-label={textFor(lang, "Graph route to np-hardness", "到 NP-hardness 的局部路线")}>
      <figcaption>
        <strong>{textFor(lang, "Graph position and local flow", "图位置与局部流程")}</strong>
        <span>{textFor(lang, "This follows the existing implementation edge sequence and previews future proof targets.", "这和已有实现边的顺序一致，并预告后续证明对象。")}</span>
      </figcaption>
      <div className="reduction-chain">
        <div className="reduction-card solved">
          <strong>p-vs-np</strong>
          <span>{textFor(lang, "decision problems + P/NP frame", "判定问题 + P/NP 框架")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>-&gt;</strong>
          <span>{textFor(lang, "prerequisite", "前置关系")}</span>
        </div>
        <div className="reduction-card solved">
          <strong>polynomial-time-reductions</strong>
          <span>{textFor(lang, "decision reductions", "判定归约")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>-&gt;</strong>
          <span>{textFor(lang, "prerequisite", "前置关系")}</span>
        </div>
        <div className="reduction-card">
          <strong>np-hardness</strong>
          <span>{textFor(lang, "universal target definition", "通用目标定义")}</span>
        </div>
        <div className="reduction-arrow-card">
          <strong>-&gt;</strong>
          <span>{textFor(lang, "future preview", "后续预览")}</span>
        </div>
        <div className="reduction-card faded">
          <strong>circuit-sat</strong>
          <span>{textFor(lang, "first concrete source target", "首个具体源问题节点（未链接）")}</span>
        </div>
      </div>
    </figure>
  );
}
