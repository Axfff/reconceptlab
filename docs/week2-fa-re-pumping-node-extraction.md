# Week 2 FA-Regex and Pumping Lemma Node Extraction

Source deck: `/Users/zhaoj/Documents/Assignment/Theories_in_Computing/week2-2.learning-sheet.pdf`

This deck continues the Week 1 finite-automata cluster. It completes the automata-to-regex direction with GNFA state elimination, then introduces the pumping lemma as the first proof tool for showing that some languages sit outside finite automata and regular expressions.

## Recommended Key Nodes

- [ ] `state-elimination` - convert a DFA to an equivalent regex by first turning it into a GNFA, then repeatedly removing intermediate states while preserving all paths.
- [ ] `gnfa` - generalized NFAs whose edges carry regex labels; likely best as a subsection inside `state-elimination` unless the course later reuses it heavily.
- [ ] `pumping-lemma` - finite states imply repeated states on long accepted inputs, giving a nonempty loop that can be repeated or removed.
- [ ] `nonregular-languages` - languages that require unbounded memory, such as `0^n1^n`, palindromes, duplication, arithmetic-length languages, and balanced brackets.
- [ ] `pumping-lemma-proof-strategy` - the practical proof template: assume regular, choose a carefully shaped string, handle every valid split, and pump to contradiction.
- [ ] `myhill-nerode-theorem` - a stronger later tool for proving non-regularity by infinitely many distinguishable prefixes.
- [ ] `context-free-grammars` - the next model for nested structure, motivated by JSON brackets, balanced parentheses, and `0^n1^n`.

## Lower-Priority Follow-Ups

- [ ] `regex-size-complexity` - equivalent regexes can become exponentially larger than their DFA, depending on the language and conversion route.
- [ ] `closure-based-nonregularity-proofs` - use closure properties to reduce a suspected nonregular language to a known nonregular core.
- [ ] `balanced-parentheses` - a concrete language node for the nested-bracket boundary; probably belongs with context-free grammars rather than the regular-language cluster.
- [ ] `pigeonhole-principle` - supporting proof idea behind the pumping lemma; keep inline unless a broader math foundations cluster needs it.

## Suggested Graph Additions

- `regular-expressions` motivates `state-elimination`: the regex-to-NFA direction needs the reverse direction to complete the equivalence.
- `dfa` uses `state-elimination`: the algorithm starts from a DFA and preserves its recognized language.
- `state-elimination` uses `gnfa`: regex-labeled edges make state removal algebraic.
- `regular-languages` motivates `pumping-lemma`: after equivalence is complete, the next question is what no DFA/NFA/regex can describe.
- `dfa` motivates `pumping-lemma`: repeated states in a finite machine create the pumpable loop.
- `pumping-lemma` uses `pumping-lemma-proof-strategy`: the theorem becomes useful only through the contradiction template.
- `pumping-lemma-proof-strategy` motivates `nonregular-languages`: examples become proofs that finite memory is insufficient.
- `nonregular-languages` motivates `context-free-grammars`: nested and matched-count languages need a stronger model with stack-like memory.
- `myhill-nerode-theorem` generalizes `pumping-lemma`: both prove non-regularity, but Myhill-Nerode gives a necessary and sufficient characterization.

## Page Design Notes

`state-elimination` should use a small three-state local figure around the formula:

```text
new label = R4 union R1 R2* R3
```

The visual should distinguish the direct path from the enter-loop-exit path and then show one worked conversion, such as "strings ending in 0".

`pumping-lemma` should avoid starting with formal quantifiers. Start with a long accepted string walking through a finite number of states, show the repeated-state loop, then name `x`, `y`, and `z`.

`pumping-lemma-proof-strategy` should be interactive or trace-table based. A learner should be able to choose a candidate string for `0^n1^n`, see why `|xy| <= p` traps `y` inside the zeros, and then pump up or down to break the count match.
