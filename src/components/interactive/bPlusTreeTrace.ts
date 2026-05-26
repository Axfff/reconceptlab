import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type BPlusLeafId = "A" | "B" | "C" | "B-left" | "B-right";
export type BPlusLookupCaseId = "50" | "30" | "60";
export type BPlusRangeCaseId = "20-70" | "20-65";

export type BPlusLeaf = {
  id: BPlusLeafId;
  records: Array<{ key: number; value: string }>;
  next: BPlusLeafId | null;
};

export type BPlusTreeFixture = {
  root: {
    id: "root";
    guideKeys: number[];
    guideOnly: true;
    childIntervals: LocalizedText[];
    children: BPlusLeafId[];
  };
  leaves: Record<BPlusLeafId, BPlusLeaf>;
};

export type BPlusLookupStep = {
  id: string;
  action: "read-root" | "choose-child" | "read-leaf" | "found";
  pageReads: number;
  childId?: BPlusLeafId;
  interval?: LocalizedText;
  foundKey?: number;
  explanation: LocalizedText;
};

export type BPlusLookupTrace = {
  target: number;
  found: boolean;
  pageReads: number;
  leafId: BPlusLeafId;
  steps: BPlusLookupStep[];
};

export type BPlusRangeStep = {
  id: string;
  action: "descend" | "collect" | "follow-link" | "stop";
  leafId: BPlusLeafId;
  activeKey?: number;
  collected: number[];
  pageReads: number;
  explanation: LocalizedText;
};

export type BPlusRangeTrace = {
  lo: number;
  hi: number;
  inclusive: true;
  result: number[];
  steps: BPlusRangeStep[];
};

export type BPlusLeafSplitStep = {
  id: string;
  title: LocalizedText;
  rootGuideKeys: number[];
  leaves: BPlusLeaf[];
  copiedSeparator?: number;
  explanation: LocalizedText;
};

export const bPlusTreeFixture: BPlusTreeFixture = {
  root: {
    id: "root",
    guideKeys: [30, 60],
    guideOnly: true,
    childIntervals: [
      { en: "< 30", zh: "< 30" },
      { en: "30 <= key < 60", zh: "30 <= key < 60" },
      { en: ">= 60", zh: ">= 60" }
    ],
    children: ["A", "B", "C"]
  },
  leaves: {
    A: {
      id: "A",
      records: [
        { key: 10, value: "A" },
        { key: 20, value: "B" }
      ],
      next: "B"
    },
    B: {
      id: "B",
      records: [
        { key: 30, value: "C" },
        { key: 40, value: "D" },
        { key: 50, value: "E" }
      ],
      next: "C"
    },
    C: {
      id: "C",
      records: [
        { key: 60, value: "F" },
        { key: 70, value: "G" },
        { key: 80, value: "H" }
      ],
      next: null
    },
    "B-left": {
      id: "B-left",
      records: [
        { key: 30, value: "C" },
        { key: 40, value: "D" }
      ],
      next: "B-right"
    },
    "B-right": {
      id: "B-right",
      records: [
        { key: 50, value: "E" },
        { key: 55, value: "E2" }
      ],
      next: "C"
    }
  }
};

export function chooseBPlusChild(key: number) {
  if (key < 30) return { childId: "A" as const, childIndex: 0, interval: bPlusTreeFixture.root.childIntervals[0] };
  if (key < 60) return { childId: "B" as const, childIndex: 1, interval: bPlusTreeFixture.root.childIntervals[1] };
  return { childId: "C" as const, childIndex: 2, interval: bPlusTreeFixture.root.childIntervals[2] };
}

export function lookupBPlusTree(target: number): BPlusLookupTrace {
  const choice = chooseBPlusChild(target);
  const leaf = bPlusTreeFixture.leaves[choice.childId];
  const found = leaf.records.some((record) => record.key === target);
  const steps: BPlusLookupStep[] = [
    {
      id: `${target}-read-root`,
      action: "read-root",
      pageReads: 1,
      explanation: {
        en: `Read root guide keys [30, 60]. They route search only; records are not stored here.`,
        zh: `读取根部导航键 [30, 60]。它们只负责导向；记录不存放在这里。`
      }
    },
    {
      id: `${target}-choose-child`,
      action: "choose-child",
      pageReads: 1,
      childId: choice.childId,
      interval: choice.interval,
      explanation: {
        en: `Choose leaf ${choice.childId} because equality goes right and ${target} belongs to ${choice.interval.en}.`,
        zh: `选择叶子 ${choice.childId}，因为相等时向右走，${target} 属于 ${choice.interval.zh}。`
      }
    },
    {
      id: `${target}-read-leaf-${choice.childId}`,
      action: "read-leaf",
      pageReads: 2,
      childId: choice.childId,
      explanation: {
        en: `Read leaf ${choice.childId}, whose records are [${leaf.records.map((record) => `${record.key}:${record.value}`).join(", ")}].`,
        zh: `读取叶子 ${choice.childId}，其中记录为 [${leaf.records.map((record) => `${record.key}:${record.value}`).join(", ")}]。`
      }
    },
    {
      id: `${target}-found`,
      action: "found",
      pageReads: 2,
      childId: choice.childId,
      foundKey: target,
      explanation: found
        ? {
            en: `Find ${target} in the leaf record list. The root separator was only a guide.`,
            zh: `在叶子的记录列表中找到 ${target}。根部分隔键只是导航。`
          }
        : {
            en: `${target} is not present in its routed leaf.`,
            zh: `${target} 不在它被路由到的叶子中。`
          }
    }
  ];

  return { target, found, pageReads: 2, leafId: choice.childId, steps };
}

export function rangeScanBPlusTree(lo: number, hi: number): BPlusRangeTrace {
  const start = chooseBPlusChild(lo).childId;
  let leafId: BPlusLeafId | null = start;
  let pageReads = 2;
  const collected: number[] = [];
  const steps: BPlusRangeStep[] = [
    {
      id: `${lo}-${hi}-descend`,
      action: "descend",
      leafId: start,
      pageReads,
      collected: [],
      explanation: {
        en: `Descend once to leaf ${start}, the leaf that can contain inclusive lower bound ${lo}.`,
        zh: `先下降一次到叶子 ${start}，这里可能包含闭区间下界 ${lo}。`
      }
    }
  ];

  while (leafId) {
    const leaf: BPlusLeaf = bPlusTreeFixture.leaves[leafId];
    for (const record of leaf.records) {
      if (record.key < lo) continue;
      if (record.key > hi) {
        steps.push({
          id: `${lo}-${hi}-stop-before-${record.key}`,
          action: "stop",
          leafId,
          activeKey: record.key,
          pageReads,
          collected: [...collected],
          explanation: {
            en: `Stop before ${record.key}; it is greater than inclusive upper bound ${hi}.`,
            zh: `在 ${record.key} 之前停止；它大于闭区间上界 ${hi}。`
          }
        });
        return { lo, hi, inclusive: true, result: collected, steps };
      }
      collected.push(record.key);
      steps.push({
        id: `${lo}-${hi}-collect-${record.key}`,
        action: "collect",
        leafId,
        activeKey: record.key,
        pageReads,
        collected: [...collected],
        explanation: {
          en: `Collect ${record.key} from leaf ${leafId}.`,
          zh: `从叶子 ${leafId} 收集 ${record.key}。`
        }
      });
    }

    if (!leaf.next) break;
    const nextLeafId: BPlusLeafId = leaf.next;
    leafId = nextLeafId;
    pageReads += 1;
    steps.push({
      id: `${lo}-${hi}-follow-${leafId}`,
      action: "follow-link",
      leafId: nextLeafId,
      pageReads,
      collected: [...collected],
      explanation: {
        en: `Follow the leaf link to ${leafId}; no new root descent is needed.`,
        zh: `沿叶子链接到 ${leafId}；不需要重新从根下降。`
      }
    });
  }

  steps.push({
    id: `${lo}-${hi}-stop-end`,
    action: "stop",
    leafId: "C",
    pageReads,
    collected: [...collected],
    explanation: {
      en: `The scan has passed the requested range.`,
      zh: `扫描已经越过请求范围。`
    }
  });

  return { lo, hi, inclusive: true, result: collected, steps };
}

export const lookupTraces: Record<BPlusLookupCaseId, BPlusLookupTrace> = {
  "50": lookupBPlusTree(50),
  "30": lookupBPlusTree(30),
  "60": lookupBPlusTree(60)
};

export const rangeTraces: Record<BPlusRangeCaseId, BPlusRangeTrace> = {
  "20-70": rangeScanBPlusTree(20, 70),
  "20-65": rangeScanBPlusTree(20, 65)
};

export const leafSplitTrace: BPlusLeafSplitStep[] = [
  {
    id: "before",
    title: {
      en: "Leaf B is full",
      zh: "叶子 B 已满"
    },
    rootGuideKeys: [30, 60],
    leaves: [bPlusTreeFixture.leaves.A, bPlusTreeFixture.leaves.B, bPlusTreeFixture.leaves.C],
    explanation: {
      en: "Insert 55 into leaf B [30, 40, 50]. With max leaf capacity 3, the temporary leaf would be [30, 40, 50, 55].",
      zh: "把 55 插入叶子 B [30, 40, 50]。当叶子容量上限为 3 时，临时叶子会变成 [30, 40, 50, 55]。"
    }
  },
  {
    id: "after",
    title: {
      en: "Copy separator 50 and rewire links",
      zh: "复制分隔键 50 并重接链接"
    },
    rootGuideKeys: [30, 50, 60],
    leaves: [
      {
        ...bPlusTreeFixture.leaves.A,
        next: "B-left"
      },
      bPlusTreeFixture.leaves["B-left"],
      bPlusTreeFixture.leaves["B-right"],
      bPlusTreeFixture.leaves.C
    ],
    copiedSeparator: 50,
    explanation: {
      en: "The new right leaf starts at 50, so 50 is copied into the parent as a guide. Records 50 and 55 remain in leaves, and links become A -> [30, 40] -> [50, 55] -> C.",
      zh: "新的右叶子从 50 开始，所以 50 被复制到父节点作为导航键。记录 50 和 55 仍留在叶子中，链接变为 A -> [30, 40] -> [50, 55] -> C。"
    }
  }
];

export function leafChainKeys(leaves: Record<BPlusLeafId, BPlusLeaf>, start: BPlusLeafId = "A") {
  const result: number[] = [];
  let current: BPlusLeafId | null = start;
  const seen = new Set<BPlusLeafId>();
  while (current && !seen.has(current)) {
    seen.add(current);
    result.push(...leaves[current].records.map((record) => record.key));
    current = leaves[current].next;
  }
  return result;
}

export function leafRecordsOnly(tree = bPlusTreeFixture) {
  const leafKeys = new Set(Object.values(tree.leaves).flatMap((leaf) => leaf.records.map((record) => record.key)));
  return tree.root.guideKeys.every((key) => leafKeys.has(key)) && tree.root.guideOnly;
}
