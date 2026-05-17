import type { Locale } from "../../i18n/locales";
import { candidateRows, circuit, verifyCircuit, textFor, type Assignment } from "./pnpTrace";

type ScenarioId =
  | "hook"
  | "search-snapshot"
  | "accepting-certificate"
  | "candidate-comparison"
  | "size-scaffold"
  | "code-trace"
  | "p-subset"
  | "complexity"
  | "common-confusions";

const scenarioCopy: Record<ScenarioId, Record<Locale, { title: string; summary: string }>> = {
  hook: {
    en: { title: "Find a key vs try this key", summary: "The lock has switches, gates, and an output. A proposed key can be checked directly." },
    zh: { title: "找一把钥匙 vs 试这把钥匙", summary: "这个锁有开关、逻辑门和输出。给出一把候选钥匙后，可以直接检查。" }
  },
  "search-snapshot": {
    en: { title: "Brute force can get lucky, but it has no promise", summary: "The toy circuit opens on 000, but a worst-case search may need almost every row." },
    zh: { title: "暴力搜索可能走运，但没有保证", summary: "这个小电路在 000 就能打开，但最坏情况下可能几乎要看完所有行。" }
  },
  "accepting-certificate": {
    en: { title: "A certificate is one proposed Yes witness", summary: "The assignment 110 flows through the gates and makes the output 1." },
    zh: { title: "证书是一个候选 Yes 见证", summary: "赋值 110 经过逻辑门后让输出变成 1。" }
  },
  "candidate-comparison": {
    en: { title: "One failed key is not a No proof", summary: "011 fails, but 110 and 000 both open the same toy lock." },
    zh: { title: "一把失败钥匙不是 No 证明", summary: "011 失败，但 110 和 000 都能打开同一个小锁。" }
  },
  "size-scaffold": {
    en: { title: "What is polynomial in what?", summary: "The instance, certificate, and verifier work all have sizes." },
    zh: { title: "到底是对什么多项式？", summary: "实例、证书和验证器工作量都有自己的大小。" }
  },
  "code-trace": {
    en: { title: "Verifier trace for the toy circuit", summary: "A general verifier checks format, then evaluates gates in topological order." },
    zh: { title: "小电路的验证器追踪", summary: "通用验证器先检查格式，再按拓扑顺序求每个门的值。" }
  },
  "p-subset": {
    en: { title: "Why P is inside NP", summary: "This is not the circuit verifier: a P solver can ignore a dummy certificate and solve directly." },
    zh: { title: "为什么 P 在 NP 里面", summary: "这不是电路验证器：P 中的求解器可以忽略空证书，直接求解。" }
  },
  complexity: {
    en: { title: "Search count vs one check", summary: "The growth model is a visual counting proxy, not a full encoding-cost proof." },
    zh: { title: "搜索数量 vs 一次检查", summary: "增长模型只是可视化计数代理，不是完整编码成本证明。" }
  },
  "common-confusions": {
    en: { title: "Misconceptions to avoid", summary: "NP is about checkable Yes certificates, not 'not polynomial'." },
    zh: { title: "容易混淆的点", summary: "NP 讲的是可检查的 Yes 证书，不是“非多项式”。" }
  }
};

function boolText(value: boolean, lang: Locale) {
  return value ? textFor(lang, "True", "真") : textFor(lang, "False", "假");
}

function CircuitSvg({ assignment, lang, markerId }: { assignment?: Assignment; lang: Locale; markerId: string }) {
  const result = assignment ? verifyCircuit(circuit, assignment) : null;
  const trace = result?.trace ?? [];
  const values = new Map<string, boolean>();
  if (assignment) {
    values.set("x1", assignment.x1 === 1);
    values.set("x2", assignment.x2 === 1);
    values.set("x3", assignment.x3 === 1);
    for (const step of trace) values.set(step.gateId, step.outputValue);
  }
  const output = values.get("z");
  return (
    <svg viewBox="0 0 520 220" role="img" aria-label={textFor(lang, "Boolean lock circuit", "布尔锁电路")}>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {[
        [90, 55, 205, 75],
        [90, 105, 205, 95],
        [90, 155, 205, 145],
        [265, 85, 365, 105],
        [265, 145, 365, 125],
        [425, 115, 480, 115]
      ].map(([x1, y1, x2, y2], index) => (
        <line key={index} className="pnp-wire" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${markerId})`} />
      ))}
      {(["x1", "x2", "x3"] as const).map((id, index) => (
        <g key={id} transform={`translate(60, ${55 + index * 50})`}>
          <rect className="pnp-switch" x="-28" y="-18" width="56" height="36" rx="8" />
          <text textAnchor="middle" y="-2">{id}</text>
          <text className="pnp-bit" textAnchor="middle" y="14">{assignment ? assignment[id] : "?"}</text>
        </g>
      ))}
      <g transform="translate(235, 85)">
        <rect className="pnp-gate" x="-38" y="-24" width="76" height="48" rx="8" />
        <text textAnchor="middle" y="4">AND</text>
        <text className="pnp-bit" textAnchor="middle" y="20">{values.has("g1") ? Number(values.get("g1")) : "?"}</text>
      </g>
      <g transform="translate(235, 145)">
        <rect className="pnp-gate" x="-38" y="-24" width="76" height="48" rx="8" />
        <text textAnchor="middle" y="4">NOT</text>
        <text className="pnp-bit" textAnchor="middle" y="20">{values.has("g2") ? Number(values.get("g2")) : "?"}</text>
      </g>
      <g transform="translate(395, 115)">
        <rect className="pnp-gate" x="-38" y="-24" width="76" height="48" rx="8" />
        <text textAnchor="middle" y="4">OR</text>
        <text className="pnp-bit" textAnchor="middle" y="20">{output === undefined ? "?" : Number(output)}</text>
      </g>
      <g transform="translate(492, 115)">
        <circle className={output ? "accept" : output === false ? "reject" : ""} r="24" />
        <text textAnchor="middle" y="4">{output === undefined ? "?" : output ? "1" : "0"}</text>
      </g>
    </svg>
  );
}

function CandidateTable({ lang }: { lang: Locale }) {
  return (
    <div className="pnp-card-grid">
      {candidateRows.map((row) => {
        const trace = verifyCircuit(circuit, row.assignment).trace;
        return (
          <div key={row.id} className={`pnp-card ${row.result ? "accept" : "reject"}`}>
            <strong>{row.id}</strong>
            <span>{row.label[lang]}</span>
            <p>{trace.map((step) => `${step.gateId}=${Number(step.outputValue)}`).join(" · ")}</p>
          </div>
        );
      })}
    </div>
  );
}

function SearchSnapshot({ lang }: { lang: Locale }) {
  const rows = ["000", "001", "010", "011", "100", "101", "110", "111"];
  return (
    <div className="pnp-search-grid" aria-label={textFor(lang, "Brute-force assignment grid", "暴力搜索赋值表")}>
      {rows.map((row) => (
        <span key={row} className={row === "011" ? "reject" : row === "000" ? "accept" : ""}>{row}</span>
      ))}
      <p>{textFor(lang, "Try a failed row such as 011 before the lucky 000 reveal. Worst-case search has no lucky-order promise.", "先试 011 这样的失败行，再揭示走运的 000。最坏情况搜索没有走运顺序的保证。")}</p>
    </div>
  );
}

function SizeScaffold({ lang }: { lang: Locale }) {
  const rows = [
    [textFor(lang, "Instance size", "实例大小"), "3 inputs + 3 gates", textFor(lang, "the circuit description", "电路描述")],
    [textFor(lang, "Certificate size", "证书大小"), "3 bits", textFor(lang, "one bit per input", "每个输入一位")],
    [textFor(lang, "Verifier steps", "验证步骤"), "3 bit checks + 3 gates", textFor(lang, "format check plus gate evaluation", "格式检查加逻辑门求值")]
  ];
  return (
    <div className="pnp-size-strip">
      {rows.map(([label, value, note]) => (
        <div key={label}>
          <strong>{label}</strong>
          <span>{value}</span>
          <p>{note}</p>
        </div>
      ))}
    </div>
  );
}

function CodeTrace({ lang }: { lang: Locale }) {
  const trace = verifyCircuit(circuit, { x1: 1, x2: 1, x3: 0 }).trace;
  return (
    <table className="pnp-mini-table">
      <caption>{textFor(lang, "Trace for assignment 110", "赋值 110 的追踪")}</caption>
      <thead>
        <tr>
          <th>{textFor(lang, "Gate", "门")}</th>
          <th>{textFor(lang, "Inputs", "输入")}</th>
          <th>{textFor(lang, "Output", "输出")}</th>
        </tr>
      </thead>
      <tbody>
        {trace.map((step) => (
          <tr key={step.gateId}>
            <th scope="row">{step.gateId} {step.op}</th>
            <td>{step.inputValues.map((value) => boolText(value, lang)).join(", ")}</td>
            <td>{boolText(step.outputValue, lang)}</td>
          </tr>
        ))}
        <tr>
          <th scope="row">{textFor(lang, "Malformed", "格式错误")}</th>
          <td>{textFor(lang, "missing x3 or non-bit value", "缺少 x3 或出现非 0/1 值")}</td>
          <td>{textFor(lang, "reject before gates", "在求门值前拒绝")}</td>
        </tr>
      </tbody>
    </table>
  );
}

function PSubset({ lang }: { lang: Locale }) {
  return (
    <div className="pnp-flow">
      <span className="pnp-badge">{textFor(lang, "not the circuit verifier", "不是电路验证器")}</span>
      <div><strong>{textFor(lang, "Yes instance", "Yes 实例")}</strong><span>{textFor(lang, "dummy certificate -> P solver says Yes -> accept", "空证书 -> P 求解器回答 Yes -> 接受")}</span></div>
      <div><strong>{textFor(lang, "No instance", "No 实例")}</strong><span>{textFor(lang, "dummy certificate -> P solver says No -> reject", "空证书 -> P 求解器回答 No -> 拒绝")}</span></div>
    </div>
  );
}

function ComplexityRows({ lang }: { lang: Locale }) {
  const rows = [3, 10, 30].map((n) => ({ n, assignments: 2 ** n, check: 3 * n }));
  return (
    <table className="pnp-mini-table">
      <caption>{textFor(lang, "Scaling thought experiment, not the same circuit", "扩展思想实验，不是同一个电路")}</caption>
      <thead><tr><th>n</th><th>2^n</th><th>{textFor(lang, "one check", "一次检查")}</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.n}>
            <th scope="row">{row.n}</th>
            <td>{row.assignments.toLocaleString()}</td>
            <td>{row.check}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Confusions({ lang }: { lang: Locale }) {
  const items = [
    ["NP != non-polynomial", textFor(lang, "NP means Yes answers have short checkable certificates.", "NP 表示 Yes 答案有短且可检查的证书。")],
    ["NP-hard != in NP", textFor(lang, "Hardness comparison comes later and is not the same as membership.", "困难性比较稍后再讲，它不等于属于 NP。")],
    [textFor(lang, "Failed key", "失败钥匙"), textFor(lang, "One failed candidate only rejects that candidate, not the whole instance.", "一个失败候选只排除它自己，不排除整个实例。")],
    [textFor(lang, "Giant table", "巨大表格"), textFor(lang, "A certificate must be polynomial-size, not an exponential lookup table.", "证书必须是多项式大小，不能是指数大的查找表。")]
  ];
  return (
    <div className="pnp-card-grid">
      {items.map(([title, body]) => (
        <div key={title} className="pnp-card">
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

export default function PnpCircuitFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const copy = scenarioCopy[scenarioId][lang];
  const showCircuit = ["hook", "accepting-certificate", "candidate-comparison"].includes(scenarioId);
  const assignment = scenarioId === "candidate-comparison" ? candidateRows[2].assignment : candidateRows[0].assignment;

  return (
    <figure className="pnp-figure">
      <figcaption>
        <strong>{copy.title}</strong>
        <span>{copy.summary}</span>
      </figcaption>
      {scenarioId === "hook" ? (
        <div className="pnp-legend">
          <span>{textFor(lang, "switch = input bit", "开关 = 输入位")}</span>
          <span>AND</span>
          <span>OR</span>
          <span>NOT</span>
          <span>{textFor(lang, "output 1 opens", "输出 1 表示打开")}</span>
        </div>
      ) : null}
      {showCircuit ? <CircuitSvg assignment={assignment} lang={lang} markerId={`pnp-arrow-${scenarioId}-${lang}`} /> : null}
      {scenarioId === "search-snapshot" ? <SearchSnapshot lang={lang} /> : null}
      {scenarioId === "candidate-comparison" || scenarioId === "accepting-certificate" ? <CandidateTable lang={lang} /> : null}
      {scenarioId === "size-scaffold" ? <SizeScaffold lang={lang} /> : null}
      {scenarioId === "code-trace" ? <CodeTrace lang={lang} /> : null}
      {scenarioId === "p-subset" ? <PSubset lang={lang} /> : null}
      {scenarioId === "complexity" ? <ComplexityRows lang={lang} /> : null}
      {scenarioId === "common-confusions" ? <Confusions lang={lang} /> : null}
    </figure>
  );
}
