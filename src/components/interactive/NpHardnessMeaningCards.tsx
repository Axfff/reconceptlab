import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { textFor } from "./npHardnessTrace";

const meanings = {
  "big-instance": {
    en: {
      title: "Big instance with big input size",
      prompt: "A giant-looking input is hard.",
      reveal: "Hardness is not an input-size snapshot; it is a property of a decision problem family and reductions."
    },
    zh: {
      title: "一个大输入就代表困难",
      prompt: "一个看起来很大很大的输入就是困难。",
      reveal: "困难性不是单个输入大小。它是关于问题族和归约可比关系。"
    }
  },
  "candidates": {
    en: {
      title: "Too many candidates",
      prompt: "If brute force checks many candidates, the problem is NP-hard.",
      reveal: "Search cost and existence of many candidates matter for complexity, but NP-hardness is framed by reductions."
    },
    zh: {
      title: "候选太多",
      prompt: "如果暴力枚举候选很多，那么它就 NP-hard。",
      reveal: "候选数量说明算法复杂度，但 NP-hardness 是用归约关系来定义的。"
    }
  },
  "no-fast-algo": {
    en: {
      title: "No known polynomial algorithm",
      prompt: "No known fast algorithm proves NP-hard.",
      reveal: "Not-knowing a fast algorithm is a claim about current knowledge; NP-hardness is a formal reduction claim."
    },
    zh: {
      title: "找不到快算法",
      prompt: "还没找到快速算法就能证明 NP-hard。",
      reveal: "是否找到快算法是知识状态；NP-hardness 需要正式的归约链。"
    }
  }
} as const;

export default function NpHardnessMeaningCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState<keyof typeof meanings | null>("big-instance");

  return (
    <section className="reduction-demo" aria-label={textFor(lang, "Naive hardness meanings", "“困难”朴素含义")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Naive meanings of 'hard' that do not define NP-hard", "先修正“困难”这些朴素含义")}</strong>
          <p>{textFor(lang, "Choose a card to see why each intuition fails the formal goal.", "点开卡片看每个直觉为何与正式目标不一致。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {(Object.entries(meanings) as Array<[keyof typeof meanings, (typeof meanings)[keyof typeof meanings]]>).map(([id, item]) => {
          const open = openId === id;
          const panelId = `np-hardness-meaning-${id}`;
          return (
            <article key={id} className={`pnp-card exercise ${open ? "active" : ""}`}>
              <strong>{item[lang].title}</strong>
              <span>{item[lang].prompt}</span>
              {open ? (
                <p id={panelId} role="region" aria-label={item[lang].title}>
                  {textFor(lang, item[lang].reveal, item[lang].reveal)}
                </p>
              ) : null}
              <button
                type="button"
                className="pnp-badge"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : id)}
              >
                {open ? textFor(lang, "Hide why", "收起原因") : textFor(lang, "Reveal why", "展开原因")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
