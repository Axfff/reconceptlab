import type { Locale } from "../../i18n/locales";
import { membershipCases, textFor } from "./npHardnessTrace";

export default function MembershipVennCards({ lang }: { lang: Locale }) {
  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Membership relation cards", "成员关系卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Class placement preview", "类别位置预览")}</strong>
          <p>{textFor(lang, "A problem can be NP-hard without being in NP, and it can be in NP without being NP-hard.", "一个问题可 NP-hard 但未必 in NP，也可 in NP 但未必 NP-hard。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {membershipCases.map((membership) => (
          <article
            key={membership.id}
            className={`pnp-card ${membership.id === "np-complete" ? "exercise" : ""}`}
            aria-label={membership.label[lang]}
          >
            <strong>{membership.label[lang]}</strong>
            <span>
              {textFor(
                lang,
                `in NP: ${membership.inNp ? "Yes" : "No"} · NP-hard: ${membership.npHard ? "Yes" : "No"} · NP-complete: ${membership.npComplete ? "Yes" : "No"}`,
                `in NP: ${membership.inNp ? "是" : "否"} · NP-hard: ${membership.npHard ? "是" : "否"} · NP-complete: ${membership.npComplete ? "是" : "否"}`
              )}
            </span>
            <span>{membership.note[lang]}</span>
            <span>{membership.summary[lang]}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

