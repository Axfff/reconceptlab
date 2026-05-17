import type { Locale } from "../../i18n/locales";
import { pathFor, pointById, points, scenarios, toScreen, type GrahamScenario } from "./grahamScanTrace";

type Props = {
  lang: Locale;
  scenarioId: GrahamScenario["id"];
};

const orientationLabels = {
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
} as const;

function edgePath(from: string, to: string) {
  return pathFor([from, to]);
}

export default function GrahamScenarioFigure({ lang, scenarioId }: Props) {
  const scenario = scenarios[scenarioId];
  const highlighted = new Set(scenario.layers.highlightedPoints ?? []);
  const violating = new Set(scenario.layers.violatingPoints ?? []);
  const activeTriple = new Set(scenario.layers.activeTriple ?? scenario.state?.triple ?? []);
  const activePoint = scenario.state?.activePoint;
  const poppedPoint = scenario.state?.poppedPoint;

  return (
    <figure className="graham-scenario-figure" data-testid={scenario.testId}>
      <figcaption>
        <strong>{scenario.title[lang]}</strong>
        <span>{scenario.summary[lang]}</span>
      </figcaption>
      <svg viewBox="0 0 340 290" role="img" aria-label={scenario.ariaLabel[lang]}>
        {scenario.layers.hullPolygon ? <path className="hull-fill" d={pathFor(scenario.layers.hullPolygon, true)} /> : null}
        {scenario.layers.edges?.map((edge) => (
          <path key={`${edge.from}-${edge.to}-${edge.variant ?? "edge"}`} className={`scenario-edge ${edge.variant ?? ""}`} d={edgePath(edge.from, edge.to)} />
        ))}
        {scenario.layers.rays?.map((ray) => {
          const start = pointById.get(ray.from);
          const end = pointById.get(ray.to);
          if (!start || !end) return null;
          const a = toScreen(start);
          const b = toScreen(end);
          const labelX = a.x + (b.x - a.x) * 0.58;
          const labelY = a.y + (b.y - a.y) * 0.58;
          return (
            <g key={`${ray.from}-${ray.to}-${ray.label ?? ""}`}>
              <line className={`scenario-ray ${ray.variant ?? ""}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              {ray.label ? <text className="ray-label" x={labelX} y={labelY - 4}>{ray.label}</text> : null}
            </g>
          );
        })}
        {scenario.layers.activeTriple ? <path className={`triple-path ${scenario.state?.orientation ?? ""}`} d={pathFor(scenario.layers.activeTriple)} /> : null}

        {points.map((point) => {
          const screen = toScreen(point);
          const classNames = [
            point.id === "A" ? "anchor" : "",
            point.id === activePoint ? "active" : "",
            point.id === poppedPoint ? "popped" : "",
            highlighted.has(point.id) ? "highlighted" : "",
            violating.has(point.id) ? "violating" : "",
            activeTriple.has(point.id) ? "in-triple" : ""
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
      <p className="scenario-annotation">
        {scenario.expectedAnnotation[lang]}
        {scenario.state?.orientation ? ` (${orientationLabels[lang][scenario.state.orientation]})` : ""}
      </p>
      <p>{scenario.caption[lang]}</p>
    </figure>
  );
}
