# F1 Score Node Design

## Node Scope

`f1-score` is a beginner binary-classification metric node. It explains F1 as a single balance score built from precision and recall.

In scope:

- Binary F1 for one chosen positive class.
- Combining already-defined precision and recall.
- Harmonic-mean intuition: the smaller side pulls the score down.
- Fixture-based calculation from existing counts: `TP=3`, `FP=2`, `FN=3`, `TN=4`.
- Fixture precision `P = 3/5 = 0.6`, recall `R = 3/6 = 0.5`, and F1 `6/11 ≈ 0.545`.
- Equivalent count form `2TP / (2TP + FP + FN)`.
- Unavailable behavior when a required source metric is unavailable, or when the count-form denominator `2TP + FP + FN = 0` shows no positive-side evidence at all.

Out of scope:

- F-beta score.
- Macro, micro, or weighted averaging.
- Multiclass or multilabel F1.
- Threshold tuning, precision-recall curves, ROC curves, ranking metrics, and calibration.
- Advanced harmonic-mean derivations.
- Re-teaching confusion matrix, precision, or recall from scratch.

## Proposed Frontmatter

English page:

```yaml
id: f1-score
locale: en
title: F1 Score
summary: Combine precision and recall into one balance score that drops when either side is weak.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites:
  - precision
  - recall
next: []
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

Chinese page:

```yaml
id: f1-score
locale: zh
title: F1 分数
summary: 将精确率和召回率合成一个平衡分数；任一侧偏低都会把分数拉低。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites:
  - precision
  - recall
next: []
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

Do not include `confusion-matrix` as a direct prerequisite. It is upstream through `precision` and `recall`, and this page may mention it inline as the source of `TP`, `FP`, and `FN`.

## Teaching Arc

1. Hook problem: the spam filter has two reports, `P=0.6` and `R=0.5`, and the learner wants one quick balance score.
2. First naive idea: average them normally: `(0.6 + 0.5) / 2 = 0.55`.
3. Pain point: a normal average can be too forgiving when one side is weak. For example, `P=1.0`, `R=0.1` gives arithmetic mean `0.55`, even though coverage is poor.
4. Core invention: use a harmonic mean so both sides must be strong; F1 stays closer to the smaller metric.
5. Visual anchors: precision and recall become two bars feeding a shared balance meter, with the lower bar visibly limiting the result.
6. Formal version: define `P`, `R`, and `F_1 = 2PR / (P + R)`.
7. Implementation sketch: compute precision and recall from counts, branch on unavailable values, then compute F1; also support the count form directly from `TP`, `FP`, and `FN`.
8. Correctness intuition: `FP` hurts precision, `FN` hurts recall, and F1 goes high only when both questions are strong.
9. Complexity: `O(1)` from counts; `O(n)` if counts must be scanned from examples.
10. Common confusions: F1 is not accuracy, ignores `TN`, unavailable is not zero, and high F1 requires both precision and recall.
11. Connections: `precision -> f1-score` and `recall -> f1-score`.
12. Exercises: compute fixture F1, compare arithmetic mean and F1 in an imbalanced case, and predict whether adding an `FP` or `FN` lowers F1.

## Vocabulary Scaffolding

- F1 score: the harmonic mean of precision and recall. Chinese: `F1 分数（F1 score）`.
- Precision `P`: trust of positive predictions. Chinese: `精确率 P（precision）`.
- Recall `R`: coverage of actual positives. Chinese: `召回率 R（recall）`.
- Harmonic mean: an average that penalizes imbalance more than arithmetic mean. Chinese: `调和平均（harmonic mean）`.
- Unavailable F1: F1 cannot be computed when one required source metric is unavailable, or when `2TP + FP + FN = 0` means there is no positive-side evidence at all. Chinese: `不可用的 F1（unavailable F1）`.

## Section-Level Visual Inventory

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Three metric cards: precision tray `3/5 = 0.6`, recall row `3/6 = 0.5`, and an empty balanced-score slot. | What two reports are we trying to combine? |
| First naive idea | Arithmetic mean card: `(0.6 + 0.5) / 2 = 0.55`. | Why does a normal average seem natural? |
| Where it hurts | Extreme mini-case: `P=1.0`, `R=0.1`; arithmetic mean `0.55`, F1 about `0.182`, with a visual marker near the low side. | Why can a normal average hide a weak side? |
| Core invention | Harmonic-balance figure with bars for `P=0.6`, `R=0.5`, and F1 marker at `6/11 ≈ 0.545`. | How does F1 stay closer to the smaller metric? |
| Interactive demo | `F1BalanceDemo` with presets for fixture, high precision/low recall, low precision/high recall, both strong, no positive-side evidence, and errors with no true positives. Shows arithmetic mean, F1, and a text explanation. | How does F1 react when one side changes? |
| Formal version | Formula block plus count-form fraction using `TP=3`, `FP=2`, `FN=3`. | How do the metric and count formulas agree? |
| Edge cases | Branch table: unavailable source metric, no positive-side evidence, and `TP=0` with `FP` or `FN` present. Only the first two render `not available` / `不可用`; error-only positive-side evidence renders F1 as `0`. | Why is unavailable different from zero? |
| Implementation sketch | Code/table from counts -> precision/recall -> F1, and count-form shortcut. | What should code compute safely? |
| Correctness intuition | Static panel: `FP` lowers precision, `FN` lowers recall, both lower F1; `TN` is absent from the formula. | Why does F1 care about these three counts and not `TN`? |
| Complexity | Tiny count-source diagram: examples -> confusion counts -> precision/recall -> F1. | What does it cost once counts exist? |
| Common confusions | Cards for F1 is not accuracy, F1 ignores `TN`, high F1 requires both `P` and `R`, unavailable is not zero. | Which interpretations are tempting but wrong? |
| Connections | Graph strip: `precision -> f1-score` and `recall -> f1-score`. | Where does this node sit in the metrics cluster? |
| Exercises | Fixture computation, imbalanced preset comparison, add-one-`FP` and add-one-`FN` predictions. | Can the learner use and interpret F1? |

## Deterministic Fixture And Golden Expectations

Reuse the existing metric fixture:

- `TP = 3`
- `FP = 2`
- `FN = 3`
- `TN = 4`
- Precision `P = 3 / 5 = 0.6`
- Recall `R = 3 / 6 = 0.5`

Golden F1:

$$
F_1 = \frac{2PR}{P + R}
= \frac{2 \cdot 0.6 \cdot 0.5}{0.6 + 0.5}
= \frac{6}{11}
\approx 0.545.
$$

Equivalent count form:

$$
F_1 = \frac{2TP}{2TP + FP + FN}
= \frac{6}{6 + 2 + 3}
= \frac{6}{11}.
$$

Preset expectations:

| Preset | Precision | Recall | Arithmetic mean | F1 |
|---|---:|---:|---:|---:|
| fixture | `0.6` | `0.5` | `0.55` | `6/11 ≈ 0.545` |
| high precision, low recall | `1.0` | `0.1` | `0.55` | `0.1818...` |
| low precision, high recall | `0.1` | `1.0` | `0.55` | `0.1818...` |
| both strong | `0.9` | `0.9` | `0.9` | `0.9` |
| no positive-side evidence | `null` | `null` | `not available` | `not available` |
| errors but no true positives | `0` | `0` | `0` | `0` |

Count sensitivity:

- Adding one `FP` changes counts to `TP=3`, `FP=3`, `FN=3`; F1 becomes `6 / (6 + 3 + 3) = 0.5`.
- Adding one `FN` changes counts to `TP=3`, `FP=2`, `FN=4`; F1 becomes `6 / (6 + 2 + 4) = 0.5`.
- Adding one `TN` changes `TN` only and does not affect F1.

## Formula And Notation Plan

Introduce after the balance visual:

$$
F_1 = \frac{2PR}{P + R}.
$$

Plain-language explanation: F1 is the balance score for precision `P` and recall `R`; if either side is low, the result stays low.

Fixture calculation:

$$
F_1 = \frac{2 \cdot 0.6 \cdot 0.5}{0.6 + 0.5}
= \frac{6}{11}
\approx 0.545.
$$

Count form:

$$
F_1 = \frac{2TP}{2TP + FP + FN}.
$$

Plain-language explanation: this version computes the same score directly from the confusion-matrix counts that feed precision and recall. For fixture and ordinary cases where precision and recall are defined and `P + R > 0`, it agrees with the metric formula; edge cases follow the branch table and count denominator convention below.

Edge cases:

- In metric form, if required precision or recall input is unavailable, F1 is unavailable.
- In metric form, defined `P = 0` and `R = 0` means F1 is `0`, not unavailable.
- In count form, if `2TP + FP + FN = 0`, there is no positive-side evidence at all and F1 is unavailable.
- In count form, if `TP = 0` but `FP > 0` or `FN > 0`, F1 is `0`, not unavailable.

Rendered convention:

- Internal state: `value: null`.
- English copy: `not available`.
- Chinese copy: `不可用`.
- Formatting rule: branch on `value === null` before decimal or percent formatting.

## Component And State Model

Implementation targets:

```text
src/components/interactive/f1ScoreTrace.ts
src/components/interactive/F1ScenarioFigure.tsx
src/components/interactive/F1BalanceDemo.tsx
tests/f1-score-trace.test.ts
```

Reuse imports where practical:

- `finalCounts` and `MatrixCounts` from `confusionMatrixTrace.ts`
- `precisionFromCounts` from `precisionTrace.ts`
- `recallFromCounts` from `recallTrace.ts`

Suggested types:

```ts
type F1Result = {
  precision: number | null;
  recall: number | null;
  numerator: number;
  denominator: number;
  value: number | null;
};

type F1Preset = {
  id: "fixture" | "high-precision-low-recall" | "low-precision-high-recall" | "both-strong" | "no-positive-evidence" | "errors-no-true-positives";
  precision: number | null;
  recall: number | null;
  explanation: Record<Locale, string>;
};
```

Required helper behavior:

- `f1FromPrecisionRecall(precision, recall)` returns `value: null` if either input is `null`; if both inputs are defined and `precision + recall === 0`, it returns `value: 0`.
- `f1FromCounts(counts)` derives precision and recall from counts and returns an `F1Result`-shaped object with derived precision, recall, count-form numerator, count-form denominator, and value. It returns the same fixture value as the metric formula, and uses `value: null` only when `2TP + FP + FN === 0`; if `TP === 0` with `FP` or `FN` present, it returns `value: 0` even if one derived source metric is `null`.
- `arithmeticMean(precision, recall)` is used only for comparison and should return `null` when either input is unavailable.
- `formatMetric(value, locale)` returns `not available` / `不可用` for `null`.

Interactive controls:

- Preset buttons for all planned cases.
- `Reset` returns to the fixture preset.
- Current precision, recall, arithmetic mean, and F1 are visible in text.
- Use `aria-live="polite"` for current explanation.
- Include a static preset comparison table as a no-JS fallback.

## Accessibility And Mobile Requirements

- Use semantic tables for preset comparisons and formula ledgers.
- Do not rely on color alone; every bar or marker must include text labels such as `precision`, `recall`, `F1`, and `not available`.
- Buttons need descriptive text and visible focus states.
- On mobile, stack metric cards, formula, demo controls, and explanation.
- Ensure Chinese labels and formulas wrap without horizontal overflow.

## Implementation Sketch

```ts
function f1FromPrecisionRecall(precision, recall) {
  if (precision === null || recall === null) {
    return { precision, recall, numerator: 0, denominator: 0, value: null };
  }
  const denominator = precision + recall;
  if (denominator === 0) {
    return { precision, recall, numerator: 0, denominator, value: 0 };
  }
  return {
    precision,
    recall,
    numerator: 2 * precision * recall,
    denominator,
    value: (2 * precision * recall) / denominator
  };
}
```

Count form:

```ts
function f1FromCounts(counts) {
  const precision = precisionFromCounts(counts).value;
  const recall = recallFromCounts(counts).value;
  const numerator = 2 * counts.tp;
  const denominator = 2 * counts.tp + counts.fp + counts.fn;
  if (denominator === 0) {
    return { precision, recall, numerator, denominator, value: null };
  }
  return { precision, recall, numerator, denominator, value: numerator / denominator };
}
```

Correctness intuition: for fixture and ordinary cases where source metrics are defined and `P + R > 0`, the metric formula and count form agree because precision and recall both use the same `TP` as numerator, while `FP` and `FN` represent the two ways the positive-class story can fail. Edge cases follow the explicit branch table and count denominator convention.

## Graph Placement

Add `f1-score` near the metrics cluster:

```ts
{
  id: "f1-score",
  label: {
    en: "F1 Score",
    zh: "F1 分数"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 750, y: 650 }
}
```

Add these graph edges:

```ts
{
  from: "precision",
  to: "f1-score",
  type: "uses",
  reason: {
    en: "F1 combines precision with recall, so learners need precision's positive-prediction question first.",
    zh: "F1 会把精确率和召回率合在一起，因此需要先理解精确率关于正类预测是否可信的问题。"
  }
}
```

```ts
{
  from: "recall",
  to: "f1-score",
  type: "uses",
  reason: {
    en: "F1 combines recall with precision, so learners need recall's real-positive coverage question first.",
    zh: "F1 会把召回率和精确率合在一起，因此需要先理解召回率关于真实正类覆盖的问题。"
  }
}
```

No dangling future links.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/f1-score/`.
- Chinese page uses `translationStatus: needs-review`.
- Page has `precision` and `recall` as prerequisites.
- Page teaches binary F1 only and does not branch into F-beta or averaging variants.
- Fixture result is exactly `6/11`.
- Count form and metric form agree for fixture and ordinary cases where source metrics are defined and `P + R > 0`; edge cases follow the explicit branch table and `2TP + FP + FN` denominator convention.
- Unavailable values render as `not available` / `不可用`, not `0`, `NaN`, or empty text.
- Interactive demo has preset controls, reset, visible current values, and no network dependency.
- Static preset table or formula ledger remains useful without JavaScript.
- Focused tests cover fixture result, count/metric agreement, TN insensitivity, FP/FN sensitivity, unavailable inputs, and localized unavailable labels.
- Graph/content validation has no dangling endpoint or missing-prerequisite errors.

Validation commands:

```bash
npm run check
npm run test
npm run build
```
