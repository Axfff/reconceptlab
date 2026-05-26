import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  acceptingStates,
  dfaStates,
  dfaSymbols,
  finalStatusText,
  generateDfaTrace,
  sampleInputs,
  stateLabels,
  stateMeanings,
  transitionTable,
  type DfaState
} from "./dfaTrace";

const autoIntervalMs = 900;

const labels = {
  en: {
    title: "DFA simulator",
    sample: "Sample input",
    custom: "Custom input",
    previous: "Previous symbol",
    next: "Next symbol",
    reset: "Reset trace",
    play: "Play trace",
    pause: "Pause trace",
    status: "Current status",
    consumed: "Consumed prefix",
    remaining: "Remaining input",
    currentState: "Current state",
    nextSymbol: "Next symbol",
    pending: "Pending: acceptance is checked after all input is consumed.",
    acceptingNow: "In an accepting state now, but input still remains.",
    empty: "empty"
  },
  zh: {
    title: "DFA 模拟器",
    sample: "示例输入",
    custom: "自定义输入",
    previous: "上一个符号",
    next: "下一个符号",
    reset: "重置轨迹",
    play: "播放轨迹",
    pause: "暂停轨迹",
    status: "当前状态",
    consumed: "已读前缀",
    remaining: "剩余输入",
    currentState: "当前状态",
    nextSymbol: "下一个符号",
    pending: "未定：必须读完整个输入后才判断接受。",
    acceptingNow: "当前处于接受状态，但输入还没有结束。",
    empty: "空"
  }
} as const;

const positions: Record<DfaState, { x: number; y: number }> = {
  "need-local": { x: 62, y: 70 },
  "in-local": { x: 170, y: 70 },
  "need-domain": { x: 292, y: 70 },
  "in-domain": { x: 420, y: 70 },
  "need-suffix": { x: 542, y: 70 },
  "in-suffix": { x: 662, y: 70 },
  dead: { x: 360, y: 178 }
};

function statusText(state: DfaState, isFinal: boolean, accepted: boolean, lang: Locale) {
  if (!isFinal && acceptingStates.includes(state)) return labels[lang].acceptingNow;
  if (!isFinal) return labels[lang].pending;
  return finalStatusText({ input: "", steps: [], finalState: state, accepted }, lang);
}

function SimulatorDiagram({ state, lang }: { state: DfaState; lang: Locale }) {
  const edges: Array<[DfaState, DfaState, string]> = [
    ["need-local", "in-local", "char"],
    ["in-local", "need-domain", "@"],
    ["need-domain", "in-domain", "char"],
    ["in-domain", "need-suffix", "dot"],
    ["need-suffix", "in-suffix", "char"],
    ["in-suffix", "in-suffix", "char"],
    ["in-local", "dead", "dot/other"],
    ["need-domain", "dead", "@/dot/other"],
    ["dead", "dead", "*"]
  ];

  return (
    <svg className="dfa-sim-svg" viewBox="0 0 730 235" role="img" aria-label={lang === "en" ? "Current DFA state diagram" : "当前 DFA 状态图"}>
      <defs>
        <marker id="dfa-sim-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {edges.map(([from, to, text]) => {
        const start = positions[from];
        const end = positions[to];
        const self = from === to;
        return (
          <g key={`${from}-${to}-${text}`} className="dfa-sim-edge">
            {self ? (
              <path d={`M ${start.x - 10} ${start.y - 30} C ${start.x - 52} ${start.y - 78}, ${start.x + 52} ${start.y - 78}, ${start.x + 10} ${start.y - 30}`} markerEnd="url(#dfa-sim-arrow)" />
            ) : (
              <line x1={start.x + 34} y1={start.y} x2={end.x - 34} y2={end.y} markerEnd="url(#dfa-sim-arrow)" />
            )}
            <text x={(start.x + end.x) / 2} y={self ? start.y - 65 : (start.y + end.y) / 2 - 7}>{text}</text>
          </g>
        );
      })}
      {dfaStates.map((id) => (
        <g key={id} transform={`translate(${positions[id].x}, ${positions[id].y})`} className={`${id === state ? "active" : ""} ${acceptingStates.includes(id) ? "accepting" : ""} ${id === "dead" ? "dead" : ""}`}>
          <circle r={acceptingStates.includes(id) ? 37 : 32} />
          {acceptingStates.includes(id) ? <circle r="27" /> : null}
          <text textAnchor="middle" y="-2">{id}</text>
          <text textAnchor="middle" y="13" className="tiny">{stateLabels[id][lang]}</text>
        </g>
      ))}
    </svg>
  );
}

export default function DfaSimulator({ lang }: { lang: Locale }) {
  const t = labels[lang];
  const [input, setInput] = useState<string>("ana@cs.ai");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const trace = useMemo(() => generateDfaTrace(input), [input]);
  const step = trace.steps[Math.min(stepIndex, trace.steps.length - 1)];
  const isFinal = step.index === trace.steps.length - 1;
  const currentStatus = statusText(step.state, isFinal, isFinal && trace.accepted, lang);
  const nextChar = Array.from(step.remaining)[0];

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [input]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStepIndex((value) => {
        if (value >= trace.steps.length - 1) return value;
        return value + 1;
      });
    }, autoIntervalMs);
    return () => window.clearInterval(timer);
  }, [playing, trace.steps.length]);

  useEffect(() => {
    if (stepIndex >= trace.steps.length - 1) setPlaying(false);
  }, [stepIndex, trace.steps.length]);

  return (
    <section className="dfa-simulator" aria-label={t.title}>
      <div className="dfa-sim-top">
        <label>
          <span>{t.sample}</span>
          <select
            value={sampleInputs.includes(input as (typeof sampleInputs)[number]) ? input : "custom"}
            onChange={(event) => {
              if (event.target.value !== "custom") setInput(event.target.value);
            }}
          >
            {sampleInputs.map((sample) => <option key={sample} value={sample}>{sample}</option>)}
            <option value="custom">{lang === "en" ? "custom" : "自定义"}</option>
          </select>
        </label>
        <label>
          <span>{t.custom}</span>
          <input value={input} onChange={(event) => setInput(event.target.value)} aria-label={t.custom} />
        </label>
      </div>

      <div className="dfa-sim-grid">
        <article className="dfa-panel">
          <strong>{t.status}</strong>
          <p aria-live="polite">{currentStatus}</p>
          <dl>
            <div>
              <dt>{t.currentState}</dt>
              <dd>{step.state} ({stateLabels[step.state][lang]})</dd>
            </div>
            <div>
              <dt>{t.consumed}</dt>
              <dd>{step.prefix || "ε"}</dd>
            </div>
            <div>
              <dt>{t.remaining}</dt>
              <dd>{step.remaining || "ε"}</dd>
            </div>
            <div>
              <dt>{t.nextSymbol}</dt>
              <dd>{nextChar ? `${nextChar} -> ${trace.steps[step.index + 1]?.symbol}` : "-"}</dd>
            </div>
          </dl>
          <p>{step.explanation[lang]}</p>
        </article>
        <div className="dfa-panel">
          <SimulatorDiagram state={step.state} lang={lang} />
        </div>
      </div>

      <div className="dfa-controls">
        <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0} aria-label={t.previous}>
          {t.previous}
        </button>
        <button type="button" onClick={() => setStepIndex((value) => Math.min(trace.steps.length - 1, value + 1))} disabled={stepIndex >= trace.steps.length - 1} aria-label={t.next}>
          {t.next}
        </button>
        <button type="button" onClick={() => setStepIndex(0)} aria-label={t.reset}>
          {t.reset}
        </button>
        <button type="button" onClick={() => setPlaying((value) => !value)} disabled={stepIndex >= trace.steps.length - 1} aria-pressed={playing} aria-label={playing ? t.pause : t.play}>
          {playing ? t.pause : t.play}
        </button>
      </div>

      <div className="dfa-tape" aria-label={lang === "en" ? "Input tape" : "输入纸带"}>
        {Array.from(input).length === 0 ? <span className="dfa-empty">{t.empty}</span> : null}
        {Array.from(input).map((char, index) => {
          const item = trace.steps[index + 1];
          const active = index + 1 === step.index;
          const consumed = index + 1 <= step.index;
          return (
            <span key={`${char}-${index}`} className={`dfa-token ${active ? "active" : ""} ${consumed ? "consumed" : ""} ${item.state === "dead" ? "dead" : ""}`}>
              <strong>{char}</strong>
              <small>{item.symbol}</small>
              <em>{consumed ? item.state : "-"}</em>
            </span>
          );
        })}
      </div>

      <div className="dfa-table-scroll">
        <table className="dfa-mini-table">
          <caption>{lang === "en" ? "Trace ledger" : "轨迹账本"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "Current" : "当前"}</th>
              <th>{lang === "en" ? "Prefix" : "前缀"}</th>
              <th>{lang === "en" ? "Read" : "读取"}</th>
              <th>{lang === "en" ? "Symbol" : "符号"}</th>
              <th>{lang === "en" ? "State" : "状态"}</th>
              <th>{lang === "en" ? "Status" : "状态说明"}</th>
            </tr>
          </thead>
          <tbody>
            {trace.steps.map((row) => (
              <tr key={row.index} className={`${row.index === step.index ? "active-row" : ""} ${row.state === "dead" ? "dead-row" : ""} ${row.acceptedNow ? "accept-row" : ""}`}>
                <th scope="row">{row.index === step.index ? (lang === "en" ? "now" : "当前") : ""}</th>
                <td>{row.prefix || "ε"}</td>
                <td>{row.input ?? "-"}</td>
                <td>{row.symbol ?? "-"}</td>
                <td>{row.state}</td>
                <td>{stateMeanings[row.state][lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dfa-table-scroll">
        <table className="dfa-mini-table">
          <caption>{lang === "en" ? "Transition table used by the simulator" : "模拟器使用的转移表"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "State" : "状态"}</th>
              {dfaSymbols.map((symbol) => <th key={symbol}>{symbol}</th>)}
            </tr>
          </thead>
          <tbody>
            {dfaStates.map((state) => (
              <tr key={state} className={state === step.state ? "active-row" : state === "dead" ? "dead-row" : acceptingStates.includes(state) ? "accept-row" : ""}>
                <th scope="row">{state}</th>
                {dfaSymbols.map((symbol) => <td key={symbol}>{transitionTable[state][symbol]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .dfa-simulator {
          background:
            linear-gradient(color-mix(in srgb, var(--rcl-surface-lab) 86%, transparent), color-mix(in srgb, var(--surface) 94%, transparent)),
            linear-gradient(var(--rcl-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--rcl-grid) 1px, transparent 1px);
          background-size: auto, 28px 28px, 28px 28px;
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-lg);
          box-shadow: var(--rcl-shadow-sm);
          display: grid;
          gap: 14px;
          margin: 24px 0;
          padding: 18px;
        }
        .dfa-sim-top,
        .dfa-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .dfa-sim-top label {
          display: grid;
          gap: 4px;
          min-width: min(100%, 230px);
        }
        .dfa-sim-top span {
          color: var(--muted);
          font-size: 0.9rem;
          font-weight: 800;
        }
        .dfa-sim-top input,
        .dfa-sim-top select {
          border: 1px solid var(--line);
          border-radius: 8px;
          font: inherit;
          padding: 8px 10px;
        }
        .dfa-controls button {
          background: var(--rcl-primary);
          border: 1px solid var(--rcl-primary);
          border-radius: 8px;
          color: var(--rcl-text-inverse);
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 8px 12px;
        }
        .dfa-controls button:disabled {
          background: var(--surface-muted);
          border-color: var(--line);
          color: var(--muted);
          cursor: not-allowed;
        }
        .dfa-controls button:focus-visible,
        .dfa-sim-top input:focus-visible,
        .dfa-sim-top select:focus-visible {
          outline: 3px solid #f97316;
          outline-offset: 2px;
        }
        .dfa-sim-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: minmax(240px, 0.85fr) minmax(320px, 1.4fr);
        }
        .dfa-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-md);
          padding: 12px;
        }
        .dfa-panel dl {
          display: grid;
          gap: 8px;
          margin: 10px 0;
        }
        .dfa-panel dl div {
          display: grid;
          gap: 2px;
        }
        .dfa-panel dt {
          color: var(--muted);
          font-weight: 800;
        }
        .dfa-panel dd {
          margin: 0;
        }
        .dfa-sim-svg {
          display: block;
          height: auto;
          width: 100%;
        }
        .dfa-sim-edge line,
        .dfa-sim-edge path {
          fill: none;
          stroke: var(--line);
          stroke-width: 3;
        }
        .dfa-sim-edge text {
          fill: var(--text);
          font-size: 12px;
          font-weight: 800;
        }
        .dfa-sim-svg marker path {
          fill: var(--line);
        }
        .dfa-sim-svg circle {
          fill: var(--surface-muted);
          stroke: var(--line);
          stroke-width: 2;
        }
        .dfa-sim-svg .active circle {
          fill: #fed7aa;
          stroke: #ea580c;
          stroke-width: 4;
        }
        .dfa-sim-svg .accepting circle {
          stroke: #15803d;
        }
        .dfa-sim-svg .dead circle {
          fill: #ffedd5;
          stroke: #c2410c;
        }
        .dfa-sim-svg text {
          fill: var(--text);
          font-size: 11px;
          font-weight: 850;
        }
        .dfa-sim-svg .tiny {
          fill: var(--muted);
          font-size: 8.5px;
        }
        .dfa-tape {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dfa-token,
        .dfa-empty {
          align-items: center;
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: 8px;
          display: grid;
          min-width: 78px;
          padding: 8px;
          text-align: center;
        }
        .dfa-token.consumed {
          background: #dbeafe;
        }
        .dfa-token.active {
          outline: 3px solid #f97316;
        }
        .dfa-token.dead {
          background: #ffedd5;
          border-color: #fb923c;
        }
        .dfa-token small,
        .dfa-token em {
          color: var(--muted);
          font-style: normal;
        }
        .dfa-table-scroll {
          overflow-x: auto;
        }
        .dfa-mini-table {
          border-collapse: collapse;
          font-size: 0.92rem;
          min-width: 680px;
          width: 100%;
        }
        .dfa-mini-table caption {
          color: var(--muted);
          font-weight: 800;
          margin-bottom: 8px;
          text-align: left;
        }
        .dfa-mini-table th,
        .dfa-mini-table td {
          border: 1px solid var(--line);
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        .dfa-mini-table th {
          background: var(--surface-muted);
        }
        .active-row {
          outline: 3px solid #f97316;
          outline-offset: -3px;
        }
        .accept-row {
          background: #dcfce7;
        }
        .dead-row {
          background: #ffedd5;
        }
        @media (max-width: 760px) {
          .dfa-simulator {
            padding: 14px;
          }
          .dfa-sim-grid {
            grid-template-columns: 1fr;
          }
          .dfa-token {
            min-width: 66px;
          }
        }
      `}</style>
    </section>
  );
}
