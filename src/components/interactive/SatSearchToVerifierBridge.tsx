import type { Locale } from "../../i18n/locales";
import { textFor } from "./satTrace";

export default function SatSearchToVerifierBridge({ lang }: { lang: Locale }) {
  const highlighted = "1010";

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Existence search becomes one certificate check", "存在性搜索变成一次证书检查")}</strong>
        <span>{textFor(lang, "A certificate is evidence for a Yes instance, not a method for finding the evidence.", "证书是 Yes 实例的证据，不是找到证据的方法。")}</span>
      </figcaption>
      <div className="circuit-sat-bridge">
        <div className="circuit-sat-row-grid compact" aria-label={textFor(lang, "Candidate rows", "候选行")}>
          {["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"].map((row) => (
            <span key={row} className={row === highlighted ? "active accept" : ""}>{row}</span>
          ))}
        </div>
        <div className="circuit-sat-arrow-card">{"->"}</div>
        <div className="circuit-sat-result-card accept">
          <strong>{textFor(lang, "chosen certificate", "被选中的证书")}: {highlighted}</strong>
          <span>{textFor(lang, "check only this assignment", "只检查这个赋值")}</span>
          <p>{textFor(lang, "If phi becomes true, the instance is Yes. If this row fails, only this certificate failed.", "如果 phi 变为真，则实例是 Yes。如果这一行失败，只说明这个证书失败。")}</p>
        </div>
      </div>
    </figure>
  );
}
