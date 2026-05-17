import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { invalidCases, textFor } from "./npHardnessTrace";

export default function NpHardnessMisconceptionCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState<string | null>(invalidCases[0].id);

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "NP-hardness misconceptions", "NP-hardness 常见误区")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Invalid claims to reject", "需要排除的错误说法")}</strong>
          <p>{textFor(lang, "These patterns look natural, but each fails the formal definition.", "这些说法很自然，但每一个都不符合严格定义。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {invalidCases.map((item) => {
          const open = openId === item.id;
          const panelId = `np-hardness-misconception-${item.id}`;
          return (
            <article key={item.id} className={`pnp-card exercise ${open ? "active" : ""}`}>
              <strong>{item.title[lang]}</strong>
              {open ? (
                <div id={panelId} className="reduction-mini-ledger" role="region" aria-label={item.title[lang]}>
                  <span className="reduction-status no">{textFor(lang, "conclusion", "结论")}: {item.conclusion[lang]}</span>
                  <p>{item.summary[lang]}</p>
                  <p>{item.evidence[lang]}</p>
                  <p>{item.explanation[lang]}</p>
                </div>
              ) : (
                <span>{textFor(lang, "Reveal why this is wrong", "展开并看为什么不对")}</span>
              )}
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                {open ? textFor(lang, "Hide detail", "收起细节") : textFor(lang, "Reveal detail", "展开细节")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

