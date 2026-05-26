import type { Locale } from "../../i18n/locales";
import {
  acceptingStates,
  dfaFixture,
  dfaStates,
  dfaSymbols,
  generateDfaTrace,
  scenarioMeta,
  stateLabels,
  stateMeanings,
  transitionTable,
  type DfaScenarioId,
  type DfaState,
  type DfaTrace
} from "./dfaTrace";

const statePositions: Record<DfaState, { x: number; y: number }> = {
  "need-local": { x: 56, y: 100 },
  "in-local": { x: 168, y: 100 },
  "need-domain": { x: 294, y: 100 },
  "in-domain": { x: 424, y: 100 },
  "need-suffix": { x: 548, y: 100 },
  "in-suffix": { x: 672, y: 100 },
  dead: { x: 370, y: 208 }
};

function TraceTape({ trace, lang, focusIndex }: { trace: DfaTrace; lang: Locale; focusIndex?: number }) {
  const chars = Array.from(trace.input);

  return (
    <div className="dfa-tape" aria-label={lang === "en" ? `Trace for ${trace.input || "empty string"}` : `${trace.input || "空串"} 的轨迹`}>
      {chars.length === 0 ? <span className="dfa-empty">{lang === "en" ? "empty input" : "空输入"}</span> : null}
      {chars.map((char, index) => {
        const step = trace.steps[index + 1];
        return (
          <span key={`${char}-${index}`} className={`dfa-token ${focusIndex === index + 1 ? "active" : ""} ${step.state === "dead" ? "dead" : ""}`}>
            <strong>{char}</strong>
            <small>{step.symbol}</small>
            <em>{step.state}</em>
          </span>
        );
      })}
    </div>
  );
}

function TraceTable({ trace, lang, compact = false }: { trace: DfaTrace; lang: Locale; compact?: boolean }) {
  const rows = compact ? trace.steps.filter((step) => step.index === 0 || step.input || step.state === "dead") : trace.steps;
  return (
    <div className="dfa-table-scroll">
      <table className="dfa-mini-table">
        <caption>{lang === "en" ? "Deterministic trace" : "确定性轨迹"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Prefix" : "前缀"}</th>
            <th>{lang === "en" ? "Read" : "读取"}</th>
            <th>{lang === "en" ? "Symbol" : "符号"}</th>
            <th>{lang === "en" ? "State" : "状态"}</th>
            <th>{lang === "en" ? "Meaning" : "含义"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((step) => (
            <tr key={`${trace.input}-${step.index}`} className={step.state === "dead" ? "dead-row" : step.acceptedNow ? "accept-row" : ""}>
              <th scope="row">{step.prefix || "ε"}</th>
              <td>{step.input ?? "-"}</td>
              <td>{step.symbol ?? "-"}</td>
              <td>{step.state}</td>
              <td>{stateMeanings[step.state][lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StateDiagram({ lang, activeState, deadOnly = false }: { lang: Locale; activeState?: DfaState; deadOnly?: boolean }) {
  const edges: Array<[DfaState, DfaState, string]> = deadOnly
    ? [["dead", "dead", "char, @, dot, other"]]
    : [
        ["need-local", "in-local", "char"],
        ["in-local", "need-domain", "@"],
        ["need-domain", "in-domain", "char"],
        ["in-domain", "need-suffix", "dot"],
        ["need-suffix", "in-suffix", "char"],
        ["in-suffix", "in-suffix", "char"],
        ["in-local", "dead", "dot/other"],
        ["need-domain", "dead", "@/dot/other"]
      ];

  return (
    <svg className="dfa-state-svg" viewBox="0 0 730 265" role="img" aria-label={lang === "en" ? "DFA state diagram for the toy email language" : "玩具邮件语言的 DFA 状态图"}>
      <defs>
        <marker id="dfa-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {edges.map(([from, to, label]) => {
        const a = statePositions[from];
        const b = statePositions[to];
        const self = from === to;
        return (
          <g key={`${from}-${to}-${label}`} className="dfa-edge">
            {self ? (
              <path d={`M ${a.x - 12} ${a.y - 34} C ${a.x - 54} ${a.y - 86}, ${a.x + 54} ${a.y - 86}, ${a.x + 12} ${a.y - 34}`} markerEnd="url(#dfa-arrow)" />
            ) : (
              <line x1={a.x + 35} y1={a.y} x2={b.x - 35} y2={b.y} markerEnd="url(#dfa-arrow)" />
            )}
            <text x={(a.x + b.x) / 2} y={self ? a.y - 72 : (a.y + b.y) / 2 - 10}>{label}</text>
          </g>
        );
      })}
      {dfaStates.map((state) => {
        const pos = statePositions[state];
        const active = state === activeState;
        const accepting = acceptingStates.includes(state);
        return (
          <g key={state} transform={`translate(${pos.x}, ${pos.y})`} className={`${active ? "active" : ""} ${accepting ? "accepting" : ""} ${state === "dead" ? "dead" : ""}`}>
            <circle r={accepting ? 39 : 34} />
            {accepting ? <circle r="30" /> : null}
            <text textAnchor="middle" y="-3">{state}</text>
            <text className="state-meaning" textAnchor="middle" y="14">{stateLabels[state][lang]}</text>
            <title>{`${state}: ${stateMeanings[state][lang]}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function HookCards({ lang }: { lang: Locale }) {
  const cases = [
    { input: "ana@cs.ai", trace: dfaFixture.traces.success, result: "accept" },
    { input: "ana@.ai", trace: dfaFixture.traces.missingDomainBeforeDot, result: "reject" }
  ];
  return (
    <div className="dfa-card-grid">
      {cases.map((example) => (
        <article key={example.input} className={`dfa-card ${example.result}`}>
          <strong>{example.input}</strong>
          <p>{example.result === "accept" ? (lang === "en" ? "Accepted toy pattern" : "被玩具模式接受") : (lang === "en" ? "Rejected: dot too early" : "拒绝：点出现太早")}</p>
          <TraceTape trace={example.trace} lang={lang} />
        </article>
      ))}
    </div>
  );
}

function FlagGrid({ lang }: { lang: Locale }) {
  const rows = [
    {
      flags: "hasLocal && !seenAt",
      state: "in-local",
      meaning: { en: "local part exists; @ is now allowed", zh: "已有本地部分；现在允许 @" }
    },
    {
      flags: "hasLocal && seenAt && !hasDomain",
      state: "need-domain",
      meaning: { en: "the next useful symbol must be a domain char", zh: "下一个有效符号必须是域名字符" }
    },
    {
      flags: "hasLocal && seenAt && hasDomain && !seenDot",
      state: "in-domain",
      meaning: { en: "domain chars are flowing; one dot is now allowed", zh: "域名字符正在读取；现在允许一个点" }
    },
    {
      flags: "hasLocal && seenAt && hasDomain && seenDot && !hasSuffix",
      state: "need-suffix",
      meaning: { en: "the dot appeared; suffix must start", zh: "点已经出现；后缀必须开始" }
    },
    {
      flags: "hasLocal && seenAt && hasDomain && seenDot && hasSuffix",
      state: "in-suffix",
      meaning: { en: "accepting if the input ends now", zh: "若输入现在结束则接受" }
    }
  ] as const;

  return (
    <div className="dfa-table-scroll">
      <table className="dfa-mini-table">
        <caption>{lang === "en" ? "Useful flag combinations mapped to named states" : "有用标志位组合到命名状态的映射"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Boolean combination" : "布尔组合"}</th>
            <th>{lang === "en" ? "Named state" : "命名状态"}</th>
            <th>{lang === "en" ? "Meaning made explicit" : "显式含义"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.state}>
              <td><code>{row.flags}</code></td>
              <td>{row.state}</td>
              <td>{row.meaning[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StateCards({ lang }: { lang: Locale }) {
  return (
    <div className="dfa-state-cards">
      {dfaStates.map((state) => (
        <article key={state} className={`dfa-state-card ${state === "dead" ? "dead" : ""} ${acceptingStates.includes(state) ? "accept" : ""}`}>
          <strong>{state}</strong>
          <span>{stateLabels[state][lang]}</span>
          <p>{stateMeanings[state][lang]}</p>
        </article>
      ))}
    </div>
  );
}

function TransitionTable({ lang }: { lang: Locale }) {
  return (
    <div className="dfa-table-scroll">
      <table className="dfa-mini-table">
        <caption>{lang === "en" ? "Total transition table" : "完整转移表"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "State" : "状态"}</th>
            {dfaSymbols.map((symbol) => <th key={symbol}>{symbol}</th>)}
          </tr>
        </thead>
        <tbody>
          {dfaStates.map((state) => (
            <tr key={state} className={state === "dead" ? "dead-row" : acceptingStates.includes(state) ? "accept-row" : ""}>
              <th scope="row">{state}</th>
              {dfaSymbols.map((symbol) => <td key={symbol}>{transitionTable[state][symbol]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TupleCallout({ lang }: { lang: Locale }) {
  const rows = [
    ["Q", dfaStates.join(", ")],
    ["Σ", dfaSymbols.join(", ")],
    ["δ", lang === "en" ? "the table above" : "上面的转移表"],
    ["q0", "need-local"],
    ["F", "{ in-suffix }"]
  ];
  return (
    <div className="dfa-tuple-grid">
      {rows.map(([name, value]) => (
        <article key={name} className="dfa-card">
          <strong>{name}</strong>
          <p>{value}</p>
        </article>
      ))}
    </div>
  );
}

function ImplementationMap({ lang }: { lang: Locale }) {
  const rows = [
    ["1", lang === "en" ? "classify one input character" : "分类一个输入字符"],
    ["2", lang === "en" ? "look up transition[state][symbol]" : "查询 transition[state][symbol]"],
    ["3", lang === "en" ? "replace the current state" : "替换当前状态"],
    ["end", lang === "en" ? "accept only if final state is in F" : "仅当最终状态在 F 中才接受"]
  ];
  return (
    <div className="dfa-card-grid">
      {rows.map(([label, text]) => (
        <article key={label} className="dfa-card">
          <strong>{label}</strong>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function TransitionCost({ lang }: { lang: Locale }) {
  const rows = [
    {
      label: "n",
      title: { en: "input symbols", zh: "输入符号" },
      text: {
        en: "An input of length n is read left to right, one symbol at a time.",
        zh: "长度为 n 的输入从左到右读取，每次读取一个符号。"
      }
    },
    {
      label: "n",
      title: { en: "transitions", zh: "次转移" },
      text: {
        en: "Each symbol triggers exactly one transition lookup, so time is O(n).",
        zh: "每个符号触发恰好一次转移查询，所以时间是 O(n)。"
      }
    },
    {
      label: "7 * 4",
      title: { en: "table entries", zh: "个表格条目" },
      text: {
        en: "The finite table has |Q||Σ| cells: seven states times four symbol categories.",
        zh: "有限表格有 |Q||Σ| 个单元：七个状态乘四类符号。"
      }
    },
    {
      label: "1",
      title: { en: "current-state variable", zh: "个当前状态变量" },
      text: {
        en: "The runner stores only the current state beyond the input, so working memory is O(1).",
        zh: "运行时除了输入之外只保存当前状态，所以工作记忆是 O(1)。"
      }
    }
  ];

  return (
    <div className="dfa-cost-grid">
      <div className="dfa-cost-flow" aria-label={lang === "en" ? "n input symbols produce n transitions" : "n 个输入符号产生 n 次转移"}>
        <span>{lang === "en" ? "input length" : "输入长度"}</span>
        <strong>n</strong>
        <span aria-hidden="true">→</span>
        <span>{lang === "en" ? "transition lookups" : "转移查询"}</span>
        <strong>n</strong>
        <span className="dfa-badge">O(n)</span>
      </div>
      {rows.map((row) => (
        <article key={row.title.en} className="dfa-card dfa-cost-card">
          <strong>{row.label}</strong>
          <span>{row.title[lang]}</span>
          <p>{row.text[lang]}</p>
        </article>
      ))}
    </div>
  );
}

function PredictionPrompts({ lang }: { lang: Locale }) {
  const prompts = [
    {
      input: "a@b.c",
      question: { en: "Will the final state accept?", zh: "最终状态会接受吗？" },
      answer: generateDfaTrace("a@b.c").accepted ? "accept" : "reject"
    },
    {
      input: "ana.@cs.ai",
      question: { en: "Which state appears right after the local-part dot?", zh: "本地部分的点之后会出现哪个状态？" },
      answer: generateDfaTrace("ana.@cs.ai").finalState
    },
    {
      input: "ana@cs!",
      question: { en: "Which table row rejects the exclamation mark?", zh: "哪个表格行拒绝感叹号？" },
      answer: lang === "en" ? "δ(in-domain, other) = dead" : "δ(in-domain, other) = dead，即 in-domain 行的 other 列"
    }
  ];
  return (
    <div className="dfa-card-grid">
      {prompts.map((prompt) => (
        <article key={prompt.input} className="dfa-card">
          <strong>{prompt.input}</strong>
          <p>{prompt.question[lang]}</p>
          <details className="dfa-reveal">
            <summary>{lang === "en" ? "Reveal answer" : "显示答案"}</summary>
            <p><code>{prompt.answer}</code></p>
          </details>
        </article>
      ))}
    </div>
  );
}

export default function DfaScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: DfaScenarioId }) {
  const meta = scenarioMeta[scenarioId];
  const missingDomain = dfaFixture.traces.missingDomainBeforeDot;
  const acceptOnlyAtEnd = dfaFixture.traces.acceptOnlyAtEnd;
  const focusDeadIndex = missingDomain.steps.find((step) => step.state === "dead")?.index;
  const finalStep = acceptOnlyAtEnd.steps.at(-1);

  return (
    <figure className="dfa-figure">
      <figcaption>
        <strong>{meta.title[lang]}</strong>
        <span>{meta.summary[lang]}</span>
      </figcaption>

      {scenarioId === "hook-categories" ? <HookCards lang={lang} /> : null}
      {scenarioId === "flag-combinations" ? <FlagGrid lang={lang} /> : null}
      {scenarioId === "missing-domain-before-dot" ? (
        <>
          <TraceTape trace={missingDomain} lang={lang} focusIndex={focusDeadIndex} />
          <TraceTable trace={missingDomain} lang={lang} />
        </>
      ) : null}
      {scenarioId === "state-meaning-cards" ? <StateCards lang={lang} /> : null}
      {scenarioId === "transition-table" ? (
        <>
          <StateDiagram lang={lang} activeState="in-domain" />
          <TransitionTable lang={lang} />
        </>
      ) : null}
      {scenarioId === "five-tuple-callout" ? <TupleCallout lang={lang} /> : null}
      {scenarioId === "accept-only-at-end" ? (
        <>
          <TraceTape trace={acceptOnlyAtEnd} lang={lang} focusIndex={finalStep?.index} />
          <p className="dfa-note">
            {lang === "en"
              ? "After the prefix ana@cs.ai the state is in-suffix, but the machine still must read the final dot. The last transition decides the whole string."
              : "读完前缀 ana@cs.ai 后状态是 in-suffix，但机器仍必须读取最后的点。最后一次转移决定整个字符串。"}
          </p>
          <TraceTable trace={acceptOnlyAtEnd} lang={lang} compact />
        </>
      ) : null}
      {scenarioId === "dead-state-loop" ? (
        <>
          <StateDiagram lang={lang} activeState="dead" deadOnly />
          <TransitionTable lang={lang} />
        </>
      ) : null}
      {scenarioId === "prefix-ledger" ? <TraceTable trace={dfaFixture.traces.success} lang={lang} /> : null}
      {scenarioId === "transition-cost" ? <TransitionCost lang={lang} /> : null}
      {scenarioId === "implementation-map" ? <ImplementationMap lang={lang} /> : null}
      {scenarioId === "prediction-prompts" ? <PredictionPrompts lang={lang} /> : null}

      <style>{`
        .dfa-figure {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-lg);
          box-shadow: var(--rcl-shadow-sm);
          display: grid;
          gap: 14px;
          margin: 24px 0;
          padding: 18px;
        }
        .dfa-figure figcaption {
          display: grid;
          gap: 4px;
          margin: 0;
        }
        .dfa-figure figcaption span,
        .dfa-note {
          color: var(--muted);
        }
        .dfa-card-grid,
        .dfa-state-cards,
        .dfa-tuple-grid,
        .dfa-cost-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        }
        .dfa-cost-flow {
          align-items: center;
          background: #eff6ff;
          border: 1px solid #93c5fd;
          border-radius: var(--rcl-radius-md);
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          grid-column: 1 / -1;
          padding: 12px;
        }
        .dfa-cost-flow strong,
        .dfa-badge,
        .dfa-cost-card strong {
          color: #0f766e;
          font-size: 1.25rem;
          font-weight: 900;
        }
        .dfa-badge {
          background: #dcfce7;
          border: 1px solid #86efac;
          border-radius: 999px;
          margin-left: auto;
          padding: 4px 10px;
        }
        .dfa-card,
        .dfa-state-card {
          background: var(--surface-muted);
          border: 1px solid var(--line);
          border-radius: var(--rcl-radius-md);
          padding: 12px;
        }
        .dfa-cost-card {
          display: grid;
          gap: 4px;
        }
        .dfa-cost-card span,
        .dfa-reveal summary {
          font-weight: 800;
        }
        .dfa-reveal {
          margin-top: 8px;
        }
        .dfa-reveal summary {
          cursor: pointer;
        }
        .dfa-reveal summary:focus-visible {
          border-radius: 6px;
          outline: 3px solid #f97316;
          outline-offset: 2px;
        }
        .dfa-card.accept,
        .dfa-state-card.accept,
        .accept-row {
          background: #dcfce7;
        }
        .dfa-card.reject,
        .dfa-state-card.dead,
        .dead-row {
          background: #ffedd5;
        }
        .dfa-state-card {
          display: grid;
          gap: 6px;
        }
        .dfa-state-card span {
          color: #0f766e;
          font-weight: 800;
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
        .dfa-state-svg {
          display: block;
          height: auto;
          width: 100%;
        }
        .dfa-edge line,
        .dfa-edge path {
          fill: none;
          stroke: var(--line);
          stroke-width: 3;
        }
        .dfa-edge text {
          fill: var(--text);
          font-size: 13px;
          font-weight: 800;
        }
        .dfa-state-svg marker path {
          fill: var(--line);
        }
        .dfa-state-svg circle {
          fill: var(--surface-muted);
          stroke: var(--line);
          stroke-width: 2;
        }
        .dfa-state-svg .active circle {
          fill: #fed7aa;
          stroke: #ea580c;
          stroke-width: 4;
        }
        .dfa-state-svg .accepting circle {
          stroke: #15803d;
        }
        .dfa-state-svg .dead circle {
          fill: #ffedd5;
          stroke: #c2410c;
        }
        .dfa-state-svg text {
          fill: var(--text);
          font-size: 12px;
          font-weight: 850;
        }
        .dfa-state-svg .state-meaning {
          fill: var(--muted);
          font-size: 9px;
        }
        .dfa-table-scroll {
          overflow-x: auto;
        }
        .dfa-mini-table {
          border-collapse: collapse;
          font-size: 0.92rem;
          min-width: 620px;
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
        @media (max-width: 680px) {
          .dfa-figure {
            padding: 14px;
          }
          .dfa-token {
            min-width: 68px;
          }
        }
      `}</style>
    </figure>
  );
}
