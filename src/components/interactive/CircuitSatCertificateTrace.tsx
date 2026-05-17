import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  circuitSatCircuit,
  evaluateCircuit,
  malformedFixtures,
  textFor,
  type CircuitSatTraceStep
} from "./circuitSatTrace";
import { CircuitSatSvg } from "./CircuitSatCircuitFigure";

const traceChoices = [
  { id: "1010", label: "1010" },
  { id: "0101", label: "0101" },
  { id: "0000", label: "0000" },
  { id: "101", label: "101" },
  { id: "1020", label: "1020" }
];

function stepTitle(step: CircuitSatTraceStep, lang: Locale) {
  if (step.kind === "validation") {
    return step.valid ? textFor(lang, "validation passed", "验证通过") : textFor(lang, "malformed certificate", "格式错误的证书");
  }
  if (step.kind === "final") return textFor(lang, "read final output", "读取最终输出");
  return `${step.id}: ${step.op}`;
}

function stepBody(step: CircuitSatTraceStep, lang: Locale) {
  if (step.kind === "validation") return step.message[lang];
  if (step.kind === "final") return step.message[lang];
  const inputs = step.inputs.map((input) => `${input.id}=${input.value}`).join(", ");
  return `${inputs} -> ${step.id}=${step.output}`;
}

export default function CircuitSatCertificateTrace({ lang }: { lang: Locale }) {
  const [certificate, setCertificate] = useState("1010");
  const result = useMemo(() => evaluateCircuit(circuitSatCircuit, certificate), [certificate]);
  const [stepIndex, setStepIndex] = useState(0);
  const safeStepIndex = Math.min(stepIndex, result.steps.length - 1);
  const current = result.steps[safeStepIndex];
  const currentGate = current?.kind === "gate" ? current.id : undefined;
  const malformedReason = malformedFixtures.find((fixture) => fixture.certificate === certificate)?.reason[lang];

  function choose(next: string) {
    setCertificate(next);
    setStepIndex(0);
  }

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT certificate trace", "Circuit-SAT 证书追踪")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Verifier trace: check one proposed assignment", "验证器追踪：检查一个候选赋值")}</strong>
          <p>{textFor(lang, "The verifier validates the certificate, evaluates gates in topological order, then reads z.", "验证器先检查证书格式，再按拓扑顺序计算逻辑门，最后读取 z。")}</p>
        </div>
        <span className={`pnp-badge ${result.result}`}>{result.result === "malformed" ? textFor(lang, "malformed certificate", "格式错误的证书") : result.result}</span>
      </div>

      <div className="pnp-tabs" aria-label={textFor(lang, "Certificate choices", "证书选项")}>
        {traceChoices.map((choice) => (
          <button key={choice.id} type="button" className={certificate === choice.id ? "active" : ""} aria-pressed={certificate === choice.id} onClick={() => choose(choice.id)}>
            {choice.label}
          </button>
        ))}
      </div>

      <div className="circuit-sat-control-row">
        <button type="button" onClick={() => setStepIndex(Math.max(0, safeStepIndex - 1))} disabled={safeStepIndex === 0}>
          {textFor(lang, "Previous gate", "上一步")}
        </button>
        <button type="button" onClick={() => setStepIndex(Math.min(result.steps.length - 1, safeStepIndex + 1))} disabled={safeStepIndex >= result.steps.length - 1}>
          {textFor(lang, "Next gate", "下一步")}
        </button>
        <button type="button" onClick={() => setStepIndex(0)}>
          {textFor(lang, "Reset trace", "重置追踪")}
        </button>
        <output>{safeStepIndex + 1} / {result.steps.length}</output>
      </div>

      <div className="circuit-sat-two-column">
        <div className="circuit-sat-result-card">
          <strong>{stepTitle(current, lang)}</strong>
          <span>{stepBody(current, lang)}</span>
          {malformedReason ? <p>{malformedReason}</p> : null}
          <p>
            {result.result === "malformed"
              ? textFor(lang, "Malformed assignments stop at validation. No gate-evaluation steps have run.", "格式错误的赋值在验证阶段停止。没有运行任何逻辑门。")
              : textFor(lang, "Stored values grow monotonically: each new gate value is added after its inputs are already known.", "已存储的值逐步增加：每个新的门值都在其输入已知之后加入。")}
          </p>
        </div>
        <div className="circuit-sat-store">
          <strong>{textFor(lang, "Stored values after this step", "此步之后存储的值")}</strong>
          <div>
            {current.storedValues.length === 0 ? (
              <span>{textFor(lang, "none yet", "尚无")}</span>
            ) : current.storedValues.map((item) => (
              <span key={item.id}>{item.id}={item.value}</span>
            ))}
          </div>
        </div>
      </div>

      {result.result === "malformed" ? null : (
        <CircuitSatSvg
          lang={lang}
          assignment={result.assignmentString as never}
          currentId={currentGate}
          visibleValues={current.storedValues}
          markerId={`circuit-sat-trace-arrow-${lang}`}
        />
      )}

      <table className="pnp-mini-table">
        <caption>{textFor(lang, "Canonical trace order", "标准追踪顺序")}</caption>
        <thead>
          <tr><th>{textFor(lang, "step", "步骤")}</th><th>{textFor(lang, "work", "工作")}</th><th>{textFor(lang, "status", "状态")}</th></tr>
        </thead>
        <tbody>
          {result.steps.map((step, index) => (
            <tr key={step.id} className={index === safeStepIndex ? "active" : ""}>
              <th scope="row">{stepTitle(step, lang)}</th>
              <td>{stepBody(step, lang)}</td>
              <td>{index < safeStepIndex ? textFor(lang, "done", "已完成") : index === safeStepIndex ? textFor(lang, "current", "当前") : textFor(lang, "waiting", "等待")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
