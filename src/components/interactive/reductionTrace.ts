import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type SourceProblemId = "TwoNumberSum4";
export type TargetProblemId = "TargetSum";

export type ToySourceInstance = {
  id: "yes-13" | "yes-22" | "no-11" | "yes-04" | "no-50";
  a: number;
  b: number;
};

export type ToyTargetInstance = {
  a: number;
  b: number;
  target: 4;
};

export type ToyFixtureRow = {
  source: ToySourceInstance;
  sourceAnswer: boolean;
  target: ToyTargetInstance;
  targetAnswer: boolean;
  purpose: LocalizedText;
};

export type ReductionTraceStep =
  | {
      id: "receive-source";
      source: ToySourceInstance;
      sourceAnswer: boolean;
      explanation: LocalizedText;
    }
  | {
      id: "compute-target";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      sourceAnswer: boolean;
      explanation: LocalizedText;
    }
  | {
      id: "solve-target";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      targetAnswer: boolean;
      explanation: LocalizedText;
    }
  | {
      id: "return-answer";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      sourceAnswer: boolean;
      targetAnswer: boolean;
      explanation: LocalizedText;
    };

export type InvalidReductionCase =
  | {
      id: "one-way-implication";
      violation: "missing-reverse-direction";
      annotation: LocalizedText;
      rows: Array<{ sourceAnswer: boolean; targetAnswer: boolean; note: LocalizedText }>;
    }
  | {
      id: "exponential-translator";
      violation: "not-polynomial-time";
      annotation: LocalizedText;
      mappedInstanceSizeIsPolynomial: false;
    }
  | {
      id: "solves-inside-translator";
      violation: "hidden-source-solver";
      annotation: LocalizedText;
    }
  | {
      id: "wrong-hardness-arrow";
      violation: "wrong-transfer-direction";
      notation: "B <=p A";
      knownHardSource: "A";
      attemptedTarget: "B";
      validConclusion: false;
      annotation: LocalizedText;
    }
  | {
      id: "solution-object-confusion";
      violation: "maps-witness-not-decision-answer";
      annotation: LocalizedText;
    };

export type PathEncodingExample = {
  id: "path-abc";
  edgeList: Array<readonly [string, string]>;
  adjacencyMap: Record<string, string[]>;
  source: string;
  target: string;
  answer: boolean;
  caption: LocalizedText;
};

export type PathEncodingTraceStep =
  | {
      id: "receive-edge-list";
      example: PathEncodingExample;
      sourceAnswer: boolean;
      explanation: LocalizedText;
    }
  | {
      id: "build-adjacency-map";
      example: PathEncodingExample;
      explanation: LocalizedText;
    }
  | {
      id: "solve-adjacency-map";
      example: PathEncodingExample;
      targetAnswer: boolean;
      explanation: LocalizedText;
    }
  | {
      id: "return-path-answer";
      example: PathEncodingExample;
      sourceAnswer: boolean;
      targetAnswer: boolean;
      explanation: LocalizedText;
    };

export type DirectionCase =
  | {
      id: "algorithm-transfer";
      mode: "algorithm-transfer";
      notation: "A <=p B";
      assumedSolver: "B";
      derivedSolver: "A";
      conclusion: LocalizedText;
      validConclusion: true;
    }
  | {
      id: "hardness-preview";
      mode: "hardness-preview";
      notation: "A <=p B";
      knownHardSource: "A";
      target: "B";
      conclusion: LocalizedText;
      validConclusion: true;
    }
  | {
      id: "wrong-hardness-arrow";
      mode: "hardness-preview";
      notation: "B <=p A";
      knownHardSource: "A";
      attemptedTarget: "B";
      conclusion: LocalizedText;
      validConclusion: false;
    };

export type ReductionCostState = {
  sourceEncodingLength: number;
  translatorWork: number;
  targetEncodingLength: number;
  targetSolverTime: number;
  combinedTime: number;
  mappedInstanceSize: number;
  mappedInstanceSizeIsPolynomial: boolean;
};

export type PracticeCardId = "path-preservation" | "toy-no-row" | "solver-direction" | "cost-model";

export const toySourceProblem: SourceProblemId = "TwoNumberSum4";
export const toyTargetProblem: TargetProblemId = "TargetSum";

export const toyFixtureRows: ToyFixtureRow[] = [
  {
    source: { id: "yes-13", a: 1, b: 3 },
    sourceAnswer: true,
    target: { a: 1, b: 3, target: 4 },
    targetAnswer: true,
    purpose: {
      en: "A normal Yes-preserving row.",
      zh: "普通的 Yes 保持行。"
    }
  },
  {
    source: { id: "yes-22", a: 2, b: 2 },
    sourceAnswer: true,
    target: { a: 2, b: 2, target: 4 },
    targetAnswer: true,
    purpose: {
      en: "Many source Yes instances can map correctly.",
      zh: "多个源问题 Yes 实例都可以正确映射。"
    }
  },
  {
    source: { id: "no-11", a: 1, b: 1 },
    sourceAnswer: false,
    target: { a: 1, b: 1, target: 4 },
    targetAnswer: false,
    purpose: {
      en: "No answers must also be preserved.",
      zh: "No 答案也必须被保持。"
    }
  },
  {
    source: { id: "yes-04", a: 0, b: 4 },
    sourceAnswer: true,
    target: { a: 0, b: 4, target: 4 },
    targetAnswer: true,
    purpose: {
      en: "A boundary-looking row with zero.",
      zh: "带有 0 的边界感行。"
    }
  },
  {
    source: { id: "no-50", a: 5, b: 0 },
    sourceAnswer: false,
    target: { a: 5, b: 0, target: 4 },
    targetAnswer: false,
    purpose: {
      en: "Another No row for practice.",
      zh: "另一个用于练习的 No 行。"
    }
  }
];

export const pathEncodingExample: PathEncodingExample = {
  id: "path-abc",
  edgeList: [
    ["A", "B"],
    ["B", "C"]
  ],
  adjacencyMap: {
    A: ["B"],
    B: ["C"],
    C: []
  },
  source: "A",
  target: "C",
  answer: true,
  caption: {
    en: "Same reachability question, different encoding.",
    zh: "同一个可达性问题，只是编码不同。"
  }
};

export const directionCases: DirectionCase[] = [
  {
    id: "algorithm-transfer",
    mode: "algorithm-transfer",
    notation: "A <=p B",
    assumedSolver: "B",
    derivedSolver: "A",
    validConclusion: true,
    conclusion: {
      en: "Translate A's instance into B, use the B solver, and return that Yes/No answer for A.",
      zh: "把 A 的实例翻译成 B，使用 B 的求解器，再把这个 Yes/No 答案作为 A 的答案返回。"
    }
  },
  {
    id: "hardness-preview",
    mode: "hardness-preview",
    notation: "A <=p B",
    knownHardSource: "A",
    target: "B",
    validConclusion: true,
    conclusion: {
      en: "If B had a fast solver, A would get one too; doubts about fast solvers for A now apply to B.",
      zh: "如果 B 有快速求解器，A 也会得到一个；因此对 A 快速求解器的怀疑也会落到 B 上。"
    }
  },
  {
    id: "wrong-hardness-arrow",
    mode: "hardness-preview",
    notation: "B <=p A",
    knownHardSource: "A",
    attemptedTarget: "B",
    validConclusion: false,
    conclusion: {
      en: "This arrow only says B can use an A solver. It does not transfer doubt from A to B.",
      zh: "这条箭头只说明 B 可以使用 A 的求解器，并不能把对 A 的怀疑转移到 B。"
    }
  }
];

export const invalidReductionCases: InvalidReductionCase[] = [
  {
    id: "one-way-implication",
    violation: "missing-reverse-direction",
    annotation: {
      en: "Two Yes rows preserve Yes, but one No source row becomes target Yes. That is not iff.",
      zh: "两个 Yes 行保持为 Yes，但一个源问题 No 行变成目标问题 Yes。这不是 iff。"
    },
    rows: [
      { sourceAnswer: true, targetAnswer: true, note: { en: "Yes still Yes", zh: "Yes 仍为 Yes" } },
      { sourceAnswer: true, targetAnswer: true, note: { en: "Yes still Yes", zh: "Yes 仍为 Yes" } },
      { sourceAnswer: false, targetAnswer: true, note: { en: "Broken: No became Yes", zh: "错误：No 变成了 Yes" } }
    ]
  },
  {
    id: "exponential-translator",
    violation: "not-polynomial-time",
    mappedInstanceSizeIsPolynomial: false,
    annotation: {
      en: "The translator tries 2^n possibilities or emits an exponential-size target instance.",
      zh: "翻译器尝试 2^n 种可能，或输出指数大小的目标实例。"
    }
  },
  {
    id: "solves-inside-translator",
    violation: "hidden-source-solver",
    annotation: {
      en: "The translator cannot secretly solve A first and then encode the answer.",
      zh: "翻译器不能先偷偷求解 A，再把答案编码出去。"
    }
  },
  {
    id: "wrong-hardness-arrow",
    violation: "wrong-transfer-direction",
    notation: "B <=p A",
    knownHardSource: "A",
    attemptedTarget: "B",
    validConclusion: false,
    annotation: {
      en: "Known-hard A plus B <=p A does not prove B hard.",
      zh: "已知困难的 A 加上 B <=p A，并不能证明 B 困难。"
    }
  },
  {
    id: "solution-object-confusion",
    violation: "maps-witness-not-decision-answer",
    annotation: {
      en: "This node preserves decision answers. Mapping witnesses back is a separate promise.",
      zh: "本节点保持的是判定答案。把见证对象映射回来是额外承诺。"
    }
  }
];

export const practiceCards = [
  {
    id: "path-preservation",
    fixtureId: pathEncodingExample.id,
    prompt: {
      en: "The edge list [(A,B), (B,C)] asks whether A reaches C. After translation, the adjacency map asks the same reachability question. Is the answer preserved?",
      zh: "边列表 [(A,B), (B,C)] 询问 A 是否能到达 C。翻译后，邻接表仍询问同一个可达性问题。答案被保持了吗？"
    },
    choices: [
      { id: "yes", correct: true, label: { en: "Yes, preserved", zh: "是，保持了" } },
      { id: "no", correct: false, label: { en: "No, changed", zh: "否，改变了" } }
    ],
    explanation: {
      en: "Both encodings describe A -> B -> C, so both instances are Yes.",
      zh: "两种编码都描述 A -> B -> C，所以两个实例都是 Yes。"
    }
  },
  {
    id: "toy-no-row",
    fixtureId: "no-11",
    prompt: {
      en: "For the mechanics-only toy row (1,1), the source asks 1 + 1 = 4 and the target asks 1 + 1 = target 4. What must happen?",
      zh: "对仅用于机制演示的玩具行 (1,1)，源问题问 1 + 1 = 4，目标问题问 1 + 1 = target 4。必须发生什么？"
    },
    choices: [
      { id: "no-no", correct: true, label: { en: "No maps to No", zh: "No 映射到 No" } },
      { id: "no-yes", correct: false, label: { en: "No may map to Yes", zh: "No 可以映射到 Yes" } }
    ],
    explanation: {
      en: "A valid reduction needs No preservation too: 1 + 1 is not 4 in either format.",
      zh: "有效归约也需要保持 No：两种格式里 1 + 1 都不是 4。"
    }
  },
  {
    id: "solver-direction",
    fixtureId: "algorithm-transfer",
    prompt: {
      en: "Given A <=p B, which solver can you use to solve A after translation?",
      zh: "给定 A <=p B，翻译后可以用哪个求解器来求解 A？"
    },
    choices: [
      { id: "b-solver", correct: true, label: { en: "A solver for B", zh: "B 的求解器" } },
      { id: "a-solver", correct: false, label: { en: "A solver for A", zh: "A 的求解器" } }
    ],
    explanation: {
      en: "The arrow points into the problem whose solver you call.",
      zh: "箭头指向你要调用其求解器的问题。"
    }
  },
  {
    id: "cost-model",
    fixtureId: "cost-10",
    prompt: {
      en: "If n = 10, translator work is n^2 and the target encoding length is n^2. Is the composed solver still polynomial?",
      zh: "如果 n = 10，翻译工作量是 n^2，目标编码长度也是 n^2。组合后的求解器仍是多项式时间吗？"
    },
    choices: [
      { id: "polynomial", correct: true, label: { en: "Yes", zh: "是" } },
      { id: "exponential", correct: false, label: { en: "No", zh: "否" } }
    ],
    explanation: {
      en: "n^2 plus (n^2)^3 is n^2 + n^6, still polynomial.",
      zh: "n^2 加上 (n^2)^3 等于 n^2 + n^6，仍然是多项式。"
    }
  }
] as const;

export function textFor(lang: Locale, en: string, zh: string) {
  return lang === "en" ? en : zh;
}

export function yesNo(value: boolean, lang: Locale) {
  return value ? textFor(lang, "Yes", "Yes") : textFor(lang, "No", "No");
}

export function toySourceAnswer(source: ToySourceInstance) {
  return source.a + source.b === 4;
}

export function targetSumAnswer(target: ToyTargetInstance) {
  return target.a + target.b === target.target;
}

export function reduceTwoNumberSum4ToTargetSum(source: ToySourceInstance): ToyTargetInstance {
  return { a: source.a, b: source.b, target: 4 };
}

export function toyInstanceLabel(instance: ToySourceInstance | ToyTargetInstance) {
  if ("target" in instance) return `(${instance.a}, ${instance.b}, ${instance.target})`;
  return `(${instance.a}, ${instance.b})`;
}

export function reductionTraceFor(sourceId: ToySourceInstance["id"]): ReductionTraceStep[] {
  const row = toyFixtureRows.find((candidate) => candidate.source.id === sourceId);
  if (!row) throw new Error(`Unknown toy source instance: ${sourceId}`);
  return [
    {
      id: "receive-source",
      source: row.source,
      sourceAnswer: row.sourceAnswer,
      explanation: {
        en: `Receive source instance ${toyInstanceLabel(row.source)} for TwoNumberSum4.`,
        zh: `接收 TwoNumberSum4 的源实例 ${toyInstanceLabel(row.source)}。`
      }
    },
    {
      id: "compute-target",
      source: row.source,
      target: row.target,
      sourceAnswer: row.sourceAnswer,
      explanation: {
        en: "Build the TargetSum instance by copying a and b and setting target to 4.",
        zh: "复制 a 和 b，并把 target 设为 4，构造 TargetSum 实例。"
      }
    },
    {
      id: "solve-target",
      source: row.source,
      target: row.target,
      targetAnswer: row.targetAnswer,
      explanation: {
        en: `Call the target solver on ${toyInstanceLabel(row.target)}.`,
        zh: `在 ${toyInstanceLabel(row.target)} 上调用目标问题求解器。`
      }
    },
    {
      id: "return-answer",
      source: row.source,
      target: row.target,
      sourceAnswer: row.sourceAnswer,
      targetAnswer: row.targetAnswer,
      explanation: {
        en: "Return the same Yes/No answer for the source instance.",
        zh: "把同一个 Yes/No 答案作为源实例的答案返回。"
      }
    }
  ];
}

export function edgeListToAdjacencyMap(edgeList: Array<readonly [string, string]>) {
  const adjacencyMap: Record<string, string[]> = {};
  for (const [from, to] of edgeList) {
    adjacencyMap[from] ??= [];
    adjacencyMap[to] ??= [];
    adjacencyMap[from].push(to);
  }
  return adjacencyMap;
}

export function hasPath(adjacencyMap: Record<string, string[]>, source: string, target: string) {
  const seen = new Set<string>();
  const queue = [source];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || seen.has(node)) continue;
    if (node === target) return true;
    seen.add(node);
    for (const next of adjacencyMap[node] ?? []) queue.push(next);
  }
  return false;
}

export function pathEncodingTrace(): PathEncodingTraceStep[] {
  const example = pathEncodingExample;
  return [
    {
      id: "receive-edge-list",
      example,
      sourceAnswer: example.answer,
      explanation: {
        en: "Receive the edge-list reachability instance.",
        zh: "接收边列表形式的可达性实例。"
      }
    },
    {
      id: "build-adjacency-map",
      example,
      explanation: {
        en: "Group outgoing neighbors by source node to build the adjacency map.",
        zh: "按出发节点分组出邻居，构造邻接表。"
      }
    },
    {
      id: "solve-adjacency-map",
      example,
      targetAnswer: example.answer,
      explanation: {
        en: "Run the existing adjacency-map reachability solver.",
        zh: "运行已有的邻接表可达性求解器。"
      }
    },
    {
      id: "return-path-answer",
      example,
      sourceAnswer: example.answer,
      targetAnswer: example.answer,
      explanation: {
        en: "Return the same answer for the original edge-list instance.",
        zh: "把同一个答案返回给原来的边列表实例。"
      }
    }
  ];
}

export function costState(sourceEncodingLength: number): ReductionCostState {
  const n = Math.max(1, Math.round(sourceEncodingLength));
  const targetEncodingLength = n ** 2;
  const translatorWork = n ** 2;
  const targetSolverTime = targetEncodingLength ** 3;
  return {
    sourceEncodingLength: n,
    translatorWork,
    targetEncodingLength,
    targetSolverTime,
    combinedTime: translatorWork + targetSolverTime,
    mappedInstanceSize: targetEncodingLength,
    mappedInstanceSizeIsPolynomial: true
  };
}
