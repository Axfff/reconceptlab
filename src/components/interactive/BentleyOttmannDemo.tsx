import { useMemo, useState } from "react";
import type { Locale } from "../../i18n/locales";
import { ui } from "../../i18n/ui";
import {
  eventsById,
  pairKey,
  screenIntersection,
  segmentPath,
  segments,
  toScreen,
  trace,
  type Pair,
  type SweepPhase
} from "./bentleyOttmannTrace";

const phaseLabels: Record<Locale, Record<SweepPhase, string>> = {
  en: {
    setup: "Setup",
    endpoint: "Endpoint",
    intersection: "Intersection",
    done: "Done"
  },
  zh: {
    setup: "准备",
    endpoint: "端点",
    intersection: "交点",
    done: "完成"
  }
};

const labels = {
  en: {
    event: "Event",
    status: "Status",
    queue: "Future queue",
    tested: "Tested pairs",
    scheduled: "Scheduled",
    stale: "Stale removed",
    reported: "Reported",
    operation: "Operation",
    empty: "empty",
    prev: "Previous"
  },
  zh: {
    event: "事件",
    status: "状态表",
    queue: "未来事件队列",
    tested: "测试线段对",
    scheduled: "加入事件",
    stale: "移除过期事件",
    reported: "已报告",
    operation: "操作",
    empty: "空",
    prev: "上一步"
  }
} as const;

function eventLabel(id: string, lang: Locale) {
  return eventsById.get(id)?.label[lang] ?? id;
}

function formatPairs(pairs: Pair[], lang: Locale) {
  return pairs.length > 0 ? pairs.map((pair) => pairKey(pair)).join(", ") : labels[lang].empty;
}

function formatEvents(ids: string[], lang: Locale) {
  return ids.length > 0 ? ids.map((id) => eventLabel(id, lang)).join(", ") : labels[lang].empty;
}

export default function BentleyOttmannDemo({ lang }: { lang: Locale }) {
  const [stepIndex, setStepIndex] = useState(0);
  const state = trace[stepIndex];
  const activeSegments = useMemo(() => new Set(state.statusAfter), [state.statusAfter]);
  const activePair = useMemo(() => new Set(state.activePair ?? []), [state.activePair]);
  const reportedPairs = useMemo(() => new Set(state.reportedIntersections.map(pairKey)), [state.reportedIntersections]);

  return (
    <section className="bentley-demo" aria-label="Bentley-Ottmann sweep-line demo">
      <div className="bentley-demo-grid">
        <div className="bentley-plot-wrap">
          <svg viewBox="0 0 390 320" role="img" aria-label={state.explanation[lang]}>
            <line className="bentley-sweep-line" x1={toScreen({ x: state.sweepX, y: 0 }).x} x2={toScreen({ x: state.sweepX, y: 0 }).x} y1="32" y2="292" />
            {segments.map((segment) => (
              <path
                key={segment.id}
                className={[
                  "bentley-segment",
                  activeSegments.has(segment.id) ? "active" : "",
                  activePair.has(segment.id) ? "in-pair" : ""
                ].filter(Boolean).join(" ")}
                d={segmentPath(segment)}
              />
            ))}
            {segments.map((segment) => {
              const mid = toScreen({
                x: (segment.from.x + segment.to.x) / 2,
                y: (segment.from.y + segment.to.y) / 2
              });
              return <text key={`label-${segment.id}`} className="bentley-segment-label" x={mid.x + 7} y={mid.y - 7}>{segment.id}</text>;
            })}
            {(["A-C", "A-B", "B-C"] as const).map((key) => {
              const pair = key.split("-") as Pair;
              const point = screenIntersection(pair);
              if (!point) return null;
              return (
                <g key={key} className={reportedPairs.has(key) ? "reported" : "future"}>
                  <circle className="bentley-intersection" cx={point.x} cy={point.y} r="7" />
                  <text className="bentley-intersection-label" x={point.x + 9} y={point.y - 8}>{key}</text>
                </g>
              );
            })}
            <text className="bentley-axis-label" x={toScreen({ x: state.sweepX, y: 0 }).x + 6} y="48">x={state.sweepX.toFixed(2)}</text>
          </svg>
        </div>

        <div className="bentley-state">
          <p className="state-label">{labels[lang].event}</p>
          <ol className="phase-list bentley-phase-list" aria-label={labels[lang].event}>
            {trace.map((candidate, index) => (
              <li key={candidate.id} className={index === stepIndex ? "current" : ""}>
                {candidate.event.label[lang]}
              </li>
            ))}
          </ol>

          <p className="state-label">{phaseLabels[lang][state.phase]}</p>
          <p aria-live="polite">{state.explanation[lang]}</p>

          <div className="graham-line">
            <strong>{labels[lang].operation}:</strong>
            <span>{state.operation[lang]}</span>
          </div>

          <div className="chip-group">
            <strong>{labels[lang].status}</strong>
            <div className="chips">
              {state.statusAfter.length > 0 ? state.statusAfter.map((id) => <span key={id}>{id}</span>) : <span>{labels[lang].empty}</span>}
            </div>
          </div>

          <div className="chip-group">
            <strong>{labels[lang].queue}</strong>
            <div className="chips">
              {state.queueAfter.length > 0
                ? state.queueAfter.map((id) => <span key={id}>{eventLabel(id, lang)}</span>)
                : <span>{labels[lang].empty}</span>}
            </div>
          </div>

          <table className="bentley-event-table">
            <tbody>
              <tr>
                <th>{labels[lang].tested}</th>
                <td>{formatPairs(state.testedPairs, lang)}</td>
              </tr>
              <tr>
                <th>{labels[lang].scheduled}</th>
                <td>{formatEvents(state.scheduledEvents, lang)}</td>
              </tr>
              <tr>
                <th>{labels[lang].stale}</th>
                <td>{formatEvents(state.removedStaleEvents, lang)}</td>
              </tr>
              <tr>
                <th>{labels[lang].reported}</th>
                <td>{formatPairs(state.reportedIntersections, lang)}</td>
              </tr>
            </tbody>
          </table>

          <div className="controls">
            <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={stepIndex === 0}>
              {labels[lang].prev}
            </button>
            <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, trace.length - 1))} disabled={stepIndex === trace.length - 1}>
              {ui[lang].step}
            </button>
            <button type="button" onClick={() => setStepIndex(0)}>
              {ui[lang].reset}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
