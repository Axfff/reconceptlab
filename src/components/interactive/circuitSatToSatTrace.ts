import type { Locale } from "../../i18n/locales";
import {
  assignmentRows,
  circuitSatCircuit,
  evaluateCircuit,
  isLocalizedError,
  parseAssignmentString,
  type AssignmentString,
  type Bit,
  type Circuit,
  type Gate,
  type GateId,
  type GateOp,
  type LocalizedText,
  type WireId
} from "./circuitSatTrace";

export type FormulaNode = 
  | { kind: "var"; name: string }
  | { kind: "not"; child: FormulaNode }
  | { kind: "and"; left: FormulaNode; right: FormulaNode }
  | { kind: "or"; left: FormulaNode; right: FormulaNode };

export type GateEncoding = {
  gate: Gate;
  blueprint: string;
  emitted: {
    clauses: [FormulaNode, FormulaNode];
    conjunction: FormulaNode;
  };
  emittedText: {
    clauses: [string, string];
    conjunction: string;
  };
};

export type ReductionTraceStep =
  | {
      kind: "gate";
      gateIndex: number;
      gateId: GateId;
      helperVar: GateId;
      inputSnapshot: Array<{ id: WireId; value: Bit }>;
      storedValues: Array<{ id: WireId; value: Bit }>;
      blueprint: string;
      emittedFormula: string;
      emittedSoFar: string[];
      clauseValues: [Bit, Bit];
      constraintSatisfied: boolean;
      explanation: LocalizedText;
    }
  | {
      kind: "assert-output";
      emittedSoFar: string[];
      finalFormulaValue: Bit;
      outputValue: Bit;
      gateConstraintSatisfied: boolean;
      explanation: LocalizedText;
    };

export type ReductionTraceRun =
  | {
      status: "ok";
      assignment: AssignmentString;
      steps: ReductionTraceStep[];
      finalFormulaValue: Bit;
      outputValue: Bit;
      gateValues: Array<{ id: WireId; value: Bit }>;
    }
  | {
      status: "malformed";
      assignment: string;
      steps: [];
      malformedReason: LocalizedText;
    };

export type MisconceptionCard = {
  id: "blueprint-only" | "skip-final-z" | "wrong-order" | "mix-input-helper";
  title: LocalizedText;
  prompt: LocalizedText;
  fix: LocalizedText;
};

export type PracticeCard = {
  id: "answer-preserve-yes" | "assertion-only" | "extension-keeps" | "malformed-guard";
  fixtureId: AssignmentString | "malformed-101";
  expected: "accept" | "reject" | "malformed" | "both" | "needs-extension";
  prompt: LocalizedText;
  choices: Array<{
    id: string;
    correct: boolean;
    label: LocalizedText;
  }>;
  explanation: LocalizedText;
};

export type GateBuilderRow = {
  step: number;
  gateId: GateId;
  helperVar: GateId;
  blueprint: string;
  emitted: string;
};

export type AssignmentExtensionRow = {
  assignment: AssignmentString;
  inputValues: Array<{ id: "x1" | "x2" | "x3" | "x4"; value: Bit }>;
  extendedValues: Array<{ id: WireId; value: Bit }>;
  restrictedValues: Array<{ id: "x1" | "x2" | "x3" | "x4"; value: Bit }>;
};

export type AnswerPreservationRow = {
  assignment: AssignmentString;
  circuitOutput: Bit;
  reductionOutput: Bit;
  reductionOutputNoZ: Bit;
  note: LocalizedText;
  gateConstraintConjunction: Bit;
};

export type ConsistencyRailRow = {
  gateId: GateId;
  inputRefs: WireId[];
  statement: LocalizedText;
};

export type OutputAssertionContrastRow = {
  assignment: AssignmentString;
  gateConstraintValue: Bit;
  zValue: Bit;
  finalValue: Bit;
  statement: LocalizedText;
};

export type SizeRow = {
  id: string;
  label: LocalizedText;
  value: number;
};

export type GateGadgetTruthRow = {
  input: string;
  output: Bit;
};

export type GateGadgetRow = {
  id: string;
  op: GateOp;
  blueprint: string;
  emitted: string;
  truth: GateGadgetTruthRow[];
  label: LocalizedText;
  note: LocalizedText;
};

export type VariableRoleLegend = {
  inputs: LocalizedText;
  helpers: LocalizedText;
};

export const sourceCircuit: Circuit = circuitSatCircuit;
const topologicalGateOrder = sourceCircuit.gates.map((gate) => gate.id);

function varNode(name: string): FormulaNode {
  return { kind: "var", name };
}

function notNode(child: FormulaNode): FormulaNode {
  return { kind: "not", child };
}

function andNode(left: FormulaNode, right: FormulaNode): FormulaNode {
  return { kind: "and", left, right };
}

function orNode(left: FormulaNode, right: FormulaNode): FormulaNode {
  return { kind: "or", left, right };
}

function stringifyFormula(node: FormulaNode): string {
  if (node.kind === "var") return node.name;
  if (node.kind === "not") {
    if (node.child.kind === "var") return `NOT ${node.child.name}`;
    return `NOT (${stringifyFormula(node.child)})`;
  }
  const operator = node.kind === "and" ? "AND" : "OR";
  return `(${stringifyFormula(node.left)} ${operator} ${stringifyFormula(node.right)})`;
}

export function evaluateFormula(node: FormulaNode, values: ReadonlyMap<string, Bit>): Bit {
  if (node.kind === "var") {
    const value = values.get(node.name);
    if (value === undefined) {
      throw new Error(`Unknown variable ${node.name}`);
    }
    return value;
  }
  if (node.kind === "not") {
    return evaluateFormula(node.child, values) === 1 ? 0 : 1;
  }
  const left = evaluateFormula(node.left, values);
  const right = evaluateFormula(node.right, values);
  if (node.kind === "and") return left === 1 && right === 1 ? 1 : 0;
  return left === 1 || right === 1 ? 1 : 0;
}

function buildEmission(gate: Gate): GateEncoding {
  const gateExpr = varNode(gate.id);
  const rhs =
    gate.op === "NOT"
      ? notNode(varNode(gate.inputs[0]))
      : gate.op === "AND"
        ? andNode(varNode(gate.inputs[0]), varNode(gate.inputs[1]))
        : orNode(varNode(gate.inputs[0]), varNode(gate.inputs[1]));

  const clause1 = orNode(notNode(gateExpr), rhs);
  const clause2 = orNode(notNode(rhs), gateExpr);
  const conjunction = andNode(clause1, clause2);

  return {
    gate,
    blueprint: `${gate.id} <-> (${gate.expression})`,
    emitted: {
      clauses: [clause1, clause2],
      conjunction
    },
    emittedText: {
      clauses: [stringifyFormula(clause1), stringifyFormula(clause2)],
      conjunction: `(${stringifyFormula(clause1)}) AND (${stringifyFormula(clause2)})`
    }
  };
}

function andChain(nodes: FormulaNode[]): FormulaNode {
  if (nodes.length === 0) {
    throw new Error("andChain expects at least one node");
  }
  return nodes.slice(1).reduce((acc, node) => andNode(acc, node), nodes[0]);
}

function formatValues(values: Map<WireId, Bit>): Array<{ id: WireId; value: Bit }> {
  return [...sourceCircuit.inputs, ...sourceCircuit.gates.map((gate) => gate.id)].reduce<
    Array<{ id: WireId; value: Bit }>
  >((acc, id) => {
    const value = values.get(id);
    if (value !== undefined) acc.push({ id, value });
    return acc;
  }, []);
}

function asBit(value: boolean): Bit {
  return value ? 1 : 0;
}

function isGateTraceStep(step: ReductionTraceStep): step is Extract<ReductionTraceStep, { kind: "gate" }> {
  return step.kind === "gate";
}

export const gateEncodings: GateEncoding[] = sourceCircuit.gates.map(buildEmission);
export const canonicalGateOrder = gateEncodings.map((entry) => entry.gate.id);
export const finalConstraint = andChain([
  ...gateEncodings.map((entry) => entry.emitted.conjunction),
  varNode(sourceCircuit.output)
]);
export const finalFormulaText = `${gateEncodings
  .map((encoding) => `(${encoding.emittedText.conjunction})`)
  .join(" AND ")} AND z`;

export function reductionTraceForAssignment(value: string): ReductionTraceRun {
  const parsed = parseAssignmentString(value, sourceCircuit);
  const assignmentString = value as AssignmentString;

  if (isLocalizedError(parsed)) {
    return {
      status: "malformed",
      assignment: value,
      steps: [],
      malformedReason: {
        en: parsed.en,
        zh: parsed.zh
      }
    };
  }

  const circuitResult = evaluateCircuit(sourceCircuit, value);
  if (circuitResult.result === "malformed") {
    return {
      status: "malformed",
      assignment: value,
      steps: [],
      malformedReason: {
        en: circuitResult.validationError?.en ?? "malformed certificate",
        zh: circuitResult.validationError?.zh ?? "格式错误的证书"
      }
    };
  }

  const values = new Map<WireId, Bit>();
  for (const input of sourceCircuit.inputs) values.set(input, parsed[input]);
  const emittedSoFar: string[] = [];
  const steps: ReductionTraceStep[] = [];

  const gateSteps = circuitResult.gateSteps;
  if (gateSteps.length !== sourceCircuit.gates.length) {
    throw new Error(`expected ${sourceCircuit.gates.length} gate steps, got ${gateSteps.length}`);
  }

  for (let index = 0; index < gateEncodings.length; index += 1) {
    const encoding = gateEncodings[index];
    const gateStep = gateSteps[index];
    if (!gateStep || gateStep.id !== topologicalGateOrder[index]) {
      throw new Error(`unexpected gate order, expected ${topologicalGateOrder[index]} got ${gateStep?.id}`);
    }

    values.set(gateStep.id, gateStep.output);
    const clauseValues: [Bit, Bit] = [
      evaluateFormula(encoding.emitted.clauses[0], values),
      evaluateFormula(encoding.emitted.clauses[1], values)
    ];
    const currentConstraint = clauseValues[0] === 1 && clauseValues[1] === 1 ? 1 : 0;
    emittedSoFar.push(encoding.emittedText.conjunction);

    steps.push({
      kind: "gate",
      gateIndex: index,
      gateId: encoding.gate.id,
      helperVar: encoding.gate.id,
      inputSnapshot: gateStep.inputs,
      storedValues: formatValues(values),
      blueprint: encoding.blueprint,
      emittedFormula: encoding.emittedText.conjunction,
      emittedSoFar: [...emittedSoFar],
      clauseValues,
      constraintSatisfied: currentConstraint === 1,
      explanation: {
        en: `Emit emitted gate constraint for ${encoding.gate.id}: "${encoding.emittedText.conjunction}"`,
        zh: `按 ${encoding.gate.id} 的输入发出局部门约束`
      }
    });
  }

  const gateConstraintSatisfied = steps
    .filter((step): step is Extract<ReductionTraceStep, { kind: "gate" }> => step.kind === "gate")
    .every((step) => step.constraintSatisfied);
  const outputValue = circuitResult.output === null ? 0 : circuitResult.output;
  const finalFormulaValue = evaluateFormula(finalConstraint, values);

  return {
    status: "ok",
    assignment: assignmentString,
    steps: [
      ...steps,
      {
        kind: "assert-output",
        emittedSoFar: [...emittedSoFar, "z"],
        finalFormulaValue,
        outputValue,
        gateConstraintSatisfied,
        explanation: {
          en: "Append final output assertion AND z so gate consistency is tied to acceptance.",
          zh: "追加输出约束 AND z，把门一致性与接收答案绑定。"
        }
      }
    ],
    finalFormulaValue,
    outputValue,
    gateValues: formatValues(values)
  };
}

export const builderRows: GateBuilderRow[] = gateEncodings.map((encoding, index) => ({
  step: index + 1,
  gateId: encoding.gate.id,
  helperVar: encoding.gate.id,
  blueprint: encoding.blueprint,
  emitted: encoding.emittedText.conjunction
}));

export const answerPreservationRows: AnswerPreservationRow[] = assignmentRows
  .filter((row) => ["1010", "0101", "0000"].includes(row.assignment))
  .map((fixtureRow) => {
    const run = reductionTraceForAssignment(fixtureRow.assignment);
    if (run.status === "malformed") {
      throw new Error(`assignment ${fixtureRow.assignment} should be well-formed`);
    }

    const gateConstraintConjunction = run.steps
      .filter((step): step is Extract<ReductionTraceStep, { kind: "gate" }> => step.kind === "gate")
      .every((step) => step.constraintSatisfied)
      ? 1
      : 0;

    const noFinalZ = run.steps.reduce<Bit>(
      (acc, step) => (isGateTraceStep(step) ? asBit(acc === 1 && step.constraintSatisfied) : acc),
      1
    );

    return {
      assignment: fixtureRow.assignment,
      circuitOutput: fixtureRow.output,
      reductionOutput: run.finalFormulaValue,
      reductionOutputNoZ: noFinalZ,
      gateConstraintConjunction,
      note: rowNoteForAssignment(fixtureRow.assignment, noFinalZ)
    };
  });

function rowNoteForAssignment(assignment: AssignmentString, noZ: Bit): LocalizedText {
  if (assignment === "0000") {
    return {
      en: "All gate constraints are true, but AND z keeps this one rejecting.",
      zh: "所有局部门约束为真，但 AND z 会继续拒绝。"
    };
  }
  if (noZ === 0) {
    return {
      en: "Gate constraints already fail on this row; final formula can fail too.",
      zh: "该行的门约束已不成立，最终公式也会失败。"
    };
  }
  return {
    en: "The circuit output and the reduced formula output agree on this row.",
    zh: "该赋值下电路输出与归约后的公式输出一致。"
  };
}

export const outputAssertionContrastRows: OutputAssertionContrastRow[] = [
  {
    assignment: "0000",
    gateConstraintValue: 1,
    zValue: 0,
    finalValue: 0,
    statement: {
      en: "Consistency-only assignment that would satisfy all emitted gates but must be rejected by AND z.",
      zh: "只满足一致性的赋值会让所有门约束成立，但 AND z 会拒绝它。"
    }
  }
];

export const assignmentExtensionRows: AssignmentExtensionRow[] = ["1010", "0101"].map((assignment) => {
  const normalizedAssignment = assignment as AssignmentString;
  const run = reductionTraceForAssignment(assignment);
  if (run.status === "malformed") {
    throw new Error(`assignment ${assignment} should be well-formed`);
  }

  return {
    assignment: normalizedAssignment,
    inputValues: run.gateValues
      .filter((item): item is { id: "x1" | "x2" | "x3" | "x4"; value: Bit } =>
        item.id === "x1" || item.id === "x2" || item.id === "x3" || item.id === "x4"
      )
      .map((item) => ({
        id: item.id,
        value: item.value
      })),
    extendedValues: run.gateValues,
    restrictedValues: run.gateValues
      .filter((item): item is { id: "x1" | "x2" | "x3" | "x4"; value: Bit } =>
        item.id === "x1" || item.id === "x2" || item.id === "x3" || item.id === "x4"
      )
      .map((item) => ({
        id: item.id,
        value: item.value
      }))
  };
});

export const consistencyRailRows: ConsistencyRailRow[] = gateEncodings.map((encoding) => ({
  gateId: encoding.gate.id,
  inputRefs: encoding.gate.inputs,
  statement: {
    en: `${encoding.gate.id} is set from already-known earlier values: ${encoding.gate.inputs.join(", ")}.`,
    zh: `${encoding.gate.id} 由已处理过的更早节点值决定：${encoding.gate.inputs.join(", ")}。`
  }
}));

export const duplicatedSubgraphData = {
  before: "h=(a OR b); p=h AND c; q=h AND d; z=p OR q",
  after: "z=((a OR b) AND c) OR ((a OR b) AND d)",
  copyCount: {
    before: {
      en: "shared sub-expression h used once",
      zh: "共享子表达式 h 只使用一次"
    },
    after: {
      en: "inline form uses h twice",
      zh: "内联后 h 被使用两次"
    }
  },
  note: {
    en: "Flattening fan-out by full substitution duplicates large shared subcircuits.",
    zh: "对 fan-out 全部展开会重复共享子电路。"
  }
};

export const gadgetRows: GateGadgetRow[] = [
  {
    id: "gadget-and",
    op: "AND",
    blueprint: "g <-> (u AND v)",
    emitted: "(NOT g OR (u AND v)) AND (NOT (u AND v) OR g)",
    truth: [
      { input: "00", output: 0 },
      { input: "01", output: 0 },
      { input: "10", output: 0 },
      { input: "11", output: 1 }
    ],
    label: {
      en: "AND gadget",
      zh: "AND 门模板"
    },
    note: {
      en: "Two inputs, one helper variable, constant-size emitted constraints.",
      zh: "两个输入、一个辅助变量、常数规模约束。"
    }
  },
  {
    id: "gadget-or",
    op: "OR",
    blueprint: "g <-> (u OR v)",
    emitted: "(NOT g OR (u OR v)) AND (NOT (u OR v) OR g)",
    truth: [
      { input: "00", output: 0 },
      { input: "01", output: 1 },
      { input: "10", output: 1 },
      { input: "11", output: 1 }
    ],
    label: {
      en: "OR gadget",
      zh: "OR 门模板"
    },
    note: {
      en: "Same shape as AND; only the rhs connective changes.",
      zh: "结构同 AND，只是 RHS 运算符改为 OR。"
    }
  },
  {
    id: "gadget-not",
    op: "NOT",
    blueprint: "g <-> NOT u",
    emitted: "(NOT g OR NOT u) AND (u OR g)",
    truth: [
      { input: "0", output: 1 },
      { input: "1", output: 0 }
    ],
    label: {
      en: "NOT gadget",
      zh: "NOT 门模板"
    },
    note: {
      en: "Unary form uses one input and the same encoding style.",
      zh: "一元形式只用一个输入，编码风格一致。"
    }
  }
];

export const variableRoleLegend: VariableRoleLegend = {
  inputs: {
    en: "Input variables x1..x4 are problem variables (same names as Circuit-SAT inputs).",
    zh: "输入变量 x1..x4 是问题变量（与 Circuit-SAT 输入同名）。"
  },
  helpers: {
    en: "Helper variables n1, g1, g2, g3, g4, and z are the circuit gate outputs.",
    zh: "辅助变量 n1, g1, g2, g3, g4, z 对应电路的门输出。"
  }
};

export const sizeRows: SizeRow[] = [
  { id: "inputs", label: { en: "Inputs", zh: "输入变量" }, value: sourceCircuit.inputs.length },
  { id: "helpers", label: { en: "Helper vars", zh: "辅助变量" }, value: sourceCircuit.gates.length },
  { id: "constraints", label: { en: "Gate constraints", zh: "门约束" }, value: sourceCircuit.gates.length },
  { id: "assertion", label: { en: "Final output assertion", zh: "最终输出约束" }, value: 1 }
];

export const cheatedAssignment: Array<{ id: WireId; value: Bit }> = [
  { id: "x1", value: 0 },
  { id: "x2", value: 0 },
  { id: "x3", value: 0 },
  { id: "x4", value: 0 },
  { id: "n1", value: 1 },
  { id: "g1", value: 1 },
  { id: "g2", value: 0 },
  { id: "g3", value: 0 },
  { id: "g4", value: 0 },
  { id: "z", value: 0 }
];

export const cheatedConstraint: { gateId: GateId; text: LocalizedText } = {
  gateId: "g1",
  text: {
    en: "NOT g1 OR (x1 AND n1) is false because x1=0 and n1=1 but g1=1.",
    zh: "NOT g1 OR (x1 AND n1) 为假，因为 x1=0,n1=1 但 g1=1。"
  }
};

export const reductionMisconceptions: MisconceptionCard[] = [
  {
    id: "blueprint-only",
    title: {
      en: "Blueprint is the actual formula",
      zh: "蓝图就是实际公式"
    },
    prompt: {
      en: "It looks simpler to write `g <-> expr` everywhere, so we can keep that as the output instance.",
      zh: "写 `g <-> expr` 很简洁，直接当作输出公式可以吗？"
    },
    fix: {
      en: "No. `<->` is readable shorthand for local comparison. Accumulated SAT output must only use AND/OR/NOT.",
      zh: "不行。`<->` 只是本地可读写法，累积的 SAT 输出必须只用 AND/OR/NOT。"
    }
  },
  {
    id: "skip-final-z",
    title: {
      en: "Skipping the final output assertion",
      zh: "遗漏最终输出约束"
    },
    prompt: {
      en: "If each gate variable matches its local rule, then satisfiability is preserved without extra clauses.",
      zh: "每个门一致即可，不需要额外约束输出。"
    },
    fix: {
      en: "Consistency constraints alone can be true even when the circuit output gate is 0. `AND z` is required.",
      zh: "仅有局部一致性约束时，电路输出可能为 0，仍可能满足。必须追加 `AND z`。"
    }
  },
  {
    id: "wrong-order",
    title: {
      en: "Constraint order does not matter",
      zh: "约束顺序无关"
    },
    prompt: {
      en: "Emit constraints in any order; topological input order is only a coding detail.",
      zh: "约束顺序随意写即可，拓扑顺序只是实现细节。"
    },
    fix: {
      en: "The backward proof needs a deterministic walk over topological order so every emitted RHS already has earlier values.",
      zh: "反向证明要求按拓扑顺序逐步推导，门的 RHS 必须来自已知值。"
    }
  },
  {
    id: "mix-input-helper",
    title: {
      en: "Only original inputs are variables",
      zh: "只要输入变量"
    },
    prompt: {
      en: "Helper gate variables are not needed; only x1..x4 should appear in the formula.",
      zh: "不需要辅助变量，只出现 x1..x4 即可。"
    },
    fix: {
      en: "Every non-input node keeps its own helper variable (n1, g1, g2, g3, g4, z) so constraints are local.",
      zh: "每个非输入节点都要自己的辅助变量（n1, g1, g2, g3, g4, z）来做局部约束。"
    }
  }
];

export const practiceCards: PracticeCard[] = [
  {
    id: "answer-preserve-yes",
    fixtureId: "1010",
    expected: "accept",
    prompt: {
      en: "If circuit assignment 1010 is satisfying, what should the reduced SAT instance do on the same extension?",
      zh: "电路赋值 1010 满足时，归约后的 SAT 实例在对应扩展上应如何？"
    },
    choices: [
      { id: "accept", correct: true, label: { en: "accept", zh: "接受" } },
      { id: "reject", correct: false, label: { en: "reject", zh: "拒绝" } }
    ],
    explanation: {
      en: "Extend 1010 with all gate outputs. Each gate constraint and final z are satisfied.",
      zh: "把 1010 与所有门输出扩展后，所有门约束和 z 都被满足。"
    }
  },
  {
    id: "assertion-only",
    fixtureId: "0000",
    expected: "both",
    prompt: {
      en: "For 0000, gate constraints are true. What does final conjunction require?",
      zh: "对 0000，门约束都为真，最终合取还要什么？"
    },
    choices: [
      { id: "only-gates", correct: false, label: { en: "Only local gate constraints", zh: "只要门约束" } },
      { id: "and-z", correct: true, label: { en: "and-z too", zh: "还要 AND z" } }
    ],
    explanation: {
      en: "Without AND z, this row would wrongly satisfy the instance. AND z blocks it.",
      zh: "没有 AND z，这行会错误地满足；AND z 会把它拦住。"
    }
  },
  {
    id: "extension-keeps",
    fixtureId: "0101",
    expected: "needs-extension",
    prompt: {
      en: "In the backward direction, a satisfying formula assignment is first restricted to inputs. What is kept?",
      zh: "反向方向先做限制到输入，应该保留什么？"
    },
    choices: [
      { id: "keep-all", correct: false, label: { en: "keep all gate values and outputs", zh: "保留全部门值和输入" } },
      { id: "keep-inputs", correct: true, label: { en: "keep input variables only", zh: "只保留输入变量" } },
      { id: "drop-inputs", correct: false, label: { en: "drop inputs first", zh: "先丢弃输入" } }
    ],
    explanation: {
      en: "To rebuild circuit values, keep only x1..x4, then recompute each gate in topological order.",
      zh: "先保留 x1..x4，再按拓扑顺序重算每个门。"
    }
  },
  {
    id: "malformed-guard",
    fixtureId: "malformed-101",
    expected: "malformed",
    prompt: {
      en: "Which behavior is correct for assignment `101`?",
      zh: "对 `101`，正确行为是什么？"
    },
    choices: [
      { id: "run-partial", correct: false, label: { en: "run partial gate steps", zh: "运行部分门步骤" } },
      { id: "malformed", correct: true, label: { en: "reject as malformed before any gate", zh: "先判为格式错误，不运行门" } }
    ],
    explanation: {
      en: "Malformed assignments stop before gate emission and formula accumulation.",
      zh: "格式错误在门发射与公式累积前就已拒绝。"
    }
  }
];

export function allPracticeFixtureIds(): Set<string> {
  return new Set(practiceCards.map((card) => card.fixtureId));
}

export function topologicalOrderIsValid(): boolean {
  return canonicalGateOrder.every((gateId, index) => gateId === topologicalGateOrder[index]);
}

export const sizeClaimText: Record<Locale, string> = {
  en: "Each of 6 non-input nodes contributes one helper variable and one constant-size gadget; plus final z, so |Φ_C| = O(|C|).",
  zh: "每个非输入节点贡献一个辅助变量和一个常数规模门模板；加上最终 z，故 |Φ_C| = O(|C|)。"
};

export const graphCardText: Record<Locale, string> = {
  en: "This bridge is now a concrete source->target reduction between already-known nodes.",
  zh: "该归约把已知的源问题与目标问题连接成一条可执行的桥。"
};

export const formalBlueprintText: Record<Locale, string> = {
  en: "Φ_C = z ∧ (∧_{g in Gates(C)} emit(g)), where emit uses only AND/OR/NOT.",
  zh: "Φ_C = z ∧ (∧_{g in Gates(C)} emit(g))，每个 emit(g) 仅由 AND/OR/NOT 构成。"
};
