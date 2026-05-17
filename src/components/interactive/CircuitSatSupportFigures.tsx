import type { Locale } from "../../i18n/locales";
import {
  assignmentRows,
  circuitSatCircuit,
  evaluateCircuit,
  textFor,
  type AssignmentString
} from "./circuitSatTrace";

export function CircuitSatSearchCheckBridge({ lang }: { lang: Locale }) {
  const highlighted = "1010";

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Existence search becomes one certificate check", "存在性搜索变成一次证书检查")}</strong>
        <span>{textFor(lang, "The problem asks whether some row exists. A certificate is one claimed witness row, not a shortcut for finding it.", "问题问是否存在某一行。证书是一行被声称的见证，不是自动找到它的捷径。")}</span>
      </figcaption>
      <div className="circuit-sat-bridge">
        <div className="circuit-sat-row-grid compact" aria-label={textFor(lang, "Candidate rows", "候选行")}>
          {["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"].map((row) => (
            <span key={row} className={row === highlighted ? "active accept" : ""}>{row}</span>
          ))}
        </div>
        <div className="circuit-sat-arrow-card">{"->"}</div>
        <div className="circuit-sat-result-card accept">
          <strong>{textFor(lang, "chosen certificate", "被选中的证书")}: {highlighted}</strong>
          <span>{textFor(lang, "check only this row", "只检查这一行")}</span>
          <p>{textFor(lang, "If it makes z=1, the instance is Yes. If it fails, only this certificate failed.", "如果它让 z=1，则实例是 Yes。如果它失败，只说明这个证书失败。")}</p>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatFormalCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Formal decision language", "形式化判定语言")}</strong>
        <span>{textFor(lang, "After the concrete circuit, the symbol C means any Boolean circuit with n inputs and one output.", "看过具体电路后，符号 C 表示任意有 n 个输入和一个输出的布尔电路。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <div className="pnp-card">
          <strong>C</strong>
          <p>{textFor(lang, "a finite directed acyclic Boolean circuit", "一个有限的有向无环布尔电路")}</p>
        </div>
        <div className="pnp-card">
          <strong>a in {"{0,1}"}^n</strong>
          <p>{textFor(lang, "one bit for each input", "每个输入对应一位")}</p>
        </div>
        <div className="pnp-card accept">
          <strong>C(a) = 1</strong>
          <p>{textFor(lang, "the output lamp turns on", "输出灯被点亮")}</p>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatVerifierTable({ lang, assignment = "1010" }: { lang: Locale; assignment?: AssignmentString }) {
  const result = evaluateCircuit(circuitSatCircuit, assignment);

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Verifier implementation trace", "验证器实现追踪")}</strong>
        <span>{textFor(lang, "A concrete implementation stores input bits, then gate outputs, in the same order every time.", "具体实现先存输入 bit，再按固定顺序存逻辑门输出。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "step", "步骤")}</th>
            <th>{textFor(lang, "inputs read", "读取输入")}</th>
            <th>{textFor(lang, "stored output", "存储输出")}</th>
          </tr>
        </thead>
        <tbody>
          {result.gateSteps.map((step) => (
            <tr key={step.id}>
              <th scope="row">{step.id} = {step.op}</th>
              <td>{step.inputs.map((input) => `${input.id}=${input.value}`).join(", ")}</td>
              <td>{step.id}={step.output}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">{textFor(lang, "read z", "读取 z")}</th>
            <td>z={result.output}</td>
            <td>{result.result}</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatInvariantRail({ lang }: { lang: Locale }) {
  const result = evaluateCircuit(circuitSatCircuit, "1010");

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Gate-order invariant", "逻辑门顺序不变量")}</strong>
        <span>{textFor(lang, "When a gate is evaluated, every wire it reads has already been assigned its correct Boolean value.", "当计算某个逻辑门时，它读取的每条线都已经有了正确布尔值。")}</span>
      </figcaption>
      <div className="circuit-sat-rail">
        {result.gateSteps.map((step) => (
          <div key={step.id}>
            <strong>{step.id}</strong>
            <span>{step.inputs.map((input) => input.id).join(" + ")} {"->"} {step.output}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function CircuitSatCostStack({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Cost stack", "成本堆栈")}</strong>
        <span>{textFor(lang, "For this fixture, |C| counts 4 inputs, 6 gates, and 11 wires. The verifier touches each part once up to constant gate cost.", "在本例中，|C| 包含 4 个输入、6 个逻辑门和 11 条导线。验证器以常数门成本近似触碰每个部分一次。")}</span>
      </figcaption>
      <div className="pnp-growth-grid">
        <div>
          <strong>{textFor(lang, "validate certificate", "检查证书")}</strong>
          <span>n = {circuitSatCircuit.inputs.length}</span>
          <p>{textFor(lang, "one bit per input", "每个输入一位")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "evaluate gates", "计算逻辑门")}</strong>
          <span>{circuitSatCircuit.gates.length} {textFor(lang, "gates", "个逻辑门")}</span>
          <p>{textFor(lang, "topological order", "拓扑顺序")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "follow wires", "沿导线读取")}</strong>
          <span>{circuitSatCircuit.wireCount} {textFor(lang, "wires", "条导线")}</span>
          <p>{textFor(lang, "dependencies are already known", "依赖值已经已知")}</p>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatClaimLedger({ lang }: { lang: Locale }) {
  const rows = [
    {
      claim: textFor(lang, "Circuit-SAT is in NP", "Circuit-SAT 属于 NP"),
      treatment: textFor(lang, "proved here", "本页证明"),
      note: textFor(lang, "assignment length n; verifier runs in O(|C| + n)", "赋值长度为 n；验证器运行时间为 O(|C| + n)")
    },
    {
      claim: textFor(lang, "Circuit-SAT is NP-hard", "Circuit-SAT 是 NP-hard"),
      treatment: textFor(lang, "named here", "本页只命名"),
      note: textFor(lang, "Cook-Levin theorem preview; the proof is not expanded", "Cook-Levin 定理预告；本页不展开证明")
    },
    {
      claim: textFor(lang, "the tiny fixture proves hardness", "小例子证明困难性"),
      treatment: textFor(lang, "false", "错误"),
      note: textFor(lang, "the fixture demonstrates checking, not universal reductions", "小例子展示检查，不展示全称归约")
    }
  ];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Claim boundary ledger", "主张边界账本")}</strong>
        <span>{textFor(lang, "Keep membership and hardness separate.", "把成员关系和困难性分开。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr><th>{textFor(lang, "claim", "主张")}</th><th>{textFor(lang, "treatment", "处理方式")}</th><th>{textFor(lang, "why", "原因")}</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.claim}>
              <th scope="row">{row.claim}</th>
              <td>{row.treatment}</td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatAssignmentSummary({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Fixture rows used throughout", "贯穿全页的固定赋值行")}</strong>
        <span>{textFor(lang, "Malformed examples are kept out of the exhaustive-search grid and shown in verifier/practice surfaces.", "格式错误例子不放入穷举搜索表，而放在验证器和练习中。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {assignmentRows.slice(0, 3).map((row) => (
          <div key={row.id} className={`pnp-card ${row.result}`}>
            <strong>{row.assignment} {"->"} z={row.output}</strong>
            <span>{row.reasonBadge[lang]}</span>
            <p>{row.note[lang]}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
