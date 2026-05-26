import type { Locale } from "../../i18n/locales";
import {
  adjustedRandIndexFromExamples,
  clusteringFixture,
  clusteringPresets,
  contingencyTable,
  formatClusteringMetric,
  fowlkesMallowsIndexFromExamples,
  labelName,
  pairStatsFromExamples,
  purityFromExamples,
  randIndexFromExamples
} from "./clusteringMetricsTrace";

type ScenarioId =
  | "cluster-fixture"
  | "purity-majority"
  | "pair-table"
  | "rand-counts"
  | "ari-adjustment"
  | "fmi-geometric"
  | "metric-contrast"
  | "graph-strip";

const text: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "cluster-fixture": {
    title: { en: "Reference labels versus clusters", zh: "参考标签与聚类结果" },
    summary: {
      en: "Cluster names are arbitrary; only membership should be compared.",
      zh: "簇名是任意的，真正要比较的是样本归属。"
    }
  },
  "purity-majority": {
    title: { en: "Cluster-majority ledger", zh: "簇内多数标签账本" },
    summary: {
      en: "Each cluster contributes only its largest reference-label count.",
      zh: "每个簇只贡献其中数量最多的参考标签计数。"
    }
  },
  "pair-table": {
    title: { en: "Pair questions", zh: "样本对问题" },
    summary: {
      en: "Every unordered pair answers two yes/no questions.",
      zh: "每个无序样本对回答两个是/否问题。"
    }
  },
  "rand-counts": {
    title: { en: "Rand pair counts", zh: "Rand 成对计数" },
    summary: {
      en: "RI counts both same-same and different-different agreements.",
      zh: "RI 同时计入同-同和异-异两类一致。"
    }
  },
  "ari-adjustment": {
    title: { en: "Chance adjustment", zh: "机会一致性调整" },
    summary: {
      en: "ARI compares observed same-same pairs with the expected amount from the margins.",
      zh: "ARI 将观察到的同-同样本对与由边际规模产生的期望值比较。"
    }
  },
  "fmi-geometric": {
    title: { en: "Pair-positive balance", zh: "成对正例平衡" },
    summary: {
      en: "FMI ignores true negatives and balances pair precision with pair recall.",
      zh: "FMI 不使用真负例，而是在成对精确率和成对召回率之间取平衡。"
    }
  },
  "metric-contrast": {
    title: { en: "Preset contrast", zh: "预设对比" },
    summary: {
      en: "The same four metrics react differently to over-splitting and merging.",
      zh: "过度拆分和过度合并会让四个指标产生不同反应。"
    }
  },
  "graph-strip": {
    title: { en: "Clustering metric path", zh: "聚类指标路径" },
    summary: {
      en: "Start with cluster majorities, then move to pair counts and pair-positive balance.",
      zh: "先看簇内多数，再转向样本对计数与成对正例平衡。"
    }
  }
};

function MetricCard({
  label,
  value,
  note
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <article className="circuit-sat-result-card">
      <strong>{label}</strong>
      <output>{value}</output>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function renderFixture(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      {clusteringFixture.map((item) => (
        <article key={item.id} className="pnp-card">
          <strong>{item.label[lang]}</strong>
          <p>{lang === "en" ? `reference: ${labelName(item.truth, lang)}` : `参考标签：${labelName(item.truth, lang)}`}</p>
          <p>{lang === "en" ? `cluster: ${item.cluster}` : `簇：${item.cluster}`}</p>
        </article>
      ))}
    </div>
  );
}

function renderPurity(lang: Locale) {
  const purity = purityFromExamples(clusteringFixture);
  return (
    <div className="pnp-card-grid">
      {purity.contributions.map((contribution) => (
        <MetricCard
          key={contribution.cluster}
          label={`${lang === "en" ? "Cluster" : "簇"} ${contribution.cluster}`}
          value={`${contribution.majorityCount}/${contribution.size}`}
          note={
            lang === "en"
              ? `majority label: ${labelName(contribution.majorityLabel, lang)}`
              : `多数标签：${labelName(contribution.majorityLabel, lang)}`
          }
        />
      ))}
      <MetricCard
        label="Purity"
        value={`${purity.numerator}/${purity.denominator} = ${formatClusteringMetric(purity.value, lang)}`}
      />
    </div>
  );
}

function renderPairTable(lang: Locale) {
  const pairs = [
    {
      label: "TP",
      value: lang === "en" ? "same label, same cluster" : "同标签，同簇"
    },
    {
      label: "FP",
      value: lang === "en" ? "different labels, same cluster" : "异标签，同簇"
    },
    {
      label: "FN",
      value: lang === "en" ? "same label, different clusters" : "同标签，异簇"
    },
    {
      label: "TN",
      value: lang === "en" ? "different labels, different clusters" : "异标签，异簇"
    }
  ];
  return (
    <div className="pnp-card-grid">
      {pairs.map((pair) => (
        <MetricCard key={pair.label} label={pair.label} value={pair.value} />
      ))}
    </div>
  );
}

function renderRandCounts(lang: Locale) {
  const stats = pairStatsFromExamples(clusteringFixture);
  const ri = randIndexFromExamples(clusteringFixture);
  return (
    <div className="pnp-card-grid">
      <MetricCard label="TP" value={stats.tp} note={lang === "en" ? "together in both" : "两边都放在一起"} />
      <MetricCard label="FP" value={stats.fp} note={lang === "en" ? "clustered together by mistake" : "错误合并"} />
      <MetricCard label="FN" value={stats.fn} note={lang === "en" ? "split apart by mistake" : "错误拆开"} />
      <MetricCard label="TN" value={stats.tn} note={lang === "en" ? "apart in both" : "两边都分开"} />
      <MetricCard label="RI" value={`${ri.numerator}/${ri.denominator} = ${formatClusteringMetric(ri.value, lang)}`} />
    </div>
  );
}

function renderAri(lang: Locale) {
  const ari = adjustedRandIndexFromExamples(clusteringFixture);
  return (
    <div className="pnp-card-grid">
      <MetricCard label="S" value={ari.observedSamePairs} note={lang === "en" ? "observed same-same pairs" : "观察到的同-同样本对"} />
      <MetricCard label="A" value={ari.clusterPairSum} note={lang === "en" ? "cluster margin pairs" : "簇边际样本对"} />
      <MetricCard label="B" value={ari.classPairSum} note={lang === "en" ? "class margin pairs" : "类别边际样本对"} />
      <MetricCard label="E = AB/T" value={formatClusteringMetric(ari.expectedIndex, lang)} note={lang === "en" ? "expected by chance" : "机会期望"} />
      <MetricCard label="ARI" value={formatClusteringMetric(ari.value, lang)} note="(S - E) / (M - E)" />
    </div>
  );
}

function renderFmi(lang: Locale) {
  const stats = pairStatsFromExamples(clusteringFixture);
  const fmi = fowlkesMallowsIndexFromExamples(clusteringFixture);
  return (
    <div className="pnp-card-grid">
      <MetricCard label="Pair precision" value={formatClusteringMetric(fmi.pairPrecision, lang)} note="TP / (TP + FP)" />
      <MetricCard label="Pair recall" value={formatClusteringMetric(fmi.pairRecall, lang)} note="TP / (TP + FN)" />
      <MetricCard label="FMI" value={formatClusteringMetric(fmi.value, lang)} note="TP / sqrt((TP + FP)(TP + FN))" />
      <MetricCard label="TN" value={stats.tn} note={lang === "en" ? "not used by FMI" : "FMI 不使用"} />
    </div>
  );
}

function renderMetricContrast(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      {clusteringPresets.map((preset) => {
        const purity = purityFromExamples(preset.items);
        const ri = randIndexFromExamples(preset.items);
        const ari = adjustedRandIndexFromExamples(preset.items);
        const fmi = fowlkesMallowsIndexFromExamples(preset.items);
        return (
          <article key={preset.id} className="circuit-sat-result-card">
            <strong>{preset.label[lang]}</strong>
            <p>Purity: {formatClusteringMetric(purity.value, lang)}</p>
            <p>RI: {formatClusteringMetric(ri.value, lang)}</p>
            <p>ARI: {formatClusteringMetric(ari.value, lang)}</p>
            <p>FMI: {formatClusteringMetric(fmi.value, lang)}</p>
          </article>
        );
      })}
    </div>
  );
}

function renderGraphStrip(lang: Locale) {
  const nodes = [
    { id: "purity", label: lang === "en" ? "Purity" : "纯度" },
    { id: "rand-index", label: lang === "en" ? "Rand Index" : "Rand 指数" },
    { id: "adjusted-rand-index", label: lang === "en" ? "Adjusted Rand Index" : "调整 Rand 指数" },
    { id: "fowlkes-mallows-index", label: lang === "en" ? "Fowlkes-Mallows" : "Fowlkes-Mallows 指数" }
  ];
  return (
    <div className="circuit-sat-graph-strip">
      {nodes.map((node, index) => (
        <div key={node.id}>
          <strong>{index + 1}. {node.label}</strong>
          <p>{node.id}</p>
        </div>
      ))}
    </div>
  );
}

export default function ClusteringMetricFigure({
  lang,
  scenarioId
}: {
  lang: Locale;
  scenarioId: ScenarioId;
}) {
  const caption = text[scenarioId];
  const table = contingencyTable(clusteringFixture);

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{caption.title[lang]}</strong>
        <span>{caption.summary[lang]}</span>
      </figcaption>

      {scenarioId === "cluster-fixture" ? renderFixture(lang) : null}
      {scenarioId === "purity-majority" ? renderPurity(lang) : null}
      {scenarioId === "pair-table" ? renderPairTable(lang) : null}
      {scenarioId === "rand-counts" ? renderRandCounts(lang) : null}
      {scenarioId === "ari-adjustment" ? renderAri(lang) : null}
      {scenarioId === "fmi-geometric" ? renderFmi(lang) : null}
      {scenarioId === "metric-contrast" ? renderMetricContrast(lang) : null}
      {scenarioId === "graph-strip" ? renderGraphStrip(lang) : null}

      {scenarioId === "purity-majority" ? (
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>
          {lang === "en"
            ? `Contingency table: ${table.clusters.length} clusters by ${table.labels.length} reference labels.`
            : `列联表：${table.clusters.length} 个簇 × ${table.labels.length} 个参考标签。`}
        </p>
      ) : null}
    </figure>
  );
}
