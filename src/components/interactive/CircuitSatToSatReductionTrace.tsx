import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { CircuitSatSvg } from "./CircuitSatCircuitFigure";
import { textFor } from "./circuitSatTrace";
import {
  reductionTraceForAssignment,
  sourceCircuit
} from "./circuitSatToSatTrace";

const assignmentChoices = ["1010", "0101", "0000", "101", "1020"];

function isFormulaInput(id: string): id is "x1" | "x2" | "x3" | "x4" {
  return sourceCircuit.inputs.includes(id as "x1" | "x2" | "x3" | "x4");
}

function pairText(values: Array<{ id: string; value: 0 | 1 }>) {
  if (values.length === 0) return "";
  return values.map((entry) => `${entry.id}=${entry.value}`).join(", ");
}

function emittedSequenceText(formulas: string[]) {
  if (formulas.length === 0) return "";
  return formulas.join(" AND ");
}

export default function CircuitSatToSatReductionTrace({ lang }: { lang: Locale }) {
  const [assignment, setAssignment] = useState("1010");
  const run = useMemo(() => reductionTraceForAssignment(assignment), [assignment]);
  const [stepIndex, setStepIndex] = useState(0);
  const maxStepIndex = Math.max(0, run.steps.length - 1);
  const safeStepIndex = Math.min(stepIndex, maxStepIndex);
  const currentStep = run.steps[safeStepIndex];
  const statusLabel = run.status === "malformed"
    ? textFor(lang, "malformed assignment", "格式错误赋值")
    : textFor(lang, "emitted constraints so far", "截至当前的累计约束");
  const malformedReason = run.status === "malformed" ? run.malformedReason[lang] : "";

  const visibleValues = currentStep?.kind === "gate" ? currentStep.storedValues : run.status === "ok" ? run.gateValues : [];
  const inputValues = visibleValues.filter((entry) => isFormulaInput(entry.id));
  const helperValues = visibleValues.filter((entry) => !isFormulaInput(entry.id));
  const emittedSoFar = currentStep?.kind === "gate" || currentStep?.kind === "assert-output"
    ? currentStep.emittedSoFar
    : [];

  const control = {
    prev: textFor(lang, "Previous step", "上一步"),
    next: textFor(lang, "Next step", "下一步"),
    reset: textFor(lang, "Reset", "重置")
  };

  function chooseAssignment(next: string) {
    setAssignment(next);
    setStepIndex(0);
  }

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT to SAT reduction trace", "Circuit-SAT 到 SAT 归约追踪")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Master reduction trace", "主归约追踪")}</strong>
          <p>{textFor(lang, "The reduction evaluates one fixed assignment and emits one constraint per gate in topological order.", "归约对某个固定赋值逐门处理，按拓扑顺序逐步发射约束。")}</p>
        </div>
        <span className={`pnp-badge ${run.status}`}>{statusLabel}</span>
      </div>

      <div className="circuit-sat-two-column">
        <div className="circuit-sat-result-card">
          <strong>{textFor(lang, "Current step", "当前步骤")}</strong>
          <p>{currentStep?.kind === "gate"
            ? `${textFor(lang, "emit", "发射")} ${currentStep.helperVar}: ${currentStep.blueprint} -> ${currentStep.emittedFormula}`
            : currentStep?.kind === "assert-output"
              ? textFor(lang, "append final AND z", "追加最终 AND z")
              : textFor(lang, "start or malformed, no emitted step yet", "起始或格式错误：尚无发射步骤")}
          </p>
          {run.status === "ok" ? <p>{textFor(lang, "gate value check", "该步约束真值")} = {currentStep?.kind === "gate" ? Number(currentStep.constraintSatisfied) : currentStep?.kind === "assert-output" ? Number(currentStep.gateConstraintSatisfied) : 0}</p> : null}
          <p aria-live="polite">{malformedReason || textFor(lang, "Input values must be valid and then every step uses stored predecessors.", "赋值先验必须合法，每一步只使用已存储的前置值。")}</p>
        </div>

        <div className="circuit-sat-result-card">
          <strong>{textFor(lang, "Assignment view", "赋值视图")}</strong>
          <p><strong>{textFor(lang, "inputs", "输入")}</strong> {pairText(inputValues)}</p>
          <p><strong>{textFor(lang, "helpers", "辅助变量")}</strong> {pairText(helperValues)}</p>
          <p><strong>{textFor(lang, "emitted prefix", "累计 emitted 公式前缀")}</strong></p>
          <p><code>{emittedSequenceText(emittedSoFar)}</code></p>
          {run.status === "ok" && currentStep?.kind === "assert-output" ? (
            <p><strong>{textFor(lang, "Φ_C value", "Φ_C 值")}:</strong> {currentStep.finalFormulaValue}</p>
          ) : null}
        </div>
      </div>

      <div className="circuit-sat-control-row">
        <button type="button" onClick={() => setStepIndex(Math.max(0, safeStepIndex - 1))} disabled={safeStepIndex === 0}>
          {control.prev}
        </button>
        <button type="button" onClick={() => setStepIndex(Math.min(maxStepIndex, safeStepIndex + 1))} disabled={run.status === "malformed" || safeStepIndex >= maxStepIndex}>
          {control.next}
        </button>
        <button type="button" onClick={() => setStepIndex(0)} disabled={run.steps.length === 0}>
          {control.reset}
        </button>
        <output>{run.steps.length === 0 ? 0 : safeStepIndex + 1} / {run.steps.length}</output>
      </div>

      <div className="circuit-sat-tabs" aria-label={textFor(lang, "Assignment choices", "赋值选项")}>
        {assignmentChoices.map((value) => (
          <button
            key={value}
            type="button"
            className={assignment === value ? "active" : ""}
            aria-pressed={assignment === value}
            onClick={() => chooseAssignment(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {run.status === "malformed" ? null : (
        <CircuitSatSvg
          lang={lang}
          assignment={run.assignment}
          currentId={currentStep?.kind === "gate" ? currentStep.gateId : undefined}
          visibleValues={currentStep?.kind === "gate" ? currentStep.storedValues : run.gateValues}
          markerId={`circuit-sat-to-sat-trace-arrow-${lang}`}
        />
      )}

      <div className="circuit-sat-bridge">
        <div className="circuit-sat-result-card">
          <strong>{textFor(lang, "Blueprint (local)",
            "蓝图（局部）")}</strong>
          <p>{currentStep?.kind === "gate"
            ? currentStep.blueprint
            : textFor(lang, "available only during gate steps", "仅门步骤可见")}</p>
        </div>
        <div className="circuit-sat-arrow-card">→</div>
        <div className="circuit-sat-result-card">
          <strong>{textFor(lang, "Emitted formula so far", "已发射公式前缀")}</strong>
          {run.status === "malformed"
            ? <p>{textFor(lang, "malformed assignments emit no formula", "格式错误赋值不发射公式")}</p>
            : <p><code>{emittedSequenceText(emittedSoFar)}</code></p>}
        </div>
      </div>

      <table className="pnp-mini-table">
        <caption>{textFor(lang, "Trace sequence", "追踪序列")}</caption>
        <thead>
          <tr>
            <th>{textFor(lang, "step", "步骤")}</th>
            <th>{textFor(lang, "work", "工作")}</th>
            <th>{textFor(lang, "emitted", "发射值")}</th>
          </tr>
        </thead>
        <tbody>
          {run.steps.map((step, index) => (
            <tr key={index} className={index === safeStepIndex ? "active" : ""}>
              <th scope="row">{index + 1}</th>
              <td>
                {step.kind === "gate"
                  ? `${textFor(lang, "emit", "发射")} ${step.helperVar}`
                  : textFor(lang, "assert-output", "断言 output 约束")}
              </td>
              <td>{step.kind === "gate" ? step.emittedFormula : step.finalFormulaValue === 1 ? "z" : "z (0)"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
