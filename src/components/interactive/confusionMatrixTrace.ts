import type { Locale } from "../../i18n/locales";

export type LocalizedText = Record<Locale, string>;

export type BinaryLabel = "spam" | "not-spam";
export type MatrixCell = "tp" | "fp" | "tn" | "fn";

export type ConfusionMatrixExample = {
  id: string;
  actual: BinaryLabel;
  prediction: BinaryLabel;
  subject: LocalizedText;
  note: LocalizedText;
};

export type MatrixCounts = Record<MatrixCell, number>;

export type MatrixTraceStep = {
  index: number;
  example: ConfusionMatrixExample;
  cell: MatrixCell;
  before: MatrixCounts;
  after: MatrixCounts;
  explanation: LocalizedText;
};

export type CellLabel = {
  code: string;
  full: LocalizedText;
  meaning: LocalizedText;
};

const emptyCounts: MatrixCounts = { tp: 0, fp: 0, tn: 0, fn: 0 };

export const confusionMatrixExamples: ConfusionMatrixExample[] = [
  {
    id: "e1",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Prize claim now", zh: "立即领取奖品" },
    note: {
      en: "Obvious prize bait caught by the filter.",
      zh: "明显的中奖诱饵，被过滤器拦下。"
    }
  },
  {
    id: "e2",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Project notes", zh: "项目笔记" },
    note: {
      en: "A normal work message left in the inbox.",
      zh: "普通工作邮件，被留在收件箱。"
    }
  },
  {
    id: "e3",
    actual: "not-spam",
    prediction: "spam",
    subject: { en: "Receipt attached", zh: "收据已附上" },
    note: {
      en: "A real receipt incorrectly flagged as spam.",
      zh: "真实收据被错误标成垃圾邮件。"
    }
  },
  {
    id: "e4",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Account alert", zh: "账户提醒" },
    note: {
      en: "A fake alert slipped into the inbox.",
      zh: "伪造提醒漏进了收件箱。"
    }
  },
  {
    id: "e5",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Limited offer", zh: "限时优惠" },
    note: {
      en: "Promotional spam correctly blocked.",
      zh: "促销垃圾邮件被正确拦截。"
    }
  },
  {
    id: "e6",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Team lunch", zh: "团队午餐" },
    note: {
      en: "A casual team email correctly kept.",
      zh: "团队日常邮件被正确保留。"
    }
  },
  {
    id: "e7",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Password reset", zh: "密码重置" },
    note: {
      en: "A requested reset email reached the user.",
      zh: "用户请求的重置邮件正常送达。"
    }
  },
  {
    id: "e8",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Urgent transfer", zh: "紧急转账" },
    note: {
      en: "A scam message was missed by the filter.",
      zh: "诈骗邮件被过滤器漏掉。"
    }
  },
  {
    id: "e9",
    actual: "not-spam",
    prediction: "spam",
    subject: { en: "Flight update", zh: "航班变更" },
    note: {
      en: "A useful travel update became a false alarm.",
      zh: "有用的出行更新被误报。"
    }
  },
  {
    id: "e10",
    actual: "spam",
    prediction: "spam",
    subject: { en: "Crypto bonus", zh: "加密币奖励" },
    note: {
      en: "Suspicious bonus spam correctly caught.",
      zh: "可疑奖励垃圾邮件被正确拦截。"
    }
  },
  {
    id: "e11",
    actual: "not-spam",
    prediction: "not-spam",
    subject: { en: "Invoice approved", zh: "发票已批准" },
    note: {
      en: "A business invoice correctly accepted.",
      zh: "业务发票被正确接收。"
    }
  },
  {
    id: "e12",
    actual: "spam",
    prediction: "not-spam",
    subject: { en: "Verify wallet", zh: "验证钱包" },
    note: {
      en: "A phishing-style wallet email was missed.",
      zh: "钓鱼式钱包邮件被漏判。"
    }
  }
];

export const positiveLabel: BinaryLabel = "spam";
export const swappedPositiveLabel: BinaryLabel = "not-spam";

const cellMeta: Record<MatrixCell, CellLabel> = {
  tp: {
    code: "TP",
    full: {
      en: "True Positive",
      zh: "真正例（true positive）"
    },
    meaning: {
      en: "Actual spam and predicted spam.",
      zh: "真实是垃圾邮件并预测为垃圾邮件。"
    }
  },
  fp: {
    code: "FP",
    full: {
      en: "False Positive",
      zh: "假正例（false positive）"
    },
    meaning: {
      en: "Actual not spam and predicted spam.",
      zh: "真实为非垃圾邮件却被预测为垃圾邮件。"
    }
  },
  tn: {
    code: "TN",
    full: {
      en: "True Negative",
      zh: "真负例（true negative）"
    },
    meaning: {
      en: "Actual not spam and predicted not spam.",
      zh: "真实为非垃圾邮件且预测为非垃圾邮件。"
    }
  },
  fn: {
    code: "FN",
    full: {
      en: "False Negative",
      zh: "假负例（false negative）"
    },
    meaning: {
      en: "Actual spam and predicted not spam.",
      zh: "真实是垃圾邮件却被预测为非垃圾邮件。"
    }
  }
};

export const sortedCells = ["tp", "fp", "tn", "fn"] as const;

export function labelForCell(
  cell: MatrixCell,
  lang: Locale = "en"
): {
  code: string;
  full: string;
  meaning: string;
} {
  const meta = cellMeta[cell];
  return {
    code: meta.code,
    full: meta.full[lang],
    meaning: meta.meaning[lang]
  };
}

export function cloneCounts(counts: MatrixCounts): MatrixCounts {
  return { ...counts };
}

export function classifyExample(example: ConfusionMatrixExample, label = positiveLabel): MatrixCell {
  const actualPositive = example.actual === label;
  const predictedPositive = example.prediction === label;

  if (actualPositive && predictedPositive) return "tp";
  if (!actualPositive && predictedPositive) return "fp";
  if (!actualPositive && !predictedPositive) return "tn";
  return "fn";
}

export function countMatrix(examples: readonly ConfusionMatrixExample[], label = positiveLabel): MatrixCounts {
  return examples.reduce((acc, example) => {
    const cell = classifyExample(example, label);
    acc[cell] += 1;
    return acc;
  }, cloneCounts(emptyCounts));
}

export function sumCounts(counts: MatrixCounts): number {
  return counts.tp + counts.fp + counts.tn + counts.fn;
}

export function buildConfusionMatrixTrace(examples: readonly ConfusionMatrixExample[], label = positiveLabel): MatrixTraceStep[] {
  let running = cloneCounts(emptyCounts);
  return examples.map((example, index) => {
    const before = cloneCounts(running);
    const cell = classifyExample(example, label);
    const after = cloneCounts(running);
    after[cell] += 1;
    running = cloneCounts(after);

    const isActualPositive = example.actual === label;
    const isPredictedPositive = example.prediction === label;

    return {
      index,
      example,
      cell,
      before,
      after,
      explanation: {
        en: `${example.id}: actual is ${isActualPositive ? "positive" : "negative"} under positive=${label}, prediction is ${isPredictedPositive ? "positive" : "negative"}; this is ${labelForCell(cell, "en").full} (${labelForCell(cell, "en").code}).`,
        zh: `${example.id}: ${example.subject.zh}，真实为“${example.actual}”（${example.actual === label ? "正类" : "负类"}），预测为“${example.prediction}”（${example.prediction === label ? "正类" : "负类"}），因此属于 ${labelForCell(cell, "zh").full}（${labelForCell(cell, "zh").code}）。`
      }
    };
  });
}

export function examplesByCell(examples: readonly ConfusionMatrixExample[], label = positiveLabel) {
  const grouped: Record<MatrixCell, ConfusionMatrixExample[]> = { tp: [], fp: [], tn: [], fn: [] };
  for (const example of examples) {
    const cell = classifyExample(example, label);
    grouped[cell].push(example);
  }
  return grouped;
}

export function buildConfusionMatrixLedger(examples: readonly ConfusionMatrixExample[], label = positiveLabel): MatrixTraceStep[] {
  return buildConfusionMatrixTrace(examples, label);
}

export function exampleById(id: string): ConfusionMatrixExample | undefined {
  return confusionMatrixExamples.find((entry) => entry.id === id);
}

export const defaultTrace = buildConfusionMatrixTrace(confusionMatrixExamples, positiveLabel);
export const swappedTrace = buildConfusionMatrixTrace(confusionMatrixExamples, swappedPositiveLabel);
export const finalCounts = countMatrix(confusionMatrixExamples, positiveLabel);
export const swappedFinalCounts = countMatrix(confusionMatrixExamples, swappedPositiveLabel);
