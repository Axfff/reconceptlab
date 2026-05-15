import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { ui } from "../../i18n/ui";

type StepState = {
  visited: string[];
  queue: string[];
  current?: string;
  explanation: Record<Locale, string>;
};

const graph = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: [],
  F: []
};

const positions: Record<string, { x: number; y: number }> = {
  A: { x: 160, y: 40 },
  B: { x: 90, y: 115 },
  C: { x: 230, y: 115 },
  D: { x: 50, y: 195 },
  E: { x: 130, y: 195 },
  F: { x: 250, y: 195 }
};

const trace: StepState[] = [
  {
    visited: ["A"],
    queue: ["A"],
    current: "A",
    explanation: {
      en: "Start by putting A in the queue. The queue records the wave front.",
      zh: "先把 A 放入队列（queue）。队列记录正在扩张的波前。"
    }
  },
  {
    visited: ["A", "B", "C"],
    queue: ["B", "C"],
    current: "A",
    explanation: {
      en: "Remove A, then discover its neighbors B and C. They wait in first-in, first-out order.",
      zh: "取出 A，再发现邻居 B 和 C。它们按照先进先出的顺序等待。"
    }
  },
  {
    visited: ["A", "B", "C", "D", "E"],
    queue: ["C", "D", "E"],
    current: "B",
    explanation: {
      en: "Now B expands. D and E are one edge farther away than B.",
      zh: "现在扩张 B。D 和 E 比 B 再多一条边。"
    }
  },
  {
    visited: ["A", "B", "C", "D", "E", "F"],
    queue: ["D", "E", "F"],
    current: "C",
    explanation: {
      en: "C expands before D and E because it was queued earlier. This preserves distance layers.",
      zh: "C 比 D 和 E 更早入队，所以先扩张。这保持了按距离分层的顺序。"
    }
  },
  {
    visited: ["A", "B", "C", "D", "E", "F"],
    queue: [],
    explanation: {
      en: "The queue is empty. Every reachable node has been visited by increasing edge distance.",
      zh: "队列为空。所有可达节点都已经按边数距离从近到远访问。"
    }
  }
];

export default function QueueWaveDemo({ lang }: { lang: Locale }) {
  const [step, setStep] = useState(0);
  const state = trace[step];
  const visited = useMemo(() => new Set(state.visited), [state]);
  const queued = useMemo(() => new Set(state.queue), [state]);

  return (
    <section className="queue-wave-demo" aria-label="Breadth-first search queue wave demo">
      <div className="demo-grid">
        <svg viewBox="0 0 320 240" role="img" aria-label={state.explanation[lang]}>
          {Object.entries(graph).flatMap(([from, tos]) =>
            tos.map((to) => (
              <line
                key={`${from}-${to}`}
                x1={positions[from].x}
                y1={positions[from].y}
                x2={positions[to].x}
                y2={positions[to].y}
              />
            ))
          )}
          {Object.keys(graph).map((id) => {
            const status = state.current === id ? "current" : queued.has(id) ? "queued" : visited.has(id) ? "visited" : "waiting";
            return (
              <g key={id} transform={`translate(${positions[id].x}, ${positions[id].y})`}>
                <circle className={status} r="24" />
                <text textAnchor="middle" y="5">{id}</text>
                <title>{`${id}: ${status}`}</title>
              </g>
            );
          })}
        </svg>

        <div className="state-panel">
          <p className="state-label">{ui[lang].currentState}</p>
          <p>{state.explanation[lang]}</p>
          <div className="queue" aria-live="polite">
            <strong>{ui[lang].queue}:</strong>
            {state.queue.length > 0 ? state.queue.map((id) => <span key={id}>{id}</span>) : <span>empty</span>}
          </div>
          <div className="controls">
            <button type="button" onClick={() => setStep((value) => Math.min(value + 1, trace.length - 1))}>
              {ui[lang].step}
            </button>
            <button type="button" onClick={() => setStep(0)}>
              {ui[lang].reset}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
