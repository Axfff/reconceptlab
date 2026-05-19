# Recall Node Design

## Node Scope

`recall` is a beginner binary-classification metric node. It answers: of all real positives, how many did the model find?

In scope:

- Binary recall for one chosen positive class.
- The actual-positive row of the confusion matrix: `TP` and `FN`.
- The fixture calculation using the existing spam-filter data: `TP = 3`, `FN = 3`, so recall is `3 / 6 = 0.5`.
- Denominator-zero behavior when an evaluation set has no actual positives.
- An optional brief contrast with precision as the predicted-positive denominator metric, only after recall's own question is established.

Out of scope:

- Multiclass recall, macro/micro averaging, F1, ROC curves, precision-recall curves, threshold tuning, ranking, calibration, and cost-sensitive model selection.
- Re-teaching all four confusion-matrix cells. This page refreshes only the cells needed for recall.

## Proposed Frontmatter

English page:

```yaml
id: recall
locale: en
title: Recall
summary: Measure how much of the actual positive class the model found.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites:
  - confusion-matrix
next: []
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

Chinese page:

```yaml
id: recall
locale: zh
title: 召回率
summary: 衡量真实正类中有多少被模型找到了。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites:
  - confusion-matrix
next: []
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

Do not add `precision` as a prerequisite; recall only needs confusion-matrix counts. Precision may be mentioned as an optional contrast because it already exists, but the page must make sense without visiting precision first.

## Teaching Arc

1. Hook problem: a spam filter lets some mail through, so the learner asks how many real spam emails were caught.
2. First naive idea: use overall accuracy `7 / 12` from the confusion-matrix counts.
3. Pain point: accuracy rewards true negatives, so it can look better without answering coverage of real spam.
4. Core invention: restrict the denominator to actual positives: `TP + FN`.
5. Visual anchors: pull the actual-spam row from the same confusion matrix and split it into caught spam `TP=3` and missed spam `FN=3`. State the convention locally: rows are actual labels; columns are predictions. Recall reads the actual-positive row: `TP + FN`.
6. Formal version: recall is `TP / (TP + FN)`.
7. Implementation sketch: compute or reuse confusion-matrix counts, then divide `tp` by `tp + fn` when the denominator is nonzero.
8. Correctness intuition: every actual-positive example is either caught (`TP`) or missed (`FN`), so `TP + FN` exactly counts all real positives.
9. Complexity: `O(1)` if counts already exist; `O(n)` time and `O(1)` extra storage if scanning examples directly.
10. Common confusions: recall is not accuracy, not the raw number of caught positives, and undefined is not zero. Optionally contrast with another metric such as precision, if the learner has seen it.
11. Connections: `confusion-matrix -> recall`; optional `precision -> recall` as `contrasts` only, judging positive predictions rather than actual positives.
12. Exercises: identify the denominator, classify one actual-spam card, compute running recall, and explain the zero-denominator case.

## Vocabulary Scaffolding

- Recall: among actual positives, the fraction the model caught. Chinese: `召回率（recall）`.
- Actual positive: the true label is the positive class; here, actually `spam`. Chinese: `真实正类（actual positive）`.
- True positive: an actual positive predicted as positive. Chinese: `真正例（true positive, TP）`.
- False negative: an actual positive predicted as negative. Chinese: `假负例（false negative, FN）`.
- Denominator: all actual positives, `TP + FN`. Chinese: `分母（denominator）`.
- Undefined recall: no actual positives exist in the evaluation set, so there is no real-positive group to measure. Chinese: `未定义的召回率（undefined recall）`.

## Section-Level Visual Inventory

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Filter visual: `12 evaluated emails -> 6 actual-spam emails`, with actual spam ids `e1`, `e4`, `e5`, `e8`, `e10`, `e12`. | Which real cases should the model have found? |
| First naive idea | Side-by-side cards: `accuracy = 7/12` and `recall = ?`; mark true negatives as outside recall's denominator. | Why does accuracy answer a different question? |
| Where it hurts | Highlight missed-spam cards `e4`, `e8`, `e12` as actual spam that escaped. | Which cases should make us worry about coverage? |
| Core invention | Extracted actual-positive row from the confusion matrix: `TP=3`, `FN=3`, `FP/TN ignored for this metric`. Put the convention beside the row: rows are actual labels; columns are predictions. Recall reads the actual-positive row: `TP + FN`. | Which part of the matrix does recall read? |
| Interactive trace | `RecallRowDemo`: step through only `e1`, `e4`, `e5`, `e8`, `e10`, `e12`; each step updates caught spam, all real spam seen, and running recall. | How does coverage grow one real positive at a time? |
| Formal version | Numerator/denominator fraction visual: numerator is the three TP cards, denominator is all six actual-spam cards. | Why is the denominator `TP + FN`? |
| Edge case | Static no-actual-positives table: `TP=0`, `FN=0`, denominator `0`, result `undefined / not available`. | Why is undefined different from zero? |
| Implementation sketch | Branch table: `denominator = tp + fn`; if `0`, return `null`; otherwise `tp / denominator`. | What should code do safely? |
| Correctness and invariant | Ledger showing every actual-spam id is either `TP` or `FN`; `TP + FN = 6`. | How do we know the denominator accounts for all real positives? |
| Complexity | Tiny scan diagram: from examples to four counters, then constant-time division. | What cost is added after confusion-matrix counting? |
| Common confusions | Cards contrasting recall with accuracy; zero denominator; raw count versus fraction. Optional precision contrast card may appear after recall's denominator is clear. | Which interpretations are tempting but wrong? |
| Connections | Graph strip: `confusion-matrix -> recall`, with optional `precision -> recall` as `contrasts` only. F1 remains a planned follow-up until implemented. | Where does this metric sit in the graph? |
| Exercises | Prediction cards using fixture ids and one zero-denominator mini-scenario. | Can the learner compute and interpret recall? |

## Deterministic Fixture And Golden Expectations

Reuse the existing confusion-matrix fixture:

- Positive class: `spam`
- Final counts: `TP=3`, `FP=2`, `TN=4`, `FN=3`
- Actual-positive examples: `e1`, `e4`, `e5`, `e8`, `e10`, `e12`
- True-positive actual-spam examples: `e1`, `e5`, `e10`
- False-negative missed-spam examples: `e4`, `e8`, `e12`
- Outside recall denominator: `e2`, `e3`, `e6`, `e7`, `e9`, `e11`

Golden recall:

$$
\text{recall} = \frac{TP}{TP + FN} = \frac{3}{3 + 3} = \frac{3}{6} = 0.5.
$$

Running actual-positive trace:

| Step | Example | Cell | Caught positives | Actual positives seen | Running recall |
|---:|---|---|---:|---:|---|
| 1 | `e1` | `TP` | 1 | 1 | `1/1 = 1.0` |
| 2 | `e4` | `FN` | 1 | 2 | `1/2 = 0.5` |
| 3 | `e5` | `TP` | 2 | 3 | `2/3 ≈ 0.667` |
| 4 | `e8` | `FN` | 2 | 4 | `2/4 = 0.5` |
| 5 | `e10` | `TP` | 3 | 5 | `3/5 = 0.6` |
| 6 | `e12` | `FN` | 3 | 6 | `3/6 = 0.5` |

Zero-denominator mini-scenario:

- Examples may contain only actual negatives, or counts may be `{ tp: 0, fn: 0, fp: 2, tn: 4 }`.
- `TP + FN = 0`
- Internal `RecallResult.value` must be `null`.
- English rendered text: `not available`.
- Chinese rendered text: `不可用`.
- Do not format the result as `0`, `NaN`, or an empty percent.

## Formula And Notation Plan

Introduce after the actual-spam row visual:

$$
\text{recall} = \frac{TP}{TP + FN}.
$$

Plain-language explanation: `TP + FN` is every real positive case, whether the model caught it or missed it.

Fixture calculation:

$$
\text{recall} = \frac{3}{3 + 3} = \frac{3}{6} = 0.5.
$$

Plain-language explanation: out of six real spam emails, the model caught three.

Zero-denominator edge case:

$$
TP + FN = 0.
$$

Plain-language explanation: if the evaluation set has no real positives, there is no “of all real spam” group to measure.

Rendered convention:

- Internal state: `value: null`.
- English copy: `not available`.
- Chinese copy: `不可用`.
- Formatting rule: branch on `value === null` before calling any decimal, percent, or fraction formatter.

## Component And State Model

Implementation targets:

```text
src/components/interactive/recallTrace.ts
src/components/interactive/RecallScenarioFigure.tsx
src/components/interactive/RecallRowDemo.tsx
tests/recall-trace.test.ts
```

Reuse imports from `confusionMatrixTrace.ts` where practical:

- `confusionMatrixExamples`
- `classifyExample`
- `countMatrix`
- `finalCounts`
- `positiveLabel`
- `labelForCell`

Suggested helpers:

```ts
type RecallResult = {
  numerator: number;
  denominator: number;
  value: number | null;
};

type RecallTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: "tp" | "fn";
  caughtPositives: number;
  actualPositivesSeen: number;
  value: number;
};
```

Required helper behavior:

- `actualPositiveExamples(examples, positiveLabel)` returns only examples whose actual label equals the positive label.
- `recallFromCounts(counts)` returns `{ numerator: tp, denominator: tp + fn, value }` and uses `null` when denominator is `0`.
- `buildRecallTrace(examples, positiveLabel)` steps through actual-positive examples only and stores the full `ConfusionMatrixExample` on each trace step.
- The trace must preserve fixture order: `e1`, `e4`, `e5`, `e8`, `e10`, `e12`.

Interactive controls:

- `Previous`, `Next`, `Reset`, optional `Play/Pause`.
- Current step must show id, subject, actual label, prediction, cell (`TP` or `FN`), running numerator/denominator, and value.
- Use `aria-live="polite"` for the current interpretation.
- Include a static trace ledger or server-rendered table as a no-JS fallback.

## Accessibility And Mobile Requirements

- Use semantic tables for trace ledgers and denominator breakdowns.
- Do not rely on color alone; each state must include text labels such as `TP`, `FN`, `caught spam`, and `missed spam`.
- Buttons need descriptive text and visible focus states.
- On mobile, stack the actual-spam row, running fraction, controls, and ledger.
- Ensure `2/3 ≈ 0.667` and Chinese labels wrap without horizontal overflow.

## Implementation Sketch

```ts
function recallFromCounts(counts) {
  const denominator = counts.tp + counts.fn;
  if (denominator === 0) {
    return { numerator: counts.tp, denominator, value: null };
  }
  return {
    numerator: counts.tp,
    denominator,
    value: counts.tp / denominator
  };
}
```

Correctness intuition: after the confusion matrix is counted, the predicate `actual === positiveLabel` selects exactly two cells, `TP` and `FN`. Therefore the denominator is exactly the number of actual positives, and the numerator is the caught subset of those positives.

## Graph Placement

Add `recall` near `precision`:

```ts
{
  id: "recall",
  label: {
    en: "Recall",
    zh: "召回率"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 530, y: 650 }
}
```

Add this graph edge:

```ts
{
  from: "confusion-matrix",
  to: "recall",
  type: "uses",
  reason: {
    en: "Recall uses the actual-positive part of the confusion matrix to ask how many real positives the model found.",
    zh: "召回率使用混淆矩阵中真实为正类的部分，询问真实正类里有多少被模型找到了。"
  }
}
```

Optional if the implementation includes a local contrast strip and wants graph support. Keep this edge `contrasts` only; do not add `precision` to recall's `prerequisites` or make precision required reading.

```ts
{
  from: "precision",
  to: "recall",
  type: "contrasts",
  reason: {
    en: "Precision judges positive predictions, while recall judges coverage of actual positives.",
    zh: "精确率评估正类预测有多可信，而召回率评估真实正类被找回了多少。"
  }
}
```

Do not add edges to `f1-score` until that node exists.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/recall/`.
- Chinese page uses `translationStatus: needs-review`.
- Page has `confusion-matrix` as a prerequisite and does not link to missing future nodes.
- Page teaches binary recall only.
- Visuals focus on actual positives and avoid reteaching the full confusion matrix.
- Fixture result is `3/6 = 0.5`.
- Zero denominator is represented as undefined/not available, not `0`.
- Focused trace tests cover actual-positive ids, golden recall, running trace values, zero denominator, and localized labels.
- Graph/content validation has no dangling endpoint or missing-prerequisite errors.

Validation commands:

```bash
npm run check
npm run test
npm run build
```
