# Circuit-SAT Node Design

## Node Scope

`circuit-sat` is an intermediate concept node about Boolean circuit satisfiability as the first concrete source problem after the general NP-hardness definition. Although the difficulty is intermediate, the page should not assume prior circuit literacy: it should first explain that inputs are switches, gates are tiny Boolean rules, wires carry `0`/`1`, and output `1` means the lamp turns on.

Core learner promise:

> Circuit-SAT asks whether some Boolean input assignment makes a Boolean circuit output `1`; one proposed assignment is a certificate that can be checked gate by gate in polynomial time.

In scope:

- Boolean circuits as directed acyclic gate networks with input bits, gates, wires, and one output.
- The decision problem: does there exist an assignment that makes the output `1`?
- Naive exhaustive assignment search and why it grows as `$2^n$`.
- Certificate checking: a proposed assignment plus deterministic gate evaluation.
- Why Circuit-SAT is in `NP`.
- Circuit-SAT as the first canonical source problem for later NP-hardness reductions.
- A bounded Cook-Levin preview: computations can be encoded as circuits, but the construction proof is not expanded here.

What this page proves vs names:

| Claim | Treatment on this page |
|---|---|
| `Circuit-SAT in NP` | Demonstrated directly: a length-`n` assignment certificate can be validated, then checked by one topological circuit evaluation in polynomial time. |
| `Circuit-SAT is NP-hard` | Named as the Cook-Levin theorem and previewed only. The page may say this theorem makes Circuit-SAT a source problem, but it does not prove the reduction. |
| Future reductions | Framed as later work that starts from Circuit-SAT after Cook-Levin is accepted or proved in its own node. |

Avoid implying that the tiny circuit fixture, a verifier trace, or a satisfying row proves hardness. They only demonstrate certificate checking and membership in `NP`.

Out of scope:

- Full Cook-Levin proof.
- Reducing Circuit-SAT to SAT.
- CNF, 3SAT, Clique, and approximation nodes.
- General circuit complexity classes.
- Optimization variants.
- Proving `P != NP`.

## Proposed Frontmatter

English page:

```yaml
id: circuit-sat
locale: en
title: Circuit-SAT
summary: Decide whether some Boolean input assignment makes a circuit output 1, and see why one assignment is a checkable certificate.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - circuits
prerequisites:
  - p-vs-np
  - np-hardness
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Chinese page:

```yaml
id: circuit-sat
locale: zh
title: 电路可满足性
summary: 判断是否存在某个布尔赋值让电路输出 1，并理解一个赋值为什么是可高效检查的证书。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - circuits
prerequisites:
  - p-vs-np
  - np-hardness
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Keep `next: []` until `sat` or `circuit-sat-to-sat` exists.

## Teaching Arc

1. Hook problem: show a tiny Boolean control circuit with switches `x1`, `x2`, `x3`, `x4`, gates, wires, and an output lamp. Include a visual legend before the first circuit: switches provide `0`/`1`, gates apply rules, wires carry results forward, and output `1` means the lamp turns on. The legend should include a tiny truth-table strip for `AND`, `OR`, and `NOT`, such as `1 AND 0 = 0`, `1 OR 0 = 1`, and `NOT 0 = 1`. Ask whether any switch setting turns the lamp on.
2. First naive idea: try all assignments in a table.
3. Where it breaks: every extra input doubles the table, and one failed row proves only that row fails.
4. Core invention: treat one successful assignment as a certificate. Checking the certificate does not require searching again.
5. Visual anchors throughout: reuse one trace-consistent circuit fixture across the hook, search table, certificate check, formal definition, invariant, and exercises.
6. Formal version: define circuits, assignments, satisfiable circuits, and the language `Circuit-SAT`.
7. Implementation sketch: validate assignment shape, evaluate gates in topological order, and accept iff the output gate is `1`.
8. Correctness intuition: after each gate is evaluated, the stored value equals the Boolean value of that gate under the assignment.
9. Complexity: one certificate check is `$O(|C| + n)$`; exhaustive search is `$O(2^n \cdot |C|)$`.
10. Connections: `p-vs-np` gives certificates; `np-hardness` gives the source-problem role; future nodes convert Circuit-SAT toward SAT and 3SAT.
11. Exercises: identify satisfying assignments, reject malformed certificates, compare search vs check, and classify what this page does and does not prove.

Near the core invention, include a bridge visual from existential search to certificate checking: the full assignment table is shown as many possible rows, one satisfying row is highlighted as the chosen certificate, and the verifier trace checks only that highlighted row. The caption should say that existence is the problem question; the certificate is one claimed witness, not a shortcut for finding it.

## Vocabulary Scaffolding

- Boolean circuit / 布尔电路（Boolean circuit）: a directed acyclic network of input bits and gates.
- Gate / 门（gate）: a small Boolean operation such as `AND`, `OR`, or `NOT`.
- Assignment / 赋值（assignment）: one `0` or `1` value for each input variable.
- Satisfying assignment / 满足赋值（satisfying assignment）: an assignment that makes the output gate equal `1`.
- Certificate / 证书（certificate）: the proposed assignment for a Yes instance.
- Verifier / 验证器（verifier）: the algorithm that checks whether the proposed assignment really turns the circuit on.
- Topological order / 拓扑顺序（topological order）: an order where each gate appears after its input wires are already known.
- Source problem / 源问题（source problem）: a known starting problem used in later reductions.
- Cook-Levin theorem / Cook-Levin 定理: the theorem, named only here, that makes Circuit-SAT a hard starting source. This page demonstrates checkability and membership in `NP`; it does not prove Cook-Levin.

## Core Fixture

Use one deterministic circuit throughout the page:

```text
inputs: x1, x2, x3, x4
n1 = NOT x2
g1 = x1 AND n1
g2 = x3 OR x4
g3 = g1 AND g2
g4 = x2 AND x4
z  = g3 OR g4
```

Circuit conventions:

- The circuit is a finite directed acyclic graph (DAG).
- Inputs are named source nodes, not gates: `x1`, `x2`, `x3`, `x4`.
- Gate set for this node is `AND`, `OR`, and `NOT`.
- `AND` and `OR` have arity 2 in the fixture and implementation plan; `NOT` has arity 1.
- Wires may fan out: one input or gate output can feed multiple later gates.
- There is exactly one designated output node, `z`.
- `|C|` counts the encoded circuit description: input nodes, gate nodes, and wires. For this fixture that is 4 inputs, 6 gates including `z`, and 11 wires.
- Topological evaluation reads the assignment once, then visits each gate and wire dependency in order. The planned size strip should show `input bits + gates + wires`, with the message that a verifier touches each part once up to constant gate cost.
- Canonical trace order is fixed for tests and screenshots: validate assignment, evaluate `n1`, `g1`, `g2`, `g3`, `g4`, `z`, then read the final output. Malformed assignments stop at validation and show no gate-evaluation steps.

Example assignments:

Assignment strings use positional order `x1 x2 x3 x4`. For example, `1010` means `x1=1`, `x2=0`, `x3=1`, and `x4=0`.

| Assignment | Result | Reason |
|---|---:|---|
| `1010` | `1` | Satisfying through `g1 AND g2`. |
| `0101` | `1` | Satisfying through `x2 AND x4`. |
| `0000` | `0` | Rejecting row, but not a proof that no satisfying row exists. |
| `101` | malformed | Missing value for `x4`. |
| `1020` | malformed | Contains a non-bit value. |

Malformed certificate behavior:

- Reject before gate evaluation when the assignment has the wrong length.
- Reject before gate evaluation when any value is not `0` or `1`.
- If the UI or tests use named assignments, reject missing variable names, duplicate variable names, and names not present in the circuit inputs.
- Malformed results should be displayed and asserted separately from well-formed `reject` rows. Expected UI language: `malformed certificate`; expected trace state: no gate steps have run.

This fixture should power all visuals, trace data, tests, and exercises. The page may mention a future theorem saying Circuit-SAT is NP-hard, but must not present the fixture as a hardness proof.

## Section Visual Inventory

| Section | Visual/widget | Learner question answered |
|---|---|---|
| Hook | `CircuitSatCircuitFigure`, static figure of switches, gates, wires, output, and a tiny `AND`/`OR`/`NOT` truth-table legend. | What object is the decision problem asking about? |
| Naive search | `CircuitSatAssignmentGrid`, compact row grid for selected assignments and the full `2^n` count. | What does “try every assignment” mean? |
| Pain | `CircuitSatGrowthStrip`, comparing `n`, assignment count, and one-check work. | Why does blind search grow too fast? |
| Search-to-check bridge | Assignment table with many rows, one satisfying row highlighted and passed into the verifier. | How does “there exists a row” differ from “check this one row”? |
| Certificate invention | `CircuitSatCertificateTrace`, step/reset gate evaluator. | How can one proposed assignment be checked without searching? |
| Formal definition | Language card beside the circuit with the existential formula. | What does `C in Circuit-SAT` mean precisely? |
| Implementation | Trace table with gate, inputs, output, and stored map. | What would verifier code actually compute? |
| Invariant | Gate-order rail highlighting dependencies already known before the current gate. | Why is topological evaluation reliable? |
| Complexity | Cost stack for validation, gate evaluation, and output read. | Why is checking polynomial while blind search is exponential? |
| Common confusions | `CircuitSatMisconceptionCards`. | Which tempting interpretations are false? |
| Connections | `CircuitSatGraphStrip`, local graph strip with future nodes faded but not linked. | How does this node fit after NP-hardness and before SAT reductions? |
| Claim boundary | Compact ledger: proved here, named here, future proof. | Why does checking one assignment prove `in NP` but not NP-hardness? |
| Exercises | `CircuitSatPracticeCards`, powered by fixture IDs. | Can the learner apply the distinction between search, certificate, and proof? |

No major section should rely on prose alone unless the implementation notes a deliberate exception.

## Formula And Notation Plan

Introduce symbols after the learner has seen the circuit fixture.

- `$C$`: a Boolean circuit.
- `$n$`: number of input variables.
- `$|C|$`: circuit size, roughly inputs plus gates and wires.
- `$a \in \{0,1\}^n$`: an assignment.
- `$C(a)$`: the output of circuit `C` under assignment `a`.

Definition:

```tex
C \in \text{Circuit-SAT}
\quad\Longleftrightarrow\quad
\exists a \in \{0,1\}^n \text{ such that } C(a)=1.
```

Plain-language interpretation: the circuit is satisfiable if at least one input setting turns the output on.

Verifier contract for well-formed assignments:

```tex
\text{for } a \in \{0,1\}^n,\quad
\text{verify}(C,a)=1 \quad\Longleftrightarrow\quad C(a)=1.
```

Plain-language interpretation: once `a` is a well-formed assignment, the verifier accepts exactly when the circuit output is `1` under that assignment. If `a` is malformed, the verifier rejects before evaluating gates, so `C(a)` is not treated as a meaningful circuit run.

Membership in `NP`:

```tex
|a| = n
\quad\text{and}\quad
\text{verify}(C,a)\text{ runs in }\operatorname{poly}(|C|).
```

Plain-language interpretation: the certificate is just one bit per input, and checking it follows the circuit description once. This proves membership in `NP`; NP-hardness is only the Cook-Levin theorem preview in this node.

Complexity:

```tex
\text{one check} = O(|C| + n)
```

```tex
\text{brute force search} = O(2^n \cdot |C|)
```

Plain-language interpretation: one certificate follows the circuit once; blind search may repeat that check for every assignment.

## Component And State Model

Suggested files:

```text
src/components/interactive/circuitSatTrace.ts
src/components/interactive/CircuitSatCircuitFigure.tsx
src/components/interactive/CircuitSatAssignmentGrid.tsx
src/components/interactive/CircuitSatCertificateTrace.tsx
src/components/interactive/CircuitSatGrowthStrip.tsx
src/components/interactive/CircuitSatMisconceptionCards.tsx
src/components/interactive/CircuitSatGraphStrip.tsx
src/components/interactive/CircuitSatPracticeCards.tsx
tests/circuit-sat-trace.test.ts
```

Trace model requirements:

- Typed `Bit`, `InputId`, `GateId`, and assignment representation.
- Gate model with `AND`, `OR`, and `NOT`.
- Deterministic `evaluateCircuit(circuit, assignment)` helper.
- Malformed-certificate rejection before gate evaluation.
- Ordered gate trace with dependencies and visible stored values.
- Assignment fixture rows for satisfying, rejecting, and malformed cases.
- Growth helper: `assignmentCount(n) = 2 ** n` for bounded display inputs.
- Practice cards must reference valid fixture or misconception IDs.

Golden component states:

| Component | Golden state |
|---|---|
| `CircuitSatAssignmentGrid` | Selected assignment `1010`; output `1`; reason badge `satisfying via g1 AND g2`; expected result `accept`. Include only well-formed search rows from `{0,1}^4`, including `0000` as `reject` and `0101` as a second `accept`. Keep malformed examples out of this grid. |
| `CircuitSatGrowthStrip` | Selected input count `n = 4`; assignment count `16`; one-check work label `O(|C| + n)`; brute-force label `16 checks for this fixture`; reason badge `search grows by doubling, checking one row follows the circuit once`; expected result `growth comparison`, not accept/reject. |
| `CircuitSatPracticeCards` | Cards must include one `accept` case (`1010`), one `reject` case (`0000`), one malformed wrong-length case (`101`), one malformed non-bit case (`1020`), and one ledger question whose expected answer is `in NP proved here; NP-hard named by Cook-Levin only`. Malformed cases belong in validation/practice surfaces, not in the exhaustive-search grid. |

The interactive trace should expose step, reset, and assignment-selection controls. It should show output state in text, not color alone.

## Graph Placement

Add graph node:

```ts
{
  id: "circuit-sat",
  label: {
    en: "Circuit-SAT",
    zh: "电路可满足性"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 770, y: 420 }
}
```

Required edge:

```ts
{
  from: "np-hardness",
  to: "circuit-sat",
  type: "prerequisite",
  reason: {
    en: "Circuit-SAT is the first concrete source problem after the general NP-hardness definition.",
    zh: "电路可满足性是在一般 NP-hardness 定义之后的第一个具体源问题。"
  }
}
```

Optional direct vocabulary edge:

```ts
{
  from: "p-vs-np",
  to: "circuit-sat",
  type: "uses",
  reason: {
    en: "Circuit-SAT uses the P vs NP idea that a proposed assignment can serve as a polynomial-time checkable certificate.",
    zh: "电路可满足性使用了 P 与 NP 中“候选赋值可作为多项式时间可检查证书”的思想。"
  }
}
```

Do not add graph edges to `sat`, `circuit-sat-to-sat`, or `cnf-and-3sat` until those nodes exist.

Update `np-hardness` frontmatter `next` to include `circuit-sat` once this node is implemented. Do not add `next` from `circuit-sat` to future nodes.

## Accessibility And Mobile

- Use semantic `figure`/`figcaption` where practical and useful `aria-label`s on SVGs.
- Interactive controls need real buttons, visible focus states, and labels such as “Next gate,” “Previous gate,” and “Reset trace.”
- Do not rely only on color: show `1`, `0`, `accept`, `reject`, malformed, and current-step text.
- Assignment grids should wrap on mobile and avoid tiny tap targets.
- Tables may use the existing horizontal overflow pattern where needed.
- Respect reduced motion; step changes must remain understandable without animation.
- Chinese labels must wrap without overlapping compact panels.

## Tests And Validation

Tests should cover:

- Documented satisfying and rejecting assignments match expected outputs.
- Malformed certificates reject before gate evaluation, including wrong length, non-bit values, missing variable names, duplicate variable names when named assignments are used, and unknown variables.
- Trace order respects gate dependencies.
- Every gate output in the trace matches Boolean semantics.
- Growth helper returns deterministic assignment counts.
- Practice cards reference valid fixture and misconception IDs.
- Golden states for `CircuitSatAssignmentGrid`, `CircuitSatGrowthStrip`, and `CircuitSatPracticeCards` match the documented selected assignment, output, reason badge, and expected accept/reject/malformed result.
- Graph/content validation includes `circuit-sat` English and Chinese content.

Run when practical:

```bash
npm run check
npm run test
npm run build
```

Rendered review should inspect `/en/nodes/circuit-sat/` and `/zh/nodes/circuit-sat/`.

## Acceptance Criteria

- English and Chinese MDX pages exist, with Chinese marked `translationStatus: needs-review`.
- New graph node and only non-dangling graph edges are added.
- Page follows concrete problem -> naive search -> pain -> certificate invention -> formal definition -> verifier -> invariant -> complexity -> connections.
- Visual support appears throughout the page, not only in one demo.
- Circuit-SAT is shown as in `NP`.
- NP-hardness is introduced as Circuit-SAT's planned source-problem role under the Cook-Levin theorem, without suggesting the fixture or verifier trace proves hardness.
- No future-node `next` links or graph edges are added before those nodes exist.
- Final validation commands pass, or any failure is documented with the exact blocker.
