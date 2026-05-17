import type { Locale } from "../../i18n/locales";
import { textFor } from "./satTrace";

export default function SatGraphStrip({ lang }: { lang: Locale }) {
  const nodes = [
    {
      id: "p-vs-np",
      label: textFor(lang, "P vs NP", "P 与 NP"),
      note: textFor(lang, "certificates and verifiers", "证书与验证器"),
      active: true
    },
    {
      id: "circuit-sat",
      label: textFor(lang, "Circuit-SAT", "电路可满足性"),
      note: textFor(lang, "same assignment question on circuits", "电路上的同类赋值问题"),
      active: true
    },
    {
      id: "sat",
      label: textFor(lang, "Boolean Satisfiability (SAT)", "布尔可满足性（SAT）"),
      note: textFor(lang, "formula version, implemented node", "公式版本，已实现节点"),
      active: true
    },
    {
      id: "cnf-3sat-preview",
      label: "CNF / 3SAT",
      note: textFor(lang, "later normal-form nodes", "后续范式节点"),
      active: false
    }
  ];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Local graph position", "局部图谱位置")}</strong>
        <span>{textFor(lang, "Only existing nodes are graph links; future normal forms are faded context.", "只有已存在的节点作为图谱链接；未来范式以淡化背景显示。")}</span>
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
