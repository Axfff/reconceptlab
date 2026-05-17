import type { Locale } from "../../i18n/locales";
import {
  adjacency,
  matrixValue,
  roomLabel,
  rooms,
  scenarios,
  undirectedEdges,
  type GraphBasicsEdge,
  type GraphBasicsScenario,
  type RoomId
} from "./graphBasicsTrace";

const statusLabels = {
  en: {
    unchanged: "unchanged",
    "valid-needs-review": "valid, review",
    stale: "stale",
    missing: "missing"
  },
  zh: {
    unchanged: "不变",
    "valid-needs-review": "有效但需复查",
    stale: "过期",
    missing: "缺失"
  }
} as const;

function edgeKey(from: RoomId, to: RoomId) {
  return `${from}-${to}`;
}

function routeText(route: RoomId[], lang: Locale) {
  return route.map((id) => roomLabel(id, lang)).join(" -> ");
}

function edgeEndpoints(edge: [RoomId, RoomId] | GraphBasicsEdge): [RoomId, RoomId] {
  return Array.isArray(edge) ? edge : [edge.from, edge.to];
}

function RoomGraph({ scenario, lang }: { scenario: GraphBasicsScenario; lang: Locale }) {
  const edges: Array<GraphBasicsEdge & { variant?: boolean }> = [
    ...undirectedEdges.map(([from, to]) => ({ from, to, directed: false, variant: false })),
    ...(scenario.variantEdges ?? []).map((edge) => ({ ...edge, variant: true }))
  ];
  const highlighted = new Set((scenario.highlightedEdges ?? []).map(([from, to]) => edgeKey(from, to)));
  const highlightedNodes = new Set(scenario.highlightedNodes ?? []);

  return (
    <svg viewBox="0 0 360 245" role="img" aria-label={scenario.ariaLabel[lang]}>
      <defs>
        <marker id={`arrow-${scenario.id}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {edges.map((edge) => {
        const [from, to] = edgeEndpoints(edge);
        const start = rooms.find((room) => room.id === from)!;
        const end = rooms.find((room) => room.id === to)!;
        const isHighlighted = highlighted.has(edgeKey(from, to)) || highlighted.has(edgeKey(to, from)) || edge.variant;
        const className = ["gb-edge", isHighlighted ? "highlighted" : "", edge.variant ? "variant" : ""].filter(Boolean).join(" ");
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        return (
          <g key={`${from}-${to}-${edge.variant ? "variant" : "base"}`}>
            <line
              className={className}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              markerEnd={edge.directed ? `url(#arrow-${scenario.id})` : undefined}
            />
            {edge.weight ? (
              <g transform={`translate(${midX}, ${midY - 10})`}>
                <rect className="gb-weight" x="-12" y="-12" width="24" height="20" rx="5" />
                <text textAnchor="middle" y="3">{edge.weight}</text>
              </g>
            ) : null}
          </g>
        );
      })}
      {rooms.map((room) => {
        const active = scenario.activeNode === room.id || highlightedNodes.has(room.id);
        return (
          <g key={room.id} transform={`translate(${room.x}, ${room.y})`}>
            <circle className={active ? "active" : ""} r="24" />
            <text textAnchor="middle" y="4">{room.label[lang]}</text>
            <title>{room.label[lang]}</title>
          </g>
        );
      })}
    </svg>
  );
}

function RouteCards({ scenario, lang }: { scenario: GraphBasicsScenario; lang: Locale }) {
  if (!scenario.routeCardStatuses) return null;
  return (
    <div className="gb-cards">
      {scenario.routeCardStatuses.map((card) => (
        <div key={`${card.status}-${card.route.join("-")}`} className={`gb-card ${card.status}`}>
          <strong>{routeText(card.route, lang)}</strong>
          <span>{statusLabels[lang][card.status]}</span>
          <p>{card.note[lang]}</p>
        </div>
      ))}
    </div>
  );
}

function ModelingChoice({ lang }: { lang: Locale }) {
  const rows = {
    en: [
      ["Keep", "rooms, direct doors"],
      ["Throw away", "room size, hallway bends, decoration"],
      ["Reject here", "full route advice like Cafe -> Hall -> Lab"]
    ],
    zh: [
      ["保留", "房间、直接连接的门"],
      ["丢掉", "房间大小、走廊弯曲、装饰"],
      ["本页不存", "完整路线建议，例如 Cafe -> Hall -> Lab"]
    ]
  };
  return (
    <div className="gb-choice">
      {rows[lang].map(([label, value]) => (
        <div key={label}>
          <strong>{label}</strong>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

function AdjacencyList({ lang, highlightedRows = [] }: { lang: Locale; highlightedRows?: RoomId[] }) {
  const rows = Object.entries(adjacency) as Array<[RoomId, RoomId[]]>;
  return (
    <div className="gb-adjacency" role="list" aria-label={lang === "en" ? "Adjacency list" : "邻接表"}>
      {rows.map(([id, neighbors]) => (
        <div key={id} className={highlightedRows.includes(id) ? "highlighted" : ""} role="listitem">
          <strong>{roomLabel(id, lang)}</strong>
          <span>{neighbors.map((neighbor) => roomLabel(neighbor, lang)).join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

function Matrix({ lang, highlightedCells = [] }: { lang: Locale; highlightedCells?: GraphBasicsScenario["highlightedMatrixCells"] }) {
  const cells = new Set((highlightedCells ?? []).map((cell) => `${cell.row}-${cell.column}`));
  return (
    <table className="gb-matrix">
      <caption>{lang === "en" ? "Rows are from rooms; columns are to rooms." : "行表示出发房间，列表示到达房间。"}</caption>
      <thead>
        <tr>
          <th scope="col" />
          {rooms.map((room) => <th key={room.id} scope="col">{room.label[lang]}</th>)}
        </tr>
      </thead>
      <tbody>
        {rooms.map((row) => (
          <tr key={row.id}>
            <th scope="row">{row.label[lang]}</th>
            {rooms.map((column) => (
              <td key={column.id} className={cells.has(`${row.id}-${column.id}`) ? "highlighted" : ""}>
                {matrixValue(row.id, column.id)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CommonConfusions({ lang }: { lang: Locale }) {
  const items = {
    en: [
      ["Edge vs path", "Hall-Lab is one edge; Lobby -> Hall -> Lab is a path."],
      ["Neighbor vs reachable", "Lab is reachable from Lobby, but not adjacent to Lobby."],
      ["Directed reversal", "Lab -> Hall does not automatically allow Hall -> Lab."],
      ["Weight vs adjacency", "Lobby-Hall cost 2 and Lobby-Stairs cost 5 are both one neighbor step."]
    ],
    zh: [
      ["边 vs 路径", "Hall-Lab 是一条边；Lobby -> Hall -> Lab 是一条路径。"],
      ["邻居 vs 可达", "Lab 可以从 Lobby 到达，但不是 Lobby 的邻居。"],
      ["有向反转", "Lab -> Hall 不会自动允许 Hall -> Lab。"],
      ["权重 vs 邻接", "Lobby-Hall 代价 2 和 Lobby-Stairs 代价 5 都是一步邻居。"]
    ]
  };
  return (
    <div className="gb-cards">
      {items[lang].map(([title, body]) => (
        <div className="gb-card" key={title}>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

export default function GraphBasicsFigure({ lang, scenarioId }: { lang: Locale; scenarioId: GraphBasicsScenario["id"] }) {
  const scenario = scenarios[scenarioId];
  const showGraph = !["modeling-choice", "route-advice-vs-adjacency", "adjacency-list", "adjacency-matrix", "common-confusions"].includes(scenarioId);

  return (
    <figure className="graph-basics-figure">
      <figcaption>
        <strong>{scenario.title[lang]}</strong>
        <span>{scenario.summary[lang]}</span>
      </figcaption>
      {showGraph ? <RoomGraph scenario={scenario} lang={lang} /> : null}
      {scenarioId === "modeling-choice" ? <ModelingChoice lang={lang} /> : null}
      {scenarioId === "route-advice-vs-adjacency" ? (
        <div className="gb-compare">
          <div>
            <strong>{lang === "en" ? "Route advice" : "路线建议"}</strong>
            <code>{`[["cafe","hall","lab"], ...]`}</code>
          </div>
          <div>
            <strong>{lang === "en" ? "Adjacency" : "邻接关系"}</strong>
            <code>{`cafe: ["hall", "stairs"]`}</code>
          </div>
        </div>
      ) : null}
      {scenarioId === "adjacency-list" || scenarioId === "route-advice-vs-adjacency" ? (
        <AdjacencyList lang={lang} highlightedRows={scenario.highlightedRows} />
      ) : null}
      {scenarioId === "adjacency-matrix" ? <Matrix lang={lang} highlightedCells={scenario.highlightedMatrixCells} /> : null}
      {scenarioId === "common-confusions" ? <CommonConfusions lang={lang} /> : null}
      <RouteCards scenario={scenario} lang={lang} />
      <p className="scenario-detail">{scenario.caption[lang]}</p>
    </figure>
  );
}
