import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { circuitSatCircuit as sharedCircuit } from "./circuitSatTrace";
import { textFor } from "./circuitSatTrace";
import {
  answerPreservationRows,
  assignmentExtensionRows,
  builderRows,
  consistencyRailRows,
  duplicatedSubgraphData,
  formalBlueprintText,
  gadgetRows,
  graphCardText,
  cheatedAssignment,
  cheatedConstraint,
  outputAssertionContrastRows,
  practiceCards,
  reductionMisconceptions,
  sizeClaimText,
  sizeRows,
  sourceCircuit,
  variableRoleLegend
} from "./circuitSatToSatTrace";

type ExpansionRow = {
  gateId: string;
  expanded: string;
};

function gateById(circuitId: string) {
  return sourceCircuit.gates.find((gate) => gate.id === circuitId);
}

function expandGateExpression(circuitId: string, seen = new Set<string>()): string {
  if (seen.has(circuitId)) {
    return circuitId;
  }

  const gate = gateById(circuitId);
  if (!gate) return circuitId;

  const next = new Set(seen);
  next.add(circuitId);
  const inputs = gate.inputs.map((input) =>
    isSourceInput(input)
      ? input
      : expandGateExpression(input, next)
  );

  if (gate.op === "NOT") {
    return `NOT ${inputs[0]}`;
  }
  return `(${inputs.join(` ${gate.op} `)})`;
}

function isSourceInput(value: string): value is "x1" | "x2" | "x3" | "x4" {
  return sourceCircuit.inputs.includes(value as "x1" | "x2" | "x3" | "x4");
}

function expansionRows(circuit = sharedCircuit): ExpansionRow[] {
  return circuit.gates.map((gate) => ({
    gateId: gate.id,
    expanded: `${gate.id} = ${expandGateExpression(gate.id)}`
  }));
}

function renderAssignments(row: Array<{ id: "x1" | "x2" | "x3" | "x4"; value: 0 | 1 }>) {
  return row.map((item) => `${item.id}=${item.value}`).join(", ");
}

function renderValues(row: Array<{ id: string; value: 0 | 1 }>) {
  return row.map((item) => `${item.id}=${item.value}`).join(", ");
}

export function CircuitSatToSatProblemBridge({ lang }: { lang: Locale }) {
  const sourceRows = sharedCircuit.gates.map((gate) => `${gate.id} = ${gate.expression}`);

  return (
    <figure className="reduction-figure">
      <figcaption>
        <strong>{textFor(lang, "Reduction bridge", "归约桥")}</strong>
        <span>{textFor(lang, "Build one SAT formula for this fixed circuit instance.", "对这个固定电路实例构造一个 SAT 公式。")}</span>
      </figcaption>
      <div className="reduction-pipeline">
        <div className="reduction-card">
          <strong>{textFor(lang, "Source instance C", "源实例 C")}</strong>
          <p>{textFor(lang, "four inputs, six gates, one output", "4 个输入，6 个门，1 个输出")}</p>
          <code>{sourceRows.join(" ; ")}</code>
        </div>
        <div className="reduction-arrow-card active">
          <strong>f</strong>
          <span>{textFor(lang, "local gate constraints + final z", "局部门约束 + 最终 z")}</span>
        </div>
        <div className="reduction-card">
          <strong>{textFor(lang, "Target formula Φ_C", "目标公式 Φ_C")}</strong>
          <p>{textFor(lang, "one formula that is satisfiable iff z can be 1", "可满足当且仅当 z 能取 1")}</p>
          <code>{formalBlueprintText[lang]}</code>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatToSatAnswerPreservationCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Answer-preservation bridge", "答案保持桥")}</strong>
        <span>{textFor(lang, "Shared rows compare circuit output and formula output.", "复用共享示例赋值，对比电路输出和归约后公式输出。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "assignment", "赋值")}</th>
            <th>{textFor(lang, "C(a)", "C(a)")}</th>
            <th>{textFor(lang, "conjunction without z", "去 z 的合取")}</th>
          <th>{textFor(lang, "final Φ_C(â)", "最终 Φ_C(â)")}</th>
            <th>{textFor(lang, "note", "注解")}</th>
          </tr>
        </thead>
        <tbody>
          {answerPreservationRows.map((row) => (
            <tr key={row.assignment}>
              <th scope="row">{row.assignment}</th>
              <td>{row.circuitOutput}</td>
              <td>{row.reductionOutputNoZ}</td>
              <td>{row.reductionOutput}</td>
              <td>{row.note[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatToSatForwardWitnessCard({ lang }: { lang: Locale }) {
  const witnessRows = answerPreservationRows.filter((row) => row.circuitOutput === 1);

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Forward witnesses", "正向见证")} </strong>
        <span>{textFor(lang, "Assignments with C(a)=1 extend to satisfy Φ_C(â).", "C(a)=1 的赋值可扩展为满足 Φ_C 的赋值。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "assignment", "赋值")}</th>
            <th>{textFor(lang, "C(a)", "C(a)")}</th>
            <th>{textFor(lang, "conjunction without z", "去 z 的合取")}</th>
            <th>{textFor(lang, "final Φ_C(â)", "最终 Φ_C(â)")}</th>
          </tr>
        </thead>
        <tbody>
          {witnessRows.map((row) => (
            <tr key={row.assignment}>
              <th scope="row">{row.assignment}</th>
              <td>{row.circuitOutput}</td>
              <td>{row.reductionOutputNoZ}</td>
              <td>{row.reductionOutput}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatToSatBackwardProjectionCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Backward reconstruction", "反向重建")} </strong>
        <span>{textFor(lang, "Start from a satisfying formula assignment b, restrict it to b|inputs|, then rebuild gate outputs in topological order.", "从满足公式的赋值 b 出发，把它限制到 b|inputs|，再按拓扑顺序重算门值。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {assignmentExtensionRows.map((row) => (
          <article key={row.assignment} className="pnp-card">
            <strong>{textFor(lang, "Satisfying witness b", "满足赋值 b")} = {row.assignment}</strong>
            <p>{textFor(lang, "inputs in b|inputs|", "b|inputs| 中的输入")}: {renderAssignments(row.inputValues)}</p>
            <p>{textFor(lang, "extended helper values", "扩展后的辅助变量值")}: {renderValues(row.extendedValues)}</p>
            <p>{textFor(lang, "restricted row b|inputs|", "限制后的 b|inputs|")}: {renderAssignments(row.restrictedValues)}</p>
          </article>
        ))}
        <article className="pnp-card reject">
          <strong>{textFor(lang, "Cheating assignment check", "作弊赋值检查")}</strong>
          <p>{textFor(lang, "If a formula assignment is inconsistent on helpers, the local clauses reject it.", "若某些辅助变量与门式冲突，局部约束会拒绝该赋值。")}</p>
          <p>{textFor(lang, "Cheating witness on base inputs 0000:", "以 0000 为底的作弊示例：")}</p>
          <p>{renderValues(cheatedAssignment)}</p>
          <p>{cheatedConstraint.text[lang]}</p>
        </article>
      </div>
    </figure>
  );
}

export function CircuitSatToSatInlineExpansionFigure({ lang }: { lang: Locale }) {
  const rows = expansionRows();
  const finalExpanded = expandGateExpression("z");

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Naive inline expansion", "朴素内联展开")}</strong>
        <span>{textFor(lang, "This reads `z` and repeatedly substitutes gate RHS terms.", "读 `z` 并反复替换右端表达式。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <div className="pnp-card">
          <strong>{textFor(lang, "Gate-level substitutions", "门级替换")}</strong>
          {rows.map((line) => (
            <p key={line.gateId}>{line.expanded}</p>
          ))}
        </div>
        <div className="pnp-card accept">
          <strong>{textFor(lang, "Fully inlined z", "完全内联后的 z")}</strong>
          <code>{`z = ${finalExpanded}`}</code>
        </div>
      </div>
      <p>{textFor(lang, "This preserves meaning but can duplicate shared subexpressions many times.", "该方法保持语义，但会反复复制共享子表达式。")}</p>
    </figure>
  );
}

export function CircuitSatToSatDuplicationStrip({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Fan-out duplication snapshot", "扇出复制快照")}</strong>
        <span>{duplicatedSubgraphData.note[lang]}</span>
      </figcaption>
      <div className="circuit-sat-bridge">
        <div className="pnp-card">
          <strong>{textFor(lang, "Shared subexpression", "共享子表达式")}</strong>
          <code>{duplicatedSubgraphData.before}</code>
          <span>{duplicatedSubgraphData.copyCount.before[lang]}</span>
        </div>
        <div className="circuit-sat-row-grid">
          <span className="accept">{`=>`}</span>
        </div>
        <div className="pnp-card reject">
          <strong>{textFor(lang, "Expanded formula", "展开公式")}</strong>
          <code>{duplicatedSubgraphData.after}</code>
          <span>{duplicatedSubgraphData.copyCount.after[lang]}</span>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatToSatGateGadgetGallery({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Local gate gadgets", "局部门模板")}</strong>
        <span>{textFor(lang, "Each gate has one helper and two emitted clauses in constant size.", "每个门有一个辅助变量，两个常量规模的发射约束。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {gadgetRows.map((gadget) => (
          <article key={gadget.id} className="pnp-card">
            <strong>{gadget.label[lang]}</strong>
            <p>{textFor(lang, "Blueprint", "蓝图")}: {gadget.blueprint}</p>
            <p>{textFor(lang, "Emitted", "实际输出")}: {gadget.emitted}</p>
            <p>{gadget.note[lang]}</p>
            <table className="pnp-mini-table">
              <thead>
                <tr>
                  <th>{textFor(lang, "inputs", "输入")}</th>
                  <th>{textFor(lang, "output", "输出")}</th>
                </tr>
              </thead>
              <tbody>
                {gadget.truth.map((entry) => (
                  <tr key={`${gadget.id}-${entry.input}`}>
                    <td>{entry.input}</td>
                    <td>{entry.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </div>
    </figure>
  );
}

export function CircuitSatToSatVariableRoleLegend({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Variable roles", "变量角色")}</strong>
        <span>{textFor(lang, "Inputs stay as inputs. Every non-input node gets one helper variable.", "输入保持不变。每个非输入节点都得到一个辅助变量。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <article className="pnp-card">
          <strong>{textFor(lang, "Inputs", "输入变量")}</strong>
          <p>{variableRoleLegend.inputs[lang]}</p>
        </article>
        <article className="pnp-card">
          <strong>{textFor(lang, "Helpers", "辅助变量")}</strong>
          <p>{variableRoleLegend.helpers[lang]}</p>
        </article>
      </div>
    </figure>
  );
}

export function CircuitSatToSatAssignmentExtensionStrip({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Assignment extension and projection", "赋值扩展与限制")}</strong>
        <span>{textFor(lang, "Extend x1..x4 to all helper variables. Restriction keeps only inputs.", "把 x1..x4 扩展到所有辅助变量；限制操作只保留输入。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {assignmentExtensionRows.map((row) => (
          <article key={row.assignment} className="pnp-card">
            <strong>{row.assignment}</strong>
            <p>{textFor(lang, "input row", "输入行")}: {renderAssignments(row.inputValues)}</p>
            <p>{textFor(lang, "extended row", "扩展后")}: {renderValues(row.extendedValues)}</p>
            <p>{textFor(lang, "restricted row", "限制后")}: {renderAssignments(row.restrictedValues)}</p>
          </article>
        ))}
      </div>
    </figure>
  );
}

export function CircuitSatToSatFormalCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Formal construction", "形式化构造")}</strong>
        <span>{textFor(lang, "The emitted constraints are real SAT clauses and use AND/OR/NOT only.", "发出的约束才是实际 SAT 公式，仅包含 AND/OR/NOT。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <div className="pnp-card">
          <strong>{textFor(lang, "Blueprint", "可读蓝图")}</strong>
          <p>{formalBlueprintText[lang]}</p>
        </div>
        <div className="pnp-card">
          <strong>{textFor(lang, "Emit (actual)", "实际 emit")}</strong>
          {builderRows.map((row) => (
            <p key={row.gateId}>{`emit(${row.gateId}) = ${row.emitted}`}</p>
          ))}
          <p>{textFor(lang, "append final", "再乘上")} <code>z</code></p>
        </div>
      </div>
    </figure>
  );
}

export function CircuitSatToSatOutputAssertionCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Dedicated AND z contrast", "独立 AND z 对照")}</strong>
        <span>{textFor(lang, "Local consistency can be true while z=0. AND z is the acceptance filter.", "局部门约束可能为真，z 可能为 0。AND z 用作接受过滤器。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "assignment", "赋值")}</th>
            <th>{textFor(lang, "gate constraints", "门约束合取")}</th>
            <th>z</th>
            <th>Φ_C</th>
            <th>{textFor(lang, "note", "说明")}</th>
          </tr>
        </thead>
        <tbody>
          {outputAssertionContrastRows.map((row) => (
            <tr key={row.assignment}>
              <th scope="row">{row.assignment}</th>
              <td>{row.gateConstraintValue}</td>
              <td>{row.zValue}</td>
              <td>{row.finalValue}</td>
              <td>{row.statement[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatToSatBuilderTable({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Builder table", "构建表")}</strong>
        <span>{textFor(lang, "One emitted clause pair per gate, in topological order.", "按拓扑顺序逐门输出约束。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "step", "步骤")}</th>
            <th>{textFor(lang, "gate/helper", "门 / 辅助变量")}</th>
            <th>{textFor(lang, "blueprint", "蓝图")}</th>
            <th>{textFor(lang, "emitted", "局部约束")}</th>
          </tr>
        </thead>
        <tbody>
          {builderRows.map((row) => (
            <tr key={row.gateId}>
              <th scope="row">{row.step}</th>
              <td>{row.gateId}</td>
              <td><code>{row.blueprint}</code></td>
              <td><code>{row.emitted}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatToSatConsistencyRail({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Consistency rail", "一致性轨道")}</strong>
        <span>{textFor(lang, "Each helper is constrained by already-known earlier values.", "每个辅助变量都由已处理过的更早节点值决定。")}</span>
      </figcaption>
      <div className="circuit-sat-rail">
        {consistencyRailRows.map((row) => (
          <div key={row.gateId}>
            <strong>{row.gateId}</strong>
            <span>{row.statement[lang]}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function CircuitSatToSatSizeStack({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Size stack", "规模栈")}</strong>
        <span>{sizeClaimText[lang]}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr><th>{textFor(lang, "kind", "类型")}</th><th>{textFor(lang, "count", "数量")}</th></tr>
        </thead>
        <tbody>
          {sizeRows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label[lang]}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function CircuitSatToSatTwoDirectionsLedger({ lang }: { lang: Locale }) {
  const forward = answerPreservationRows.find((row) => row.assignment === "1010");
  const backward = answerPreservationRows.find((row) => row.assignment === "1010");
  const forwardTruth =
    forward === undefined
      ? ""
      : `${forward.assignment}: C(a)=${forward.circuitOutput} -> Φ_C(â)=${forward.reductionOutput}`;
  const backwardTruth =
    backward === undefined
      ? ""
      : lang === "zh"
        ? `b=${backward.assignment}: Φ_C(b)=${backward.reductionOutput} => C(b|inputs|)=${backward.circuitOutput}`
        : `b=${backward.assignment}: Φ_C(b)=${backward.reductionOutput} => C(b|inputs|)=${backward.circuitOutput}`;

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Correctness directions", "正确性方向")}</strong>
        <span>{textFor(lang, "Both directions are required for equivalence.", "等价性要求双向都成立。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <article className="pnp-card accept">
          <strong>{textFor(lang, "Forward (C(a)=1 => Φ_C(â)=1)", "正向：C(a)=1 => Φ_C(â)=1")}</strong>
          <p>{forwardTruth}</p>
        </article>
        <article className="pnp-card accept">
          <strong>{textFor(lang, "Backward (Φ_C(b)=1 => C(b|inputs|)=1)", "反向：Φ_C(b)=1 => C(b|inputs|)=1")}</strong>
          <p>{backwardTruth}</p>
        </article>
      </div>
    </figure>
  );
}

export function CircuitSatToSatMisconceptionCards({ lang }: { lang: Locale }) {
  const [openId, setOpenId] = useState(reductionMisconceptions[0]?.id);

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT to SAT common confusions", "Circuit-SAT 到 SAT 的常见混淆")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Common confusions", "常见混淆")}</strong>
          <p>{textFor(lang, "Keep shorthand, order, and helper roles explicit.", "始终把蓝图、顺序、辅助变量角色讲清。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {reductionMisconceptions.map((card) => {
          const open = openId === card.id;
          return (
            <article key={card.id} className={`pnp-card exercise ${open ? "active" : ""}`}>
              <button type="button" className="circuit-sat-card-button" onClick={() => setOpenId(open ? reductionMisconceptions[0]?.id : card.id)} aria-expanded={open}>
                <strong>{card.title[lang]}</strong>
              </button>
              <p>{card.prompt[lang]}</p>
              {open ? <p><strong>{textFor(lang, "Repair:", "修正：")}</strong> {card.fix[lang]}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CircuitSatToSatPracticeCards({ lang }: { lang: Locale }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <section className="circuit-sat-demo" aria-label={textFor(lang, "Circuit-SAT to SAT practice cards", "Circuit-SAT 到 SAT 练习卡片")}>
      <div className="pnp-demo-header">
        <div>
          <strong>{textFor(lang, "Practice the reduction", "练习归约")}</strong>
          <p>{textFor(lang, "Classify fixtures and malformed handling by reduction semantics.", "按归约语义分类固定示例与格式错误处理。")}</p>
        </div>
      </div>
      <div className="pnp-card-grid">
        {practiceCards.map((card) => {
          const selected = answers[card.id];
          const selectedChoice = card.choices.find((choice) => choice.id === selected);

          return (
            <article key={card.id} className={`pnp-card exercise ${selectedChoice?.correct ? "accept" : selectedChoice ? "reject" : ""}`}>
              <strong>{card.prompt[lang]}</strong>
              <div className="pnp-tabs" aria-label={textFor(lang, "Answer choices", "答案选项")}>
                {card.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={selected === choice.id ? "active" : ""}
                    aria-pressed={selected === choice.id}
                    onClick={() => setAnswers({ ...answers, [card.id]: choice.id })}
                  >
                    {choice.label[lang]}
                  </button>
                ))}
              </div>
              <p aria-live="polite">
                {selectedChoice
                  ? `${selectedChoice.correct ? textFor(lang, "Correct.", "正确。") : textFor(lang, "Try again.", "再想想。")} ${card.explanation[lang]}`
                  : textFor(lang, "Choose an answer to check this item.", "选择答案以检验。")}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CircuitSatToSatGraphStrip({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Local graph context", "局部图上下文")}</strong>
        <span>{graphCardText[lang]}</span>
      </figcaption>
      <div className="circuit-sat-graph-strip">
        <div className="active"><strong>polynomial-time-reductions</strong><p>{textFor(lang, "answer-preserving translators", "答案保持翻译器")}</p></div>
        <span>{"→"}</span>
        <div className="active"><strong>circuit-sat</strong><p>{textFor(lang, "source SAT instance", "源问题")}</p></div>
        <span>{"→"}</span>
        <div className="active"><strong>sat</strong><p>{textFor(lang, "target language", "目标语言")}</p></div>
        <span>{"→"}</span>
        <div className="active"><strong>circuit-sat-to-sat</strong><p>{textFor(lang, "this node", "本节点")}</p></div>
      </div>
    </figure>
  );
}
