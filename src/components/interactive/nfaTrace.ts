import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type NfaState = "q0" | "q1" | "q2";
export type NfaSymbol = "0" | "1";

export type NfaTransitionEvent = {
  from: NfaState;
  symbol: NfaSymbol;
  to: NfaState[];
  died: boolean;
  spawned: NfaState[];
  kept: NfaState[];
  explanation: LocalizedText;
};

export type NfaTraceStep = {
  index: number;
  prefix: string;
  remaining: string;
  previousActiveStates: NfaState[];
  activeStates: NfaState[];
  input?: NfaSymbol;
  transitionEvents: NfaTransitionEvent[];
  spawnedBranches: NfaState[];
  diedBranches: NfaState[];
  acceptedIfInputEndedHere: boolean;
  explanation: LocalizedText;
};

export type NfaTrace = {
  input: string;
  steps: NfaTraceStep[];
  finalActiveStates: NfaState[];
  accepted: boolean;
};

export type NfaScenarioId =
  | "hook-substring-cards"
  | "dfa-vs-nfa-comparison"
  | "branching-fork"
  | "state-meaning-cards"
  | "branch-death-ledger"
  | "active-set-trace"
  | "simulator-main"
  | "five-tuple-callout"
  | "epsilon-note"
  | "implementation-map"
  | "prefix-invariant"
  | "branching-cost"
  | "common-confusions"
  | "prediction-prompts";

export const nfaStates: NfaState[] = ["q0", "q1", "q2"];
export const nfaSymbols: NfaSymbol[] = ["0", "1"];
export const startState: NfaState = "q0";
export const acceptingStates: NfaState[] = ["q2"];

export const transitionTable: Record<NfaState, Record<NfaSymbol, NfaState[]>> = {
  q0: {
    "0": ["q0", "q1"],
    "1": ["q0"]
  },
  q1: {
    "0": [],
    "1": ["q2"]
  },
  q2: {
    "0": ["q2"],
    "1": ["q2"]
  }
};

export const stateLabels: Record<NfaState, LocalizedText> = {
  q0: { en: "scan for a start", zh: "继续扫描起点" },
  q1: { en: "candidate 0", zh: "候选 0" },
  q2: { en: "saw 01", zh: "已经看到 01" }
};

export const stateMeanings: Record<NfaState, LocalizedText> = {
  q0: {
    en: "This branch has not committed to a particular 0 yet; it keeps scanning the whole suffix.",
    zh: "这条分支还没有选定某个 0；它继续扫描剩余后缀。"
  },
  q1: {
    en: "This branch just chose the latest 0 as a possible start of the substring 01.",
    zh: "这条分支刚把最近的 0 选作子串 01 的可能起点。"
  },
  q2: {
    en: "This branch has already seen 01, so any remaining symbols keep it accepting.",
    zh: "这条分支已经看到 01，所以后续任何符号都会保持接受。"
  }
};

export const scenarioMeta: Record<NfaScenarioId, { title: LocalizedText; summary: LocalizedText }> = {
  "hook-substring-cards": {
    title: { en: "Find the hidden 01", zh: "寻找隐藏的 01" },
    summary: {
      en: "The language contains exactly the binary strings that have substring 01 somewhere.",
      zh: "这个语言包含所有在某处出现子串 01 的二进制字符串。"
    }
  },
  "dfa-vs-nfa-comparison": {
    title: { en: "One state versus many possible states", zh: "一个状态与多个可能状态" },
    summary: {
      en: "A DFA can solve the problem; the NFA tells a different branching story.",
      zh: "DFA 可以解决这个问题；NFA 讲述的是另一种分支故事。"
    }
  },
  "branching-fork": {
    title: { en: "The first fork", zh: "第一次分叉" },
    summary: {
      en: "On a 0, q0 both keeps scanning and starts a candidate branch in q1.",
      zh: "读到 0 时，q0 既继续扫描，也在 q1 开启候选分支。"
    }
  },
  "state-meaning-cards": {
    title: { en: "Branch meanings", zh: "分支含义" },
    summary: {
      en: "Every active state names a different possible history of the same prefix.",
      zh: "每个活跃状态都命名了同一前缀的一种可能历史。"
    }
  },
  "branch-death-ledger": {
    title: { en: "A branch can die while another is born", zh: "一条分支死亡，另一条同时出生" },
    summary: {
      en: "For 00, old q1 has no 0-transition, while old q0 immediately spawns a new q1.",
      zh: "对 00，旧 q1 没有 0 转移；旧 q0 同时立刻生成新的 q1。"
    }
  },
  "active-set-trace": {
    title: { en: "Active-set trace for 010", zh: "010 的活跃状态集合轨迹" },
    summary: {
      en: "{q0} -> {q0,q1} -> {q0,q2} -> {q0,q1,q2}.",
      zh: "{q0} -> {q0,q1} -> {q0,q2} -> {q0,q1,q2}。"
    }
  },
  "simulator-main": {
    title: { en: "Interactive NFA simulator", zh: "NFA 互动模拟器" },
    summary: {
      en: "Step through active states, branch events, and final acceptance.",
      zh: "逐步观察活跃状态、分支事件和最终接受。"
    }
  },
  "five-tuple-callout": {
    title: { en: "The concrete 5-tuple", zh: "具体的五元组" },
    summary: {
      en: "The picture becomes states, alphabet, set-valued transition function, start state, and accept set.",
      zh: "图变成状态集合、字母表、集合值转移函数、起始状态和接受集合。"
    }
  },
  "epsilon-note": {
    title: { en: "Epsilon is outside this main example", zh: "epsilon 不在本例主体中" },
    summary: {
      en: "This node uses no epsilon transitions; they are a later compactness tool.",
      zh: "本节点不使用 epsilon 转移；它们是后续的紧凑构造工具。"
    }
  },
  "implementation-map": {
    title: { en: "Code-to-active-set map", zh: "代码到活跃集合的映射" },
    summary: {
      en: "Simulation unions all next states from the old active states.",
      zh: "模拟时把旧活跃状态的所有下一状态取并集。"
    }
  },
  "prefix-invariant": {
    title: { en: "Prefix invariant", zh: "前缀不变量" },
    summary: {
      en: "After prefix 01, q2 is active, so the prefix would accept if it ended there.",
      zh: "读完前缀 01 后 q2 活跃，所以若输入在此结束就会接受。"
    }
  },
  "branching-cost": {
    title: { en: "Branching cost", zh: "分支成本" },
    summary: {
      en: "Direct simulation scans at most |Q| active states per input symbol.",
      zh: "直接模拟时，每个输入符号最多扫描 |Q| 个活跃状态。"
    }
  },
  "common-confusions": {
    title: { en: "Two common mistakes", zh: "两个常见误解" },
    summary: {
      en: "A dead branch is not a failed input, and prefix acceptance is not final acceptance until the input ends.",
      zh: "分支死亡不等于输入失败；前缀接受也不等于整个输入最终接受。"
    }
  },
  "prediction-prompts": {
    title: { en: "Predict before revealing", zh: "先预测，再揭示" },
    summary: {
      en: "Use the same fixture to practice active-set semantics.",
      zh: "用同一个例子练习活跃集合语义。"
    }
  }
};

export const sampleInputs = ["010", "00", "1010", "", "01", "111"] as const;

function orderedSet(states: Iterable<NfaState>): NfaState[] {
  const set = new Set(states);
  return nfaStates.filter((state) => set.has(state));
}

export function formatStateSet(states: NfaState[]): string {
  return states.length === 0 ? "{}" : `{${states.join(",")}}`;
}

export function isAcceptingSet(states: NfaState[]): boolean {
  return states.some((state) => acceptingStates.includes(state));
}

export function transition(state: NfaState, symbol: NfaSymbol): NfaState[] {
  return transitionTable[state][symbol];
}

function explainEvent(from: NfaState, symbol: NfaSymbol, to: NfaState[]): LocalizedText {
  if (to.length === 0) {
    return {
      en: `${from} has no transition on ${symbol}, so that old branch dies.`,
      zh: `${from} 在 ${symbol} 上没有转移，所以那条旧分支死亡。`
    };
  }
  if (from === "q0" && symbol === "0") {
    return {
      en: "old q0 keeps scanning in q0 and also spawns q1 for this 0.",
      zh: "旧 q0 留在 q0 继续扫描，同时为这个 0 生成 q1。"
    };
  }
  if (from === "q1" && symbol === "1") {
    return {
      en: "q1 completes 01 and reaches accepting q2.",
      zh: "q1 完成 01，进入接受状态 q2。"
    };
  }
  return {
    en: `${from} on ${symbol} reaches ${formatStateSet(to)}.`,
    zh: `${from} 读到 ${symbol} 到达 ${formatStateSet(to)}。`
  };
}

function explainStep(index: number, input: NfaSymbol | undefined, activeStates: NfaState[]): LocalizedText {
  if (index === 0) {
    return {
      en: "Start with only q0 active: scan for a possible 0 that could begin 01.",
      zh: "开始时只有 q0 活跃：扫描可能作为 01 起点的 0。"
    };
  }
  if (input === "0" && activeStates.includes("q1")) {
    return {
      en: "Reading 0 keeps q0 alive and starts a candidate q1 branch for this 0.",
      zh: "读到 0 会保留 q0，并为这个 0 开启候选 q1 分支。"
    };
  }
  if (input === "1" && activeStates.includes("q2")) {
    return {
      en: "A q1 branch reads 1 and reaches accepting q2; q0 still keeps scanning.",
      zh: "某条 q1 分支读到 1 后进入接受 q2；q0 仍继续扫描。"
    };
  }
  return {
    en: `After reading ${input}, the active set is ${formatStateSet(activeStates)}.`,
    zh: `读完 ${input} 后，活跃集合是 ${formatStateSet(activeStates)}。`
  };
}

export function generateNfaTrace(input: string): NfaTrace {
  const chars = Array.from(input).filter((char): char is NfaSymbol => char === "0" || char === "1");
  let activeStates: NfaState[] = [startState];
  const steps: NfaTraceStep[] = [
    {
      index: 0,
      prefix: "",
      remaining: chars.join(""),
      previousActiveStates: [],
      activeStates,
      transitionEvents: [],
      spawnedBranches: [startState],
      diedBranches: [],
      acceptedIfInputEndedHere: isAcceptingSet(activeStates),
      explanation: explainStep(0, undefined, activeStates)
    }
  ];

  chars.forEach((symbol, offset) => {
    const previousActiveStates = activeStates;
    const eventTargets = new Set<NfaState>();
    const events = previousActiveStates.map((from) => {
      const to = transition(from, symbol);
      to.forEach((state) => eventTargets.add(state));
      const spawned = to.filter((state) => state !== from);
      const kept = to.filter((state) => state === from);
      return {
        from,
        symbol,
        to,
        died: to.length === 0,
        spawned,
        kept,
        explanation: explainEvent(from, symbol, to)
      };
    });

    activeStates = orderedSet(eventTargets);
    const prefix = chars.slice(0, offset + 1).join("");
    const remaining = chars.slice(offset + 1).join("");
    steps.push({
      index: offset + 1,
      prefix,
      remaining,
      previousActiveStates,
      activeStates,
      input: symbol,
      transitionEvents: events,
      spawnedBranches: orderedSet(events.flatMap((event) => event.spawned)),
      diedBranches: orderedSet(events.filter((event) => event.died).map((event) => event.from)),
      acceptedIfInputEndedHere: isAcceptingSet(activeStates),
      explanation: explainStep(offset + 1, symbol, activeStates)
    });
  });

  return {
    input: chars.join(""),
    steps,
    finalActiveStates: activeStates,
    accepted: isAcceptingSet(activeStates)
  };
}

export const nfaFixture = {
  accepted: ["01", "010", "1010", "001", "11010"],
  rejected: ["", "0", "1", "00", "111", "10", "1000"],
  traces: {
    zeroOneZero: generateNfaTrace("010"),
    doubleZero: generateNfaTrace("00"),
    oneZeroOneZero: generateNfaTrace("1010")
  }
} as const;

export function finalStatusText(trace: NfaTrace, lang: Locale): string {
  if (trace.accepted) {
    return lang === "en"
      ? `Whole input accepted: final active set ${formatStateSet(trace.finalActiveStates)} intersects F = {q2}.`
      : `整个输入被接受：最终活跃集合 ${formatStateSet(trace.finalActiveStates)} 与 F = {q2} 相交。`;
  }
  return lang === "en"
    ? `Whole input rejected: final active set ${formatStateSet(trace.finalActiveStates)} has no accepting branch.`
    : `整个输入被拒绝：最终活跃集合 ${formatStateSet(trace.finalActiveStates)} 中没有接受分支。`;
}
