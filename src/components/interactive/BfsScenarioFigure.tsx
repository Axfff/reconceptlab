import type { Locale } from "../../i18n/locales";
import {
  finalDistance,
  finalParent,
  positions,
  scenarios,
  stackComparisonAdjacency,
  stackComparisonPositions,
  trace,
  undirectedEdges,
  weightedCounterexample,
  type BfsScenario,
  type MainBfsNodeId,
  type StackComparisonNodeId
} from "./bfsTrace";

function statusFor(id: MainBfsNodeId, stepId?: string) {
  const step = trace.find((candidate) => candidate.id === stepId) ?? trace[0];
  if (step.current === id) return "current";
  if (step.expanded.includes(id)) return "expanded";
  if (step.queue.includes(id)) return "queued";
  if (step.discovered.includes(id)) return "discovered";
  return "unseen";
}

function MainGraph({ scenario, lang }: { scenario: BfsScenario; lang: Locale }) {
  const highlightedEdges = new Set((scenario.highlightedEdges ?? []).map(([from, to]) => `${from}-${to}`));
  return (
    <svg viewBox="0 0 340 285" role="img" aria-label={scenario.ariaLabel[lang]}>
      {undirectedEdges.map(([from, to]) => {
        const start = positions[from];
        const end = positions[to];
        const highlighted = highlightedEdges.has(`${from}-${to}`) || highlightedEdges.has(`${to}-${from}`);
        return <line key={`${from}-${to}`} className={highlighted ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
      })}
      {(Object.keys(positions) as MainBfsNodeId[]).map((id) => {
        const pos = positions[id];
        const status = statusFor(id, scenario.traceStepId);
        return (
          <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle className={status} r="22" />
            <text textAnchor="middle" y="4">{id}</text>
            <title>{`${id}: ${status}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function StackToy({ lang }: { lang: Locale }) {
  const edges = Object.entries(stackComparisonAdjacency).flatMap(([from, tos]) => tos.map((to) => [from, to] as [StackComparisonNodeId, StackComparisonNodeId]));
  return (
    <svg viewBox="0 0 390 150" role="img" aria-label={lang === "en" ? "Directed stack comparison toy graph" : "有向栈对比小图"}>
      <defs>
        <marker id="bfs-toy-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {edges.map(([from, to]) => {
        const start = stackComparisonPositions[from];
        const end = stackComparisonPositions[to];
        return <line key={`${from}-${to}`} className="active" x1={start.x} y1={start.y} x2={end.x} y2={end.y} markerEnd="url(#bfs-toy-arrow)" />;
      })}
      {(Object.keys(stackComparisonPositions) as StackComparisonNodeId[]).map((id) => {
        const pos = stackComparisonPositions[id];
        return (
          <g key={id} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle className={id === "X" ? "queued" : ""} r="20" />
            <text textAnchor="middle" y="4">{id}</text>
          </g>
        );
      })}
      <text className="bfs-note" x="238" y="142">{lang === "en" ? "stack top -> B, then D, then E" : "栈顶 -> B，然后 D，再 E"}</text>
    </svg>
  );
}

function WeightedMini({ lang }: { lang: Locale }) {
  const pos = { A: { x: 60, y: 45 }, B: { x: 260, y: 45 }, C: { x: 160, y: 125 } };
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label={lang === "en" ? "Weighted counterexample for BFS" : "BFS 的带权反例"}>
      {weightedCounterexample.edges.map(([from, to, weight]) => {
        const start = pos[from];
        const end = pos[to];
        return (
          <g key={`${from}-${to}`}>
            <line className={weight === 10 ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <text className="bfs-note" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 6}>{weight}</text>
          </g>
        );
      })}
      {weightedCounterexample.nodes.map((id) => (
        <g key={id} transform={`translate(${pos[id].x}, ${pos[id].y})`}>
          <circle className={id === "A" ? "current" : ""} r="22" />
          <text textAnchor="middle" y="4">{id}</text>
        </g>
      ))}
      <text className="bfs-note" x="20" y="152">{lang === "en" ? "fewest edges: A-B; lowest cost: A-C-B" : "边数最少：A-B；总代价最低：A-C-B"}</text>
    </svg>
  );
}

function StateTable({ scenario, lang }: { scenario: BfsScenario; lang: Locale }) {
  const step = trace.find((candidate) => candidate.id === scenario.traceStepId);
  if (!step) return null;
  return (
    <div className="bfs-state-table">
      <div><strong>{lang === "en" ? "Queue" : "队列"}</strong><span>{step.queue.join(", ") || "-"}</span></div>
      <div><strong>{lang === "en" ? "Current" : "当前"}</strong><span>{step.current ?? "-"}</span></div>
      <div><strong>{lang === "en" ? "Edge" : "边"}</strong><span>{step.activeNeighbor && step.current ? `${step.current}-${step.activeNeighbor}` : "-"}</span></div>
      <div><strong>{lang === "en" ? "Rule" : "规则"}</strong><span>{scenario.caption[lang]}</span></div>
    </div>
  );
}

function DistanceParent({ lang }: { lang: Locale }) {
  return (
    <table className="bfs-mini-table">
      <caption>{lang === "en" ? "Final BFS state" : "BFS 最终状态"}</caption>
      <thead><tr><th>{lang === "en" ? "Node" : "节点"}</th><th>{lang === "en" ? "Distance" : "距离"}</th><th>{lang === "en" ? "Parent" : "父节点"}</th></tr></thead>
      <tbody>
        {(Object.keys(finalDistance) as MainBfsNodeId[]).map((id) => (
          <tr key={id}>
            <th scope="row">{id}</th>
            <td>{finalDistance[id]}</td>
            <td>{finalParent[id] ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BfsScenarioFigure({ lang, scenarioId }: { lang: Locale; scenarioId: BfsScenario["id"] }) {
  const scenario = scenarios[scenarioId];
  const useStack = scenarioId === "queue-vs-stack";
  const useWeighted = scenarioId === "weighted-counterexample";

  return (
    <figure className="bfs-scenario-figure">
      <figcaption>
        <strong>{scenario.caption[lang]}</strong>
        <span>{scenario.ariaLabel[lang]}</span>
      </figcaption>
      {useStack ? <StackToy lang={lang} /> : useWeighted ? <WeightedMini lang={lang} /> : <MainGraph scenario={scenario} lang={lang} />}
      <StateTable scenario={scenario} lang={lang} />
      {scenarioId === "parent-vs-distance" ? <DistanceParent lang={lang} /> : null}
      {scenarioId === "edge-scan-cost" ? (
        <p className="scenario-detail">{lang === "en" ? "Seven nodes are discovered once; eight undirected edges are represented by adjacency rows and scanned from expanded nodes." : "7 个节点各发现一次；8 条无向边通过邻接行表示，并从展开节点扫描。"}</p>
      ) : null}
      {scenarioId === "visited-timing" ? (
        <p className="scenario-detail">{lang === "en" ? "Delayed marking could create duplicate queue entries like [G, G]. Marking on discovery prevents that." : "延迟标记可能产生 [G, G] 这样的重复队列项。发现时标记可以避免它。"}</p>
      ) : null}
    </figure>
  );
}
