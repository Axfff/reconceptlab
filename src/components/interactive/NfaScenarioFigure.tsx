import type { Locale } from "../../i18n/locales";
import {
  acceptingStates,
  formatStateSet,
  generateNfaTrace,
  nfaFixture,
  nfaStates,
  nfaSymbols,
  scenarioMeta,
  stateLabels,
  stateMeanings,
  transitionTable,
  type NfaScenarioId,
  type NfaState,
  type NfaTrace
} from "./nfaTrace";

const positions: Record<NfaState, { x: number; y: number }> = {
  q0: { x: 95, y: 92 },
  q1: { x: 315, y: 92 },
  q2: { x: 535, y: 92 }
};

function highlightSubstring(input: string) {
  const index = input.indexOf("01");
  if (index < 0) return input;
  return (
    <>
      {input.slice(0, index)}
      <mark>{input.slice(index, index + 2)}</mark>
      {input.slice(index + 2)}
    </>
  );
}

const chipStatusLabels = {
  en: {
    active: "active",
    inactive: "inactive",
    accepting: "accepting state",
    spawned: "newly spawned",
    died: "old branch died"
  },
  zh: {
    active: "活跃",
    inactive: "未活跃",
    accepting: "接受状态",
    spawned: "新生成",
    died: "旧分支死亡"
  }
} as const;

function StateChips({ states, lang, spawned = [], died = [] }: { states: NfaState[]; lang: Locale; spawned?: NfaState[]; died?: NfaState[] }) {
  const t = chipStatusLabels[lang];
  return (
    <div className="nfa-chip-row">
      {nfaStates.map((state) => {
        const active = states.includes(state);
        const statuses: string[] = [active ? t.active : t.inactive];
        if (acceptingStates.includes(state)) statuses.push(t.accepting);
        if (spawned.includes(state)) statuses.push(t.spawned);
        if (died.includes(state)) statuses.push(t.died);
        return (
          <span key={state} className={`nfa-chip ${active ? "active" : ""} ${acceptingStates.includes(state) ? "accept" : ""} ${spawned.includes(state) ? "spawned" : ""} ${died.includes(state) ? "died" : ""}`}>
            <strong>{state}</strong>
            <small>{stateLabels[state][lang]}</small>
            <em>{statuses.join(" / ")}</em>
          </span>
        );
      })}
    </div>
  );
}

function MachineDiagram({ lang, activeStates = [], focus = "0" }: { lang: Locale; activeStates?: NfaState[]; focus?: "0" | "1" }) {
  const edges: Array<[NfaState, NfaState, string, number]> = [
    ["q0", "q0", "0,1", -38],
    ["q0", "q1", "0", 0],
    ["q1", "q2", "1", 0],
    ["q2", "q2", "0,1", -38]
  ];

  return (
    <svg className="nfa-state-svg" viewBox="0 0 630 180" role="img" aria-label={lang === "en" ? "NFA diagram for strings containing 01" : "识别包含 01 字符串的 NFA 图"}>
      <defs>
        <marker id="nfa-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      <line className="nfa-start-edge" x1="18" y1="92" x2="55" y2="92" markerEnd="url(#nfa-arrow)" />
      {edges.map(([from, to, label, offset]) => {
        const a = positions[from];
        const b = positions[to];
        const self = from === to;
        const emphasized = label.includes(focus);
        return (
          <g key={`${from}-${to}-${label}`} className={`nfa-edge ${emphasized ? "focus" : ""}`}>
            {self ? (
              <path d={`M ${a.x - 17} ${a.y - 32} C ${a.x - 64} ${a.y - 82}, ${a.x + 64} ${a.y - 82}, ${a.x + 17} ${a.y - 32}`} markerEnd="url(#nfa-arrow)" />
            ) : (
              <line x1={a.x + 38} y1={a.y} x2={b.x - 38} y2={b.y} markerEnd="url(#nfa-arrow)" />
            )}
            <text x={(a.x + b.x) / 2} y={self ? a.y - 72 : a.y - 12 + offset}>{label}</text>
          </g>
        );
      })}
      {nfaStates.map((state) => {
        const accepting = acceptingStates.includes(state);
        return (
          <g key={state} transform={`translate(${positions[state].x}, ${positions[state].y})`} className={`${activeStates.includes(state) ? "active" : ""} ${accepting ? "accepting" : ""}`}>
            <circle r={accepting ? 40 : 34} />
            {accepting ? <circle r="29" /> : null}
            <text textAnchor="middle" y="-2">{state}</text>
            <text className="state-meaning" textAnchor="middle" y="14">{stateLabels[state][lang]}</text>
            <title>{`${state}: ${stateMeanings[state][lang]}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function TraceTable({ trace, lang }: { trace: NfaTrace; lang: Locale }) {
  return (
    <div className="nfa-table-scroll">
      <table className="nfa-mini-table">
        <caption>{lang === "en" ? "Active-set trace" : "活跃集合轨迹"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Prefix" : "前缀"}</th>
            <th>{lang === "en" ? "Read" : "读取"}</th>
            <th>{lang === "en" ? "Active states" : "活跃状态"}</th>
            <th>{lang === "en" ? "Would accept if ended here?" : "若在此结束会接受吗？"}</th>
            <th>{lang === "en" ? "Explanation" : "说明"}</th>
          </tr>
        </thead>
        <tbody>
          {trace.steps.map((step) => (
            <tr key={`${trace.input}-${step.index}`} className={step.acceptedIfInputEndedHere ? "accept-row" : ""}>
              <th scope="row">{step.prefix || "ε"}</th>
              <td>{step.input ?? "-"}</td>
              <td>{formatStateSet(step.activeStates)}</td>
              <td>{step.acceptedIfInputEndedHere ? (lang === "en" ? "yes" : "是") : (lang === "en" ? "no" : "否")}</td>
              <td>{step.explanation[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventLedger({ lang }: { lang: Locale }) {
  const step = nfaFixture.traces.doubleZero.steps[2];
  return (
    <div className="nfa-table-scroll">
      <table className="nfa-mini-table">
        <caption>{lang === "en" ? "Second 0 transition events" : "第二个 0 的转移事件"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Old branch" : "旧分支"}</th>
            <th>{lang === "en" ? "Event" : "事件"}</th>
            <th>{lang === "en" ? "Result" : "结果"}</th>
          </tr>
        </thead>
        <tbody>
          {step.transitionEvents.map((event) => (
            <tr key={event.from} className={event.died ? "dead-row" : ""}>
              <th scope="row">{event.from}</th>
              <td>{event.from} --{event.symbol}--&gt; {formatStateSet(event.to)}</td>
              <td>{event.explanation[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nfa-note">{lang === "en" ? "Before: {q0,q1}. After: {q0,q1}. The set looks unchanged, but the ledger shows one old q1 died and a new q1 was spawned." : "之前是 {q0,q1}。之后仍是 {q0,q1}。集合看似不变，但账本显示旧 q1 死亡，同时新 q1 生成。"}</p>
      <StateChips states={step.activeStates} lang={lang} spawned={step.spawnedBranches} died={step.diedBranches} />
    </div>
  );
}

function HookCards({ lang }: { lang: Locale }) {
  const cases = [
    { input: "010", result: true },
    { input: "1110", result: false },
    { input: "1001", result: true }
  ];
  return (
    <div className="nfa-card-grid">
      {cases.map((item) => (
        <article key={item.input} className={`nfa-card ${item.result ? "accept" : "reject"}`}>
          <strong>{highlightSubstring(item.input)}</strong>
          <p>{item.result ? (lang === "en" ? "pattern found" : "找到模式") : (lang === "en" ? "no 01 yet" : "没有 01")}</p>
        </article>
      ))}
    </div>
  );
}

function DfaVsNfa({ lang }: { lang: Locale }) {
  return (
    <div className="nfa-compare-grid">
      <article className="nfa-card">
        <strong>DFA</strong>
        <p>{lang === "en" ? "One current state remembers whether the previous symbol was a promising 0." : "一个当前状态记住前一个符号是否是有希望的 0。"}</p>
        <span className="nfa-badge">{lang === "en" ? "current: saw last 0" : "当前：刚看到 0"}</span>
      </article>
      <article className="nfa-card accept">
        <strong>NFA</strong>
        <p>{lang === "en" ? "The same prefix can keep q0 alive and also try q1 as a candidate start." : "同一个前缀可以保留 q0，同时尝试 q1 作为候选起点。"}</p>
        <StateChips states={["q0", "q1"]} lang={lang} spawned={["q1"]} />
      </article>
    </div>
  );
}

function StateCards({ lang }: { lang: Locale }) {
  return (
    <div className="nfa-card-grid">
      {nfaStates.map((state) => (
        <article key={state} className={`nfa-card ${acceptingStates.includes(state) ? "accept" : ""}`}>
          <strong>{state}</strong>
          <span>{stateLabels[state][lang]}</span>
          <p>{stateMeanings[state][lang]}</p>
        </article>
      ))}
    </div>
  );
}

function TupleCallout() {
  const rows = [
    ["Q", "{ q0, q1, q2 }"],
    ["Σ", "{ 0, 1 }"],
    ["δ", "Q x Σ -> P(Q)"],
    ["q0", "q0"],
    ["F", "{ q2 }"]
  ];
  return (
    <div className="nfa-card-grid">
      {rows.map(([name, value]) => (
        <article key={name} className="nfa-card">
          <strong>{name}</strong>
          <p>{value}</p>
        </article>
      ))}
    </div>
  );
}

function TransitionTable({ lang }: { lang: Locale }) {
  return (
    <div className="nfa-table-scroll">
      <table className="nfa-mini-table">
        <caption>{lang === "en" ? "Set-valued transition table" : "集合值转移表"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "State" : "状态"}</th>
            {nfaSymbols.map((symbol) => <th key={symbol}>{symbol}</th>)}
          </tr>
        </thead>
        <tbody>
          {nfaStates.map((state) => (
            <tr key={state} className={acceptingStates.includes(state) ? "accept-row" : ""}>
              <th scope="row">{state}</th>
              {nfaSymbols.map((symbol) => <td key={symbol}>{formatStateSet(transitionTable[state][symbol])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImplementationMap({ lang }: { lang: Locale }) {
  return (
    <div className="nfa-compare-grid">
      <pre className="nfa-code">{`let next = new Set<NfaState>();
for (const q of activeStates) {
  for (const r of delta[q][symbol]) {
    next.add(r);
  }
}`}</pre>
      <article className="nfa-card accept">
        <strong>{lang === "en" ? "Concrete row" : "具体一行"}</strong>
        <p>{lang === "en" ? "From S1 = {q0,q1} on 1:" : "从 S1 = {q0,q1} 读 1："}</p>
        <p><code>{"{q0} union {q2} = {q0,q2}"}</code></p>
      </article>
    </div>
  );
}

function CostSummary({ lang }: { lang: Locale }) {
  const rows = [
    ["n", lang === "en" ? "input symbols" : "输入符号"],
    ["|Q|", lang === "en" ? "maximum active states scanned per step" : "每步最多扫描的活跃状态数"],
    ["|Q||Σ|", lang === "en" ? "transition-table cells" : "转移表单元"],
    ["O(n|Q|)", lang === "en" ? "direct simulation time for a fixed alphabet lookup table" : "固定字母表查表下的直接模拟时间"]
  ];
  return (
    <div className="nfa-card-grid">
      {rows.map(([value, text]) => (
        <article key={value} className="nfa-card">
          <strong>{value}</strong>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function Confusions({ lang }: { lang: Locale }) {
  return (
    <div className="nfa-card-grid">
      <article className="nfa-card reject">
        <strong>{lang === "en" ? "Dead branch != failed input" : "分支死亡 != 输入失败"}</strong>
        <p>{lang === "en" ? "In 00, old q1 dies, but old q0 keeps the run alive." : "在 00 中，旧 q1 死亡，但旧 q0 让运行继续。"}</p>
      </article>
      <article className="nfa-card accept">
        <strong>{lang === "en" ? "Prefix acceptance is conditional" : "前缀接受是条件性的"}</strong>
        <p>{lang === "en" ? "A trace row says would accept if input ended here; whole-input accepted is checked only at the final row." : "轨迹行说的是若输入在此结束会接受；整个输入只在最后一行判断。"}</p>
      </article>
    </div>
  );
}

function PredictionPrompts({ lang }: { lang: Locale }) {
  const prompts = [
    { input: "01", answer: formatStateSet(generateNfaTrace("01").finalActiveStates), accepted: true },
    { input: "00", answer: formatStateSet(generateNfaTrace("00").finalActiveStates), accepted: false },
    { input: "1010", answer: formatStateSet(generateNfaTrace("1010").finalActiveStates), accepted: true },
    { input: "", answer: formatStateSet(generateNfaTrace("").finalActiveStates), accepted: false }
  ];
  return (
    <div className="nfa-card-grid">
      {prompts.map((prompt) => (
        <article key={prompt.input || "empty"} className="nfa-card">
          <strong>{prompt.input || "ε"}</strong>
          <p>{lang === "en" ? "Predict the final active set and result." : "预测最终活跃集合和结果。"}</p>
          <details className="nfa-reveal">
            <summary>{lang === "en" ? "Reveal answer" : "显示答案"}</summary>
            <p><code>{prompt.answer}</code> - {prompt.accepted ? (lang === "en" ? "accepted" : "接受") : (lang === "en" ? "rejected" : "拒绝")}</p>
          </details>
        </article>
      ))}
    </div>
  );
}

export default function NfaScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: NfaScenarioId }) {
  const meta = scenarioMeta[scenarioId];
  const trace010 = nfaFixture.traces.zeroOneZero;
  const step2 = trace010.steps[2];

  return (
    <figure className="nfa-figure">
      <figcaption>
        <strong>{meta.title[lang]}</strong>
        <span>{meta.summary[lang]}</span>
      </figcaption>

      {scenarioId === "hook-substring-cards" ? <HookCards lang={lang} /> : null}
      {scenarioId === "dfa-vs-nfa-comparison" ? <DfaVsNfa lang={lang} /> : null}
      {scenarioId === "branching-fork" ? (
        <>
          <MachineDiagram lang={lang} activeStates={["q0", "q1"]} focus="0" />
          <p className="nfa-note">{lang === "en" ? "One transition can return a set: delta(q0, 0) = {q0,q1}." : "一次转移可以返回集合：delta(q0, 0) = {q0,q1}。"}</p>
        </>
      ) : null}
      {scenarioId === "state-meaning-cards" ? <StateCards lang={lang} /> : null}
      {scenarioId === "branch-death-ledger" ? <EventLedger lang={lang} /> : null}
      {scenarioId === "active-set-trace" ? <TraceTable trace={trace010} lang={lang} /> : null}
      {scenarioId === "simulator-main" ? <TraceTable trace={generateNfaTrace("1010")} lang={lang} /> : null}
      {scenarioId === "five-tuple-callout" ? (
        <>
          <TupleCallout />
          <TransitionTable lang={lang} />
        </>
      ) : null}
      {scenarioId === "epsilon-note" ? (
        <article className="nfa-card">
          <strong>{lang === "en" ? "Bounded note" : "边界说明"}</strong>
          <p>{lang === "en" ? "An epsilon transition consumes no input. This node's main machine has none, so delta stays Q x Sigma -> P(Q)." : "空转移（epsilon transition）不消耗输入。本节点的主体机器没有空转移，所以 delta 保持 Q x Sigma -> P(Q)。"}</p>
        </article>
      ) : null}
      {scenarioId === "implementation-map" ? <ImplementationMap lang={lang} /> : null}
      {scenarioId === "prefix-invariant" ? (
        <>
          <StateChips states={step2.activeStates} lang={lang} />
          <p className="nfa-note">{lang === "en" ? "After prefix 01, S2 = {q0,q2}. Because q2 is active, this prefix would accept if the input ended here." : "读完前缀 01 后，S2 = {q0,q2}。因为 q2 活跃，若输入在这里结束就会接受。"}</p>
        </>
      ) : null}
      {scenarioId === "branching-cost" ? <CostSummary lang={lang} /> : null}
      {scenarioId === "common-confusions" ? <Confusions lang={lang} /> : null}
      {scenarioId === "prediction-prompts" ? <PredictionPrompts lang={lang} /> : null}

      <style>{`
        .nfa-figure {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-lg);
          box-shadow: var(--rcl-shadow-sm);
          display: grid;
          gap: 14px;
          margin: 24px 0;
          padding: 18px;
        }
        .nfa-figure figcaption {
          display: grid;
          gap: 4px;
          margin: 0;
        }
        .nfa-figure figcaption span,
        .nfa-note {
          color: var(--muted);
        }
        .nfa-card-grid,
        .nfa-compare-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        }
        .nfa-card {
          background: var(--surface-muted);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-md);
          display: grid;
          gap: 6px;
          padding: 12px;
        }
        .nfa-card span,
        .nfa-reveal summary {
          font-weight: 800;
        }
        .nfa-card.accept,
        .accept-row {
          background: #dcfce7;
        }
        .nfa-card.reject,
        .dead-row {
          background: #ffedd5;
        }
        .nfa-card mark {
          background: #fed7aa;
          border-radius: 5px;
          padding: 0 3px;
        }
        .nfa-badge {
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: 999px;
          color: #1d4ed8;
          padding: 4px 10px;
          width: fit-content;
        }
        .nfa-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .nfa-chip {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 8px;
          display: grid;
          min-width: 96px;
          padding: 8px;
        }
        .nfa-chip.active {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .nfa-chip.accept {
          box-shadow: inset 0 0 0 2px #22c55e;
        }
        .nfa-chip.spawned {
          outline: 3px solid #f97316;
        }
        .nfa-chip.died {
          background: #ffedd5;
          border-color: #fb923c;
        }
        .nfa-chip small {
          color: var(--muted);
        }
        .nfa-chip em {
          color: #334155;
          font-size: 0.78rem;
          font-style: normal;
          font-weight: 800;
        }
        .nfa-state-svg {
          display: block;
          height: auto;
          width: 100%;
        }
        .nfa-edge line,
        .nfa-edge path,
        .nfa-start-edge {
          fill: none;
          stroke: var(--line);
          stroke-width: 3;
        }
        .nfa-edge.focus line,
        .nfa-edge.focus path {
          stroke: #ea580c;
          stroke-width: 4;
        }
        .nfa-edge text {
          fill: var(--text);
          font-size: 13px;
          font-weight: 850;
        }
        .nfa-state-svg marker path {
          fill: var(--line);
        }
        .nfa-state-svg circle {
          fill: var(--surface-muted);
          stroke: var(--line);
          stroke-width: 2;
        }
        .nfa-state-svg .active circle {
          fill: #fed7aa;
          stroke: #ea580c;
          stroke-width: 4;
        }
        .nfa-state-svg .accepting circle {
          stroke: #15803d;
        }
        .nfa-state-svg text {
          fill: var(--text);
          font-size: 12px;
          font-weight: 850;
        }
        .nfa-state-svg .state-meaning {
          fill: var(--muted);
          font-size: 9px;
        }
        .nfa-table-scroll {
          overflow-x: auto;
        }
        .nfa-mini-table {
          border-collapse: collapse;
          font-size: 0.92rem;
          min-width: 650px;
          width: 100%;
        }
        .nfa-mini-table caption {
          color: var(--muted);
          font-weight: 800;
          margin-bottom: 8px;
          text-align: left;
        }
        .nfa-mini-table th,
        .nfa-mini-table td {
          border: 1px solid var(--line);
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        .nfa-mini-table th {
          background: var(--surface-muted);
        }
        .nfa-code {
          background: #0f172a;
          border-radius: var(--rcl-radius-md);
          color: #e5e7eb;
          margin: 0;
          overflow-x: auto;
          padding: 14px;
        }
        .nfa-reveal summary {
          cursor: pointer;
        }
        .nfa-reveal summary:focus-visible {
          border-radius: 6px;
          outline: 3px solid #f97316;
          outline-offset: 2px;
        }
        @media (max-width: 680px) {
          .nfa-figure {
            padding: 14px;
          }
          .nfa-chip {
            min-width: 78px;
          }
        }
      `}</style>
    </figure>
  );
}
