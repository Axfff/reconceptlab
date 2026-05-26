# B+-Tree Node Design

## Node Scope

Node id: `b-plus-tree`

`b-plus-tree` is an intermediate data-structure node that builds directly on `b-tree`, focused on database-style indexes where internal nodes guide search and all records/values live in linked leaves.

Teaching convention: unlike the B-tree node in this pair, B+-tree internal keys are separators only. They do not carry records/values. Equality follows the right-hand separator convention: at root keys `[30, 60]`, child intervals are `<30`, `30 <= key < 60`, and `>=60`. Range examples use inclusive bounds such as `[20, 70]`. Duplicate keys are out of scope for this first node.

In scope:

- Why B-tree search is not enough for efficient range scans.
- B+-tree structure: internal nodes contain guide keys; leaves contain all records/values.
- Linked leaves for sequential range queries.
- Point lookup and range query behavior.
- Insertion and leaf split at a conceptual level.
- Difference between promoting/copying separator keys in B+-trees versus moving keys in the B-tree page.

Out of scope:

- Deletion and redistribution/merge variants.
- Clustered vs secondary indexes beyond a short note.
- SQL query planners, transactions, locking, logging, or on-disk page layout.
- B-link trees, prefix compression, duplicate-key record lists, bulk loading, or production database internals.

## Proposed Frontmatter

English page:

```yaml
id: b-plus-tree
locale: en
title: B+-Tree
summary: Speed up point lookups and range scans by keeping guide keys above and all records in linked leaves.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: data-structure
tags:
  - data-structures
  - trees
  - databases
  - indexing
prerequisites:
  - b-tree
next: []
createdAt: 2026-05-19
updatedAt: 2026-05-19
```

Chinese page:

```yaml
id: b-plus-tree
locale: zh
title: B+ 树
summary: 将内部节点作为导航键、所有记录放在相连叶子中，同时支持快速点查找和范围扫描。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: data-structure
tags:
  - data-structures
  - trees
  - databases
  - indexing
prerequisites:
  - b-tree
next: []
createdAt: 2026-05-19
updatedAt: 2026-05-19
```

## Beginner Teaching Arc

1. Hook problem: a database index must answer `id = 42` and also `id BETWEEN 20 AND 60`.
2. Naive B-tree reuse: point lookup is shallow, but range scan may bounce between tree paths or require in-order traversal logic.
3. Pain point: records inside internal nodes interrupt sequential scanning and make leaf-to-leaf movement less direct.
4. Core invention: keep internal nodes as guides only; store all records/values in leaves.
5. Range repair: link leaves left-to-right so a range query searches once, then scans forward.
6. Formal version: internal guide keys, leaf records, all leaves at same depth, leaf sibling pointers.
7. Implementation sketch: point lookup descends to one leaf; range query descends to first matching leaf, then follows leaf links until the upper bound.
8. Correctness intuition: internal guide keys route to the only leaf range that can contain the target; linked leaves preserve sorted order for scanning.
9. Complexity: lookup height is logarithmic; range query is lookup cost plus number of scanned leaf entries/pages.
10. Common confusions: B-tree vs B+-tree, guide key vs record, duplicate separator copy, leaf chain vs child pointers, point lookup vs range scan.
11. Connections: B+-tree is motivated by B-tree but optimized for index range access.
12. Exercises: locate a key, trace a range scan, identify whether a value is stored in an internal node or leaf, predict a leaf split.

## Vocabulary Scaffolding

- Guide key / separator key: a key in an internal node that routes search but is not itself the stored record. Chinese: `导航键/分隔键（guide/separator key）`.
- Leaf record/value: the actual payload or pointer stored at leaf level. Chinese: `叶子记录/值（leaf record/value）`.
- Linked leaves: sibling pointers connecting leaves in sorted order. Chinese: `相连叶子（linked leaves）`.
- Point lookup: search for one key. Chinese: `点查找（point lookup）`.
- Range scan: read all records between lower and upper bounds. Chinese: `范围扫描（range scan）`.
- Fanout: number of children an internal page can point to. Chinese: `扇出（fanout）`.

Separator convention used in all visuals and traces:

- Root separators `[30, 60]` divide child ranges as `<30`, `30 <= key < 60`, and `>=60`.
- Equality goes to the child on the right of the matching separator, so lookup `30` descends to the middle child and lookup `60` descends to the right child.
- Range notation `[20, 70]` is inclusive: collect keys `20` and `70` if present.
- Duplicate keys and duplicate-record lists are intentionally out of scope.

## Section-Level Visual / Interactive Inventory

| Section | Visual support | Learner question answered |
|---|---|---|
| Hook problem | Query cards: `find 42` and `20 <= key <= 60` over the same sorted record set. | Why do indexes need both point and range behavior? |
| B-tree reuse pain | Static comparison: B-tree with records in internal and leaf nodes; range `20..60` highlights scattered record positions. | Why is shallow search alone not the whole story? |
| Core invention | B+-tree anatomy diagram: internal nodes labeled "guide only", leaves labeled "records live here", leaf arrows shown. | What moved compared with B-tree? |
| Point lookup | Micro-widget `BPlusTreeLookupFigure`: search for `50`; highlight guide comparisons, chosen child, final leaf record. Include equality presets for `30` and `60` using the right-hand separator convention. | How does a guide-only internal node still find a record, including keys equal to separators? |
| Range scan | Interactive `BPlusTreeRangeScanDemo`: step through fixed range `[20, 70]`; descend once, then follow leaf arrows collecting records. Include a stop-inside-leaf preset such as `[20, 65]`, which stops after `60` before `70`. Controls: step, reset. | Why are linked leaves useful, and where does a range scan stop? |
| Internal vs leaf keys | Trace-linked static figure showing separator `50` in an internal node and actual `50 -> value` in a leaf. | Is the internal key a duplicate record? |
| Leaf split | Before/after inserting `55` into a full leaf; leaf splits and a copied separator appears in parent while records remain in leaves. | What changes during insertion? |
| Formal invariants | Checklist diagram: all records in leaves, internal nodes guide, leaves same depth, leaf chain sorted. | What must remain true? |
| Implementation sketch | Pseudocode plus two traces: `lookup(key)` and `rangeQuery(lo, hi)`. | What code path changes for range queries? |
| Complexity | Formula card paired with scan trace: one descent plus sequential leaf reads. | Why is range query cost output-sensitive? |
| Common confusions | Small cards: B-tree vs B+-tree, guide key vs value, copied separator vs moved record, child pointer vs leaf sibling pointer. | What mistakes should learners avoid? |
| Connections | Local graph snippet: `b-tree -> b-plus-tree`. | Why is B-tree a prerequisite? |
| Exercises | Prediction cards: which leaf contains `x`, what range scan returns, which separator is copied after split. | Can the learner use the structure? |

## Formula / Notation Plan

- `$h$`: tree height.
- `$n$`: number of records.
- `$B$`: simplified beginner-model fanout/page capacity, roughly "how many child pointers or records fit in a page"; real systems have separate internal and leaf capacities.
- `$k$`: number of records returned by a range query.

Display near lookup:

```tex
\text{point lookup} = O(h) \approx O(\log_B n)
```

Plain-language explanation: a point lookup reads one page per level; high fanout keeps the number of levels small.

Display near range scan:

```tex
\text{range query} = O(\log_B n + k)
```

Plain-language explanation: first descend to the leaf where the range begins, then scan the `k` matching records by following leaf links. If discussing page reads, say the scan term is closer to matching leaf entries/pages, not pure CPU comparisons.

Avoid heavy storage-engine math. Keep formulas tied to the visual trace.

## Deterministic Component / Trace / Test Expectations

Future implementation targets:

- `src/components/interactive/bPlusTreeTrace.ts`
- `src/components/interactive/BPlusTreeLookupFigure.tsx`
- `src/components/interactive/BPlusTreeRangeScanDemo.tsx`
- `src/components/interactive/BPlusTreeAnatomyFigure.tsx` for static section figures, if it keeps MDX lighter.

Shared fixture:

- Internal root guide keys: `[30, 60]`
- Leaves:
  - Leaf A: records `[10, 20]`
  - Leaf B: records `[30, 40, 50]`
  - Leaf C: records `[60, 70, 80]`
- Leaf links: A -> B -> C.
- Use values like `10:A`, `20:B`, etc. only at leaf level.
- Separator convention: root `[30, 60]` maps to child intervals `<30`, `30 <= key < 60`, and `>=60`; equality descends right.

Golden point lookup:

- Search `50`.
- Root `[30, 60]`: choose middle child because `30 <= 50 < 60`.
- Leaf B `[30, 40, 50]`: find `50`.
- Page reads: `2`.

Golden separator-equality lookups:

- Search `30`: root `[30, 60]` chooses middle child because equality to `30` goes right; Leaf B `[30, 40, 50]` finds `30`; page reads `2`.
- Search `60`: root `[30, 60]` chooses right child because equality to `60` goes right; Leaf C `[60, 70, 80]` finds `60`; page reads `2`.

Golden range scan:

- Query `[20, 70]`.
- Descend to Leaf A for lower bound `20`.
- Collect `20`, follow A -> B, collect `30, 40, 50`, follow B -> C, collect `60, 70`, stop before `80`.
- Result: `[20, 30, 40, 50, 60, 70]`.

Golden stop-inside-leaf range scan:

- Query `[20, 65]`.
- Descend to Leaf A for lower bound `20`.
- Collect `20`, follow A -> B, collect `30, 40, 50`, follow B -> C, collect `60`, then stop inside Leaf C before `70`.
- Result: `[20, 30, 40, 50, 60]`.

Golden leaf split:

- Start with leaf `[30, 40, 50]`, insert `55`, max leaf capacity `3`.
- After insert, temporary `[30, 40, 50, 55]`.
- Split into `[30, 40]` and `[50, 55]`.
- Copy separator `50` into parent as a guide key.
- Records `50` and `55` remain in leaves.
- Expected after-state: root guide keys `[30, 50, 60]` with four children: Leaf A `[10, 20]`, split-left `[30, 40]`, split-right `[50, 55]`, Leaf C `[60, 70, 80]`.
- Leaf links rewire from `A -> B -> C` to `A -> [30, 40] -> [50, 55] -> C`.

Tests should verify:

- All payload/value data appears only in leaves.
- Internal nodes are marked guide-only.
- Leaf chain order matches sorted record order.
- Point lookup trace and range scan trace match golden output.
- Range scan stops at upper bound and does not include `80`.
- Range scan can stop inside a leaf and not include the next larger key.
- Equality-to-separator lookup follows the documented right-hand convention for `30` and `60`.
- Split trace copies separator into parent without removing the leaf record.
- Split trace verifies parent guide keys, four-child layout, and leaf-link rewiring after the split.

## Accessibility / Mobile Expectations

- Step controls are real buttons with descriptive labels.
- Current operation is announced in text: "Descending to middle child", "Following leaf link", "Stopping before 80".
- Do not rely on color alone to distinguish internal guide keys from leaf records; use labels and shape/text differences.
- Leaf links need arrow labels, not only lines.
- On mobile, render internal tree above leaves, then state/result table below; range results wrap into chips or rows.
- Keep controls sticky only if it does not cover the diagram.
- Reduced-motion mode should replace animated scanning with instant highlight changes per step.

## Graph Placement

Add graph node:

```ts
{
  id: "b-plus-tree",
  label: {
    en: "B+-Tree",
    zh: "B+ 树"
  },
  status: "draft",
  conceptType: "data-structure",
  position: { x: 310, y: 850 }
}
```

Add only the edge from existing/newly added `b-tree`:

```ts
{
  from: "b-tree",
  to: "b-plus-tree",
  type: "motivates",
  reason: {
    en: "B+-trees keep B-tree's shallow page-based search shape, then move records to linked leaves to make range scans efficient.",
    zh: "B+ 树保留 B 树适合页读取的浅层搜索形状，再把记录放到相连的叶子中，让范围扫描更高效。"
  }
}
```

Do not add edges to nonexistent future nodes such as `database-index`, `range-query`, `binary-search-tree`, or `lsm-tree`.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/b-plus-tree/`.
- Chinese frontmatter uses `translationStatus: needs-review`.
- `b-plus-tree` lists `b-tree` as prerequisite.
- Page builds from B-tree and clearly states what changes: values move to leaves, internal nodes guide, leaves are linked.
- Page states the separator/equality convention with intervals `<30`, `30 <= key < 60`, `>=60`, inclusive range bounds, and duplicate keys out of scope.
- Range query behavior is visually and interactively explained.
- Deterministic lookup, range-scan, and leaf-split traces exist and are tested.
- Graph node and localized `b-tree -> b-plus-tree` edge validate.
- No graph edges point to nonexistent nodes.
- The page avoids production database internals and deletion variants.

Validation commands:

- `npm run check`
- `npm run test`
- `npm run build`
