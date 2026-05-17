import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { SatFormulaTreeSvg } from "./SatFormulaRuleFigure";
import {
  assignmentGridGoldenState,
  assignmentRows,
  evaluateFormula,
  satFormula,
  textFor,
  type AssignmentString
} from "./satTrace";

export default function SatAssignmentGrid({ lang }: { lang: Locale }) {
  const [selected, setSelected] = useState<AssignmentString>(assignmentGridGoldenState.selectedAssignment);
  const selectedRow = assignmentRows.find((row) => row.assignment === selected) ?? assignmentRows[0];
  const result = evaluateFormula(satFormula, selected);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "SAT assignment grid", "SAT 赋值表")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Naive truth-table search", "朴素真值表搜索")}</strong>
          <p>{textFor(lang, "Four variables give 16 well-formed rows. The grid shows representative rows from that table.", "四个变量给出 16 个格式正确的行。表格展示其中一些代表行。")}</p>
        </div>
        <span className="pnp-badge">2^4 = 16</span>
      </div>
      <div className="circuit-sat-two-column">
        <div className="circuit-sat-row-grid">
          {assignmentRows.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`${row.result} ${selected === row.assignment ? "active" : ""}`}
              aria-pressed={selected === row.assignment}
              onClick={() => setSelected(row.assignment)}
            >
              <strong>{row.assignment}</strong>
              <span>phi={row.output} · {row.result}</span>
            </button>
          ))}
        </div>
        <div className={`circuit-sat-result-card ${result.result}`}>
          <strong>{selected} {"->"} phi={result.output}</strong>
          <span>{selectedRow.reasonBadge[lang]}</span>
          <p>{selectedRow.note[lang]}</p>
          <p>{textFor(lang, "One rejecting row is only evidence about that row, not an unsatisfiability proof.", "一个拒绝行只说明这一行失败，不是不可满足证明。")}</p>
        </div>
      </div>
      <SatFormulaTreeSvg lang={lang} assignment={selected} markerId={`sat-grid-arrow-${lang}`} />
    </section>
  );
}
