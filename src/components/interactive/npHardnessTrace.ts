import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type NpHardnessSourceId =
  | "circuit-sat-preview"
  | "sat-preview"
  | "clique-preview"
  | "independent-set-preview"
  | "any-np-problem";
export type HardnessAnswer = "yes" | "no" | "symbolic";

export type NpHardnessSource = {
  id: NpHardnessSourceId;
  label: LocalizedText;
  instance: LocalizedText;
  sourceAnswer: HardnessAnswer;
  reductionName: string;
  targetInstanceForm: string;
  targetAnswer: HardnessAnswer;
  caption: LocalizedText;
};

export type NpHardnessTraceStep =
  | {
      id: "choose-source";
      sourceId: NpHardnessSourceId;
      explanation: LocalizedText;
    }
  | {
      id: "receive-instance";
      sourceId: NpHardnessSourceId;
      sourceAnswer: HardnessAnswer;
      explanation: LocalizedText;
    }
  | {
      id: "reduce-to-h";
      sourceId: NpHardnessSourceId;
      notation: "L <=p H";
      targetAnswer: HardnessAnswer;
      explanation: LocalizedText;
    }
  | {
      id: "solve-h";
      sourceId: NpHardnessSourceId;
      assumesPolynomialSolverForH: true;
      targetAnswer: HardnessAnswer;
      explanation: LocalizedText;
    }
  | {
      id: "return-source-answer";
      sourceId: NpHardnessSourceId;
      sourceAnswer: HardnessAnswer;
      targetAnswer: HardnessAnswer;
      explanation: LocalizedText;
    };

export type HardnessCostState = {
  sourceSizeSymbol: "n";
  targetSizeSymbol: "m";
  targetSizeBound: "m <= n^b";
  reductionTime: "O(n^a)";
  targetSolverTime: "O(m^c)";
  combinedTime: "O(n^a + n^{bc})";
  conclusion: "polynomial";
};

export type ExampleHardnessCostState = {
  sourceSize: number;
  reductionTime: string;
  targetSizeBound: string;
  targetSolverTime: string;
  combinedTime: string;
  conclusion: "polynomial";
};

export type NpHardnessMembershipCase =
  | {
      id: "np-hard-only";
      inNp: false;
      npHard: true;
      npComplete: false;
      label: LocalizedText;
      note: LocalizedText;
      summary: LocalizedText;
    }
  | {
      id: "in-np-only";
      inNp: true;
      npHard: false;
      npComplete: false;
      label: LocalizedText;
      note: LocalizedText;
      summary: LocalizedText;
    }
  | {
      id: "np-complete";
      inNp: true;
      npHard: true;
      npComplete: true;
      label: LocalizedText;
      note: LocalizedText;
      summary: LocalizedText;
    };

export type NpHardnessInvalidCase = {
  id: "wrong-arrow" | "one-source-only" | "not-in-np-confusion" | "large-instance-confusion" | "no-fast-algorithm-confusion" | "optimization-confusion";
  title: LocalizedText;
  summary: LocalizedText;
  evidence: LocalizedText;
  explanation: LocalizedText;
  conclusion: LocalizedText;
};

export type NpHardnessPracticeCard = {
  id: string;
  fixtureId: NpHardnessSourceId | NpHardnessInvalidCase["id"] | NpHardnessMembershipCase["id"];
  prompt: LocalizedText;
  choices: Array<{
    id: string;
    correct: boolean;
    label: LocalizedText;
  }>;
  explanation: LocalizedText;
};

export const sourceIdList: NpHardnessSourceId[] = [
  "circuit-sat-preview",
  "sat-preview",
  "clique-preview",
  "independent-set-preview",
  "any-np-problem"
];

export const sourceRows: NpHardnessSource[] = [
  {
    id: "circuit-sat-preview",
    label: {
      en: "Circuit-SAT",
      zh: "电路满足性判定（Circuit-SAT）"
    },
    instance: {
      en: "tiny circuit C with assignment 101",
      zh: "一个小电路 C 与赋值 101"
    },
    sourceAnswer: "yes",
    reductionName: "f_CircuitSAT",
    targetInstanceForm: "f_CircuitSAT(C)",
    targetAnswer: "yes",
    caption: {
      en: "Definition obligation: if the translator exists, the target instance must be a Yes instance.",
      zh: "定义要求：若翻译器存在，目标实例必须也是 Yes 实例。"
    }
  },
  {
    id: "sat-preview",
    label: {
      en: "SAT",
      zh: "SAT"
    },
    instance: {
      en: "formula φ = (x1 OR x2) AND (¬x1 OR x3)",
      zh: "公式 φ = (x1 OR x2) ∧ (¬x1 OR x3)"
    },
    sourceAnswer: "yes",
    reductionName: "f_SAT",
    targetInstanceForm: "f_SAT(φ)",
    targetAnswer: "yes",
    caption: {
      en: "Another required example translation row in the universal quantifier.",
      zh: "这是统一量化中的另一个示例翻译行。"
    }
  },
  {
    id: "clique-preview",
    label: {
      en: "Clique",
      zh: "团（Clique）"
    },
    instance: {
      en: "G has a 3-clique",
      zh: "图 G 中存在大小为 3 的团"
    },
    sourceAnswer: "yes",
    reductionName: "f_Clique",
    targetInstanceForm: "f_Clique(G, 3)",
    targetAnswer: "yes",
    caption: {
      en: "A source from graph-land that must also reduce to H in the definition.",
      zh: "定义里图论来源也必须能归约到 H。"
    }
  },
  {
    id: "independent-set-preview",
    label: {
      en: "Independent Set",
      zh: "独立集（Independent Set）"
    },
    instance: {
      en: "G with k = 4 where no size-4 independent set exists",
      zh: "图 G 和 k=4，但不存在大小为 4 的独立集"
    },
    sourceAnswer: "no",
    reductionName: "f_IS",
    targetInstanceForm: "f_IS(G, 4)",
    targetAnswer: "no",
    caption: {
      en: "No examples are also required to keep the iff contract.",
      zh: "No 例子也必须被保留，才能满足 iff。"
    }
  },
  {
    id: "any-np-problem",
    label: {
      en: "Any L in NP",
      zh: "任意 L ∈ NP"
    },
    instance: {
      en: "abstract source instance x",
      zh: "抽象源实例 x"
    },
    sourceAnswer: "symbolic",
    reductionName: "f_L",
    targetInstanceForm: "f_L(x)",
    targetAnswer: "symbolic",
    caption: {
      en: "Formal universal placeholder only; this row is not a concrete proof of hardness.",
      zh: "形式化占位符；这不是一个具体的困难性证明实例。"
    }
  }
];

export const defaultImplicationSource: NpHardnessSourceId = "circuit-sat-preview";
export const preservationLedgerRows = (() => {
  const yesRow = sourceRows.find((row) => row.sourceAnswer === "yes" && row.targetAnswer === "yes");
  const noRow = sourceRows.find((row) => row.sourceAnswer === "no" && row.targetAnswer === "no");

  if (!yesRow || !noRow) {
    throw new Error("NP-hardness trace requires at least one yes row and one no row for the preservation ledger.");
  }

  return [yesRow, noRow];
})();

export function sourceById(sourceId: NpHardnessSourceId): NpHardnessSource {
  const row = sourceRows.find((candidate) => candidate.id === sourceId);
  if (!row) {
    throw new Error(`Unknown NP-hardness source: ${sourceId}`);
  }
  return row;
}

export const traceSteps = ["choose-source", "receive-instance", "reduce-to-h", "solve-h", "return-source-answer"] as const;

export function implicationTraceForSource(sourceId: NpHardnessSourceId): NpHardnessTraceStep[] {
  const row = sourceById(sourceId);
  const sourceName = row.label.en;
  const targetName = row.targetInstanceForm;
  return [
    {
      id: "choose-source",
      sourceId,
      explanation: {
        en: `Pick source problem ${sourceName} as the current L.`,
        zh: `选中源问题 ${row.label.zh} 作为当前的 L。`
      }
    },
    {
      id: "receive-instance",
      sourceId,
      sourceAnswer: row.sourceAnswer,
      explanation: {
        en: `Receive instance x of ${sourceName}.`,
        zh: `接收 ${sourceName} 的实例 x。`
      }
    },
    {
      id: "reduce-to-h",
      sourceId,
      notation: "L <=p H",
      targetAnswer: row.targetAnswer,
      explanation: {
        en: `Compute and emit ${targetName}. If the hardness definition is trusted, this step is valid for this source.`,
        zh: `构造并输出 ${targetName}。若定义前提成立，这一步对该源问题是有效的。`
      }
    },
    {
      id: "solve-h",
      sourceId,
      assumesPolynomialSolverForH: true,
      targetAnswer: row.targetAnswer,
      explanation: {
        en: "Assume the oracle for H runs in polynomial time. Call it on the translated target instance.",
        zh: "假设 H 的判定器是多项式时间的。对翻译后的目标实例调用该判定器。"
      }
    },
    {
      id: "return-source-answer",
      sourceId,
      sourceAnswer: row.sourceAnswer,
      targetAnswer: row.targetAnswer,
      explanation: {
        en: `Return the same Yes/No bit as target. Preservation means this is the correct answer for the original source instance.`,
        zh: `返回与目标实例相同的 Yes/No。保持性意味着这就是原始源实例的正确答案。`
      }
    }
  ];
}

export const hardnessCostState: HardnessCostState = {
  sourceSizeSymbol: "n",
  targetSizeSymbol: "m",
  targetSizeBound: "m <= n^b",
  reductionTime: "O(n^a)",
  targetSolverTime: "O(m^c)",
  combinedTime: "O(n^a + n^{bc})",
  conclusion: "polynomial"
};

export function exampleCostState(sourceSize: number): ExampleHardnessCostState {
  const safeN = Math.max(1, Math.round(sourceSize));
  const reductionTime = `O(${safeN}^a)`;
  const targetSizeBound = `(${safeN})^b`;
  const targetSolverTime = `O((${safeN}^b)^c)`;
  const combinedTime = `${reductionTime} + O((${safeN}^b)^c)`;
  return {
    sourceSize: safeN,
    reductionTime,
    targetSizeBound,
    targetSolverTime,
    combinedTime,
    conclusion: "polynomial"
  };
}

export const membershipCases: NpHardnessMembershipCase[] = [
  {
    id: "np-hard-only",
    inNp: false,
    npHard: true,
    npComplete: false,
    label: {
      en: "NP-hard only",
      zh: "仅 NP-hard"
    },
    note: {
      en: "Hardness compares to all of NP, but membership in NP is not guaranteed.",
      zh: "困难性比较的是 NP 全家族，不保证问题本身在 NP 里。"
    },
    summary: {
      en: "Possible relationship we keep as a concept preview.",
      zh: "这是可能关系，留到后续节点再给具体例子。"
    }
  },
  {
    id: "in-np-only",
    inNp: true,
    npHard: false,
    npComplete: false,
    label: {
      en: "In NP only",
      zh: "仅 in NP"
    },
    note: {
      en: "Efficient certificates exist, but no universal reduction-from-all-NP evidence yet.",
      zh: "有高效验证证书，但还没有“所有 NP 都归约过去”的证据。"
    },
    summary: {
      en: "Many verification-style problems are in NP but not known to be NP-hard.",
      zh: "许多验证型问题在 NP，但还不知道它们 NP-hard。"
    }
  },
  {
    id: "np-complete",
    inNp: true,
    npHard: true,
    npComplete: true,
    label: {
      en: "NP-complete",
      zh: "NP-完全"
    },
    note: {
      en: "In NP and NP-hard at the same time.",
      zh: "既在 NP 中也 NP-hard。"
    },
    summary: {
      en: "This is the standard strongest “hard and checkable” learner-facing badge.",
      zh: "这是最熟悉的“既困难又可验证”类别。"
    }
  }
];

export const invalidCases: NpHardnessInvalidCase[] = [
  {
    id: "wrong-arrow",
    title: {
      en: "Wrong hardness arrow",
      zh: "困难性方向反了"
    },
    summary: {
      en: "H <=p L does not prove H is NP-hard.",
      zh: "H <=p L 不足以证明 H 是 NP-hard。"
    },
    evidence: {
      en: "The claim `H <=p L` points in the wrong direction; hardness requires every L in NP to reduce to H.",
      zh: "`H <=p L` 的箭头方向是反的；困难性要求 NP 中每个 L 都要归约到 H。"
    },
    explanation: {
      en: "This direction gives a reduction from H to L, so a solver for L (if any) would help solve H, not the other way around.",
      zh: "这个方向只是 `H` 到 `L` 的归约，因此有了 `L` 的求解器才可能帮助求解 `H`，不是反过来。"
    },
    conclusion: {
      en: "Reject: `H <=p L` does not establish `H` is NP-hard.",
      zh: "反例：`H <=p L` 不能证明 `H` 是 NP-hard。"
    }
  },
  {
    id: "one-source-only",
    title: {
      en: "One source does not prove universal hardness",
      zh: "只用一个源问题不足以证明统一困难性"
    },
    summary: {
      en: "A <=p H for one chosen source A only tells you about one comparison.",
      zh: "仅有一个 A <=p H 只能说明一次比较关系。"
    },
    evidence: {
      en: "NP-hardness asks for arrows from every L in NP to H.",
      zh: "NP-hardness 要求对 NP 中每个 L 都有箭头到 H。"
    },
    explanation: {
      en: "Without universal coverage, there is no claim that every NP decision problem feeds H.",
      zh: "缺少全覆盖，就不能声称 H 代表了 NP 全部问题。"
    },
    conclusion: {
      en: "Insufficient; universal requirement is not met.",
      zh: "不足够；未满足普遍要求。"
    }
  },
  {
    id: "not-in-np-confusion",
    title: {
      en: "NP-hard does not imply in NP",
      zh: "NP-hard 不代表在 NP 中"
    },
    summary: {
      en: "NP-hardness is a comparison relation, not a certificate-only membership statement.",
      zh: "NP-hardness 是比较关系，不是“有证书”类成员关系。"
    },
    evidence: {
      en: "Decision problems can be NP-hard while never admitting polynomial certificates.",
      zh: "判定问题可能 NP-hard，但不一定有多项式证书（此处先留空关系）。"
    },
    explanation: {
      en: "Only when both hold together do we call it NP-complete.",
      zh: "只有两者都成立才叫 NP-complete。"
    },
    conclusion: {
      en: "Separate the two claims.",
      zh: "要把这两个判断分开。"
    }
  },
  {
    id: "large-instance-confusion",
    title: {
      en: "Hard because one instance is huge",
      zh: "把“某个大实例很难”当成困难性"
    },
    summary: {
      en: "A single instance size does not define a problem-family class.",
      zh: "单个实例大小不能决定一个问题类的困难性。"
    },
    evidence: {
      en: "NP-hardness concerns entire decision families and reductions between them.",
      zh: "NP-hardness 讨论的是完整问题族与问题族之间的归约。"
    },
    explanation: {
      en: "Hardness is about preserving Yes/No answers for all inputs, not one large input.",
      zh: "困难性是关于所有输入上保持 Yes/No 的归约性质，而不是一个大输入。"
    },
    conclusion: {
      en: "Not enough to prove NP-hardness.",
      zh: "不足以证明 NP-hardness。"
    }
  },
  {
    id: "no-fast-algorithm-confusion",
    title: {
      en: "No known fast algorithm",
      zh: "“目前没找到快算法”"
    },
    summary: {
      en: "Unknown complexity is not the same as a reduction chain.",
      zh: "“暂时没找到”并不等同于归约证据。"
    },
    evidence: {
      en: "NP-hardness needs explicit source problems and polynomial translators.",
      zh: "NP-hardness 需要明确源问题和多项式翻译器。"
    },
    explanation: {
      en: "The absence of a known algorithm is a factual gap, not proof machinery.",
      zh: "不知道快算法是事实缺口，不是证明机制。"
    },
    conclusion: {
      en: "Still does not establish hardness.",
      zh: "仍不能确立困难性。"
    }
  },
  {
    id: "optimization-confusion",
    title: {
      en: "Decision shortcut for optimization confusion",
      zh: "把优化问题直接按判定困难性理解"
    },
    summary: {
      en: "This node is decision-focused; optimization claims are converted first.",
      zh: "本节点只讲判定问题；优化问题要先转换。"
    },
    evidence: {
      en: "The NP-hardness definition we use is for Yes/No questions.",
      zh: "本页使用的 NP-hardness 定义针对 Yes/No 问题。"
    },
    explanation: {
      en: "Optimization examples can appear later as decision thresholds or separate reduction models.",
      zh: "优化问题可在后续通过阈值化或独立的归约模型进入。"
    },
    conclusion: {
      en: "Use a decision version before importing hardness language.",
      zh: "先用决策版本再使用困难性术语。"
    }
  }
];

export const practiceCards: NpHardnessPracticeCard[] = [
  {
    id: "practice-wrong-arrow",
    fixtureId: "wrong-arrow",
    prompt: {
      en: "If the claim is that `H` is NP-hard, which implication is valid?",
      zh: "若要判断“`H` 是 NP-hard”，哪种箭头方向是对的？"
    },
    choices: [
      { id: "L<=p-H", correct: true, label: { en: "L <=p H", zh: "L <=p H" } },
      { id: "H<=p-L", correct: false, label: { en: "H <=p L", zh: "H <=p L" } }
    ],
    explanation: {
      en: "Hardness requires every `L` in NP to reduce to H, so direction is `L <=p H`.",
      zh: "困难性定义要求每个 `NP` 中的 `L` 都归约到 H，因此方向是 `L <=p H`。"
    }
  },
  {
    id: "practice-universal",
    fixtureId: "one-source-only",
    prompt: {
      en: "A single row A <=p H is enough to declare H NP-hard.",
      zh: "一个 A <=p H 就足以说明 H NP-hard。"
    },
    choices: [
      { id: "true", correct: false, label: { en: "True", zh: "对" } },
      { id: "false", correct: true, label: { en: "False", zh: "不对" } }
    ],
    explanation: {
      en: "NP-hardness requires reductions from every L in NP, not a single source.",
      zh: "NP-hardness 需要来自 NP 每个 L 的归约，不是只从一个源问题。"
    }
  },
  {
    id: "practice-membership",
    fixtureId: "np-hard-only",
    prompt: {
      en: "Which class label matches this case? In NP and NP-hard are both true.",
      zh: "下面哪一类与这种情况一致？in NP 与 NP-hard 都为真。"
    },
    choices: [
      { id: "in-np-only", correct: false, label: { en: "In NP only", zh: "仅 in NP" } },
      { id: "np-complete", correct: true, label: { en: "NP-complete", zh: "NP-complete" } },
      { id: "np-hard-only", correct: false, label: { en: "NP-hard only", zh: "仅 NP-hard" } }
    ],
    explanation: {
      en: "If both hold, that is the preview definition of NP-complete.",
      zh: "如果两者都真，这是 NP-complete 的定义预览。"
    }
  },
  {
    id: "practice-implication",
    fixtureId: "sat-preview",
    prompt: {
      en: "Assume H ∈ P and sat-preview has a valid reduction to H. What does the implication say for SAT?",
      zh: "假设 H ∈ P 且 SAT 有效归约到 H。对 SAT 来说这个推论说什么？"
    },
    choices: [
      { id: "sat-in-p", correct: true, label: { en: "SAT is in P under the implication", zh: "在该推论下 SAT 在 P 中" } },
      { id: "no-conclusion", correct: false, label: { en: "No implication for SAT", zh: "无法对 SAT 推出结论" } }
    ],
    explanation: {
      en: "The pipeline transfer gives a polynomial-time SAT solver from reduction + H solver.",
      zh: "归约 + H 的多项式求解器组成了一个多项式时间的 SAT 求解器。"
    }
  }
];

export const sourceLabels: Record<NpHardnessSourceId, LocalizedText> = {
  "circuit-sat-preview": {
    en: "Circuit-SAT preview source",
    zh: "Circuit-SAT 示例源问题"
  },
  "sat-preview": {
    en: "SAT preview source",
    zh: "SAT 示例源问题"
  },
  "clique-preview": {
    en: "Clique preview source",
    zh: "Clique 示例源问题"
  },
  "independent-set-preview": {
    en: "Independent Set preview source",
    zh: "独立集示例源问题"
  },
  "any-np-problem": {
    en: "any L in NP source",
    zh: "任意 L ∈ NP 源问题"
  }
};

export function textFor(lang: Locale, en: string, zh: string) {
  return lang === "en" ? en : zh;
}

export function answerLabel(answer: HardnessAnswer, lang: Locale) {
  if (answer === "symbolic") return textFor(lang, "Symbolic", "符号化");
  return answer === "yes" ? textFor(lang, "Yes", "是") : textFor(lang, "No", "否");
}

export function isSymbolicAnswer(answer: HardnessAnswer) {
  return answer === "symbolic";
}
