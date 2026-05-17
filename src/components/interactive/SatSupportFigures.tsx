import type { Locale } from "../../i18n/locales";
import {
  assignmentRows,
  evaluateFormula,
  satFormula,
  textFor
} from "./satTrace";

export function SatVocabularyLegend({ lang }: { lang: Locale }) {
  const items = [
    { label: textFor(lang, "variable", "变量"), example: "x1", note: textFor(lang, "a named Boolean switch", "一个有名字的布尔开关") },
    { label: textFor(lang, "literal", "文字"), example: "NOT x2", note: textFor(lang, "a variable or its negation", "变量或变量的否定") },
    { label: textFor(lang, "subformula", "子公式"), example: "(x3 OR x4)", note: textFor(lang, "a smaller expression inside phi", "phi 内部较小的表达式") },
    { label: textFor(lang, "operator", "运算符"), example: "AND / OR / NOT", note: textFor(lang, "rules that combine truth values", "组合真值的规则") }
  ];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Pieces of the same formula", "同一个公式中的部件")}</strong>
        <span>{textFor(lang, "The vocabulary points into phi instead of introducing a second example.", "这些词汇都指向 phi，而不是另开一个例子。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {items.map((item) => (
          <div key={item.label} className="pnp-card">
            <strong>{item.label}: {item.example}</strong>
            <p>{item.note}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function SatFormalCard({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Formal decision language", "形式化判定语言")}</strong>
        <span>{textFor(lang, "After the concrete formula, phi means any Boolean formula over n variables.", "看过具体公式后，phi 表示任意含 n 个变量的布尔公式。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        <div className="pnp-card">
          <strong>phi</strong>
          <p>{textFor(lang, "a Boolean formula made from variables and operators", "由变量和运算符构成的布尔公式")}</p>
        </div>
        <div className="pnp-card">
          <strong>a in {"{0,1}"}^n</strong>
          <p>{textFor(lang, "one bit for each variable", "每个变量对应一位")}</p>
        </div>
        <div className="pnp-card accept">
          <strong>phi(a) = 1</strong>
          <p>{textFor(lang, "the whole expression evaluates to true", "整个表达式求值为 true")}</p>
        </div>
      </div>
    </figure>
  );
}

export function SatEvaluationTable({ lang }: { lang: Locale }) {
  const result = evaluateFormula(satFormula, "1010");

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Verifier implementation trace", "验证器实现追踪")}</strong>
        <span>{textFor(lang, "A concrete implementation stores each subformula value in the same bottom-up order every time.", "具体实现每次都按同样的自底向上顺序存储子公式值。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr>
            <th>{textFor(lang, "node", "节点")}</th>
            <th>{textFor(lang, "inputs read", "读取输入")}</th>
            <th>{textFor(lang, "stored output", "存储输出")}</th>
          </tr>
        </thead>
        <tbody>
          {result.formulaSteps.map((step) => (
            <tr key={step.id}>
              <th scope="row">{step.id}</th>
              <td>{step.dependencies.map((input) => `${input.id}=${input.value}`).join(", ")}</td>
              <td>{step.expression} = {step.output}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">{textFor(lang, "read root", "读取根节点")}</th>
            <td>root={result.output}</td>
            <td>{result.result}</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}

export function SatSubformulaInvariantRail({ lang }: { lang: Locale }) {
  const result = evaluateFormula(satFormula, "1010");

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Subformula invariant", "子公式不变量")}</strong>
        <span>{textFor(lang, "When a parent is evaluated, every child it reads already stores the correct truth value.", "当父节点被求值时，它读取的每个子节点都已经存有正确真值。")}</span>
      </figcaption>
      <div className="circuit-sat-rail">
        {result.formulaSteps.filter((step) => step.dependencies.some((input) => String(input.id).includes("-"))).map((step) => (
          <div key={step.id}>
            <strong>{step.id}</strong>
            <span>{step.dependencies.map((input) => input.id).join(" + ")} {"->"} {step.output}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function SatCostStack({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Cost stack", "成本堆栈")}</strong>
        <span>{textFor(lang, "Keep n assignment bits separate from |phi| formula occurrences and operator nodes.", "把 n 个赋值 bit 与 |phi| 个公式出现位置和运算符节点分开。")}</span>
      </figcaption>
      <div className="pnp-growth-grid">
        <div>
          <strong>{textFor(lang, "validate certificate", "检查证书")}</strong>
          <span>n = {satFormula.variables.length}</span>
          <p>{textFor(lang, "one bit per variable", "每个变量一位")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "evaluate formula", "求值公式")}</strong>
          <span>|phi| = {satFormula.size}</span>
          <p>{textFor(lang, "six variable occurrences plus five operator nodes", "六个变量出现位置加五个运算符节点")}</p>
        </div>
        <div>
          <strong>{textFor(lang, "blind search", "盲目搜索")}</strong>
          <span>2^n rows</span>
          <p>{textFor(lang, "may repeat the formula pass for every assignment", "可能对每个赋值重复公式求值")}</p>
        </div>
      </div>
    </figure>
  );
}

export function SatClaimLedger({ lang }: { lang: Locale }) {
  const rows = [
    {
      claim: textFor(lang, "SAT is in NP", "SAT 属于 NP"),
      treatment: textFor(lang, "proved here", "本页证明"),
      note: textFor(lang, "assignment length n; verifier runs in O(|phi| + n)", "赋值长度为 n；验证器运行时间为 O(|phi| + n)")
    },
    {
      claim: textFor(lang, "SAT is NP-hard or NP-complete", "SAT 是 NP-hard 或 NP-complete"),
      treatment: textFor(lang, "named as later context", "作为后续背景命名"),
      note: textFor(lang, "the proof needs reductions, not one fixture trace", "证明需要归约，而不是一个固定例子的追踪")
    },
    {
      claim: textFor(lang, "SAT already means CNF or 3SAT", "SAT 已经表示 CNF 或 3SAT"),
      treatment: textFor(lang, "future nodes", "后续节点"),
      note: textFor(lang, "this page uses arbitrary parenthesized formulas", "本页使用任意带括号的公式")
    }
  ];

  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Claim boundary ledger", "主张边界账本")}</strong>
        <span>{textFor(lang, "Membership in NP is shown here; reduction proofs stay outside this node.", "本页展示属于 NP；归约证明留在本节点之外。")}</span>
      </figcaption>
      <table className="pnp-mini-table">
        <thead>
          <tr><th>{textFor(lang, "claim", "主张")}</th><th>{textFor(lang, "treatment", "处理方式")}</th><th>{textFor(lang, "why", "原因")}</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.claim}>
              <th scope="row">{row.claim}</th>
              <td>{row.treatment}</td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function SatAssignmentSummary({ lang }: { lang: Locale }) {
  return (
    <figure className="circuit-sat-figure">
      <figcaption>
        <strong>{textFor(lang, "Fixture rows used throughout", "贯穿全页的固定赋值行")}</strong>
        <span>{textFor(lang, "Malformed examples are kept out of the truth table and shown in verifier/practice surfaces.", "格式错误例子不放入真值表，而放在验证器和练习中。")}</span>
      </figcaption>
      <div className="pnp-card-grid">
        {assignmentRows.slice(0, 3).map((row) => (
          <div key={row.id} className={`pnp-card ${row.result}`}>
            <strong>{row.assignment} {"->"} phi={row.output}</strong>
            <span>{row.reasonBadge[lang]}</span>
            <p>{row.note[lang]}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
