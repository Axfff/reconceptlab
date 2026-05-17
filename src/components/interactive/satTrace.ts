import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;
export type Bit = 0 | 1;
export type VariableId = "x1" | "x2" | "x3" | "x4";
export type FormulaNodeId =
  | "x1-left"
  | "x2-left"
  | "not-x2-left"
  | "x3-left"
  | "x4-left"
  | "or-x3-x4"
  | "and-left"
  | "x2-right"
  | "x4-right"
  | "and-right"
  | "or-root";
export type FormulaOp = "var" | "not" | "and" | "or";
export type Assignment = Record<VariableId, Bit>;
export type AssignmentString = `${Bit}${Bit}${Bit}${Bit}`;
export type CertificateResult = "accept" | "reject" | "malformed";

export type VarFormulaNode = {
  id: FormulaNodeId;
  kind: "var";
  name: VariableId;
  expression: string;
};

export type NotFormulaNode = {
  id: FormulaNodeId;
  kind: "not";
  child: FormulaNode;
  expression: string;
};

export type NaryFormulaNode = {
  id: FormulaNodeId;
  kind: "and" | "or";
  children: [FormulaNode, FormulaNode, ...FormulaNode[]];
  expression: string;
};

export type FormulaNode = VarFormulaNode | NotFormulaNode | NaryFormulaNode;

export type Formula = {
  id: "phi" | "psi";
  root: FormulaNode;
  variables: VariableId[];
  size: number;
  expression: string;
};

export type FormulaTraceStep = {
  kind: "formula";
  id: FormulaNodeId;
  op: FormulaOp;
  expression: string;
  dependencies: Array<{ id: FormulaNodeId | VariableId; value: Bit }>;
  output: Bit;
  storedValues: Array<{ id: FormulaNodeId; value: Bit }>;
  explanation: LocalizedText;
};

export type ValidationTraceStep = {
  kind: "validation";
  id: "validation";
  valid: boolean;
  message: LocalizedText;
  assignmentString: string;
  storedValues: Array<{ id: FormulaNodeId; value: Bit }>;
};

export type FinalTraceStep = {
  kind: "final";
  id: "final";
  output: Bit;
  accepted: boolean;
  message: LocalizedText;
  storedValues: Array<{ id: FormulaNodeId; value: Bit }>;
};

export type SatTraceStep = ValidationTraceStep | FormulaTraceStep | FinalTraceStep;

export type EvaluationResult =
  | {
      result: "accept" | "reject";
      assignment: Assignment;
      assignmentString: AssignmentString;
      output: Bit;
      steps: SatTraceStep[];
      formulaSteps: FormulaTraceStep[];
      validationError: null;
    }
  | {
      result: "malformed";
      assignment: null;
      assignmentString: string;
      output: null;
      steps: SatTraceStep[];
      formulaSteps: [];
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
  id: "failed-row-proves-no" | "certificate-finds-it" | "sat-vs-cnf" | "malformed-runs-formula";
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

export const satFormula: Formula = {
  id: "phi",
  variables: ["x1", "x2", "x3", "x4"],
  size: 11,
  expression: "(x1 AND NOT x2 AND (x3 OR x4)) OR (x2 AND x4)",
  root: {
    id: "or-root",
    kind: "or",
    expression: "(x1 AND NOT x2 AND (x3 OR x4)) OR (x2 AND x4)",
    children: [
      {
        id: "and-left",
        kind: "and",
        expression: "x1 AND NOT x2 AND (x3 OR x4)",
        children: [
          { id: "x1-left", kind: "var", name: "x1", expression: "x1" },
          {
            id: "not-x2-left",
            kind: "not",
            expression: "NOT x2",
            child: { id: "x2-left", kind: "var", name: "x2", expression: "x2" }
          },
          {
            id: "or-x3-x4",
            kind: "or",
            expression: "x3 OR x4",
            children: [
              { id: "x3-left", kind: "var", name: "x3", expression: "x3" },
              { id: "x4-left", kind: "var", name: "x4", expression: "x4" }
            ]
          }
        ]
      },
      {
        id: "and-right",
        kind: "and",
        expression: "x2 AND x4",
        children: [
          { id: "x2-right", kind: "var", name: "x2", expression: "x2" },
          { id: "x4-right", kind: "var", name: "x4", expression: "x4" }
        ]
      }
    ]
  }
};

export const unsatContrastFormula: Formula = {
  id: "psi",
  variables: ["x1"],
  size: 4,
  expression: "x1 AND NOT x1",
  root: {
    id: "and-left",
    kind: "and",
    expression: "x1 AND NOT x1",
    children: [
      { id: "x1-left", kind: "var", name: "x1", expression: "x1" },
      {
        id: "not-x2-left",
        kind: "not",
        expression: "NOT x1",
        child: { id: "x2-left", kind: "var", name: "x1", expression: "x1" }
      }
    ]
  }
};

export const canonicalTraceOrder = [
  "validation",
  "x1-left",
  "x2-left",
  "not-x2-left",
  "x3-left",
  "x4-left",
  "or-x3-x4",
  "and-left",
  "x2-right",
  "x4-right",
  "and-right",
  "or-root",
  "final"
] as const;

export const assignmentRows: AssignmentFixtureRow[] = [
  {
    id: "row-1010",
    assignment: "1010",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via left side",
      zh: "通过左侧子公式满足"
    },
    note: {
      en: "x1=1, x2=0, and x3=1 make the three-part left side true.",
      zh: "x1=1、x2=0 且 x3=1 让三段左侧子公式为真。"
    }
  },
  {
    id: "row-0101",
    assignment: "0101",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via right side",
      zh: "通过右侧子公式满足"
    },
    note: {
      en: "x2=1 and x4=1 make the right side true, so the root OR is true.",
      zh: "x2=1 且 x4=1 让右侧子公式为真，因此根 OR 为真。"
    }
  },
  {
    id: "row-0000",
    assignment: "0000",
    result: "reject",
    output: 0,
    reasonBadge: {
      en: "rejecting row, not an unsat proof",
      zh: "拒绝这一行，不是不可满足证明"
    },
    note: {
      en: "This assignment fails, but 1010 and 0101 show the formula is still satisfiable.",
      zh: "这个赋值失败，但 1010 和 0101 说明公式仍然可满足。"
    }
  },
  {
    id: "row-1111",
    assignment: "1111",
    result: "accept",
    output: 1,
    reasonBadge: {
      en: "satisfying via right side",
      zh: "通过右侧子公式满足"
    },
    note: {
      en: "The left side is blocked by NOT x2, but x2 AND x4 is true.",
      zh: "左侧被 NOT x2 阻断，但 x2 AND x4 为真。"
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
      en: "x1 and NOT x2 are true, but x3 OR x4 is false and the right side is false.",
      zh: "x1 和 NOT x2 为真，但 x3 OR x4 为假，右侧也为假。"
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
      en: "Named certificate mentions y, which is not a formula variable.",
      zh: "具名证书提到了 y，但它不是公式变量。"
    }
  }
];

export const assignmentGridGoldenState = {
  selectedAssignment: "1010" as AssignmentString,
  output: 1 as Bit,
  reasonBadge: "satisfying via left side",
  expected: "accept" as const
};

export const growthGoldenState = {
  selectedInputCount: 4,
  assignmentCount: 16,
  oneCheckWorkLabel: "O(|phi| + n)",
  bruteForceLabel: "16 formula checks for this fixture",
  reasonBadge: "search doubles rows, checking one certificate evaluates the formula once",
  expected: "growth comparison"
};

export const unsatContrastRows = [
  { assignment: "0", output: 0 as Bit, note: { en: "x1 is false, so the left literal fails.", zh: "x1 为假，因此左侧文字失败。" } },
  { assignment: "1", output: 0 as Bit, note: { en: "NOT x1 is false, so the right literal fails.", zh: "NOT x1 为假，因此右侧文字失败。" } }
];

export const misconceptionCards: MisconceptionCard[] = [
  {
    id: "failed-row-proves-no",
    title: { en: "One failed row", zh: "一行失败" },
    misconception: {
      en: "`0000` makes phi false, so maybe phi is unsatisfiable.",
      zh: "`0000` 让 phi 为假，所以也许 phi 不可满足。"
    },
    repair: {
      en: "A failed row rejects only that assignment. Unsatisfiable means every well-formed row fails.",
      zh: "失败行只排除这个赋值。不可满足意味着每个格式正确的行都失败。"
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
      en: "The verifier receives one proposed assignment. It checks; it does not search.",
      zh: "验证器接收一个候选赋值。它负责检查，不负责搜索。"
    }
  },
  {
    id: "sat-vs-cnf",
    title: { en: "SAT versus CNF-SAT", zh: "SAT 与 CNF-SAT" },
    misconception: {
      en: "SAT must already mean a clause list in CNF.",
      zh: "SAT 一定已经表示 CNF 子句列表。"
    },
    repair: {
      en: "This node uses arbitrary parenthesized formulas. CNF and 3SAT are later normal-form nodes.",
      zh: "本节点使用任意带括号的公式。CNF 和 3SAT 是后续的范式节点。"
    }
  },
  {
    id: "malformed-runs-formula",
    title: { en: "Bad format", zh: "格式错误" },
    misconception: {
      en: "A short or non-bit string can still be evaluated as false.",
      zh: "太短或含非 bit 的字符串仍可当作 false 来计算。"
    },
    repair: {
      en: "Malformed certificates stop at validation. False is reserved for well-formed assignments.",
      zh: "格式错误的证书在验证阶段停止。false 只用于格式正确的赋值。"
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
      en: "1010 is well formed and makes the left side true.",
      zh: "1010 格式正确，并让左侧子公式为真。"
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
      { id: "whole-no", correct: false, label: { en: "phi is unsatisfiable", zh: "phi 不可满足" } },
      { id: "malformed", correct: false, label: { en: "malformed", zh: "格式错误" } }
    ],
    explanation: {
      en: "0000 is a rejecting row, but another row such as 1010 is satisfying.",
      zh: "0000 是拒绝行，但 1010 等其他行可以满足公式。"
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
      { id: "evaluate", correct: false, label: { en: "evaluate anyway", zh: "仍然求值" } }
    ],
    explanation: {
      en: "The certificate is missing x4, so formula evaluation never starts.",
      zh: "证书缺少 x4，因此不会开始公式求值。"
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
      { id: "reject-row", correct: false, label: { en: "ordinary rejecting row", zh: "普通拒绝行" } },
      { id: "accept", correct: false, label: { en: "satisfying row", zh: "满足行" } }
    ],
    explanation: {
      en: "Malformed is separate from a well-formed row whose formula value is false.",
      zh: "格式错误不同于格式正确但公式值为 false 的行。"
    }
  },
  {
    id: "practice-ledger",
    fixtureId: "claim-ledger",
    expected: "claim-boundary",
    expectedAnswer: "in NP proved here; reductions and CNF forms are future nodes",
    prompt: {
      en: "Which claim is actually proved on this page?",
      zh: "本页真正证明了哪条主张？"
    },
    choices: [
      {
        id: "boundary",
        correct: true,
        label: {
          en: "in NP proved here; reductions and CNF forms are future nodes",
          zh: "本页证明 in NP；归约和 CNF 形式留给后续节点"
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
        id: "cnf-now",
        correct: false,
        label: {
          en: "this page proves the CNF conversion",
          zh: "本页证明 CNF 转换"
        }
      }
    ],
    explanation: {
      en: "A polynomial-time verifier proves membership in NP. Reductions, CNF, and 3SAT are separate future nodes.",
      zh: "多项式时间验证器证明属于 NP。归约、CNF 和 3SAT 是后续独立节点。"
    }
  }
];

export function assignmentCount(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 52) {
    throw new RangeError("assignmentCount expects an integer n between 0 and 52");
  }
  return 2 ** n;
}

export function assignmentToString(assignment: Assignment, formula = satFormula): AssignmentString {
  return formula.variables.map((variable) => assignment[variable]).join("") as AssignmentString;
}

export function parseAssignmentString(value: string, formula = satFormula): Assignment | LocalizedText {
  if (value.length !== formula.variables.length) {
    return {
      en: `malformed certificate: expected ${formula.variables.length} bits, received ${value.length}`,
      zh: `格式错误的证书：应有 ${formula.variables.length} 位，实际有 ${value.length} 位`
    };
  }

  const assignment = {} as Assignment;
  for (let index = 0; index < formula.variables.length; index += 1) {
    const char = value[index];
    if (char !== "0" && char !== "1") {
      return {
        en: `malformed certificate: ${char} is not 0 or 1`,
        zh: `格式错误的证书：${char} 不是 0 或 1`
      };
    }
    assignment[formula.variables[index]] = Number(char) as Bit;
  }
  return assignment;
}

export function parseNamedAssignment(entries: NamedAssignmentEntry[], formula = satFormula): Assignment | LocalizedText {
  const expected = new Set<string>(formula.variables);
  const seen = new Set<string>();
  const assignment = {} as Assignment;

  for (const entry of entries) {
    if (!expected.has(entry.name)) {
      return {
        en: `malformed certificate: unknown variable ${entry.name}`,
        zh: `格式错误的证书：未知变量 ${entry.name}`
      };
    }
    if (seen.has(entry.name)) {
      return {
        en: `malformed certificate: duplicate variable ${entry.name}`,
        zh: `格式错误的证书：重复变量 ${entry.name}`
      };
    }
    seen.add(entry.name);
    assignment[entry.name as VariableId] = entry.value;
  }

  for (const variable of formula.variables) {
    if (!seen.has(variable)) {
      return {
        en: `malformed certificate: missing variable ${variable}`,
        zh: `格式错误的证书：缺少变量 ${variable}`
      };
    }
  }

  return assignment;
}

export function isLocalizedError(value: Assignment | LocalizedText): value is LocalizedText {
  return "en" in value && "zh" in value && !("x1" in value);
}

function applyOp(op: FormulaOp, values: Bit[]): Bit {
  if (op === "var") return values[0];
  if (op === "not") return values[0] === 1 ? 0 : 1;
  if (op === "and") return values.every((value) => value === 1) ? 1 : 0;
  return values.some((value) => value === 1) ? 1 : 0;
}

function storedValueList(values: Map<FormulaNodeId, Bit>, order: FormulaNodeId[]): Array<{ id: FormulaNodeId; value: Bit }> {
  return order.filter((id) => values.has(id)).map((id) => ({ id, value: values.get(id)! }));
}

function collectNodeOrder(node: FormulaNode, order: FormulaNodeId[] = []) {
  if (node.kind === "not") collectNodeOrder(node.child, order);
  if (node.kind === "and" || node.kind === "or") {
    for (const child of node.children) collectNodeOrder(child, order);
  }
  order.push(node.id);
  return order;
}

function stepExplanation(node: FormulaNode, output: Bit): LocalizedText {
  if (node.kind === "var") {
    return {
      en: `${node.name} is read from the assignment, so this occurrence is ${output}.`,
      zh: `从赋值中读取 ${node.name}，所以这个出现位置的值为 ${output}。`
    };
  }
  if (node.kind === "not") {
    return {
      en: `NOT flips its child value, so ${node.expression} is ${output}.`,
      zh: `NOT 会翻转子公式的值，所以 ${node.expression} 为 ${output}。`
    };
  }
  if (node.kind === "and") {
    return {
      en: `AND is true only when every child is true; this subformula is ${output}.`,
      zh: `AND 只有在所有子公式为真时才为真；这个子公式为 ${output}。`
    };
  }
  return {
    en: `OR is true when at least one child is true; this subformula is ${output}.`,
    zh: `OR 只要有至少一个子公式为真就为真；这个子公式为 ${output}。`
  };
}

function evaluateNode(node: FormulaNode, assignment: Assignment, values: Map<FormulaNodeId, Bit>, steps: FormulaTraceStep[], order: FormulaNodeId[]): Bit {
  if ((node.kind === "and" || node.kind === "or") && node.children.length < 2) {
    throw new Error(`${node.kind} node ${node.id} must have at least two children`);
  }

  let dependencies: FormulaTraceStep["dependencies"];
  let output: Bit;

  if (node.kind === "var") {
    output = assignment[node.name];
    dependencies = [{ id: node.name, value: output }];
  } else if (node.kind === "not") {
    const childValue = evaluateNode(node.child, assignment, values, steps, order);
    output = applyOp("not", [childValue]);
    dependencies = [{ id: node.child.id, value: childValue }];
  } else {
    const childValues = node.children.map((child) => ({
      id: child.id,
      value: evaluateNode(child, assignment, values, steps, order)
    }));
    output = applyOp(node.kind, childValues.map((child) => child.value));
    dependencies = childValues;
  }

  values.set(node.id, output);
  steps.push({
    kind: "formula",
    id: node.id,
    op: node.kind,
    expression: node.expression,
    dependencies,
    output,
    storedValues: storedValueList(values, order),
    explanation: stepExplanation(node, output)
  });
  return output;
}

export function evaluateFormula(formula: Formula, assignmentLike: string | Assignment | NamedAssignmentEntry[]): EvaluationResult {
  const parsed = typeof assignmentLike === "string"
    ? parseAssignmentString(assignmentLike, formula)
    : Array.isArray(assignmentLike)
      ? parseNamedAssignment(assignmentLike, formula)
      : assignmentLike;
  const assignmentString = typeof assignmentLike === "string" ? assignmentLike : Array.isArray(assignmentLike) ? entriesToDisplayString(assignmentLike) : assignmentToString(assignmentLike, formula);

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
      formulaSteps: [],
      validationError: parsed
    };
  }

  const order = collectNodeOrder(formula.root);
  const validationStep: ValidationTraceStep = {
    kind: "validation",
    id: "validation",
    valid: true,
    message: {
      en: "assignment has exactly one bit for each formula variable",
      zh: "赋值为每个公式变量恰好提供一位"
    },
    assignmentString,
    storedValues: []
  };
  const values = new Map<FormulaNodeId, Bit>();
  const formulaSteps: FormulaTraceStep[] = [];
  const output = evaluateNode(formula.root, parsed, values, formulaSteps, order);
  const finalStep: FinalTraceStep = {
    kind: "final",
    id: "final",
    output,
    accepted: output === 1,
    message: output === 1
      ? { en: "the root formula is true, so the verifier accepts this certificate", zh: "根公式为真，因此验证器接受这个证书" }
      : { en: "the root formula is false, so this certificate is rejected", zh: "根公式为假，因此拒绝这个证书" },
    storedValues: storedValueList(values, order)
  };

  return {
    result: output === 1 ? "accept" : "reject",
    assignment: parsed,
    assignmentString: assignmentToString(parsed, formula),
    output,
    steps: [validationStep, ...formulaSteps, finalStep],
    formulaSteps,
    validationError: null
  };
}

export function entriesToDisplayString(entries: NamedAssignmentEntry[]) {
  return entries.map((entry) => `${entry.name}=${entry.value}`).join(", ");
}

export function fixtureResult(assignment: AssignmentString) {
  return evaluateFormula(satFormula, assignment);
}

export function formulaSemantics(op: FormulaOp, values: Bit[]) {
  return applyOp(op, values);
}

export function allPracticeFixtureIds() {
  return new Set<string>([
    ...assignmentRows.map((row) => row.id),
    ...malformedFixtures.map((row) => row.id),
    "claim-ledger"
  ]);
}
