import type { Locale } from "../../i18n/locales";
import { answerLabel, preservationLedgerRows, textFor } from "./npHardnessTrace";

type Variant = {
  sourceId?: (typeof preservationLedgerRows)[number]["id"];
};

export default function HardnessAnswerPreservationLedger({ lang }: { lang: Locale } & Variant) {
  const rows = preservationLedgerRows;
  return (
    <figure className="reduction-figure" aria-label={textFor(lang, "Answer preservation ledger", "答案保持账本")}>
      <figcaption>
        <strong>{textFor(lang, "Ledger: preserve both Yes and No answers", "账本：保持 Yes 与 No")}</strong>
        <span>{textFor(lang, "If reduction is valid for source instance x, the target instance f(x) must keep the same truth value.", "归约对实例 x 有效时，目标 f(x) 的真假值必须保持一致。")}</span>
      </figcaption>
      <div className="reduction-quantifier">
        {rows.map((row) => (
          <div key={row.id} className="reduction-card solved">
            <strong>
              {row.sourceAnswer === "yes"
                ? textFor(lang, "Yes source instance", "是实例（Yes）")
                : textFor(lang, "No source instance", "否实例（No）")}
            </strong>
            <span>{row.instance[lang]}</span>
            <div className="reduction-arrow-card active">
              <strong>f</strong>
              <span>{row.targetInstanceForm}</span>
            </div>
            <strong>
              {row.targetAnswer === "yes"
                ? textFor(lang, "Yes target instance", "目标（Yes）")
                : textFor(lang, "No target instance", "目标（No）")}
            </strong>
            <span>{textFor(lang, "target answer", "目标答案")}: {answerLabel(row.targetAnswer, lang)}</span>
          </div>
        ))}
      </div>
      <p className="reduction-note valid">
        {textFor(
          lang,
          "Both yes and no rows satisfy the contract for the same reduction shape, preserving truth values.",
          "是与否两个示例都采用同一类归约形式并保持真假值一致。"
        )}
      </p>
    </figure>
  );
}
