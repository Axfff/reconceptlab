import type { Locale } from "../../i18n/locales";
import { textFor } from "./circuitSatTrace";

export default function CircuitSatGraphStrip({ lang }: { lang: Locale }) {
  const nodes = [
    {
      id: "p-vs-np",
      label: textFor(lang, "P vs NP", "P 与 NP"),
      note: textFor(lang, "certificates and verifiers", "证书与验证器"),
      active: true
    },
    {
      id: "np-hardness",
      label: "NP-Hardness",
      note: textFor(lang, "source-problem role", "源问题角色"),
      active: true
    },
    {
      id: "circuit-sat",
      label: textFor(lang, "Circuit-SAT", "电路可满足性"),
      note: textFor(lang, "first concrete source", "第一个具体源"),
      active: true
    },
    {
      id: "sat-preview",
      label: "SAT",
      note: textFor(lang, "future conversion, not linked yet", "后续转换，暂不链接"),
      active: false
    }
  ];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Local graph position", "局部图谱位置")}</strong>
        <span>{textFor(lang, "The existing graph stops at real nodes. Future SAT reductions are shown as faded preview context only.", "真实图谱只连接已经存在的节点。未来的 SAT 归约仅以淡化预告显示。")}</span>
      </figcaption>
      <div className="circuit-sat-graph-strip">
        {nodes.map((node, index) => (
          <div key={node.id} className={node.active ? "active" : "future"}>
            <span>{index > 0 ? "->" : ""}</span>
            <strong>{node.label}</strong>
            <p>{node.note}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
