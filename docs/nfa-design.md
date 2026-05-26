# Nondeterministic Finite Automata Node Design

## Node Scope

- Stable id: `nfa`
- Concept type: `concept`
- Difficulty: `beginner`
- Goal: teach nondeterministic finite automata as finite-state machines whose computation may branch, where an input is accepted if any complete branch ends in an accepting state.

In scope:

- NFA semantics: multiple next states, zero next states, branch death, active state sets, and accept-if-any-branch-accepts.
- Contrast with DFA's single current state.
- Central Week 1 example: an NFA for strings over `{0,1}` that contain `01`.
- Trace input `010`.
- Main node uses NFAs without epsilon transitions.
- Light, bounded mention of epsilon-NFAs as a later extension.
- Implementation by tracking active states directly.

Out of scope:

- Subset construction as the main concept.
- DFA/NFA language-equivalence proof.
- Regex-to-NFA construction.
- Full epsilon-closure algorithms beyond a small note.
- Pumping lemma, minimization, product construction, regex syntax, and compiler lexer details.

## Proposed Frontmatter

English:

```yaml
id: nfa
locale: en
title: Nondeterministic Finite Automata
summary: Recognize patterns by letting a finite-state machine branch, keeping any path that could still succeed.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - theory-of-computing
  - automata
  - regular-languages
prerequisites:
  - dfa
next: []
createdAt: 2026-05-25
updatedAt: 2026-05-25
```

Chinese:

```yaml
id: nfa
locale: zh
title: 非确定性有限自动机（NFA）
summary: 让有限状态机在可能的位置分支，只要有一条完整路径成功就接受输入。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - theory-of-computing
  - automata
  - regular-languages
prerequisites:
  - dfa
next: []
createdAt: 2026-05-25
updatedAt: 2026-05-25
```

## Teaching Arc

1. Concrete problem: detect whether a binary string contains substring `01`.
2. Deterministic baseline: a DFA can solve this with one current state by remembering whether a promising `0` was just seen.
3. Alternate viewpoint: at every `0`, an NFA can keep scanning normally and also start a possible `01` match as a separate branch.
4. Smallest invention: allow branching. One branch says "this `0` might start `01`," while another says "keep looking."
5. Visual anchors: DFA-vs-NFA comparison, candidate-start markers, branching path diagram, transition-event ledger, active-state-set table, dead branch marks, and a master simulator.
6. Formal version: NFA 5-tuple with transition function returning a set of states.
7. Implementation: store a set of active states and update it symbol by symbol.
8. Invariant/correctness: after each prefix, the active set contains exactly the states reachable by some branch.
9. Complexity: direct simulation depends on active states; future subset construction can compile active sets into DFA states.
10. Connections: `dfa` is the prerequisite edge because the learner should know one-current-state semantics before comparing NFA branching semantics; future edges to subset construction and regex construction only when those nodes exist.
11. Exercises: predict active sets, decide accepted/rejected, and explain branch death.

## Central Example Fixture

NFA for strings over `{0,1}` that contain `01`:

```text
q0: scanning for a possible start
q1: just chose a 0 as the possible start of 01
q2: have seen 01; accept, and stay accepting
```

Transitions:

```text
delta(q0, 0) = {q0, q1}
delta(q0, 1) = {q0}
delta(q1, 1) = {q2}
delta(q2, 0) = {q2}
delta(q2, 1) = {q2}
all other transitions = empty set
```

Trace for `010`:

| Step | Input | Active states | `acceptedIfInputEndedHere` | Explanation |
| --- | --- | --- | --- | --- |
| Start | - | `{q0}` | `false` | Begin scanning. |
| 1 | `0` | `{q0, q1}` | `false` | Stay in `q0`, and also branch to `q1` because this `0` might start `01`. |
| 2 | `1` | `{q0, q2}` | `true` | `q0` keeps scanning; `q1` completes `01` and reaches `q2`. |
| 3 | `0` | `{q0, q1, q2}` | `true` | `q2` remains accepting; `q0` also branches on the new `0`. |

Whole input result: `accepted = true`, because after all symbols are consumed the final active set intersects `{q2}`.

Branch-death ledger for `00`:

| Step | Event | Result |
| --- | --- | --- |
| Start | Active set is `{q0}`. | No branch is accepting. |
| Read first `0` | `q0 -> {q0,q1}`. | Active set becomes `{q0,q1}`. |
| Read second `0` | Old `q1 -> empty set`, so that candidate branch dies. In the same transition event, old `q0 -> {q0,q1}`, so a new `q1` branch is spawned for the second `0`. | Active set remains `{q0,q1}`, but the ledger shows one died branch and one newly spawned candidate. |

The UI must show this as transition events, not only as before/after sets, so learners can see that branch death and branch spawning can happen during the same input symbol.

Golden cases:

- Accepted: `01`, `010`, `1010`, `001`, `11010`
- Rejected: empty string, `0`, `1`, `00`, `111`, `10`, `1000`

## Section Visual Inventory

| Scenario id | Section | Fixture metadata | Learner question |
| --- | --- | --- | --- |
| `hook-substring-cards` | Hook problem | Inputs: `010`, `1110`, `1001`; highlight first `01` when present. State chip: "pattern found?" View/purpose: static pattern view. Mobile: stack string cards. | What pattern are we trying to recognize? |
| `dfa-vs-nfa-comparison` | Deterministic baseline | Input: `010`; highlight step 1 on `0`. DFA side: one chip, "remember last symbol was 0"; NFA side: chips `{q0,q1}`, "keep scanning + try this start." View/purpose: side-by-side DFA current-state view and NFA active-set view, treating NFA as alternate semantics rather than a repair for this language. Mobile: stack DFA panel above NFA panel. | How can a DFA solve it, and what different story does the NFA tell? |
| `branching-fork` | Branching invention | Input: `010`; highlight transition `q0 --0--> {q0,q1}`. State chips: `q0 keep looking`, `q1 candidate start`. View/purpose: path view. Mobile: show fork above active-set chips. | What does nondeterminism buy us? |
| `state-meaning-cards` | Core invention | Input: example-independent; highlight states `q0`, `q1`, `q2`. State chips: `q0 scanning`, `q1 saw candidate 0`, `q2 saw 01`. View/purpose: state-meaning view. Mobile: stack cards in state order. | What does each branch mean? |
| `branch-death-ledger` | Branch death | Input: `00`; highlight second `0`. Event ledger rows: old `q1 -> empty set` dies; old `q0 -> {q0,q1}` immediately spawns a new `q1`; after-set `{q0,q1}`. State chip text: "old q1 died / new q1 spawned." View/purpose: transition-event ledger. Mobile: ledger first, compact before/after chips below. | What does a missing transition mean when another branch keeps going? |
| `active-set-trace` | Active state set | Input: `010`; highlighted steps 0-3. State chips: `{q0}`, `{q0,q1}`, `{q0,q2}`, `{q0,q1,q2}`. View/purpose: active-set view. Mobile: horizontally scroll trace table only if needed. | How can many branches be summarized compactly? |
| `simulator-main` | Interactive visual demo | Inputs: `010`, `00`, `1010`, empty string. Highlight current symbol and selected transition events. State chips include active, newly activated, accepting, and died labels. View/purpose: switchable path view and active-set view. Mobile: stack input tape, controls, active-set panel, diagram, then trace table. | How does the whole NFA run? |
| `five-tuple-callout` | Formal version | Input: central NFA fixture; highlight `Q`, `Sigma`, `delta`, `q0`, `F`. State chip: concrete value for each symbol. View/purpose: notation mapping view. Mobile: place formula above value list. | How does the picture become notation? |
| `epsilon-note` | Epsilon note | Input: none; highlight boundary "not used in this node." State chip: `epsilon` means consume no input. View/purpose: bounded extension note. Mobile: single note card. | What are epsilon transitions, and why are they deferred? |
| `implementation-map` | Implementation sketch | Input: `010`; highlight transition from `{q0,q1}` on `1` to `{q0,q2}`. State chip: `activeStates -> nextActiveStates`. View/purpose: code-to-active-set trace map. Mobile: stack code snippet above trace row. | How would we simulate this deterministically in code? |
| `prefix-invariant` | Correctness intuition | Input: `010`; highlight prefix `01`. State chips: `S_2 = {q0,q2}`, "would accept if input ended here." View/purpose: prefix ledger. Mobile: one prefix row per card. | Why does the active set preserve all possible branches? |
| `branching-cost` | Complexity | Input: length `n`; highlight at most `|Q|` active chips per step. State chip: "scan active states." View/purpose: cost summary. Mobile: compact badge list. | What does branching cost? |
| `common-confusions` | Common confusions | Inputs: `00`, `010`; highlight "dead branch is not failed input" and "prefix acceptance is not final acceptance until input ends." State chips: misconception/correction pairs. View/purpose: contrast cards. Mobile: stack cards. | What mistakes should beginners avoid? |
| `prediction-prompts` | Exercises | Inputs: `01`, `00`, `1010`, empty string; highlight learner-selected step before reveal. State chips: prediction then answer. View/purpose: practice prompts. Mobile: one prompt per row. | Can learners apply the semantics? |

Every major section should have a nearby figure, table, or widget. The simulator is important, but it must not be the only place where branching is visible.

## Formula And Notation Plan

Use display math for the NFA tuple:

```mdx
$$
N = (Q, \Sigma, \delta, q_0, F)
$$
```

Explain in words:

- `Q` is the finite set of states.
- `\Sigma` is the input alphabet.
- `P(Q)` means the power set of `Q`: the set of all possible subsets of states.
- For the main node, NFAs do not use epsilon transitions, so `\delta: Q \times \Sigma \to P(Q)` returns a set of possible next states for one consumed input symbol.
- `q_0` is the start state.
- `F` is the set of accepting states.

Use inline notation for concrete transitions:

- `$\\delta(q_0, 0) = \\{q_0, q_1\\}$`
- `$\\delta(q_1, 0) = \\emptyset$`

Before the active-set formula, define:

- `S_i` is the active state set after consuming the first `i` input symbols.
- `a_{i+1}` is the next input symbol to consume.
- `n` is the total input length.

Use one display formula for active-set simulation:

```mdx
$$
S_{i+1} = \bigcup_{q \in S_i} \delta(q, a_{i+1})
$$
```

Plain-language interpretation: to get the next active set, ask every currently active state where it can go on the next symbol, then union all answers.

Concrete substitution from input `010`: after reading prefix `0`, `S_1 = {q0,q1}`. The next symbol is `1`, so:

```mdx
$$
S_2 = \delta(q_0, 1) \cup \delta(q_1, 1) = \{q_0\} \cup \{q_2\} = \{q_0, q_2\}
$$
```

Use one display formula for acceptance:

```mdx
$$
\text{accept if } S_n \cap F \ne \emptyset
$$
```

Plain-language interpretation: after the whole input is consumed, accept if at least one active branch is in an accepting state. Trace rows may also compute `acceptedIfInputEndedHere = S_i \cap F \ne \emptyset`, but the whole input field is `accepted = S_n \cap F \ne \emptyset`.

For epsilon transitions:

- `$\\varepsilon$` means "consume no input."
- Keep the main definition epsilon-free.
- Mention that epsilon-NFAs extend the transition domain to `\Sigma \cup \{\varepsilon\}` and require epsilon-closure before or after consuming symbols.
- Defer closure algorithms and epsilon-NFA construction details to a later node.

## Components And Tests

Expected files:

- `src/content/nodes/nfa/en.mdx`
- `src/content/nodes/nfa/zh.mdx`
- `src/components/interactive/nfaTrace.ts`
- `src/components/interactive/NfaScenarioFigure.tsx`
- `src/components/interactive/NfaSimulator.tsx`
- `tests/nfa-trace.test.ts`

Trace model:

```ts
export type NfaState = "q0" | "q1" | "q2";
export type NfaSymbol = "0" | "1";
```

- Transition table maps `state -> symbol -> NfaState[]`.
- Trace step includes consumed prefix, remaining suffix, previous active set, next active set, transition-event ledger, spawned branches, died branches, and `acceptedIfInputEndedHere`.
- Whole trace result includes a separate `accepted` boolean for the complete input.
- Exact trace for `010` must match `{q0} -> {q0,q1} -> {q0,q2} -> {q0,q1,q2}`.
- Missing transition from `q1` on `0` kills that branch and creates a died-branch ledger event.
- For input `00`, the second symbol must record both old `q1 -> []` and old `q0 -> [q0,q1]`; the active set remains `{q0,q1}` because the new `q1` is spawned immediately.
- Acceptance is checked after the full input with active-set intersection against `F`.

Test expectations:

- Golden accepted and rejected cases.
- Exact active-set trace for `010`.
- `q1` on `0` returns an empty set and creates a died-branch record.
- `q0` on `0` branches to both `q0` and `q1`.
- `q2` loops on both `0` and `1`.
- Trace rows expose `acceptedIfInputEndedHere`; whole-input acceptance exposes `accepted`.
- UI labels must distinguish "would accept if input ended here" from "whole input accepted."
- Whole-input `accepted` uses `activeStates.some((state) => acceptingStates.includes(state))` only for the final active set.
- Every transition-table row covers both symbols.

## Accessibility And Mobile

- State changes must be described in text, not only color.
- Use distinct labels for active, newly activated, accepting, and dead-branch states.
- Simulator controls need keyboard-operable `Previous`, `Next`, `Reset`, and sample selection.
- SVG or diagram figures should have localized `aria-label`.
- Respect reduced motion; stepping must work without animation.
- On mobile, stack input tape, active-set panel, diagram, and trace table vertically.
- Keep trace tables horizontally scrollable if needed.
- Chinese page should introduce terms bilingually: `非确定性有限自动机（nondeterministic finite automaton, NFA）`, `分支（branch）`, `活跃状态集合（active state set）`, `空转移（epsilon transition）`.

## Graph Placement

Add graph node:

```ts
{
  id: "nfa",
  label: {
    en: "Nondeterministic Finite Automata",
    zh: "非确定性有限自动机"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 310, y: 1630 }
}
```

Add only this edge to existing content:

```ts
{
  from: "dfa",
  to: "nfa",
  type: "prerequisite",
  reason: {
    en: "NFA is easiest to learn after DFA: a DFA keeps one current state, while an NFA generalizes the transition idea to a set of possible current states.",
    zh: "先理解 DFA 后更容易学习 NFA：DFA 只有一个当前状态，而 NFA 把转移推广为一组可能的当前状态。"
  }
}
```

Document but do not add yet:

- `nfa -> subset-construction`, `motivates`: tracking active NFA states becomes the subset construction idea.
- `regular-expressions -> regex-to-nfa`, `uses`: regex fragments can be assembled into NFAs.
- `nfa -> epsilon-transitions`, `uses`: epsilon moves support compact constructions.

## Acceptance Criteria

- English and Chinese pages follow the concrete-problem-to-formal arc.
- Chinese frontmatter uses `translationStatus: needs-review`.
- The `contains 01` NFA and `010` trace are the central recurring example.
- Every major section has a nearby figure, table, note card, or simulator state.
- Subset construction is mentioned only as a future node.
- Epsilon transitions are bounded to a small explanatory note.
- Trace tests cover golden accept/reject cases and exact active-set updates.
- Graph adds `nfa` and only the valid `dfa -> nfa` edge.
- `npm run check`, `npm run test`, and `npm run build` pass after implementation when practical.
