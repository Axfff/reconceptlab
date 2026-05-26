# Kernel Design

## Node

- id: `kernel`
- scope: introduce a kernel function as a similarity function that equals an inner product in some feature space.
- non-scope: full positive-semidefinite proofs, SVM dual derivation, kernel PCA.

## Frontmatter

- title: `Kernel Function` / `核函数`
- difficulty: `intermediate`
- conceptType: `concept`
- prerequisites: `feature-map`
- next: `linear-kernel`, `polynomial-kernel`, `rbf-kernel`, `sigmoid-kernel`
- Chinese translation status: `needs-review`

## Teaching Arc

1. Concrete problem: useful feature maps can become expensive to construct.
2. Naive idea: map every point first, then take dot products.
3. Pain: the mapped vector can be large or infinite.
4. Invention: compute `K(x,z)=<phi(x),phi(z)>` directly.
5. Formal: kernel as feature-space inner product; valid kernels behave like Gram matrices.
6. Implementation: fixed functions over pairs of points.
7. Connections: named kernels encode different similarity assumptions.

## Visual Inventory

- Shortcut figure: explicit mapped dot product equals direct kernel value.
- Kernel lab: switch between named kernels and compare anchor similarity.
- Graph strip: feature map -> general kernel -> linear/poly/RBF/sigmoid.

## Formula Plan

- Display `K(x,z)=\langle\phi(x),\phi(z)\rangle`.
- Explain `x`, `z`, `phi`, and feature space in words.
- Mention positive semidefinite behavior as a boundary, not a proof.

## Implementation Expectations

- Add bilingual MDX.
- Reuse `KernelFunctionFigure` and `KernelSimilarityLab`.
- Keep the Chinese page marked `needs-review`.

## Acceptance Criteria

- Learner can distinguish kernel-as-function from feature-map-as-representation.
- Page warns that not every arbitrary similarity is a valid kernel.
- Build, content validation, tests pass.
