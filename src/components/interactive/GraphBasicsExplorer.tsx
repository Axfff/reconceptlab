import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { adjacency, roomLabel, rooms, undirectedEdges, type RoomId } from "./graphBasicsTrace";

const labels = {
  en: {
    title: "Neighbor inspector",
    intro: "Select a room to see only the one-step neighbors an algorithm can inspect next.",
    selected: "Selected",
    neighbors: "One-step neighbors",
    none: "none",
    reset: "Reset",
    aria: "Interactive graph basics neighbor inspector"
  },
  zh: {
    title: "邻居检查器",
    intro: "选择一个房间，只查看算法下一步能检查的一步邻居。",
    selected: "选中",
    neighbors: "一步邻居",
    none: "无",
    reset: "重置",
    aria: "图基础的交互式邻居检查器"
  }
};

export default function GraphBasicsExplorer({ lang }: { lang: Locale }) {
  const [selected, setSelected] = useState<RoomId>("hall");
  const selectedNeighbors = adjacency[selected];
  const neighborSet = useMemo(() => new Set(selectedNeighbors), [selectedNeighbors]);

  return (
    <section className="graph-basics-explorer" aria-label={labels[lang].aria}>
      <div className="demo-grid">
        <svg viewBox="0 0 360 245" role="img" aria-label={`${roomLabel(selected, lang)}: ${selectedNeighbors.map((id) => roomLabel(id, lang)).join(", ")}`}>
          {undirectedEdges.map(([from, to]) => {
            const start = rooms.find((room) => room.id === from)!;
            const end = rooms.find((room) => room.id === to)!;
            const active = from === selected || to === selected;
            return <line key={`${from}-${to}`} className={active ? "active" : ""} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
          })}
          {rooms.map((room) => {
            const status = room.id === selected ? "selected" : neighborSet.has(room.id) ? "neighbor" : "waiting";
            return (
              <g key={room.id} transform={`translate(${room.x}, ${room.y})`}>
                <circle className={status} r="24" />
                <text textAnchor="middle" y="4">{room.label[lang]}</text>
                <title>{`${room.label[lang]}: ${status}`}</title>
              </g>
            );
          })}
        </svg>

        <div className="state-panel">
          <p className="state-label">{labels[lang].title}</p>
          <p>{labels[lang].intro}</p>
          <div className="gb-button-list" role="list" aria-label={labels[lang].title}>
            {rooms.map((room) => (
              <button key={room.id} type="button" className={room.id === selected ? "active" : ""} onClick={() => setSelected(room.id)}>
                {room.label[lang]}
              </button>
            ))}
          </div>
          <p aria-live="polite">
            <strong>{labels[lang].selected}:</strong> {roomLabel(selected, lang)}
          </p>
          <div className="queue">
            <strong>{labels[lang].neighbors}:</strong>
            {selectedNeighbors.length > 0 ? selectedNeighbors.map((id) => <span key={id}>{roomLabel(id, lang)}</span>) : <span>{labels[lang].none}</span>}
          </div>
          <div className="gb-adjacency compact">
            <div className="highlighted">
              <strong>{roomLabel(selected, lang)}</strong>
              <span>{selectedNeighbors.map((id) => roomLabel(id, lang)).join(", ")}</span>
            </div>
          </div>
          <div className="controls">
            <button type="button" onClick={() => setSelected("hall")}>{labels[lang].reset}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
