import type { Locale } from "../../i18n/locales";
import {
  evaluateFormula,
  satFormula,
  textFor,
  type AssignmentString,
  type Bit,
  type FormulaNodeId
} from "./satTrace";

function bitLabel(value: Bit | undefined) {
  return value === undefined ? "?" : String(value);
}

export function SatFormulaTreeSvg({
  lang,
  assignment = "1010",
  currentId,
  visibleValues,
  markerId = `sat-formula-arrow-${lang}`
}: {
  lang: Locale;
  assignment?: AssignmentString;
  currentId?: FormulaNodeId;
  visibleValues?: Array<{ id: FormulaNodeId; value: Bit }>;
  markerId?: string;
}) {
  const result = evaluateFormula(satFormula, assignment);
  const values = new Map<FormulaNodeId, Bit>();
  if (visibleValues) {
    for (const item of visibleValues) values.set(item.id, item.value);
  } else {
    for (const step of result.formulaSteps) values.set(step.id, step.output);
  }

  const nodeClass = (id: FormulaNodeId) => `circuit-sat-gate ${currentId === id ? "current" : ""}`;
  const leafClass = (id: FormulaNodeId) => `circuit-sat-switch ${currentId === id ? "current" : ""}`;

  return (
    <svg viewBox="0 0 760 360" role="img" aria-label={textFor(lang, "SAT formula tree for phi", "SAT 公式 phi 的表达式树")}>
      <defs>
        <marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" />
        </marker>
      </defs>
      {[
        [380, 76, 250, 126],
        [380, 76, 540, 126],
        [250, 176, 82, 252],
        [250, 176, 222, 252],
        [250, 176, 386, 252],
        [222, 252, 164, 318],
        [386, 252, 326, 318],
        [386, 252, 446, 318],
        [540, 176, 540, 252],
        [540, 176, 658, 252]
      ].map(([x1, y1, x2, y2], index) => (
        <line key={index} className="circuit-sat-wire" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${markerId})`} />
      ))}

      <g transform="translate(380, 52)">
        <rect className={nodeClass("or-root")} x="-54" y="-24" width="108" height="48" rx="8" />
        <text textAnchor="middle" y="1">root OR</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">root={bitLabel(values.get("or-root"))}</text>
      </g>
      <g transform="translate(250, 152)">
        <rect className={nodeClass("and-left")} x="-70" y="-24" width="140" height="48" rx="8" />
        <text textAnchor="middle" y="1">{textFor(lang, "left AND", "左侧 AND")}</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">{bitLabel(values.get("and-left"))}</text>
      </g>
      <g transform="translate(540, 152)">
        <rect className={nodeClass("and-right")} x="-70" y="-24" width="140" height="48" rx="8" />
        <text textAnchor="middle" y="1">{textFor(lang, "right AND", "右侧 AND")}</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="18">{bitLabel(values.get("and-right"))}</text>
      </g>
      <g transform="translate(82, 276)">
        <rect className={leafClass("x1-left")} x="-38" y="-22" width="76" height="44" rx="8" />
        <text textAnchor="middle" y="-2">x1</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get("x1-left"))}</text>
      </g>
      <g transform="translate(222, 276)">
        <rect className={nodeClass("not-x2-left")} x="-48" y="-22" width="96" height="44" rx="8" />
        <text textAnchor="middle" y="-2">NOT x2</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get("not-x2-left"))}</text>
      </g>
      <g transform="translate(164, 336)">
        <rect className={leafClass("x2-left")} x="-38" y="-18" width="76" height="36" rx="8" />
        <text textAnchor="middle" y="4">x2={bitLabel(values.get("x2-left"))}</text>
      </g>
      <g transform="translate(386, 276)">
        <rect className={nodeClass("or-x3-x4")} x="-60" y="-22" width="120" height="44" rx="8" />
        <text textAnchor="middle" y="-2">x3 OR x4</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get("or-x3-x4"))}</text>
      </g>
      <g transform="translate(326, 336)">
        <rect className={leafClass("x3-left")} x="-38" y="-18" width="76" height="36" rx="8" />
        <text textAnchor="middle" y="4">x3={bitLabel(values.get("x3-left"))}</text>
      </g>
      <g transform="translate(446, 336)">
        <rect className={leafClass("x4-left")} x="-38" y="-18" width="76" height="36" rx="8" />
        <text textAnchor="middle" y="4">x4={bitLabel(values.get("x4-left"))}</text>
      </g>
      <g transform="translate(540, 276)">
        <rect className={leafClass("x2-right")} x="-38" y="-22" width="76" height="44" rx="8" />
        <text textAnchor="middle" y="-2">x2</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get("x2-right"))}</text>
      </g>
      <g transform="translate(658, 276)">
        <rect className={leafClass("x4-right")} x="-38" y="-22" width="76" height="44" rx="8" />
        <text textAnchor="middle" y="-2">x4</text>
        <text className="circuit-sat-bit" textAnchor="middle" y="16">{bitLabel(values.get("x4-right"))}</text>
      </g>
    </svg>
  );
}

export default function SatFormulaRuleFigure({ lang }: { lang: Locale }) {
  const result = evaluateFormula(satFormula, "1010");

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "A formula asks whether some switch setting makes the whole rule true", "公式问题问：是否有某个开关设置让整条规则为真")}</strong>
        <span>{textFor(lang, "The root OR means either the left sub-rule or the right sub-rule can satisfy the alarm.", "根 OR 表示左侧子规则或右侧子规则任意一边成立，都能满足警报规则。")}</span>
      </figcaption>
      <div className="circuit-sat-legend" aria-label={textFor(lang, "Formula legend", "公式图例")}>
        {satFormula.variables.map((variable) => (
          <span key={variable}>{variable}={result.assignment?.[variable]}</span>
        ))}
        <span>{textFor(lang, "left sub-rule: x1 AND NOT x2 AND (x3 OR x4)", "左侧子规则：x1 AND NOT x2 AND (x3 OR x4)")}</span>
        <span>{textFor(lang, "right sub-rule: x2 AND x4", "右侧子规则：x2 AND x4")}</span>
        <span>{textFor(lang, "final lamp: true", "最终灯：true")}</span>
      </div>
      <SatFormulaTreeSvg lang={lang} assignment="1010" />
    </figure>
  );
}
