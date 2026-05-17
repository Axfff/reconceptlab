# Circuit-SAT to SAT Node Design

## Node Scope

`circuit-sat-to-sat` is the first reduction-construction node in the NP-hardness sequence. The learner already knows the source question from `circuit-sat`, knows the target question from `sat`, and now needs the bridge:

> Given a Boolean circuit, build a Boolean formula that is satisfiable exactly when the circuit has some input assignment that makes its output `1`.

In scope:

- Reduction from Boolean circuits with `AND`, `OR`, and `NOT` gates to arbitrary SAT formulas.
- One formula variable for every non-input circuit node, including the designated output gate.
- One local consistency constraint per gate, plus a final assertion that the circuit output variable is `1`.
- Why this construction is polynomial in circuit size.
- Both correctness directions:
  - satisfying circuit input -> satisfying formula assignment
  - satisfying formula assignment -> satisfying circuit input
- Reuse of the existing `circuit-sat` fixture and continuity with `sat`.

Out of scope:

- CNF conversion.
- 3SAT or SAT-to-3SAT.
- Later NP-completeness reductions such as Clique.
- Full Cook-Levin proof.
- SAT solver engineering.
- Treating algebraic formula expansion as the main proof method.

Important boundary:

- Do not teach this node as "just expand the circuit into one giant formula" and stop.
- Do not split into CNF or 3SAT yet. Those belong to later nodes.

## Proposed Frontmatter

English page:

```yaml
id: circuit-sat-to-sat
locale: en
title: Reducing Circuit-SAT to SAT
summary: Convert a Boolean circuit into a satisfiable Boolean formula by naming each gate output and enforcing local gate constraints.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - reductions
  - circuits
  - logic
prerequisites:
  - polynomial-time-reductions
  - circuit-sat
  - sat
next: []
createdAt: 2026-05-17
updatedAt: 2026-05-17
```

Chinese page:

```yaml
id: circuit-sat-to-sat
locale: zh
title: 从 Circuit-SAT 到 SAT 的归约
summary: 给每个门的输出命名为公式变量，并加入局部门约束，把电路可满足性转换成 SAT。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: concept
tags:
  - complexity
  - algorithms
  - np-hardness
  - satisfiability
  - reductions
  - circuits
  - logic
prerequisites:
  - polynomial-time-reductions
  - circuit-sat
  - sat
next: []
createdAt: 2026-05-17
updatedAt: 2026-05-17
```

Keep `next: []` until a follow-up node is implemented.

## Teaching Arc

1. Hook problem: we already know how to ask satisfiability for circuits and for formulas. How do we mechanically turn a Circuit-SAT instance into a SAT instance without changing the Yes/No answer?
2. First naive idea: inline every gate definition until only input variables remain.
3. Where it breaks: the tiny fixture survives inlining, but general fan-out can duplicate large subexpressions, hide the size argument, and blur the proof.
4. Core invention: keep the circuit structure by giving every non-input gate output its own formula variable and adding a small emitted SAT formula that forces that variable to equal the gate result.
5. Visual anchors throughout: reuse the same `x1 x2 x3 x4` circuit and the same satisfying rows `1010` and `0101` from `circuit-sat` and `sat`, plus one early answer-preservation bridge card that states the reduction outputs a new SAT instance with the same Yes/No answers.
6. Formal reduction: define a readable per-gate blueprint, then define `\Phi_C` from the emitted `AND`/`OR`/`NOT` constraints plus the final output assertion.
7. Implementation sketch: walk the acyclic circuit in its declared topological order, reuse each stable gate id as the helper name, emit one SAT constraint per gate, then conjoin everything with the output variable.
8. Correctness:
   - forward: extend a satisfying circuit input with the actual intermediate gate values
   - backward: any satisfying formula assignment must agree with the circuit on every gate, so the restricted input assignment also makes the real circuit output `1`
9. Complexity: with fixed gate arities, one new variable and one constant-size gadget per gate, so formula size is linear in the encoded circuit size.
10. Connections: `circuit-sat` provides the source object, `sat` provides the target object, and `polynomial-time-reductions` provides the proof template.

## Vocabulary Scaffolding

- Reduction / 归约（reduction）: a mechanical translation from one problem to another that preserves Yes/No answers.
- Helper variable / 辅助变量（helper variable）: a new formula variable used to record one gate output.
- Constraint blueprint / 约束蓝图（constraint blueprint）: a readable local shorthand such as `g <-> (...)` used only for teaching cards.
- Emitted gate constraint / 实际输出的门约束（emitted gate constraint）: the actual SAT formula accumulated by the builder, trace, and tests, using only `AND`, `OR`, and `NOT`.
- Output assertion / 输出断言（output assertion）: the final condition that forces the circuit's output variable to be `1`.
- Extension of an assignment / 赋值扩展（extension of an assignment）: keep the original input bits and also fill in values for every gate variable.
- Fan-out / 扇出（fan-out）: one wire value feeding more than one later gate.
- Restriction / 限制（restriction / projection）: keep only the values on the original circuit inputs and ignore helper gate variables.

## Core Fixture

Reuse the current `circuit-sat` circuit:

```text
n1 = NOT x2
g1 = x1 AND n1
g2 = x3 OR x4
g3 = g1 AND g2
g4 = x2 AND x4
z  = g3 OR g4
```

Two formula surfaces:

Readable teaching blueprint:

```text
blueprint(n1) = n1 <-> NOT x2
blueprint(g1) = g1 <-> (x1 AND n1)
blueprint(g2) = g2 <-> (x3 OR x4)
blueprint(g3) = g3 <-> (g1 AND g2)
blueprint(g4) = g4 <-> (x2 AND x4)
blueprint(z)  = z  <-> (g3 OR g4)
```

Actual emitted SAT instance:

```text
emit(n1) = (NOT n1 OR NOT x2) AND (x2 OR n1)
emit(g1) = (NOT g1 OR (x1 AND n1)) AND (NOT (x1 AND n1) OR g1)
emit(g2) = (NOT g2 OR (x3 OR x4)) AND (NOT (x3 OR x4) OR g2)
emit(g3) = (NOT g3 OR (g1 AND g2)) AND (NOT (g1 AND g2) OR g3)
emit(g4) = (NOT g4 OR (x2 AND x4)) AND (NOT (x2 AND x4) OR g4)
emit(z)  = (NOT z OR (g3 OR g4)) AND (NOT (g3 OR g4) OR z)

Phi_C =
(emit(n1))
AND (emit(g1))
AND (emit(g2))
AND (emit(g3))
AND (emit(g4))
AND (emit(z))
AND z
```

SAT-language contract:

- The `sat` node only needs formulas built from `AND`, `OR`, and `NOT`.
- Local teaching cards may show `p <-> q` or `\leftrightarrow` as readable blueprint shorthand for "these two truth values must match".
- The accumulated formula in the builder, master trace, and tests must use only emitted form. They must never store or assert `\leftrightarrow` as if it were part of the actual SAT instance.
- For example:

```text
blueprint(g) = g <-> (u AND v)
emit(g) = (NOT g OR (u AND v)) AND (NOT (u AND v) OR g)
```

- The same rewrite policy applies to `OR` and `NOT` gate cards. This keeps the final SAT instance inside the earlier SAT syntax contract instead of silently extending the language.
- `AND z` is required because the emitted gate constraints only enforce consistency. They do not by themselves demand that the circuit output be `1`.

Tiny output-assertion contrast:

```text
Input row: x1 x2 x3 x4 = 0 0 0 0

n1=1, g1=0, g2=0, g3=0, g4=0, z=0
```

- Under this row, every emitted gate constraint is satisfied because each helper matches the real gate output.
- But without the final `AND z`, the whole conjunction would still be satisfiable even though the circuit output is `0`.
- The page should present this as a dedicated local contrast: consistency alone is not enough; satisfiability must also assert acceptance.

Continuity requirements:

- Keep assignment strings in positional order `x1 x2 x3 x4`.
- Reuse `1010` and `0101` as satisfying examples.
- Reuse stable circuit node ids such as `n1`, `g1`, and `z` directly as helper variable names; do not invent alternate aliases in the trace or tests.
- Show that variables such as `n1`, `g1`, and `z` are not new circuit inputs; they are the formula names for non-input circuit nodes, including the final output node.

Naive-inline contrast:

The fixture can be expanded once as a readability contrast:

```text
z
= (g3 OR g4)
= ((g1 AND g2) OR (x2 AND x4))
= (((x1 AND (NOT x2)) AND (x3 OR x4)) OR (x2 AND x4))
```

Make the general pain concrete with a tiny forked subcircuit:

```text
Before inline:
h = (a OR b)          [1 shared copy]
p = h AND c
q = h AND d
z = p OR q

After inline:
z = (((a OR b) AND c) OR ((a OR b) AND d))
      ^ copy 1           ^ copy 2
```

- The same subexpression `(a OR b)` is built once in the circuit but appears twice after inlining.
- If the shared node `h` stood for a larger 6-gate subcircuit, inlining this fork would copy those 6 gates twice.
- This figure should carry explicit copy-count annotations so the learner sees why fan-out threatens the size argument.

This tiny expansion is useful as a contrast figure, but the node must explain that the actual reduction keeps local emitted constraints rather than relying on global expansion.

## Section Visual Inventory

| Section | Visual/widget | Learner question answered |
|---|---|---|
| Hook | `CircuitSatToSatProblemBridgeFigure`: same circuit on the left, target formula frame on the right. | What are we trying to build? |
| Reduction contract | `CircuitSatToSatAnswerPreservationCard`: compact mini-table for `1010`, `0101`, and `0000`, showing `C(a)` and `Phi_C(ahat)` agree, with a caption that the reduction outputs a new SAT instance rather than a satisfying assignment. | What answer is the reduction preserving? |
| Naive attempt | `CircuitSatToSatInlineExpansionFigure`: stepwise substitution from `z` down toward inputs. | What does "just expand the circuit" mean? |
| Pain | `CircuitSatToSatDuplicationStrip`: repeated subexpression growth under fan-out, plus a separate tiny forked-subcircuit side figure with explicit copy-count annotations before and after inlining. | Why is full expansion the wrong general reduction idea? |
| Core invention | `CircuitSatToSatGateGadgetGallery`: one `AND`, one `OR`, and one `NOT` encoding card, each with a truth mini-card and the rewritten `AND`/`OR`/`NOT` formula. | How can one gate be encoded locally without changing the SAT language? |
| Variable roles | `CircuitSatToSatVariableRoleLegend`: input variables versus helper gate variables. | Are we changing the problem or only recording more state? |
| Vocabulary bridge | `CircuitSatToSatAssignmentExtensionStrip`: input-only assignment, extension to helper variables, and restriction back to inputs. | What do extension and restriction mean before the formal proofs? |
| Master demo | `CircuitSatToSatReductionTrace`: step/reset build of emitted constraints plus assignment checking in both views, while local visuals carry the proof details instead of overloading the main widget. | How does the reduction get built and why does it preserve satisfiability? |
| Formal definition | `CircuitSatToSatFormalCard`: blueprint on one side, emitted `Phi_C = z AND big-and of emit(g)` on the other, plus an output-assertion badge explaining "output 1, not just consistency". | What is the reduced SAT formula precisely? |
| Output assertion | `CircuitSatToSatOutputAssertionCard`: all gate constraints satisfied for `0000`, but the whole reduction still fails until `z=1` is asserted. | Why is `AND z` necessary beyond local consistency? |
| Implementation | `CircuitSatToSatBuilderTable`: one row per gate in declared topological order with source gate id, matching helper name, blueprint, and emitted constraint. | What would reduction code emit? |
| Correctness | `CircuitSatToSatTwoDirectionsLedger`: separate forward and backward proof cards, plus a witness table for input `1010`, a broken-constraint card, and an extension/projection mini-diagram. | Why do both directions hold? |
| Invariant | `CircuitSatToSatConsistencyRail`: topological order showing each new helper value is forced by earlier values. | Why can the formula not cheat on intermediate gates? |
| Complexity | `CircuitSatToSatSizeStack`: inputs, gate variables, constant-size constraints, final output assertion. | Why is the construction polynomial? |
| Common confusions | `CircuitSatToSatMisconceptionCards`. | Which tempting interpretations are false? |
| Connections | `CircuitSatToSatGraphStrip`: local strip with `polynomial-time-reductions`, `circuit-sat`, `sat`, and this node. | Where does this bridge sit in the graph? |
| Exercises | Lightweight practice cards driven by the same fixture and example assignments. | Can the learner classify what the reduction preserves and what helper variables mean? |

No major section should rely on prose alone unless implementation notes a deliberate exception.

## Formula And Notation Plan

Introduce notation after the fixture is visible:

- `$C$`: the source circuit.
- `$\Phi_C$`: the SAT formula produced from `C`.
- `$Gates(C)$`: the set of non-input gates of `C`, including the designated output gate.
- `$\operatorname{blueprint}(g)$`: the readable local shorthand for gate `$g$`, which may use `\leftrightarrow`.
- `$\operatorname{emit}(g)$`: the actual SAT formula for gate `$g$`, using only `\land`, `\lor`, and `\lnot`.
- `$a$`: an input assignment for the circuit.
- `$\widehat{a}$`: the extension of `$a$` to all helper variables.
- `$b$`: any satisfying assignment of the whole SAT formula, so it gives values to both inputs and gate variables.
- `$b|_{\text{inputs}}$`: the restriction of `$b$` to only the original circuit input variables.
- `$|C|$`: circuit size.
- `$|\Phi_C|$`: formula size.

Local prerequisite to restate on the page:

- The reduction assumes the circuit is acyclic, so its non-input gates can be listed in topological order.
- Each gate's inputs therefore come from original inputs or from earlier gates in that order.
- This is what makes the extension `\widehat{a}`, the backward recomputation, and the deterministic builder walk well-defined.

Variable convention:

- There is one SAT variable for every non-input circuit node.
- Input wires reuse the original circuit input variable names such as `x1, x2, x3, x4`.
- Every internal gate output reuses its stable circuit node id as the SAT variable name, such as `n1, g1, g2, g3, g4`.
- The designated circuit output gate also gets its own SAT variable, `z` in the fixture.
- Tests and implementation should treat `z` exactly like the other non-input nodes when generating constraints, emit those constraints in the fixture's declared topological order, and then add one extra final conjunct `z`.

Main reduction formula:

```tex
\Phi_C = z \land \bigwedge_{g \in Gates(C)} \operatorname{emit}(g)
```

Plain-language interpretation: every helper variable must honestly represent its gate in emitted SAT syntax, and the final output variable must be `1`.

Readable blueprint templates:

```tex
\text{AND gate } g(u,v):\quad g \leftrightarrow (u \land v)
```

```tex
\text{OR gate } g(u,v):\quad g \leftrightarrow (u \lor v)
```

```tex
\text{NOT gate } g(u):\quad g \leftrightarrow \lnot u
```

Explain `\leftrightarrow` in words as "has the same truth value as", then immediately rewrite it into the SAT node's base language with only `\land`, `\lor`, and `\lnot`.

Emitted templates:

```tex
\operatorname{emit}_{AND}(g,u,v) =
(\lnot g \lor (u \land v)) \land (\lnot (u \land v) \lor g)
```

```tex
\operatorname{emit}_{OR}(g,u,v) =
(\lnot g \lor (u \lor v)) \land (\lnot (u \lor v) \lor g)
```

```tex
\operatorname{emit}_{NOT}(g,u) =
(\lnot g \lor \lnot u) \land (u \lor g)
```

Invariant hook:

- Because the circuit is acyclic and gates are processed in topological order, each emitted constraint refers only to original inputs or helper variables already introduced earlier in the walk.
- The page should restate this locally near the formal reduction or invariant card instead of leaving it implicit in prerequisites only.

Forward direction:

```tex
C(a)=1 \;\Longrightarrow\; \Phi_C(\widehat{a})=1
```

Plain-language interpretation: run the circuit on `a`, write down every intermediate gate result in topological order, and use those gate outputs to extend `a` into `\widehat{a}`. Then every emitted gate constraint is true, and `z=1` is true because the circuit accepted.

Forward scaffolding requirement:

- Add a small witness table for `1010` showing inputs, each non-input node value, and which conjunct it satisfies.

Backward direction:

```tex
\Phi_C(b)=1 \;\Longrightarrow\; C(b|_{\text{inputs}})=1
```

Plain-language interpretation: start with a satisfying SAT assignment `b`. Because every `emit(g)` is true, the value that `b` assigns to each gate variable must match what that gate would compute from earlier values. Restrict to the original inputs with `b|_{\text{inputs}}`; now the whole acyclic circuit recomputes the same intermediate values in topological order, so the output gate computes `1` because `z=1` was also required.

Backward scaffolding requirement:

- Define `b` and `b|_{\text{inputs}}` in prose before the proof card.
- Include an extension/projection mini-visual: left side shows input-only assignment, middle shows added gate values, right side shows dropping helper columns again.
- Include one cheating micro-example where a candidate assignment sets `g1=1` even though `x1=0` and `n1=1`; the violated gate constraint should visibly light up to show why local consistency forbids cheating.

Complexity:

```tex
|\Phi_C| = O(|C|)
```

Plain-language interpretation: assume `AND` and `OR` gates have fan-in `2`, `NOT` gates have fan-in `1`, and `|C|` counts the encoded inputs, gates, and wires of the circuit. Under that representation, the reduction adds one variable and one constant-size formula gadget per non-input gate, plus the final output assertion, so the total size stays linear in `|C|`.

Keep CNF notation out of this node.

## Component And State Model

Expected implementation files:

```text
src/components/interactive/circuitSatToSatTrace.ts
src/components/interactive/CircuitSatToSatReductionTrace.tsx
src/components/interactive/CircuitSatToSatSupportFigures.tsx
tests/circuit-sat-to-sat-trace.test.ts
```

Suggested trace/state model:

- Reuse one shared typed circuit fixture source rather than duplicating the circuit description in strings.
- Shared circuit fixture should expose input ids, gate ids, gate kinds, dependencies, declared topological order, and output id.
- Keep emitted constraints as structured data first, then derive learner-facing strings from that structure.
- Reduction steps containing:
  - current gate id
  - helper variable name, equal to the stable gate id
  - readable blueprint data
  - emitted constraint structure
  - localized explanation
  - partial emitted-form sequence so far
  - implied helper values under sample assignments `1010` and `0101`
- Final step appends `AND z`.
- Trace state and tests should assert the emitted constraint sequence in fixture topological order; blueprint data is explanatory only and must not be the accumulated SAT formula.
- Support data for misconception cards and practice cards should stay deterministic and fixture-backed.
- Tests should primarily check semantic structure, order, and value flow rather than exact prose strings.

Master demo requirements:

- `step` and `reset` controls at minimum.
- Visible text summary of the current gate and why its constraint is correct.
- If the UI shows both blueprint and emitted views, the accumulated-formula panel must display emitted form only.
- Both circuit-side values and formula-side helper values shown in text, not only color.
- Reduced-motion-friendly with no auto-play requirement.
- Mobile layout stacks panels in teaching order: circuit, emitted constraint, accumulated formula, assignment/value table, explanation.
- Keep the master demo focused on one reduction-building flow; do not pack per-gate truth tables, forward witness details, and backward failure cases into the same widget when those belong on nearby local cards.

## Graph Placement

Suggested graph node placement: between `circuit-sat` and `sat`, slightly below them so it reads as a bridge rather than a replacement.

Suggested edges:

- `polynomial-time-reductions -> circuit-sat-to-sat` with `prerequisite`
  - en: "This node is a concrete polynomial-time reduction, so it relies on the reductions node's answer-preservation proof template."
  - zh: "这个节点展示一个具体的多项式时间归约，因此依赖归约节点中的答案保持证明模板。"
- `circuit-sat -> circuit-sat-to-sat` with `prerequisite`
  - en: "This node starts from a Circuit-SAT instance and asks how to encode the same satisfiability question as a formula."
  - zh: "这个节点从 Circuit-SAT 实例出发，讨论如何把同一个可满足性问题编码成公式。"
- `sat -> circuit-sat-to-sat` with `prerequisite`
  - en: "The reduction only makes sense once learners know what a SAT formula and satisfying assignment mean."
  - zh: "只有先理解 SAT 公式和满足赋值，这个归约的目标对象才有意义。"

Keep future CNF/3SAT nodes as prose-only mentions, not graph edges.

## Accessibility And Mobile

- Never rely on color alone for input variables versus helper variables; use labels, badges, and role text.
- Master demo controls need descriptive button labels and keyboard access.
- Use `aria-live="polite"` for the current-step explanation and any reveal feedback.
- Formula blocks need wrap-safe layout and horizontal scroll only as a fallback.
- On mobile, proof directions collapse into separate stacked cards rather than tight side-by-side columns.
- Chinese content keeps `translationStatus: needs-review` and should avoid overly long rigid sentences.

## Acceptance Criteria

- The page stays bounded to arbitrary SAT, not CNF/3SAT.
- The same core circuit fixture is reused from `circuit-sat`.
- The implementation reuses one shared typed circuit fixture source and derives rendered text from structured reduction data.
- The node explicitly explains why helper gate variables are introduced.
- The page distinguishes tiny inline expansion from the general polynomial-size reduction.
- The page explicitly separates readable blueprint shorthand from the actual emitted SAT instance.
- The master trace and tests accumulate emitted constraints only, never blueprint shorthand.
- The page states that `\leftrightarrow` is shorthand and rewrites the learner-visible SAT formula back into `AND`/`OR`/`NOT`.
- The page states that there is one SAT variable for every non-input circuit node, including the output node.
- The page includes an early answer-preservation bridge card before the gate-gadget details.
- The page includes a dedicated `AND z` contrast where all gate-consistency constraints are satisfied but the output is still `0`.
- Both correctness directions receive dedicated prose and a dedicated visual/proof card.
- The backward direction defines `Gates(C)`, `emit(g)`, `b`, and `b|_{\text{inputs}}`, and includes a cheating-assignment example.
- The fan-out pain section includes a separate forked-subcircuit contrast figure with explicit copy-count annotations.
- The complexity section states the fixed fan-in and size-measure assumptions behind the linear bound.
- The page locally restates the acyclic/topological-order prerequisite near the formal reduction or invariant.
- Every major section has nearby visual or trace support.
- Graph node and edge reasons validate with existing content.
- English and Chinese pages exist.
- The reduction trace is deterministic, network-free, test-backed, uses stable circuit node ids as helper names, and emits constraints in the fixture's declared topological order.

## Validation

Before finishing implementation, run:

```bash
npm run check
npm run test
npm run build
```
