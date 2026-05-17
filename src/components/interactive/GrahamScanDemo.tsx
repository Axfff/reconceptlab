import { useMemo, useState } from "react";
import { ui } from "../../i18n/ui";
import type { Locale } from "../../i18n/locales";
import {
  finalHull,
  pathFor,
  pointById,
  points,
  toScreen,
  trace,
  type Orientation,
  type Phase
} from "./grahamScanTrace";

const phaseLabels: Record<Locale, Record<Phase, string>> = {
  en: {
    anchor: "Anchor",
    sort: "Sort",
    scan: "Scan",
    done: "Done"
  },
  zh: {
    anchor: "锚点",
    sort: "排序",
    scan: "扫描",
    done: "完成"
  }
};

const labels = {
  en: {
    stack: "Stack",
    sortedOrder: "Sorted order",
    next: "Next",
    orientation: "Orientation",
    popped: "Popped",
    finalHull: "Final hull",
    empty: "empty",
    phase: "Phase"
  },
  zh: {
    stack: "栈",
    sortedOrder: "排序顺序",
    next: "下一个",
    orientation: "方向测试",
    popped: "弹出",
    finalHull: "最终凸包",
    empty: "空",
    phase: "阶段"
  }
};

const orientationLabels: Record<Locale, Record<Orientation, string>> = {
  en: {
    left: "left turn",
    right: "right turn",
    collinear: "collinear"
  },
  zh: {
    left: "左转",
    right: "右转",
    collinear: "共线"
  }
};

export default function GrahamScanDemo({ lang }: { lang: Locale }) {
  const [step, setStep] = useState(0);
  const state = trace[step];
  const stackSet = useMemo(() => new Set(state.stack), [state.stack]);
  const tripleSet = useMemo(() => new Set(state.triple ?? []), [state.triple]);
  const activePoint = state.activePoint;
  const visibleSortedOrder = state.visibleSortedCount === undefined ? state.sortedOrder : state.sortedOrder.slice(0, state.visibleSortedCount);
  const nextPoint = activePoint ?? (state.phase === "done" ? undefined : state.sortedOrder[state.activeSortedIndex ?? 0]);
  const orientationText = state.orientation && state.triple
    ? `orient(${state.triple.join(", ")}) = ${orientationLabels[lang][state.orientation]}`
    : "";

  return (
    <section className="graham-scan-demo" aria-label="Graham Scan convex hull demo">
      <div className="graham-demo-grid">
        <div className="graham-plot-wrap">
          <svg viewBox="0 0 340 290" role="img" aria-label={state.explanation[lang]}>
            {state.sortedOrder.length > 0 && state.phase === "sort"
              ? state.sortedOrder.map((id) => {
                  const start = pointById.get("A");
                  const end = pointById.get(id);
                  if (!start || !end) return null;
                  const a = toScreen(start);
                  const b = toScreen(end);
                  return <line key={`ray-${id}`} className="angle-ray" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
                })
              : null}
            {state.stack.length > 1 ? <path className="stack-path" d={pathFor(state.stack, state.phase === "done")} /> : null}
            {state.phase === "done" ? <path className="hull-fill" d={pathFor(finalHull, true)} /> : null}
            {state.triple ? <path className={`triple-path ${state.orientation ?? ""}`} d={pathFor(state.triple)} /> : null}

            {points.map((point) => {
              const screen = toScreen(point);
              const classNames = [
                point.id === "A" ? "anchor" : "",
                point.id === activePoint ? "active" : "",
                point.id === state.poppedPoint ? "popped" : "",
                stackSet.has(point.id) ? "in-stack" : "",
                tripleSet.has(point.id) ? "in-triple" : ""
              ].filter(Boolean).join(" ");
              return (
                <g key={point.id} transform={`translate(${screen.x}, ${screen.y})`}>
                  <circle className={classNames} r="13" />
                  <text textAnchor="middle" y="5">{point.id}</text>
                  <title>{`${point.id} (${point.x}, ${point.y})`}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="graham-state">
          <p className="state-label">{labels[lang].phase}</p>
          <ol className="phase-list" aria-label={labels[lang].phase}>
            {(["anchor", "sort", "scan", "done"] as Phase[]).map((phase) => (
              <li key={phase} className={phase === state.phase ? "current" : ""}>
                {phaseLabels[lang][phase]}
              </li>
            ))}
          </ol>

          <p aria-live="polite">{state.explanation[lang]}</p>

          <div className="graham-line">
            <strong>{labels[lang].next}:</strong>
            <span>{nextPoint ?? labels[lang].empty}</span>
          </div>

          {orientationText ? (
            <div className={`graham-line orientation ${state.orientation}`}>
              <strong>{labels[lang].orientation}:</strong>
              <span>{orientationText}</span>
            </div>
          ) : null}

          {state.poppedPoint ? (
            <div className="graham-line popped-line">
              <strong>{labels[lang].popped}:</strong>
              <span>{state.poppedPoint}</span>
            </div>
          ) : null}

          <div className="chip-group">
            <strong>{labels[lang].sortedOrder}</strong>
            <div className="chips">
              {visibleSortedOrder.length > 0
                ? visibleSortedOrder.map((id, index) => (
                    <span key={id} className={index === state.activeSortedIndex ? "active-chip" : index < (state.activeSortedIndex ?? -1) ? "past-chip" : ""}>
                      {id}
                    </span>
                  ))
                : <span>{labels[lang].empty}</span>}
            </div>
          </div>

          <div className="chip-group">
            <strong>{labels[lang].stack}</strong>
            <div className="chips">
              {state.stack.length > 0 ? state.stack.map((id) => <span key={id}>{id}</span>) : <span>{labels[lang].empty}</span>}
            </div>
          </div>

          {state.phase === "done" ? (
            <div className="chip-group">
              <strong>{labels[lang].finalHull}</strong>
              <div className="chips">{finalHull.map((id) => <span key={id}>{id}</span>)}</div>
            </div>
          ) : null}

          <div className="controls">
            <button type="button" onClick={() => setStep((value) => Math.min(value + 1, trace.length - 1))}>
              {ui[lang].step}
            </button>
            <button type="button" onClick={() => setStep(0)}>
              {ui[lang].reset}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
