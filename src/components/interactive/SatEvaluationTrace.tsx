import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { SatFormulaTreeSvg } from "./SatFormulaRuleFigure";
import {
  evaluateFormula,
  malformedFixtures,
  satFormula,
  textFor,
  type SatTraceStep
} from "./satTrace";

const traceChoices = [
  { id: "1010", label: "1010" },
  { id: "0101", label: "0101" },
  { id: "0000", label: "0000" },
  { id: "101", label: "101" },
  { id: "1020", label: "1020" }
];

function stepTitle(step: SatTraceStep, lang: Locale) {
  if (step.kind === "validation") {
    return step.valid ? textFor(lang, "validation passed", "验证通过") : textFor(lang, "malformed certificate", "格式错误的证书");
  }
  if (step.kind === "final") return textFor(lang, "read root result", "读取根节点结果");
  return `${step.id}: ${step.op.toUpperCase()}`;
}

function stepBody(step: SatTraceStep, lang: Locale) {
  if (step.kind === "validation") return step.message[lang];
  if (step.kind === "final") return step.message[lang];
  const inputs = step.dependencies.map((input) => `${input.id}=${input.value}`).join(", ");
  return `${step.expression}: ${inputs} -> ${step.output}`;
}

export default function SatEvaluationTrace({ lang }: { lang: Locale }) {
  const [certificate, setCertificate] = useState("1010");
  const result = useMemo(() => evaluateFormula(satFormula, certificate), [certificate]);
  const [stepIndex, setStepIndex] = useState(0);
  const safeStepIndex = Math.min(stepIndex, result.steps.length - 1);
  const current = result.steps[safeStepIndex];
  const currentFormula = current?.kind === "formula" ? current.id : undefined;
  const malformedReason = malformedFixtures.find((fixture) => fixture.certificate === certificate)?.reason[lang];

  function choose(next: string) {
    setCertificate(next);
    setStepIndex(0);
  }

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "SAT evaluation trace", "SAT 求值追踪")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Verifier trace: evaluate one proposed assignment", "验证器追踪：求值一个候选赋值")}</strong>
          <p>{textFor(lang, "The verifier validates the certificate, evaluates formula occurrences bottom up, then reads the root.", "验证器先检查证书格式，再自底向上求值公式出现位置，最后读取根节点。")}</p>
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
          {textFor(lang, "Previous subformula", "上一个子公式")}
        </button>
        <button type="button" onClick={() => setStepIndex(Math.min(result.steps.length - 1, safeStepIndex + 1))} disabled={safeStepIndex >= result.steps.length - 1}>
          {textFor(lang, "Next subformula", "下一个子公式")}
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
          {current.kind === "formula" ? <p>{current.explanation[lang]}</p> : null}
          {malformedReason ? <p>{malformedReason}</p> : null}
          <p>
            {result.result === "malformed"
              ? textFor(lang, "Malformed assignments stop at validation. No formula node has been evaluated.", "格式错误的赋值在验证阶段停止。没有求值任何公式节点。")
              : textFor(lang, "Stored values grow monotonically: each parent is stored only after its children are known.", "已存储的值逐步增加：每个父节点只在子节点已知之后存储。")}
          </p>
        </div>
        <div className="circuit-sat-store">
          <strong>{textFor(lang, "Stored subformula values after this step", "此步之后存储的子公式值")}</strong>
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
        <SatFormulaTreeSvg
          lang={lang}
          assignment={result.assignmentString}
          currentId={currentFormula}
          visibleValues={current.storedValues}
          markerId={`sat-trace-arrow-${lang}`}
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
