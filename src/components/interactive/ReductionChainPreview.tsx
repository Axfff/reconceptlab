import type { Locale } from "../../i18n/locales";
import { textFor } from "./reductionTrace";

const chain = [
  {
    from: "Circuit-SAT",
    to: "SAT",
    en: "circuit satisfiable iff formula satisfiable",
    zh: "电路可满足 iff 公式可满足"
  },
  {
    from: "SAT",
    to: "3SAT",
    en: "formula satisfiable iff 3CNF satisfiable",
    zh: "公式可满足 iff 3CNF 可满足"
  },
  {
    from: "3SAT",
    to: "Clique",
    en: "3SAT formula satisfiable iff graph has a k-clique",
    zh: "3SAT 公式可满足 iff 图中有 k-clique"
  }
];

export default function ReductionChainPreview({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Later lecture chains reuse the same preservation contract", "后续课程链条会反复使用同一个保持合约")}</strong>
        <span>{textFor(lang, "These are previews only, without construction details on this page.", "这里只是预览，不在本页展开构造细节。")}</span>
      </figcaption>
      <div className="reduction-hardness-grid">
        <div className="reduction-card invalid">
          <strong>{textFor(lang, "Without reductions", "没有归约")}</strong>
          <span>{textFor(lang, "Each target needs a from-scratch argument.", "每个目标都要从零证明。")}</span>
        </div>
        <div className="reduction-card solved">
          <strong>{textFor(lang, "With reductions", "有归约")}</strong>
          <span>{textFor(lang, "One doubted source can feed several targets through answer-preserving translators.", "一个被怀疑的源问题可以通过保持答案的翻译器连接多个目标。")}</span>
        </div>
      </div>
      <div className="reduction-chain" aria-label={textFor(lang, "Reduction chain preview", "归约链条预览")}>
        {chain.map((edge) => (
          <div key={`${edge.from}-${edge.to}`} className="reduction-card">
            <strong>{edge.from} &lt;=p {edge.to}</strong>
            <span>{lang === "en" ? edge.en : edge.zh}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
