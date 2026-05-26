import { useState } from "react";
import type { Locale } from "../../i18n/locales";

const copy = {
  en: {
    title: "PCA common confusions",
    aria: "PCA misconception cards",
    reveal: "Reveal"
  },
  zh: {
    title: "PCA 常见混淆",
    aria: "PCA 常见混淆卡片",
    reveal: "展开"
  }
};

const cards = [
  {
    id: "labels",
    title: { en: "PCA does not read labels", zh: "PCA 不读取标签" },
    body: {
      en: "It is unsupervised: class names or target values do not affect the chosen directions.",
      zh: "它是无监督的（unsupervised）：类别名或目标值不会影响选出的方向。"
    }
  },
  {
    id: "sign",
    title: { en: "A sign flip is not a new component", zh: "符号翻转不是新主成分" },
    body: {
      en: "A direction and its opposite are the same PCA line; only the coordinate signs change.",
      zh: "一个方向和它的反方向是同一条 PCA 线；变化的只是坐标符号。"
    }
  },
  {
    id: "prediction",
    title: { en: "High variance is not prediction value", zh: "高方差不等于预测价值" },
    body: {
      en: "PCA keeps spread, not usefulness for a supervised prediction task.",
      zh: "PCA 保留扩散程度，而不是为监督预测任务挑选最有用的方向。"
    }
  },
  {
    id: "manifold",
    title: { en: "PCA is not a curved-manifold method", zh: "PCA 不是弯曲流形方法" },
    body: {
      en: "It is linear: it rotates and projects a flat coordinate system, so it does not unfold curved surfaces.",
      zh: "它是线性的（linear）：只旋转并投影一个平直坐标系，不会展开弯曲曲面。"
    }
  },
  {
    id: "scale",
    title: { en: "Feature scaling matters", zh: "特征尺度很重要" },
    body: {
      en: "Changing units can change covariance and rotate the principal components.",
      zh: "改变单位会改变协方差（covariance），从而可能旋转主成分（principal component）。"
    }
  }
];

export default function PcaMisconceptionCards({ lang }: { lang: Locale }) {
  const labels = copy[lang];
  const [openId, setOpenId] = useState(cards[0].id);
  return (
    <section className="circuit-sat-demo" aria-label={labels.aria}>
      <p className="state-label">{labels.title}</p>
      <div className="pnp-card-grid">
        {cards.map((card) => {
          const open = card.id === openId;
          return (
            <button
              key={card.id}
              type="button"
              className={`pnp-card exercise ${open ? "active" : ""}`}
              onClick={() => setOpenId(open ? "" : card.id)}
              aria-expanded={open}
            >
              <strong>{card.title[lang]}</strong>
              <span>{labels.reveal}</span>
              {open ? <p>{card.body[lang]}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

