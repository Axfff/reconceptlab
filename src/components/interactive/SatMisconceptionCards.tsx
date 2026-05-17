import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { misconceptionCards, textFor, unsatContrastRows } from "./satTrace";

export default function SatMisconceptionCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState(misconceptionCards[0].id);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "SAT misconception cards", "SAT 常见混淆卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Common confusions", "常见混淆")}</strong>
          <p>{textFor(lang, "Each repair keeps failed rows, malformed rows, verifiers, and future reductions separate.", "每个修正都把失败行、格式错误行、验证器和后续归约分开。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {misconceptionCards.map((card) => {
          const open = openId === card.id;
          return (
            <article key={card.id} className={`pnp-card exercise ${open ? "active" : ""}`}>
              <button type="button" className="circuit-sat-card-button" onClick={() => setOpenId(open ? misconceptionCards[0].id : card.id)} aria-expanded={open}>
                <strong>{card.title[lang]}</strong>
              </button>
              <p>{card.misconception[lang]}</p>
              {open ? <p><strong>{textFor(lang, "Repair:", "修正：")}</strong> {card.repair[lang]}</p> : null}
            </article>
          );
        })}
      </div>
      <figure className="circuit-sat-figure">
        <figcaption>
          <strong>{textFor(lang, "Tiny unsatisfiable contrast", "极小不可满足对照")}</strong>
          <span>{textFor(lang, "psi = x1 AND NOT x1 is separate from the main satisfiable fixture phi.", "psi = x1 AND NOT x1 与主要的可满足示例 phi 分开。")}</span>
        </figcaption>
        <table className="pnp-mini-table">
          <thead>
            <tr><th>x1</th><th>psi</th><th>{textFor(lang, "why", "原因")}</th></tr>
          </thead>
          <tbody>
            {unsatContrastRows.map((row) => (
              <tr key={row.assignment}>
                <th scope="row">{row.assignment}</th>
                <td>false</td>
                <td>{row.note[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </section>
  );
}
