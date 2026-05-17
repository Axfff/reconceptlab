import type { Locale } from "../../i18n/locales";
import {
  complexityCounts,
  finalDistances,
  finalParents,
  negativeDirectedVariant,
  negativeWarningSteps,
  positions,
  reconstructPath,
  scenarios,
  trace,
  weightedEdges,
  type DijkstraNodeId,
  type DijkstraScenario,
  type NegativeEdgeScenario
} from "./dijkstraTrace";

function stepFor(id?: string) {
  return trace.find((step) => step.id === id) ?? trace[0];
}

function GraphSvg({ scenario, lang }: { scenario: DijkstraScenario; lang: Locale }) {
  if (scenario.variant === "negative-directed") return <NegativeSvg scenario={scenario} lang={lang} />;
  const step = stepFor(scenario.traceStepId);
  const highlighted = new Set((scenario.highlightedEdges ?? []).map(([from, to]) => `${from}-${to}`));
  return (
    <svg viewBox="0 0 390 210" role="img" aria-label={scenario.ariaLabel[lang]}>
      {weightedEdges.map(([from, to, weight]) => {
        const start = positions[from];
        const end = positions[to];
        const active = (step.activeEdge && ((step.activeEdge[0] === from && step.activeEdge[1] === to) || (step.activeEdge[0] === to && step.activeEdge[1] === from))) || highlighted.has(`${from}-${to}`) || highlighted.has(`${to}-${from}`);
        return (
          <g key={`${from}-${to}`}>
            <line className={active ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <text className="dijkstra-weight" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 5}>{weight}</text>
          </g>
        );
      })}
      {Object.entries(positions).map(([id, point]) => {
        const node = id as DijkstraNodeId;
        const status = step.current === node ? "current" : step.settled.includes(node) ? "settled" : step.dist[node] !== "Infinity" ? "tentative" : "unseen";
        return (
          <g key={id} transform={`translate(${point.x}, ${point.y})`}>
            <circle className={status} r="22" />
            <text textAnchor="middle" y="4">{id}</text>
            <title>{`${id}: ${status}, dist ${step.dist[node]}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function NegativeSvg({ scenario, lang }: { scenario: NegativeEdgeScenario; lang: Locale }) {
  const step = negativeWarningSteps.find((candidate) => candidate.id === scenario.warningStepId) ?? negativeWarningSteps[0];
  const pos = { S: { x: 54, y: 90 }, A: { x: 210, y: 45 }, B: { x: 210, y: 135 } };
  return (
    <svg viewBox="0 0 310 170" role="img" aria-label={scenario.ariaLabel[lang]}>
      <defs>
        <marker id="dijkstra-negative-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {negativeDirectedVariant.directedEdges.map(([from, to, weight]) => {
        const start = pos[from];
        const end = pos[to];
        const active = step.activeEdge?.[0] === from && step.activeEdge?.[1] === to;
        return (
          <g key={`${from}-${to}`}>
            <line className={active ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} markerEnd="url(#dijkstra-negative-arrow)" />
            <text className="dijkstra-weight" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 4}>{weight}</text>
          </g>
        );
      })}
      {negativeDirectedVariant.nodes.map((id) => (
        <g key={id} transform={`translate(${pos[id].x}, ${pos[id].y})`}>
          <circle className={step.settled.includes(id) ? "settled" : id === step.current ? "current" : ""} r="22" />
          <text textAnchor="middle" y="4">{id}</text>
        </g>
      ))}
      <text className="dijkstra-note" x="16" y="160">{lang === "en" ? "directed warning, not the main map" : "有向警示，不是主地图"}</text>
    </svg>
  );
}

function StatePanel({ scenario, lang }: { scenario: DijkstraScenario; lang: Locale }) {
  if (scenario.variant === "negative-directed") {
    const step = negativeWarningSteps.find((candidate) => candidate.id === scenario.warningStepId) ?? negativeWarningSteps[0];
    return (
      <div className="dijkstra-state-grid">
        <div><strong>{lang === "en" ? "Warning step" : "警示步骤"}</strong><span>{step.id}</span></div>
        <div><strong>{lang === "en" ? "Candidate" : "候选值"}</strong><span>{step.candidateDistance ?? "-"}</span></div>
        <div><strong>{lang === "en" ? "Rule" : "规则"}</strong><span>{scenario.localRule[lang]}</span></div>
      </div>
    );
  }
  const step = stepFor(scenario.traceStepId);
  return (
    <div className="dijkstra-state-grid">
      <div><strong>{lang === "en" ? "Trace" : "追踪"}</strong><span>{step.id}</span></div>
      <div><strong>{lang === "en" ? "Heap" : "堆"}</strong><span>{step.heap.map((entry) => `${entry.node}:${entry.distance}${entry.stale ? "*" : ""}`).join(", ") || "-"}</span></div>
      <div><strong>{lang === "en" ? "Current" : "当前"}</strong><span>{step.current ?? "-"}</span></div>
      <div><strong>{lang === "en" ? "Edge" : "边"}</strong><span>{step.activeEdge?.join("-") ?? "-"}</span></div>
      <div><strong>{lang === "en" ? "Rule" : "规则"}</strong><span>{scenario.localRule[lang]}</span></div>
    </div>
  );
}

function DistanceTable({ lang }: { lang: Locale }) {
  return (
    <table className="dijkstra-mini-table">
      <caption>{lang === "en" ? "Final distances from A" : "从 A 出发的最终距离"}</caption>
      <thead><tr><th>{lang === "en" ? "Node" : "节点"}</th><th>dist</th><th>parent</th></tr></thead>
      <tbody>
        {(Object.keys(finalDistances) as DijkstraNodeId[]).map((id) => (
          <tr key={id}>
            <th scope="row">{id}</th>
            <td>{finalDistances[id]}</td>
            <td>{finalParents[id] ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DijkstraScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: DijkstraScenario["id"] }) {
  const scenario = scenarios[scenarioId];
  return (
    <figure className="dijkstra-scenario-figure">
      <figcaption>
        <strong>{scenario.caption[lang]}</strong>
        <span>{scenario.ariaLabel[lang]}</span>
      </figcaption>
      <GraphSvg scenario={scenario} lang={lang} />
      <StatePanel scenario={scenario} lang={lang} />
      {scenarioId === "hook-weighted-map" || scenarioId === "path-reconstruction" ? <DistanceTable lang={lang} /> : null}
      {scenarioId === "path-reconstruction" ? (
        <p className="scenario-detail">
          {lang === "en" ? `Follow parents backward from F: ${reconstructPath("F").slice().reverse().join(" <- ")}; reverse to get ${reconstructPath("F").join(" -> ")}.` : `从 F 沿父节点反向追踪：${reconstructPath("F").slice().reverse().join(" <- ")}；反转后得到 ${reconstructPath("F").join(" -> ")}。`}
        </p>
      ) : null}
      {scenarioId === "unreachable-node" ? (
        <p className="scenario-detail">{lang === "en" ? "If an isolated G were added, it would remain dist[G] = Infinity, parent[G] = none, and never enter the heap." : "如果加入孤立的 G，它会保持 dist[G] = Infinity、parent[G] = 无，并且永远不会进入堆。"}</p>
      ) : null}
      {scenarioId === "complexity" ? (
        <p className="scenario-detail">{lang === "en" ? `${complexityCounts.undirectedEdges} undirected edges produce ${complexityCounts.directedNeighborScans} neighbor scans, ${complexityCounts.heapPushes} heap pushes, and ${complexityCounts.staleSkips} stale skips in this fixture.` : `这个例子中 ${complexityCounts.undirectedEdges} 条无向边产生 ${complexityCounts.directedNeighborScans} 次邻居扫描、${complexityCounts.heapPushes} 次入堆和 ${complexityCounts.staleSkips} 次过期跳过。`}</p>
      ) : null}
      {scenarioId === "heap-stale-entry" ? (
        <p className="scenario-detail">{lang === "en" ? "Heap entries are shown sorted for reading; a real heap only promises the next minimum." : "堆条目为了阅读按序展示；真实堆只保证下一次取出最小项。"}</p>
      ) : null}
    </figure>
  );
}
