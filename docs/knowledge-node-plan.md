# Knowledge Node Plan

Keep early nodes coarse-grained until the geometry cluster has enough learner-facing content to justify smaller supporting nodes.

For every planned node, include a section-by-section visual inventory. Prefer dense, useful visual scaffolding: static figures, trace-linked diagrams, compact state tables, and interactive micro-widgets near the section or step they explain. A full master demo is helpful, but it should not be the only place where learners see the concept operate.

## Graph Algorithms

- [x] `graph-basics` - beginner graph modeling concept node. Design: [graph-basics-design.md](graph-basics-design.md).
- [x] `bfs` - breadth-first search algorithm node. Design: [bfs-design.md](bfs-design.md).
- [x] `dijkstra` - nonnegative weighted shortest-path algorithm node. Design: [dijkstra-design.md](dijkstra-design.md).

## Geometry Algorithms

- [x] `closest-pair-divide-and-conquer` - first non-naive closest-pair algorithm node. Design: [closest-pair-divide-and-conquer-design.md](closest-pair-divide-and-conquer-design.md).
- [x] `graham-scan` - convex hull algorithm node. Design: [graham-scan-design.md](graham-scan-design.md).
- [x] `bentley-ottmann` - sweep-line segment-intersection reporting algorithm node. Design: [bentley-ottmann-design.md](bentley-ottmann-design.md).

## NP-Hardness and Approximation

First batch extracted from `/Users/zhaoj/Documents/Assignment/AdvancedAlgorithm/Slides/9.NP-hard.pdf`. Keep the first implementation path learner-facing and reduction-oriented: build the language of efficient verification, then show how hardness moves through reductions, then finish with the approximation pivot.

- [x] `p-vs-np` - decision problems, polynomial-time solving, polynomial-time verification, certificates, and the central `P = NP?` question. Design: [p-vs-np-design.md](p-vs-np-design.md).
- [x] `polynomial-time-reductions` - the proof template `known hard problem <=p target problem` and why it transfers hardness. Design: [polynomial-time-reductions-design.md](polynomial-time-reductions-design.md).
- [x] `np-hardness` - what it means for every NP problem to reduce to a target problem, and why one polynomial-time algorithm would imply `P = NP`. Design: [np-hardness-design.md](np-hardness-design.md).
- [x] `circuit-sat` - Boolean circuit satisfiability as the first NP-hard source problem, with assignment checking as a certificate.
- [x] `sat` - Boolean formula satisfiability as the formula version of the same search-for-an-assignment question. Design: [sat-design.md](sat-design.md).
- [x] `circuit-sat-to-sat` - gate-output variables, gate constraints, final output condition, and the two correctness directions. Design: [circuit-sat-to-sat-design.md](circuit-sat-to-sat-design.md).
- [ ] `cnf-and-3sat` - clauses, CNF, 3CNF, and why the regular shape of 3SAT is useful for reductions.
- [ ] `sat-to-3sat` - replacing short and long clauses with satisfiability-preserving 3-literal clauses.
- [ ] `clique-decision` - k-clique as a graph decision problem and complete-subgraph intuition.
- [ ] `three-sat-to-clique` - one literal occurrence per vertex, compatibility edges, and clique-as-consistent-clause-choice.
- [ ] `max-3sat` - optimization version of 3SAT and exact optimization as an NP-hard goal.
- [ ] `randomized-max-3sat-approximation` - random assignments, `7/8` clause satisfaction probability, linearity of expectation, and approximation guarantee.
