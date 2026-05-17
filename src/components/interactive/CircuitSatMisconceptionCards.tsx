import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { misconceptionCards, textFor } from "./circuitSatTrace";

export default function CircuitSatMisconceptionCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState(misconceptionCards[0].id);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT misconception cards", "Circuit-SAT 常见混淆卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Common confusions", "常见混淆")}</strong>
          <p>{textFor(lang, "Each repair keeps search, checking, and hardness claims separate.", "每个修正都把搜索、检查和困难性主张分开。")}</p>
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
    </section>
  );
}
