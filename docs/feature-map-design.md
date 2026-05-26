# Feature Map Design

## Node

- id: `feature-map`
- scope: explain a feature map as a deliberate rewrite from raw input coordinates to representation coordinates, before discussing kernels.
- non-scope: full representation learning, neural embeddings, SVM optimization, Mercer theory.

## Frontmatter

- title: `Feature Map` / `特征映射`
- difficulty: `intermediate`
- conceptType: `concept`
- prerequisites: none
- next: `kernel`, `linear-kernel`, `polynomial-kernel`
- Chinese translation status: `needs-review`

## Teaching Arc

1. Concrete problem: points are not separable or comparable in the raw coordinates.
2. Naive idea: keep using the original two numbers.
3. Pain: linear comparison can miss square terms and interactions.
4. Invention: choose a map `phi(x)` that exposes useful coordinates.
5. Formal: `phi: X -> F`, where `F` is a feature space.
6. Implementation: deterministic transform from a point to a vector.
7. Connections: kernels reuse feature maps without always constructing them.

## Visual Inventory

- Hook figure: raw points beside mapped quadratic coordinates.
- Local table: `A`, `B`, `phi(A)`, `phi(B)`, and mapped dot product.
- Graph strip: feature map -> kernel -> named kernels.
- No master-only demo; this node uses static support because the core concept is one transformation.

## Formula Plan

- Inline `phi(x)`.
- Display `\phi(x_1,x_2)=(x_1^2,\sqrt{2}x_1x_2,x_2^2)`.
- Pair every formula with a plain-language sentence about what new coordinates mean.

## Implementation Expectations

- Add English and Chinese MDX.
- Reuse `KernelFunctionFigure`.
- Add `kernelTrace.ts` test coverage for the quadratic map.
- Add graph node and edges to `kernel` and polynomial/linear variants only after content exists.

## Acceptance Criteria

- Learner can explain why a map is chosen before a kernel is named.
- Page does not imply feature maps are automatically learned.
- Build, content validation, tests pass.
