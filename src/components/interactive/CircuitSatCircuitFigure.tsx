import type { Locale } from "../../i18n/locales";
import { circuitSatCircuit, evaluateCircuit, textFor, type AssignmentString, type Bit, type WireId } from "./circuitSatTrace";

function bitLabel(value: Bit | undefined) {
  return value === undefined ? "?" : String(value);
}

export function CircuitSatSvg({
  lang,
  assignment = "1010",
  currentId,
  visibleValues,
  markerId = `circuit-sat-arrow-${lang}`
}: {
  lang: Locale;
  assignment?: AssignmentString;
  currentId?: string;
  visibleValues?: Array<{ id: WireId; value: Bit }>;
  markerId?: string;
}) {
  const result = evaluateCircuit(circuitSatCircuit, assignment);
  const values = new Map<WireId, Bit>();
  if (visibleValues) {
    for (const item of visibleValues) values.set(item.id, item.value);
  } else if (result.assignment) {
    for (const input of circuitSatCircuit.inputs) values.set(input, result.assignment[input]);
    for (const step of result.gateSteps) values.set(step.id, step.output);
  }

  const gateClass = (id: string) => `circuit-sat-gate ${currentId === id ? "current" : ""}`;
  const inputClass = (id: string) => `circuit-sat-switch ${currentId === id ? "current" : ""}`;

  return (
    <svg viewBox="0 0 760 320" role="img" aria-label={textFor(lang, "Circuit-SAT fixture circuit", "Circuit-SAT 固定示例电路")}>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {[
        [95, 70, 235, 70],
        [95, 130, 165, 130],
        [225, 130, 235, 90],
        [95, 190, 235, 170],
        [95, 250, 235, 205],
        [315, 88, 405, 128],
        [315, 188, 405, 152],
        [485, 140, 580, 132],
        [95, 130, 405, 232],
        [95, 250, 405, 248],
        [485, 240, 580, 168]
      ].map(([x1, y1, x2, y2], index) => (
        <line key={index} className="circuit-sat-wire" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${markerId})`} />
      ))}
      <line className="circuit-sat-output-wire" x1="660" y1="150" x2="712" y2="150" markerEnd={`url(#${markerId})`} />

      {circuitSatCircuit.inputs.map((id, index) => (
        <g key={id} transform={`translate(62, ${70 + index * 60})`}>
          <rect className={inputClass(id)} x="-34" y="-22" width="68" height="44" rx="8" />
          <text textAnchor="middle" y="-2">{id}</text>
          <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get(id))}</text>
        </g>
      ))}

      <g transform="translate(195, 130)">
        <rect className={gateClass("n1")} x="-34" y="-20" width="68" height="40" rx="8" />
        <text textAnchor="middle" y="4">NOT</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">n1={bitLabel(values.get("n1"))}</text>
      </g>
      <g transform="translate(275, 88)">
        <rect className={gateClass("g1")} x="-40" y="-24" width="80" height="48" rx="8" />
        <text textAnchor="middle" y="2">AND</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">g1={bitLabel(values.get("g1"))}</text>
      </g>
      <g transform="translate(275, 188)">
        <rect className={gateClass("g2")} x="-40" y="-24" width="80" height="48" rx="8" />
        <text textAnchor="middle" y="2">OR</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">g2={bitLabel(values.get("g2"))}</text>
      </g>
      <g transform="translate(445, 140)">
        <rect className={gateClass("g3")} x="-40" y="-24" width="80" height="48" rx="8" />
        <text textAnchor="middle" y="2">AND</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">g3={bitLabel(values.get("g3"))}</text>
      </g>
      <g transform="translate(445, 240)">
        <rect className={gateClass("g4")} x="-40" y="-24" width="80" height="48" rx="8" />
        <text textAnchor="middle" y="2">AND</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">g4={bitLabel(values.get("g4"))}</text>
      </g>
      <g transform="translate(620, 150)">
        <rect className={gateClass("z")} x="-40" y="-24" width="80" height="48" rx="8" />
        <text textAnchor="middle" y="2">OR</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">z={bitLabel(values.get("z"))}</text>
      </g>
      <g transform="translate(724, 150)">
        <circle className={values.get("z") === 1 ? "accept" : values.get("z") === 0 ? "reject" : ""} r="25" />
        <text textAnchor="middle" y="5">{bitLabel(values.get("z"))}</text>
      </g>
    </svg>
  );
}

export default function CircuitSatCircuitFigure({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "A circuit asks whether some switch setting turns the lamp on", "电路问题问：是否有某个开关设置能点亮灯")}</strong>
        <span>{textFor(lang, "Inputs are switches, gates apply Boolean rules, wires carry bits forward, and z=1 means the output lamp turns on.", "输入是开关，逻辑门执行布尔规则，导线把 bit 向前传，z=1 表示输出灯亮。")}</span>
      </figcaption>
      <div className="circuit-sat-legend" aria-label={textFor(lang, "Gate legend", "逻辑门图例")}>
        <span>{textFor(lang, "switch = input bit", "开关 = 输入 bit")}</span>
        <span>1 AND 0 = 0</span>
        <span>1 OR 0 = 1</span>
        <span>NOT 0 = 1</span>
        <span>{textFor(lang, "lamp on means output 1", "灯亮表示输出 1")}</span>
      </div>
      <CircuitSatSvg lang={lang} assignment="1010" />
    </figure>
  );
}
