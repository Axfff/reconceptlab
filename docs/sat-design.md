# SAT Node Design

## Node Scope

`sat` is an intermediate concept node about Boolean formula satisfiability. It is the formula-shaped sibling of `circuit-sat`: learners are still asking whether some assignment works, but the object is now a Boolean expression rather than a gate network.

Core learner promise:

> SAT asks whether some truth assignment makes a Boolean formula evaluate to true; one proposed assignment is a certificate that can be checked by evaluating the formula.

In scope:

- Boolean variables such as `x1`, `x2`, `x3`, and `x4`.
- Literals: a variable or its negation, such as `x1` or `NOT x2`.
- Boolean operators `AND`, `OR`, and `NOT`.
- Parenthesized formulas and expression-tree evaluation.
- Truth assignments mapping variables to `0/1`.
- Satisfying assignment: an assignment that makes the whole formula true.
- Naive exhaustive assignment search over `$2^n$` rows.
- The verifier/search distinction.
- Why SAT is in `NP`: a certificate is one assignment, and checking it is polynomial in formula size.
- SAT as the formula version learners need before later reduction-shape nodes.

Out of scope:

- Full Circuit-SAT-to-SAT reduction.
- CNF, clauses, 3CNF, 3SAT, or transformations into normal form.
- Cook-Levin proof.
- SAT-to-Clique or later NP-completeness reductions.
- SAT solver engineering, DPLL, CDCL, unit propagation, or watched literals.
- Optimization variants such as Max-SAT.
- Proving SAT is NP-hard or NP-complete inside this page.

Future nodes may be named in prose, but do not add graph edges to `circuit-sat-to-sat`, `cnf-and-3sat`, or later unimplemented nodes.

What this page proves vs names:

| Claim | Treatment on this page |
|---|---|
| `SAT in NP` | Demonstrated directly: a length-`n` assignment certificate can be validated, then checked by one formula-tree evaluation in polynomial time. |
| `SAT is NP-hard` / `SAT is NP-complete` | Named only as later context. The proof path belongs to future reduction nodes, beginning with `circuit-sat-to-sat`. |
| `SAT` and `CNF-SAT` are the same teaching object | Avoided here. CNF is named as a later normal-form restriction; this page uses arbitrary parenthesized formulas. |

## Proposed Frontmatter

English page:

```yaml
id: sat
locale: en
title: Boolean Satisfiability (SAT)
summary: Decide whether some truth assignment makes a Boolean formula true, and separate searching for an assignment from checking one.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - logic
prerequisites:
  - p-vs-np
  - circuit-sat
next: []
createdAt: 2026-05-17
updatedAt: 2026-05-17
```

Chinese page:

```yaml
id: sat
locale: zh
title: 布尔可满足性（SAT）
summary: 判断是否存在某个真值赋值让布尔公式为真，并区分“寻找赋值”和“检查一个赋值”。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - logic
prerequisites:
  - p-vs-np
  - circuit-sat
next: []
createdAt: 2026-05-17
updatedAt: 2026-05-17
```

Update `circuit-sat` frontmatter `next` to include `sat` once `sat` is implemented. Keep `sat` `next: []` until a follow-up node exists.

## Teaching Arc

1. Concrete problem: show a small rule-sheet formula for turning on an alarm, using switches `x1`, `x2`, `x3`, and `x4`. Ask whether any switch setting makes the whole rule true.
2. Naive attempt: build a truth table and try assignments row by row.
3. Where it breaks: every new variable doubles the table; one false row proves only that row fails.
4. Core invention: if someone hands us one claimed satisfying assignment, we can check it by evaluating the formula tree.
5. Visual anchors throughout: reuse one formula fixture as text, parse tree, truth-table rows, verifier trace, invariant, and exercises.
6. Formal version: define variables, literals, formulas, assignments, evaluation, and `SAT`.
7. Implementation sketch: represent a formula tree, validate assignment variables, recursively evaluate leaves/operators, and accept iff the root is true.
8. Invariant/correctness: each subtree's displayed value equals that subformula's truth value under the current assignment; when the root is true, the assignment satisfies the formula.
9. Complexity: checking one assignment is `$O(|\varphi| + n)$`; blind search is `$O(2^n \cdot |\varphi|)$`.
10. Connections: `p-vs-np` gives certificates/verifiers; `circuit-sat` gives the same assignment-search question in circuit form; later nodes explain how circuit gates become formulas/constraints and why CNF/3SAT matter.
11. Exercises: classify satisfying, rejecting, malformed, and claim-boundary cases.

## Vocabulary Scaffolding

- Boolean formula / 布尔公式（Boolean formula）: an expression built from variables and Boolean operators.
- Variable / 变量（variable）: a named switch such as `x1`.
- Literal / 文字（literal）: a variable or its negation, such as `x1` or `NOT x2`.
- Operator / 运算符（operator）: `AND`, `OR`, or `NOT`.
- Subformula / 子公式（subformula）: any smaller expression inside the full formula.
- Assignment / 赋值（assignment）: one bit for each variable.
- Satisfying assignment / 满足赋值（satisfying assignment）: an assignment that makes the formula evaluate to true.
- Certificate / 证书（certificate）: the proposed assignment for a Yes instance.
- Verifier / 验证器（verifier）: the algorithm that checks the proposed assignment by evaluating the formula.

## Core Fixture

Use one deterministic formula throughout:

```text
phi = (x1 AND NOT x2 AND (x3 OR x4)) OR (x2 AND x4)
```

Conventions:

- Variables: `x1`, `x2`, `x3`, `x4`.
- Operators: `AND`, `OR`, and `NOT`.
- Formula size `|\varphi|` counts variable/literal occurrences and operator nodes, not the number of possible assignments.
- Implementation should use n-ary `and` and `or` AST nodes for this page, so the left side is one 3-child `AND` node and the root is one 2-child `OR` node. `NOT x2` is represented as unary `not(var x2)`, not as a special literal leaf. This keeps the rendered tree and trace close to the written formula.
- With this AST convention, the fixture size is `|\varphi| = 11`: six variable occurrences (`x1`, `x2`, `x3`, `x4`, `x2`, `x4`) plus five operator nodes (`NOT`, left `AND`, inner `OR`, right `AND`, root `OR`).
- Canonical assignment order: `x1 x2 x3 x4`.
- Assignment strings use positional order: `1010` means `x1=1`, `x2=0`, `x3=1`, and `x4=0`.
- Canonical trace order for tests follows formula occurrences, not unique variable names: validate assignment, evaluate `x1-left`, evaluate `x2-left`, evaluate `not-x2-left`, evaluate `x3-left`, evaluate `x4-left`, evaluate `or-x3-x4`, evaluate `and-left`, evaluate `x2-right`, evaluate `x4-right`, evaluate `and-right`, evaluate `or-root`, then read the final result. Implementations may visually show that repeated occurrences read the same assignment bits, but each formula-tree leaf occurrence keeps its own trace ID.

Example rows:

| Assignment | Result | Reason |
|---|---:|---|
| `1010` | `true` | Left side is true: `x1`, `NOT x2`, and `(x3 OR x4)` all hold. |
| `0101` | `true` | Right side is true: `x2 AND x4`. |
| `0000` | `false` | One rejecting row, not proof of unsatisfiability. |
| `101` | malformed | Missing value for `x4`. |
| `1020` | malformed | Contains a non-bit value. |

This fixture intentionally mirrors accepted rows from `circuit-sat` so learners can see "same assignment question, different representation" without learning the reduction yet. It should not be presented as the reduction proof.

Malformed certificate behavior:

- Reject before formula evaluation when the assignment has the wrong length.
- Reject before formula evaluation when any value is not `0` or `1`.
- General contract: for a formula with variable set `Var(\varphi) = {x_1,\dots,x_n}`, a well-formed assignment gives exactly one bit for each variable in `Var(\varphi)`.
- The fixture UI may use positional strings. If named assignment objects are added, reject missing variable names, duplicate variable names, and names not present in `Var(\varphi)`.
- Malformed results should be displayed and asserted separately from well-formed `false` rows.

Tiny unsatisfiable contrast fixture:

```text
psi = x1 AND NOT x1
```

Use this only as a common-confusions or exercise micro-figure. It has one variable and both rows are false, so it gives a concrete meaning for "unsatisfiable" without changing the main trace fixture or teaching CNF/3SAT.

## Section Visual Inventory

| Section | Visual/widget | Learner question answered |
|---|---|---|
| Hook | `SatFormulaRuleFigure`: formula as a readable rule sheet with switch chips and a final truth lamp. | What kind of object is SAT asking about? |
| Vocabulary | Static mini-legend for variable, literal, operator, and subformula. | What are the pieces of a Boolean formula? |
| Naive search | `SatAssignmentGrid`: selected rows from the `2^4` truth table, with `1010` highlighted. | What does "try every assignment" mean? |
| Pain | `SatGrowthStrip`: slider for variable count `n`, showing `2^n` assignments versus one formula check. | Why does brute force grow too quickly? |
| Core invention | `SatSearchToVerifierBridge`: many table rows funnel into one claimed certificate row. | How is checking one row different from finding one? |
| Master demo | `SatEvaluationTrace`: step/reset assignment evaluator over the formula tree. | How can a verifier check a proposed assignment? |
| Formal definition | `SatFormalCard`: language card beside the fixture formula. | What does `varphi in SAT` mean precisely? |
| Implementation | `SatEvaluationTable`: node/subformula, input values, output value, and explanation. | What would code compute? |
| Invariant | `SatSubformulaInvariantRail`: highlights already-evaluated children before parent evaluation. | Why does bottom-up evaluation give the right root value? |
| Complexity | `SatCostStack`: assignment validation, formula traversal, root read; contrast with brute force. | Why is checking polynomial while search is exponential? |
| Claim boundary | `SatClaimLedger`: proved here, named here, and future proof rows. | Why does checking one assignment prove membership in `NP` but not NP-hardness? |
| Common confusions | `SatMisconceptionCards`: false row versus unsat, verifier versus finder, SAT versus CNF-SAT, including the tiny `x1 AND NOT x1` contrast. | Which tempting interpretations are wrong? |
| Connections | `SatGraphStrip`: existing `p-vs-np -> circuit-sat -> sat`; future nodes faded as "later". | Where does SAT sit in the graph? |
| Exercises | `SatPracticeCards`: classify satisfying/rejecting/malformed rows and identify what is proved here. | Can the learner apply the distinction? |

Do not rely on `SatEvaluationTrace` alone. Each conceptual turn needs a small nearby visual or table.

Important visual details:

- `SatFormulaRuleFigure` labels the root `OR` as "either side can satisfy the alarm", labels the left sub-rule and right sub-rule separately, and shows switch chips for the currently illustrated assignment.
- Vocabulary legend should point into the same formula: `x1` as variable, `NOT x2` as unary `NOT` over a variable, `(x3 OR x4)` as subformula, and the root `OR` as the final decision.
- `SatSearchToVerifierBridge` must caption that a certificate is evidence for a Yes instance, not a method for finding one.
- `SatCostStack` visually separates `n` assignment bits from `|\varphi|` formula nodes so learners do not confuse variables with formula length.
- `SatMisconceptionCards` includes the tiny unsatisfiable `\psi = x1 AND NOT x1` table with rows `x1=0 -> false` and `x1=1 -> false`, clearly marked as a separate contrast from the main satisfiable fixture.

## Formula And Notation Plan

Introduce notation after the fixture is visible:

- `$\varphi$`: a Boolean formula.
- `$x_1,\dots,x_n$`: Boolean variables.
- `$a \in \{0,1\}^n$`: one assignment.
- `$\varphi(a)$`: the truth value of formula `$\varphi$` under assignment `$a$`.
- `$|\varphi|$`: formula size, roughly the number of variable occurrences and operator nodes.

Definition:

```tex
\varphi \in \text{SAT}
\quad\Longleftrightarrow\quad
\exists a \in \{0,1\}^n \text{ such that } \varphi(a)=1.
```

Plain-language interpretation: the formula is satisfiable if at least one truth setting makes the whole expression true.

Verifier contract for well-formed assignments:

```tex
\text{verify}(\varphi,a)=1
\quad\Longleftrightarrow\quad
\varphi(a)=1.
```

Plain-language interpretation: for a well-formed assignment, the verifier accepts exactly when the formula evaluates to true. If the assignment is malformed, the verifier rejects before evaluating the formula.

Membership in `NP`:

```tex
|a| = n
\quad\text{and}\quad
\text{verify}(\varphi,a)\text{ runs in }\operatorname{poly}(|\varphi|).
```

Plain-language interpretation: the certificate is one bit per variable, and the verifier reads that assignment plus the formula tree once.

Complexity:

```tex
\text{one check} = O(|\varphi| + n)
```

```tex
\text{brute force search} = O(2^n \cdot |\varphi|)
```

Plain-language interpretation: one certificate evaluates the expression once; brute force may evaluate it for every assignment.

## Component And State Model

Expected implementation files:

```text
src/components/interactive/satTrace.ts
src/components/interactive/SatFormulaRuleFigure.tsx
src/components/interactive/SatAssignmentGrid.tsx
src/components/interactive/SatGrowthStrip.tsx
src/components/interactive/SatSearchToVerifierBridge.tsx
src/components/interactive/SatEvaluationTrace.tsx
src/components/interactive/SatSupportFigures.tsx
src/components/interactive/SatMisconceptionCards.tsx
src/components/interactive/SatGraphStrip.tsx
src/components/interactive/SatPracticeCards.tsx
tests/sat-trace.test.ts
```

Trace model requirements:

- Typed `Bit`, `VariableId`, `FormulaNodeId`, and assignment strings.
- Formula AST nodes: `var`, unary `not`, n-ary `and`, and n-ary `or`. For this node, `and` and `or` should require at least two children.
- Deterministic `evaluateFormula(formula, assignment)` helper.
- Malformed assignments reject before evaluation.
- Trace exposes each subformula, dependency values, output value, stored values, and localized explanation.
- Golden rows include `1010` accept, `0101` accept, `0000` reject, `101` malformed, and `1020` malformed.
- The tiny unsatisfiable contrast fixture is separate from the main trace and should have its own small helper or static data.
- Practice cards reference valid fixture or misconception IDs.
- Growth helper returns `2 ** n` for bounded display values.

Golden component states:

| Component | Golden state |
|---|---|
| `SatAssignmentGrid` | Selected assignment `1010`; result `true`; badge `satisfying via left side`; include only well-formed rows. |
| `SatGrowthStrip` | Selected `n = 4`; assignment count `16`; one-check label `O(|phi| + n)`; brute-force label `16 formula checks for this fixture`. |
| `SatEvaluationTrace` | Assignment `1010`; root evaluates to `true`; trace reaches root after all child subformulas are evaluated. |
| `SatPracticeCards` | Include accept, reject, malformed wrong-length, malformed non-bit, and claim-boundary question: `in NP proved here; reductions and CNF forms are future nodes`. |

## Graph Placement

Add graph node:

```ts
{
  id: "sat",
  label: {
    en: "Boolean Satisfiability (SAT)",
    zh: "布尔可满足性（SAT）"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 1000, y: 420 }
}
```

Required edge:

```ts
{
  from: "circuit-sat",
  to: "sat",
  type: "motivates",
  reason: {
    en: "SAT asks the same search-for-an-assignment question as Circuit-SAT, but the object is a Boolean formula instead of a gate circuit.",
    zh: "SAT 询问的仍是“是否存在一个满足赋值”，但对象从门电路换成了布尔公式。"
  }
}
```

Optional direct vocabulary edge:

```ts
{
  from: "p-vs-np",
  to: "sat",
  type: "uses",
  reason: {
    en: "SAT uses the P vs NP idea that a proposed assignment can be checked as a polynomial-time certificate.",
    zh: "SAT 使用了 P 与 NP 中“候选赋值可作为多项式时间可检查证书”的思想。"
  }
}
```

Prefer adding the required `circuit-sat -> sat` edge first. Add the optional `p-vs-np -> sat` edge only if the graph view still reads clearly.

## Accessibility And Mobile

- Use semantic `figure`, `figcaption`, tables, and real buttons.
- Formula tree SVGs need text labels and `aria-label` summaries.
- Show `true/false`, `accept/reject`, and malformed states in text, not color alone.
- Step controls: "Next subformula", "Previous subformula", and "Reset trace".
- Assignment chips need large tap targets on mobile.
- Formula tree should collapse into stacked subformula cards on narrow screens.
- Tables may use horizontal overflow, but selected row and result must stay readable.
- Respect reduced motion; stepping must work without animation.
- Chinese copy should wrap cleanly in formula captions and cards.

## Acceptance Criteria

- English and Chinese MDX pages exist for `sat`; Chinese is marked `translationStatus: needs-review`.
- `sat` graph node is added with only non-dangling edges to implemented nodes.
- `circuit-sat` frontmatter `next` includes `sat`.
- Page follows concrete problem -> naive search -> pain -> certificate/verifier invention -> formal definition -> implementation -> invariant -> complexity -> connections.
- Visual support appears throughout, not only in one master demo.
- SAT is shown to be in `NP`.
- The page does not prove SAT NP-hard/NP-complete and does not include Circuit-SAT-to-SAT, CNF, 3SAT, Cook-Levin, or Clique reductions.
- Deterministic fixture powers visuals, tests, examples, and exercises.
- Malformed assignments are handled separately from false-but-well-formed assignments.
- Rendered review covers `/en/nodes/sat/` and `/zh/nodes/sat/`.

Validation commands:

```bash
npm run check
npm run test
npm run build
```
