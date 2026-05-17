import type { Locale } from "../../i18n/locales";
import { exampleCostState, hardnessCostState, textFor } from "./npHardnessTrace";

export default function NpHardnessCostStack({ lang }: { lang: Locale }) {
  const symbolic = hardnessCostState;
  const sample = exampleCostState(12);

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Composition cost stack", "复杂度组合堆栈")}</strong>
        <span>{textFor(lang, "The reduction and H-solver costs compose, so polynomial stays polynomial.", "归约成本与 H 求解成本相加，仍是多项式。")}</span>
      </figcaption>
      <table className="pnp-mini-table reduction-table">
        <thead>
          <tr>
            <th>{textFor(lang, "symbol", "符号")}</th>
            <th>{textFor(lang, "expression", "表达式")}</th>
            <th>{textFor(lang, "meaning", "含义")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>m</td>
            <td>{symbolic.targetSizeBound}</td>
            <td>{textFor(lang, "target size bound", "目标规模上界")}</td>
          </tr>
          <tr>
            <td>T<sub>reduce</sub>(n)</td>
            <td>{symbolic.reductionTime}</td>
            <td>{textFor(lang, "translate source to H instance", "将源实例翻译为 H 实例")}</td>
          </tr>
          <tr>
            <td>T<sub>solveH</sub>(m)</td>
            <td>{symbolic.targetSolverTime}</td>
            <td>{textFor(lang, "solve H in polynomial time", "在 H 上多项式求解")}</td>
          </tr>
          <tr>
            <td>T<sub>total</sub>(n)</td>
            <td>{symbolic.combinedTime}</td>
            <td>{textFor(lang, "combined pipeline", "组合流水线")}</td>
          </tr>
        </tbody>
      </table>
      <div className="reduction-badge-row">
        <span className="pnp-badge">{textFor(lang, "source size symbol", "源规模符号")}: {symbolic.sourceSizeSymbol}</span>
        <span className="pnp-badge">{textFor(lang, "target size symbol", "目标规模符号")}: {symbolic.targetSizeSymbol}</span>
        <span className="pnp-badge">{textFor(lang, "combined", "组合")}: {symbolic.combinedTime}</span>
      </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "Optional concrete sample", "可选具体示例")}</strong>
          <span>n = {sample.sourceSize}</span>
          <span>T<sub>reduce</sub>(n) = {sample.reductionTime}</span>
          <span>m {"<= "}{sample.targetSizeBound}</span>
          <span>T<sub>solveH</sub>(m) = {sample.targetSolverTime}</span>
          <span>T<sub>total</sub>(n) = {sample.combinedTime}</span>
        </div>
    </figure>
  );
}
