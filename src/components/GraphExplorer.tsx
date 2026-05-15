import { useMemo, useState } from "react";
import type { GraphEdge, GraphNode } from "../data/graph";
import type { Locale } from "../i18n/locales";
import { ui } from "../i18n/ui";
import { nodePath } from "../lib/routes";

type Props = {
  lang: Locale;
  nodes: GraphNode[];
  edges: GraphEdge[];
  availableNodeIds: string[];
};

export default function GraphExplorer({ lang, nodes, edges, availableNodeIds }: Props) {
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? "");
  const selected = nodes.find((node) => node.id === selectedId);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  function goToNode(id: string) {
    if (availableNodeIds.includes(id)) {
      window.location.href = nodePath(lang, id);
    } else {
      setSelectedId(id);
    }
  }

  function labelLines(label: string): string[] {
    if (label.length <= 14 || !label.includes(" ")) return [label];
    const parts = label.split(" ");
    const midpoint = Math.ceil(parts.length / 2);
    return [parts.slice(0, midpoint).join(" "), parts.slice(midpoint).join(" ")];
  }

  return (
    <section className="graph-explorer" aria-labelledby="graph-title">
      <div className="graph-header">
        <div>
          <h2 id="graph-title">{ui[lang].visualGraph}</h2>
          {selected ? (
            <p>
              {ui[lang].selectedNode}: <strong>{selected.label[lang]}</strong>
              {availableNodeIds.includes(selected.id) ? "" : ` (${ui[lang].unavailable})`}
            </p>
          ) : null}
        </div>
      </div>

      <svg viewBox="0 0 640 260" role="img" aria-label={ui[lang].visualGraph}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.position.x + 58}
                y1={from.position.y}
                x2={to.position.x - 58}
                y2={to.position.y}
                markerEnd="url(#arrow)"
              />
              <text x={(from.position.x + to.position.x) / 2} y={(from.position.y + to.position.y) / 2 - 14}>
                {edge.type}
              </text>
            </g>
          );
        })}
        {nodes.map((node) => {
          const isSelected = node.id === selectedId;
          const hasPage = availableNodeIds.includes(node.id);
          const lines = labelLines(node.label[lang]);
          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              className="svg-node"
              role="button"
              tabIndex={0}
              aria-label={`${node.label[lang]} ${node.status}`}
              onClick={() => goToNode(node.id)}
              onFocus={() => setSelectedId(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  goToNode(node.id);
                }
              }}
            >
              <circle r="58" className={isSelected ? "selected" : ""} />
              {lines.map((line, index) => (
                <text key={line} textAnchor="middle" y={lines.length === 1 ? -4 : -14 + index * 16}>
                  {line}
                </text>
              ))}
              <text textAnchor="middle" y="24">{hasPage ? node.status : ui[lang].unavailable}</text>
            </g>
          );
        })}
      </svg>

      <div className="graph-list">
        <h2>{ui[lang].accessibleGraphList}</h2>
        <ul>
          {nodes.map((node) => (
            <li key={node.id}>
              {availableNodeIds.includes(node.id) ? (
                <a href={nodePath(lang, node.id)}>{node.label[lang]}</a>
              ) : (
                <span>{node.label[lang]}</span>
              )}
              <span> - {node.status}</span>
              {edges
                .filter((edge) => edge.from === node.id)
                .map((edge) => {
                  const target = nodeMap.get(edge.to);
                  return target ? (
                    <p key={`${edge.from}-${edge.to}`}>
                      {edge.type}: {target.label[lang]}. {edge.reason[lang]}
                    </p>
                  ) : null;
                })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
