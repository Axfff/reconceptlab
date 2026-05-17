import type { Locale } from "../../i18n/locales";
import { pathEncodingExample, textFor, yesNo } from "./reductionTrace";

type Variant = "hook" | "formal" | "pain";

const copy: Record<Variant, Record<Locale, { title: string; summary: string }>> = {
  hook: {
    en: {
      title: "Use the solver you already have",
      summary: "I have a solver for adjacency maps. Do I need a new solver for edge lists?"
    },
    zh: {
      title: "使用已有的求解器",
      summary: "我已经有邻接表求解器。遇到边列表输入时，是否一定要重新写一个求解器？"
    }
  },
  formal: {
    en: {
      title: "The reduction is the translator f",
      summary: "For every source instance x, f(x) is a target instance with the same Yes/No answer."
    },
    zh: {
      title: "归约就是翻译器 f",
      summary: "对每个源实例 x，f(x) 都是一个 Yes/No 答案相同的目标实例。"
    }
  },
  pain: {
    en: {
      title: "Do not solve A from scratch if B already solves the translated instance",
      summary: "The reduction lets a source instance travel through a target solver."
    },
    zh: {
      title: "如果 B 能解翻译后的实例，就不必从零求解 A",
      summary: "归约让源实例经过目标问题求解器。"
    }
  }
};

function mapText(map: Record<string, string[]>) {
  return `{ ${Object.entries(map)
    .map(([node, neighbors]) => `${node}: [${neighbors.join(", ")}]`)
    .join(", ")} }`;
}

export default function PathEncodingTranslatorFigure({ lang, variant = "hook" }: { lang: Locale; variant?: Variant }) {
  const figureCopy = copy[variant][lang];
  const edgeList = `[${pathEncodingExample.edgeList.map(([from, to]) => `(${from},${to})`).join(", ")}]`;
  const question = `${pathEncodingExample.source} -> ${pathEncodingExample.target}?`;

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{figureCopy.title}</strong>
        <span>{figureCopy.summary}</span>
      </figcaption>
      <div className="reduction-pipeline" aria-label={pathEncodingExample.caption[lang]}>
        <div className="reduction-card">
          <strong>{textFor(lang, "Source A: HasPathPairList", "源问题 A：HasPathPairList")}</strong>
          <code>{edgeList}</code>
          <span>{textFor(lang, "Question", "问题")}: {question}</span>
          <b>{textFor(lang, "source", "源问题")} {yesNo(pathEncodingExample.answer, lang)}</b>
        </div>
        <div className="reduction-arrow-card active">
          <strong>f</strong>
          <span>{textFor(lang, "group outgoing neighbors", "按出邻居分组")}</span>
          <span>{textFor(lang, "polynomial translator", "多项式时间翻译器")}</span>
        </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "Target B: HasPathAdjacencyMap", "目标问题 B：HasPathAdjacencyMap")}</strong>
          <code>{mapText(pathEncodingExample.adjacencyMap)}</code>
          <span>{textFor(lang, "Same question", "同一个问题")}: {question}</span>
          <b>{textFor(lang, "target", "目标问题")} {yesNo(pathEncodingExample.answer, lang)}</b>
        </div>
        <div className="reduction-arrow-card solved">
          <strong>{textFor(lang, "B solver", "B 求解器")}</strong>
          <span>{yesNo(pathEncodingExample.answer, lang)}</span>
          <span>{textFor(lang, "same question, different encoding", "同一个问题，不同编码")}</span>
        </div>
      </div>
    </figure>
  );
}
