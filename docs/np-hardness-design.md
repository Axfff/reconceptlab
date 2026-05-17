# NP-Hardness Node Design

## Node Scope

`np-hardness` is a beginner concept node about one idea:

> A problem is NP-hard when every problem in `NP` can be translated to it by a polynomial-time reduction.

The page should make the definition feel like a natural extension of `polynomial-time-reductions`: one reduction lets a solver for target `B` solve source `A`; NP-hardness asks for a target `H` that receives reductions from every efficiently checkable decision problem. The central consequence is conditional: if an NP-hard decision problem `H` also had a polynomial-time solver, then every problem in `NP` would have a polynomial-time solver, so `P = NP`.

In scope:

- Universal hardness claim: for every decision problem `L` in `NP`, `L <=p H`.
- Hardness as a comparison claim, not a claim that one instance looks large or that no one has found a fast algorithm.
- The solver implication: `L instance -> reduction f_L -> H instance -> polynomial H solver -> answer for L`.
- Why a single fast solver for an NP-hard decision problem would collapse `NP` into `P`.
- The distinction between `NP-hard`, `in NP`, and `NP-complete` as a short preview.
- Concrete but lightweight example sources: Circuit-SAT preview, SAT preview, Clique preview, and a generic `any L in NP` row.

Out of scope:

- Cook-Levin and why Circuit-SAT is NP-hard. That belongs to `circuit-sat` or a later theorem node.
- SAT, 3SAT, Clique, and construction gadgets.
- Full NP-completeness proof templates beyond a preview sentence.
- Optimization and approximation hardness. Those return in `max-3sat` and `randomized-max-3sat-approximation`.
- Proving or implying `P != NP`.
- Splitting out `decision-problems`, `polynomial-time-efficiency`, or `np-completeness` as separate first-batch nodes.

## Proposed Frontmatter

English page:

```yaml
id: np-hardness
locale: en
title: NP-Hardness
summary: Understand why a problem is NP-hard when every problem in NP can reduce to it.
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
  - polynomial-time-reductions
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Chinese page:

```yaml
id: np-hardness
locale: zh
title: NP-Hardness
summary: 理解为什么“NP 中每个问题都能归约到它”表示 NP-hard。
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
  - polynomial-time-reductions
next: []
createdAt: 2026-05-16
updatedAt: 2026-05-16
```

Use `next: []` until `circuit-sat` exists. When `circuit-sat` is implemented, update `next` to include it.

## Teaching Arc

1. Hook problem: imagine the obligations a target problem `H` would need to satisfy to be NP-hard: every efficiently checkable Yes/No puzzle must have a polynomial-time translation into it.
2. First naive idea: “hard” might sound like large inputs, many candidates, or a missing known algorithm.
3. Where the naive idea breaks: those are not stable mathematical comparisons. Reductions give a transferable claim.
4. Core invention: require every `L in NP` to reduce to `H`, not just one favorite source problem; later proof practice can replace the universal obligation with a known NP-hard source plus transitivity.
5. Visual anchors throughout: start with a hub, zoom into one selected source `L`, then show the solver implication pipeline and cost stack.
6. Formal version: define `H` as NP-hard with `forall L in NP, L <=p H`.
7. Usage sketch: if a polynomial solver for `H` exists, use it after the reduction to solve an arbitrary `L in NP`.
8. Correctness intuition: reduction answer preservation lets the target solver's answer become the source answer.
9. Complexity consequence: polynomial reduction plus polynomial `H` solver stays polynomial, so every `L in NP` would be in `P`.
10. Common confusions: NP-hard versus in `NP`, NP-hard versus NP-complete, wrong arrow, one hard-looking instance, optimization problems, and the fact that possible NP-hard targets outside `NP` need examples deferred to later nodes.
11. Connections: `p-vs-np` gives `P`/`NP`; `polynomial-time-reductions` gives `<=p`; `circuit-sat` will become the first concrete source problem.
12. Exercises: identify valid NP-hardness claims, complete the implication chain, reject wrong arrows, and classify `NP-hard`, `in NP`, and `NP-complete` statements.

## Vocabulary Scaffolding

- Decision problem / 判定问题（decision problem）: a problem with a Yes/No answer.
- `NP`: decision problems whose Yes instances have polynomial-size certificates checkable in polynomial time.
- Polynomial-time reduction / 多项式时间归约（polynomial-time reduction）: a fast answer-preserving translation between decision problems.
- `L <=p H`: problem `L` reduces to problem `H`; a solver for `H` can help solve `L`.
- Source problem / 源问题（source problem）: the problem being translated from.
- Target problem / 目标问题（target problem）: the problem being translated to.
- NP-hard / NP-hard：at least as hard as every problem in `NP` under polynomial-time reductions.
- In `NP` / 属于 NP：has efficiently checkable Yes certificates. This is separate from being NP-hard.
- NP-complete / NP-complete：both in `NP` and NP-hard. Define only as a preview, not as the page's main target.

## Core Fixture

Use a symbolic target `H` only as a definition target, not as a proved real problem. The page is about the definition and implication structure; concrete proofs start later. Phrase the fixture as:

> If `H` is NP-hard, then every required arrow below must exist.

Visually, incoming arrows to `H` should be gray and labeled “required, not constructed here” until a later concrete proof node builds actual reductions. Target instances should be symbolic, such as `f_L(x)`, `f_SAT(phi)`, or `f_Clique(G,k)`. Do not show concrete-looking target answers unless the caption says they are hypothetical preservation examples.

Target placeholder:

```text
Universal Target H
Question: given an encoded instance y, does y satisfy H?
Definition obligation: for every L in NP, there must be a polynomial-time f_L with x in L iff f_L(x) in H.
Assumption for the consequence section: suppose solveH(y) runs in polynomial time.
```

Source rows for deterministic visuals:

| Source id | Problem label | Example source instance | Source answer | Required target form | Target answer | Purpose |
|---|---|---|---|---|---|---|
| `circuit-sat-preview` | Circuit-SAT | tiny circuit `C` with assignment `101` available | Yes | `f_CircuitSAT(C)` | Yes, if the required reduction preserves answers | Foreshadows the next concrete node without proving it. |
| `sat-preview` | SAT | formula `phi = (x1 OR x2) AND (!x1 OR x3)` | Yes | `f_SAT(phi)` | Yes, if the required reduction preserves answers | Shows the hub is not only one source. |
| `clique-preview` | Clique | pair `(G, 3)` where `G` has a 3-clique | Yes | `f_Clique(G, 3)` | Yes, if the required reduction preserves answers | Connects to later graph decision problems. |
| `independent-set-preview` | Independent Set | pair `(G, 4)` where `G` has no size-4 independent set | No | `f_IS(G, 4)` | No, if the required reduction preserves answers | Ensures No preservation is visible in the universal claim. |
| `any-np-problem` | Any `L in NP` | arbitrary source instance `x` | depends on `x` | `f_L(x)` | same answer | Carries the formal quantifier. |

Every row is a teaching fixture, not a proof that `H` is a real NP-hard problem. Label the hub: “definition obligations; real reductions come later.” Captions should say these are required arrows, not constructed arrows.

Invalid rows for misconception widgets:

| Case id | Broken claim | Visual state |
|---|---|---|
| `wrong-arrow` | `H <=p L` proves `H` is NP-hard | Arrow points out of `H`; badge says this does not help solve arbitrary `L` using `H`. |
| `one-source-only` | One source `A <=p H` proves NP-hard | Only one arrow enters `H`; badge says NP-hard needs every `L in NP`. |
| `not-in-np-confusion` | NP-hard automatically means in `NP` | Venn-style cards separate `in NP`, `NP-hard`, and overlap `NP-complete`. |
| `large-instance-confusion` | A big instance makes a problem NP-hard | Single oversized instance card crossed out; hardness is about problem families and reductions. |
| `no-fast-algorithm-confusion` | No known fast algorithm proves NP-hard | “unknown algorithm” card crossed out; NP-hardness needs reductions, not absence of knowledge. |
| `optimization-confusion` | Any optimization problem is directly in `NP` | Decision-version threshold card required before using this page's definition. |

## Formula And Notation Plan

Introduce notation only after the hub and one-arrow comparison have appeared.

Inline formulas:

- `$L <=p H$`: read as “`L` reduces to `H` in polynomial time.”
- `$L in NP$`: `L` is an efficiently checkable decision problem.
- `$P = NP$`: every efficiently checkable decision problem would also be efficiently solvable.

Display formula for the definition:

```tex
H \text{ is NP-hard} \quad \Longleftrightarrow \quad
\forall L \in NP,\; L \le_p H.
```

Plain-language interpretation: pick any efficiently checkable decision problem `L`; there must be a polynomial-time translator from `L` into `H` that preserves Yes/No answers.

Pair the definition immediately with the preservation obligation:

```tex
x \in L \quad \Longleftrightarrow \quad f_L(x) \in H.
```

Plain-language interpretation: the translator may change the instance's shape, but it must not change the Yes/No answer. Put this beside a two-row ledger:

| Source instance | Required target instance | Answer relation |
|---|---|---|
| `x` is a Yes instance of `L` | `f_L(x)` | must be a Yes instance of `H` |
| `x` is a No instance of `L` | `f_L(x)` | must be a No instance of `H` |

Add a transitivity bridge before later “prove from one known hard source” wording:

```tex
\forall L \in NP,\; L \le_p A
\quad\text{and}\quad
A \le_p H
\quad\Longrightarrow\quad
\forall L \in NP,\; L \le_p H.
```

Plain-language interpretation: the definition quantifies over every `L`, but once a source `A` is already known NP-hard, a new reduction from `A` to `H` carries all those earlier arrows through to `H`. This page should show the bridge without doing a real source proof.

Display formula for the consequence:

```tex
\left(\forall L \in NP,\; L \le_p H\right)
\land \left(H \in P\right)
\Longrightarrow NP \subseteq P.
```

Then pair it with the known inclusion from `p-vs-np`:

```tex
P \subseteq NP \quad \text{and} \quad NP \subseteq P
\quad \Longrightarrow \quad P = NP.
```

Plain-language interpretation: `P` is already inside `NP`; the hypothetical fast solver for `H` would put all of `NP` inside `P`, so the two classes would match.

Keep formulas close to visuals:

- Definition formula beside `NpHardnessQuantifierFigure`.
- Preservation formula beside `HardnessAnswerPreservationLedger`.
- Transitivity bridge beside `NpHardnessTransitivityBridge`.
- Consequence formula beside `NpHardnessImplicationPipeline`.
- Cost expression beside `NpHardnessCostStack`.

## Deterministic State Model

Shared fixture file for implementation:

```text
src/components/interactive/npHardnessTrace.ts
```

Proposed types:

```ts
export type NpHardnessSourceId =
  | "circuit-sat-preview"
  | "sat-preview"
  | "clique-preview"
  | "independent-set-preview"
  | "any-np-problem";

export type HardnessAnswer = "yes" | "no" | "symbolic";

export type NpHardnessSource = {
  id: NpHardnessSourceId;
  label: Record<"en" | "zh", string>;
  instance: Record<"en" | "zh", string>;
  sourceAnswer: HardnessAnswer;
  reductionName: string;
  targetInstanceForm: string;
  targetAnswer: HardnessAnswer;
  caption: Record<"en" | "zh", string>;
};

export type NpHardnessTraceStep =
  | {
      id: "choose-source";
      sourceId: NpHardnessSourceId;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "receive-instance";
      sourceId: NpHardnessSourceId;
      sourceAnswer: HardnessAnswer;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "reduce-to-h";
      sourceId: NpHardnessSourceId;
      notation: "L <=p H";
      targetAnswer: HardnessAnswer;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "solve-h";
      sourceId: NpHardnessSourceId;
      assumesPolynomialSolverForH: true;
      targetAnswer: HardnessAnswer;
      explanation: Record<"en" | "zh", string>;
    }
  | {
      id: "return-source-answer";
      sourceId: NpHardnessSourceId;
      sourceAnswer: HardnessAnswer;
      targetAnswer: HardnessAnswer;
      explanation: Record<"en" | "zh", string>;
    };

export type HardnessCostState = {
  sourceSizeSymbol: "n";
  targetSizeSymbol: "m";
  targetSizeBound: "m <= n^b";
  reductionTime: "O(n^a)";
  targetSolverTime: "O(m^c)";
  combinedTime: "O(n^a + n^{bc})";
  conclusion: "polynomial";
};

export type ExampleHardnessCostState = {
  sourceSize: number;
  reductionTime: string;
  targetSizeBound: string;
  targetSolverTime: string;
  combinedTime: string;
  conclusion: "polynomial";
};

export type NpHardnessMembershipCase =
  | {
      id: "np-hard-only";
      inNp: false;
      npHard: true;
      npComplete: false;
    }
  | {
      id: "in-np-only";
      inNp: true;
      npHard: false;
      npComplete: false;
    }
  | {
      id: "np-complete";
      inNp: true;
      npHard: true;
      npComplete: true;
    };
```

Golden expectations for later tests:

- Every non-symbolic source row has `sourceAnswer === targetAnswer`.
- `independent-set-preview` is a No row, so No preservation is covered.
- The default implication trace for `circuit-sat-preview` has exactly `choose-source`, `receive-instance`, `reduce-to-h`, `solve-h`, and `return-source-answer`.
- `any-np-problem` uses `symbolic` answers and never appears in a truth-table exercise that requires a concrete Yes/No.
- The wrong-arrow invalid case starts with `H <=p L` and rejects the conclusion “`H` is NP-hard.”
- The one-source-only invalid case has exactly one incoming source arrow and rejects the universal claim.
- Membership cases distinguish `NP-hard`, `in NP`, and `NP-complete`.
- The cost stack's primary display is symbolic: source size `n`, target size `m <= n^b`, reduction time `O(n^a)`, target solver `O(m^c)`, combined `O(n^a + n^{bc})`.
- Optional numeric examples may instantiate the symbols, but should stay secondary and short.

## Section-Level Visual Inventory

No major section should be prose-only. Short prose bridges are fine between adjacent visual states.

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | `NpHardnessHubFigure` with several efficiently checkable source problems pointing through gray required arrows into target `H`; include a visible label “definition obligations; real reductions later.” | What would it mean for one problem to receive every NP problem by translation? |
| First naive idea | `NpHardnessMeaningCards` showing three tempting but wrong meanings of “hard”: large input, many candidates, no known fast algorithm. | Why is NP-hardness not just a vibe about difficulty? |
| Where it breaks | `OneReductionVsUniversalFigure`: left shows one valid `A <=p B`; right shows many `L <=p H` arrows with a missing-arrow warning. | Why does NP-hardness need every source in `NP`, not one impressive source? |
| Core invention | `NpHardnessQuantifierFigure` with static source snapshots for early figures; each selected/snapshotted `L` highlights its own required translator `f_L` into `H`. | How does the universal quantifier become many reduction obligations? |
| Formal definition | Definition card with the display formula, a legend for `L`, `NP`, `<=p`, and `H`, plus the preservation formula `x in L iff f_L(x) in H` and a paired source/target Yes-No ledger. | What exactly does `forall L in NP, L <=p H` say? |
| Transitivity bridge | `NpHardnessTransitivityBridge`: `forall L in NP, L <=p A` plus `A <=p H` implies `forall L in NP, L <=p H`; draw the composed arrows lightly. | Why do later proofs often reduce from one known NP-hard problem instead of drawing every arrow again? |
| Solver implication | `NpHardnessImplicationDemo` stepper using the selected source: choose source, receive `x`, reduce to `H`, call hypothetical `solveH`, return answer. | Why would a fast `H` solver solve an arbitrary `NP` problem? |
| Implementation sketch | Code block aligned to the same five trace ids; adjacent state table shows `x`, `f_L(x)`, `solveH(f_L(x))`, and returned answer. | What does the abstract implication look like as an algorithm wrapper? |
| Correctness intuition | `HardnessAnswerPreservationLedger`: Yes row and No row for mapped instances, with a note that correctness comes from the reduction for the chosen `L`. | Why is returning the `H` answer safe? |
| Complexity consequence | `NpHardnessCostStack` with symbolic rows: source size `n`, target size `m <= n^b`, reduction `O(n^a)`, target solver `O(m^c)`, combined `O(n^a + n^{bc})`. Then a class-inclusion strip shows `NP subseteq P`; combine with existing `P subseteq NP` to reveal `P = NP`. | Why does the hypothetical solver imply the whole class collapses into `P`? |
| NP-hard versus NP-complete | `MembershipVennCards`: three cards for `in NP only`, `NP-hard only`, and `NP-complete`; label `NP-hard but not in NP` as a possible relationship with concrete examples deferred. Mention optimization problems need decision versions or different reduction notions, and undecidable examples are beyond this beginner node. | Does NP-hard mean the problem itself has checkable certificates? |
| Common confusions | `NpHardnessMisconceptionCards` with reveal controls for wrong arrow, one source only, large instance, no known algorithm, in-NP confusion, and optimization confusion. Each card uses a concrete invalid visual state. | Which statements sound plausible but do not prove NP-hardness? |
| Connections | `NpHardnessGraphStrip`: `p-vs-np -> polynomial-time-reductions -> np-hardness`, with `circuit-sat` faded as future. | Where does this node sit in the sequence? |
| Exercises | `NpHardnessPracticeCards`: classify definition claims, complete an implication pipeline, identify wrong arrows, and distinguish `NP-hard` / `in NP` / `NP-complete`. | Can learners use the definition without overclaiming? |

## Proposed Components

- `npHardnessTrace.ts`: shared source rows, invalid cases, membership cases, implication trace, and cost model.
- `NpHardnessHubFigure.tsx`: static hub for the hook.
- `NpHardnessMeaningCards.tsx`: static or revealable misconception setup for naive meanings of “hard.”
- `OneReductionVsUniversalFigure.tsx`: side-by-side comparison of one reduction and the universal requirement.
- `NpHardnessQuantifierFigure.tsx`: source selector or static variants showing `forall L in NP`.
- `NpHardnessTransitivityBridge.tsx`: static bridge from the universal definition to later one-source proofs from known NP-hard problems.
- `NpHardnessImplicationDemo.tsx`: main stepper with source selector, Back, Step, Reset, and transcript.
- `HardnessAnswerPreservationLedger.tsx`: compact Yes/No preservation table for the chosen source.
- `NpHardnessCostStack.tsx`: deterministic cost table/slider.
- `MembershipVennCards.tsx`: classification cards for `in NP`, `NP-hard`, and `NP-complete`.
- `NpHardnessMisconceptionCards.tsx`: revealable invalid-case cards.
- `NpHardnessGraphStrip.tsx`: local graph placement visual.
- `NpHardnessPracticeCards.tsx`: deterministic exercises.

Prefer using the same `npHardnessTrace.ts` rows across static figures, the master demo, and practice cards so the page does not drift. To reduce selector drift, either:

- Use static source snapshots in early figures and reserve the source selector for the main implication demo.
- Or build one combined component that controls the selected source and renders the quantifier, preservation ledger, and implication trace from the same state.

Do not implement several independent selectors that can show mismatched source rows on the same page.

## Accessibility And Mobile

- Every diagram needs a text summary naming the selected source problem, target `H`, reduction direction, and current Yes/No answer.
- Do not rely on color alone. Use labels such as `source Yes`, `target Yes`, `preserved`, `missing arrow`, and `wrong direction`.
- The implication demo needs keyboard-accessible controls with descriptive labels: `Choose Circuit-SAT preview source`, `Step implication`, `Back one step`, `Reset implication`.
- Use `aria-live="polite"` for the current trace explanation and practice feedback.
- Include a non-visual transcript for the five implication steps.
- On mobile, hub and pipeline diagrams stack vertically: source, reduction, target `H`, solver, returned answer. Repeat `L`, `H`, and `L <=p H` labels after stacking.
- Membership cards should avoid overlapping Venn labels on small screens; switch to a three-row classification table if needed.
- Chinese labels need room to wrap; avoid fixed-width pills for `polynomial-time reductions` and `efficiently checkable`.
- Respect reduced motion. Any animation must be optional and the state transition must be legible when motion is disabled.
- Semantic colors: blue for definitions, orange for active reductions, green for valid preservation/implication, red-orange for invalid claims, navy/gray for structure and text.

## Common Confusions And Edge Cases

- `NP-hard` does not mean “not polynomial.” It means every problem in `NP` reduces to this target.
- `NP-hard` does not by itself mean the target is in `NP`. If it is both in `NP` and NP-hard, then it is NP-complete.
- `NP-hard but not in NP` is a possible relationship, but this beginner node should defer concrete examples. Optimization problems are outside the decision-class definition unless converted to decision versions; undecidable examples are beyond this node.
- One known reduction `A <=p H` is not enough to prove `H` NP-hard unless `A` is already known NP-hard. In this beginner node, the clean definition is the universal one.
- Later standard proofs often use transitivity: if every `L in NP` reduces to a known NP-hard source `A`, and `A <=p H`, then every `L in NP` reduces to `H`.
- The arrow for proving a target hard points from the source family toward the target: `L <=p H`.
- A single difficult-looking instance is not NP-hard. NP-hardness is a property of a problem family under reductions.
- “No known fast algorithm” is not a proof of NP-hardness.
- The page's definition is for decision problems. Optimization problems need decision versions or separate reduction notions.
- A fast solver for an NP-hard decision problem would imply `P = NP`; this is conditional and does not assert such a solver exists.
- The page should never imply `P != NP` is known.

## Graph Placement

Proposed graph node once implemented:

```ts
{
  id: "np-hardness",
  label: {
    en: "NP-Hardness",
    zh: "NP-Hardness"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 540, y: 420 }
}
```

Recommended existing-edge addition once the node exists:

```ts
{
  from: "polynomial-time-reductions",
  to: "np-hardness",
  type: "prerequisite",
  reason: {
    en: "NP-hardness is defined by polynomial-time reductions from every problem in NP to the target problem.",
    zh: "NP-hardness 由多项式时间归约来定义：NP 中每个问题都要能归约到目标问题。"
  }
}
```

Optional direct motivating edge from `p-vs-np` only if the graph needs a visible branch from the class question:

```ts
{
  from: "p-vs-np",
  to: "np-hardness",
  type: "motivates",
  reason: {
    en: "P vs NP separates efficient solving from efficient checking; NP-hardness asks which problems are hard enough to represent all efficiently checkable decision problems.",
    zh: "P 与 NP 区分了高效求解和高效检查；NP-hardness 追问哪些问题困难到足以代表所有可高效检查的判定问题。"
  }
}
```

Prefer the prerequisite edge from `polynomial-time-reductions` for the first implementation, because it keeps the visible sequence linear:

```text
p-vs-np -> polynomial-time-reductions -> np-hardness
```

Future edge once `circuit-sat` exists:

```ts
{
  from: "np-hardness",
  to: "circuit-sat",
  type: "motivates",
  reason: {
    en: "After defining NP-hardness, Circuit-SAT becomes the first concrete source problem for building real hardness proofs.",
    zh: "定义 NP-hardness 之后，Circuit-SAT 将成为构造真实困难性证明的第一个具体源问题。"
  }
}
```

Do not add graph edges to `circuit-sat`, `sat`, `cnf-and-3sat`, `clique-decision`, or approximation nodes until those endpoint nodes exist.

## Acceptance Criteria

- Add English and Chinese MDX pages under `src/content/nodes/np-hardness/`.
- Keep Chinese `translationStatus: needs-review` until human review.
- Add `np-hardness` to `src/data/graph.ts` and add only edges whose endpoints exist.
- Use `prerequisites: [p-vs-np, polynomial-time-reductions]` and `next: []` until `circuit-sat` exists.
- Page starts with the universal-translator/hub problem, not the formal definition.
- Every major section has a nearby figure, widget, table, or explicit reason for prose-only treatment.
- The formal definition includes the universal quantifier over every `L in NP`.
- The formal definition includes the preservation formula `x in L iff f_L(x) in H`, paired with a Yes/No ledger and plain-language interpretation.
- A transitivity bridge explains why later proofs can reduce from one known NP-hard source `A` to a new target `H`.
- The solver implication is conditional: if `H` is NP-hard and `H in P`, then every `L in NP` is in `P`; paired with `P subseteq NP`, this gives `P = NP`.
- The page distinguishes `NP-hard`, `in NP`, and `NP-complete`.
- No toy fixture is presented as an actual NP-hardness proof; arrows into `H` are labeled as required but not constructed here, and target instances use symbolic forms such as `f_L(x)`.
- No claim or visual implies `P != NP` is known.
- Wrong-arrow and one-source-only misconceptions are explicitly rejected.
- Optimization examples are converted to decision versions or deferred.
- `NP-hard but not in NP` is handled as a possible relationship with examples deferred, not as an unexplained concrete claim.
- Cost composition is shown symbolically with `n`, `m <= n^b`, `O(n^a)`, `O(m^c)`, and `O(n^a + n^{bc})`.
- Multiple independent source selectors are avoided; early figures use static snapshots or a single linked source-selection component.
- Components are deterministic, keyboard-accessible, reduced-motion-friendly, and mobile-safe.
- No runtime AI calls or network dependencies.

## Trace Acceptance Tests

When implementing the node, add focused tests or fixture assertions for:

- Every non-symbolic source row preserves `sourceAnswer === targetAnswer`.
- At least one Yes row and one No row are present.
- The default implication trace contains exactly `choose-source`, `receive-instance`, `reduce-to-h`, `solve-h`, and `return-source-answer`.
- The implication trace never calls `solveH` before `reduce-to-h`.
- The `any-np-problem` row uses symbolic answers and is excluded from concrete Yes/No practice checks.
- `costState()` reports symbolic source size `n`, target size `m <= n^b`, reduction time `O(n^a)`, target solver time `O(m^c)`, combined time `O(n^a + n^{bc})`, and conclusion `polynomial`.
- Invalid cases include `wrong-arrow`, `one-source-only`, `not-in-np-confusion`, `large-instance-confusion`, `no-fast-algorithm-confusion`, and `optimization-confusion`.
- Membership cases distinguish `in NP only`, `NP-hard only`, and `NP-complete`.
- Every visual scenario and practice card references a valid fixture row, invalid case, or membership case id.

## Validation Commands

Run after implementation:

```bash
npm run check
npm run test
npm run build
```

For targeted validation during development:

```bash
npm run test -- np-hardness
npm run test -- validate-content
```
