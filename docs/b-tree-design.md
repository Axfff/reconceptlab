# B-Tree Node Design

## Node Scope

Node id: `b-tree`

`b-tree` is a beginner/intermediate data-structure node about keeping sorted data shallow when reads happen in large blocks, such as disk pages or database/index pages.

Teaching convention: keys in this B-tree carry the record/value or a pointer to it. An internal key such as `10` is therefore a successful search result, not only a separator. This makes the later B+-tree contrast explicit: B+-tree internal keys guide search only, while records/values live in leaves.

In scope:

- Why sorted arrays and ordinary binary search trees become painful when storage is page/block based.
- B-tree as a multiway balanced search tree that stores many sorted keys per node.
- Search and insertion at a conceptual level.
- Node split during insertion, including split promotion to the parent.
- Minimum degree `t` as the primary convention.
- Core invariants: sorted keys inside each node, child ranges, bounded node occupancy, and all leaves at the same depth.
- Page-read intuition: fewer levels usually means fewer page reads.

Out of scope:

- Full deletion algorithm and deletion variants.
- B* trees, B-link trees, cache-oblivious trees, concurrency, recovery, latches, or database transaction details.
- Real storage-engine page formats.
- Performance tuning for actual disks/SSDs.
- Comparison to B+-trees beyond a short connection teaser.

## Proposed Frontmatter

English page:

```yaml
id: b-tree
locale: en
title: B-Tree
summary: Keep sorted keys searchable with a shallow multiway tree whose nodes hold many keys at once.
status: draft
translationStatus: source
difficulty: intermediate
conceptType: data-structure
tags:
  - data-structures
  - trees
  - storage
  - indexing
prerequisites: []
next:
  - b-plus-tree
createdAt: 2026-05-19
updatedAt: 2026-05-19
```

Chinese page:

```yaml
id: b-tree
locale: zh
title: B 树
summary: 用每个节点保存多个有序键的多路平衡树，让排序数据的查找保持很浅。
status: draft
translationStatus: needs-review
difficulty: intermediate
conceptType: data-structure
tags:
  - data-structures
  - trees
  - storage
  - indexing
prerequisites: []
next:
  - b-plus-tree
createdAt: 2026-05-19
updatedAt: 2026-05-19
```

## Beginner Teaching Arc

1. Hook problem: store a large sorted catalog on pages. Reading one page is expensive, so the learner wants fewer page reads.
2. Naive sorted array: binary search is good, but inserting one key can shift many records across pages.
3. Naive binary search tree: insertion is local, but one key per node makes the tree tall, so page reads pile up.
4. Core invention: put many sorted keys in one node and use them as dividers between many child pointers.
5. Pain repair: when a node becomes too full, split it and promote the middle key upward.
6. Formal version: define minimum degree `t`, key bounds, child bounds, and leaf-depth invariant.
7. Implementation sketch: search within a node, choose child range, insert into leaf, split full child before descending.
8. Correctness intuition: sorted divider keys preserve search ranges; splitting keeps occupancy bounded without breaking order.
9. Complexity: height is logarithmic in number of keys with a large branching factor; page reads track height more closely than raw comparisons.
10. Common confusions: B-tree vs binary tree, order vs minimum degree, promoted key vs copied key, page reads vs CPU comparisons, insertion vs deletion.
11. Connections: B+-tree changes where records live and links leaves for range scans.
12. Exercises: predict the child range, identify an overfull node, perform one split, estimate height/page reads.

## Vocabulary Scaffolding

- Page/block: a chunk of storage read together. Chinese: `页/块（page/block）`.
- Key: the sorted value used for searching; in this teaching B-tree, the key carries its record/value or a pointer to it even when the key is in an internal node. Chinese: `键（key）`.
- Child pointer: a link from one node to a range of smaller/larger keys. Chinese: `子指针（child pointer）`.
- Multiway tree: a tree node can have more than two children. Chinese: `多路树（multiway tree）`.
- Minimum degree: the parameter `t` controlling how empty/full nodes may be. Chinese: `最小度数（minimum degree）`.
- Split: divide an overfull node and move the middle key up. Chinese: `分裂（split）`.
- Height-balanced: all leaves appear at the same depth. Chinese: `高度平衡（height-balanced）`.

Inline prerequisite scaffolding before the naive alternatives:

- Sorted array: values are stored in increasing order in a contiguous sequence. Tiny local figure: `[5 | 10 | 20 | 30]` spread across page boxes, with an insertion arrow showing shifts.
- Binary search tree: each node has at most two children, with smaller keys left and larger keys right. Tiny local figure: one-key nodes forming a search path with page-read badges.
- Page/block I/O: storage is read in chunks rather than one key at a time. Tiny local figure: a page box containing several keys and one "read page" badge.

## Section-Level Visual / Interactive Inventory

| Section | Visual support | Learner question answered |
|---|---|---|
| Hook problem | Static page-read scene: a sorted catalog spread over page boxes, with one highlighted page read at a time. | Why do we care about reading fewer nodes/pages? |
| Sorted array pain | Before/after page strip inserting `35` into sorted pages; arrows show shifted keys crossing page boundaries. | Why is search good but insertion painful? |
| Binary tree pain | Side-by-side: one-key BST path of height 5 versus one B-tree node holding several keys. Count page-read badges on the search path. | Why does one key per node waste page reads? |
| Core invention | Static B-tree node anatomy: keys `[20 | 40 | 60]` with four child-range slots `<20`, `20..40`, `40..60`, `>60`. | How can several keys guide more than two branches? |
| Search walk | Micro-widget `BTreeSearchFigure`: step through searching for `17`; highlights current node, in-node comparison slot, chosen child range, and page-read count. Include edge-case presets for internal hit `10` and missing key `13`. Controls: step, reset. | How does search move from page to page, and when can it stop early? |
| Minimum degree | Compact occupancy ruler for `t = 2`: min keys, max keys, child counts, root exception. | What does `t` actually control? |
| Insertion before split | Trace-linked figure inserting `30` into a leaf that still has room. | What is the easy insertion case? |
| Split repair | Interactive `BTreeSplitDemo`: insert `6` into a full root leaf, split `[5, 10, 20]`, promote `10`, and insert into the left child. Controls: previous, next, reset. | Why does the middle key move upward? |
| Root split | Static before/after showing root overflow making the tree one level taller. | How can a balanced tree grow upward? |
| Formal invariants | Checklist diagram next to the same tree: sorted keys, child ranges, occupancy bounds, all leaves same depth. | What must stay true after operations? |
| Implementation sketch | Pseudocode panel paired with mini trace: `splitChild(parent, i)` then descend, including insertion `17` splitting full child `[12, 20, 30]` before descent. | Why split before descending in common insertion code? |
| Complexity | Height estimate figure: branching factor as wide doors; compare rough levels for binary tree vs B-tree. | Why does high fanout reduce page reads? |
| Common confusions | Four small cards using the same fixture: binary vs B-tree, `t` vs order, split promotion, search comparisons vs page reads. | What terms are easy to mix up? |
| Connections | Local graph snippet: `b-tree -> b-plus-tree`. | What does B+-tree change next? |
| Exercises | Prediction cards: choose child, mark legal node occupancy, perform one split, count page reads. | Can the learner apply the invariants? |

## Formula / Notation Plan

Use formulas sparingly and always pair with plain language.

- `$t$`: minimum degree.
- `$h$`: tree height, counted as the number of page levels on a root-to-leaf path.
- `$n$`: number of keys/records stored in the tree.
- `$2t - 1$`: maximum keys in a node.
- `$t - 1$`: minimum keys in a non-root node.
- `$2t$`: maximum children in an internal node.
- `$k + 1$`: number of children for an internal node with `k` keys.

Display near the formal section:

```tex
t - 1 \le k \le 2t - 1
```

Plain-language explanation: except for the root, each node keeps at least `t - 1` keys and at most `2t - 1` keys, so nodes are neither almost empty nor overflowing.

Display near complexity:

```tex
h = O(\log_t n)
```

Plain-language explanation: height grows logarithmically, but the base is related to the tree's fanout; bigger nodes mean fewer levels and usually fewer page reads.

Convention guardrail: this page uses CLRS-style minimum degree `t`. Some texts use "order" to mean maximum children. The page may mention this once, but should not use both conventions in examples.

## Deterministic Component / Trace / Test Expectations

Future implementation targets:

- `src/components/interactive/bTreeTrace.ts`
- `src/components/interactive/BTreeSearchFigure.tsx`
- `src/components/interactive/BTreeSplitDemo.tsx`
- `src/components/interactive/BTreeNodeFigure.tsx` for static section figures, if it keeps the MDX lighter.

Shared fixture:

- Use minimum degree `t = 2` so non-root nodes hold `1..3` keys and the root can be smaller.
- Insert sequence for trace: `[10, 20, 5, 6, 12, 30, 7, 17]`.
- Golden final CLRS-style B-tree shape for `t = 2` after the sequence:
  - Root keys: `[10, 20]`
  - Children: `[5, 6, 7]`, `[12, 17]`, `[30]`

Golden search trace:

- Search `17`.
- Visit root `[10, 20]`, choose middle child because `10 < 17 < 20`.
- Visit leaf `[12, 17]`, find `17`.
- Page reads: `2`.

Additional search edge cases:

- Search `10`: visit root `[10, 20]`, find `10` in the internal root, return its associated record/value pointer, page reads `1`.
- Search `13`: visit root `[10, 20]`, choose middle child because `10 < 13 < 20`; visit leaf `[12, 17]`, determine `13` is absent, page reads `2`, found status `false`.

Golden split trace:

- Before inserting `6`, root leaf `[5, 10, 20]` is full.
- Split root: promoted `10`, left `[5]`, right `[20]`.
- Insert `6` into left leaf, producing `[5, 6]`.

Golden non-root split-before-descent trace:

- Build the trace through `[10, 20, 5, 6, 12, 30, 7]`: root `[10]`, left `[5, 6, 7]`, right `[12, 20, 30]`.
- Insert `17`: before descending right, split full child `[12, 20, 30]`.
- Promote `20` into the root, producing root `[10, 20]` with children `[5, 6, 7]`, `[12]`, `[30]`.
- Descend into middle child and insert `17`, producing `[12, 17]`.

Tests should verify:

- Trace steps are deterministic.
- Final tree shape matches golden keys/children.
- Every node respects max key count.
- All leaves have the same depth.
- Search trace returns page-read count and found/not-found status.
- Search trace covers internal-node hit `10` and leaf not-found `13`.
- Split trace covers root split and non-root split-before-descent for insertion `17`.
- Components expose accessible labels for controls and current state.

## Accessibility / Mobile Expectations

- Use semantic buttons for step/reset controls.
- Current state must be described in text, not color alone.
- Highlighted keys need text labels such as "current key", "promoted key", and "chosen child range".
- Keyboard users can step through traces.
- Respect reduced motion: no required animation for understanding.
- On mobile, stack tree figure above state table and controls; avoid horizontal overflow for node diagrams.
- Use compact labels and wrap long Chinese captions cleanly.
- Ensure focus styles are visible.

## Graph Placement

Add graph node:

```ts
{
  id: "b-tree",
  label: {
    en: "B-Tree",
    zh: "B 树"
  },
  status: "draft",
  conceptType: "data-structure",
  position: { x: 90, y: 850 }
}
```

When `b-plus-tree` is added in the same change, add:

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

Do not add edges from nonexistent future nodes such as `binary-search-tree`, `sorted-array`, `database-index`, or `external-memory`.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/b-tree/`.
- Chinese frontmatter uses `translationStatus: needs-review`.
- Page follows progressive reinvention: page-read problem -> sorted array/BST pain -> multi-key node -> split repair -> formal invariants.
- Page gives one-sentence inline definitions plus tiny local figures for sorted arrays, binary search trees, and page/block I/O before relying on them as naive alternatives.
- Page states that B-tree keys carry records/values or pointers in this teaching convention, including keys found in internal nodes.
- Visuals are distributed across sections, not concentrated in one demo.
- The page defines minimum degree `t` clearly and avoids deep deletion variants.
- Deterministic B-tree trace data powers figures and tests.
- Graph node exists and validates.
- If B+-tree is implemented simultaneously, `b-tree -> b-plus-tree` edge exists with localized reason.
- No graph edges point to nonexistent nodes.

Validation commands:

- `npm run check`
- `npm run test`
- `npm run build`
