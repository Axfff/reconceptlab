import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { growthState, textFor } from "./pnpTrace";

export default function SearchVsCheckGrowthDemo({ lang }: { lang: Locale }) {
  const [variables, setVariables] = useState(10);
  const fixed = growthState(3, "fixed-toy-circuit");
  const scaling = growthState(variables, "scaling-thought-experiment");

  return (
    <section className="pnp-demo" aria-label={textFor(lang, "Search versus checking growth", "搜索与检查的增长对比")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Search grows by candidates", "搜索随候选数量增长")}</strong>
          <p>{textFor(lang, "This is a counting model for the visual; input size includes the circuit description, not just n.", "这是可视化用的计数模型；输入大小包括电路描述，不只是 n。")}</p>
        </div>
        <span className="pnp-badge">{textFor(lang, "not the same circuit", "不是同一个电路")}</span>
      </div>

      <label className="pnp-slider">
        <span>{textFor(lang, "Variables in scaling thought experiment", "扩展思想实验中的变量数")}: {variables}</span>
        <input type="range" min="3" max="30" value={variables} onChange={(event) => setVariables(Number(event.currentTarget.value))} />
      </label>

      <div className="pnp-growth-grid">
        <div>
          <strong>{textFor(lang, "fixed toy circuit", "固定小电路")}</strong>
          <span>{fixed.variables} {textFor(lang, "inputs", "个输入")} · {fixed.gateCount} {textFor(lang, "gates", "个门")}</span>
          <p>{fixed.assignments} {textFor(lang, "assignments, one check takes", "个赋值，一次检查需要")} {fixed.checkSteps} {textFor(lang, "simple steps", "个简单步骤")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "scaling thought experiment", "扩展思想实验")}</strong>
          <span>{scaling.variables} {textFor(lang, "inputs", "个输入")} · {scaling.gateCount} {textFor(lang, "gates", "个门")}</span>
          <p>{scaling.assignments.toLocaleString()} {textFor(lang, "assignments, one check takes", "个赋值，一次检查需要")} {scaling.checkSteps} {textFor(lang, "simple steps", "个简单步骤")}</p>
        </div>
      </div>
    </section>
  );
}
