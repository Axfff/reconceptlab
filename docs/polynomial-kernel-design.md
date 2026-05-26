# Polynomial Kernel Design

## Node

- id: `polynomial-kernel`
- scope: explain polynomial kernels as dot-product shortcuts over powers and interactions.
- non-scope: all monomial-count derivations and high-degree generalization theory.

## Frontmatter

- title: `Polynomial Kernel` / `多项式核`
- difficulty: `intermediate`
- conceptType: `concept`
- prerequisites: `feature-map`, `kernel`, `linear-kernel`
- next: `rbf-kernel`, `sigmoid-kernel`
- Chinese translation status: `needs-review`

## Teaching Arc

1. Concrete problem: raw coordinates may need pair interactions.
2. Naive idea: manually add every square, cube, and interaction.
3. Pain: expanded features grow quickly.
4. Invention: compute `(gamma x^Tz + c)^d`.
5. Formal: degree controls interaction order; `gamma` and `c` scale and offset the dot product.
6. Implementation: deterministic formula over the dot product.
7. Connections: extends linear; contrasts with RBF locality.

## Visual Inventory

- Quadratic feature-map figure reused from feature map.
- Polynomial kernel table from anchor A.
- Kernel lab initialized to polynomial.

## Formula Plan

- Display `K(x,z)=(\gamma x^Tz+c)^d`.
- Explain `d`, `gamma`, and `c` in prose.
- Keep expansion details to the degree-2 example.

## Implementation Expectations

- Add bilingual MDX.
- Use shared trace and test expected value for the fixture.

## Acceptance Criteria

- Learner can say the polynomial kernel adds interactions without explicitly listing them all.
- Page warns high degree can overfit or become numerically large.
