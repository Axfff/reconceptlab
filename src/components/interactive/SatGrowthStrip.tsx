import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { assignmentCount, growthGoldenState, textFor } from "./satTrace";

const growthRows = [4, 8, 12, 20, 30];

export default function SatGrowthStrip({ lang }: { lang: Locale }) {
  const [n, setN] = useState(growthGoldenState.selectedInputCount);
  const count = assignmentCount(n);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "SAT growth strip", "SAT 增长条")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Every new variable doubles the table", "每增加一个变量，表格翻倍")}</strong>
          <p>{textFor(lang, "Checking one certificate evaluates phi once; blind search may evaluate one row after another.", "检查一个证书只求值一次 phi；盲目搜索可能一行接一行地求值。")}</p>
        </div>
        <span className="pnp-badge">{textFor(lang, "reason", "原因")}: {textFor(lang, growthGoldenState.reasonBadge, "搜索行数翻倍；检查一个证书只求值一次公式")}</span>
      </div>
      <label className="circuit-sat-slider">
        <span>n = {n}</span>
        <input type="range" min="4" max="30" value={n} onChange={(event) => setN(Number(event.currentTarget.value))} />
      </label>
      <div className="pnp-growth-grid">
        <div>
          <strong>{textFor(lang, "Assignments", "赋值数量")}</strong>
          <span>{count.toLocaleString()}</span>
          <p>{textFor(lang, "all rows in the brute-force table", "暴力表中的所有行")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "One certificate check", "一次证书检查")}</strong>
          <span>{growthGoldenState.oneCheckWorkLabel}</span>
          <p>{textFor(lang, "validate bits, evaluate formula tree, read root", "检查 bit，求值公式树，读取根节点")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "Fixture search", "本例搜索")}</strong>
          <span>{n === 4 ? growthGoldenState.bruteForceLabel : `${count.toLocaleString()} candidate rows`}</span>
          <p>{textFor(lang, "same doubling shape for larger formulas", "更大公式也有同样的翻倍形状")}</p>
        </div>
      </div>
      <table className="pnp-mini-table">
        <caption>{textFor(lang, "Doubling snapshots", "翻倍快照")}</caption>
        <thead>
          <tr><th>n</th><th>2^n</th><th>{textFor(lang, "one-check label", "一次检查标签")}</th></tr>
        </thead>
        <tbody>
          {growthRows.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              <td>{assignmentCount(row).toLocaleString()}</td>
              <td>O(|phi| + n)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
