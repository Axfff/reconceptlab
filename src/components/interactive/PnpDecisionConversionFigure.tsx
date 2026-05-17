import type { Locale } from "../../i18n/locales";
import { textFor } from "./pnpTrace";

export default function PnpDecisionConversionFigure({ lang }: { lang: Locale }) {
  return (
    <figure className="pnp-figure">
      <figcaption>
        <strong>{textFor(lang, "Turn an object-finding task into Yes/No", "把找对象任务转成 Yes/No")}</strong>
        <span>{textFor(lang, "Complexity classes talk about decision problems, but real tasks can often be phrased with a threshold.", "复杂度类讨论判定问题，但真实任务常能用阈值表达。")}</span>
      </figcaption>
      <div className="pnp-flow">
        <div><strong>{textFor(lang, "Optimization", "优化问题")}</strong><span>{textFor(lang, "Find the shortest route from A to B.", "找到从 A 到 B 的最短路线。")}</span></div>
        <div><strong>{textFor(lang, "Decision", "判定问题")}</strong><span>{textFor(lang, "Is there a route from A to B with length <= K?", "是否存在一条从 A 到 B 且长度 <= K 的路线？")}</span></div>
        <div><strong>{textFor(lang, "Certificate", "证书")}</strong><span>{textFor(lang, "A proposed route; sum its edges and compare with K.", "一条候选路线；把边长相加并与 K 比较。")}</span></div>
      </div>
    </figure>
  );
}
