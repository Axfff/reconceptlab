import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import {
  defaultKernelParams,
  formatKernelNumber,
  kernelCopy,
  kernelPoints,
  labKernelRows,
  rbfGammaValues,
  type KernelName
} from "./kernelTrace";

const kernelOrder: KernelName[] = ["linear", "polynomial", "rbf", "sigmoid"];

function formatLabValue(value: number, lang: Locale, activeKernel: KernelName) {
  if (activeKernel === "rbf" && value > 0 && value < 0.001) {
    return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
      maximumFractionDigits: 6,
      minimumFractionDigits: 6
    }).format(value);
  }

  return formatKernelNumber(value, lang);
}

const copy = {
  en: {
    title: "Kernel similarity lab",
    anchor: "Anchor",
    kernel: "Kernel",
    gamma: "RBF gamma",
    gammaNote: "RBF-only decay rate; other kernels keep fixed parameters.",
    reset: "Reset",
    value: "similarity",
    dot: "dot",
    distanceSquared: "distance^2",
    note: "Compare every point with the chosen anchor. Notice how each kernel means a different kind of close."
  },
  zh: {
    title: "核相似度实验台",
    anchor: "锚点",
    kernel: "核函数",
    gamma: "RBF gamma",
    gammaNote: "只影响 RBF 的衰减速度；其他核函数保持固定参数。",
    reset: "重置",
    value: "相似度",
    dot: "点积",
    distanceSquared: "距离平方",
    note: "把每个点都和选中的锚点比较。注意每种核函数对“接近”的理解不同。"
  }
};

export default function KernelSimilarityLab({ lang, initialKernel = "rbf" }: { lang: Locale; initialKernel?: KernelName }) {
  const labels = copy[lang];
  const [anchorId, setAnchorId] = useState("a");
  const [activeKernel, setActiveKernel] = useState<KernelName>(initialKernel);
  const [rbfGamma, setRbfGamma] = useState(0.5);
  const anchor = useMemo(() => kernelPoints.find((point) => point.id === anchorId) ?? kernelPoints[0], [anchorId]);
  const rows = useMemo(() => labKernelRows(activeKernel, anchor, rbfGamma), [activeKernel, anchor, rbfGamma]);
  const gammaEnabled = activeKernel === "rbf";
  const activeExplanation =
    activeKernel === "rbf"
      ? `${kernelCopy[activeKernel].formula}, gamma = ${formatKernelNumber(rbfGamma, lang)}: ${kernelCopy[activeKernel].explanation[lang]}`
      : `${kernelCopy[activeKernel].formula}: ${kernelCopy[activeKernel].explanation[lang]} ${labels.gammaNote}`;

  return (
    <section className="circuit-sat-demo" aria-label={labels.title}>
      <div className="state-panel">
        <p className="state-label">{labels.title}</p>
        <div className="circuit-sat-row-grid">
          {kernelPoints.map((point) => (
            <button
              key={point.id}
              type="button"
              className={point.id === anchor.id ? "active" : ""}
              aria-pressed={point.id === anchor.id}
              onClick={() => setAnchorId(point.id)}
              aria-label={`${labels.anchor}: ${point.label}`}
            >
              {point.label}
            </button>
          ))}
        </div>
        <div className="circuit-sat-row-grid">
          {kernelOrder.map((name) => (
            <button
              key={name}
              type="button"
              className={name === activeKernel ? "active" : ""}
              aria-pressed={name === activeKernel}
              onClick={() => setActiveKernel(name)}
              aria-label={`${labels.kernel}: ${kernelCopy[name].label[lang]}`}
            >
              {kernelCopy[name].label[lang]}
            </button>
          ))}
        </div>
        <div className={`circuit-sat-row-grid ${gammaEnabled ? "" : "kernel-lab-gamma-muted"}`} role="group" aria-label={labels.gamma}>
          {rbfGammaValues.map((gamma) => (
            <button
              key={gamma}
              type="button"
              className={gammaEnabled && gamma === rbfGamma ? "active" : ""}
              aria-pressed={gammaEnabled && gamma === rbfGamma}
              disabled={!gammaEnabled}
              onClick={() => setRbfGamma(gamma)}
              aria-label={`${labels.gamma}: ${gamma}`}
            >
              {`gamma ${gamma}`}
            </button>
          ))}
        </div>
        <div className="controls">
          <button
            type="button"
            onClick={() => {
              setAnchorId("a");
              setActiveKernel(initialKernel);
              setRbfGamma(defaultKernelParams.gamma);
            }}
          >
            {labels.reset}
          </button>
        </div>
        <p aria-live="polite">{activeExplanation}</p>
        <p>{labels.note}</p>
      </div>

      <div className="pnp-card-grid">
        {rows.map((row) => (
          <article key={row.point.id} className={`pnp-card ${row.point.id === anchor.id ? "accept" : ""}`}>
            <strong>{`${anchor.label} -> ${row.point.label}`}</strong>
            <output className="kernel-lab-score">{formatLabValue(row.value, lang, activeKernel)}</output>
            <p>{`${labels.value}; ${labels.dot} ${formatKernelNumber(row.dot, lang)}, ${labels.distanceSquared} ${formatKernelNumber(row.squaredDistance, lang)}`}</p>
          </article>
        ))}
      </div>
      <style>{`
        .kernel-lab-gamma-muted button {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .kernel-lab-score {
          display: block;
          margin-top: 6px;
        }
      `}</style>
    </section>
  );
}
