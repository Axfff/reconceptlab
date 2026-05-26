import type { Locale } from "../../i18n/locales";

const copy = {
  en: {
    title: "Where PCA spends work",
    summary: "Use n for rows, d for original features, and k for kept components.",
    aria: "PCA complexity cards"
  },
  zh: {
    title: "PCA 的计算量花在哪里",
    summary: "用 n 表示行数，d 表示原始特征数，k 表示保留的主成分数。",
    aria: "PCA 复杂度卡片"
  }
};

const cards = [
  {
    label: { en: "Centering", zh: "中心化" },
    cost: "O(nd)",
    note: { en: "touch every table entry once", zh: "每个表格项都处理一次" }
  },
  {
    label: { en: "Covariance", zh: "协方差" },
    cost: "O(nd^2)",
    note: { en: "compare every feature pair across rows", zh: "跨行比较每一对特征" }
  },
  {
    label: { en: "Full eigendecomposition", zh: "完整特征分解" },
    cost: "O(d^3)",
    note: { en: "often expensive when feature count grows", zh: "特征数变大时常常昂贵" }
  },
  {
    label: { en: "Projection", zh: "投影" },
    cost: "O(ndk)",
    note: { en: "multiply each row by k directions", zh: "每一行乘以 k 个方向" }
  }
];

export default function PcaCostFigure({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  return (
    <figure className="circuit-sat-demo">
      <figcaption>
        <span>{labels.title}</span>
        {labels.summary}
      </figcaption>
      <div className="pnp-card-grid" role="list" aria-label={labels.aria}>
        {cards.map((card, index) => (
          <article
            key={card.cost}
            className={`pnp-card ${index === 2 ? "reject" : index === 3 ? "accept" : ""}`}
            role="listitem"
            style={{ display: "grid", gap: "6px", minWidth: 0 }}
          >
            <strong style={{ display: "block", overflowWrap: "anywhere" }}>{card.label[lang]}</strong>
            <output style={{ display: "block", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{card.cost}</output>
            <p>{card.note[lang]}</p>
          </article>
        ))}
      </div>
    </figure>
  );
}
