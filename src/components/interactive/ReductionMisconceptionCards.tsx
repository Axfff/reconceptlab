import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { invalidReductionCases, textFor, type InvalidReductionCase } from "./reductionTrace";

const titles = {
  "one-way-implication": {
    en: "One-way implication is not enough",
    zh: "单向蕴含不够"
  },
  "exponential-translator": {
    en: "Exponential translator",
    zh: "指数时间翻译器"
  },
  "solves-inside-translator": {
    en: "Solving inside the translator",
    zh: "在翻译器里先求解"
  },
  "wrong-hardness-arrow": {
    en: "Wrong hardness arrow",
    zh: "困难性箭头方向错误"
  },
  "solution-object-confusion": {
    en: "Solution object vs Yes/No answer",
    zh: "解对象 vs Yes/No 答案"
  }
} as const;

function InvalidStateVisual({ item, lang }: { item: InvalidReductionCase; lang: Locale }) {
  if (item.id === "one-way-implication") {
    return (
      <div className="reduction-mini-ledger" aria-label={textFor(lang, "Broken one-way implication rows", "损坏的单向蕴含行")}>
        {item.rows.map((row, index) => (
          <span key={index}>{row.sourceAnswer ? "Yes" : "No"} -&gt; {row.targetAnswer ? "Yes" : "No"}: {row.note[lang]}</span>
        ))}
      </div>
    );
  }

  if (item.id === "exponential-translator") {
    return (
      <div className="reduction-mini-ledger" aria-label={textFor(lang, "Invalid exponential translator state", "无效的指数翻译器状态")}>
        <span>{textFor(lang, "source size n", "源大小 n")} -&gt; {textFor(lang, "translator tries 2^n candidates", "翻译器尝试 2^n 个候选")}</span>
        <span>{textFor(lang, "target size: exponential", "目标大小：指数级")}</span>
        <span>{textFor(lang, "polynomial mapped size?", "映射后大小是多项式吗？")} {item.mappedInstanceSizeIsPolynomial ? textFor(lang, "Yes", "Yes") : textFor(lang, "No", "No")}</span>
      </div>
    );
  }

  if (item.id === "solves-inside-translator") {
    return (
      <div className="reduction-mini-ledger" aria-label={textFor(lang, "Invalid hidden source solver state", "无效的隐藏源求解器状态")}>
        <span>x in A -&gt; solveA(x)</span>
        <span>{textFor(lang, "hidden source solver before translation", "翻译前偷偷调用源问题求解器")}</span>
        <span>{textFor(lang, "invalid: f must translate, not solve A", "无效：f 应该翻译，而不是求解 A")}</span>
      </div>
    );
  }

  if (item.id === "wrong-hardness-arrow") {
    return (
      <div className="reduction-mini-ledger" aria-label={textFor(lang, "Invalid wrong hardness arrow state", "无效的困难性错误箭头状态")}>
        <span>{textFor(lang, "known doubted source", "已知被怀疑的源问题")}: {item.knownHardSource}</span>
        <span>{textFor(lang, "shown arrow", "显示的箭头")}: {item.notation}</span>
        <span>{textFor(lang, "attempted conclusion", "试图得到的结论")}: {item.attemptedTarget} {textFor(lang, "hard", "困难")}</span>
        <span>{textFor(lang, "valid conclusion?", "结论有效吗？")} {item.validConclusion ? textFor(lang, "Yes", "Yes") : textFor(lang, "No", "No")}</span>
      </div>
    );
  }

  return (
    <div className="reduction-mini-ledger" aria-label={textFor(lang, "Invalid solution object confusion state", "无效的解对象混淆状态")}>
      <span>{textFor(lang, "target solver output", "目标求解器输出")}: {textFor(lang, "witness object plus Yes", "见证对象加 Yes")}</span>
      <span>{textFor(lang, "reduction uses", "归约使用")}: Yes/No</span>
      <span>{textFor(lang, "not promised here", "这里未承诺")}: {textFor(lang, "mapping witness objects back", "把见证对象映射回来")}</span>
    </div>
  );
}

export default function ReductionMisconceptionCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState<string | null>("one-way-implication");

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Reduction misconception cards", "归约常见混淆卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Invalid shortcuts to reject", "需要排除的无效捷径")}</strong>
          <p>{textFor(lang, "A reduction needs both the answer-preservation contract and the polynomial-time translator contract.", "归约同时需要答案保持合约和多项式时间翻译器合约。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {invalidReductionCases.map((item) => {
          const open = openId === item.id;
          const panelId = `reduction-misconception-${item.id}`;
          return (
            <article key={item.id} className={`pnp-card exercise ${open ? "active" : ""}`}>
              <strong>{titles[item.id][lang]}</strong>
              {open ? (
                <div id={panelId} className="reduction-reveal-panel" role="region" aria-label={titles[item.id][lang]}>
                  <span className="reduction-status no">{item.violation}</span>
                  <p>{item.annotation[lang]}</p>
                  <InvalidStateVisual item={item} lang={lang} />
                </div>
              ) : (
                <span>{textFor(lang, "Reveal invalid state", "显示无效状态")}</span>
              )}
              <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)}>
                {open ? textFor(lang, "Hide invalid state", "隐藏无效状态") : textFor(lang, "Reveal invalid state", "显示无效状态")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
