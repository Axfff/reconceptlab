import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { practiceCards, textFor } from "./circuitSatTrace";

export default function CircuitSatPracticeCards({ lang }: { lang: Locale }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT practice cards", "Circuit-SAT 练习卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Practice the boundary", "练习边界")}</strong>
          <p>{textFor(lang, "Classify rows, malformed certificates, and the proved-versus-named claim ledger.", "区分行、格式错误证书，以及“已证明/只命名”的主张边界。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {practiceCards.map((card) => {
          const selected = answers[card.id];
          const selectedChoice = card.choices.find((choice) => choice.id === selected);
          return (
            <article key={card.id} className={`pnp-card exercise ${selectedChoice?.correct ? "accept" : selectedChoice ? "reject" : ""}`}>
              <strong>{card.prompt[lang]}</strong>
              <div className="pnp-tabs" aria-label={textFor(lang, "Answer choices", "答案选项")}>
                {card.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={selected === choice.id ? "active" : ""}
                    aria-pressed={selected === choice.id}
                    onClick={() => setAnswers({ ...answers, [card.id]: choice.id })}
                  >
                    {choice.label[lang]}
                  </button>
                ))}
              </div>
              <p aria-live="polite">
                {selectedChoice
                  ? `${selectedChoice.correct ? textFor(lang, "Correct.", "正确。") : textFor(lang, "Try again.", "再想想。")} ${card.explanation[lang]}`
                  : textFor(lang, "Choose an answer to check this item.", "选择一个答案来检查。")}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
