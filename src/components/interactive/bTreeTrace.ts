import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;

export type BTreeNode = {
  id: string;
  keys: number[];
  leaf: boolean;
  children?: BTreeNode[];
};

export type BTreeSearchCaseId = "17" | "10" | "13";

export type BTreeSearchStep = {
  id: string;
  nodeId: string;
  nodeKeys: number[];
  action: "read-node" | "choose-child" | "found" | "missing";
  compareKey?: number;
  childIndex?: number;
  rangeLabel: LocalizedText;
  pageReads: number;
  found: boolean;
  explanation: LocalizedText;
};

export type BTreeSearchTrace = {
  target: number;
  found: boolean;
  pageReads: number;
  resultNodeId?: string;
  steps: BTreeSearchStep[];
};

export type BTreeSplitStep = {
  id: string;
  title: LocalizedText;
  root: BTreeNode;
  highlightedNodeIds: string[];
  promotedKey?: number;
  insertedKey?: number;
  pageReads?: number;
  explanation: LocalizedText;
};

export const minimumDegree = 2;
export const insertionSequence = [10, 20, 5, 6, 12, 30, 7, 17];

export const finalTree: BTreeNode = {
  id: "root",
  keys: [10, 20],
  leaf: false,
  children: [
    { id: "leaf-left", keys: [5, 6, 7], leaf: true },
    { id: "leaf-middle", keys: [12, 17], leaf: true },
    { id: "leaf-right", keys: [30], leaf: true }
  ]
};

export const beforeNonRootSplitTree: BTreeNode = {
  id: "root",
  keys: [10],
  leaf: false,
  children: [
    { id: "leaf-left", keys: [5, 6, 7], leaf: true },
    { id: "leaf-right-full", keys: [12, 20, 30], leaf: true }
  ]
};

export const rootSplitTrace: BTreeSplitStep[] = [
  {
    id: "full-root",
    title: {
      en: "The root leaf is full",
      zh: "根叶子已满"
    },
    root: { id: "root-full", keys: [5, 10, 20], leaf: true },
    highlightedNodeIds: ["root-full"],
    insertedKey: 6,
    explanation: {
      en: "With t = 2, a node can hold at most 3 keys. Inserting 6 into [5, 10, 20] would overflow the root page.",
      zh: "当 t = 2 时，一个节点最多保存 3 个键。把 6 插入 [5, 10, 20] 会让根页溢出。"
    }
  },
  {
    id: "split-root",
    title: {
      en: "Split and promote the middle key",
      zh: "分裂并提升中间键"
    },
    root: {
      id: "root",
      keys: [10],
      leaf: false,
      children: [
        { id: "left", keys: [5], leaf: true },
        { id: "right", keys: [20], leaf: true }
      ]
    },
    highlightedNodeIds: ["root", "left", "right"],
    promotedKey: 10,
    insertedKey: 6,
    explanation: {
      en: "The middle key 10 moves up and carries its record pointer in this B-tree convention. The left and right pages keep the remaining key ranges.",
      zh: "中间键 10 上移；在本页的 B 树约定中，它仍携带记录指针。左右页保存剩下的键范围。"
    }
  },
  {
    id: "insert-left",
    title: {
      en: "Descend and insert into the left leaf",
      zh: "下降并插入左叶子"
    },
    root: {
      id: "root",
      keys: [10],
      leaf: false,
      children: [
        { id: "left", keys: [5, 6], leaf: true },
        { id: "right", keys: [20], leaf: true }
      ]
    },
    highlightedNodeIds: ["left"],
    insertedKey: 6,
    explanation: {
      en: "Because 6 < 10, insertion continues into the left child. The tree stays height-balanced.",
      zh: "因为 6 < 10，插入继续进入左孩子。整棵树仍保持高度平衡。"
    }
  }
];

export const nonRootSplitBeforeDescentTrace: BTreeSplitStep[] = [
  {
    id: "before-descent",
    title: {
      en: "Before descending for 17",
      zh: "为 17 下降之前"
    },
    root: beforeNonRootSplitTree,
    highlightedNodeIds: ["leaf-right-full"],
    insertedKey: 17,
    explanation: {
      en: "After inserting [10, 20, 5, 6, 12, 30, 7], the right child [12, 20, 30] is full. Common insertion code splits a full child before descending.",
      zh: "插入 [10, 20, 5, 6, 12, 30, 7] 后，右孩子 [12, 20, 30] 已满。常见插入代码会在下降前先分裂满孩子。"
    }
  },
  {
    id: "split-child",
    title: {
      en: "Split the full child first",
      zh: "先分裂满孩子"
    },
    root: {
      id: "root",
      keys: [10, 20],
      leaf: false,
      children: [
        { id: "leaf-left", keys: [5, 6, 7], leaf: true },
        { id: "leaf-middle", keys: [12], leaf: true },
        { id: "leaf-right", keys: [30], leaf: true }
      ]
    },
    highlightedNodeIds: ["root", "leaf-middle", "leaf-right"],
    promotedKey: 20,
    insertedKey: 17,
    explanation: {
      en: "The key 20 is promoted into the root, leaving [12] and [30] as two legal children. Now the next child for 17 is not full.",
      zh: "键 20 被提升到根，留下 [12] 和 [30] 两个合法孩子。现在 17 要进入的孩子不是满的。"
    }
  },
  {
    id: "insert-middle",
    title: {
      en: "Insert 17 into the middle child",
      zh: "把 17 插入中间孩子"
    },
    root: finalTree,
    highlightedNodeIds: ["leaf-middle"],
    insertedKey: 17,
    explanation: {
      en: "Since 10 < 17 < 20, the final descent goes to the middle child and inserts 17 beside 12.",
      zh: "因为 10 < 17 < 20，最后下降到中间孩子，把 17 插到 12 旁边。"
    }
  }
];

export function maxKeysForMinimumDegree(t: number) {
  return 2 * t - 1;
}

export function collectLeafDepths(node: BTreeNode, depth = 0): number[] {
  if (node.leaf) return [depth];
  return (node.children ?? []).flatMap((child) => collectLeafDepths(child, depth + 1));
}

export function everyNodeRespectsMaxKeys(node: BTreeNode, t = minimumDegree): boolean {
  if (node.keys.length > maxKeysForMinimumDegree(t)) return false;
  return (node.children ?? []).every((child) => everyNodeRespectsMaxKeys(child, t));
}

export function searchBTree(target: number): BTreeSearchTrace {
  const steps: BTreeSearchStep[] = [];
  let node: BTreeNode | undefined = finalTree;
  let pageReads = 0;

  while (node) {
    pageReads += 1;
    steps.push({
      id: `${target}-read-${node.id}`,
      nodeId: node.id,
      nodeKeys: [...node.keys],
      action: "read-node",
      pageReads,
      found: false,
      rangeLabel: {
        en: "Read this page",
        zh: "读取这一页"
      },
      explanation: {
        en: `Read page [${node.keys.join(", ")}] while searching for ${target}.`,
        zh: `查找 ${target} 时读取页面 [${node.keys.join(", ")}]。`
      }
    });

    let index = 0;
    while (index < node.keys.length && target > node.keys[index]) index += 1;

    if (index < node.keys.length && target === node.keys[index]) {
      steps.push({
        id: `${target}-found-${node.id}`,
        nodeId: node.id,
        nodeKeys: [...node.keys],
        action: "found",
        compareKey: target,
        pageReads,
        found: true,
        rangeLabel: {
          en: "Found key and its record pointer",
          zh: "找到键及其记录指针"
        },
        explanation: {
          en: `${target} is stored in this B-tree node, so the search returns the associated record/value pointer here.`,
          zh: `${target} 存在于这个 B 树节点中，因此查找在这里返回关联记录/值指针。`
        }
      });
      return { target, found: true, pageReads, resultNodeId: node.id, steps };
    }

    if (node.leaf) {
      steps.push({
        id: `${target}-missing-${node.id}`,
        nodeId: node.id,
        nodeKeys: [...node.keys],
        action: "missing",
        pageReads,
        found: false,
        rangeLabel: {
          en: "Leaf reached; key is absent",
          zh: "到达叶子；键不存在"
        },
        explanation: {
          en: `${target} would have appeared in this sorted leaf page, so it is absent.`,
          zh: `${target} 如果存在就会出现在这个有序叶页中，所以它不存在。`
        }
      });
      return { target, found: false, pageReads, steps };
    }

    const child: BTreeNode | undefined = node.children?.[index];
    const lower = node.keys[index - 1];
    const upper = node.keys[index];
    const enRange = lower === undefined ? `< ${upper}` : upper === undefined ? `> ${lower}` : `${lower} < key < ${upper}`;
    const zhRange = lower === undefined ? `< ${upper}` : upper === undefined ? `> ${lower}` : `${lower} < key < ${upper}`;
    steps.push({
      id: `${target}-choose-${node.id}-${index}`,
      nodeId: node.id,
      nodeKeys: [...node.keys],
      action: "choose-child",
      childIndex: index,
      pageReads,
      found: false,
      rangeLabel: {
        en: enRange,
        zh: zhRange
      },
      explanation: {
        en: `Choose child ${index + 1} because ${target} belongs to the range ${enRange}.`,
        zh: `选择第 ${index + 1} 个孩子，因为 ${target} 属于范围 ${zhRange}。`
      }
    });
    node = child;
  }

  return { target, found: false, pageReads, steps };
}

export const searchTraces: Record<BTreeSearchCaseId, BTreeSearchTrace> = {
  "17": searchBTree(17),
  "10": searchBTree(10),
  "13": searchBTree(13)
};
