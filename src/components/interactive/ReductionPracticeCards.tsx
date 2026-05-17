import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { practiceCards, textFor } from "./reductionTrace";

export default function ReductionPracticeCards({ lang }: { lang: Locale }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Reduction practice cards", "归约练习卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Practice the contract", "练习归约合约")}</strong>
          <p>{textFor(lang, "Each card uses one deterministic fixture from the page.", "每张卡都使用本页的一个确定性示例。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {practiceCards.map((card) => {
          const selected = answers[card.id];
          const selectedChoice = card.choices.find((choice) => choice.id === selected);
          return (
            <div key={card.id} className={`pnp-card ${selectedChoice?.correct ? "accept" : selectedChoice ? "reject" : ""}`}>
              <strong>{card.prompt[lang]}</strong>
              <div className="pnp-tabs" aria-label={textFor(lang, "Answer choices", "答案选项")}>
                {card.choices.map((choice) => (
                  <button key={choice.id} type="button" className={selected === choice.id ? "active" : ""} aria-pressed={selected === choice.id} onClick={() => setAnswers({ ...answers, [card.id]: choice.id })}>
                    {choice.label[lang]}
                  </button>
                ))}
              </div>
              <p aria-live="polite">
                {selectedChoice
                  ? `${selectedChoice.correct ? textFor(lang, "Correct.", "正确。") : textFor(lang, "Try again.", "再想想。")} ${card.explanation[lang]}`
                  : textFor(lang, "Choose an answer to reveal the check.", "选择一个答案后显示检查结果。")}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
