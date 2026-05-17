import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { assignmentCount, growthGoldenState, textFor } from "./circuitSatTrace";

const growthRows = [4, 8, 12, 20, 30];

export default function CircuitSatGrowthStrip({ lang }: { lang: Locale }) {
  const [n, setN] = useState(growthGoldenState.selectedInputCount);
  const count = assignmentCount(n);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT growth strip", "Circuit-SAT 增长条")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Every extra input doubles the search table", "每增加一个输入，搜索表翻倍")}</strong>
          <p>{textFor(lang, "Checking one row follows the circuit once; blind search may repeat that check for every row.", "检查一行只沿电路走一次；盲目搜索可能要对每一行重复检查。")}</p>
        </div>
        <span className="pnp-badge">{textFor(lang, "reason", "原因")}: {textFor(lang, growthGoldenState.reasonBadge, "搜索按翻倍增长；检查一行只沿电路走一次")}</span>
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
          <p>{textFor(lang, "validate bits, evaluate gates, read z", "检查 bit，计算逻辑门，读取 z")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "Fixture search", "本例搜索")}</strong>
          <span>{n === 4 ? growthGoldenState.bruteForceLabel : `${count.toLocaleString()} candidate rows`}</span>
          <p>{textFor(lang, "same shape, larger input thought experiment", "同样增长形状，输入更大的思想实验")}</p>
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
              <td>O(|C| + n)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
