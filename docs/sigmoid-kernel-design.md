# Sigmoid Kernel Design

## Node

- id: `sigmoid-kernel`
- scope: explain sigmoid kernel as a squashed affine dot-product similarity and flag its validity caveat.
- non-scope: neural-network history in depth, Mercer-condition proof, SVM solver details.

## Frontmatter

- title: `Sigmoid Kernel` / `Sigmoid 核`
- difficulty: `intermediate`
- conceptType: `concept`
- prerequisites: `kernel`, `linear-kernel`
- next: []
- Chinese translation status: `needs-review`

## Teaching Arc

1. Concrete problem: dot products can grow without a bound.
2. Naive idea: squash dot-product scores like an activation function.
3. Pain: squashing changes geometry and may violate kernel validity.
4. Invention: `tanh(gamma x^Tz+c)`.
5. Formal: parameters control slope and offset; output lies between `-1` and `1`.
6. Implementation: dot product, affine transform, tanh.
7. Connections: contrasts with guaranteed common kernels such as linear, polynomial, and RBF.

## Visual Inventory

- Sigmoid table from anchor A showing saturation.
- Kernel lab initialized to sigmoid.
- Warning card: valid only for some parameter/data settings.

## Formula Plan

- Display `K(x,z)=\tanh(\gamma x^Tz+c)`.
- Pair with a note that not every `gamma`, `c` pair makes a valid kernel matrix.

## Implementation Expectations

- Add bilingual MDX.
- Test fixture value against `Math.tanh`.

## Acceptance Criteria

- Learner can identify sigmoid as a risky, parameter-sensitive kernel.
- Page does not present sigmoid as universally PSD.
