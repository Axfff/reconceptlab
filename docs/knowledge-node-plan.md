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

## Machine Learning Metrics

Keep the first metrics cluster concrete and binary-classification focused. Introduce the count table first, then split the two "how many of the model's alarms were right?" and "how many real positives did it catch?" questions before combining them into a balanced score.

- [x] `confusion-matrix` - count true positives, false positives, true negatives, and false negatives for a binary classifier before naming derived metrics. Design: [confusion-matrix-design.md](confusion-matrix-design.md).
- [x] `precision` - measure how trustworthy positive predictions are using the positive-prediction column of the confusion matrix. Design: [precision-design.md](precision-design.md).
- [x] `recall` - measure how many actual positives are found using the actual-positive row of the confusion matrix. Design: [recall-design.md](recall-design.md).
- [x] `f1-score` - combine precision and recall with their harmonic mean, and show why the smaller metric pulls the score down. Design: [f1-score-design.md](f1-score-design.md).

## Clustering Evaluation Metrics

Keep this cluster focused on external clustering evaluation: compare a proposed clustering against known reference labels without using cluster names as if they were classifier outputs. Start with a cluster-majority metric, then move to pair-count metrics, chance adjustment, and a pair-precision/pair-recall geometric balance.

- [x] `purity` - score each predicted cluster by its largest reference-label majority, while exposing why over-splitting can look deceptively good. Design: [purity-design.md](purity-design.md).
- [x] `rand-index` - compare all unordered item pairs and count pairwise agreements and disagreements. Design: [rand-index-design.md](rand-index-design.md).
- [x] `adjusted-rand-index` - subtract the chance agreement expected from the same cluster-size and class-size margins. Design: [adjusted-rand-index-design.md](adjusted-rand-index-design.md).
- [x] `fowlkes-mallows-index` - use pair true positives, false positives, and false negatives as a geometric balance of pair precision and pair recall. Design: [fowlkes-mallows-index-design.md](fowlkes-mallows-index-design.md).

## Internal Clustering Validation Metrics

These metrics do not compare against reference labels. They inspect geometry, distance, compactness, separation, centroids, and extreme gaps. This section covers the requested Silhouette, Calinski-Harabasz, Davies-Bouldin, and Dunn nodes while making the internal-versus-external distinction explicit for learners.

- [x] `silhouette-score` - compare each point's own-cluster average distance with its nearest other-cluster average distance. Design: [silhouette-score-design.md](silhouette-score-design.md).
- [x] `calinski-harabasz-index` - compare between-cluster centroid scatter with within-cluster scatter. Design: [calinski-harabasz-index-design.md](calinski-harabasz-index-design.md).
- [x] `davies-bouldin-index` - average each cluster's worst spread-versus-separation neighbor, where lower is better. Design: [davies-bouldin-index-design.md](davies-bouldin-index-design.md).
- [x] `dunn-index` - divide the weakest inter-cluster gap by the widest within-cluster diameter. Design: [dunn-index-design.md](dunn-index-design.md).

## Clustering Algorithms

Keep this cluster focused on how cluster assignments are produced, not how they are scored. Start with center-based hard partitions, repair center robustness, then move to density structure, density hierarchy, and probabilistic soft membership.

- [x] `k-means` - alternate nearest-centroid assignment with mean updates to minimize within-cluster squared distance. Design: [k-means-design.md](k-means-design.md).
- [x] `k-medoids` - choose real data points as centers and improve them with distance-reducing swaps. Design: [k-medoids-design.md](k-medoids-design.md).
- [x] `dbscan` - expand clusters from dense neighborhoods while leaving sparse points as noise. Design: [dbscan-design.md](dbscan-design.md).
- [x] `optics` - order points by density reachability so clusters can be extracted across distance scales. Design: [optics-design.md](optics-design.md).
- [x] `hdbscan` - condense a density hierarchy and select stable clusters. Design: [hdbscan-design.md](hdbscan-design.md).
- [x] `em-for-gmm` - fit Gaussian mixture clusters by alternating soft responsibilities with parameter updates. Design: [em-for-gmm-design.md](em-for-gmm-design.md).

## Kernel Functions

Keep this cluster focused on the representation-to-similarity story: first make feature maps concrete, then introduce kernels as mapped-inner-product shortcuts, then compare named kernels by what kind of similarity they encode.

- [x] `feature-map` - rewrite raw inputs into representation coordinates before asking for kernel shortcuts. Design: [feature-map-design.md](feature-map-design.md).
- [x] `kernel` - introduce a kernel function as `K(x,z)=<phi(x),phi(z)>`, with the valid-kernel boundary stated but not proved. Design: [kernel-design.md](kernel-design.md).
- [x] `linear-kernel` - use the original dot product as the no-lift kernel baseline. Design: [linear-kernel-design.md](linear-kernel-design.md).
- [x] `polynomial-kernel` - add powers and feature interactions through a dot-product shortcut. Design: [polynomial-kernel-design.md](polynomial-kernel-design.md).
- [x] `rbf-kernel` - turn squared distance into local similarity through exponential decay. Design: [rbf-kernel-design.md](rbf-kernel-design.md).
- [x] `sigmoid-kernel` - squash an affine dot product with `tanh` while emphasizing parameter-sensitive validity. Design: [sigmoid-kernel-design.md](sigmoid-kernel-design.md).

## Dimensionality Reduction Algorithms

Keep this cluster focused on why lower-dimensional representations are built: linear variance compression, distance-preserving maps, manifold graph distances, supervised discriminants, and local-neighbor visual embeddings. Be explicit that QDA is primarily a supervised classifier and appears here as the quadratic contrast to LDA, not as a standard embedding method.

- [x] `pca` - rotate centered data toward maximum-variance directions and keep the leading coordinates. Design: [pca-design.md](pca-design.md).
- [x] `mds` - place points so low-dimensional distances imitate an original pairwise-distance table. Design: [mds-design.md](mds-design.md).
- [x] `isomap` - replace straight distances with neighbor-graph shortest paths, then run an MDS-style layout. Design: [isomap-design.md](isomap-design.md).
- [x] `lda` - use labels to project data toward high between-class and low within-class scatter. Design: [lda-design.md](lda-design.md).
- [x] `qda` - let each class keep its own covariance shape, producing quadratic supervised boundaries rather than a standard embedding. Design: [qda-design.md](qda-design.md).
- [x] `sne` - convert high-dimensional distances into neighbor probabilities and match them in a low-dimensional map. Design: [sne-design.md](sne-design.md).
- [x] `t-sne` - repair SNE crowding with a heavy-tailed low-dimensional similarity for local visualization. Design: [t-sne-design.md](t-sne-design.md).
- [x] `umap` - build a fuzzy neighbor graph and optimize a low-dimensional graph with similar local memberships. Design: [umap-design.md](umap-design.md).

## Theory of Computing: Regular Languages

First batch extracted from `/Users/zhaoj/Documents/Assignment/Theories_in_Computing/week1-1.learning-sheet.pdf` and `/Users/zhaoj/Documents/Assignment/Theories_in_Computing/week2-2.learning-sheet.pdf`. Keep this cluster centered on finite memory: start from pattern-validation problems, turn ad hoc parsing into states, then use automata/regex equivalence and the pumping lemma to expose the boundary where finite automata fail.

- [x] `dfa` - deterministic finite automata as the first precise machine model: finite states, alphabet, transition function, start state, accept states, and trace-by-input computation.
- [ ] `dfa-design` - design finite-state memory by asking what the machine must remember so far, using parity and substring-detection examples.
- [ ] `regular-languages` - languages as sets of strings and regularity as recognition by some finite automaton.
- [ ] `regular-operations` - union, concatenation, and star as language operations, including edge cases such as `emptyset* = {epsilon}`.
- [ ] `product-construction` - run two DFAs in parallel with pair states to prove closure under union and intersection.
- [x] `nfa` - nondeterministic finite automata with branching choices, missing transitions, bounded epsilon note, and accept-if-any-branch-accepts semantics. Design: [nfa-design.md](nfa-design.md).
- [ ] `subset-construction` - convert an NFA to a DFA by tracking the set of possible current NFA states, including reachable subsets and possible exponential blowup.
- [ ] `regular-expressions` - describe regular languages algebraically and connect regex syntax to union, concatenation, and star.
- [ ] `regex-to-nfa` - build NFAs structurally from regex base cases and epsilon-glued union, concatenation, and star fragments.
- [ ] `state-elimination` - convert a DFA to a regex through a GNFA and the rerouting formula `R4 union R1 R2* R3`.
- [ ] `pumping-lemma` - explain why finite-state machines force loops in sufficiently long accepted strings and state the three pumping conditions.
- [ ] `nonregular-languages` - prove finite automata cannot recognize languages that need unbounded memory, starting with `0^n1^n`, palindromes, duplication, and balanced brackets.
- [ ] `pumping-lemma-proof-strategy` - teach the contradiction template: assume regular, choose a string, constrain all valid splits, pump to leave the language.
- [ ] `myhill-nerode-theorem` - stronger regularity boundary using distinguishable prefixes; keep as a later follow-up after pumping lemma.
- [ ] `context-free-grammars` - next model after regular languages, motivated by nested brackets and `0^n1^n`; keep as the bridge into the next deck.

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
