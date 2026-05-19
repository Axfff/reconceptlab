# Precision Node Design

## Node Scope

`precision` is a beginner binary-classification metric node. It answers: when the model predicts the positive class, how often is that prediction actually correct?

In scope:

- Binary precision for one chosen positive class.
- The predicted-positive column of the confusion matrix: `TP` and `FP`.
- The fixture calculation using the existing spam-filter data: `TP = 3`, `FP = 2`, so precision is `3 / 5 = 0.6`.
- Denominator-zero behavior when the model makes no positive predictions.
- Reuse of the `confusion-matrix` fixture and labels wherever practical.

Out of scope:

- Full recall, F1, precision-recall curves, ROC curves, threshold tuning, calibration, multiclass precision, multilabel precision, and cost-sensitive optimization.
- Re-teaching all four confusion-matrix cells. This page only refreshes the cells needed for precision.

## Proposed Frontmatter

English page:

```yaml
id: precision
locale: en
title: Precision
summary: Measure how often positive predictions are actually correct.
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
id: precision
locale: zh
title: 精确率
summary: 衡量模型预测为正类时，有多少次真的预测对了。
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

Do not add `next` links to `recall` or `f1-score` until those pages exist.

## Teaching Arc

1. Hook problem: a spam filter sends predicted spam to quarantine; the user asks whether those alarms can be trusted.
2. First naive idea: reuse overall correctness `7 / 12`, which scores all 12 evaluated emails and rewards the correct `TP + TN` cases.
3. Pain point: precision shifts the denominator from all 12 emails to the 5 predicted-spam emails. The non-alarm cases `e2`, `e4`, `e6`, `e7`, `e8`, `e11`, and `e12` are outside this denominator, even when some of them are useful true negatives or painful missed spam.
4. Core invention: look only at predicted positives. For this fixture, those emails are `e1`, `e3`, `e5`, `e9`, and `e10`.
5. Visual anchors: extract the predicted-positive column, split it into `TP=3` correct spam alarms and `FP=2` false alarms, then turn the split into a fraction.
6. Formal version: precision is `TP / (TP + FP)`.
7. Implementation sketch: compute or reuse confusion-matrix counts, then divide `tp` by `tp + fp` when the denominator is nonzero.
8. Correctness intuition: each predicted-positive example is either a true positive or a false positive, so `TP + FP` exactly counts all positive predictions.
9. Complexity: `O(1)` if counts already exist; `O(n)` time and `O(1)` extra storage if scanning examples directly.
10. Common confusions: precision is not overall accuracy, not recall, not guaranteed defined when there are zero positive predictions, and a high precision model may still miss many real positives.
11. Connections: `confusion-matrix -> precision`; recall asks the complementary actual-positive question and F1 later combines precision and recall.
12. Exercises: identify the denominator, classify one predicted-positive card, compute running precision, and explain the zero-denominator case.

## Vocabulary Scaffolding

- Precision: among positive predictions, the fraction that are correct. Chinese: `精确率（precision）`.
- Positive prediction: the model output says the positive class; here, predicted `spam`. Chinese: `正类预测（positive prediction）`.
- True positive: a positive prediction that is actually positive. Chinese: `真正例（true positive, TP）`.
- False positive: a positive prediction that is actually negative. Chinese: `假正例（false positive, FP）`.
- Denominator: the total number of positive predictions, `TP + FP`. Chinese: `分母（denominator）`.
- Undefined precision: no positive predictions exist, so the trust question has no cases to judge. Chinese: `未定义的精确率（undefined precision）`.

## Section-Level Visual Inventory

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Compact funnel visual: `12 evaluated emails -> 5 quarantined alarms`, with all 12 cards on the left and only predicted-spam cards `e1`, `e3`, `e5`, `e9`, `e10` entering quarantine. Mark the discarded non-alarm cases as `7/12 outside the alarm review`. | Which model decisions are under review, and why are only five in the precision denominator? |
| First naive idea | Side-by-side cards: `accuracy = 7/12` because it scores all evaluated emails and rewards `TP + TN`, versus `spam alarm trust = 3/5` because it scores only predicted positives. Show `TN/FN outside precision: e2, e4, e6, e7, e8, e11, e12`. | Why is accuracy answering a different question? |
| Where it hurts | Highlight false-alarm cards `e3` and `e9` inside the quarantine tray. | Which predicted-spam messages should make us distrust alarms? |
| Core invention | Extracted predicted-positive column from the confusion matrix: `TP=3`, `FP=2`, `TN/FN ignored for this metric`. | Which part of the matrix does precision read? |
| Interactive trace | `PrecisionColumnDemo`: step through only `e1`, `e3`, `e5`, `e9`, `e10`; each step updates trusted alarms, all alarms, and running precision. | How does the fraction grow one alarm at a time? |
| Formal version | Numerator/denominator fraction visual: numerator is the three TP cards, denominator is all five predicted-positive cards. | Why is the denominator `TP + FP`? |
| Edge case | Static no-positive-predictions table: `TP=0`, `FP=0`, denominator `0`, result `undefined / not available`. | Why is undefined different from zero? |
| Implementation sketch | Branch table: `denominator = tp + fp`; if `0`, return `null`; otherwise `tp / denominator`. | What should code do safely? |
| Correctness and invariant | Ledger showing every predicted-positive id is either `TP` or `FP`; `TP + FP = 5`. | How do we know the denominator accounts for all alarms? |
| Complexity | Tiny scan diagram: from examples to four counters, then constant-time division. | What cost is added after confusion-matrix counting? |
| Common confusions | Cards contrasting precision with accuracy; zero denominator; high precision can coexist with missed positives. Include a denominator-boundary visual where precision stays `3/5` while missed-spam cards `e4`, `e8`, and `e12` sit outside the predicted-positive tray. Do not teach recall formally here. | Which interpretations are tempting but wrong? |
| Connections | Graph strip: `confusion-matrix -> precision`; recall and F1 shown as planned follow-ups only when not yet implemented. | Where does this metric sit in the graph? |
| Exercises | Prediction cards using fixture ids and one zero-denominator mini-scenario. | Can the learner compute and interpret precision? |

## Deterministic Fixture And Golden Expectations

Reuse the existing confusion-matrix fixture:

- Positive class: `spam`
- Final counts: `TP=3`, `FP=2`, `TN=4`, `FN=3`
- Predicted-positive examples: `e1`, `e3`, `e5`, `e9`, `e10`
- True-positive predicted-spam examples: `e1`, `e5`, `e10`
- False-positive predicted-spam examples: `e3`, `e9`
- Non-alarm cases outside the precision denominator: `e2`, `e4`, `e6`, `e7`, `e8`, `e11`, `e12`
- Missed-spam examples outside the precision denominator: `e4`, `e8`, `e12`

Naive accuracy contrast:

- Accuracy denominator: all 12 evaluated emails.
- Accuracy numerator: all correct predictions, `TP + TN = 3 + 4 = 7`.
- Accuracy value: `7 / 12`.
- Precision denominator: only the five predicted-spam emails, `TP + FP = 5`.
- Precision numerator: only the correct predicted-spam emails, `TP = 3`.
- Precision value: `3 / 5`.

Golden precision:

$$
\text{precision} = \frac{TP}{TP + FP} = \frac{3}{3 + 2} = \frac{3}{5} = 0.6.
$$

Running predicted-positive trace:

| Step | Example | Cell | Trusted alarms | All alarms | Running precision |
|---:|---|---|---:|---:|---|
| 1 | `e1` | `TP` | 1 | 1 | `1/1 = 1.0` |
| 2 | `e3` | `FP` | 1 | 2 | `1/2 = 0.5` |
| 3 | `e5` | `TP` | 2 | 3 | `2/3 ≈ 0.667` |
| 4 | `e9` | `FP` | 2 | 4 | `2/4 = 0.5` |
| 5 | `e10` | `TP` | 3 | 5 | `3/5 = 0.6` |

Zero-denominator mini-scenario:

- Examples may contain negative predictions only, or counts may be `{ tp: 0, fp: 0, tn: 4, fn: 2 }`.
- `TP + FP = 0`
- Internal `PrecisionResult.value` must be `null`.
- English rendered text: `not available`.
- Chinese rendered text: `不可用`.
- Do not pass the zero-denominator result through a numeric formatting path; it is not `0`, `0.0`, `NaN`, or an empty percent.

## Formula And Notation Plan

Introduce after the quarantine-tray visual:

$$
\text{precision} = \frac{TP}{TP + FP}.
$$

Plain-language explanation: `TP + FP` is every case where the model predicted the positive class.

Fixture calculation:

$$
\text{precision} = \frac{3}{3 + 2} = \frac{3}{5} = 0.6.
$$

Plain-language explanation: out of five spam alarms, three were real spam.

Zero-denominator edge case:

$$
TP + FP = 0.
$$

Plain-language explanation: the model made no positive predictions, so there are no alarms whose trustworthiness can be measured.

Rendered convention:

- Internal state: `value: null`.
- English copy: `not available`.
- Chinese copy: `不可用`.
- Formatting rule: branch on `value === null` before calling any decimal, percent, or fraction formatter.

## Component And State Model

Implementation targets:

```text
src/components/interactive/precisionTrace.ts
src/components/interactive/PrecisionScenarioFigure.tsx
src/components/interactive/PrecisionColumnDemo.tsx
tests/precision-trace.test.ts
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
type PrecisionResult = {
  numerator: number;
  denominator: number;
  value: number | null;
};

type PrecisionTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: "tp" | "fp";
  trustedAlarms: number;
  allAlarms: number;
  value: number;
};
```

Required helper behavior:

- `predictedPositiveExamples(examples, positiveLabel)` returns only examples whose prediction equals the positive label.
- `precisionFromCounts(counts)` returns `{ numerator: tp, denominator: tp + fp, value }` and uses `null` when denominator is `0`.
- `buildPrecisionTrace(examples, positiveLabel)` steps through predicted-positive examples only and stores the full `ConfusionMatrixExample` on each trace step, not just the id.
- The trace must preserve fixture order: `e1`, `e3`, `e5`, `e9`, `e10`.

Interactive controls:

- `Previous`, `Next`, `Reset`, optional `Play/Pause`.
- Current step must show id, subject, actual label, prediction, cell (`TP` or `FP`), running numerator/denominator, and value.
- Use `aria-live="polite"` for the current interpretation.
- Include a static trace ledger or server-rendered table as a no-JS fallback.

## Accessibility And Mobile Requirements

- Use semantic tables for trace ledgers and denominator breakdowns.
- Do not rely on color alone; each state must include text labels such as `TP`, `FP`, `correct alarm`, and `false alarm`.
- Buttons need descriptive text and visible focus states.
- On mobile, stack the quarantine tray, running fraction, controls, and ledger.
- Ensure `2/3 ≈ 0.667` and Chinese labels wrap without horizontal overflow.

## Implementation Sketch

```ts
function precisionFromCounts(counts) {
  const denominator = counts.tp + counts.fp;
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

Correctness intuition: after the confusion matrix is counted, the predicate `prediction === positiveLabel` selects exactly two cells, `TP` and `FP`. Therefore the denominator is exactly the number of positive predictions, and the numerator is the correct subset of those predictions.

## Graph Placement

Add `precision` near `confusion-matrix`:

```ts
{
  id: "precision",
  label: {
    en: "Precision",
    zh: "精确率"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 310, y: 650 }
}
```

Add one graph edge:

```ts
{
  from: "confusion-matrix",
  to: "precision",
  type: "uses",
  reason: {
    en: "Precision uses the predicted-positive part of the confusion matrix to ask how many positive predictions were correct.",
    zh: "精确率使用混淆矩阵中预测为正类的部分，询问正类预测里有多少是真的。"
  }
}
```

Do not add edges to `recall` or `f1-score` until those nodes exist.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/precision/`.
- Chinese page uses `translationStatus: needs-review`.
- Page has `confusion-matrix` as a prerequisite and does not link to missing future nodes.
- Page teaches binary precision only.
- Visuals focus on predicted positives and avoid reteaching the full confusion matrix.
- Fixture result is `3/5 = 0.6`.
- Zero denominator is represented as undefined/not available, not `0`.
- Focused trace tests cover predicted-positive ids, golden precision, running trace values, zero denominator, and localized labels.
- Graph/content validation has no dangling endpoint or missing-prerequisite errors.

Validation commands:

```bash
npm run check
npm run test
npm run build
```
