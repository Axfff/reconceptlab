import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { practiceCards, textFor } from "./npHardnessTrace";

export default function NpHardnessPracticeCards({ lang }: { lang: Locale }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "NP-hardness practice cards", "NP-hardness 练习卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Apply the node logic", "应用该节点的逻辑")}</strong>
          <p>{textFor(lang, "Use each selected card to check direction, quantifier, and class membership claims.", "用每张卡片检查方向、量词和类成员关系。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {practiceCards.map((card) => {
          const selected = answers[card.id];
          const selectedChoice = card.choices.find((choice) => choice.id === selected);
          return (
            <article key={card.id} className={`pnp-card exercise ${selectedChoice?.correct ? "accept" : selectedChoice ? "reject" : ""}`}>
              <strong>{card.prompt[lang]}</strong>
              <div className="pnp-tabs" aria-label={card.prompt[lang]}>
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
                  : textFor(lang, "Choose an answer to check this practice item.", "选择一个答案以检查此题。")}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

