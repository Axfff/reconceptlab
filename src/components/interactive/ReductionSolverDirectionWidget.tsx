import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { directionCases, textFor } from "./reductionTrace";

type Choice = "A" | "B";

export default function ReductionSolverDirectionWidget({ lang }: { lang: Locale }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const direction = directionCases.find((item) => item.id === "algorithm-transfer");
  if (!direction || direction.id !== "algorithm-transfer") return null;

  const correct = choice === "B";
  const message = choice
    ? correct
      ? textFor(lang, "Correct: the reduction translates A instances into B instances, then calls the B solver.", "正确：归约把 A 的实例翻译成 B 的实例，然后调用 B 的求解器。")
      : textFor(lang, "Not quite: using an A solver would already solve the source problem. The point is to reuse a B solver.", "不太对：使用 A 的求解器等于已经能解源问题了。这里的重点是复用 B 的求解器。")
    : textFor(lang, "Choose the solver that the translated instance will be sent to.", "选择翻译后的实例要送去的那个求解器。");

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Reduction solver direction", "归约求解器方向")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Given A <=p B, which solver do you need?", "给定 A <=p B，需要哪个求解器？")}</strong>
          <p>{textFor(lang, "This is only algorithm transfer. Hardness arrows come later.", "这里先只讲算法转移。困难性箭头稍后再讲。")}</p>
        </div>
        <span className="pnp-badge">A &lt;=p B</span>
      </div>
      <div className="reduction-direction">
        <div className="reduction-card">
          <strong>{textFor(lang, "Source A", "源问题 A")}</strong>
          <span>{textFor(lang, "the instance we must answer", "需要回答的实例")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>f</strong>
          <span>{textFor(lang, "translate A to B", "把 A 翻译成 B")}</span>
        </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "Target B", "目标问题 B")}</strong>
          <span>{textFor(lang, "the translated instance", "翻译后的实例")}</span>
        </div>
      </div>
      <div className="pnp-tabs" aria-label={textFor(lang, "Solver choices", "求解器选项")}>
        <button type="button" className={choice === "A" ? "active" : ""} aria-pressed={choice === "A"} onClick={() => setChoice("A")}>
          {textFor(lang, "Choose A solver", "选择 A 求解器")}
        </button>
        <button type="button" className={choice === "B" ? "active" : ""} aria-pressed={choice === "B"} onClick={() => setChoice("B")}>
          {textFor(lang, "Choose B solver", "选择 B 求解器")}
        </button>
      </div>
      <p className={`reduction-feedback ${choice && correct ? "valid" : choice ? "invalid" : ""}`} aria-live="polite">{message}</p>
      <p className="reduction-note">{direction.conclusion[lang]}</p>
    </section>
  );
}
