import type { Locale } from "../../i18n/locales";
import {
  defaultKernelParams,
  dot,
  formatKernelNumber,
  kernelCopy,
  kernelPoints,
  kernelRows,
  quadraticFeatureMap,
  rbfDecayRows,
  rbfPainPoints,
  rbfPainRows,
  type KernelName
} from "./kernelTrace";

type ScenarioId =
  | "feature-map-lift"
  | "kernel-shortcut"
  | "linear-plane"
  | "polynomial-curves"
  | "rbf-dot-product-pain"
  | "rbf-decay-curve"
  | "rbf-neighborhood"
  | "sigmoid-saturation"
  | "graph-strip";

const scenarioText: Record<ScenarioId, { title: Record<Locale, string>; summary: Record<Locale, string> }> = {
  "feature-map-lift": {
    title: { en: "Lift first, compare later", zh: "先升维，再比较" },
    summary: {
      en: "A feature map rewrites one point into coordinates that expose the pattern a linear model needs.",
      zh: "特征映射把一个点改写成新坐标，让线性模型能看见需要的模式。"
    }
  },
  "kernel-shortcut": {
    title: { en: "The kernel shortcut", zh: "核函数捷径" },
    summary: {
      en: "A kernel returns the inner product after mapping, often without constructing the mapped vector.",
      zh: "核函数返回映射后的内积，通常不需要真的构造映射向量。"
    }
  },
  "linear-plane": {
    title: { en: "No lift: original-space similarity", zh: "不升维：原空间相似度" },
    summary: {
      en: "The linear kernel is just the dot product in the coordinates you already have.",
      zh: "线性核就是现有坐标中的点积。"
    }
  },
  "polynomial-curves": {
    title: { en: "Interactions create curved decisions", zh: "交互项制造弯曲边界" },
    summary: {
      en: "A degree-2 polynomial kernel can behave like a dot product over square and interaction features.",
      zh: "二次多项式核可以像在平方项和交互项上的点积。"
    }
  },
  "rbf-dot-product-pain": {
    title: { en: "A far same-direction house can fool the dot product", zh: "远处同方向房源会误导点积" },
    summary: {
      en: "After size and neighborhood features are normalized, local prediction should prefer the nearby house B over the far house E.",
      zh: "当面积和社区特征已经归一化后，局部预测应该优先使用近邻房源 B，而不是远处房源 E。"
    }
  },
  "rbf-decay-curve": {
    title: { en: "Exponential decay turns distance into locality", zh: "指数衰减把距离变成局部性" },
    summary: {
      en: "With gamma = 0.5, each larger squared distance pushes the RBF score closer to zero.",
      zh: "当 gamma = 0.5 时，距离平方越大，RBF 分数越接近 0。"
    }
  },
  "rbf-neighborhood": {
    title: { en: "Similarity fades with distance", zh: "相似度随距离衰减" },
    summary: {
      en: "RBF makes nearby points strongly similar and far points almost irrelevant.",
      zh: "RBF 让近点高度相似，让远点几乎不相关。"
    }
  },
  "sigmoid-saturation": {
    title: { en: "Squashed dot-product similarity", zh: "被压缩的点积相似度" },
    summary: {
      en: "The sigmoid kernel can saturate near -1 or 1, so parameter choices matter.",
      zh: "Sigmoid 核会饱和到接近 -1 或 1，因此参数选择很重要。"
    }
  },
  "graph-strip": {
    title: { en: "Kernel function path", zh: "核函数学习路径" },
    summary: {
      en: "Feature maps motivate kernels; named kernels choose different notions of similarity.",
      zh: "特征映射引出核函数；不同核函数选择不同的相似度含义。"
    }
  }
};

function scaleX(x: number) {
  return 160 + x * 58;
}

function scaleY(y: number) {
  return 145 - y * 42;
}

function scaleHouseX(x: number) {
  return 62 + x * 72;
}

function scaleHouseY(y: number) {
  return 220 - y * 42;
}

function formatRbfValue(value: number, lang: Locale) {
  if (value > 0 && value < 0.001) {
    return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
      maximumFractionDigits: 6,
      minimumFractionDigits: 6
    }).format(value);
  }

  return formatKernelNumber(value, lang);
}

function PointPlot({ highlight = "a" }: { highlight?: string }) {
  return (
    <svg viewBox="0 0 340 260" role="img" aria-label="Two-dimensional point plot">
      <rect x="18" y="18" width="304" height="214" rx="8" fill="var(--surface)" stroke="var(--line)" />
      <line x1="36" y1="145" x2="312" y2="145" stroke="var(--line)" />
      <line x1="160" y1="34" x2="160" y2="220" stroke="var(--line)" />
      {kernelPoints.map((point) => {
        const active = point.id === highlight;
        return (
          <g key={point.id}>
            <circle
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={active ? 10 : 7}
              fill={active ? "var(--accent-orange)" : "var(--accent-blue)"}
              stroke="var(--surface)"
              strokeWidth="2"
            />
            <text x={scaleX(point.x) + 12} y={scaleY(point.y) + 4}>
              {`${point.label} (${point.x}, ${point.y})`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ValueCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="pnp-card">
      <strong>{label}</strong>
      <output>{value}</output>
      {note ? <p>{note}</p> : null}
    </article>
  );
}

function KernelTable({ lang, name }: { lang: Locale; name: KernelName }) {
  const rows = kernelRows(name);
  return (
    <table className="pnp-mini-table">
      <caption>{lang === "en" ? `${kernelCopy[name].label.en} from anchor A` : `从锚点 A 出发的${kernelCopy[name].label.zh}`}</caption>
      <thead>
        <tr>
          <th>{lang === "en" ? "Point" : "点"}</th>
          <th>{lang === "en" ? "Dot" : "点积"}</th>
          <th>{lang === "en" ? "Distance^2" : "距离平方"}</th>
          <th>K(A, z)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.point.id}>
            <th scope="row">{row.point.label}</th>
            <td>{formatKernelNumber(row.dot, lang)}</td>
            <td>{formatKernelNumber(row.squaredDistance, lang)}</td>
            <td>{formatKernelNumber(row.value, lang)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RbfPainPlot({ lang }: { lang: Locale }) {
  const labels: Record<string, string> = {
    a: lang === "en" ? "new house / anchor" : "新房源 / 锚点",
    b: lang === "en" ? "near local example" : "近邻样本",
    e: lang === "en" ? "far same-direction example" : "远处同方向样本"
  };
  const pointLabelOffsets: Record<string, { dx: number; dy: number; textAnchor: "start" | "end" }> = {
    a: { dx: -12, dy: 24, textAnchor: "end" },
    b: { dx: 14, dy: -14, textAnchor: "start" },
    e: { dx: -14, dy: -14, textAnchor: "end" }
  };

  return (
    <svg viewBox="0 0 420 280" role="img" aria-label={lang === "en" ? "Normalized house feature plot showing A, B, and E" : "展示 A、B、E 的归一化房源特征图"}>
      <rect x="24" y="20" width="366" height="220" rx="8" fill="var(--surface)" stroke="var(--line)" />
      <line x1="54" y1="220" x2="372" y2="220" stroke="var(--line)" />
      <line x1="54" y1="220" x2="54" y2="42" stroke="var(--line)" />
      <line x1={scaleHouseX(1)} y1={scaleHouseY(1)} x2={scaleHouseX(2)} y2={scaleHouseY(1)} stroke="var(--rcl-accent)" strokeWidth="3" />
      <line x1={scaleHouseX(1)} y1={scaleHouseY(1)} x2={scaleHouseX(4)} y2={scaleHouseY(4)} stroke="var(--rcl-secondary)" strokeWidth="3" strokeDasharray="6 5" />
      <text x="118" y="196">{lang === "en" ? "near: distance^2 = 1" : "近：距离平方 = 1"}</text>
      <text x="218" y="82">{lang === "en" ? "far: distance^2 = 18" : "远：距离平方 = 18"}</text>
      {rbfPainPoints.map((point) => {
        const isAnchor = point.id === "a";
        const isNear = point.id === "b";
        const labelOffset = pointLabelOffsets[point.id];
        return (
          <g key={point.id}>
            <circle
              cx={scaleHouseX(point.x)}
              cy={scaleHouseY(point.y)}
              r={isAnchor ? 10 : 8}
              fill={isAnchor ? "var(--accent-orange)" : isNear ? "var(--rcl-accent-soft)" : "var(--rcl-secondary-soft)"}
              stroke={isAnchor ? "var(--accent-orange)" : isNear ? "var(--rcl-accent)" : "var(--rcl-secondary)"}
              strokeWidth="3"
            />
            <text x={scaleHouseX(point.x) + labelOffset.dx} y={scaleHouseY(point.y) + labelOffset.dy} textAnchor={labelOffset.textAnchor}>
              {`${point.label} (${point.x}, ${point.y})`}
            </text>
          </g>
        );
      })}
      <g aria-hidden="true">
        <text x="64" y="54">{`A: ${labels.a}`}</text>
        <text x="64" y="72">{`B: ${labels.b}`}</text>
        <text x="64" y="90">{`E: ${labels.e}`}</text>
      </g>
      <text x="118" y="263">{lang === "en" ? "normalized size feature" : "归一化面积特征"}</text>
      <text x="8" y="126" transform="rotate(-90 8 126)">
        {lang === "en" ? "normalized neighborhood feature" : "归一化社区特征"}
      </text>
    </svg>
  );
}

function renderRbfPain(lang: Locale) {
  const rows = rbfPainRows.filter((row) => row.point.id !== "a");
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <RbfPainPlot lang={lang} />
        <p>
          {lang === "en"
            ? "Distances only make sense because both axes have already been scaled onto comparable normalized units."
            : "距离有意义，是因为两个坐标轴已经缩放到可比较的归一化单位。"}
        </p>
      </article>
      <table className="pnp-mini-table">
        <caption>{lang === "en" ? "From A: dot product rewards E, but RBF rewards the local neighbor B" : "从 A 出发：点积奖励 E，但 RBF 奖励局部近邻 B"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Pair" : "配对"}</th>
            <th>{lang === "en" ? "Dot" : "点积"}</th>
            <th>{lang === "en" ? "Distance^2" : "距离平方"}</th>
            <th>{lang === "en" ? "RBF, gamma = 0.5" : "RBF，gamma = 0.5"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.point.id} className={row.point.id === "b" ? "active" : ""}>
              <th scope="row">{`A -> ${row.point.label}`}</th>
              <td>{formatKernelNumber(row.dot, lang)}</td>
              <td>{formatKernelNumber(row.squaredDistance, lang)}</td>
              <td>{formatRbfValue(row.value, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderRbfDecay(lang: Locale) {
  return (
    <div className="pnp-card-grid">
      {rbfDecayRows.map((row) => (
        <article key={row.squaredDistance} className={`pnp-card ${row.squaredDistance <= 1 ? "accept" : row.squaredDistance >= 10 ? "reject" : ""}`}>
          <strong>{`||x - z||^2 = ${row.squaredDistance}`}</strong>
          <output>{formatRbfValue(row.value, lang)}</output>
          <p>{lang === "en" ? `exponent ${formatKernelNumber(row.exponent, lang)}` : `指数 ${formatKernelNumber(row.exponent, lang)}`}</p>
        </article>
      ))}
      <table className="pnp-mini-table">
        <caption>{lang === "en" ? "Decay strip for gamma = 0.5" : "gamma = 0.5 的衰减条"}</caption>
        <thead>
          <tr>
            <th>{lang === "en" ? "Squared distance" : "距离平方"}</th>
            <th>{lang === "en" ? "RBF value" : "RBF 值"}</th>
          </tr>
        </thead>
        <tbody>
          {rbfDecayRows.map((row) => (
            <tr key={row.squaredDistance}>
              <th scope="row">{row.squaredDistance}</th>
              <td>{formatRbfValue(row.value, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderFeatureMap(lang: Locale) {
  const a = kernelPoints[0];
  const b = kernelPoints[1];
  const phiA = quadraticFeatureMap(a);
  const phiB = quadraticFeatureMap(b);
  const featureDot = dot(phiA, phiB);
  return (
    <div className="pnp-card-grid">
      <article className="pnp-card">
        <PointPlot />
      </article>
      <ValueCard label="phi(A)" value={`[${phiA.map((value) => formatKernelNumber(value, lang)).join(", ")}]`} note={lang === "en" ? "quadratic feature coordinates" : "二次特征坐标"} />
      <ValueCard label="phi(B)" value={`[${phiB.map((value) => formatKernelNumber(value, lang)).join(", ")}]`} note={lang === "en" ? "same map, new point" : "同一个映射，新点"} />
      <ValueCard label="phi(A) * phi(B)" value={formatKernelNumber(featureDot, lang)} note={lang === "en" ? "equals (A * B)^2 for this map" : "在该映射下等于 (A * B)^2"} />
    </div>
  );
}

function renderShortcut(lang: Locale) {
  const a = kernelPoints[0];
  const b = kernelPoints[1];
  const explicit = dot(quadraticFeatureMap(a), quadraticFeatureMap(b));
  const shortcut = defaultKernelParams.degree === 2 ? (a.x * b.x + a.y * b.y) ** 2 : 0;
  return (
    <div className="pnp-card-grid">
      <ValueCard label={lang === "en" ? "Explicit route" : "显式路线"} value={formatKernelNumber(explicit, lang)} note="phi(A) * phi(B)" />
      <ValueCard label={lang === "en" ? "Kernel route" : "核函数路线"} value={formatKernelNumber(shortcut, lang)} note="K(A, B) = (A * B)^2" />
      <article className="pnp-card accept">
        <strong>{lang === "en" ? "Same answer" : "结果相同"}</strong>
        <p>{lang === "en" ? "The shortcut is useful when phi is huge or infinite." : "当 phi 很大甚至无限维时，这条捷径很有用。"}</p>
      </article>
    </div>
  );
}

function renderGraphStrip(lang: Locale) {
  const steps = [
    ["feature-map", lang === "en" ? "Feature map" : "特征映射"],
    ["kernel", lang === "en" ? "Kernel" : "核函数"],
    ["linear", lang === "en" ? "Linear" : "线性核"],
    ["poly", lang === "en" ? "Polynomial" : "多项式核"],
    ["rbf", lang === "en" ? "RBF" : "RBF 核"],
    ["sigmoid", lang === "en" ? "Sigmoid" : "Sigmoid 核"]
  ];
  return (
    <div className="pnp-card-grid">
      {steps.map(([id, label], index) => (
        <article key={id} className={`pnp-card ${index <= 1 ? "accept" : ""}`}>
          <strong>{label}</strong>
          <p>{index <= 1 ? (lang === "en" ? "idea layer" : "基础思想") : lang === "en" ? "named choice" : "具体选择"}</p>
        </article>
      ))}
    </div>
  );
}

export default function KernelFunctionFigure({ lang, scenarioId }: { lang: Locale; scenarioId: ScenarioId }) {
  const text = scenarioText[scenarioId];
  let body;

  if (scenarioId === "feature-map-lift") body = renderFeatureMap(lang);
  else if (scenarioId === "kernel-shortcut") body = renderShortcut(lang);
  else if (scenarioId === "linear-plane") body = <KernelTable lang={lang} name="linear" />;
  else if (scenarioId === "polynomial-curves") body = <KernelTable lang={lang} name="polynomial" />;
  else if (scenarioId === "rbf-dot-product-pain") body = renderRbfPain(lang);
  else if (scenarioId === "rbf-decay-curve") body = renderRbfDecay(lang);
  else if (scenarioId === "rbf-neighborhood") body = <KernelTable lang={lang} name="rbf" />;
  else if (scenarioId === "sigmoid-saturation") body = <KernelTable lang={lang} name="sigmoid" />;
  else body = renderGraphStrip(lang);

  return (
    <figure className="circuit-sat-demo">
      <figcaption>
        <span>{text.title[lang]}</span>
        {text.summary[lang]}
      </figcaption>
      {body}
    </figure>
  );
}
