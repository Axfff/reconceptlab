import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type Bit = 0 | 1;
export type InputId = "x1" | "x2" | "x3";
export type GateId = "g1" | "g2" | "z";
export type CircuitValueId = InputId | GateId;
export type Assignment = Record<InputId, Bit>;

export type CircuitGate = {
  id: GateId;
  op: "AND" | "OR" | "NOT";
  inputs: CircuitValueId[];
};

export type Circuit = {
  inputs: InputId[];
  gates: CircuitGate[];
  output: GateId;
};

export type CircuitTraceStep = {
  gateId: GateId;
  op: CircuitGate["op"];
  inputValues: boolean[];
  outputValue: boolean;
  explanation: LocalizedText;
};

export type PnpStateId =
  | "initial-unknown"
  | "try-000"
  | "try-failed-candidate"
  | "accepting-candidate"
  | "verifier-accepts"
  | "verifier-rejects-malformed"
  | "candidate-exists"
  | "candidate-failed"
  | "p-subset-np-yes"
  | "p-subset-np-no";

export type GrowthFixture = "fixed-toy-circuit" | "scaling-thought-experiment";

export type GrowthState = {
  fixture: GrowthFixture;
  variables: number;
  assignments: number;
  gateCount: number;
  checkSteps: number;
};

export const circuit: Circuit = {
  inputs: ["x1", "x2", "x3"],
  gates: [
    { id: "g1", op: "AND", inputs: ["x1", "x2"] },
    { id: "g2", op: "NOT", inputs: ["x3"] },
    { id: "z", op: "OR", inputs: ["g1", "g2"] }
  ],
  output: "z"
};

export const candidateRows: Array<{
  id: "110" | "000" | "011";
  assignment: Assignment;
  result: boolean;
  label: LocalizedText;
}> = [
  {
    id: "110",
    assignment: { x1: 1, x2: 1, x3: 0 },
    result: true,
    label: {
      en: "accepting certificate",
      zh: "可接受的证书"
    }
  },
  {
    id: "000",
    assignment: { x1: 0, x2: 0, x3: 0 },
    result: true,
    label: {
      en: "another opening key",
      zh: "另一把能打开的钥匙"
    }
  },
  {
    id: "011",
    assignment: { x1: 0, x2: 1, x3: 1 },
    result: false,
    label: {
      en: "failed candidate",
      zh: "失败的候选证书"
    }
  }
];

export const stateIds: PnpStateId[] = [
  "initial-unknown",
  "try-000",
  "try-failed-candidate",
  "accepting-candidate",
  "verifier-accepts",
  "verifier-rejects-malformed",
  "candidate-exists",
  "candidate-failed",
  "p-subset-np-yes",
  "p-subset-np-no"
];

export const demoTabs = ["search all assignments", "check certificate", "P subset NP"] as const;

export function assignmentLabel(assignment: Assignment) {
  return `${assignment.x1}${assignment.x2}${assignment.x3}`;
}

function bitToBool(bit: Bit) {
  return bit === 1;
}

function evaluateGate(op: CircuitGate["op"], inputValues: boolean[]) {
  if (op === "AND") return inputValues.every(Boolean);
  if (op === "OR") return inputValues.some(Boolean);
  return !inputValues[0];
}

export function verifyCircuit(targetCircuit: Circuit, assignment: Partial<Record<string, unknown>>) {
  const inputIds = new Set(targetCircuit.inputs);
  if (Object.keys(assignment).length !== inputIds.size) {
    return { accepted: false, reason: "malformed" as const, trace: [] as CircuitTraceStep[] };
  }

  const values = new Map<CircuitValueId, boolean>();
  for (const inputId of targetCircuit.inputs) {
    const value = assignment[inputId];
    if (value !== 0 && value !== 1) {
      return { accepted: false, reason: "malformed" as const, trace: [] as CircuitTraceStep[] };
    }
    values.set(inputId, bitToBool(value));
  }

  const trace: CircuitTraceStep[] = [];
  for (const gate of targetCircuit.gates) {
    const inputValues = gate.inputs.map((input) => values.get(input));
    if (inputValues.some((value) => value === undefined)) {
      return { accepted: false, reason: "malformed" as const, trace: [] };
    }
    const outputValue = evaluateGate(gate.op, inputValues as boolean[]);
    values.set(gate.id, outputValue);
    trace.push({
      gateId: gate.id,
      op: gate.op,
      inputValues: inputValues as boolean[],
      outputValue,
      explanation: {
        en: `${gate.id}: ${gate.op} receives ${inputValues.map((value) => (value ? "1" : "0")).join(", ")} and outputs ${outputValue ? "1" : "0"}.`,
        zh: `${gate.id}: ${gate.op} 输入 ${inputValues.map((value) => (value ? "1" : "0")).join(", ")}，输出 ${outputValue ? "1" : "0"}。`
      }
    });
  }

  return { accepted: values.get(targetCircuit.output) === true, reason: "evaluated" as const, trace };
}

export function growthState(variables: number, fixture: GrowthFixture = "scaling-thought-experiment"): GrowthState {
  const safeVariables = Math.min(Math.max(Math.round(variables), 3), 30);
  const gateCount = fixture === "fixed-toy-circuit" ? 3 : 2 * safeVariables;
  return {
    fixture,
    variables: fixture === "fixed-toy-circuit" ? 3 : safeVariables,
    assignments: 2 ** (fixture === "fixed-toy-circuit" ? 3 : safeVariables),
    gateCount,
    checkSteps: (fixture === "fixed-toy-circuit" ? 3 : safeVariables) + gateCount
  };
}

export const classifierItems = [
  {
    id: "even-42",
    prompt: {
      en: "Is 42 even?",
      zh: "42 是偶数吗？"
    },
    answer: {
      en: "Definitely in P: compute 42 % 2 directly with an explicit polynomial-time algorithm.",
      zh: "明确属于 P：直接计算 42 % 2，这是一个显式的多项式时间算法。"
    }
  },
  {
    id: "sudoku-grid",
    prompt: {
      en: "Given a filled Sudoku grid, is it valid?",
      zh: "给定一个填好的数独盘面，它有效吗？"
    },
    answer: {
      en: "In NP by checking: the filled grid is a certificate that can be checked row, column, and box by box.",
      zh: "可通过检查说明在 NP 中：填好的盘面是证书，可以逐行、逐列、逐宫检查。"
    }
  },
  {
    id: "find-route",
    prompt: {
      en: "Find the shortest route from A to B.",
      zh: "找到从 A 到 B 的最短路线。"
    },
    answer: {
      en: "Not a decision problem yet: convert it to 'Is there a route from A to B with length <= K?' first.",
      zh: "还不是判定问题：先转成“是否存在一条从 A 到 B 且长度 <= K 的路线？”"
    }
  },
  {
    id: "route-limit",
    prompt: {
      en: "Given a route and a limit K, is the route length <= K?",
      zh: "给定一条路线和上限 K，路线长度是否 <= K？"
    },
    answer: {
      en: "Polynomial verifier only: sum the route distances and compare with K.",
      zh: "这是多项式时间验证器：把路线长度相加，再与 K 比较。"
    }
  },
  {
    id: "circuit-sat",
    prompt: {
      en: "Does this Boolean circuit have an assignment that outputs 1?",
      zh: "这个布尔电路是否存在某个赋值能输出 1？"
    },
    answer: {
      en: "In NP by certificate: a proposed assignment can be checked gate by gate in polynomial time.",
      zh: "通过证书可说明在 NP 中：给定一个赋值后，可以逐个门在多项式时间内检查。"
    }
  }
] as const;

export function textFor(lang: Locale, en: string, zh: string) {
  return lang === "en" ? en : zh;
}
