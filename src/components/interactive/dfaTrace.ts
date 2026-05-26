import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type DfaSymbol = "char" | "at" | "dot" | "other";

export type DfaState =
  | "need-local"
  | "in-local"
  | "need-domain"
  | "in-domain"
  | "need-suffix"
  | "in-suffix"
  | "dead";

export type DfaTraceStep = {
  index: number;
  prefix: string;
  remaining: string;
  state: DfaState;
  previousState?: DfaState;
  input?: string;
  symbol?: DfaSymbol;
  acceptedNow: boolean;
  explanation: LocalizedText;
};

export type DfaTrace = {
  input: string;
  steps: DfaTraceStep[];
  finalState: DfaState;
  accepted: boolean;
};

export type DfaScenarioId =
  | "hook-categories"
  | "flag-combinations"
  | "missing-domain-before-dot"
  | "state-meaning-cards"
  | "transition-table"
  | "five-tuple-callout"
  | "accept-only-at-end"
  | "dead-state-loop"
  | "prefix-ledger"
  | "transition-cost"
  | "implementation-map"
  | "prediction-prompts";

export const dfaSymbols: DfaSymbol[] = ["char", "at", "dot", "other"];

export const dfaStates: DfaState[] = [
  "need-local",
  "in-local",
  "need-domain",
  "in-domain",
  "need-suffix",
  "in-suffix",
  "dead"
];

export const startState: DfaState = "need-local";
export const acceptingStates: DfaState[] = ["in-suffix"];

export const transitionTable: Record<DfaState, Record<DfaSymbol, DfaState>> = {
  "need-local": {
    char: "in-local",
    at: "dead",
    dot: "dead",
    other: "dead"
  },
  "in-local": {
    char: "in-local",
    at: "need-domain",
    dot: "dead",
    other: "dead"
  },
  "need-domain": {
    char: "in-domain",
    at: "dead",
    dot: "dead",
    other: "dead"
  },
  "in-domain": {
    char: "in-domain",
    at: "dead",
    dot: "need-suffix",
    other: "dead"
  },
  "need-suffix": {
    char: "in-suffix",
    at: "dead",
    dot: "dead",
    other: "dead"
  },
  "in-suffix": {
    char: "in-suffix",
    at: "dead",
    dot: "dead",
    other: "dead"
  },
  dead: {
    char: "dead",
    at: "dead",
    dot: "dead",
    other: "dead"
  }
};

export const stateLabels: Record<DfaState, LocalizedText> = {
  "need-local": { en: "need local char", zh: "需要本地字符" },
  "in-local": { en: "inside local part", zh: "本地部分中" },
  "need-domain": { en: "need domain char", zh: "需要域名字符" },
  "in-domain": { en: "inside domain", zh: "域名部分中" },
  "need-suffix": { en: "need suffix char", zh: "需要后缀字符" },
  "in-suffix": { en: "inside suffix", zh: "后缀部分中" },
  dead: { en: "dead / trap state", zh: "死状态 / 陷阱状态" }
};

export const stateMeanings: Record<DfaState, LocalizedText> = {
  "need-local": {
    en: "Nothing useful has been read yet; the next symbol must be a letter or digit.",
    zh: "还没有读到有效内容；下一个符号必须是字母或数字。"
  },
  "in-local": {
    en: "At least one local character has appeared; more local characters or one @ can follow.",
    zh: "已经有至少一个本地字符；后面可以继续本地字符，或出现一个 @。"
  },
  "need-domain": {
    en: "The @ has appeared; the next symbol must be the first domain character.",
    zh: "@ 已经出现；下一个符号必须是第一个域名字符。"
  },
  "in-domain": {
    en: "At least one domain character has appeared; more domain characters or one dot can follow.",
    zh: "已经有至少一个域名字符；后面可以继续域名字符，或出现一个点。"
  },
  "need-suffix": {
    en: "The domain dot has appeared; the next symbol must be the first suffix character.",
    zh: "域名中的点已经出现；下一个符号必须是第一个后缀字符。"
  },
  "in-suffix": {
    en: "At least one suffix character has appeared; this is accepting only if the input ends here.",
    zh: "已经有至少一个后缀字符；只有输入在这里结束时才接受。"
  },
  dead: {
    en: "A fatal pattern mistake has happened; every later symbol keeps the machine rejected.",
    zh: "已经发生致命格式错误；后续任何符号都会保持拒绝。"
  }
};

export const scenarioMeta: Record<DfaScenarioId, { title: LocalizedText; summary: LocalizedText }> = {
  "hook-categories": {
    title: { en: "Toy signup strings", zh: "玩具注册字符串" },
    summary: {
      en: "The validator sees categories, not full email syntax.",
      zh: "这个验证器看到的是符号类别，而不是真实邮件语法。"
    }
  },
  "flag-combinations": {
    title: { en: "Flags hide meanings", zh: "标志位隐藏含义" },
    summary: {
      en: "Some flag combinations are useful, but the reason is buried in booleans.",
      zh: "有些标志位组合是有用的，但含义藏在布尔值里。"
    }
  },
  "missing-domain-before-dot": {
    title: { en: "A missing domain character", zh: "缺少域名字符" },
    summary: {
      en: "`ana@.ai` fails exactly when `need-domain` reads a dot.",
      zh: "`ana@.ai` 正是在 `need-domain` 读到点时失败。"
    }
  },
  "state-meaning-cards": {
    title: { en: "State meanings", zh: "状态含义" },
    summary: {
      en: "Each named state says what must still happen next.",
      zh: "每个命名状态都说明接下来还必须发生什么。"
    }
  },
  "transition-table": {
    title: { en: "Seven states by four symbols", zh: "七个状态乘四类符号" },
    summary: {
      en: "Every state has exactly one next state for each input category.",
      zh: "每个状态对每类输入都恰好有一个下一状态。"
    }
  },
  "five-tuple-callout": {
    title: { en: "The concrete 5-tuple", zh: "具体的五元组" },
    summary: {
      en: "The diagram becomes a finite set of states, alphabet, transition function, start state, and accept set.",
      zh: "图变成状态集合、字母表、转移函数、起始状态和接受集合。"
    }
  },
  "accept-only-at-end": {
    title: { en: "Accept only at the end", zh: "只在末尾判断接受" },
    summary: {
      en: "`ana@cs.ai.` passes through an accepting state, then the final dot sends it to dead.",
      zh: "`ana@cs.ai.` 曾经过接受状态，但最后一个点把它送到死状态。"
    }
  },
  "dead-state-loop": {
    title: { en: "Dead state loop", zh: "死状态自环" },
    summary: {
      en: "After a fatal mistake, the remaining input cannot repair this toy pattern.",
      zh: "发生致命错误后，剩余输入无法修复这个玩具模式。"
    }
  },
  "prefix-ledger": {
    title: { en: "Prefix ledger", zh: "前缀账本" },
    summary: {
      en: "After each prefix, one state summarizes all facts that still matter.",
      zh: "每个前缀读完后，一个状态概括所有仍然重要的信息。"
    }
  },
  "transition-cost": {
    title: { en: "One symbol, one lookup", zh: "一个符号，一次查表" },
    summary: {
      en: "Running the DFA is linear in the input length and uses constant working memory.",
      zh: "运行 DFA 对输入长度是线性的，并且只用常数额外记忆。"
    }
  },
  "implementation-map": {
    title: { en: "Code-to-trace map", zh: "代码到轨迹的映射" },
    summary: {
      en: "Classifier, table lookup, and final accept check match the visible trace.",
      zh: "分类器、查表和最终接受检查对应可见轨迹。"
    }
  },
  "prediction-prompts": {
    title: { en: "Prediction prompts", zh: "预测练习" },
    summary: {
      en: "Use the frozen traces to predict the next state and final result.",
      zh: "用固定轨迹预测下一状态和最终结果。"
    }
  }
};

export const sampleInputs = [
  "ana@cs.ai",
  "a@b.c",
  "ana@.ai",
  "ana@@cs.ai",
  "ana@cs.",
  "ana@cs.ai.",
  "ana_@cs.ai"
] as const;

export function classify(input: string): DfaSymbol {
  if (/^[A-Za-z0-9]$/.test(input)) return "char";
  if (input === "@") return "at";
  if (input === ".") return "dot";
  return "other";
}

export function isAcceptingState(state: DfaState): boolean {
  return acceptingStates.includes(state);
}

export function transition(state: DfaState, symbol: DfaSymbol): DfaState {
  return transitionTable[state][symbol];
}

function symbolLabel(symbol: DfaSymbol, lang: Locale): string {
  const labels: Record<DfaSymbol, LocalizedText> = {
    char: { en: "letter or digit", zh: "字母或数字" },
    at: { en: "@", zh: "@" },
    dot: { en: "dot", zh: "点" },
    other: { en: "other symbol", zh: "其他符号" }
  };
  return labels[symbol][lang];
}

export function explainStep(previous: DfaState, input: string, symbol: DfaSymbol, next: DfaState): LocalizedText {
  if (previous === "dead") {
    return {
      en: `The machine is already in dead; reading ${input} (${symbol}) keeps it rejected.`,
      zh: `机器已经在死状态；读取 ${input}（${symbol}）后仍保持拒绝。`
    };
  }
  if (next === "dead") {
    return {
      en: `${stateLabels[previous].en} cannot read ${input} (${symbolLabel(symbol, "en")}), so the trace moves to dead.`,
      zh: `${stateLabels[previous].zh} 不能读取 ${input}（${symbolLabel(symbol, "zh")}），所以轨迹进入死状态。`
    };
  }
  return {
    en: `${stateLabels[previous].en} reads ${input} (${symbolLabel(symbol, "en")}) and moves to ${stateLabels[next].en}.`,
    zh: `${stateLabels[previous].zh} 读取 ${input}（${symbolLabel(symbol, "zh")}），转到${stateLabels[next].zh}。`
  };
}

export function generateDfaTrace(input: string): DfaTrace {
  let state = startState;
  const chars = Array.from(input);
  const steps: DfaTraceStep[] = [
    {
      index: 0,
      prefix: "",
      remaining: input,
      state,
      acceptedNow: false,
      explanation: {
        en: "Start before reading input. The machine still needs the first local character.",
        zh: "在读取输入前开始。机器仍需要第一个本地字符。"
      }
    }
  ];

  chars.forEach((char, offset) => {
    const symbol = classify(char);
    const previousState = state;
    state = transition(previousState, symbol);
    const prefix = chars.slice(0, offset + 1).join("");
    const remaining = chars.slice(offset + 1).join("");
    steps.push({
      index: offset + 1,
      prefix,
      remaining,
      state,
      previousState,
      input: char,
      symbol,
      acceptedNow: isAcceptingState(state),
      explanation: explainStep(previousState, char, symbol, state)
    });
  });

  return {
    input,
    steps,
    finalState: state,
    accepted: isAcceptingState(state)
  };
}

export const dfaFixture = {
  accepted: ["a@b.c", "ana9@cs.ai"],
  rejected: ["", "ana", "@cs.ai", "ana@cs", "ana@.ai", "ana@@cs.ai", "ana@cs.", "ana@cs.ai."],
  traces: {
    success: generateDfaTrace("ana@cs.ai"),
    missingDomainBeforeDot: generateDfaTrace("ana@.ai"),
    acceptOnlyAtEnd: generateDfaTrace("ana@cs.ai.")
  }
} as const;

export function finalStatusText(trace: DfaTrace, lang: Locale): string {
  if (trace.accepted) {
    return lang === "en"
      ? `Accepted: input is exhausted in ${trace.finalState}.`
      : `接受：输入耗尽时位于 ${trace.finalState}。`;
  }
  return lang === "en"
    ? `Rejected: input is exhausted in ${trace.finalState}.`
    : `拒绝：输入耗尽时位于 ${trace.finalState}。`;
}
