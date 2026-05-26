import type { Locale } from "../../i18n/locales";
import type { ReactNode } from "react";
import { beforeNonRootSplitTree, finalTree, type BTreeNode } from "./bTreeTrace";

type BTreeFigureVariant =
  | "page-read"
  | "sorted-array-pain"
  | "bst-pain"
  | "node-anatomy"
  | "minimum-degree"
  | "easy-insert"
  | "root-growth"
  | "invariants"
  | "complexity"
  | "confusions"
  | "connection"
  | "exercise";

const text = {
  en: {
    pageReadTitle: "Read one page, get several keys",
    sortedArrayTitle: "Sorted array search is neat; insertion shifts pages",
    bstTitle: "One key per node can mean one page per comparison",
    anatomyTitle: "A B-tree node is a sorted page plus child ranges",
    minimumTitle: "Minimum degree t = 2",
    easyInsertTitle: "Easy insert: leaf still has room",
    rootGrowthTitle: "A root split grows upward",
    invariantsTitle: "The promises that must stay true",
    complexityTitle: "High fanout keeps the tree shallow",
    confusionsTitle: "Terms to keep separate",
    connectionTitle: "Next: B+-tree",
    exerciseTitle: "Prediction checks",
    keyRecord: "key + record pointer",
    childRange: "child range",
    root: "root",
    leaf: "leaf",
    before: "before",
    after: "after"
  },
  zh: {
    pageReadTitle: "读取一页，同时得到多个键",
    sortedArrayTitle: "有序数组查找清楚；插入会跨页搬移",
    bstTitle: "每个节点一个键，可能每次比较都读一页",
    anatomyTitle: "B 树节点是一页有序键加多个子范围",
    minimumTitle: "最小度数 t = 2",
    easyInsertTitle: "简单插入：叶子仍有空间",
    rootGrowthTitle: "根分裂让树向上长高",
    invariantsTitle: "必须保持的承诺",
    complexityTitle: "高扇出让树保持很浅",
    confusionsTitle: "容易混淆的术语",
    connectionTitle: "下一站：B+ 树",
    exerciseTitle: "预测练习",
    keyRecord: "键 + 记录指针",
    childRange: "子范围",
    root: "根",
    leaf: "叶子",
    before: "之前",
    after: "之后"
  }
};

function KeyStrip({ keys, highlight }: { keys: number[]; highlight?: number }) {
  return (
    <div className="btree-key-strip">
      {keys.map((key) => (
        <span className={key === highlight ? "is-highlighted" : ""} key={key}>
          {key}
        </span>
      ))}
    </div>
  );
}

function TreeNode({ node, lang, highlightNodeIds = [], highlightKey }: { node: BTreeNode; lang: Locale; highlightNodeIds?: string[]; highlightKey?: number }) {
  const highlighted = highlightNodeIds.includes(node.id);
  return (
    <div className="btree-tree-unit">
      <div className={`btree-page ${highlighted ? "is-highlighted" : ""}`}>
        <span className="btree-page-label">{node.leaf ? text[lang].leaf : text[lang].root}</span>
        <KeyStrip keys={node.keys} highlight={highlightKey} />
        <span className="btree-page-note">{text[lang].keyRecord}</span>
      </div>
      {node.children ? (
        <div className="btree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} lang={lang} highlightNodeIds={highlightNodeIds} highlightKey={highlightKey} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FigureShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="btree-figure">
      <figcaption>
        <strong>{title}</strong>
      </figcaption>
      {children}
      <BTreeFigureStyles />
    </figure>
  );
}

function PageRead({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].pageReadTitle}>
      <div className="btree-page-strip" aria-label={lang === "en" ? "Catalog keys grouped into pages" : "按页分组的目录键"}>
        {[["5", "10", "20"], ["30", "35", "40"], ["50", "60", "70"]].map((page, index) => (
          <div className={index === 1 ? "btree-page is-highlighted" : "btree-page"} key={page.join("-")}>
            <span className="btree-page-label">{lang === "en" ? `page ${index + 1}` : `第 ${index + 1} 页`}</span>
            <div className="btree-key-strip">{page.map((key) => <span key={key}>{key}</span>)}</div>
          </div>
        ))}
      </div>
      <p>{lang === "en" ? "A page/block read brings a whole chunk into memory, so fewer tree levels often means fewer expensive reads." : "页/块读取会一次带入一整块数据，因此树层数越少，通常昂贵读取次数越少。"}</p>
    </FigureShell>
  );
}

function SortedArrayPain({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].sortedArrayTitle}>
      <div className="btree-before-after">
        <div>
          <span className="btree-page-label">{text[lang].before}</span>
          <div className="btree-page-strip">
            <KeyStrip keys={[10, 20, 30]} />
            <KeyStrip keys={[40, 50, 60]} />
          </div>
        </div>
        <div>
          <span className="btree-page-label">{text[lang].after}</span>
          <div className="btree-page-strip">
            <KeyStrip keys={[10, 20, 30]} />
            <KeyStrip keys={[35, 40, 50]} highlight={35} />
            <KeyStrip keys={[60]} />
          </div>
        </div>
      </div>
      <p>{lang === "en" ? "Binary search is fast, but inserting 35 can push later records across page boundaries." : "二分查找很快，但插入 35 可能把后面的记录推过页边界。"}</p>
    </FigureShell>
  );
}

function BstPain({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].bstTitle}>
      <div className="btree-compare-row">
        <ol className="btree-path">
          {[10, 20, 30, 40, 50].map((key, index) => (
            <li key={key}><span>{key}</span><small>{lang === "en" ? `read ${index + 1}` : `读取 ${index + 1}`}</small></li>
          ))}
        </ol>
        <div className="btree-page is-highlighted">
          <span className="btree-page-label">B-tree page</span>
          <KeyStrip keys={[10, 20, 30, 40, 50]} />
        </div>
      </div>
      <p>{lang === "en" ? "A binary search tree fixes local insertion, but page reads pile up when the path is tall." : "二叉搜索树让局部插入更容易，但路径很高时页读取会堆起来。"}</p>
    </FigureShell>
  );
}

function NodeAnatomy({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].anatomyTitle}>
      <div className="btree-anatomy">
        <div className="btree-page is-highlighted">
          <span className="btree-page-label">{text[lang].root}</span>
          <KeyStrip keys={[20, 40, 60]} />
        </div>
        {["<20", "20..40", "40..60", ">60"].map((range) => (
          <div className="btree-range" key={range}>{range}<small>{text[lang].childRange}</small></div>
        ))}
      </div>
      <p>{lang === "en" ? "The keys divide the space into four child ranges. In this B-tree, internal keys also carry records or pointers." : "这些键把空间分成四个子范围。在本页的 B 树中，内部键也携带记录或指针。"}</p>
    </FigureShell>
  );
}

function MinimumDegree({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].minimumTitle}>
      <div className="btree-ruler">
        <div><strong>t - 1</strong><span>{lang === "en" ? "min keys in non-root: 1" : "非根最少键数：1"}</span></div>
        <div><strong>2t - 1</strong><span>{lang === "en" ? "max keys: 3" : "最多键数：3"}</span></div>
        <div><strong>2t</strong><span>{lang === "en" ? "max children: 4" : "最多孩子数：4"}</span></div>
      </div>
    </FigureShell>
  );
}

function EasyInsert({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].easyInsertTitle}>
      <div className="btree-before-after">
        <div><span className="btree-page-label">{text[lang].before}</span><div className="btree-page"><KeyStrip keys={[12, 20]} /></div></div>
        <div><span className="btree-page-label">{text[lang].after}</span><div className="btree-page is-highlighted"><KeyStrip keys={[12, 20, 30]} highlight={30} /></div></div>
      </div>
      <p>{lang === "en" ? "If a leaf is not full, insertion is just a sorted insert inside that page." : "如果叶子未满，插入只是页内的一次有序插入。"}</p>
    </FigureShell>
  );
}

function RootGrowth({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].rootGrowthTitle}>
      <div className="btree-before-after">
        <div><span className="btree-page-label">{text[lang].before}</span><TreeNode node={{ id: "full", keys: [5, 10, 20], leaf: true }} lang={lang} highlightNodeIds={["full"]} /></div>
        <div><span className="btree-page-label">{text[lang].after}</span><TreeNode node={rootAfterSplit} lang={lang} highlightNodeIds={["root"]} highlightKey={10} /></div>
      </div>
    </FigureShell>
  );
}

const rootAfterSplit: BTreeNode = {
  id: "root",
  keys: [10],
  leaf: false,
  children: [
    { id: "left", keys: [5], leaf: true },
    { id: "right", keys: [20], leaf: true }
  ]
};

function Invariants({ lang }: { lang: Locale }) {
  const items = lang === "en"
    ? ["Keys sorted inside every node", "Children match divider ranges", "Non-root nodes keep 1..3 keys for t = 2", "All leaves sit at the same depth"]
    : ["每个节点内的键有序", "孩子符合分隔键范围", "t = 2 时非根节点保持 1..3 个键", "所有叶子处在同一深度"];
  return (
    <FigureShell title={text[lang].invariantsTitle}>
      <div className="btree-invariant-grid">
        <TreeNode node={finalTree} lang={lang} />
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </FigureShell>
  );
}

function Complexity({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].complexityTitle}>
      <div className="btree-compare-row">
        <div className="btree-levels"><strong>{lang === "en" ? "Binary-ish" : "接近二叉"}</strong><span>{"1 -> 2 -> 4 -> 8 -> 16"}</span></div>
        <div className="btree-levels is-highlighted"><strong>B-tree</strong><span>{"1 -> 4 -> 16 -> 64"}</span></div>
      </div>
      <p>{lang === "en" ? "The exact capacity depends on pages, but wider nodes reduce the number of page levels." : "真实容量取决于页大小，但更宽的节点会减少页层数。"}</p>
    </FigureShell>
  );
}

function Confusions({ lang }: { lang: Locale }) {
  const items = lang === "en"
    ? ["B-tree is not a binary tree.", "This page uses minimum degree t, not order.", "B-tree split moves the promoted key upward.", "Page reads and CPU comparisons are different costs."]
    : ["B 树不是二叉树。", "本页使用最小度数 t，而不是阶。", "B 树分裂会把提升键移动到上层。", "页读取和 CPU 比较是不同成本。"];
  return (
    <FigureShell title={text[lang].confusionsTitle}>
      <div className="btree-card-grid">{items.map((item) => <div className="btree-card" key={item}>{item}</div>)}</div>
    </FigureShell>
  );
}

function Connection({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].connectionTitle}>
      <div className="btree-graph-link"><span>B-tree</span><strong>{"->"}</strong><span>B+-tree</span></div>
      <p>{lang === "en" ? "B+-trees keep the shallow page shape, then move all records to linked leaves for range scans." : "B+ 树保留浅层页结构，再把所有记录移到相连叶子中以支持范围扫描。"}</p>
    </FigureShell>
  );
}

function Exercise({ lang }: { lang: Locale }) {
  return (
    <FigureShell title={text[lang].exerciseTitle}>
      <TreeNode node={beforeNonRootSplitTree} lang={lang} highlightNodeIds={["leaf-right-full"]} />
      <p>{lang === "en" ? "Before inserting 17, which child is full and what key will be promoted?" : "插入 17 之前，哪个孩子已满？哪个键会被提升？"}</p>
    </FigureShell>
  );
}

export default function BTreeNodeFigure({ lang, variant }: { lang: Locale; variant: BTreeFigureVariant }) {
  if (variant === "page-read") return <PageRead lang={lang} />;
  if (variant === "sorted-array-pain") return <SortedArrayPain lang={lang} />;
  if (variant === "bst-pain") return <BstPain lang={lang} />;
  if (variant === "node-anatomy") return <NodeAnatomy lang={lang} />;
  if (variant === "minimum-degree") return <MinimumDegree lang={lang} />;
  if (variant === "easy-insert") return <EasyInsert lang={lang} />;
  if (variant === "root-growth") return <RootGrowth lang={lang} />;
  if (variant === "invariants") return <Invariants lang={lang} />;
  if (variant === "complexity") return <Complexity lang={lang} />;
  if (variant === "confusions") return <Confusions lang={lang} />;
  if (variant === "connection") return <Connection lang={lang} />;
  return <Exercise lang={lang} />;
}

export function BTreeFigureStyles() {
  return (
    <style>{`
      .btree-figure {
        margin: 1.4rem 0;
        padding: 1rem;
        border: 1px solid var(--color-border, #d8e2ef);
        border-radius: 8px;
        background: var(--color-surface, #ffffff);
        overflow-x: clip;
      }
      .btree-figure figcaption {
        display: flex;
        flex-direction: column;
        gap: .25rem;
        margin-bottom: .85rem;
        color: var(--color-text, #172033);
      }
      .btree-page-strip, .btree-before-after, .btree-compare-row, .btree-card-grid, .btree-children, .btree-ruler, .btree-anatomy {
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
        align-items: center;
      }
      .btree-page {
        min-width: 7rem;
        padding: .6rem;
        border: 1px solid #9fb4d4;
        border-radius: 8px;
        background: #f8fbff;
        color: #172033;
      }
      .btree-page.is-highlighted, .btree-key-strip .is-highlighted, .btree-levels.is-highlighted {
        border-color: #d97706;
        background: #fff7ed;
      }
      .btree-page-label, .btree-page-note, .btree-range small, .btree-path small {
        display: block;
        font-size: .78rem;
        color: #5b6472;
      }
      .btree-key-strip {
        display: flex;
        flex-wrap: wrap;
        gap: .25rem;
        align-items: center;
      }
      .btree-key-strip span {
        min-width: 2rem;
        padding: .25rem .45rem;
        border: 1px solid #2f6fbd;
        border-radius: 6px;
        background: #eef6ff;
        text-align: center;
        font-weight: 700;
      }
      .btree-tree-unit {
        display: flex;
        flex-direction: column;
        gap: .75rem;
        align-items: center;
        max-width: 100%;
      }
      .btree-children {
        justify-content: center;
        align-items: flex-start;
      }
      .btree-range, .btree-card, .btree-levels {
        padding: .65rem;
        border: 1px dashed #9fb4d4;
        border-radius: 8px;
        background: #fbfdff;
      }
      .btree-path {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        padding: 0;
        list-style: none;
      }
      .btree-path li {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: .45rem .65rem;
        border: 1px solid #9fb4d4;
        border-radius: 8px;
      }
      .btree-ruler > div {
        flex: 1 1 10rem;
        padding: .7rem;
        border-left: 4px solid #2f6fbd;
        background: #f8fbff;
      }
      .btree-invariant-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(12rem, .8fr);
        gap: 1rem;
        align-items: start;
      }
      .btree-graph-link {
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
        align-items: center;
      }
      .btree-graph-link span {
        padding: .55rem .75rem;
        border: 1px solid #2f6fbd;
        border-radius: 8px;
        background: #eef6ff;
        font-weight: 700;
      }
      @media (max-width: 680px) {
        .btree-invariant-grid {
          grid-template-columns: 1fr;
        }
        .btree-page {
          min-width: 0;
        }
      }
    `}</style>
  );
}
