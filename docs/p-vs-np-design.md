# P vs NP Node Design

## Node Scope

`p-vs-np` is a beginner concept node that introduces the question:

> If a proposed solution can be checked quickly, can a solution also be found quickly?

Redesign constraint: the node must be self-contained for `P`, `NP`, and the open question `P = NP?`, while staying bounded to that topic. Polynomial time, decision problem, certificate, verifier, and input size should be scaffolded inline enough for this page. Circuit-SAT, reductions, NP-hardness, NP-completeness, and complete hardness proofs are named only as follow-up nodes, not required reading.

In scope:

- Decision problems as Yes/No questions.
- Polynomial time as the shared efficiency boundary for solving and checking.
- `P` as decision problems solvable in polynomial time.
- `NP` as decision problems whose Yes answers have polynomial-time checkable certificates.
- Certificate and verifier intuition using a tiny Boolean lock as a local example, not as a full Circuit-SAT lesson.
- Why `P ⊆ NP` is immediate, but `P = NP?` remains unknown.
- Forward pointers to Circuit-SAT, reductions, and NP-hardness.

Out of scope:

- Formal NP-completeness proofs.
- Cook-Levin theorem beyond naming Circuit-SAT as an important later example.
- Detailed reduction construction.
- Optimization problems except for a brief note that many optimization questions can be converted to decision versions.
- Complexity classes beyond `P`, `NP`, and forward pointers to `NP-hard` / `NP-complete`.

## Proposed Frontmatter

English page:

```yaml
id: p-vs-np
locale: en
title: P vs NP
summary: Understand the difference between finding a solution quickly and checking a proposed solution quickly.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - complexity
  - algorithms
  - decision-problems
  - np
prerequisites: []
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Chinese page:

```yaml
id: p-vs-np
locale: zh
title: P 与 NP
summary: 理解“快速找到答案”和“快速检查一个候选答案”之间的区别。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - complexity
  - algorithms
  - decision-problems
  - np
prerequisites: []
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

## Teaching Arc

1. Hook problem: ask whether a small Boolean lock has any key that opens it, then compare that with checking one claimed key. Include a tiny legend: switches are Boolean inputs, AND/OR/NOT are gates, and output `1` means the lock opens.
2. First naive idea: try every possible key / assignment.
3. Pain point: each new Boolean input doubles the number of assignments, so search grows too quickly.
4. Core invention: separate finding a solution from checking a proposed solution.
5. Visual anchors: use one tiny verifier circuit and assignment table across the certificate, verifier, and exercises. Use a separate worst-case search fixture for the growth story so the page never suggests brute force is usually fine.
6. Decision conversion: show how an optimization-style question becomes a Yes/No question before naming complexity classes.
7. Formal version: define decision problem, polynomial time, `P`, `NP`, certificate, and verifier.
8. Implementation sketch: general deterministic verifier shape `verify(circuit, assignment)`, then an expanded trace for the tiny fixture.
9. Correctness intuition: `P ⊆ NP` because a polynomial-time solver can ignore an empty/dummy certificate and solve directly.
10. Complexity: brute-force search can be `2^n * poly(n)`, while checking one certificate can be `poly(n)`.
11. Common confusions: `NP` does not mean “not polynomial”; `NP-hard` is not the same as `NP`; this page talks about Yes certificates.
12. Connections: state that the node is complete for `P vs NP`; Circuit-SAT, reductions, and NP-hardness are deeper follow-up nodes.
13. Exercises: classify examples as decision/non-decision, solve/check, definitely in `P`, or in `NP` by certificate.

## Vocabulary Scaffolding

Introduce each term only when the learner needs it:

- Decision problem / 判定问题（decision problem）: a problem whose output is Yes or No.
- Polynomial time / 多项式时间（polynomial time）: running time bounded by `O(n^c)` for some constant `c`.
- Certificate / 证书（certificate）: extra evidence that supports a Yes answer.
- Verifier / 验证器（verifier）: an algorithm that checks a certificate.
- `P` / P 类: decision problems that can be solved in polynomial time.
- `NP` / NP 类: decision problems where Yes answers have polynomial-time checkable certificates. Mention “nondeterministic polynomial time” only after the certificate intuition is established.
- Circuit-SAT / 电路可满足性（Circuit-SAT）: asks whether some Boolean input assignment makes a circuit output True.

## Verifier Circuit Fixture

Use a fixed three-input Boolean circuit for certificate-checking visuals, verifier traces, and exercises. This toy fixture intentionally has many possible opening keys, so the lock metaphor should say “find any key that opens the lock,” not “find the only key.” Do not use this fixture as the evidence that search scales well.

```ts
const circuitInputs = ["x1", "x2", "x3"] as const;

const circuitGates = [
  { id: "g1", op: "AND", inputs: ["x1", "x2"] },
  { id: "g2", op: "NOT", inputs: ["x3"] },
  { id: "z", op: "OR", inputs: ["g1", "g2"] }
] as const;
```

Formula view:

```text
z = (x1 AND x2) OR (NOT x3)
```

Candidate assignments:

| Assignment | `g1 = x1 AND x2` | `g2 = NOT x3` | `z = g1 OR g2` | Result |
|---|---|---|---|---|
| `x1=1, x2=1, x3=0` | `1` | `1` | `1` | accepting certificate |
| `x1=0, x2=0, x3=0` | `0` | `1` | `1` | another opening key |
| `x1=0, x2=1, x3=1` | `0` | `0` | `0` | failed candidate |

The accepting assignment powers the certificate-checking visuals. The failed candidate powers the misconception that every proposed certificate must be accepted. The extra accepting row keeps the metaphor accurate: this lock may have several keys, but one valid key is enough to prove a Yes instance.

## Search And Growth Fixture

Use a separate scaling thought experiment for the search pain point.

```ts
type SearchFixture = {
  variables: number;
  gateCount: number;
  acceptingAssignments: "needle-last" | "unknown";
};
```

For the naive-search story, use a needle-in-haystack fixture where the documented accepting assignment is last in lexicographic order. This keeps the visual honest: brute force can get lucky, but a worst-case solver may need to rule out almost every candidate before finding a Yes certificate or concluding No. In the toy-circuit snapshot, show at least one rejected candidate such as `011` before revealing `000`; if `000` appears early in the grid, annotate it as "lucky for this toy circuit, not a worst-case promise."

Growth labels must visibly distinguish the fixtures:

| Fixture | Label | Variables | Gates | Used for |
|---|---|---:|---:|---|
| Toy verifier circuit | `fixed toy circuit` | `3` | `3` | Certificate checking and trace expansion. |
| Scaling thought experiment | `not the same circuit` | `n` | `2n` | Search growth and asymptotic comparison. |

The growth demo should include a persistent badge/caption: `not the same circuit`. Its purpose is to compare `2^n` candidate assignments against polynomial-size checking work, not to claim the three-input toy circuit becomes harder. Caption: "Counting model for this visual only; a full proof also accounts for encoding cost. Input size includes the circuit description, not just the variable count `n`."

## Size Scaffolding

Add a compact size strip near the certificate definition and reuse it in the formal version:

```text
instance size: |circuit| = inputs + gates
certificate size: |assignment| = one bit per input
verifier steps: format check + gate evaluation
```

Example for the toy fixture:

| Item | Value | Why it matters |
|---|---:|---|
| Instance size | `3 inputs + 3 gates` | The problem description is small. |
| Certificate size | `3 bits` | The proposed key is short relative to the instance. |
| Verifier steps | `validate 3 bits + evaluate 3 gates` | Checking is local and polynomial. |

Edge-case card: a giant lookup table of all satisfying assignments is not automatically a valid NP certificate. It only counts if the certificate size is polynomial in the input size; an exponentially large table just hides the search work inside the certificate.

## Decision Conversion Mini Visual

Include one concrete conversion before formal definitions:

```text
Optimization question: Find the shortest route from A to B.
Decision version: Is there a route from A to B with length <= K?
Certificate for Yes: a specific route whose length can be checked.
```

Visual form: a small route card flows into a Yes/No threshold card labeled `K`, then a certificate card shows one proposed route being summed and compared with `K`.

## Deterministic State Models

Growth comparison:

```ts
type SearchVsCheckGrowthState = {
  fixture: "fixed-toy-circuit" | "scaling-thought-experiment";
  variables: number;
  assignments: number;
  gateCount: number;
  checkSteps: number;
};
```

Golden rule:

- `assignments = 2 ** variables`
- For the fixed toy verifier fixture, `gateCount = 3`.
- For the growth demo, use a scalable synthetic certificate-checking model with `gateCount = 2 * variables`; label it `not the same circuit` so learners do not confuse it with the fixed three-gate circuit.
- `checkSteps = variables + gateCount`
- Display both modes explicitly: `fixed toy circuit: 3 inputs, 3 gates` and `scaling thought experiment: n inputs, 2n gates`.

Circuit trace:

```ts
type CircuitGate =
  | { id: string; op: "INPUT"; valueKey: string }
  | { id: string; op: "NOT"; inputs: [string] }
  | { id: string; op: "AND" | "OR"; inputs: [string, string] };

type CircuitTraceStep = {
  gateId: string;
  op: string;
  inputValues: boolean[];
  outputValue: boolean;
  explanation: Record<"en" | "zh", string>;
};
```

General verifier pseudocode:

```ts
function verify(circuit: Circuit, assignment: Assignment): boolean {
  const inputIds = new Set(circuit.inputs);

  if (Object.keys(assignment).length !== inputIds.size) return false;
  for (const inputId of inputIds) {
    if (!(inputId in assignment)) return false;
    if (assignment[inputId] !== 0 && assignment[inputId] !== 1) return false;
  }

  const values = new Map<string, boolean>();
  for (const inputId of circuit.inputs) {
    values.set(inputId, assignment[inputId] === 1);
  }

  for (const gate of topologicalOrder(circuit.gates)) {
    const inputValues = gate.inputs.map((id) => values.get(id));
    if (inputValues.some((value) => value === undefined)) return false;
    values.set(gate.id, evaluateGate(gate.op, inputValues as boolean[]));
  }

  return values.get(circuit.output) === true;
}
```

Expanded toy-fixture trace only:

```ts
function verifiesToyFixture(certificate: Assignment): boolean {
  const g1 = certificate.x1 && certificate.x2;
  const g2 = !certificate.x3;
  const z = g1 || g2;
  return z === true;
}
```

Golden trace states:

| State id | Visual state | Purpose |
|---|---|---|
| `initial-unknown` | Circuit visible, key slots blank, output shown as unknown. | The learner starts with a decision question, not an answer. |
| `try-000` | Assignment `000` plugged into the lock; output becomes `1`. | Shows that the toy circuit can get lucky; annotate that worst-case search has no such promise. |
| `try-failed-candidate` | Assignment `011` plugged in; output becomes `0`. | One candidate can fail even when the instance is still Yes. |
| `accepting-candidate` | Assignment `110` or `000` highlighted as an opening key. | A single accepting certificate proves the Yes answer. |
| `verifier-accepts` | Well-formed assignment flows through all gates and output is `1`. | Checking a valid certificate is local and polynomial. |
| `verifier-rejects-malformed` | Certificate has a missing bit or invalid symbol; verifier stops before gate evaluation. | Verifiers must check certificate format, not just the claimed property. |
| `candidate-exists` | One candidate row is marked `exists` and points to an accepting trace state. | A Yes instance only needs one valid certificate. |
| `candidate-failed` | One candidate row is marked `failed` and points to `try-failed-candidate`. | One failed certificate is not a No proof. |
| `p-subset-np-yes` | Yes instance -> polynomial-time solver says Yes -> verifier accepts an empty/dummy polynomial-size certificate; badge: `not the circuit verifier`. | A `P` solver can act as an `NP` verifier without using the certificate. |
| `p-subset-np-no` | No instance -> polynomial-time solver says No -> verifier rejects the empty/dummy certificate; badge: `not the circuit verifier`. | The same verifier is sound because No instances accept nothing. |

## Section-Level Visual Inventory

No major section should be prose-only. Short prose bridges are fine between adjacent visual states.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Split panel: left shows eight possible keys for the three-input circuit; right shows one proposed key plugged into the circuit. Add a compact Boolean lock legend nearby: switches set `0/1`, AND requires both inputs, OR requires at least one input, NOT flips one input, and output `1` opens the lock. | Why can checking one proposed answer feel much easier than finding one? |
| First naive idea | Pre-demo static snapshot for `FindVsCheckDemo` tab `search all assignments`: assignment tree or grid for `000` through `111`, plus a separate needle-in-haystack row labeled `scaling search fixture`. Reuse state ids `initial-unknown`, `try-failed-candidate`, `try-000`, and `accepting-candidate`; show the failed `011` attempt before the lucky `000` reveal, or label early `000` as toy luck. | What does brute-force solving actually do, and why should one lucky toy run not be generalized? |
| Where it breaks | `SearchVsCheckGrowthDemo` slider for `n`; compare `2^n` assignments with `n + gates` verification steps, using the synthetic model `gateCount = 2 * variables`. Show the mode switch between `fixed toy circuit: 3 inputs, 3 gates` and `scaling thought experiment: n inputs, 2n gates` with badge `not the same circuit`. | Why does candidate search explode while one check stays manageable? |
| Core invention | Pre-demo static snapshot for `FindVsCheckDemo` tab `check certificate`: certificate card showing `{x1: 1, x2: 1, x3: 0}` flowing through `g1`, `g2`, and `z`; nearby local cards show `candidate-exists` and `candidate-failed`. | What information does a certificate provide, and why does one failed candidate not settle the instance? |
| Interactive visual demo | `FindVsCheckDemo`: tabs for `search all assignments`, `check certificate`, and `P subset NP`; step, back, and reset controls. Each tab must have a matching pre-demo static snapshot earlier in its corresponding section, with identical visible labels and trace/state ids. Tabs reuse the section-level snapshots and trace states instead of introducing new visual representations. | How do solving, checking, and the subset relationship differ operationally? |
| Decision conversion | Mini visual: `Find the shortest route` -> `Is there a route of length <= K?` -> proposed route certificate gets summed and compared with `K`. | Why do complexity classes talk about Yes/No problems when many real tasks ask for an object? |
| Formal version | Set diagram with `P` inside `NP`, plus a clear unknown label `P = NP?`; NP-hard appears only as a faded “later” node. | What is known immediately, and what is still open? |
| Implementation sketch | General verifier pseudocode followed by a code-linked circuit trace table: each row maps a code line/gate to input values and output for the toy fixture only. Include a malformed-certificate row that rejects before gate evaluation. | What does a verifier look like as an algorithm, beyond one hardcoded circuit? |
| Correctness intuition | Pre-demo static snapshot for `FindVsCheckDemo` tab `P subset NP`: two-row flow with badge `not the circuit verifier`. Row 1: Yes instance -> polynomial-time solver says Yes -> verifier accepts an empty/dummy polynomial-size certificate. Row 2: No instance -> polynomial-time solver says No -> verifier rejects the empty/dummy certificate. Reuse state ids `p-subset-np-yes` and `p-subset-np-no`. | Why does `P ⊆ NP` follow automatically? |
| Complexity | Comparison table: brute-force search `2^n * checkCost` versus certificate check `checkCost`; include concrete rows for `n = 3, 10, 30`, and a size strip for instance size, certificate size, and verifier steps. | Where exactly is polynomial time used? |
| Common confusions | Misconception cards with mini visuals: `NP ≠ not polynomial`, `NP-hard ≠ automatically in NP`, `this page only needs Yes certificates`, `decision version vs optimization version`, and `giant lookup table is not a polynomial-size certificate`. Include a tiny failed-key figure: one failed key does not prove no key exists; proving none by trying all keys is search/solving. | Which common shortcuts are misleading? |
| Connections | Local graph strip: inline vocabulary chips for polynomial time and decision problems sit beside `p-vs-np`; outgoing arrows point to `circuit-sat`, `polynomial-time-reductions`, and `np-hardness`. Optional future supporting nodes `polynomial-time-efficiency` and `decision-problems` may be added later, but they are not current prerequisites. | How does this node prepare the hardness sequence without leaving the first-batch boundary? |
| Exercises | Deterministic classifier cards and one circuit trace prediction. | Can the learner apply solve/check/certificate distinctions? |

## Proposed Components

- `PnpCircuitFigure`: static React/SVG figure for the toy verifier circuit, with scenarios `hook`, `accepting-certificate`, `failed-candidate`, `candidate-exists`, `candidate-failed`, `code-trace`, and `malformed-certificate`.
- `SearchVsCheckGrowthDemo`: slider micro-widget for variables `3..30`, reset button, text summary, and reduced-motion-friendly numeric transitions.
- `FindVsCheckDemo`: master widget that steps through brute-force search versus direct certificate checking on the toy verifier circuit, then the `P ⊆ NP` flow. Its tabs must compose the same `PnpCircuitFigure`, growth snapshots, and trace states used earlier in the page. Each tab must reference a pre-demo static snapshot with identical labels and state ids. Implement tabs as either ARIA tabs with arrow-key navigation and correct `role="tablist"`, `role="tab"`, and `role="tabpanel"` wiring, or as simple segmented buttons where each button is a normal keyboard-focusable control. Include a non-visual step transcript for the circuit trace.
- `PnpSetDiagram`: static set diagram for `P ⊆ NP` and the unresolved `P = NP?` boundary.
- `PnpDecisionConversionFigure`: static mini visual for optimization-to-decision conversion, using `Find the shortest route` -> `Is there a route of length <= K?`.
- `PnpClassifierCards`: exercise widget with deterministic answer reveal.

Prefer extracting shared data to `src/components/interactive/pnpTrace.ts` so all figures and widgets render from the same typed toy-verifier fixture, scaling fixture, and named state-id registry.

## Accessibility And Mobile

- Every figure must include text labels for state, not color alone.
- Circuit gates need labels such as “AND gate receives True and True, outputs True.”
- Controls need descriptive button labels: Step search, Check certificate, Back, Reset.
- `FindVsCheckDemo` tab controls must be keyboard accessible: use ARIA tab behavior with arrow keys, or use ordinary segmented buttons with clear pressed/selected state.
- `FindVsCheckDemo` must render a non-visual transcript of each circuit trace step, such as current assignment, gate inputs, gate output, and final accept/reject result.
- Slider must expose the current variable count and computed assignment count.
- Respect reduced motion; numeric changes should not require animation to be understood.
- On mobile, split panels stack vertically in story order: problem, candidate/certificate, explanation.
- Assignment and complexity tables should become stacked card layouts on narrow screens: each row becomes one card with the assignment or `n` value as the heading, gate/check values as labeled fields, and the result as a final status line.
- Other tables should use short labels and wrap rather than overflow when practical.
- Use semantic colors consistently: blue for definitions, orange for active search/checking, green for accepted certificate, red-orange for failed candidates or misconceptions.

## Exercise Specs

Use obvious beginner cases with deterministic answer reveal. Each reveal should state the reason category, not just the label:

| Prompt | Expected reveal |
|---|---|
| `Is 42 even?` | Definitely in `P`: compute `42 % 2` directly with an explicit polynomial-time algorithm. |
| `Given a solved Sudoku grid, is it valid?` | In `NP` by certificate/checking: the filled grid is a certificate that can be checked row, column, and box by box in polynomial time. Avoid claiming the puzzle-solving version is definitely in `P`. |
| `Find the shortest route from A to B.` | Not a decision problem yet: convert it to `Is there a route from A to B with length <= K?` before classifying under `P`/`NP`. |
| `Given a route and a distance limit K, is the route length <= K?` | Polynomial verifier only: sum the route distances and compare with `K`; this demonstrates checking, not necessarily finding the best route. |
| `Does this Boolean circuit have an assignment that outputs 1?` | In `NP` by certificate: a proposed assignment can be format-checked and evaluated gate by gate in polynomial time. |

## Common Confusions And Edge Cases

- `NP` does not mean “not polynomial.”
- `P vs NP` is not asking whether current algorithms are clever enough; it asks whether polynomial-time algorithms exist in principle.
- This page only requires efficiently checkable Yes certificates. Efficiently checkable No certificates lead to other complexity classes and are saved for a later node.
- Circuit-SAT being in `NP` means assignments are easy to check, not that satisfying assignments are easy to find.
- Brute force is an algorithm, but it is generally not polynomial for assignment search.
- Decision problems are deliberate simplifications, not a limitation of real algorithmic questions.
- A verifier must check certificate format and the claimed property.
- `NP` only requires polynomial-size certificates for Yes instances; do not imply every No instance needs a similarly checkable certificate.
- A giant lookup table is not a valid NP certificate unless its size is polynomial in the input size.
- One failed certificate/key is evidence about that candidate only. It is not evidence that the whole instance is No unless all candidates have been ruled out by a solving procedure.

## Graph Placement

Proposed node:

```ts
{
  id: "p-vs-np",
  label: {
    en: "P vs NP",
    zh: "P 与 NP"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 300, y: 420 }
}
```

Current first-batch edges:

Do not add prerequisite edges from `polynomial-time-efficiency` or `decision-problems` in this batch. Those ids are useful future supporting nodes, but they are not part of the current 12-node batch and should not appear as current frontmatter prerequisites or graph edge endpoints until the nodes exist. Teach polynomial time and decision problems inline on this page.

```ts
{
  from: "p-vs-np",
  to: "circuit-sat",
  type: "motivates",
  reason: {
    en: "P vs NP motivates Circuit-SAT as a concrete later example where assignments act as efficiently checkable Yes certificates.",
    zh: "P 与 NP 引出 Circuit-SAT 这个后续具体例子：赋值可以作为高效检查的 Yes 证书。"
  }
}
```

```ts
{
  from: "p-vs-np",
  to: "polynomial-time-reductions",
  type: "motivates",
  reason: {
    en: "To compare problem difficulty inside the P vs NP landscape, we need reductions that preserve polynomial-time efficiency.",
    zh: "为了在 P 与 NP 的框架中比较问题难度，需要保持多项式时间效率的归约。"
  }
}
```

```ts
{
  from: "p-vs-np",
  to: "np-hardness",
  type: "motivates",
  reason: {
    en: "Once P vs NP separates solving from checking, NP-hardness asks which problems are at least as hard as the hardest NP problems.",
    zh: "P 与 NP 区分了求解和检查之后，NP-hardness 继续追问哪些问题至少和 NP 中最难的问题一样难。"
  }
}
```

## Acceptance Criteria

- Add English and Chinese MDX pages under `src/content/nodes/p-vs-np/`.
- Keep Chinese `translationStatus: needs-review` until human review.
- Add `p-vs-np` to `src/data/graph.ts` with valid localized labels and only edges whose endpoints exist in the current batch.
- Keep `prerequisites: []` for this first-batch plan; polynomial time and decision problems are inline vocabulary scaffolding until supporting nodes are added later.
- Page does not start with formal definitions; it starts with find-versus-check intuition.
- Every major section has a nearby visual, widget, table, or documented reason for prose-only treatment.
- Circuit and growth widgets are deterministic and share typed trace/state data.
- No runtime AI calls or network dependencies.
- Components have keyboard-accessible controls and mobile layouts.
- Never say or imply `NP = non-polynomial`.
- Never imply `P != NP` is known; present `P = NP?` as open.
- Distinguish “in `NP`” from `NP-hard`: `NP` needs efficiently checkable Yes certificates, while `NP-hard` is a hardness comparison introduced later.
- State that `NP` requires polynomial-size certificates for Yes instances.
- Keep the Boolean lock metaphor accurate: the fixture may have many opening keys, and one valid key is enough for a Yes certificate.
- Separate the fixed toy verifier circuit from the scaling/search fixture. The growth view must visibly label `fixed toy circuit: 3 inputs, 3 gates` versus `scaling thought experiment: n inputs, 2n gates` and show `not the same circuit`.
- Present verifier logic as `verify(circuit, assignment)`: validate assignment keys and bit values, evaluate gates in topological order, and return whether the output is true. Use the hardcoded three-gate version only as an expanded trace.
- Include visual scaffolding for instance size, certificate size, and verifier steps, plus an edge-case card explaining that a giant lookup table is invalid unless polynomial-size.
- Show `P ⊆ NP` as a two-row flow with badge `not the circuit verifier`: Yes instance -> polynomial-time solver says Yes -> verifier accepts an empty/dummy polynomial-size certificate; No instance -> polynomial-time solver says No -> verifier rejects the empty/dummy certificate.
- Each `FindVsCheckDemo` tab has a matching pre-demo static snapshot earlier in the page with identical labels and state ids, including local visuals for `candidate-exists` and `candidate-failed`.
- `FindVsCheckDemo` uses keyboard-accessible ARIA tabs or simple segmented buttons, and includes a non-visual transcript for circuit trace steps.
- Include the concrete decision-problem conversion visual: `Find the shortest route` -> `Is there a route of length <= K?`.
- Reword No-certificate discussion to say this page only requires efficiently checkable Yes certificates; efficiently checkable No certificates lead to other classes and are saved for later.

## Trace Acceptance Tests

When implementing the node, add focused tests or fixture assertions for:

- Candidate rows evaluate to the documented results: `110` accepts, `000` accepts, and `011` rejects for the toy verifier circuit.
- Malformed certificates reject before gate evaluation, including missing input keys and non-bit values.
- Growth values match `assignments = 2 ** n` and `checkSteps = n + 2n = 3n` for the scaling thought experiment.
- The fixed toy circuit growth mode reports `3 inputs`, `3 gates`, and `checkSteps = 6`.
- Every visual scenario and `FindVsCheckDemo` tab references a valid state id from the shared registry.
- The pre-demo static snapshots and interactive tabs use identical state ids and visible labels for `search all assignments`, `check certificate`, and `P subset NP`.

## Validation Commands

Run after implementation:

```bash
npm run check
npm run test
npm run build
```

For targeted validation during development:

```bash
npm run test -- validate-content
```
