# Deterministic Finite Automata Node Design

## Node Scope

- Stable id: `dfa`
- Concept type: `concept`
- Difficulty: `beginner`
- Goal: introduce deterministic finite automata as the first precise finite-memory machine model for string validation.

In scope:

- DFA as a machine that reads one symbol at a time, keeps one current state, and accepts or rejects after the input ends.
- Finite states, input alphabet, transition function, start state, accept states, and a dead/trap state.
- Deterministic trace-by-input computation.
- A toy email-like validator: one or more local characters, one `@`, one or more domain characters, one `.`, and one or more suffix characters.
- The distinction between a learning model and real RFC email validation.

Out of scope:

- Full regular expressions, NFAs, subset construction, DFA minimization, product construction, pumping lemma, lexer generators, real email standards, Unicode normalization, and parser theory.

## Proposed Frontmatter

English:

```yaml
id: dfa
locale: en
title: Deterministic Finite Automata
summary: Recognize simple string patterns with a finite set of states and one deterministic transition per input symbol.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - theory-of-computing
  - automata
  - regular-languages
prerequisites: []
next: []
createdAt: 2026-05-25
updatedAt: 2026-05-25
```

Chinese:

```yaml
id: dfa
locale: zh
title: 确定性有限自动机（DFA）
summary: 用有限个状态和每个输入符号唯一确定的转移，识别简单的字符串模式。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - theory-of-computing
  - automata
  - regular-languages
prerequisites: []
next: []
createdAt: 2026-05-25
updatedAt: 2026-05-25
```

## Teaching Arc

1. Hook problem: validate toy signup strings such as `ana@cs.ai`.
2. Naive attempt: scan characters with flags such as `seenAt`, `seenDot`, `hasLocal`, `hasDomain`, and `hasSuffix`.
3. Pain: flag logic becomes brittle; `ana@.ai`, `ana@@cs.ai`, and `ana@cs.` expose missing cases.
4. Smallest invention: replace scattered flags with named states that mean "what must still happen next."
5. Visual anchors: character strips, state cards, transition table, failure trace, and simulator all share one fixture.
6. Formal version: introduce the DFA 5-tuple after the learner has traced examples.
7. Implementation: classify each character, look up the next state, accept if the final state is accepting.
8. Invariant/correctness: after each prefix, the current state summarizes all relevant facts about that prefix.
9. Complexity: one transition per character, finite transition table.
10. Connections and exercises: predict traces, identify accepting states, and repair a missing transition.

## Shared Fixture And Trace Model

Use alphabet categories instead of full email syntax:

```ts
export type DfaSymbol = "char" | "at" | "dot" | "other";

export type DfaState =
  | "need-local"
  | "in-local"
  | "need-domain"
  | "in-domain"
  | "need-suffix"
  | "in-suffix"
  | "dead";
```

The alphabet is intentionally toy-sized. It is not a real email alphabet.

Toy classifier:

```ts
export function classify(input: string): DfaSymbol {
  if (/^[A-Za-z0-9]$/.test(input)) return "char";
  if (input === "@") return "at";
  if (input === ".") return "dot";
  return "other";
}
```

Classifier rules:

- Letters and digits count as `char`.
- `_`, spaces, emoji, and other punctuation count as `other`.
- `@` counts as `at`.
- `.` counts as `dot`.
- Dots are banned in the local part for this toy node, even though real email addresses may have more nuanced local-part rules.

Accepting state: `in-suffix`.

Full transition table:

| State | `char` | `at` | `dot` | `other` |
| --- | --- | --- | --- | --- |
| `need-local` | `in-local` | `dead` | `dead` | `dead` |
| `in-local` | `in-local` | `need-domain` | `dead` | `dead` |
| `need-domain` | `in-domain` | `dead` | `dead` | `dead` |
| `in-domain` | `in-domain` | `dead` | `need-suffix` | `dead` |
| `need-suffix` | `in-suffix` | `dead` | `dead` | `dead` |
| `in-suffix` | `in-suffix` | `dead` | `dead` | `dead` |
| `dead` | `dead` | `dead` | `dead` | `dead` |

Golden accepted cases:

- `a@b.c`
- `ana9@cs.ai`

Golden rejected cases:

- empty string
- `ana`
- `@cs.ai`
- `ana@cs`
- `ana@.ai`
- `ana@@cs.ai`
- `ana@cs.`
- `ana@cs.ai.`

Key trace for `ana@cs.ai`:

```text
need-local -> in-local -> in-local -> in-local -> need-domain -> in-domain -> in-domain -> need-suffix -> in-suffix -> in-suffix
```

Failure trace for `ana@.ai`:

```text
need-local -> in-local -> in-local -> in-local -> need-domain -> dead
```

The rejected trace should explain that a domain character must appear before the dot.

Accepting-before-end trace for `ana@cs.ai.`:

```text
need-local -> in-local -> in-local -> in-local -> need-domain -> in-domain -> in-domain -> need-suffix -> in-suffix -> in-suffix -> dead
```

The scenario should call out: after `ana@cs.ai`, the machine is in `in-suffix`, an accepting state now, but the string is not accepted yet because input remains. The final `.` is read next and sends the trace to `dead`.

## Section Visual Inventory

| Scenario id | Section | Visual support | Learner question |
| --- | --- | --- | --- |
| `hook-categories` | Hook problem | Static string cards for accepted `ana@cs.ai` and rejected `ana@.ai`, with character categories underneath. | What kind of problem needs a DFA? |
| `flag-combinations` | First naive idea | Boolean-combination grid for `seenAt`, `seenDot`, `hasLocal`, `hasDomain`, and `hasSuffix`; map reachable useful combinations to named DFA states. | Why do flags seem enough, and where do combinations get hard to reason about? |
| `missing-domain-before-dot` | Where it breaks | Split trace showing `ana@.ai`, with `need-domain` reading `dot` and moving to `dead`. | Why does ad hoc parsing become fragile? |
| `state-meaning-cards` | Core invention | State cards labeled by meaning: "need local char", "inside domain", "dead", and so on. | What does a state remember? |
| `transition-table` | Visual model | Static DFA diagram plus the full 7-state by 4-symbol transition table. | How do states and transitions replace flags? |
| `simulator-main` | Interactive visual demo | `DfaSimulator client:load` with sample picker, optional text input, step, reset, state diagram, input tape, trace table, and current explanation. | How does the machine run on a whole string? |
| `five-tuple-callout` | Formal version | Tuple callouts beside the concrete state set, toy alphabet, transition table, start state, and accept state. | How does the diagram become a mathematical object? |
| `accept-only-at-end` | Common confusions | Trace for `ana@cs.ai.`: `ana@cs.ai` reaches `in-suffix`, then final `dot` moves to `dead`; label "accepting state now, but not accepted yet." | Why is acceptance checked only after the whole input is consumed? |
| `dead-state-loop` | Common confusions | Dead-state loop card showing every symbol remains in `dead`. | Why can the machine stop caring after a fatal mistake? |
| `prefix-ledger` | Correctness intuition | Prefix ledger: prefix read, state, meaning, remaining requirement. | Why is one state enough memory? |
| `transition-cost` | Complexity | One-character-per-step checklist and finite transition-table size badge. | Why is the running time linear? |
| `implementation-map` | Implementation sketch | Code-to-trace table mapping `classify`, `transition[state][symbol]`, and final accept check. | Which code operation matches each visible move? |
| `prediction-prompts` | Exercises | Static prediction prompts using the frozen traces. | Can the learner apply the rules? |

Every major section should have a nearby figure, table, or widget. A prose-only section is acceptable only for short connective transitions.

The flag section should be fair to the naive implementation: flag-based code can be made correct. The learning pain is that correctness becomes hidden inside boolean combinations. The grid should show, for example, how combinations like `hasLocal && seenAt && !hasDomain`, `hasLocal && seenAt && hasDomain && !seenDot`, and `hasLocal && seenAt && hasDomain && seenDot && hasSuffix` correspond to `need-domain`, `in-domain`, and `in-suffix`. Named DFA states make those meanings explicit and give each input category exactly one next step.

## Formula And Notation Plan

Use display math for the formal definition:

```mdx
$$
M = (Q, \Sigma, \delta, q_0, F)
$$
```

Explain in words:

- `Q` is the finite set of states.
- `\Sigma` is the finite input alphabet.
- `\delta` is the transition function.
- `q_0` is the start state.
- `F` is the set of accepting states.

Use inline notation for local transitions, such as `$\\delta(\\text{in-local}, @) = \\text{need-domain}$`.

Keep the main formal section focused on the 5-tuple and final-state acceptance. Do not require `\delta^*`, `\Sigma^*`, or recognized-language notation for the beginner path.

Optional formal postcard after the learner has already seen traces:

```mdx
$$
L(M) = \{ w \in \Sigma^* \mid \delta^*(q_0, w) \in F \}
$$
```

Plain-language interpretation: the DFA accepts exactly the strings that leave it in an accepting state after the whole input is consumed.

Concrete expanded trace example to pair with that postcard:

```text
input: ana@cs.ai
states:
need-local
  --a--> in-local
  --n--> in-local
  --a--> in-local
  --@--> need-domain
  --c--> in-domain
  --s--> in-domain
  --.--> need-suffix
  --a--> in-suffix
  --i--> in-suffix

final state: in-suffix
accepted: yes, because the input is exhausted and in-suffix is accepting
```

If the page feels notation-heavy during implementation, defer this postcard to a later `regular-languages` node and keep only the 5-tuple plus concrete transition examples here.

Complexity notation:

- `$O(n)$` time for an input of length `n`.
- `$O(|Q||\Sigma|)$` transition-table size.
- `$O(1)$` working memory beyond the input because only the current state must be stored.

## Components And Tests

Expected files:

- `src/content/nodes/dfa/en.mdx`
- `src/content/nodes/dfa/zh.mdx`
- `src/components/interactive/dfaTrace.ts`
- `src/components/interactive/DfaScenarioFigure.tsx`
- `src/components/interactive/DfaSimulator.tsx`
- `tests/dfa-trace.test.ts`

Component requirements:

- Deterministic trace generated from the exported transition table.
- No runtime AI or network calls.
- Shared fixture powers static figures, simulator, and exercises.
- Simulator exposes current state, next symbol, consumed prefix, remaining suffix, accept/reject status, and transition reason.
- Static figures should cover the hook, flags, pain, state meanings, transition table, invariant, complexity, and confusions.

Test expectations:

- Golden accepted and rejected cases.
- `classify` returns `char` for letters/digits, `at` for `@`, `dot` for `.`, and `other` for `_` and unrelated punctuation.
- Inputs containing `other` are rejected, including `ana_@cs.ai` and `ana@cs!.ai`.
- Dots in the wrong phase are rejected, including `.ana@cs.ai`, `ana.@cs.ai`, and `ana@.ai`.
- Acceptance is final-status based: `ana@cs.ai` accepts only when the input is exhausted, and `ana@cs.ai.` is not accepted even though the prefix `ana@cs.ai` reaches `in-suffix`.
- Trace for `ana@cs.ai` reaches `in-suffix` and accepts.
- Trace for `ana@.ai` reaches `dead` immediately after the dot.
- Every transition table row covers every `DfaSymbol`.
- `dead` loops to itself for every symbol.

## Accessibility And Mobile

- SVGs use `role="img"` and localized `aria-label`.
- Buttons have descriptive labels and can be operated by keyboard.
- Current state and accept/reject status are visible in text, not only color.
- The dead state is labeled with text and a visual style.
- Respect reduced motion; animation is not required for understanding.
- On mobile, stack input tape, diagram, state panel, and trace table vertically.
- Keep the transition table horizontally scrollable if needed.
- Chinese text should use short paragraphs and wrap cleanly.

## Graph Placement

Add graph node:

```ts
{
  id: "dfa",
  label: {
    en: "Deterministic Finite Automata",
    zh: "确定性有限自动机"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 90, y: 1630 }
}
```

Add only this edge to existing content:

```ts
{
  from: "graph-basics",
  to: "dfa",
  type: "contrasts",
  reason: {
    en: "Both use circles and arrows, but graph basics models relationships among objects while a DFA diagram models finite memory states and labeled input transitions.",
    zh: "二者都使用圆点和箭头，但图的基础描述对象之间的关系，而 DFA 图描述有限记忆状态和带输入标签的转移。"
  }
}
```

Future-only edges, not to add until target nodes exist:

- `dfa -> dfa-design`, `motivates`: once the tuple is known, the next challenge is choosing states that remember exactly enough.
- `dfa -> regular-languages`, `motivates`: a DFA accepts many strings; that accepted set is the language it recognizes.
- `dfa -> nfa`, `contrasts`: DFA has one next state per symbol; NFA may branch.

## Acceptance Criteria

- English and Chinese pages follow the concrete-problem-to-formal arc.
- Chinese technical terms are introduced bilingually on first mention, including `确定性有限自动机（deterministic finite automaton, DFA）`, `状态（state）`, and `转移函数（transition function）`.
- Chinese frontmatter keeps `translationStatus: needs-review`.
- Every major section has a nearby visual, table, or widget.
- Golden accept/reject cases pass deterministic trace tests.
- Graph node and only valid existing-node edge are added; future edges remain documented only.
- `npm run check`, `npm run test`, and `npm run build` pass after implementation when practical.
