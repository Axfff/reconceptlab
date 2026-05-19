# Confusion Matrix Node Design

## Node Scope

`confusion-matrix` is a beginner concept node for binary classification metrics. It teaches how a list of actual labels and model predictions becomes four counts: true positives, false positives, true negatives, and false negatives.

In scope:

- Binary classification with one named positive class.
- Actual label versus predicted label.
- The four cells `TP`, `FP`, `TN`, and `FN`.
- Why one correct/incorrect score hides different kinds of mistakes.
- One deterministic spam-filter fixture shared by prose, figures, demo, formulas, code sketch, and tests.
- The invariant that every evaluated example lands in exactly one cell.

Out of scope:

- Multiclass confusion matrices.
- Threshold tuning, ROC curves, precision-recall curves, calibration, and ranking metrics.
- Full teaching of precision, recall, or F1. This node only names them as follow-up metrics that reuse the table.
- Statistical uncertainty or dataset shift.

## Proposed Frontmatter

English page:

```yaml
id: confusion-matrix
locale: en
title: Confusion Matrix
summary: Count where a binary classifier is right or wrong before turning the counts into metrics.
status: draft
translationStatus: source
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites: []
next:
  - precision
  - recall
  - f1-score
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

Chinese page:

```yaml
id: confusion-matrix
locale: zh
title: 混淆矩阵
summary: 在计算指标之前，先统计二分类模型在哪些地方判断正确或错误。
status: draft
translationStatus: needs-review
difficulty: beginner
conceptType: concept
tags:
  - machine-learning
  - metrics
  - classification
prerequisites: []
next:
  - precision
  - recall
  - f1-score
createdAt: 2026-05-18
updatedAt: 2026-05-18
```

If the follow-up nodes are not yet implemented when this page lands, remove missing ids from `next` to satisfy content validation. Restore them after the target graph nodes exist.

## Teaching Arc

1. Hook problem: a spam filter marks emails as spam or not spam, and a user wants to know what kind of mistakes it makes.
2. First naive idea: keep one score, `right` versus `wrong`.
3. Pain point: an innocent email flagged as spam and a spam email missed by the filter are both wrong, but they create different harms.
4. Core invention: split the evaluation by two binary questions: what reality says and what the model predicted.
5. Visual anchors: the same twelve email cards feed the right/wrong tally, mistake comparison, 2x2 table, step trace, invariant, and code sketch.
6. Formal version: define positive class, actual label `y`, predicted label `\hat{y}`, and the four named cells.
7. Implementation sketch: scan examples once and increment exactly one of four counters.
8. Correctness intuition: for binary labels, the two actual-label cases and two prediction cases are exhaustive and mutually exclusive, so every example has one cell.
9. Complexity: `O(n)` time and `O(1)` extra storage for four counters.
10. Common confusions: positive does not mean good, row/column conventions must be stated, and false positive versus false negative depends on the positive class.
11. Connections: precision uses predicted positives, recall uses actual positives, and F1 combines precision and recall.
12. Exercises: classify a new email row, identify a cell from a sentence, and predict how the table changes if the positive class changes.

## Vocabulary Scaffolding

- Binary classifier: a model that chooses between two labels. Chinese: `二分类器（binary classifier）`.
- Positive class: the class the metric treats as `yes` or `1`; here it is spam. Chinese: `正类（positive class）`.
- Actual label: the ground-truth label in the evaluation set. Chinese: `真实标签（actual label）`.
- Predicted label: the label output by the model. Chinese: `预测标签（predicted label）`.
- True positive: actual positive and predicted positive. Chinese: `真正例（true positive, TP）`.
- False positive: actual negative but predicted positive. Chinese: `假正例（false positive, FP）`.
- True negative: actual negative and predicted negative. Chinese: `真负例（true negative, TN）`.
- False negative: actual positive but predicted negative. Chinese: `假负例（false negative, FN）`.

## Section-Level Visual Inventory

| Page section | Support | Learner question answered |
|---|---|---|
| Hook problem | Static 12-email card grid with actual and predicted badges. Include the positive-class label `spam`. | What data are we evaluating? |
| First naive idea | Correct/incorrect tally strip: `7 right`, `5 wrong`, and the matching highlighted cards. | Why does one score feel tempting? |
| Where it hurts | Two wrong examples side by side: `e3` false alarm (`not spam -> predicted spam`) and `e4` missed spam (`spam -> predicted not spam`). | Why are not all mistakes interchangeable? |
| Core invention | Empty 2x2 matrix with rows as actual labels and columns as predicted labels, then a four-card quadrant seed using `e1` as TP, `e3` as FP, `e2` as TN, and `e4` as FN. | What two questions create the four buckets? |
| Interactive trace | `ConfusionMatrixDemo` with step, previous, reset, and optional play controls. Each step highlights one email and increments one cell. Include a static trace ledger/table fallback rendered in MDX or SSR so the trace itself remains visible without JavaScript. | How does each example enter exactly one cell? |
| Formal version | Semantic 2x2 table labeled `TP`, `FP`, `TN`, `FN` plus captions for each cell. | How do the names map to reality and prediction? |
| Implementation sketch | Branch table aligning conditions with visible cells: `actual spam && predicted spam -> TP++`, etc. | What code creates the table? |
| Invariant | Total badge and trace ledger at final counts: `TP=3`, `FP=2`, `TN=4`, `FN=3`, so `TP + FP + TN + FN = 12`. Also show a mid-trace snapshot after `e9`: `TP=2`, `FP=2`, `TN=3`, `FN=2`, total `9`. | How do we know no example was lost or double-counted? |
| Complexity | One-pass scan ruler over twelve cards and a fixed four-counter memory panel. | Why is the computation linear and storage constant? |
| Common confusions | Mini-cards for positive-class choice, row/column orientation, FP/FN wording, and derived metrics. The positive-class card must contrast the original table with a swapped-positive table for `positiveLabel = "not-spam"`. | Which naming mistakes should be avoided? |
| Connections | Small graph strip: `confusion-matrix -> precision`, `confusion-matrix -> recall`, then `precision + recall -> f1-score`. Mark future nodes as follow-ups when routes are not implemented yet. | Where does this table go next? |
| Exercises | Compact prediction cards using the same fixture, including a positive-class-swap exercise. | Can the learner classify a case without help? |

The short transition from hook to the naive score may stay prose-primary because it only names the already-visible count goal.

## Deterministic Fixture

Use one spam-filter fixture across the node:

```ts
type BinaryLabel = "spam" | "not-spam";
type MatrixCell = "tp" | "fp" | "tn" | "fn";

const positiveLabel = "spam";

const examples = [
  {
    id: "e1",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Prize claim now", zh: "立即领取奖品" },
    note: { en: "Obvious prize bait caught by the filter.", zh: "明显的中奖诱饵，被过滤器拦下。" }
  },
  {
    id: "e2",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Project notes", zh: "项目笔记" },
    note: { en: "A normal work message left in the inbox.", zh: "普通工作邮件，被留在收件箱。" }
  },
  {
    id: "e3",
    actual: "not-spam",
    prediction: "spam",
    subject: { en: "Receipt attached", zh: "收据已附上" },
    note: { en: "A real receipt incorrectly flagged as spam.", zh: "真实收据被错误标成垃圾邮件。" }
  },
  {
    id: "e4",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Account alert", zh: "账户提醒" },
    note: { en: "A fake alert slipped into the inbox.", zh: "伪造提醒漏进了收件箱。" }
  },
  {
    id: "e5",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Limited offer", zh: "限时优惠" },
    note: { en: "Promotional spam correctly blocked.", zh: "促销垃圾邮件被正确拦截。" }
  },
  {
    id: "e6",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Team lunch", zh: "团队午餐" },
    note: { en: "A casual team email correctly kept.", zh: "团队日常邮件被正确保留。" }
  },
  {
    id: "e7",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Password reset", zh: "密码重置" },
    note: { en: "A requested reset email reached the user.", zh: "用户请求的重置邮件正常送达。" }
  },
  {
    id: "e8",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Urgent transfer", zh: "紧急转账" },
    note: { en: "A scam message was missed by the filter.", zh: "诈骗邮件被过滤器漏掉。" }
  },
  {
    id: "e9",
    actual: "not-spam",
    prediction: "spam",
    subject: { en: "Flight update", zh: "航班变更" },
    note: { en: "A useful travel update became a false alarm.", zh: "有用的出行更新被误报。" }
  },
  {
    id: "e10",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Crypto bonus", zh: "加密币奖励" },
    note: { en: "Suspicious bonus spam correctly caught.", zh: "可疑奖励垃圾邮件被正确拦截。" }
  },
  {
    id: "e11",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Invoice approved", zh: "发票已批准" },
    note: { en: "A business invoice correctly accepted.", zh: "业务发票被正确接收。" }
  },
  {
    id: "e12",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Verify wallet", zh: "验证钱包" },
    note: { en: "A phishing-style wallet email was missed.", zh: "钓鱼式钱包邮件被漏判。" }
  }
];
```

Golden expectations:

- `TP = 3`: `e1`, `e5`, `e10`
- `FP = 2`: `e3`, `e9`
- `TN = 4`: `e2`, `e6`, `e7`, `e11`
- `FN = 3`: `e4`, `e8`, `e12`
- `correct = TP + TN = 7`
- `wrong = FP + FN = 5`
- `total = 12`
- `TP + FP + TN + FN = examples.length`
- Every trace step increments exactly one cell by `1`.
- Mid-trace snapshot after `e9`: `TP = 2`, `FP = 2`, `TN = 3`, `FN = 2`, `total = 9`.

Positive-class swap exercise:

- Ask learners to recompute the same fixture with `positiveLabel = "not-spam"`.
- Swapped golden counts: `TP = 4`, `FP = 3`, `TN = 3`, `FN = 2`.
- Include a small before/after visual that keeps the same 12 cards but flips the highlighted positive class and updates the four cells. The visual should make clear that the underlying predictions did not change; only the question "which label counts as positive?" changed.

## Formula And Notation Plan

Introduce symbols after the concrete fixture:

- `y` is the actual label, and `\hat{y}` is the predicted label.
- The chosen positive class can be written as `1`; this does not mean "good" or "correct." In the main fixture, `1 = spam` and `0 = not spam`.

Display the orientation explicitly:

```tex
\begin{array}{c|cc}
 & \hat{y}=1 & \hat{y}=0 \\
\hline
y=1 & TP & FN \\
y=0 & FP & TN
\end{array}
```

Plain-language explanation: rows are reality; columns are model output.

Use the accounting invariant:

$$
TP + FP + TN + FN = n.
$$

Plain-language explanation: the confusion matrix accounts for the whole evaluation set.

Use the cost statement:

$$
\text{time} = O(n), \qquad \text{extra space} = O(1).
$$

Plain-language explanation: scan every example once and keep four counters.

Do not include formulas for precision, recall, or F1 here.

## Component And State Model

Implementation targets:

```text
src/components/interactive/confusionMatrixTrace.ts
src/components/interactive/ConfusionMatrixScenarioFigure.tsx
src/components/interactive/ConfusionMatrixDemo.tsx
tests/confusion-matrix-trace.test.ts
```

Suggested types:

```ts
type MatrixCell = "tp" | "fp" | "tn" | "fn";
type BinaryLabel = "spam" | "not-spam";

type ConfusionMatrixExample = {
  id: string;
  actual: BinaryLabel;
  prediction: BinaryLabel;
  subject: Record<Locale, string>;
  note: Record<Locale, string>;
};

type MatrixCounts = Record<MatrixCell, number>;

type MatrixTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: MatrixCell;
  before: MatrixCounts;
  after: MatrixCounts;
  explanation: Record<Locale, string>;
};
```

Required helpers:

- `classifyExample(example, positiveLabel)` returns one matrix cell.
- `countMatrix(examples, positiveLabel)` returns final counts.
- `buildConfusionMatrixTrace(examples, positiveLabel)` returns deterministic step states.
- `sumCounts(counts)` returns `tp + fp + tn + fn`.
- `labelForCell(cell, lang)` returns localized full label and short code.

Interactive controls:

- `Previous`, `Next`, `Reset`, and optional `Play/Pause`.
- The active example, cell name, and current counts must be visible in text.
- Use `aria-live="polite"` for the current-step explanation.
- Respect reduced-motion preferences by avoiding required animation.
- Render a non-JS static trace ledger in MDX or SSR with one row per fixture id, its subject, actual label, prediction, cell, and running counts. The React demo may enhance this ledger, but must not be the only way to inspect the trace.

## Accessibility And Mobile Requirements

- Use semantic tables for the matrix wherever practical.
- Every cell must show code, full label, count, and a plain-language meaning.
- Do not rely on color alone; include visible labels such as `TP` and `false alarm`.
- Buttons need descriptive labels and visible focus states.
- On narrow screens, stack active email card, matrix, explanation, and controls.
- Matrix cells should have stable dimensions so count updates do not shift layout.
- Chinese labels must wrap without horizontal overflow.

## Implementation Sketch

```ts
function classifyExample(example, positiveLabel) {
  const actualPositive = example.actual === positiveLabel;
  const predictedPositive = example.prediction === positiveLabel;

  if (actualPositive && predictedPositive) return "tp";
  if (!actualPositive && predictedPositive) return "fp";
  if (!actualPositive && !predictedPositive) return "tn";
  return "fn";
}

function countMatrix(examples, positiveLabel) {
  const counts = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const example of examples) {
    counts[classifyExample(example, positiveLabel)] += 1;
  }
  return counts;
}
```

Correctness intuition: the two Boolean questions `actualPositive` and `predictedPositive` have four possible combinations, and the branch order covers each combination once.

## Graph Placement

Add `confusion-matrix` to a new Machine Learning Metrics cluster in `src/data/graph.ts`:

```ts
{
  id: "confusion-matrix",
  label: {
    en: "Confusion Matrix",
    zh: "混淆矩阵"
  },
  status: "draft",
  conceptType: "concept",
  position: { x: 90, y: 650 }
}
```

Do not add edges to `precision`, `recall`, or `f1-score` until those graph nodes exist. Once they exist, add:

- `confusion-matrix -> precision`, type `uses`.
  - en: `Precision uses the predicted-positive part of the confusion matrix to ask how many positive predictions were correct.`
  - zh: `精确率使用混淆矩阵中预测为正类的部分，询问正类预测里有多少是真的。`
- `confusion-matrix -> recall`, type `uses`.
  - en: `Recall uses the actual-positive part of the confusion matrix to ask how many real positives were found.`
  - zh: `召回率使用混淆矩阵中真实正类的部分，询问真实正类中有多少被找到了。`
- `precision -> f1-score` and `recall -> f1-score`, type `uses`, once those nodes exist.

## Acceptance Criteria

- English and Chinese MDX pages exist under `src/content/nodes/confusion-matrix/`.
- Chinese page uses `translationStatus: needs-review`.
- Page teaches binary classification only and leaves precision, recall, and F1 formulas to follow-up nodes.
- Every major section has nearby visual support or a stated reason for staying prose-primary.
- The interactive trace is deterministic and matches golden counts.
- Local visuals use the specified fixture anchors: `e3` false alarm, `e4` missed spam, `e1/e3/e2/e4` quadrant seed, final invariant counts, and the after-`e9` mid-trace snapshot.
- The positive-class-swap exercise shows `positiveLabel = "not-spam"` with `TP=4`, `FP=3`, `TN=3`, and `FN=2`.
- Matrix content remains understandable without JavaScript.
- The trace itself has a non-JS static ledger/table fallback.
- Focused trace tests cover golden counts, per-example cell mapping, one-cell-per-step updates, invariant totals, and localized labels.
- Graph/content validation has no dangling endpoint or missing-prerequisite errors.

Validation commands:

```bash
npm run check
npm run test
npm run build
```
