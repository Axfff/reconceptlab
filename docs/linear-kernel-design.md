# Linear Kernel Design

## Node

- id: `linear-kernel`
- scope: show the linear kernel as the no-lift baseline `K(x,z)=x^Tz`.
- non-scope: complete linear classification or margin optimization.

## Frontmatter

- title: `Linear Kernel` / `线性核`
- difficulty: `intermediate`
- conceptType: `concept`
- prerequisites: `kernel`
- next: `polynomial-kernel`, `rbf-kernel`
- Chinese translation status: `needs-review`

## Teaching Arc

1. Concrete problem: start with the simplest similarity before adding feature complexity.
2. Naive idea: assume raw coordinates already carry the right signal.
3. Pain: this fails when the boundary needs interactions or locality.
4. Invention: use the original dot product as the kernel baseline.
5. Formal and implementation: `K(x,z)=x^Tz`.
6. Complexity: `O(d)` for `d` features.
7. Connections: polynomial extends dot-product alignment; RBF changes to distance locality.

## Visual Inventory

- Static value table from anchor point A using dot products.
- Kernel lab initialized to linear for comparison.
- Common-confusion card: linear kernel is not a feature expansion.

## Formula Plan

- Display `K(x,z)=x^Tz`.
- Optional bias/constant is named but not used in the main formula.

## Implementation Expectations

- Add bilingual MDX.
- Use shared kernel trace values.

## Acceptance Criteria

- Learner can describe when the linear kernel is enough.
- Learner sees why it is the baseline for other kernels.
