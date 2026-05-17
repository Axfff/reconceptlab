import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { candidateRows, circuit, demoTabs, verifyCircuit, textFor } from "./pnpTrace";

type Tab = (typeof demoTabs)[number];

const tabLabels: Record<Tab, Record<Locale, string>> = {
  "search all assignments": {
    en: "Search",
    zh: "搜索"
  },
  "check certificate": {
    en: "Check",
    zh: "检查"
  },
  "P subset NP": {
    en: "P subset NP",
    zh: "P 属于 NP"
  }
};

function tabDescription(tab: Tab, lang: Locale) {
  if (tab === "search all assignments") {
    return textFor(lang, "Search scans candidates. It may get lucky, but worst-case search has no lucky-order promise.", "搜索会扫描候选。它可能走运，但最坏情况没有走运顺序的保证。");
  }
  if (tab === "check certificate") {
    return textFor(lang, "Checking starts with one proposed assignment and evaluates the circuit gate by gate.", "检查从一个给定赋值开始，然后逐个逻辑门求值。");
  }
  return textFor(lang, "This verifier is not the circuit verifier: it uses an empty certificate and runs the P solver directly.", "这个验证器不是电路验证器：它使用空证书，并直接运行 P 求解器。");
}

export default function FindVsCheckDemo({ lang }: { lang: Locale }) {
  const [activeTab, setActiveTab] = useState<Tab>("search all assignments");
  const [stepIndex, setStepIndex] = useState(0);
  const acceptTrace = verifyCircuit(circuit, candidateRows[0].assignment).trace;
  const searchRows = ["011", "001", "010", "100", "101", "111", "110"];
  const maxStep = activeTab === "check certificate" ? acceptTrace.length : activeTab === "search all assignments" ? searchRows.length - 1 : 1;
  const boundedStep = Math.min(stepIndex, maxStep);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setStepIndex(0);
  };

  return (
    <section className="pnp-demo" aria-label={textFor(lang, "Find versus check demo", "寻找与检查演示")}>
      <div className="pnp-tabs" role="tablist" aria-label={textFor(lang, "Demo modes", "演示模式")}>
        {demoTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => selectTab(tab)}
          >
            {tabLabels[tab][lang]}
          </button>
        ))}
      </div>

      <div className="pnp-demo-panel" role="tabpanel">
        <p aria-live="polite">{tabDescription(activeTab, lang)}</p>

        {activeTab === "search all assignments" ? (
          <div className="pnp-search-grid">
            {searchRows.map((row, index) => (
              <span key={row} className={index < boundedStep ? "reject" : index === boundedStep && row === "110" ? "accept" : index === boundedStep ? "current" : ""}>
                {row}
              </span>
            ))}
            <p>{boundedStep === searchRows.length - 1 ? textFor(lang, "Found 110. One accepting row proves Yes.", "找到 110。一个可接受行就证明 Yes。") : textFor(lang, "Still checking candidates.", "仍在检查候选。")}</p>
          </div>
        ) : null}

        {activeTab === "check certificate" ? (
          <div className="pnp-transcript" aria-label={textFor(lang, "Circuit trace transcript", "电路追踪文字记录")}>
            {acceptTrace.map((step, index) => (
              <div key={step.gateId} className={index === boundedStep ? "active" : ""}>
                <strong>{step.gateId} {step.op}</strong>
                <span>{step.explanation[lang]}</span>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "P subset NP" ? (
          <div className="pnp-flow">
            <span className="pnp-badge">{textFor(lang, "not the circuit verifier", "不是电路验证器")}</span>
            <div className={boundedStep === 0 ? "active" : ""}><strong>{textFor(lang, "Yes instance", "Yes 实例")}</strong><span>{textFor(lang, "empty certificate -> P solver says Yes -> accept", "空证书 -> P 求解器回答 Yes -> 接受")}</span></div>
            <div className={boundedStep === 1 ? "active" : ""}><strong>{textFor(lang, "No instance", "No 实例")}</strong><span>{textFor(lang, "empty certificate -> P solver says No -> reject", "空证书 -> P 求解器回答 No -> 拒绝")}</span></div>
          </div>
        ) : null}

        <div className="controls">
          <button type="button" onClick={() => setStepIndex((value) => Math.max(value - 1, 0))} disabled={boundedStep === 0}>{textFor(lang, "Back", "上一步")}</button>
          <button type="button" onClick={() => setStepIndex((value) => Math.min(value + 1, maxStep))} disabled={boundedStep === maxStep}>{textFor(lang, "Step", "下一步")}</button>
          <button type="button" onClick={() => setStepIndex(0)}>{textFor(lang, "Reset", "重置")}</button>
        </div>
      </div>
    </section>
  );
}
