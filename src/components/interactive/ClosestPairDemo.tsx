import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { ui } from "../../i18n/ui";
import {
  allCrossPairs,
  bandOnlyCrossPairs,
  cellForId,
  cellRect,
  cellSize,
  distanceById,
  finalPair,
  formatDistance,
  gridWindowCrossPairs,
  pairKey,
  pairPath,
  points,
  r,
  splitX,
  toScreen,
  trace,
  type Pair,
  type Phase
} from "./closestPairTrace";

type Mode = "all" | "band" | "grid";

const phaseLabels: Record<Locale, Record<Phase, string>> = {
  en: {
    naive: "Naive",
    split: "Split",
    recurse: "Recurse",
    threshold: "Band",
    grid: "Grid",
    check: "Check",
    done: "Done"
  },
  zh: {
    naive: "朴素",
    split: "分割",
    recurse: "递归",
    threshold: "带状区域",
    grid: "网格",
    check: "检查",
    done: "完成"
  }
};

const labels = {
  en: {
    mode: "Mode",
    all: "All cross pairs",
    band: "Band only",
    grid: "Grid window",
    phase: "Phase",
    currentR: "r",
    cellSize: "cell side",
    activePair: "Active pair",
    bestPair: "Best pair",
    checked: "Checked",
    category: "Categories",
    empty: "none"
  },
  zh: {
    mode: "模式",
    all: "所有跨边界点对",
    band: "只看带内",
    grid: "网格窗口",
    phase: "阶段",
    currentR: "r",
    cellSize: "格子边长",
    activePair: "当前点对",
    bestPair: "最佳点对",
    checked: "已检查",
    category: "类别",
    empty: "无"
  }
};

const modePairs: Record<Mode, Pair[]> = {
  all: allCrossPairs,
  band: bandOnlyCrossPairs,
  grid: gridWindowCrossPairs
};

export default function ClosestPairDemo({ lang }: { lang: Locale }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("grid");
  const state = trace[step];
  const checkedSet = useMemo(() => new Set(state.checkedPairs.map(pairKey)), [state.checkedPairs]);
  const activePairKey = state.activePair ? pairKey(state.activePair) : "";
  const bestPairKey = state.bestPair ? pairKey(state.bestPair) : "";
  const modePairSet = useMemo(() => new Set(modePairs[mode].map(pairKey)), [mode]);
  const splitScreenX = 30 + splitX * 30;
  const bandLeft = 30 + (splitX - r) * 30;
  const bandWidth = r * 60;
  const activeCell = state.activeCell ? cellRect(state.activeCell) : undefined;
  const neighborCells = state.neighborCells ?? [];
  const showGrid = mode === "grid" || state.phase === "grid" || state.phase === "check" || state.phase === "done";

  return (
    <section className="closest-pair-demo" aria-label="Closest pair divide and conquer demo">
      <div className="closest-demo-grid">
        <div className="closest-plot-wrap">
          <svg viewBox="0 0 340 255" role="img" aria-label={state.explanation[lang]}>
            <rect className="closest-band" x={bandLeft} y="20" width={bandWidth} height="210" />
            <line className="closest-split" x1={splitScreenX} y1="20" x2={splitScreenX} y2="230" />
            <text className="closest-axis-label" x={splitScreenX + 4} y="34">x={splitX}</text>

            {showGrid ? neighborCells.map((cell) => {
              const rect = cellRect(cell);
              return <rect key={cell} className="closest-cell neighbor" x={rect.x} y={rect.y} width={rect.width} height={rect.height} />;
            }) : null}
            {showGrid && activeCell ? <rect className="closest-cell active" x={activeCell.x} y={activeCell.y} width={activeCell.width} height={activeCell.height} /> : null}

            {modePairs[mode].map((pair) => {
              const key = pairKey(pair);
              const classNames = [
                "closest-pair",
                modePairSet.has(key) ? "candidate" : "",
                checkedSet.has(key) ? "checked" : "",
                key === activePairKey ? "active" : "",
                key === bestPairKey ? "best" : "",
                key !== activePairKey && key !== bestPairKey && !checkedSet.has(key) ? "faded" : ""
              ].filter(Boolean).join(" ");
              return <path key={`${mode}-${key}`} className={classNames} d={pairPath(pair)} />;
            })}

            {points.map((point) => {
              const screen = toScreen(point);
              const classNames = [
                "closest-point",
                point.x < splitX ? "left-side" : "right-side",
                state.activePoint === point.id ? "highlighted" : ""
              ].filter(Boolean).join(" ");
              return (
                <g key={point.id} transform={`translate(${screen.x}, ${screen.y})`}>
                  <circle className={classNames} r="9" />
                  <text textAnchor="middle" y="4">{point.id}</text>
                  <title>{`${point.id} (${point.x}, ${point.y}), cell ${cellForId(point.id)}`}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="closest-state">
          <p className="state-label">{labels[lang].phase}</p>
          <ol className="phase-list closest-phase-list" aria-label={labels[lang].phase}>
            {(["naive", "split", "recurse", "threshold", "grid", "check", "done"] as Phase[]).map((phase) => (
              <li key={phase} className={phase === state.phase ? "current" : ""}>{phaseLabels[lang][phase]}</li>
            ))}
          </ol>

          <p aria-live="polite">{state.explanation[lang]}</p>

          <div className="mode-group" role="group" aria-label={labels[lang].mode}>
            {(["all", "band", "grid"] as Mode[]).map((candidate) => (
              <button key={candidate} type="button" className={candidate === mode ? "active" : ""} onClick={() => setMode(candidate)}>
                {labels[lang][candidate]}
              </button>
            ))}
          </div>

          <div className="closest-lines">
            <div className="graham-line"><strong>{labels[lang].currentR}:</strong><span>{formatDistance(r)}</span></div>
            <div className="graham-line"><strong>{labels[lang].cellSize}:</strong><span>{formatDistance(cellSize)}</span></div>
            <div className="graham-line"><strong>{labels[lang].checked}:</strong><span>{state.checkedPairs.length}</span></div>
            <div className="graham-line"><strong>{labels[lang].activePair}:</strong><span>{state.activePair?.join("-") ?? labels[lang].empty}</span></div>
            <div className="graham-line"><strong>{labels[lang].bestPair}:</strong><span>{state.bestPair?.join("-") ?? labels[lang].empty}</span></div>
          </div>

          <div className="chip-group">
            <strong>{labels[lang].category}</strong>
            <div className="chips">
              {state.pairCategories
                ? Object.entries(state.pairCategories).map(([category, pairs]) => (
                    <span key={category}>{category}: {pairs.map((pair) => pair.join("-")).join(", ")}</span>
                  ))
                : <span>{labels[lang].empty}</span>}
            </div>
          </div>

          {state.bestPair ? (
            <p className="closest-result">
              {state.bestPair.join("-")} = {formatDistance(distanceById(state.bestPair))}
              {pairKey(state.bestPair) === pairKey(finalPair) ? (lang === "en" ? " (final)" : "（最终）") : ""}
            </p>
          ) : null}

          <div className="controls">
            <button type="button" onClick={() => setStep((value) => Math.min(value + 1, trace.length - 1))}>{ui[lang].step}</button>
            <button type="button" onClick={() => setStep(0)}>{ui[lang].reset}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
