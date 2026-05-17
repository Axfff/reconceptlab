import type { Locale } from "../../i18n/locales";
import {
  eventsById,
  finalReportedPairs,
  pairKey,
  scenarios,
  screenIntersection,
  segmentPath,
  segments,
  toScreen,
  trace,
  type BentleyScenario,
  type Pair,
  type SegmentId
} from "./bentleyOttmannTrace";

type Props = {
  lang: Locale;
  scenarioId: BentleyScenario["id"];
};

const labels = {
  en: {
    status: "Status after",
    queue: "Queue after",
    tested: "Tested",
    scheduled: "Scheduled",
    stale: "Stale removed",
    reported: "Reported",
    none: "none",
    checks: "Checks",
    reports: "Reports",
    endpoints: "Endpoint events",
    intersections: "Intersection events"
  },
  zh: {
    status: "事件后状态",
    queue: "事件后队列",
    tested: "测试",
    scheduled: "加入事件",
    stale: "移除过期事件",
    reported: "已报告",
    none: "无",
    checks: "检查",
    reports: "报告",
    endpoints: "端点事件",
    intersections: "交点事件"
  }
} as const;

function formatList(values: string[], lang: Locale) {
  return values.length > 0 ? values.join(", ") : labels[lang].none;
}

function formatPairs(pairs: Pair[], lang: Locale) {
  return pairs.length > 0 ? pairs.map((pair) => pairKey(pair)).join(", ") : labels[lang].none;
}

function eventLabel(id: string, lang: Locale) {
  return eventsById.get(id)?.label[lang] ?? id;
}

function pairMatrix(lang: Locale) {
  const ids: SegmentId[] = ["A", "B", "C", "D"];
  const reported = new Set(finalReportedPairs.map(pairKey));
  return (
    <table className="bentley-mini-table">
      <thead>
        <tr>
          <th>{labels[lang].checks}</th>
          <th>{labels[lang].reports}</th>
        </tr>
      </thead>
      <tbody>
        {ids.flatMap((first, firstIndex) =>
          ids.slice(firstIndex + 1).map((second) => {
            const key = pairKey([first, second]);
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>{reported.has(key) ? "yes" : "no"}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function ledger(lang: Locale) {
  return (
    <div className="bentley-ledger">
      <div>
        <strong>2n</strong>
        <span>{labels[lang].endpoints}: 8</span>
      </div>
      <div>
        <strong>k</strong>
        <span>{labels[lang].intersections}: 3</span>
      </div>
      <div>
        <strong>O(log n)</strong>
        <span>status + queue</span>
      </div>
    </div>
  );
}

function proofFrames(lang: Locale) {
  const copy = {
    en: ["after previous event q", "no event in between", "adjacent before p"],
    zh: ["前一事件 q 之后", "中间没有事件", "到 p 前已经相邻"]
  } as const;
  return (
    <div className="bentley-proof-frames" aria-label={scenarios["correctness-frames"].ariaLabel[lang]}>
      {copy[lang].map((label, index) => (
        <div key={label}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function sweepSvg(stepId?: string) {
  const state = stepId ? trace.find((candidate) => candidate.id === stepId) : undefined;
  const activeSegments = new Set(state?.statusAfter ?? []);
  const activePair = new Set(state?.activePair ?? []);
  const reported = new Set((state?.reportedIntersections ?? finalReportedPairs).map(pairKey));

  return (
    <svg viewBox="0 0 390 320" role="img" aria-label={state?.explanation.en ?? "Bentley-Ottmann segment sweep figure"}>
      {state ? (
        <>
          <line className="bentley-sweep-line" x1={toScreen({ x: state.sweepX, y: 0 }).x} x2={toScreen({ x: state.sweepX, y: 0 }).x} y1="32" y2="292" />
          <text className="bentley-axis-label" x={toScreen({ x: state.sweepX, y: 0 }).x + 6} y="48">x</text>
        </>
      ) : null}
      {segments.map((segment) => {
        const isActive = activeSegments.has(segment.id);
        const inPair = activePair.has(segment.id);
        return (
          <path
            key={segment.id}
            className={["bentley-segment", isActive ? "active" : "", inPair ? "in-pair" : ""].filter(Boolean).join(" ")}
            d={segmentPath(segment)}
          />
        );
      })}
      {segments.map((segment) => {
        const mid = toScreen({
          x: (segment.from.x + segment.to.x) / 2,
          y: (segment.from.y + segment.to.y) / 2
        });
        return <text key={`label-${segment.id}`} className="bentley-segment-label" x={mid.x + 7} y={mid.y - 7}>{segment.id}</text>;
      })}
      {finalReportedPairs.map((pair) => {
        const point = screenIntersection(pair);
        if (!point) return null;
        const visible = reported.has(pairKey(pair));
        return (
          <g key={pairKey(pair)} className={visible ? "reported" : "future"}>
            <circle className="bentley-intersection" cx={point.x} cy={point.y} r="7" />
            <text className="bentley-intersection-label" x={point.x + 9} y={point.y - 8}>{pairKey(pair)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function traceDetails(scenario: BentleyScenario, lang: Locale) {
  if (!scenario.traceStepId) return null;
  const state = trace.find((candidate) => candidate.id === scenario.traceStepId);
  if (!state) return null;
  return (
    <dl className="bentley-trace-details">
      <div>
        <dt>{labels[lang].status}</dt>
        <dd>{formatList(state.statusAfter, lang)}</dd>
      </div>
      <div>
        <dt>{labels[lang].queue}</dt>
        <dd>{formatList(state.queueAfter.map((id) => eventLabel(id, lang)), lang)}</dd>
      </div>
      <div>
        <dt>{labels[lang].tested}</dt>
        <dd>{formatPairs(state.testedPairs, lang)}</dd>
      </div>
      <div>
        <dt>{labels[lang].scheduled}</dt>
        <dd>{formatList(state.scheduledEvents.map((id) => eventLabel(id, lang)), lang)}</dd>
      </div>
      <div>
        <dt>{labels[lang].stale}</dt>
        <dd>{formatList(state.removedStaleEvents.map((id) => eventLabel(id, lang)), lang)}</dd>
      </div>
    </dl>
  );
}

export default function BentleyOttmannScenarioFigure({ lang, scenarioId }: Props) {
  const scenario = scenarios[scenarioId];
  const stepId = scenario.traceStepId;
  const isMatrix = scenarioId === "naive-pair-matrix";
  const isLedger = scenarioId === "output-sensitive-count" || scenarioId === "complexity-ledger";
  const isProof = scenarioId === "correctness-frames";

  return (
    <figure className="bentley-scenario-figure" data-testid={scenario.testId}>
      <figcaption>
        <strong>{scenario.title[lang]}</strong>
        <span>{scenario.summary[lang]}</span>
      </figcaption>
      {isMatrix ? pairMatrix(lang) : isLedger ? ledger(lang) : isProof ? proofFrames(lang) : sweepSvg(stepId)}
      {traceDetails(scenario, lang)}
      <p className="scenario-annotation">{scenario.expectedAnnotation[lang]}</p>
      <p>{scenario.caption[lang]}</p>
    </figure>
  );
}
