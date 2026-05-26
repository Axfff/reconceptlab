# Week 1 Finite Automata Node Extraction

Source deck: `/Users/zhaoj/Documents/Assignment/Theories_in_Computing/week1-1.learning-sheet.pdf`

This extraction keeps nodes learner-facing and bounded. Examples such as email validation, automatic doors, and strings ending with `1` are best used as hooks inside pages rather than as standalone graph nodes.

## Recommended First Batch

- [ ] `dfa` - deterministic finite automata as the first concrete machine model: finite states, alphabet, transition function, start state, accept states, and trace-by-input computation.
- [ ] `dfa-design` - the "what must the machine remember?" method for designing DFAs, using even parity and substring-detection examples.
- [ ] `regular-languages` - languages as sets of strings and regularity as "recognized by some finite automaton"; include the first nonregular warning `0^n1^n` but leave the proof for pumping lemma.
- [ ] `regular-operations` - union, concatenation, and star as operations on languages; emphasize edge cases such as `emptyset* = {epsilon}`.
- [ ] `product-construction` - build a DFA that runs two DFAs in parallel; use union/intersection accept conditions and product-state tables.
- [ ] `nfa` - nondeterministic finite automata: multiple next states, zero choices, branching paths, and accept-if-any-branch-accepts.
- [ ] `subset-construction` - convert an NFA to an equivalent DFA by tracking a set of possible NFA states, including reachable-subset pruning and exponential blowup.
- [ ] `regular-expressions` - regex as algebraic descriptions of regular languages, including precedence, base cases, and examples like `(0|1)*01`.
- [ ] `regex-to-nfa` - structural construction from regex to NFA using epsilon transitions for union, concatenation, and star.

## Good Follow-Up Nodes

- [ ] `dfa-minimization` - distinguishable versus indistinguishable states and the table-filling algorithm.
- [ ] `epsilon-transitions` - why NFAs can move without consuming input and how epsilon-closure supports composition.
- [ ] `closure-properties-of-regular-languages` - prove regular languages are closed under union, intersection, concatenation, and star; can later merge with `regular-operations` if the graph feels too granular.
- [ ] `nonregular-languages` - the boundary of finite memory, using `0^n1^n` as the motivating example.
- [ ] `pumping-lemma` - Week 2 proof tool for showing a language is not regular.
- [ ] `state-elimination` - NFA to regex conversion, referenced in the Week 1 summary but covered later.
- [ ] `lexical-analysis` - compiler lexers as a practical application of DFAs and regex.
- [ ] `automata-learning` - Angluin's L* algorithm and learning regular languages from queries/examples.
- [ ] `probabilistic-automata` - Markov chains and probabilistic transitions as a broader model.
- [ ] `finite-state-transducers` - automata that transform strings, useful for spell-checking and text normalization.
- [ ] `weighted-automata` - automata with costs or scores on paths.

## Suggested Graph Shape

- `dfa` motivates `regular-languages`: a machine accepts many strings but recognizes one language.
- `dfa` motivates `dfa-design`: once the tuple is known, the hard part is choosing the right memory states.
- `regular-languages` uses `regular-operations`: language algebra needs sets of strings first.
- `regular-operations` motivates `product-construction`: closure under union/intersection becomes a construction problem.
- `dfa` contrasts `nfa`: deterministic one-next-state computation versus branching computation.
- `nfa` motivates `subset-construction`: to remove guessing, track all possible current states.
- `subset-construction` motivates `regular-languages`: NFAs and DFAs recognize the same class.
- `regular-operations` motivates `regular-expressions`: regex is the algebraic syntax for the same operations.
- `regular-expressions` uses `regex-to-nfa`: structural regex pieces become composable NFA fragments.
- `nfa` uses `epsilon-transitions`: epsilon moves make union, concatenation, and star constructions small.
- `regular-languages` contrasts `nonregular-languages`: finite automata cannot remember unbounded matching counts.

## Page Design Notes

`dfa` should probably be the first implemented node from this deck. It has the cleanest "reinvent the concept" arc: validate a string pattern, try manual parsing, replace ad hoc flags with named states, trace a sample input, then formalize the 5-tuple.

`nfa` and `subset-construction` should share the same deterministic trace data for the "contains 01" example so the branching-path view and subset-table view stay visually aligned.

`regular-expressions` should not become a regex programming reference. Keep it about the equivalence between algebraic language descriptions and automata, with practical regex syntax used only as a bridge.
