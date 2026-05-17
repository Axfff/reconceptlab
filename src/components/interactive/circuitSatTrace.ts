import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type Bit = 0 | 1;
export type InputId = "x1" | "x2" | "x3" | "x4";
export type GateId = "n1" | "g1" | "g2" | "g3" | "g4" | "z";
export type WireId = InputId | GateId;
export type GateOp = "AND" | "OR" | "NOT";
export type Assignment = Record<InputId, Bit>;
export type AssignmentString = `${Bit}${Bit}${Bit}${Bit}`;
export type CertificateResult = "accept" | "reject" | "malformed";

export type Gate = {
  id: GateId;
  op: GateOp;
  inputs: WireId[];
  expression: string;
};

export type Circuit = {
  inputs: InputId[];
  gates: Gate[];
  output: GateId;
  wireCount: number;
};

export type GateTraceStep = {
  kind: "gate";
  id: GateId;
  op: GateOp;
  inputs: Array<{ id: WireId; value: Bit }>;
  output: Bit;
  storedValues: Array<{ id: WireId; value: Bit }>;
};

export type ValidationTraceStep = {
  kind: "validation";
  id: "validation";
  valid: boolean;
  message: LocalizedText;
  assignmentString: string;
  storedValues: Array<{ id: WireId; value: Bit }>;
};

export type FinalTraceStep = {
  kind: "final";
  id: "final-output";
  output: Bit;
  accepted: boolean;
  message: LocalizedText;
  storedValues: Array<{ id: WireId; value: Bit }>;
};

export type CircuitSatTraceStep = ValidationTraceStep | GateTraceStep | FinalTraceStep;

export type EvaluationResult =
  | {
      result: "accept" | "reject";
      assignment: Assignment;
      assignmentString: AssignmentString;
      output: Bit;
      steps: CircuitSatTraceStep[];
      gateSteps: GateTraceStep[];
      validationError: null;
    }
  | {
      result: "malformed";
      assignment: null;
      assignmentString: string;
      output: null;
      steps: CircuitSatTraceStep[];
      gateSteps: [];
      validationError: LocalizedText;
    };

export type NamedAssignmentEntry = {
  name: string;
  value: Bit;
};

export type AssignmentFixtureRow = {
  id: "row-1010" | "row-0101" | "row-0000" | "row-1111" | "row-1000";
  assignment: AssignmentString;
  result: "accept" | "reject";
  output: Bit;
  reasonBadge: LocalizedText;
  note: LocalizedText;
};

export type MalformedFixture = {
  id: "malformed-length" | "malformed-non-bit" | "malformed-missing-name" | "malformed-duplicate-name" | "malformed-unknown-name";
  certificate: string | NamedAssignmentEntry[];
  reason: LocalizedText;
};

export type MisconceptionCard = {
  id: "failed-row-proves-no" | "trace-proves-hardness" | "certificate-finds-it" | "malformed-runs-gates";
  title: LocalizedText;
  misconception: LocalizedText;
  repair: LocalizedText;
};

export type PracticeCard = {
  id: "practice-accept" | "practice-reject" | "practice-wrong-length" | "practice-non-bit" | "practice-ledger";
  fixtureId: AssignmentFixtureRow["id"] | MalformedFixture["id"] | "claim-ledger";
  expected: CertificateResult | "claim-boundary";
  expectedAnswer: string;
  prompt: LocalizedText;
  choices: Array<{
    id: string;
    correct: boolean;
    label: LocalizedText;
  }>;
  explanation: LocalizedText;
};

export function textFor(lang: Locale, en: string, zh: string) {
  return lang === "zh" ? zh : en;
}

export const circuitSatCircuit: Circuit = {
  inputs: ["x1", "x2", "x3", "x4"],
  gates: [
    { id: "n1", op: "NOT", inputs: ["x2"], expression: "NOT x2" },
    { id: "g1", op: "AND", inputs: ["x1", "n1"], expression: "x1 AND n1" },
    { id: "g2", op: "OR", inputs: ["x3", "x4"], expression: "x3 OR x4" },
    { id: "g3", op: "AND", inputs: ["g1", "g2"], expression: "g1 AND g2" },
    { id: "g4", op: "AND", inputs: ["x2", "x4"], expression: "x2 AND x4" },
    { id: "z", op: "OR", inputs: ["g3", "g4"], expression: "g3 OR g4" }
  ],
  output: "z",
  wireCount: 11
};

export const canonicalTraceOrder = ["validation", "n1", "g1", "g2", "g3", "g4", "z", "final-output"] as const;

export const assignmentRows: AssignmentFixtureRow[] = [
  {
    id: "row-1010",
    assignment: "1010",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via g1 AND g2",
      zh: "通过 g1 AND g2 满足"
    },
    note: {
      en: "x1=1 and x2=0 make g1=1; x3=1 makes g2=1.",
      zh: "x1=1 且 x2=0 让 g1=1；x3=1 让 g2=1。"
    }
  },
  {
    id: "row-0101",
    assignment: "0101",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via x2 AND x4",
      zh: "通过 x2 AND x4 满足"
    },
    note: {
      en: "x2=1 and x4=1 make g4=1, so z=1.",
      zh: "x2=1 且 x4=1 让 g4=1，因此 z=1。"
    }
  },
  {
    id: "row-0000",
    assignment: "0000",
    result: "reject",
    output: 0,
    reasonBadge: {
      en: "rejecting row, not a No proof",
      zh: "拒绝这一行，不是 No 证明"
    },
    note: {
      en: "This row fails, but other rows can still turn the circuit on.",
      zh: "这一行失败，但其他行仍可能点亮电路。"
    }
  },
  {
    id: "row-1111",
    assignment: "1111",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via x2 AND x4",
      zh: "通过 x2 AND x4 满足"
    },
    note: {
      en: "Even though g1 is blocked by x2=1, g4 makes z=1.",
      zh: "虽然 x2=1 阻断了 g1，但 g4 让 z=1。"
    }
  },
  {
    id: "row-1000",
    assignment: "1000",
    result: "reject",
    output: 0,
    reasonBadge: {
      en: "rejecting row",
      zh: "拒绝这一行"
    },
    note: {
      en: "g1=1 but g2=0, so the upper path does not reach z.",
      zh: "g1=1 但 g2=0，因此上方路径不能让 z=1。"
    }
  }
];

export const malformedFixtures: MalformedFixture[] = [
  {
    id: "malformed-length",
    certificate: "101",
    reason: {
      en: "Missing a value for x4.",
      zh: "缺少 x4 的取值。"
    }
  },
  {
    id: "malformed-non-bit",
    certificate: "1020",
    reason: {
      en: "Contains 2, which is not a bit.",
      zh: "包含 2，它不是二进制位。"
    }
  },
  {
    id: "malformed-missing-name",
    certificate: [
      { name: "x1", value: 1 },
      { name: "x2", value: 0 },
      { name: "x3", value: 1 }
    ],
    reason: {
      en: "Named certificate is missing x4.",
      zh: "具名证书缺少 x4。"
    }
  },
  {
    id: "malformed-duplicate-name",
    certificate: [
      { name: "x1", value: 1 },
      { name: "x2", value: 0 },
      { name: "x2", value: 1 },
      { name: "x4", value: 0 }
    ],
    reason: {
      en: "Named certificate gives x2 twice.",
      zh: "具名证书给了两次 x2。"
    }
  },
  {
    id: "malformed-unknown-name",
    certificate: [
      { name: "x1", value: 1 },
      { name: "x2", value: 0 },
      { name: "x3", value: 1 },
      { name: "y", value: 0 }
    ],
    reason: {
      en: "Named certificate mentions y, which is not an input.",
      zh: "具名证书提到了 y，但它不是输入。"
    }
  }
];

export const assignmentGridGoldenState = {
  selectedAssignment: "1010" as AssignmentString,
  output: 1 as Bit,
  reasonBadge: "satisfying via g1 AND g2",
  expected: "accept" as const
};

export const growthGoldenState = {
  selectedInputCount: 4,
  assignmentCount: 16,
  oneCheckWorkLabel: "O(|C| + n)",
  bruteForceLabel: "16 checks for this fixture",
  reasonBadge: "search grows by doubling, checking one row follows the circuit once",
  expected: "growth comparison"
};

export const misconceptionCards: MisconceptionCard[] = [
  {
    id: "failed-row-proves-no",
    title: { en: "One failed row", zh: "一行失败" },
    misconception: {
      en: "`0000` outputs 0, so maybe the circuit is unsatisfiable.",
      zh: "`0000` 输出 0，所以也许电路不可满足。"
    },
    repair: {
      en: "A failed row rejects only that assignment. A No proof would need to rule out every row.",
      zh: "失败行只排除这个赋值。No 证明需要排除所有行。"
    }
  },
  {
    id: "trace-proves-hardness",
    title: { en: "Tiny trace", zh: "小追踪" },
    misconception: {
      en: "The fixture trace proves Circuit-SAT is NP-hard.",
      zh: "这个小追踪证明了 Circuit-SAT 是 NP-hard。"
    },
    repair: {
      en: "The trace proves checkability for one certificate. NP-hardness is the Cook-Levin theorem, only named here.",
      zh: "追踪只说明一个证书可检查。NP-hardness 来自 Cook-Levin 定理，本页只命名它。"
    }
  },
  {
    id: "certificate-finds-it",
    title: { en: "Certificate magic", zh: "证书魔法" },
    misconception: {
      en: "A verifier somehow finds the satisfying assignment.",
      zh: "验证器会自动找到满足赋值。"
    },
    repair: {
      en: "The verifier receives a proposed assignment. It checks; it does not search.",
      zh: "验证器接收候选赋值。它负责检查，不负责搜索。"
    }
  },
  {
    id: "malformed-runs-gates",
    title: { en: "Bad format", zh: "格式错误" },
    misconception: {
      en: "A short or non-bit string can still be pushed through the gates.",
      zh: "太短或含非 bit 的字符串也可以送进逻辑门。"
    },
    repair: {
      en: "Malformed certificates stop at validation with no gate steps.",
      zh: "格式错误的证书在验证阶段停止，不运行任何逻辑门。"
    }
  }
];

export const practiceCards: PracticeCard[] = [
  {
    id: "practice-accept",
    fixtureId: "row-1010",
    expected: "accept",
    expectedAnswer: "accept",
    prompt: {
      en: "What should the verifier do with certificate 1010?",
      zh: "验证器应如何处理证书 1010？"
    },
    choices: [
      { id: "accept", correct: true, label: { en: "accept", zh: "接受" } },
      { id: "reject", correct: false, label: { en: "reject", zh: "拒绝" } },
      { id: "malformed", correct: false, label: { en: "malformed", zh: "格式错误" } }
    ],
    explanation: {
      en: "1010 is well formed and makes z=1 through the upper path.",
      zh: "1010 格式正确，并通过上方路径让 z=1。"
    }
  },
  {
    id: "practice-reject",
    fixtureId: "row-0000",
    expected: "reject",
    expectedAnswer: "reject",
    prompt: {
      en: "What does 0000 prove?",
      zh: "0000 证明了什么？"
    },
    choices: [
      { id: "row-only", correct: true, label: { en: "only this row fails", zh: "只说明这一行失败" } },
      { id: "whole-no", correct: false, label: { en: "the circuit is No", zh: "整个电路是 No" } },
      { id: "malformed", correct: false, label: { en: "malformed", zh: "格式错误" } }
    ],
    explanation: {
      en: "0000 is a rejecting row, but another row such as 1010 is satisfying.",
      zh: "0000 是拒绝行，但 1010 等其他行可以满足电路。"
    }
  },
  {
    id: "practice-wrong-length",
    fixtureId: "malformed-length",
    expected: "malformed",
    expectedAnswer: "malformed certificate",
    prompt: {
      en: "How should 101 be handled?",
      zh: "应该如何处理 101？"
    },
    choices: [
      { id: "malformed", correct: true, label: { en: "malformed certificate", zh: "格式错误的证书" } },
      { id: "accept", correct: false, label: { en: "accept", zh: "接受" } },
      { id: "run-anyway", correct: false, label: { en: "run the gates anyway", zh: "仍然运行逻辑门" } }
    ],
    explanation: {
      en: "The certificate is missing x4, so gate evaluation never starts.",
      zh: "证书缺少 x4，因此不会开始计算逻辑门。"
    }
  },
  {
    id: "practice-non-bit",
    fixtureId: "malformed-non-bit",
    expected: "malformed",
    expectedAnswer: "malformed certificate",
    prompt: {
      en: "What is wrong with 1020?",
      zh: "1020 的问题是什么？"
    },
    choices: [
      { id: "non-bit", correct: true, label: { en: "2 is not a bit", zh: "2 不是 bit" } },
      { id: "reject-row", correct: false, label: { en: "ordinary reject row", zh: "普通拒绝行" } },
      { id: "accept", correct: false, label: { en: "satisfying row", zh: "满足行" } }
    ],
    explanation: {
      en: "Malformed is separate from a well-formed row whose output is 0.",
      zh: "格式错误不同于格式正确但输出为 0 的行。"
    }
  },
  {
    id: "practice-ledger",
    fixtureId: "claim-ledger",
    expected: "claim-boundary",
    expectedAnswer: "in NP proved here; NP-hard named by Cook-Levin only",
    prompt: {
      en: "Which claim is actually proved on this page?",
      zh: "本页真正证明了哪条主张？"
    },
    choices: [
      {
        id: "boundary",
        correct: true,
        label: {
          en: "in NP proved here; NP-hard named by Cook-Levin only",
          zh: "本页证明 in NP；NP-hard 只由 Cook-Levin 命名"
        }
      },
      {
        id: "fixture-hard",
        correct: false,
        label: {
          en: "the tiny fixture proves NP-hard",
          zh: "小例子证明 NP-hard"
        }
      },
      {
        id: "neither",
        correct: false,
        label: {
          en: "nothing about NP is shown",
          zh: "没有说明任何 NP 相关内容"
        }
      }
    ],
    explanation: {
      en: "A polynomial-time verifier proves membership in NP. Hardness needs the Cook-Levin theorem.",
      zh: "多项式时间验证器证明属于 NP。困难性需要 Cook-Levin 定理。"
    }
  }
];

export function assignmentCount(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 52) {
    throw new RangeError("assignmentCount expects an integer n between 0 and 52");
  }
  return 2 ** n;
}

export function assignmentToString(assignment: Assignment, circuit = circuitSatCircuit): AssignmentString {
  return circuit.inputs.map((input) => assignment[input]).join("") as AssignmentString;
}

export function parseAssignmentString(value: string, circuit = circuitSatCircuit): Assignment | LocalizedText {
  if (value.length !== circuit.inputs.length) {
    return {
      en: `malformed certificate: expected ${circuit.inputs.length} bits, received ${value.length}`,
      zh: `格式错误的证书：应有 ${circuit.inputs.length} 位，实际有 ${value.length} 位`
    };
  }

  const assignment = {} as Assignment;
  for (let index = 0; index < circuit.inputs.length; index += 1) {
    const char = value[index];
    if (char !== "0" && char !== "1") {
      return {
        en: `malformed certificate: ${char} is not 0 or 1`,
        zh: `格式错误的证书：${char} 不是 0 或 1`
      };
    }
    assignment[circuit.inputs[index]] = Number(char) as Bit;
  }
  return assignment;
}

export function parseNamedAssignment(entries: NamedAssignmentEntry[], circuit = circuitSatCircuit): Assignment | LocalizedText {
  const expected = new Set<string>(circuit.inputs);
  const seen = new Set<string>();
  const assignment = {} as Assignment;

  for (const entry of entries) {
    if (!expected.has(entry.name)) {
      return {
        en: `malformed certificate: unknown input ${entry.name}`,
        zh: `格式错误的证书：未知输入 ${entry.name}`
      };
    }
    if (seen.has(entry.name)) {
      return {
        en: `malformed certificate: duplicate input ${entry.name}`,
        zh: `格式错误的证书：重复输入 ${entry.name}`
      };
    }
    seen.add(entry.name);
    assignment[entry.name as InputId] = entry.value;
  }

  for (const input of circuit.inputs) {
    if (!seen.has(input)) {
      return {
        en: `malformed certificate: missing input ${input}`,
        zh: `格式错误的证书：缺少输入 ${input}`
      };
    }
  }

  return assignment;
}

export function isLocalizedError(value: Assignment | LocalizedText): value is LocalizedText {
  return "en" in value && "zh" in value && !("x1" in value);
}

function applyGate(op: GateOp, values: Bit[]): Bit {
  if (op === "NOT") return values[0] === 1 ? 0 : 1;
  if (op === "AND") return values.every((value) => value === 1) ? 1 : 0;
  return values.some((value) => value === 1) ? 1 : 0;
}

function storedValueList(values: Map<WireId, Bit>, circuit = circuitSatCircuit): Array<{ id: WireId; value: Bit }> {
  const order: WireId[] = [...circuit.inputs, ...circuit.gates.map((gate) => gate.id)];
  return order.filter((id) => values.has(id)).map((id) => ({ id, value: values.get(id)! }));
}

export function evaluateCircuit(circuit: Circuit, assignmentLike: string | Assignment | NamedAssignmentEntry[]): EvaluationResult {
  const parsed = typeof assignmentLike === "string"
    ? parseAssignmentString(assignmentLike, circuit)
    : Array.isArray(assignmentLike)
      ? parseNamedAssignment(assignmentLike, circuit)
      : assignmentLike;
  const assignmentString = typeof assignmentLike === "string" ? assignmentLike : Array.isArray(assignmentLike) ? entriesToDisplayString(assignmentLike) : assignmentToString(assignmentLike, circuit);

  if (isLocalizedError(parsed)) {
    const validationStep: ValidationTraceStep = {
      kind: "validation",
      id: "validation",
      valid: false,
      message: parsed,
      assignmentString,
      storedValues: []
    };
    return {
      result: "malformed",
      assignment: null,
      assignmentString,
      output: null,
      steps: [validationStep],
      gateSteps: [],
      validationError: parsed
    };
  }

  const values = new Map<WireId, Bit>();
  for (const input of circuit.inputs) values.set(input, parsed[input]);

  const validationStep: ValidationTraceStep = {
    kind: "validation",
    id: "validation",
    valid: true,
    message: {
      en: "assignment has one bit for each input",
      zh: "赋值为每个输入提供一位"
    },
    assignmentString,
    storedValues: storedValueList(values, circuit)
  };
  const gateSteps: GateTraceStep[] = [];

  for (const gate of circuit.gates) {
    const inputs = gate.inputs.map((input) => {
      const value = values.get(input);
      if (value === undefined) {
        throw new Error(`gate ${gate.id} reads ${input} before it is available`);
      }
      return { id: input, value };
    });
    const output = applyGate(gate.op, inputs.map((input) => input.value));
    values.set(gate.id, output);
    gateSteps.push({
      kind: "gate",
      id: gate.id,
      op: gate.op,
      inputs,
      output,
      storedValues: storedValueList(values, circuit)
    });
  }

  const output = values.get(circuit.output)!;
  const finalStep: FinalTraceStep = {
    kind: "final",
    id: "final-output",
    output,
    accepted: output === 1,
    message: output === 1
      ? { en: "final output z is 1, so the verifier accepts", zh: "最终输出 z 为 1，因此验证器接受" }
      : { en: "final output z is 0, so this certificate is rejected", zh: "最终输出 z 为 0，因此拒绝这个证书" },
    storedValues: storedValueList(values, circuit)
  };

  return {
    result: output === 1 ? "accept" : "reject",
    assignment: parsed,
    assignmentString: assignmentToString(parsed, circuit),
    output,
    steps: [validationStep, ...gateSteps, finalStep],
    gateSteps,
    validationError: null
  };
}

export function entriesToDisplayString(entries: NamedAssignmentEntry[]) {
  return entries.map((entry) => `${entry.name}=${entry.value}`).join(", ");
}

export function fixtureResult(assignment: AssignmentString) {
  return evaluateCircuit(circuitSatCircuit, assignment);
}

export function gateSemantics(op: GateOp, values: Bit[]) {
  return applyGate(op, values);
}

export function allPracticeFixtureIds() {
  return new Set<string>([
    ...assignmentRows.map((row) => row.id),
    ...malformedFixtures.map((row) => row.id),
    "claim-ledger"
  ]);
}
