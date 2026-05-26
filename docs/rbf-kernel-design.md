# RBF Kernel Design

## Node

- Stable id: `rbf-kernel`
- Scope: teach the radial basis function kernel as local, distance-decay similarity: nearby points receive high similarity and far points fade toward zero.
- Non-scope: Gaussian processes, SVM dual optimization, Mercer/PSD proof, infinite-dimensional feature-space proof, bandwidth-selection theory, kernel PCA.

## Frontmatter

English:

```yaml
id: rbf-kernel
locale: en
title: RBF Kernel
summary: Turn distance into local similarity so nearby points matter much more than faraway points.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: concept
tags:
  - machine-learning
  - kernels
  - similarity
prerequisites:
  - kernel
next:
  - sigmoid-kernel
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

Chinese:

```yaml
id: rbf-kernel
locale: zh
title: RBF 核
summary: 把距离转成局部相似度，让近点比远点重要得多。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: concept
tags:
  - machine-learning
  - kernels
  - similarity
prerequisites:
  - kernel
next:
  - sigmoid-kernel
createdAt: 2026-05-22
updatedAt: 2026-05-22
```

## Teaching Arc

1. Concrete problem: a learner predicts for a new house, sensor, or user from nearby examples after features have been normalized onto comparable scales.
2. Naive attempt: reuse the dot product because kernels often feel like inner-product shortcuts.
3. Pain: dot product can reward magnitude and origin-based alignment, so a far same-direction point can outrank a nearby local neighbor.
4. Smallest invention: replace alignment with squared Euclidean distance, then turn distance into similarity with exponential decay.
5. Distributed visual anchors: show dot-product failure near the naive section, a decay strip near the invention, a fixed-value table near the formula, a computation table near the code, and the interactive lab after learners know what to compare.
6. Formal definition: introduce `K(x,z)=\exp(-\gamma\lVert x-z\rVert^2)` with every symbol explained in words.
7. Implementation: define `d` as the number of numeric features, require equal-length vectors, compute squared distance in `O(d)`, multiply by `-\gamma`, then apply `Math.exp`.
8. Behavior/invariant: `K(x,x)=1`; when `\gamma>0`, increasing distance never increases similarity; finite real inputs produce values in `(0,1]`.
9. Complexity: one kernel evaluation costs `O(d)`; comparing one query with `n` stored points costs `O(nd)`.
10. Common confusions: RBF is not angle similarity; `gamma` is not "more accuracy"; feature scaling matters; the infinite feature-map intuition stays out of scope.
11. Graph connections: position RBF after `kernel`, contrasted with `linear-kernel` and `polynomial-kernel`, before `sigmoid-kernel`.

## Section Plan And Visual Inventory

### 1. Hook: Direction Is Not Always Similarity

Learner question: Why is ordinary dot-product similarity not enough?

Content:
- Start with a real setting: a new house, sensor reading, or user profile should borrow more from nearby examples than from faraway examples that merely point in the same direction from the origin.
- Then reveal `A=(1,1)`, `B=(2,1)`, and `E=(4,4)` as normalized feature vectors, not raw dollars, square feet, temperatures, or click counts.
- Explain that local learning tasks often want the nearby point to matter more, and distances are meaningful only after features are on comparable scales.

Visual:
- Add a static `KernelFunctionFigure` scenario such as `rbf-dot-product-pain`.
- Show a 2D point plot plus a comparison table with dot product, squared distance, and RBF value.
- Required axis labels: two normalized features, with concrete labels such as "normalized size feature" and "normalized location/sensor/user feature" depending on the chosen story.
- Required caption note: distances only make sense after feature scaling or normalization makes axes comparable.
- Required point labels: anchor/new example, near/local example, far/same-direction example. Do not rely on color alone.

### 2. Naive Idea: Use The Dot Product Anyway

Learner question: What exactly goes wrong with `$x^Tz$`?

Content:
- Define dot product inline as `$x^Tz$`.
- Explain magnitude/origin sensitivity using the same anchor and candidates.

Visual:
- Trace-linked mini table:
  - `A -> B`: dot `3`, squared distance `1`, RBF at `gamma=0.5` about `0.607`.
  - `A -> E`: dot `8`, squared distance `18`, RBF at `gamma=0.5` about `0.000123`.
- This table is required so the pain is concrete.

### 3. Core Invention: Exponential Distance Decay

Learner question: What is the smallest change that makes similarity local?

Content:
- Introduce squared distance first, then exponential decay.
- Explain that distance `0` maps to `1`, while larger distances shrink toward `0`.

Visual:
- Add a static decay strip or compact curve for `gamma=0.5`:
  - squared distance `0 -> 1.000`
  - `1 -> 0.607`
  - `5 -> 0.082`
  - `10 -> 0.007`
  - `18 -> 0.000123`
- This may be a new `KernelFunctionFigure` scenario such as `rbf-decay-curve`.

### 4. Formal Definition

Learner question: What does the formula mean?

Content:

```tex
$$
K(x,z)=\exp(-\gamma \lVert x-z\rVert^2)
$$
```

Explain:
- `$x$` and `$z$`: two input vectors.
- `$\lVert x-z\rVert^2$`: squared Euclidean distance.
- `$\gamma$`: positive decay rate.
- `$\exp$`: exponential function that turns nonpositive exponents into values between `0` and `1`.
- Common bandwidth convention: `$\gamma = 1 / (2\sigma^2)$`, so a larger `$\gamma$` means a smaller effective neighborhood and a smaller `$\gamma$` means a wider one.

Visual:
- Reuse `KernelFunctionFigure scenarioId="rbf-neighborhood"` as the formal value table from anchor `A`.
- Golden fixture with `gamma=0.5`:
  - `A -> A`: dot `2`, squared distance `0`, RBF `1.000`
  - `A -> B`: dot `3`, squared distance `1`, RBF `0.607`
  - `A -> C`: dot `1`, squared distance `5`, RBF `0.082`
  - `A -> D`: dot `-2`, squared distance `10`, RBF `0.007`

### 5. Interactive Comparison

Learner question: How does RBF behave differently when I change anchors or compare kernels?

Content:
- Embed `KernelSimilarityLab client:load lang="..." initialKernel="rbf"`.
- Keep the kernel switcher because RBF is best understood by contrast with linear, polynomial, and sigmoid.
- Add a mandatory deterministic `gamma` selector using `0.1`, `0.5`, and `1.0`.
- The gamma selector affects only the RBF calculation and RBF explanation in this lab. Polynomial and sigmoid must keep their own fixed parameters or separate named controls so the RBF bandwidth lesson is not blurred by a shared default params object.

Widget expectations:
- Controls: anchor selector, kernel selector, gamma selector, reset.
- Disable or visually mark the gamma selector as RBF-only when another kernel is selected, and keep non-RBF scores unchanged as gamma changes.
- Dynamic explanation uses `aria-live="polite"`.
- Golden anchor `A` RBF values:
  - `gamma=0.1`: `A->B=0.905`, `A->C=0.607`, `A->D=0.368`
  - `gamma=0.5`: `A->B=0.607`, `A->C=0.082`, `A->D=0.007`
  - `gamma=1.0`: `A->B=0.368`, `A->C=0.007`, `A->D≈0.000045`

### 6. Implementation Sketch

Learner question: How would I compute this without magic?

Content:
- Include short TypeScript over numeric arrays.
- State the precondition in prose before the snippet: `x` and `z` are equal-length numeric vectors, and `d` is that shared number of features.
- Keep the code direct; no library calls.

Code shape:

```ts
function rbfKernel(x: number[], z: number[], gamma: number) {
  if (x.length !== z.length) {
    throw new Error("RBF kernel expects equal-length vectors.");
  }

  const squaredDistance = x.reduce((sum, value, index) => {
    return sum + (value - z[index]) ** 2;
  }, 0);

  return Math.exp(-gamma * squaredDistance);
}
```

Visual:
- Add a small computation table for `A=(1,1)` and `B=(2,1)` with feature index, `x_i`, `z_i`, `(x_i-z_i)^2`, and running sum.

### 7. Behavior, Invariant, And Complexity

Learner question: What facts should always be true?

Content:
- `$K(x,x)=1$`: a point is maximally similar to itself.
- If `$\gamma>0$`, larger squared distance means smaller or equal similarity.
- Finite real inputs produce values in `$(0,1]$`.
- Let `d` be the number of numeric features in each vector. One evaluation is `$O(d)$`; comparing one query with `n` stored points is `$O(nd)$`.

Visual:
- Compact behavior ledger with rows for self-match, near point, far point, `gamma = 0`, `gamma < 0`, small positive `gamma`, and large positive `gamma`.
- Use the same pair distance for the small/large gamma rows so learners see that only the decay rate changed.
- Mark `gamma = 0` as "not local": every pair maps to `1`, so distance stops mattering.
- Mark `gamma < 0` as "not the RBF setting for this node": farther points can get larger than `1`, breaking local decay.

### 8. Common Confusions

Learner question: What should I not overgeneralize?

Content:
- RBF is local distance similarity, not angle similarity.
- Larger `gamma` can make neighborhoods too tiny.
- Smaller `gamma` can make too many points look alike.
- Bandwidth notation can hide the direction: under `$\gamma = 1 / (2\sigma^2)$`, increasing `$\sigma$` decreases `$\gamma$` and widens the neighborhood.
- Inputs should be meaningfully scaled because one large-scale feature can dominate squared distance.
- RBF can be described as a rich feature-space kernel, but the proof is outside this node.

Visual:
- Two-column mistake/repair table. A table is clearer than another widget here.
- Include a gamma row that explicitly connects `$\gamma = 1 / (2\sigma^2)$` to "larger gamma means smaller neighborhood."

### 9. Graph Connections And Practice

Learner question: Where does this sit in the graph, and can I predict behavior?

Content:
- Connect to `kernel`, `linear-kernel`, `polynomial-kernel`, and `sigmoid-kernel`.
- Add prediction questions about highest RBF score from anchor `A`, what happens to `A->C` as `gamma` increases, and why dot product can rank the far same-direction point above a nearby point.

Visual:
- Reuse `KernelFunctionFigure scenarioId="graph-strip"` if the page needs a visual graph footer; otherwise prose plus links is acceptable because the graph explorer carries topology.

## Formula And Notation Plan

- Inline formulas: `$x^Tz$`, `$\lVert x-z\rVert^2$`, `$\gamma>0$`, `$K(x,x)=1$`, `$(0,1]$`, `$O(d)$`, `$O(nd)$`.
- Display formula: only the main RBF formula.
- Plain-language explanation immediately after the display formula: compute distance, square it, multiply by a negative decay rate, then exponentiate so nearby pairs stay near `1` and far pairs shrink toward `0`.
- Avoid feature-space expansion formulas; mention the rich-feature-map intuition only in prose.

## Component And Trace Expectations

Reuse:
- `src/components/interactive/kernelTrace.ts`
- `src/components/interactive/KernelFunctionFigure.tsx`
- `src/components/interactive/KernelSimilarityLab.tsx`

Trace additions:
- Keep shared `kernelPoints` unchanged unless all kernel pages are reviewed.
- Add RBF-specific fixture data such as `rbfPainRows`, `rbfPainPoints`, and `rbfDecayRows`.
- `rbf-dot-product-pain` must use its own scenario-local point set containing `E=(4,4)`; do not add `E` to shared `kernelPoints` or otherwise change the shared lab point set.
- Golden RBF pain fixture:
  - `A=(1,1)`
  - `B=(2,1)`: dot `3`, squared distance `1`, RBF `0.6065306597`
  - `E=(4,4)`: dot `8`, squared distance `18`, RBF `0.0001234098`
- Keep existing shared fixture tests:
  - `rbfKernel(A,A)=1`
  - `rbfKernel(A,B)=Math.exp(-0.5)`
  - `rbfKernel(A,C)=Math.exp(-2.5)`
  - `rbfKernel(A,D)=Math.exp(-5)`

Component behavior:
- `KernelFunctionFigure` gains `rbf-dot-product-pain` and `rbf-decay-curve`, or an equivalent richer RBF scenario set.
- `KernelSimilarityLab` stays deterministic and offline.
- Because the RBF-only gamma selector is required, update helper functions and tests for stable values, formatting, and proof that non-RBF kernel scores do not change when RBF gamma changes.

## Accessibility And Mobile Requirements

- Every figure has a meaningful `figcaption` that states the teaching point.
- SVG plots use `role="img"` and descriptive `aria-label`; tables use captions and row/column headers.
- Interactive buttons use `aria-pressed`, visible focus states, and clear labels in English and Chinese.
- Dynamic lab explanation uses `aria-live="polite"`.
- Near/far and active/inactive states are communicated with labels and values, not color alone.
- No required animation; respect reduced-motion users by keeping all states inspectable.
- Mobile: plots and tables stack vertically; tables may scroll inside the figure; controls wrap into anchor, kernel, gamma/reset rows; numeric cards remain readable.

## Graph Placement

Keep node entry:

```ts
{
  id: "rbf-kernel",
  label: {
    en: "RBF Kernel",
    zh: "RBF 核"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 990, y: 1210 }
}
```

Keep or refine only existing-node edges:

```ts
{
  from: "kernel",
  to: "rbf-kernel",
  type: "prerequisite",
  reason: {
    en: "RBF is a named kernel whose similarity comes from distance decay rather than raw dot-product alignment.",
    zh: "RBF 是一种具名核，它的相似度来自距离衰减，而不是原始点积对齐。"
  }
}
```

```ts
{
  from: "linear-kernel",
  to: "rbf-kernel",
  type: "contrasts",
  reason: {
    en: "Linear similarity rewards origin-based alignment; RBF similarity rewards local nearness.",
    zh: "线性相似度奖励基于原点的方向对齐；RBF 相似度奖励局部距离接近。"
  }
}
```

```ts
{
  from: "polynomial-kernel",
  to: "rbf-kernel",
  type: "contrasts",
  reason: {
    en: "Polynomial kernels add finite-degree interactions, while RBF behaves like a much richer local feature space.",
    zh: "多项式核加入有限次数交互；RBF 则表现得像更丰富的局部特征空间。"
  }
}
```

Do not add edges to nonexistent SVM, Gaussian process, or kernel PCA nodes.

## Acceptance Criteria

- The page follows the arc: local-similarity problem, dot-product failure, distance-decay invention, formal definition, implementation, behavior, complexity, confusions, graph connections.
- Every major section has a nearby visual/table/widget, except the final graph/practice section where prose plus links is acceptable if graph-strip is not reused.
- Learners can explain why RBF ranks nearby points higher even when a far point has a larger dot product.
- Learners can interpret `gamma` as decay speed and identify both too-large and too-small failure modes.
- English and Chinese pages are structurally parallel; Chinese remains `translationStatus: needs-review`.
- RBF deterministic values are covered by tests, including self-similarity and the far same-direction pain case.
- Existing kernel pages still work after shared trace changes.
- No runtime network calls or AI-generated visualization state.

## Validation Commands

Run after implementation when practical:

```bash
npm run check
npm run test
npm run build
```

Expected targeted test updates:
- Extend `tests/kernel-trace.test.ts` for RBF pain and decay fixtures if new helpers are added.
- Keep existing named-kernel fixture tests passing.
