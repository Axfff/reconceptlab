import type { Locale } from "../../i18n/locales";
import { textFor } from "./npHardnessTrace";

export default function NpHardnessTransitivityBridge({ lang }: { lang: Locale }) {
  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Transitivity bridge for practical proofs", "实操中的传递性桥梁")}</strong>
        <span>{textFor(lang, "Later proofs often start with one known NP-hard source A, then show A <=p H.", "后续证明通常先拿到一个已知 NP-hard 的 A，再证明 A <=p H。")}</span>
      </figcaption>
      <div className="reduction-chain">
        <div className="reduction-card solved">
          <strong>{textFor(lang, "Known premise", "已知前提")}</strong>
          <span>{textFor(lang, "forall L in NP, L <=p A", "∀ L in NP, L <=p A")}</span>
          <span>{textFor(lang, "This gives universal source coverage to A.", "这给 A 一个完整的 NP 覆盖。")}</span>
        </div>
        <div className="reduction-arrow-card active">
          <strong>{"A <=p H"}</strong>
          <span>{textFor(lang, "single transfer fact to prove", "需证明的单条传递事实")}</span>
        </div>
        <div className="reduction-card active">
          <strong>{textFor(lang, "Combined conclusion", "合成结论")}</strong>
          <span>{textFor(lang, "∀ L in NP, L <=p H", "∀ L in NP, L <=p H")}</span>
          <span>{textFor(lang, "No need to redraw all L at proof time.", "实操中不必再次重画所有源问题。")}</span>
        </div>
      </div>
    </figure>
  );
}
