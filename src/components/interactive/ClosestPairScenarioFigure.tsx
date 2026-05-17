import type { Locale } from "../../i18n/locales";
import {
  activeFGridWindowPairs,
  allCrossPairs,
  bandOnlyCrossPairs,
  boundaryFixture,
  cellForId,
  cellRect,
  distanceById,
  duplicateFixture,
  finalPair,
  formatDistance,
  gridWindowCrossPairs,
  leftClosestPair,
  pairPath,
  pointById,
  points,
  r,
  rightClosestPair,
  scenarios,
  splitX,
  toScreen,
  type CellKey,
  type ClosestPairScenario,
  type Pair
} from "./closestPairTrace";

type Props = {
  lang: Locale;
  scenarioId: ClosestPairScenario["id"];
};

const labels = {
  en: {
    n: "n",
    checks: "checks",
    category: "Category",
    status: "Status",
    step: "Step",
    trace: "Trace state",
    level: "Level",
    work: "Work",
    input: "Input",
    expected: "Expected"
  },
  zh: {
    n: "n",
    checks: "检查次数",
    category: "类别",
    status: "状态",
    step: "步骤",
    trace: "追踪状态",
    level: "层级",
    work: "工作量",
    input: "输入",
    expected: "期望结果"
  }
};

function midpoint(pair: Pair) {
  const a = pointById.get(pair[0]);
  const b = pointById.get(pair[1]);
  if (!a || !b) return { x: 0, y: 0 };
  const pa = toScreen(a);
  const pb = toScreen(b);
  return { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
}

function tableFor(scenario: ClosestPairScenario, lang: Locale) {
  if (scenario.layers.table === "pair-count") {
    const rows = [
      { n: 5, checks: 10 },
      { n: 20, checks: 190 },
      { n: 1000, checks: 499500 }
    ];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].n}</th><th>{labels[lang].checks}</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.n}><td>{row.n}</td><td>{row.checks.toLocaleString("en-US")}</td></tr>)}</tbody>
      </table>
    );
  }

  if (scenario.layers.table === "classification") {
    const rows = lang === "en"
      ? [
          ["left-left", "solved by the left recursive call"],
          ["right-right", "solved by the right recursive call"],
          ["cross", "checked only in the merge"]
        ]
      : [
          ["左-左", "由左侧递归调用解决"],
          ["右-右", "由右侧递归调用解决"],
          ["跨边界", "只在合并阶段检查"]
        ];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].category}</th><th>{labels[lang].status}</th></tr></thead>
        <tbody>{rows.map(([category, status]) => <tr key={category}><td>{category}</td><td>{status}</td></tr>)}</tbody>
      </table>
    );
  }

  if (scenario.layers.table === "code-trace") {
    const rows = lang === "en"
      ? [
          ["sortByX(points)", "split-created"],
          ["n <= 3 bruteForce", "recursion-scaffold"],
          ["r = min(rLeft, rRight)", "threshold-chosen"],
          ["filter threshold band", "threshold-band-only"],
          ["check grid window", "active-window-f"]
        ]
      : [
          ["sortByX(points)", "split-created"],
          ["n <= 3 bruteForce", "recursion-scaffold"],
          ["r = min(rLeft, rRight)", "threshold-chosen"],
          ["过滤阈值带", "threshold-band-only"],
          ["检查网格窗口", "active-window-f"]
        ];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].step}</th><th>{labels[lang].trace}</th></tr></thead>
        <tbody>{rows.map(([step, trace]) => <tr key={trace}><td>{step}</td><td>{trace}</td></tr>)}</tbody>
      </table>
    );
  }

  if (scenario.layers.table === "complexity") {
    const rows = lang === "en"
      ? [["0", "n"], ["1", "n"], ["2", "n"], ["log n", "n"]]
      : [["0", "n"], ["1", "n"], ["2", "n"], ["log n", "n"]];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].level}</th><th>{labels[lang].work}</th></tr></thead>
        <tbody>{rows.map(([level, work]) => <tr key={level}><td>{level}</td><td>{work}</td></tr>)}</tbody>
      </table>
    );
  }

  if (scenario.layers.table === "packing") {
    const rows = lang === "en"
      ? [
          ["Left half", "no same-side pair < r"],
          ["Right half", "no same-side pair < r"],
          ["Local window", "constant relevant candidates"]
        ]
      : [
          ["左半边", "没有同侧点对 < r"],
          ["右半边", "没有同侧点对 < r"],
          ["局部窗口", "相关候选数量为常数"]
        ];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].category}</th><th>{labels[lang].status}</th></tr></thead>
        <tbody>{rows.map(([category, status]) => <tr key={category}><td>{category}</td><td>{status}</td></tr>)}</tbody>
      </table>
    );
  }

  if (scenario.layers.table === "edge-case") {
    const rows = scenario.id === "boundary-cell-rule"
      ? [
          ["Q(0.999, 0.5)", boundaryFixture.expectedCells.Q],
          ["P(1, 0.5)", boundaryFixture.expectedCells.P],
          ["R(2, 1)", boundaryFixture.expectedCells.R]
        ]
      : scenario.id === "duplicate-points"
        ? [[duplicateFixture.map((point) => `${point.id}(${point.x},${point.y})`).join(" "), "P-Q = 0"]]
        : [["dist(R,S) = r", lang === "en" ? "keep current best" : "保留当前最佳"]];
    return (
      <table className="closest-mini-table">
        <thead><tr><th>{labels[lang].input}</th><th>{labels[lang].expected}</th></tr></thead>
        <tbody>{rows.map(([input, expected]) => <tr key={input}><td>{input}</td><td>{expected}</td></tr>)}</tbody>
      </table>
    );
  }

  return null;
}

export default function ClosestPairScenarioFigure({ lang, scenarioId }: Props) {
  const scenario = scenarios[scenarioId];
  const highlighted = new Set(scenario.layers.highlightedPoints ?? []);
  const activeCellSet = new Set(scenario.layers.activeCells ?? []);
  const neighborCellSet = new Set(scenario.layers.neighborCells ?? []);
  const cellsToRender = Array.from(new Set([...activeCellSet, ...neighborCellSet, "4,2", "5,4", "6,3"] as CellKey[]));
  const table = tableFor(scenario, lang);
  const radiusPoint = scenario.layers.radiusPoint ? pointById.get(scenario.layers.radiusPoint) : undefined;
  const splitScreenX = 30 + splitX * 30;
  const bandLeft = 30 + (splitX - r) * 30;
  const bandWidth = r * 60;

  return (
    <figure className="closest-scenario-figure" data-testid={scenario.testId}>
      <figcaption>
        <strong>{scenario.title[lang]}</strong>
        <span>{scenario.summary[lang]}</span>
      </figcaption>

      {table ? table : (
        <svg viewBox="0 0 340 255" role="img" aria-label={scenario.ariaLabel[lang]}>
          {scenario.layers.band ? <rect className="closest-band" x={bandLeft} y="20" width={bandWidth} height="210" /> : null}
          {scenario.layers.splitLine ? (
            <g>
              <line className="closest-split" x1={splitScreenX} y1="20" x2={splitScreenX} y2="230" />
              <text className="closest-axis-label" x={splitScreenX + 4} y="34">x={splitX}</text>
            </g>
          ) : null}

          {scenario.layers.grid ? cellsToRender.map((cell) => {
            const rect = cellRect(cell);
            const classNames = [
              "closest-cell",
              activeCellSet.has(cell) ? "active" : "",
              neighborCellSet.has(cell) ? "neighbor" : ""
            ].filter(Boolean).join(" ");
            return <rect key={cell} className={classNames} x={rect.x} y={rect.y} width={rect.width} height={rect.height} />;
          }) : null}

          {radiusPoint ? (
            <circle className="closest-radius" cx={toScreen(radiusPoint).x} cy={toScreen(radiusPoint).y} r={r * 30} />
          ) : null}

          {scenario.layers.fadedPairs?.map((pair) => <path key={`faded-${pair.join("-")}`} className="closest-pair faded" d={pairPath(pair)} />)}
          {scenario.layers.checkedPairs?.map((pair) => <path key={`checked-${pair.join("-")}`} className="closest-pair checked" d={pairPath(pair)} />)}
          {scenario.layers.activePairs?.map((pair) => <path key={`active-${pair.join("-")}`} className="closest-pair active" d={pairPath(pair)} />)}
          {scenario.layers.highlightedPairs?.map((pair) => <path key={`best-${pair.join("-")}`} className="closest-pair best" d={pairPath(pair)} />)}

          {[leftClosestPair, rightClosestPair, finalPair].map((pair) => {
            const isVisible = scenario.layers.highlightedPairs?.some((candidate) => candidate.join("-") === pair.join("-"));
            if (!isVisible) return null;
            const point = midpoint(pair);
            return <text key={`label-${pair.join("-")}`} className="pair-label" x={point.x + 4} y={point.y - 6}>{pair.join("-")}</text>;
          })}

          {points.map((point) => {
            const screen = toScreen(point);
            const classNames = [
              "closest-point",
              point.x < splitX ? "left-side" : "right-side",
              highlighted.has(point.id) ? "highlighted" : ""
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
      )}

      <p className="scenario-annotation">{scenario.expectedAnnotation[lang]}</p>
      <p>{scenario.caption[lang]}</p>
      {scenarioId === "active-neighbor-cells" ? (
        <p className="scenario-detail">
          {lang === "en"
            ? `Active F pairs: ${activeFGridWindowPairs.map((pair) => pair.join("-")).join(", ")}. F-G distance ${formatDistance(distanceById(finalPair))}.`
            : `F 的候选点对：${activeFGridWindowPairs.map((pair) => pair.join("-")).join("、")}。F-G 距离 ${formatDistance(distanceById(finalPair))}。`}
        </p>
      ) : null}
      {scenarioId === "threshold-band" ? (
        <p className="scenario-detail">
          {lang === "en"
            ? `All cross pairs: ${allCrossPairs.length}. Band pairs: ${bandOnlyCrossPairs.length}. Grid-window pairs: ${gridWindowCrossPairs.length}.`
            : `所有跨边界点对：${allCrossPairs.length}。带内点对：${bandOnlyCrossPairs.length}。网格窗口点对：${gridWindowCrossPairs.length}。`}
        </p>
      ) : null}
    </figure>
  );
}
