import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  acceptingStates,
  finalStatusText,
  formatStateSet,
  generateNfaTrace,
  nfaStates,
  sampleInputs,
  stateLabels,
  transitionTable,
  type NfaState
} from "./nfaTrace";

const autoIntervalMs = 900;

const labels = {
  en: {
    title: "NFA simulator",
    sample: "Sample input",
    custom: "Custom input",
    previous: "Previous symbol",
    next: "Next symbol",
    reset: "Reset trace",
    play: "Play trace",
    pause: "Pause trace",
    activeStates: "Active states",
    status: "Current status",
    consumed: "Consumed prefix",
    remaining: "Remaining input",
    nextSymbol: "Next symbol",
    view: "View",
    activeView: "Active set",
    pathView: "Branch events",
    transitionEvents: "Transition events",
    empty: "empty",
    prefixAccepts: "Would accept if input ended here.",
    prefixRejects: "Would reject if input ended here.",
    finalResult: "Whole-input result"
  },
  zh: {
    title: "NFA 模拟器",
    sample: "示例输入",
    custom: "自定义输入",
    previous: "上一个符号",
    next: "下一个符号",
    reset: "重置轨迹",
    play: "播放轨迹",
    pause: "暂停轨迹",
    activeStates: "活跃状态",
    status: "当前状态",
    consumed: "已读前缀",
    remaining: "剩余输入",
    nextSymbol: "下一个符号",
    view: "视图",
    activeView: "活跃集合",
    pathView: "分支事件",
    transitionEvents: "转移事件",
    empty: "空",
    prefixAccepts: "如果输入在这里结束，会接受。",
    prefixRejects: "如果输入在这里结束，会拒绝。",
    finalResult: "整个输入的结果"
  }
} as const;

const positions: Record<NfaState, { x: number; y: number }> = {
  q0: { x: 82, y: 78 },
  q1: { x: 290, y: 78 },
  q2: { x: 498, y: 78 }
};

function cleanInput(value: string) {
  return Array.from(value).filter((char) => char === "0" || char === "1").join("");
}

function SimulatorDiagram({ activeStates, lang }: { activeStates: NfaState[]; lang: Locale }) {
  const edges: Array<[NfaState, NfaState, string]> = [
    ["q0", "q0", "0,1"],
    ["q0", "q1", "0"],
    ["q1", "q2", "1"],
    ["q2", "q2", "0,1"]
  ];

  return (
    <svg className="nfa-sim-svg" viewBox="0 0 585 165" role="img" aria-label={lang === "en" ? "Current NFA active states" : "当前 NFA 活跃状态"}>
      <defs>
        <marker id="nfa-sim-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      <line className="nfa-sim-start" x1="18" y1="78" x2="45" y2="78" markerEnd="url(#nfa-sim-arrow)" />
      {edges.map(([from, to, label]) => {
        const a = positions[from];
        const b = positions[to];
        const self = from === to;
        return (
          <g key={`${from}-${to}-${label}`} className="nfa-sim-edge">
            {self ? (
              <path d={`M ${a.x - 15} ${a.y - 30} C ${a.x - 58} ${a.y - 78}, ${a.x + 58} ${a.y - 78}, ${a.x + 15} ${a.y - 30}`} markerEnd="url(#nfa-sim-arrow)" />
            ) : (
              <line x1={a.x + 36} y1={a.y} x2={b.x - 36} y2={b.y} markerEnd="url(#nfa-sim-arrow)" />
            )}
            <text x={(a.x + b.x) / 2} y={self ? a.y - 66 : a.y - 10}>{label}</text>
          </g>
        );
      })}
      {nfaStates.map((state) => (
        <g key={state} transform={`translate(${positions[state].x}, ${positions[state].y})`} className={`${activeStates.includes(state) ? "active" : ""} ${acceptingStates.includes(state) ? "accepting" : ""}`}>
          <circle r={acceptingStates.includes(state) ? 38 : 32} />
          {acceptingStates.includes(state) ? <circle r="27" /> : null}
          <text textAnchor="middle" y="-2">{state}</text>
          <text textAnchor="middle" y="13" className="tiny">{stateLabels[state][lang]}</text>
        </g>
      ))}
    </svg>
  );
}

export default function NfaSimulator({ lang }: { lang: Locale }) {
  const t = labels[lang];
  const [input, setInput] = useState<string>("010");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<"active" | "path">("active");

  const trace = useMemo(() => generateNfaTrace(input), [input]);
  const step = trace.steps[Math.min(stepIndex, trace.steps.length - 1)];
  const isFinal = step.index === trace.steps.length - 1;
  const nextChar = Array.from(step.remaining)[0];

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [input]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStepIndex((value) => Math.min(trace.steps.length - 1, value + 1));
    }, autoIntervalMs);
    return () => window.clearInterval(timer);
  }, [playing, trace.steps.length]);

  useEffect(() => {
    if (stepIndex >= trace.steps.length - 1) setPlaying(false);
  }, [stepIndex, trace.steps.length]);

  return (
    <section className="nfa-simulator" aria-label={t.title}>
      <div className="nfa-sim-top">
        <label>
          <span>{t.sample}</span>
          <select
            value={sampleInputs.includes(input as (typeof sampleInputs)[number]) ? input : "custom"}
            onChange={(event) => {
              if (event.target.value !== "custom") setInput(event.target.value);
            }}
          >
            {sampleInputs.map((sample) => <option key={sample || "empty"} value={sample}>{sample || "ε"}</option>)}
            <option value="custom">{lang === "en" ? "custom" : "自定义"}</option>
          </select>
        </label>
        <label>
          <span>{t.custom}</span>
          <input value={input} onChange={(event) => setInput(cleanInput(event.target.value))} inputMode="numeric" aria-label={t.custom} />
        </label>
        <fieldset className="nfa-view-toggle">
          <legend>{t.view}</legend>
          <button type="button" className={view === "active" ? "selected" : ""} onClick={() => setView("active")} aria-pressed={view === "active"}>
            {t.activeView}
          </button>
          <button type="button" className={view === "path" ? "selected" : ""} onClick={() => setView("path")} aria-pressed={view === "path"}>
            {t.pathView}
          </button>
        </fieldset>
      </div>

      <div className="nfa-sim-grid">
        <article className="nfa-panel">
          <strong>{t.status}</strong>
          <p aria-live="polite">{step.acceptedIfInputEndedHere ? t.prefixAccepts : t.prefixRejects}</p>
          <dl>
            <div>
              <dt>{t.activeStates}</dt>
              <dd>{formatStateSet(step.activeStates)}</dd>
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
              <dd>{nextChar ?? "-"}</dd>
            </div>
          </dl>
          <p>{step.explanation[lang]}</p>
          {isFinal ? <p className={trace.accepted ? "nfa-accepted" : "nfa-rejected"}><strong>{t.finalResult}:</strong> {finalStatusText(trace, lang)}</p> : null}
        </article>
        <div className="nfa-panel">
          <SimulatorDiagram activeStates={step.activeStates} lang={lang} />
        </div>
      </div>

      <div className="nfa-controls">
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

      <div className="nfa-tape" aria-label={lang === "en" ? "Input tape" : "输入纸带"}>
        {Array.from(input).length === 0 ? <span className="nfa-empty">{t.empty}</span> : null}
        {Array.from(input).map((char, index) => {
          const row = trace.steps[index + 1];
          const active = index + 1 === step.index;
          const consumed = index + 1 <= step.index;
          return (
            <span key={`${char}-${index}`} className={`nfa-token ${active ? "active" : ""} ${consumed ? "consumed" : ""} ${row.acceptedIfInputEndedHere ? "accept" : ""}`}>
              <strong>{char}</strong>
              <small>{consumed ? formatStateSet(row.activeStates) : "-"}</small>
            </span>
          );
        })}
      </div>

      {view === "active" ? (
        <div className="nfa-table-scroll">
          <table className="nfa-mini-table">
            <caption>{lang === "en" ? "Active-set ledger" : "活跃集合账本"}</caption>
            <thead>
              <tr>
                <th>{lang === "en" ? "Now" : "当前"}</th>
                <th>{lang === "en" ? "Prefix" : "前缀"}</th>
                <th>{lang === "en" ? "Read" : "读取"}</th>
                <th>{lang === "en" ? "Active states" : "活跃状态"}</th>
                <th>{lang === "en" ? "Would accept if input ended here?" : "若在此结束会接受吗？"}</th>
              </tr>
            </thead>
            <tbody>
              {trace.steps.map((row) => (
                <tr key={row.index} className={`${row.index === step.index ? "active-row" : ""} ${row.acceptedIfInputEndedHere ? "accept-row" : ""}`}>
                  <th scope="row">{row.index === step.index ? (lang === "en" ? "now" : "当前") : ""}</th>
                  <td>{row.prefix || "ε"}</td>
                  <td>{row.input ?? "-"}</td>
                  <td>{formatStateSet(row.activeStates)}</td>
                  <td>{row.acceptedIfInputEndedHere ? (lang === "en" ? "yes" : "是") : (lang === "en" ? "no" : "否")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="nfa-table-scroll">
          <table className="nfa-mini-table">
            <caption>{t.transitionEvents}</caption>
            <thead>
              <tr>
                <th>{lang === "en" ? "Step" : "步骤"}</th>
                <th>{lang === "en" ? "Old branch" : "旧分支"}</th>
                <th>{lang === "en" ? "Transition" : "转移"}</th>
                <th>{lang === "en" ? "Meaning" : "含义"}</th>
              </tr>
            </thead>
            <tbody>
              {trace.steps.flatMap((row) =>
                row.transitionEvents.length === 0
                  ? [
                      <tr key="start" className={row.index === step.index ? "active-row" : ""}>
                        <th scope="row">0</th>
                        <td>-</td>
                        <td>{formatStateSet(row.activeStates)}</td>
                        <td>{row.explanation[lang]}</td>
                      </tr>
                    ]
                  : row.transitionEvents.map((event) => (
                      <tr key={`${row.index}-${event.from}`} className={`${row.index === step.index ? "active-row" : ""} ${event.died ? "dead-row" : ""}`}>
                        <th scope="row">{row.index}</th>
                        <td>{event.from}</td>
                        <td>{event.from} --{event.symbol}--&gt; {formatStateSet(event.to)}</td>
                        <td>{event.explanation[lang]}</td>
                      </tr>
                    ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="nfa-table-scroll">
        <table className="nfa-mini-table">
          <caption>{lang === "en" ? "Transition table used by the simulator" : "模拟器使用的转移表"}</caption>
          <thead>
            <tr>
              <th>{lang === "en" ? "State" : "状态"}</th>
              <th>0</th>
              <th>1</th>
            </tr>
          </thead>
          <tbody>
            {nfaStates.map((state) => (
              <tr key={state} className={`${step.activeStates.includes(state) ? "active-row" : ""} ${acceptingStates.includes(state) ? "accept-row" : ""}`}>
                <th scope="row">{state}</th>
                <td>{formatStateSet(transitionTable[state]["0"])}</td>
                <td>{formatStateSet(transitionTable[state]["1"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .nfa-simulator {
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
        .nfa-sim-top,
        .nfa-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .nfa-sim-top label {
          display: grid;
          gap: 4px;
          min-width: min(100%, 220px);
        }
        .nfa-sim-top span,
        .nfa-view-toggle legend {
          color: var(--muted);
          font-size: 0.9rem;
          font-weight: 800;
        }
        .nfa-sim-top input,
        .nfa-sim-top select {
          border: 1px solid var(--line);
          border-radius: 8px;
          font: inherit;
          padding: 8px 10px;
        }
        .nfa-view-toggle {
          align-items: end;
          border: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0;
          padding: 0;
        }
        .nfa-controls button,
        .nfa-view-toggle button {
          background: var(--rcl-primary);
          border: 1px solid var(--rcl-primary);
          border-radius: 8px;
          color: var(--rcl-text-inverse);
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 8px 12px;
        }
        .nfa-view-toggle button {
          background: var(--surface);
          color: var(--text);
        }
        .nfa-view-toggle button.selected {
          background: #fed7aa;
          border-color: #ea580c;
        }
        .nfa-controls button:disabled {
          background: var(--surface-muted);
          border-color: var(--line);
          color: var(--muted);
          cursor: not-allowed;
        }
        .nfa-controls button:focus-visible,
        .nfa-view-toggle button:focus-visible,
        .nfa-sim-top input:focus-visible,
        .nfa-sim-top select:focus-visible {
          outline: 3px solid #f97316;
          outline-offset: 2px;
        }
        .nfa-sim-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: minmax(240px, 0.8fr) minmax(320px, 1.3fr);
        }
        .nfa-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-md);
          padding: 12px;
        }
        .nfa-panel dl {
          display: grid;
          gap: 8px;
          margin: 10px 0;
        }
        .nfa-panel dl div {
          display: grid;
          gap: 2px;
        }
        .nfa-panel dt {
          color: var(--muted);
          font-weight: 800;
        }
        .nfa-panel dd {
          margin: 0;
        }
        .nfa-accepted {
          color: #15803d;
        }
        .nfa-rejected {
          color: #c2410c;
        }
        .nfa-sim-svg {
          display: block;
          height: auto;
          width: 100%;
        }
        .nfa-sim-edge line,
        .nfa-sim-edge path,
        .nfa-sim-start {
          fill: none;
          stroke: var(--line);
          stroke-width: 3;
        }
        .nfa-sim-edge text {
          fill: var(--text);
          font-size: 12px;
          font-weight: 850;
        }
        .nfa-sim-svg marker path {
          fill: var(--line);
        }
        .nfa-sim-svg circle {
          fill: var(--surface-muted);
          stroke: var(--line);
          stroke-width: 2;
        }
        .nfa-sim-svg .active circle {
          fill: #fed7aa;
          stroke: #ea580c;
          stroke-width: 4;
        }
        .nfa-sim-svg .accepting circle {
          stroke: #15803d;
        }
        .nfa-sim-svg text {
          fill: var(--text);
          font-size: 12px;
          font-weight: 850;
        }
        .nfa-sim-svg .tiny {
          fill: var(--muted);
          font-size: 9px;
        }
        .nfa-tape {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .nfa-token,
        .nfa-empty {
          align-items: center;
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: 8px;
          display: grid;
          min-width: 88px;
          padding: 8px;
          text-align: center;
        }
        .nfa-token.consumed {
          background: #dbeafe;
        }
        .nfa-token.active {
          outline: 3px solid #f97316;
        }
        .nfa-token.accept {
          box-shadow: inset 0 0 0 2px #22c55e;
        }
        .nfa-token small {
          color: var(--muted);
        }
        .nfa-table-scroll {
          overflow-x: auto;
        }
        .nfa-mini-table {
          border-collapse: collapse;
          font-size: 0.92rem;
          min-width: 680px;
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
          .nfa-simulator {
            padding: 14px;
          }
          .nfa-sim-grid {
            grid-template-columns: 1fr;
          }
          .nfa-token {
            min-width: 70px;
          }
        }
      `}</style>
    </section>
  );
}
