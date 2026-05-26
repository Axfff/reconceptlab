import type { Locale } from "../../i18n/locales";
import type { ReactNode } from "react";
import { bPlusTreeFixture, leafSplitTrace } from "./bPlusTreeTrace";

type BPlusFigureVariant =
  | "query-hook"
  | "btree-pain"
  | "anatomy"
  | "internal-vs-leaf"
  | "leaf-split"
  | "invariants"
  | "complexity"
  | "confusions"
  | "connection"
  | "exercise";

const labels = {
  en: {
    queryHook: "One index, two query shapes",
    btreePain: "B-tree reuse: shallow search, awkward scan",
    anatomy: "B+-tree anatomy",
    internalVsLeaf: "Guide key above, record below",
    leafSplit: "Leaf split copies a separator",
    invariants: "B+-tree invariants",
    complexity: "One descent, then a leaf walk",
    confusions: "Common confusions",
    connection: "Why B-tree comes first",
    exercise: "Prediction checks",
    guideOnly: "guide only",
    records: "records",
    leafLink: "leaf link"
  },
  zh: {
    queryHook: "一个索引，两种查询形状",
    btreePain: "复用 B 树：查找浅，扫描别扭",
    anatomy: "B+ 树结构",
    internalVsLeaf: "上层是导航键，下层才是记录",
    leafSplit: "叶子分裂会复制分隔键",
    invariants: "B+ 树不变量",
    complexity: "先下降一次，再沿叶子走",
    confusions: "常见混淆",
    connection: "为什么先学 B 树",
    exercise: "预测练习",
    guideOnly: "只导航",
    records: "记录",
    leafLink: "叶子链接"
  }
};

function RecordStrip({ keys }: { keys: number[] }) {
  return <div className="bplus-record-strip">{keys.map((key) => <span key={key}>{key}:v</span>)}</div>;
}

function TreeFixture({ lang, highlightLeaf, highlightGuide }: { lang: Locale; highlightLeaf?: string; highlightGuide?: number }) {
  const leaves = ["A", "B", "C"] as const;
  return (
    <div className="bplus-tree">
      <div className="bplus-internal">
        <span className="bplus-label">{labels[lang].guideOnly}</span>
        <div className="bplus-guide-strip">
          {bPlusTreeFixture.root.guideKeys.map((key) => <span className={key === highlightGuide ? "is-highlighted" : ""} key={key}>{key}</span>)}
        </div>
      </div>
      <div className="bplus-interval-row">
        {bPlusTreeFixture.root.childIntervals.map((interval) => <span key={interval.en}>{interval[lang]}</span>)}
      </div>
      <div className="bplus-leaf-row">
        {leaves.map((id, index) => (
          <div className={highlightLeaf === id ? "bplus-leaf is-highlighted" : "bplus-leaf"} key={id}>
            <span className="bplus-label">Leaf {id} · {labels[lang].records}</span>
            <RecordStrip keys={bPlusTreeFixture.leaves[id].records.map((record) => record.key)} />
            {index < leaves.length - 1 ? <small>{`${labels[lang].leafLink} ->`}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="bplus-figure">
      <figcaption><strong>{title}</strong></figcaption>
      {children}
      <BPlusTreeStyles />
    </figure>
  );
}

function QueryHook({ lang }: { lang: Locale }) {
  return (
    <Shell title={labels[lang].queryHook}>
      <div className="bplus-card-grid">
        <div className="bplus-card"><strong>{lang === "en" ? "Point lookup" : "点查找"}</strong><span>id = 42</span></div>
        <div className="bplus-card"><strong>{lang === "en" ? "Range scan" : "范围扫描"}</strong><span>{"20 <= key <= 60"}</span></div>
      </div>
      <p>{lang === "en" ? "A database-style index should find one record and also read neighboring records in order." : "数据库式索引既要找到单条记录，也要按顺序读取相邻记录。"}</p>
    </Shell>
  );
}

function BTreePain({ lang }: { lang: Locale }) {
  return (
    <Shell title={labels[lang].btreePain}>
      <div className="bplus-scattered">
        <div className="bplus-internal is-record"><span>30:v</span><span>60:v</span></div>
        <div className="bplus-leaf-row">
          <div className="bplus-leaf"><RecordStrip keys={[10, 20]} /></div>
          <div className="bplus-leaf"><RecordStrip keys={[40, 50]} /></div>
          <div className="bplus-leaf"><RecordStrip keys={[70, 80]} /></div>
        </div>
      </div>
      <p>{lang === "en" ? "If records can sit in internal nodes, a range scan mixes tree traversal with leaf visits instead of one clean leaf walk." : "如果记录可以放在内部节点，范围扫描会混合树遍历和叶访问，而不是一次顺畅的叶子行走。"}</p>
    </Shell>
  );
}

function LeafSplit({ lang }: { lang: Locale }) {
  const after = leafSplitTrace[1];
  return (
    <Shell title={labels[lang].leafSplit}>
      <div className="bplus-before-after">
        <div>
          <span className="bplus-label">{lang === "en" ? "before" : "之前"}</span>
          <RecordStrip keys={[30, 40, 50]} />
        </div>
        <div>
          <span className="bplus-label">{lang === "en" ? "after inserting 55" : "插入 55 后"}</span>
          <div className="bplus-guide-strip">{after.rootGuideKeys.map((key) => <span className={key === 50 ? "is-highlighted" : ""} key={key}>{key}</span>)}</div>
          <div className="bplus-leaf-row">
            {after.leaves.map((leaf) => <div className="bplus-leaf" key={leaf.id}><RecordStrip keys={leaf.records.map((record) => record.key)} /></div>)}
          </div>
        </div>
      </div>
      <p>{after.explanation[lang]}</p>
    </Shell>
  );
}

function Invariants({ lang }: { lang: Locale }) {
  const items = lang === "en"
    ? ["Internal keys are guide-only.", "All records live in leaves.", "All leaves stay at one depth.", "Leaf links preserve sorted order."]
    : ["内部键只负责导航。", "所有记录都存放在叶子中。", "所有叶子保持在同一深度。", "叶子链接保持有序。"];
  return (
    <Shell title={labels[lang].invariants}>
      <div className="bplus-two-col">
        <TreeFixture lang={lang} />
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </Shell>
  );
}

function Complexity({ lang }: { lang: Locale }) {
  return (
    <Shell title={labels[lang].complexity}>
      <div className="bplus-card-grid">
        <div className="bplus-card"><strong>O(log_B n)</strong><span>{lang === "en" ? "descend to the first leaf" : "下降到第一个叶子"}</span></div>
        <div className="bplus-card"><strong>+ k</strong><span>{lang === "en" ? "scan matching records/pages" : "扫描匹配记录/页"}</span></div>
      </div>
    </Shell>
  );
}

function Confusions({ lang }: { lang: Locale }) {
  const items = lang === "en"
    ? ["Guide key is not the payload record.", "Equality to 30 or 60 goes right.", "Leaf sibling links are not child pointers.", "Copying separator 50 does not remove record 50 from the leaf."]
    : ["导航键不是载荷记录。", "等于 30 或 60 时向右走。", "叶子兄弟链接不是子指针。", "复制分隔键 50 不会从叶子删除记录 50。"];
  return <Shell title={labels[lang].confusions}><div className="bplus-card-grid">{items.map((item) => <div className="bplus-card" key={item}>{item}</div>)}</div></Shell>;
}

function Connection({ lang }: { lang: Locale }) {
  return (
    <Shell title={labels[lang].connection}>
      <div className="bplus-graph-link"><span>B-tree</span><strong>{"->"}</strong><span>B+-tree</span></div>
      <p>{lang === "en" ? "B+-trees keep the page-based shallow tree, then specialize it for point lookup plus range access." : "B+ 树保留按页读取的浅树形状，再专门优化点查找和范围访问。"}</p>
    </Shell>
  );
}

function Exercise({ lang }: { lang: Locale }) {
  return (
    <Shell title={labels[lang].exercise}>
      <TreeFixture lang={lang} highlightGuide={60} highlightLeaf="C" />
      <p>{lang === "en" ? "Which leaf receives lookup 60, and why does equality go there?" : "查找 60 会进入哪个叶子？为什么相等时会去那里？"}</p>
    </Shell>
  );
}

export default function BPlusTreeAnatomyFigure({ lang, variant }: { lang: Locale; variant: BPlusFigureVariant }) {
  if (variant === "query-hook") return <QueryHook lang={lang} />;
  if (variant === "btree-pain") return <BTreePain lang={lang} />;
  if (variant === "anatomy") return <Shell title={labels[lang].anatomy}><TreeFixture lang={lang} /></Shell>;
  if (variant === "internal-vs-leaf") return <Shell title={labels[lang].internalVsLeaf}><TreeFixture lang={lang} highlightGuide={30} highlightLeaf="B" /></Shell>;
  if (variant === "leaf-split") return <LeafSplit lang={lang} />;
  if (variant === "invariants") return <Invariants lang={lang} />;
  if (variant === "complexity") return <Complexity lang={lang} />;
  if (variant === "confusions") return <Confusions lang={lang} />;
  if (variant === "connection") return <Connection lang={lang} />;
  return <Exercise lang={lang} />;
}

export function BPlusTreeStyles() {
  return (
    <style>{`
      .bplus-figure {
        margin: 1.4rem 0;
        padding: 1rem;
        border: 1px solid var(--color-border, #d8e2ef);
        border-radius: 8px;
        background: #ffffff;
        overflow-x: clip;
      }
      .bplus-figure figcaption {
        margin-bottom: .85rem;
      }
      .bplus-tree {
        display: grid;
        gap: .75rem;
        justify-items: center;
      }
      .bplus-internal {
        padding: .65rem;
        border: 1px solid #2f6fbd;
        border-radius: 8px;
        background: #eef6ff;
      }
      .bplus-internal.is-record {
        border-color: #d97706;
        background: #fff7ed;
      }
      .bplus-guide-strip, .bplus-record-strip, .bplus-leaf-row, .bplus-interval-row, .bplus-card-grid, .bplus-before-after, .bplus-graph-link {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
        align-items: center;
        justify-content: center;
      }
      .bplus-guide-strip span, .bplus-record-strip span {
        min-width: 2.4rem;
        padding: .28rem .45rem;
        border: 1px solid #2f6fbd;
        border-radius: 6px;
        background: #f8fbff;
        text-align: center;
        font-weight: 700;
      }
      .bplus-guide-strip .is-highlighted, .bplus-record-strip .is-highlighted, .bplus-leaf.is-highlighted {
        border-color: #d97706;
        background: #fff7ed;
      }
      .bplus-interval-row span, .bplus-card, .bplus-leaf {
        padding: .6rem;
        border: 1px solid #d8e2ef;
        border-radius: 8px;
        background: #fbfdff;
      }
      .bplus-leaf {
        display: grid;
        gap: .35rem;
      }
      .bplus-label, .bplus-leaf small {
        display: block;
        font-size: .78rem;
        color: #5b6472;
      }
      .bplus-two-col {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(12rem, .8fr);
        gap: 1rem;
        align-items: start;
      }
      .bplus-card {
        display: grid;
        gap: .25rem;
      }
      .bplus-graph-link span {
        padding: .55rem .75rem;
        border: 1px solid #2f6fbd;
        border-radius: 8px;
        background: #eef6ff;
        font-weight: 700;
      }
      @media (max-width: 760px) {
        .bplus-two-col {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
