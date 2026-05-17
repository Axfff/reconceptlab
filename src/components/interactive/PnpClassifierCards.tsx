import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { classifierItems, textFor } from "./pnpTrace";

export default function PnpClassifierCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState<string | null>(classifierItems[0].id);

  return (
    <section className="pnp-demo" aria-label={textFor(lang, "P vs NP classifier exercises", "P 与 NP 分类练习")}>
      <div className="pnp-card-grid">
        {classifierItems.map((item) => {
          const open = openId === item.id;
          return (
            <button key={item.id} type="button" className={`pnp-card exercise ${open ? "active" : ""}`} onClick={() => setOpenId(open ? null : item.id)} aria-expanded={open}>
              <strong>{item.prompt[lang]}</strong>
              {open ? <p>{item.answer[lang]}</p> : <span>{textFor(lang, "Reveal reason", "显示理由")}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
