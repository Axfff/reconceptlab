import type { Locale } from "../../i18n/locales";
import { textFor, toyFixtureRows, toyInstanceLabel, yesNo } from "./reductionTrace";

export default function ReductionQuantifierFigure({ lang }: { lang: Locale }) {
  const rows = [toyFixtureRows[0], toyFixtureRows[2], toyFixtureRows[4]];

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "The iff contract quantifies over source instances", "iff 合约量化的是源实例")}</strong>
        <span>{textFor(lang, "The reverse direction applies to produced targets f(x), not arbitrary B instances.", "反向方向只适用于被产生出来的目标实例 f(x)，不是任意 B 实例。")}</span>
      </figcaption>
      <div className="reduction-quantifier">
        <div className="reduction-card">
          <strong>{textFor(lang, "Source problem A", "源问题 A")}</strong>
          {rows.map((row) => (
            <span key={row.source.id}>{toyInstanceLabel(row.source)}: {yesNo(row.sourceAnswer, lang)}</span>
          ))}
        </div>
        <div className="reduction-arrow-card active">
          <strong>for every x</strong>
          <span>x in A iff f(x) in B</span>
          <span>x notin A iff f(x) notin B</span>
        </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "Image of f inside B", "B 中 f 的像")}</strong>
          {rows.map((row) => (
            <span key={row.source.id}>{toyInstanceLabel(row.target)}: {yesNo(row.targetAnswer, lang)}</span>
          ))}
        </div>
        <div className="reduction-card faded">
          <strong>{textFor(lang, "Other B instances", "其他 B 实例")}</strong>
          <span>{textFor(lang, "not claimed", "不作承诺")}</span>
          <p>{textFor(lang, "No reverse translator from arbitrary B instances is required here.", "这里不要求从任意 B 实例反向翻译回来。")}</p>
        </div>
      </div>
    </figure>
  );
}
