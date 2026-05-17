import type { Locale } from "../../i18n/locales";
import { textFor } from "./reductionTrace";

export default function ReductionGraphStrip({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure" aria-label={textFor(lang, "Local graph position for polynomial-time reductions", "多项式时间归约的局部图谱位置")}>
      <figcaption>
        <strong>{textFor(lang, "Local graph position", "局部图谱位置")}</strong>
        <span>{textFor(lang, "This is a page-local learning map; the faded future node is not a graph edge yet.", "这是本页局部学习地图；淡化的未来节点还不是图数据中的边。")}</span>
      </figcaption>
      <div className="reduction-chain">
        <div className="reduction-card solved">
          <strong>p-vs-np</strong>
          <span>{textFor(lang, "decision problems and polynomial time", "判定问题和多项式时间")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>-&gt;</strong>
          <span>{textFor(lang, "implemented graph edge", "已实现图边")}</span>
        </div>
        <div className="reduction-card active">
          <strong>polynomial-time-reductions</strong>
          <span>{textFor(lang, "answer-preserving translators", "保持答案的翻译器")}</span>
        </div>
        <div className="reduction-arrow-card">
          <strong>-&gt;</strong>
          <span>{textFor(lang, "future follow-up", "未来后续")}</span>
        </div>
        <div className="reduction-card faded">
          <strong>np-hardness</strong>
          <span>{textFor(lang, "not yet implemented", "尚未实现")}</span>
        </div>
      </div>
    </figure>
  );
}
