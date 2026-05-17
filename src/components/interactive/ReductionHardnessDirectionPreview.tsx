import type { Locale } from "../../i18n/locales";
import { directionCases, textFor } from "./reductionTrace";

export default function ReductionHardnessDirectionPreview({ lang }: { lang: Locale }) {
  const valid = directionCases.find((item) => item.id === "hardness-preview");
  const wrong = directionCases.find((item) => item.id === "wrong-hardness-arrow");
  if (!valid || !wrong) return null;

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Hardness preview comes after algorithm transfer", "困难性预告要放在算法转移之后")}</strong>
        <span>{textFor(lang, "This is beginner wording only. The formal NP-hardness definition belongs to the next node.", "这里只用入门表述。正式的 NP-hard 定义属于下一个节点。")}</span>
      </figcaption>
      <div className="reduction-hardness-grid">
        <div className="reduction-card solved">
          <strong>{textFor(lang, "Valid preview: A <=p B", "有效预告：A <=p B")}</strong>
          <span>{valid.conclusion[lang]}</span>
          <b>{textFor(lang, "If fast B, then fast A.", "若 B 快，则 A 也快。")}</b>
        </div>
        <div className="reduction-card invalid">
          <strong>{textFor(lang, "Wrong arrow: B <=p A", "错误箭头：B <=p A")}</strong>
          <span>{wrong.conclusion[lang]}</span>
          <b>{textFor(lang, "Does not prove B hard.", "不能证明 B 困难。")}</b>
        </div>
      </div>
    </figure>
  );
}
