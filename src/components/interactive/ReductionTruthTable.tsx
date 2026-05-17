import type { Locale } from "../../i18n/locales";
import { textFor, toyFixtureRows, toyInstanceLabel, yesNo } from "./reductionTrace";

export default function ReductionTruthTable({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Mechanics-only toy truth table", "仅用于机制演示的玩具真值表")}</strong>
        <span>{textFor(lang, "This is a format adapter, not difficulty or hardness evidence.", "这是格式适配器，不是困难性或硬度证据。")}</span>
      </figcaption>
      <table className="pnp-mini-table reduction-table">
        <thead>
          <tr>
            <th>{textFor(lang, "Source instance", "源实例")}</th>
            <th>{textFor(lang, "Source answer", "源答案")}</th>
            <th>{textFor(lang, "Target instance f(x)", "目标实例 f(x)")}</th>
            <th>{textFor(lang, "Target answer", "目标答案")}</th>
            <th>{textFor(lang, "Purpose", "用途")}</th>
          </tr>
        </thead>
        <tbody>
          {toyFixtureRows.map((row) => (
            <tr key={row.source.id}>
              <th scope="row">{toyInstanceLabel(row.source)}</th>
              <td><span className={`reduction-status ${row.sourceAnswer ? "yes" : "no"}`}>{yesNo(row.sourceAnswer, lang)}</span></td>
              <td>{toyInstanceLabel(row.target)}</td>
              <td><span className={`reduction-status ${row.targetAnswer ? "yes" : "no"}`}>{yesNo(row.targetAnswer, lang)}</span></td>
              <td>{row.purpose[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
