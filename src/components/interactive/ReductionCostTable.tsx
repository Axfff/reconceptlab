import type { Locale } from "../../i18n/locales";
import { costState, textFor } from "./reductionTrace";

export default function ReductionCostTable({ lang }: { lang: Locale }) {
  const rows = [5, 10, 30].map(costState);

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Polynomial translator plus polynomial solver stays polynomial", "多项式翻译器加多项式求解器仍是多项式")}</strong>
        <span>{textFor(lang, "This simple model keeps target size <= n^2, translator work n^2, and target solver time targetSize^3.", "这个简单模型保持目标大小 <= n^2，翻译工作量为 n^2，目标求解时间为 targetSize^3。")}</span>
      </figcaption>
      <table className="pnp-mini-table reduction-table">
        <thead>
          <tr>
            <th>n</th>
            <th>{textFor(lang, "translator work", "翻译工作量")}</th>
            <th>{textFor(lang, "target encoding length", "目标编码长度")}</th>
            <th>{textFor(lang, "target solver time", "目标求解时间")}</th>
            <th>{textFor(lang, "combined time", "组合时间")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sourceEncodingLength}>
              <th scope="row">{row.sourceEncodingLength}</th>
              <td>{row.translatorWork.toLocaleString()}</td>
              <td>{row.targetEncodingLength.toLocaleString()}</td>
              <td>{row.targetSolverTime.toLocaleString()}</td>
              <td>{row.combinedTime.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="reduction-badge-row">
        <span className="pnp-badge">{textFor(lang, "mapped size is polynomially bounded", "映射后大小有多项式上界")}</span>
        <span className="pnp-badge">{textFor(lang, "n^2 + (n^2)^3 = n^2 + n^6", "n^2 + (n^2)^3 = n^2 + n^6")}</span>
      </div>
    </figure>
  );
}
