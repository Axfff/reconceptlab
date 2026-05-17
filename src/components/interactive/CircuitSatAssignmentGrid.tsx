import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { assignmentGridGoldenState, assignmentRows, evaluateCircuit, circuitSatCircuit, textFor, type AssignmentString } from "./circuitSatTrace";
import { CircuitSatSvg } from "./CircuitSatCircuitFigure";

export default function CircuitSatAssignmentGrid({ lang }: { lang: Locale }) {
  const [selected, setSelected] = useState<AssignmentString>(assignmentGridGoldenState.selectedAssignment);
  const selectedRow = assignmentRows.find((row) => row.assignment === selected) ?? assignmentRows[0];
  const result = evaluateCircuit(circuitSatCircuit, selected);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT assignment grid", "Circuit-SAT 赋值表")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Naive search table", "朴素搜索表")}</strong>
          <p>{textFor(lang, "A four-input circuit has 16 well-formed rows. The grid shows selected rows from that table.", "四输入电路有 16 个格式正确的行。表格展示其中一些代表行。")}</p>
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
              <span>z={row.output} · {row.result}</span>
            </button>
          ))}
        </div>
        <div className={`circuit-sat-result-card ${result.result}`}>
          <strong>{selected} {"->"} z={result.output}</strong>
          <span>{selectedRow.reasonBadge[lang]}</span>
          <p>{selectedRow.note[lang]}</p>
          <p>{textFor(lang, "One rejecting row is only evidence about that row, not the whole decision problem.", "一个拒绝行只说明这一行失败，不说明整个判定问题是 No。")}</p>
        </div>
      </div>
      <CircuitSatSvg lang={lang} assignment={selected} markerId={`circuit-sat-grid-arrow-${lang}`} />
    </section>
  );
}
