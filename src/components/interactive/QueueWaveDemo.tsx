import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { ui } from "../../i18n/ui";
import { positions, trace, undirectedEdges, type MainBfsNodeId } from "./bfsTrace";

const labels = {
  en: {
    title: "Breadth-first search trace",
    previous: "Previous BFS step",
    next: "Next BFS step",
    reset: "Reset BFS trace",
    discovered: "Discovered",
    expanded: "Expanded",
    distance: "Distance",
    parent: "Parent",
    current: "Current",
    edge: "Active edge",
    empty: "empty"
  },
  zh: {
    title: "广度优先搜索追踪",
    previous: "上一步 BFS",
    next: "下一步 BFS",
    reset: "重置 BFS 追踪",
    discovered: "已发现",
    expanded: "已展开",
    distance: "距离",
    parent: "父节点",
    current: "当前",
    edge: "当前边",
    empty: "空"
  }
};

function statusFor(id: MainBfsNodeId, step: (typeof trace)[number]) {
  if (step.current === id) return "current";
  if (step.expanded.includes(id)) return "expanded";
  if (step.queue.includes(id)) return "queued";
  if (step.discovered.includes(id)) return "visited";
  return "waiting";
}

export default function QueueWaveDemo({ lang }: { lang: Locale }) {
  const [stepIndex, setStepIndex] = useState(0);
  const state = trace[stepIndex];
  const activeEdge = state.current && state.activeNeighbor ? `${state.current}-${state.activeNeighbor}` : "";
  const activeEdgeReverse = state.current && state.activeNeighbor ? `${state.activeNeighbor}-${state.current}` : "";
  const discovered = useMemo(() => new Set(state.discovered), [state]);
  const expanded = useMemo(() => new Set(state.expanded), [state]);

  return (
    <section className="queue-wave-demo" aria-label={labels[lang].title}>
      <div className="demo-grid">
        <svg viewBox="0 0 340 285" role="img" aria-label={state.explanation[lang]}>
          {undirectedEdges.map(([from, to]) => {
            const start = positions[from];
            const end = positions[to];
            const active = `${from}-${to}` === activeEdge || `${from}-${to}` === activeEdgeReverse;
            return <line key={`${from}-${to}`} className={active ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
          })}
          {(Object.keys(positions) as MainBfsNodeId[]).map((id) => {
            const point = positions[id];
            const status = statusFor(id, state);
            return (
              <g key={id} transform={`translate(${point.x}, ${point.y})`}>
                <circle className={status} r="23" />
                <text textAnchor="middle" y="5">{id}</text>
                <title>{`${id}: ${status}`}</title>
              </g>
            );
          })}
        </svg>

        <div className="state-panel">
          <p className="state-label">{labels[lang].title}</p>
          <p aria-live="polite">{state.explanation[lang]}</p>
          <div className="queue">
            <strong>{ui[lang].queue}:</strong>
            {state.queue.length > 0 ? state.queue.map((id) => <span key={id}>{id}</span>) : <span>{labels[lang].empty}</span>}
          </div>
          <div className="bfs-state-table">
            <div><strong>{labels[lang].current}</strong><span>{state.current ?? "-"}</span></div>
            <div><strong>{labels[lang].edge}</strong><span>{activeEdge || "-"}</span></div>
            <div><strong>{labels[lang].discovered}</strong><span>{[...discovered].join(", ") || "-"}</span></div>
            <div><strong>{labels[lang].expanded}</strong><span>{[...expanded].join(", ") || "-"}</span></div>
          </div>
          <table className="bfs-mini-table">
            <thead>
              <tr><th>{lang === "en" ? "Node" : "节点"}</th><th>{labels[lang].distance}</th><th>{labels[lang].parent}</th></tr>
            </thead>
            <tbody>
              {(Object.keys(positions) as MainBfsNodeId[]).map((id) => (
                <tr key={id}>
                  <th scope="row">{id}</th>
                  <td>{state.distance[id] ?? "-"}</td>
                  <td>{state.parent[id] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>
              {labels[lang].previous}
            </button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.length - 1))} disabled={stepIndex === trace.length - 1}>
              {labels[lang].next}
            </button>
            <button type="button" onClick={() => setStepIndex(0)}>
              {labels[lang].reset}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
