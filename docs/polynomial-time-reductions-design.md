# Polynomial-Time Reductions Node Design

## Node Scope

`polynomial-time-reductions` is a beginner concept node about one idea:

> Translate instances of one decision problem into instances of another, quickly, while preserving the Yes/No answer.

The node should be self-contained for reductions while staying bounded. It may assume the learner has seen `p-vs-np`, but it should still scaffold `decision problem`, `polynomial time`, `instance`, `Yes/No answer`, and `iff` inline. It should not require reading Circuit-SAT, SAT, 3SAT, Clique, or NP-hardness first.

In scope:

- A reduction as a direct instance transformer `f` from problem `A` to problem `B`.
- The notation `A <=p B`.
- The preservation contract: for every source instance `x`, the produced target instance `f(x)` has the same Yes/No answer; `x` is a Yes instance of `A` iff `f(x)` is a Yes instance of `B`.
- The efficiency contract: `f` runs in polynomial time and does not hide the hard search.
- Algorithm transfer: if `A <=p B` and `B` has a polynomial-time solver, then `A` has one too.
- Hardness-transfer preview: if a fast solver for `B` existed, then the reduction would give a fast solver for `A`; therefore any reason to doubt fast solvers for `A` also applies to `B`.
- Named lecture-chain previews: Circuit-SAT -> SAT, SAT -> 3SAT, and 3SAT -> Clique, without construction details.

Out of scope:

- Full NP-hardness and NP-completeness definitions. Those belong to `np-hardness`.
- Cook-Levin theorem and Circuit-SAT internals.
- Gate-to-formula, SAT-to-3SAT, and 3SAT-to-Clique constructions.
- Many-one versus Turing reduction taxonomy beyond saying this page uses one-shot instance transformations.
- Approximation-preserving reductions and optimization reductions.

## Proposed Frontmatter

English page:

```yaml
id: polynomial-time-reductions
locale: en
title: Polynomial-Time Reductions
summary: Translate one decision problem into another while preserving Yes and No answers.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - complexity
  - algorithms
  - reductions
  - np-hardness
prerequisites:
  - p-vs-np
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Chinese page:

```yaml
id: polynomial-time-reductions
locale: zh
title: 多项式时间归约
summary: 把一个判定问题翻译成另一个判定问题，并保持 Yes/No 答案不变。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - complexity
  - algorithms
  - reductions
  - np-hardness
prerequisites:
  - p-vs-np
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Use `next: []` until `np-hardness` exists, because validation should not point to unimplemented nodes. When `np-hardness` is implemented, update `next` to include it.

## Teaching Arc

1. Hook problem: you own a fast solver for one puzzle format, but the input arrives in another format. Use the path-encoding example: “I have a solver for adjacency maps; do I need a new solver for edge lists?”
2. First naive confusion: “Given `A <=p B`, which solver do I need?” Learners often reverse the solver dependency before they are ready for hardness-transfer language.
3. Pain point: first show proof reuse for the immediate solver question: translate `A` into `B`, call the existing `B` solver, and return the same Yes/No answer. Then introduce the second motivation: once this reuse chain is understood, it also explains why hardness evidence can move from a doubted source problem toward a new target.
4. Core invention: build a fast translator `f` from `A` instances to `B` instances so the Yes/No answer is unchanged.
5. Visual anchors: make the path-encoding transformation the default visual for the hook, formal definition figure, and at least one practice card: the same reachability question is rearranged from an edge list into an adjacency map. Keep the arithmetic toy mainly for compact truth-table, code, and test examples. Label both examples as format adapters for mechanics, not difficulty evidence. Use the lecture-chain preview only as a map of later nodes.
6. Formal version: define `A <=p B` as a polynomial-time computable function with `x in A iff f(x) in B`.
7. Implementation sketch: `solveA(x) { y = reduceAtoB(x); return solveB(y); }`.
8. Correctness intuition: the two iff directions justify returning the target answer as the source answer.
9. Complexity: polynomial converter plus polynomial target solver is still polynomial.
10. Common confusions: arrow direction, answer preservation versus solution mapping, polynomial transformer versus hidden exhaustive search, and algorithm transfer versus hardness transfer.
11. Connections: `p-vs-np` supplies the decision/polynomial vocabulary; `np-hardness` will name the hardness-transfer rule; later reductions instantiate the pattern.
12. Exercises: classify arrows, test preservation rows, spot invalid one-way transformations, and compute combined cost.

## Vocabulary Scaffolding

- Decision problem / 判定问题（decision problem）: a problem whose output is Yes or No.
- Instance / 实例（instance）: one concrete input to a problem.
- Target problem / 目标问题（target problem）: the problem we translate into and then solve.
- Source problem / 源问题（source problem）: the problem we start from.
- Polynomial time / 多项式时间（polynomial time）: time bounded by `O(n^c)` for some constant `c`, where `n` is the input size in bits or description length, not the numeric magnitude of a value written in the input.
- Reduction / 归约（reduction）: a fast answer-preserving translation from one problem's instances into another problem's instances.
- `A <=p B`: read as “`A` reduces to `B` in polynomial time.” It means a solver for `B` can be used to solve `A` after translation.
- Relative difficulty wording: `A <=p B` means `A` is no harder than `B` for this reduction model, because a solver for `B` is enough to solve `A`.
- `iff`: “if and only if,” meaning for every source instance `x`, the produced target instance `f(x)` has the same Yes/No answer as `x`.

## Toy Reduction Fixture

Use a deliberately simple toy reduction that is not meant to be hard. Its job is to provide compact trace data for the truth table, implementation sketch, and arithmetic-specific tests after the learner has already seen the path-encoding structural transformation. Label it as a format adapter: the source and target ask the same Yes/No question with a slightly different input format, so the learner can see the reduction contract without also learning a real NP-hardness construction. Add a nearby note that input size means the bit/description length of the encoded instance, not the numeric magnitude of `a`, `b`, or `target`.

Source problem `TwoNumberSum4`:

```text
Input: two nonnegative integers a, b
Question: is a + b = 4?
```

Target problem `TargetSum`:

```text
Input: two nonnegative integers a, b, and target t
Question: is a + b = t?
```

Reduction:

```ts
function reduceTwoNumberSum4ToTargetSum(source: { a: number; b: number }) {
  return { a: source.a, b: source.b, target: 4 };
}
```

Fixture rows:

| Source instance | Source answer | Target instance | Target answer | Purpose |
|---|---|---|---|---|
| `(1, 3)` | Yes | `(1, 3, 4)` | Yes | A normal Yes-preserving row. |
| `(2, 2)` | Yes | `(2, 2, 4)` | Yes | Shows many source Yes instances can map correctly. |
| `(1, 1)` | No | `(1, 1, 4)` | No | No answers must also be preserved. |
| `(0, 4)` | Yes | `(0, 4, 4)` | Yes | Boundary-looking row with zero. |
| `(5, 0)` | No | `(5, 0, 4)` | No | Another No row, useful for exercises. |

Label every toy visual with “format adapter only; mechanics, not difficulty or hardness.”

Default structural visual example:

Source problem `HasPathPairList`:

```text
Input: a list of directed edges and two nodes s, t
Question: is there a path from s to t?
```

Target problem `HasPathAdjacencyMap`:

```text
Input: an adjacency map plus two nodes s, t
Question: is there a path from s to t?
```

Visual: left card shows edge-list encoding `[(A,B), (B,C)]`, translator redraws the same graph as `{ A: [B], B: [C], C: [] }`, right card asks the same reachability Yes/No question. The annotation should say “same question, different encoding,” not “add a field.” Use this as the first visual in the hook, reuse it in the formal definition figure, and include at least one practice card that asks whether this path-encoding row preserves the Yes/No answer. Keep the arithmetic toy for compact truth-table and code-test rows.

Optional second structural micro-row if the arithmetic fixture still feels too dominant: encode a grid location from `{ row: 2, col: 3 }` into a single cell id `"r2-c3"` while preserving a Yes/No membership question. The point is field rearrangement/encoding, not adding an extra target field.

## Deterministic State Models

Shared fixture file for implementation:

```ts
src/components/interactive/reductionTrace.ts
```

Proposed types:

```ts
export type SourceProblemId = "TwoNumberSum4";
export type TargetProblemId = "TargetSum";

export type ToySourceInstance = {
  id: "yes-13" | "yes-22" | "no-11" | "yes-04" | "no-50";
  a: number;
  b: number;
};

export type ToyTargetInstance = {
  a: number;
  b: number;
  target: 4;
};

export type ReductionTraceStep =
  | {
      id: "receive-source";
      source: ToySourceInstance;
      sourceAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "compute-target";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      sourceAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "solve-target";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      targetAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "return-answer";
      source: ToySourceInstance;
      target: ToyTargetInstance;
      sourceAnswer: boolean;
      targetAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    };

export type InvalidReductionCase =
  | {
      id: "one-way-implication";
      violation: "missing-reverse-direction";
      annotation: Record<"en" | "zh", string>;
    }
  | {
      id: "exponential-translator";
      violation: "not-polynomial-time";
      annotation: Record<"en" | "zh", string>;
    }
  | {
      id: "solves-inside-translator";
      violation: "hidden-source-solver";
      annotation: Record<"en" | "zh", string>;
    }
  | {
      id: "wrong-hardness-arrow";
      violation: "wrong-transfer-direction";
      annotation: Record<"en" | "zh", string>;
    }
  | {
      id: "solution-object-confusion";
      violation: "maps-witness-not-decision-answer";
      annotation: Record<"en" | "zh", string>;
    };

export type PathEncodingExample = {
  id: "path-abc";
  edgeList: Array<readonly [string, string]>;
  adjacencyMap: Record<string, string[]>;
  source: string;
  target: string;
  answer: boolean;
  caption: Record<"en" | "zh", string>;
};

export type PathEncodingTraceStep =
  | {
      id: "receive-edge-list";
      example: PathEncodingExample;
      sourceAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "build-adjacency-map";
      example: PathEncodingExample;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "solve-adjacency-map";
      example: PathEncodingExample;
      targetAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "return-path-answer";
      example: PathEncodingExample;
      sourceAnswer: boolean;
      targetAnswer: boolean;
      explanation: Record<"en" | "zh", string>;
    };

export type DirectionCase =
  | {
      id: "algorithm-transfer";
      mode: "algorithm-transfer";
      notation: "A <=p B";
      assumedSolver: "B";
      derivedSolver: "A";
      conclusion: Record<"en" | "zh", string>;
      validConclusion: true;
    }
  | {
      id: "hardness-preview";
      mode: "hardness-preview";
      notation: "A <=p B";
      knownHardSource: "A";
      target: "B";
      conclusion: Record<"en" | "zh", string>;
      validConclusion: true;
    }
  | {
      id: "wrong-hardness-arrow";
      mode: "hardness-preview";
      notation: "B <=p A";
      knownHardSource: "A";
      attemptedTarget: "B";
      conclusion: Record<"en" | "zh", string>;
      validConclusion: false;
    };

export type ReductionCostState = {
  sourceEncodingLength: number;
  translatorWork: number;
  targetEncodingLength: number;
  targetSolverTime: number;
  combinedTime: number;
  mappedInstanceSize: number;
  mappedInstanceSizeIsPolynomial: boolean;
};
```

Use a discriminated union for trace steps. Step-specific fields should be required by the selected `id`, so a `solve-target` step cannot accidentally omit `targetAnswer`.

Golden expectations for tests:

- `reduceTwoNumberSum4ToTargetSum({ a: 1, b: 3 })` returns `{ a: 1, b: 3, target: 4 }`.
- For every fixture row, `sourceAnswer(x) === targetAnswer(reduceTwoNumberSum4ToTargetSum(x))`.
- Fixture rows include at least two Yes instances and two No instances.
- The proof trace for `yes-13` has exactly four step ids: `receive-source`, `compute-target`, `solve-target`, `return-answer`.
- `costState(10)` uses `sourceEncodingLength = 10`, `translatorWork = n ** 2`, `targetEncodingLength <= n ** 2`, `targetSolverTime = targetEncodingLength ** 3`, `combinedTime = translatorWork + targetSolverTime`, and `mappedInstanceSize = targetEncodingLength`. This keeps the simple model consistent: if the translator writes as much as `n ** 2` output, its work is at least `n ** 2`.
- `pathEncodingExample` has an assertion that converting the edge list to the adjacency map preserves the reachability answer, and its trace uses exactly `receive-edge-list`, `build-adjacency-map`, `solve-adjacency-map`, and `return-path-answer`.
- Target encoding length and mapped target-instance size must be polynomially bounded in the source encoding length; no visual should imply the translator may emit an exponentially large instance.
- Distinguish the translator's output instance `f(x)` from the target solver's output answer. For this decision-problem node, the solver output relied on by the reduction is only Yes/No.
- Direction model: `A <=p B` plus a polynomial-time solver for `B` proves `A` polynomial-time solvable.
- Direction model: doubted source `A` plus `A <=p B` supports the preview claim: if a fast solver for `B` existed, then the reduction would give a fast solver for `A`; therefore any reason to doubt fast solvers for `A` also applies to `B`.
- Direction model: known-hard `A` plus `B <=p A` does not prove `B` hard.
- Invalid one-way example: two source Yes rows map to target Yes, but one source No row also maps to target Yes, so the reverse implication fails.
- Invalid cases include a mismatched No row for one-way implication, an exponential translator with `mappedInstanceSizeIsPolynomial = false`, and a wrong hardness arrow where known-hard `A` is paired with notation `B <=p A`.

## Section-Level Visual Inventory

No major section should be prose-only. Short prose bridges are fine between adjacent visual states.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Card-based `PathEncodingTranslatorFigure` with source card edge-list encoding, translator card, target card adjacency-map encoding, and a target solver returning Yes/No. Caption: “I have a solver for adjacency maps; do I need a new solver for edge lists?” | How can a solver for another representation help me? |
| First naive confusion | `ReductionSolverDirectionWidget` with only the algorithm-transfer question: given `A <=p B`, choose the available solver (`B`) and the solved source (`A`). Do not introduce hardness arrows here. | Which solver do I need when I see `A <=p B`? |
| Where it becomes painful | Two-panel figure: left asks for a new `A` solver from scratch; right shows edge-list `A` translated to adjacency-map `B`, then solved by the existing `B` solver. Follow with a second motivation figure: without reductions, each problem has a separate “prove from scratch” stack; with reductions, one doubted source feeds several targets through labeled translators. Use the lecture-chain only after this as a preview. | Why does translating into a problem I can already solve help, and why does the same chain later matter for hardness evidence? |
| Core invention | Truth-table `ReductionTruthTable` using all toy fixture rows, with both source answer and target answer visible. | What exactly must the translator preserve? |
| Formal version | Definition card plus path-encoding pipeline `x -> f(x)` and `x in A iff f(x) in B`, with a separate badge `time(f) is polynomial`. Add a quantifier figure with paired rows: `x in A <=> f(x) in B` and `x notin A <=> f(x) notin B`; an unrelated faded region of `B` is labeled `not claimed`. | How does the notation map to the picture, and what does “for every source instance” cover? |
| Proof direction | `ReductionProofPipeline` stepper: receive source, compute target, call `B` solver, return the same answer for `A`. | Where does the hypothetical target solver enter the proof? |
| Implementation sketch | Code-to-state table aligned to the same four proof step ids. | What would this reduction-based solver look like as code? |
| Correctness intuition | Two-direction ledger explicitly about one source instance `x` and its mapped target `f(x)`: paired rows `x in A <=> f(x) in B` and `x notin A <=> f(x) notin B`. Treat No preservation as the same iff contract, not an afterthought. Add an image-of-`f` subset visual: the reverse direction is only for target instances that were produced as `f(x)`, not arbitrary `B` instances, and it does not require a reverse translator from `B` back to `A`. | Why is returning the target answer sound, and what does the reverse direction quantify over? |
| Complexity | Cost-stack table for `n = 5, 10, 30`: source encoding length `n`, translator work `n^2`, mapped target-instance size bounded by `n^2`, target solver time `(n^2)^3`, combined polynomial time. Include a badge that mapped instance size must be polynomially bounded. | Why does a polynomial converter plus polynomial solver stay polynomial? |
| Hardness preview | Two-row comparison table after proof direction and complexity: `Algorithm transfer: A <=p B + fast B solver => fast A solver`; `Hardness preview: if a fast solver for B existed, then the reduction would give a fast solver for A; therefore any reason to doubt fast solvers for A also applies to B.` Beginner wording only; the next node names the formal NP-hardness concept. | Why do hardness proofs reduce a doubted source toward a new target? |
| Named slide previews | `ReductionChainPreview` with preservation captions only: Circuit-SAT satisfiable iff SAT formula satisfiable; SAT formula satisfiable iff 3CNF satisfiable; 3SAT formula satisfiable iff graph has k-clique. | How will this pattern reappear in later nodes? |
| Common confusions | `ReductionMisconceptionCards` with reveal controls for wrong arrow, one-way implication, exponential translator, solving inside translator, solution object versus Yes/No answer, and toy example versus hardness. Each card should show a concrete annotated invalid visual state, not only prose. | Which shortcuts would make a reduction invalid or misleading? |
| Connections | Local graph strip: `p-vs-np -> polynomial-time-reductions -> np-hardness`, with future nodes faded until implemented. | Where does this node sit in the NP-hardness sequence? |
| Exercises | `ReductionPracticeCards` using deterministic fixture rows, one path-encoding preservation card, solver-direction classifications, and a cost question. | Can the learner apply the reduction contract without new notation? |

## Proposed Components

- `reductionTrace.ts`: shared deterministic toy instances, answer functions, reduction function, proof trace, direction cases, and cost model.
- `ReductionTranslatorFigure.tsx`: static path-encoding figure for the hook and formal definition, backed by `pathEncodingExample`.
- `PathEncodingTranslatorFigure.tsx`: card-based structural encoding figure from edge list to adjacency map.
- `ReductionSolverDirectionWidget.tsx`: early interactive choice for “Given `A <=p B`, which solver do I need?” It should only cover algorithm transfer.
- `ReductionHardnessDirectionPreview.tsx`: later contrast widget for valid and wrong hardness arrows, placed after proof direction and complexity.
- `ReductionTruthTable.tsx`: deterministic source/target answer table with preservation badges.
- `ReductionQuantifierFigure.tsx`: many source inputs through `f`, produced target instances checked, unrelated `B` region faded and labeled `not claimed`.
- `ReductionProofPipeline.tsx`: step-through proof pipeline with Back, Step, and Reset controls.
- `ReductionCostTable.tsx`: compact cost comparison table/slider for polynomial composition.
- `ReductionChainPreview.tsx`: static lecture-chain preview for later nodes, plus the nearer “prove from scratch versus reuse source” pain visual if it is not a separate component.
- `ReductionMisconceptionCards.tsx`: revealable misconception cards.
- `ReductionPracticeCards.tsx`: deterministic exercise widget.

Prefer composing static figures from the same shared trace data as the interactive widgets, so section-level visuals and the master proof stepper cannot drift.

## Accessibility And Mobile

- Every diagram needs a text summary of current source instance, target instance, and answer.
- Do not communicate Yes/No by color alone. Use labels such as `source Yes`, `target Yes`, `preserved`, and `broken`.
- Controls need descriptive labels: `Choose B solver`, `Show hardness preview`, `Step reduction proof`, `Reset proof`.
- If tabs are used, implement ARIA tabs or ordinary segmented buttons with `aria-pressed`.
- The proof pipeline should have a non-visual transcript listing all four trace steps.
- On mobile, pipeline diagrams stack vertically in story order: source, translator, target, solver, returned answer.
- On mobile, `ReductionSolverDirectionWidget` and `ReductionHardnessDirectionPreview` should switch from horizontal arrows to vertical arrows, repeat `source A` and `target B` labels at each end, and keep text badges such as `B solver available`, `solves A`, `valid preview`, or `wrong hardness arrow` visible without hover.
- On mobile, `ReductionChainPreview` should stack each reduction edge as its own row with repeated source/target problem names and a short transcript below the diagram. Do not rely on a single long left-to-right chain that shrinks labels.
- Truth tables should become stacked cards on narrow screens instead of forcing tiny columns.
- Practice-card reveal buttons must announce correct/incorrect state through visible text and an ARIA live region, preserve the selected answer in text after reveal, and avoid hover-only explanations.
- Chinese labels need room to wrap; avoid narrow fixed-width pills.
- Respect reduced motion; state changes must be understandable without animation.
- Semantic colors: blue for definitions, orange for active translation, green for preserved/valid, red-orange for invalid arrows or broken preservation, navy/gray for structure.

## Common Confusions And Edge Cases

- `A <=p B` means a solver for `B` can help solve `A`; it does not mean `A` is harder than `B`.
- Hardness preview: if a fast solver for `B` existed, then the reduction would give a fast solver for `A`; therefore any reason to doubt fast solvers for `A` also applies to `B`. Keep this as preview wording; the formal NP-hardness definition belongs to the next node.
- To argue a new target `B` inherits hardness from source `A`, reduce known-hard `A` to `B`, not `B` to `A`.
- A reduction preserves Yes/No answers, not necessarily the same-looking solution object.
- One-way implication invalid state: show a truth table where `y1 Yes -> f(y1) Yes` and `y2 Yes -> f(y2) Yes`, but `n1 No -> f(n1) Yes`; badge it `not enough for iff` because a source No row became target Yes.
- Exponential translator invalid state: show `source size n -> translator tries 2^n possibilities -> target instance`; badge it `translator is not polynomial` and set `mappedInstanceSizeIsPolynomial = false` when the emitted instance is exponential.
- Solving-inside-translator invalid state: show translator first calling `solveA(x)` before building `y`; badge it `hidden source solver`.
- Wrong hardness arrow invalid state: show known-hard `A`, arrow `B <=p A`, and crossed-out conclusion `B hard`; badge it `this only says B is no harder than A`.
- Solution-object confusion invalid state: show a target solver returning a witness object, then separate the witness from the Yes/No answer; badge it `this node only preserves decision answers`.
- A toy reduction can teach mechanics without proving any hardness result; label arithmetic and path-encoding examples as format adapters, not difficulty evidence.
- This page discusses decision-problem reductions. Optimization and approximation reductions need extra care and belong later.
- If the target solver returns a witness or solution object, this page only relies on its Yes/No answer unless a later construction explicitly maps witnesses back.

## Graph Placement

Proposed node:

```ts
{
  id: "polynomial-time-reductions",
  label: {
    en: "Polynomial-Time Reductions",
    zh: "多项式时间归约"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 310, y: 420 }
}
```

Current edge once this node is implemented:

```ts
{
  from: "p-vs-np",
  to: "polynomial-time-reductions",
  type: "prerequisite",
  reason: {
    en: "Reductions compare decision problems using polynomial time, so learners first need the P vs NP vocabulary of decision problems and polynomial-time algorithms.",
    zh: "归约用多项式时间来比较判定问题，因此学习者需要先理解 P 与 NP 中的判定问题和多项式时间算法。"
  }
}
```

Future edge once `np-hardness` exists:

```ts
{
  from: "polynomial-time-reductions",
  to: "np-hardness",
  type: "motivates",
  reason: {
    en: "NP-hardness proofs use polynomial-time reductions to transfer hardness from a known hard problem to a new problem.",
    zh: "NP-hard 证明使用多项式时间归约，把已知困难问题的困难性转移到新问题上。"
  }
}
```

Do not add graph edges to `np-hardness`, `circuit-sat`, `sat`, `cnf-and-3sat`, or `clique-decision` until those endpoint nodes exist.

## Acceptance Criteria

- Add English and Chinese MDX pages under `src/content/nodes/polynomial-time-reductions/`.
- Keep Chinese `translationStatus: needs-review` until human review.
- Add `polynomial-time-reductions` to `src/data/graph.ts` and add only edges whose endpoints exist.
- Use `prerequisites: [p-vs-np]` and `next: []` until `np-hardness` exists.
- Page starts with a concrete translator problem, not formal notation.
- Every major section has a nearby visual, widget, table, or explicit reason for prose-only treatment.
- The formal definition includes both polynomial-time computability and iff answer preservation.
- The correctness visual warns that the reverse direction is about mapped instances `f(x)` in the image of `f`, not arbitrary target-problem instances.
- The proof direction clearly states: if `A <=p B` and `B` is polynomial-time solvable, then `A` is polynomial-time solvable.
- The hardness preview clearly states: if a fast solver for `B` existed, then the reduction would give a fast solver for `A`; therefore any reason to doubt fast solvers for `A` also applies to `B`. Use beginner wording until the `np-hardness` node names the formal concept.
- Complexity visuals name source encoding length, translator work, target encoding length, target solver time, combined time, and polynomial mapped target-instance size.
- Toy examples are labeled as format adapters for mechanics only and do not imply NP-hardness.
- Named slide examples appear only as previews, not full constructions.
- Do not claim `B <=p A` proves `B` hard from a known-hard `A`.
- Do not let an invalid one-way implication pass as a reduction.
- Do not let an exponential translator count as polynomial-time reduction.
- Components are deterministic, keyboard-accessible, and have mobile layouts.
- No runtime AI calls or network dependencies.

## Trace Acceptance Tests

When implementing the node, add focused tests or fixture assertions for:

- `reduceTwoNumberSum4ToTargetSum({ a: 1, b: 3 })` returns `{ a: 1, b: 3, target: 4 }`.
- Every fixture row preserves the answer exactly.
- Fixture data has at least two Yes rows and two No rows.
- The proof trace for `yes-13` has exactly `receive-source`, `compute-target`, `solve-target`, and `return-answer`.
- `costState(10)` reports source encoding length, translator work, target encoding length, target solver time, combined time, `mappedInstanceSize`, and `mappedInstanceSizeIsPolynomial`.
- `costState(10)` keeps `translatorWork >= targetEncodingLength` in the simple model, with both set or bounded by `n ** 2`.
- Direction cases distinguish algorithm transfer, valid hardness transfer, and wrong hardness arrow.
- Invalid cases cover one-way implication, exponential translator, solving inside translator, wrong hardness arrow, and solution-object confusion.
- Invalid one-way case includes at least one mismatched No source row mapping to a Yes target row.
- Exponential translator invalid case has `mappedInstanceSizeIsPolynomial = false`.
- Wrong hardness arrow invalid case pairs known-hard source `A` with notation `B <=p A` and rejects the conclusion that `B` is hard.
- The path-encoding example preserves the same Yes/No reachability answer while changing representation from edge list to adjacency map.
- The path-encoding trace has exactly `receive-edge-list`, `build-adjacency-map`, `solve-adjacency-map`, and `return-path-answer`.
- Every visual scenario and practice card references a valid fixture row or direction case id.

## Validation Commands

Run after implementation:

```bash
npm run check
npm run test
npm run build
```

For targeted validation during development:

```bash
npm run test -- reduction-trace
npm run test -- validate-content
```
