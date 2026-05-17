import type { Locale } from "../../i18n/locales";
import { textFor } from "./pnpTrace";

export default function PnpSetDiagram({ lang }: { lang: Locale }) {
  return (
    <figure className="pnp-figure">
      <figcaption>
        <strong>{textFor(lang, "P is known to be inside NP", "已知 P 在 NP 内部")}</strong>
        <span>{textFor(lang, "The unknown part is whether the boundary collapses.", "未知的是这个边界是否会消失。")}</span>
      </figcaption>
      <svg className="pnp-set" viewBox="0 0 520 260" role="img" aria-label={textFor(lang, "Set diagram showing P inside NP and open question P equals NP", "集合图：P 在 NP 内，P 是否等于 NP 是开放问题")}>
        <ellipse className="np" cx="260" cy="130" rx="210" ry="100" />
        <ellipse className="p" cx="220" cy="130" rx="105" ry="54" />
        <text x="110" y="80">NP</text>
        <text x="190" y="136">P</text>
        <text x="315" y="132">P = NP?</text>
        <text className="pnp-note" x="106" y="218">{textFor(lang, "NP-hard appears later; do not place it here yet.", "NP-hard 后面再讲；这里先不要把它放进图里。")}</text>
      </svg>
    </figure>
  );
}
