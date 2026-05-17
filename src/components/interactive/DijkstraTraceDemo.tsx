import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { ui } from "../../i18n/ui";
import { finalDistances, positions, trace, weightedEdges, type DijkstraNodeId } from "./dijkstraTrace";

const labels = {
  en: {
    title: "Dijkstra trace",
    previous: "Previous Dijkstra step",
    next: "Next Dijkstra step",
    reset: "Reset Dijkstra trace",
    heap: "Priority queue",
    settled: "Settled",
    current: "Current",
    edge: "Active edge",
    popped: "Popped",
    distance: "Distance",
    parent: "Parent"
  },
  zh: {
    title: "Dijkstra 追踪",
    previous: "上一步 Dijkstra",
    next: "下一步 Dijkstra",
    reset: "重置 Dijkstra 追踪",
    heap: "优先队列",
    settled: "已确定",
    current: "当前",
    edge: "当前边",
    popped: "弹出",
    distance: "距离",
    parent: "父节点"
  }
};

export default function DijkstraTraceDemo({ lang }: { lang: Locale }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = trace[stepIndex];
  const activeEdge = step.activeEdge?.join("-");
  const activeEdgeReverse = step.activeEdge ? `${step.activeEdge[1]}-${step.activeEdge[0]}` : "";

  return (
    <section className="dijkstra-trace-demo" aria-label={labels[lang].title}>
      <div className="dijkstra-demo-grid">
        <svg viewBox="0 0 390 210" role="img" aria-label={step.explanation[lang]}>
          {weightedEdges.map(([from, to, weight]) => {
            const start = positions[from];
            const end = positions[to];
            const key = `${from}-${to}`;
            const active = key === activeEdge || key === activeEdgeReverse;
            return (
              <g key={key}>
                <line className={active ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                <text className="dijkstra-weight" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 5}>{weight}</text>
              </g>
            );
          })}
          {(Object.keys(positions) as DijkstraNodeId[]).map((id) => {
            const status = step.current === id ? "current" : step.settled.includes(id) ? "settled" : step.dist[id] !== "Infinity" ? "tentative" : "unseen";
            const point = positions[id];
            return (
              <g key={id} transform={`translate(${point.x}, ${point.y})`}>
                <circle className={status} r="22" />
                <text textAnchor="middle" y="4">{id}</text>
                <title>{`${id}: ${status}, dist ${step.dist[id]}`}</title>
              </g>
            );
          })}
        </svg>

        <div className="state-panel">
          <p className="state-label">{labels[lang].title}</p>
          <p aria-live="polite">{step.explanation[lang]}</p>
          <div className="dijkstra-state-grid">
            <div><strong>{labels[lang].current}</strong><span>{step.current ?? "-"}</span></div>
            <div><strong>{labels[lang].edge}</strong><span>{activeEdge ?? "-"}</span></div>
            <div><strong>{labels[lang].popped}</strong><span>{step.popped ? `${step.popped.node}:${step.popped.distance}` : "-"}</span></div>
            <div><strong>{labels[lang].settled}</strong><span>{step.settled.join(", ") || "-"}</span></div>
          </div>
          <div className="queue">
            <strong>{labels[lang].heap}:</strong>
            {step.heap.length > 0 ? step.heap.map((entry, index) => <span key={`${entry.node}-${entry.distance}-${index}`}>{entry.node}:{entry.distance}{entry.stale ? "*" : ""}</span>) : <span>-</span>}
          </div>
          <p className="scenario-detail">{lang === "en" ? "Shown sorted for reading; a real heap only promises the next minimum." : "为便于阅读而排序展示；真实堆只保证下一次取出最小项。"}</p>
          <table className="dijkstra-mini-table">
            <thead>
              <tr><th>{lang === "en" ? "Node" : "节点"}</th><th>{labels[lang].distance}</th><th>{labels[lang].parent}</th></tr>
            </thead>
            <tbody>
              {(Object.keys(finalDistances) as DijkstraNodeId[]).map((id) => (
                <tr key={id}>
                  <th scope="row">{id}</th>
                  <td>{step.dist[id]}</td>
                  <td>{step.parent[id] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {step.id === "done" ? (
            <p className="scenario-detail">
              {lang === "en" ? `Final F path: A -> C -> B -> D -> E -> F, cost ${finalDistances.F}.` : `到 F 的最终路径：A -> C -> B -> D -> E -> F，代价 ${finalDistances.F}。`}
            </p>
          ) : null}
          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>{labels[lang].previous}</button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.length - 1))} disabled={stepIndex === trace.length - 1}>{labels[lang].next}</button>
            <button type="button" onClick={() => setStepIndex(0)}>{ui[lang].reset}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
