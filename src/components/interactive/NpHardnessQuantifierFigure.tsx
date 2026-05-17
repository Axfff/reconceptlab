import type { Locale } from "../../i18n/locales";
import { answerLabel, sourceRows, textFor } from "./npHardnessTrace";

export default function NpHardnessQuantifierFigure({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Universal quantifier expands into many required source obligations", "全称量词展开为许多必须的源问题承诺")}</strong>
        <span>{textFor(lang, "Each listed row is one required instance-preservation contract under the same target H.", "每一行都是在同一个目标 H 下的一条实例保持约束。")}</span>
      </figcaption>
      <div className="reduction-pipeline">
        {sourceRows.map((row) => (
          <div key={row.id} className="reduction-card">
            <strong>{row.label[lang]}</strong>
            <span>{row.instance[lang]}</span>
            <span>{textFor(lang, "source", "源")} = {answerLabel(row.sourceAnswer, lang)}</span>
            <span>{textFor(lang, "target form", "目标形式")}: {row.targetInstanceForm}</span>
            <span>{textFor(lang, "target", "目标")} = {answerLabel(row.targetAnswer, lang)}</span>
            <span>{textFor(lang, "if and only if (iff)", "当且仅当（iff）")}: x ∈ L ↔ f_L(x) ∈ H</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

