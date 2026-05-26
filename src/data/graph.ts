import type { Locale } from "../i18n/locales";

export const edgeTypes = [
  "prerequisite",
  "generalizes",
  "special-case",
  "contrasts",
  "uses",
  "motivates",
  "fails-when",
  "implemented-by",
  "applied-in"
] as const;

export type EdgeType = (typeof edgeTypes)[number];
export type LocalizedText = Record<Locale, string>;

export type GraphNode = {
  id: string;
  label: LocalizedText;
  status: "draft" | "published" | "archived";
  conceptType: "concept" | "algorithm" | "data-structure" | "system" | "math" | "tool";
  position: { x: number; y: number };
};

export type GraphEdge = {
  from: string;
  to: string;
  type: EdgeType;
  reason: LocalizedText;
};

export const graphNodes: GraphNode[] = [
  {
    id: "graph-basics",
    label: {
      en: "Graph Basics",
      zh: "图的基础"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 150 }
  },
  {
    id: "bfs",
    label: {
      en: "Breadth-First Search",
      zh: "广度优先搜索"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 90 }
  },
  {
    id: "dijkstra",
    label: {
      en: "Dijkstra's Algorithm",
      zh: "Dijkstra 算法"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 540, y: 150 }
  },
  {
    id: "closest-pair-divide-and-conquer",
    label: {
      en: "Closest Pair D&C",
      zh: "最近点对分治"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 235 }
  },
  {
    id: "graham-scan",
    label: {
      en: "Graham Scan",
      zh: "Graham 扫描"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 540, y: 235 }
  },
  {
    id: "bentley-ottmann",
    label: {
      en: "Bentley-Ottmann Sweep Line",
      zh: "Bentley-Ottmann 扫描线"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 770, y: 235 }
  },
  {
    id: "p-vs-np",
    label: {
      en: "P vs NP",
      zh: "P 与 NP"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 420 }
  },
  {
    id: "polynomial-time-reductions",
    label: {
      en: "Polynomial-Time Reductions",
      zh: "多项式时间归约"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 420 }
  },
  {
    id: "np-hardness",
    label: {
      en: "NP-Hardness",
      zh: "NP-Hardness"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 540, y: 420 }
  },
  {
    id: "circuit-sat",
    label: {
      en: "Circuit-SAT",
      zh: "电路可满足性"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 770, y: 420 }
  },
  {
    id: "circuit-sat-to-sat",
    label: {
      en: "Circuit-SAT to SAT",
      zh: "从 Circuit-SAT 到 SAT 的归约"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 885, y: 520 }
  },
  {
    id: "sat",
    label: {
      en: "Boolean Satisfiability (SAT)",
      zh: "布尔可满足性（SAT）"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 1000, y: 420 }
  },
  {
    id: "confusion-matrix",
    label: {
      en: "Confusion Matrix",
      zh: "混淆矩阵"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 650 }
  },
  {
    id: "precision",
    label: {
      en: "Precision",
      zh: "精确率"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 650 }
  },
  {
    id: "recall",
    label: {
      en: "Recall",
      zh: "召回率"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 530, y: 650 }
  },
  {
    id: "f1-score",
    label: {
      en: "F1 Score",
      zh: "F1 分数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 760, y: 650 }
  },
  {
    id: "purity",
    label: {
      en: "Purity",
      zh: "纯度"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 790 }
  },
  {
    id: "rand-index",
    label: {
      en: "Rand Index",
      zh: "Rand 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 790 }
  },
  {
    id: "adjusted-rand-index",
    label: {
      en: "Adjusted Rand Index",
      zh: "调整 Rand 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 530, y: 790 }
  },
  {
    id: "fowlkes-mallows-index",
    label: {
      en: "Fowlkes-Mallows Index",
      zh: "Fowlkes-Mallows 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 760, y: 790 }
  },
  {
    id: "silhouette-score",
    label: {
      en: "Silhouette Score",
      zh: "轮廓系数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 930 }
  },
  {
    id: "calinski-harabasz-index",
    label: {
      en: "Calinski-Harabasz Index",
      zh: "Calinski-Harabasz 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 930 }
  },
  {
    id: "davies-bouldin-index",
    label: {
      en: "Davies-Bouldin Index",
      zh: "Davies-Bouldin 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 530, y: 930 }
  },
  {
    id: "dunn-index",
    label: {
      en: "Dunn Index",
      zh: "Dunn 指数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 760, y: 930 }
  },
  {
    id: "k-means",
    label: {
      en: "K-Means Clustering",
      zh: "K-Means 聚类"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 90, y: 1070 }
  },
  {
    id: "k-medoids",
    label: {
      en: "K-Medoids Clustering",
      zh: "K-Medoids 聚类"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 1070 }
  },
  {
    id: "dbscan",
    label: {
      en: "DBSCAN",
      zh: "DBSCAN"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 530, y: 1070 }
  },
  {
    id: "optics",
    label: {
      en: "OPTICS",
      zh: "OPTICS"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 760, y: 1070 }
  },
  {
    id: "hdbscan",
    label: {
      en: "HDBSCAN",
      zh: "HDBSCAN"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 990, y: 1070 }
  },
  {
    id: "em-for-gmm",
    label: {
      en: "EM for GMM",
      zh: "GMM 的 EM"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 1220, y: 1070 }
  },
  {
    id: "feature-map",
    label: {
      en: "Feature Map",
      zh: "特征映射"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 1210 }
  },
  {
    id: "kernel",
    label: {
      en: "Kernel Function",
      zh: "核函数"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 1210 }
  },
  {
    id: "linear-kernel",
    label: {
      en: "Linear Kernel",
      zh: "线性核"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 530, y: 1210 }
  },
  {
    id: "polynomial-kernel",
    label: {
      en: "Polynomial Kernel",
      zh: "多项式核"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 760, y: 1210 }
  },
  {
    id: "rbf-kernel",
    label: {
      en: "RBF Kernel",
      zh: "RBF 核"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 990, y: 1210 }
  },
  {
    id: "sigmoid-kernel",
    label: {
      en: "Sigmoid Kernel",
      zh: "Sigmoid 核"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 1220, y: 1210 }
  },
  {
    id: "pca",
    label: {
      en: "Principal Component Analysis",
      zh: "主成分分析"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 90, y: 1350 }
  },
  {
    id: "mds",
    label: {
      en: "Multidimensional Scaling",
      zh: "多维尺度分析"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 310, y: 1350 }
  },
  {
    id: "isomap",
    label: {
      en: "Isomap",
      zh: "Isomap"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 530, y: 1350 }
  },
  {
    id: "lda",
    label: {
      en: "Linear Discriminant Analysis",
      zh: "线性判别分析"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 760, y: 1350 }
  },
  {
    id: "qda",
    label: {
      en: "Quadratic Discriminant Analysis",
      zh: "二次判别分析"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 990, y: 1350 }
  },
  {
    id: "sne",
    label: {
      en: "Stochastic Neighbor Embedding",
      zh: "随机邻居嵌入"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 1220, y: 1350 }
  },
  {
    id: "t-sne",
    label: {
      en: "t-SNE",
      zh: "t-SNE"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 1450, y: 1350 }
  },
  {
    id: "umap",
    label: {
      en: "UMAP",
      zh: "UMAP"
    },
    status: "draft",
    conceptType: "algorithm",
    position: { x: 1680, y: 1350 }
  },
  {
    id: "b-tree",
    label: {
      en: "B-Tree",
      zh: "B 树"
    },
    status: "draft",
    conceptType: "data-structure",
    position: { x: 90, y: 1490 }
  },
  {
    id: "b-plus-tree",
    label: {
      en: "B+-Tree",
      zh: "B+ 树"
    },
    status: "draft",
    conceptType: "data-structure",
    position: { x: 310, y: 1490 }
  },
  {
    id: "dfa",
    label: {
      en: "Deterministic Finite Automata",
      zh: "确定性有限自动机"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 90, y: 1630 }
  },
  {
    id: "nfa",
    label: {
      en: "Nondeterministic Finite Automata",
      zh: "非确定性有限自动机"
    },
    status: "draft",
    conceptType: "concept",
    position: { x: 310, y: 1630 }
  }
];

export const graphEdges: GraphEdge[] = [
  {
    from: "graph-basics",
    to: "dfa",
    type: "contrasts",
    reason: {
      en: "Both use circles and arrows, but graph basics models relationships among objects while a DFA diagram models finite memory states and labeled input transitions.",
      zh: "二者都使用圆点和箭头，但图的基础描述对象之间的关系，而 DFA 图描述有限记忆状态和带输入标签的转移。"
    }
  },
  {
    from: "dfa",
    to: "nfa",
    type: "prerequisite",
    reason: {
      en: "NFA is easiest to learn after DFA: a DFA keeps one current state, while an NFA generalizes the transition idea to a set of possible current states.",
      zh: "先理解 DFA 后更容易学习 NFA：DFA 只有一个当前状态，而 NFA 把转移推广为一组可能的当前状态。"
    }
  },
  {
    from: "graph-basics",
    to: "bfs",
    type: "prerequisite",
    reason: {
      en: "BFS repeatedly asks for each node's immediate neighbors, so it depends on nodes, edges, and adjacency.",
      zh: "BFS 会反复查看每个节点的直接邻居，因此需要节点、边和邻接关系这些图的基础。"
    }
  },
  {
    from: "bfs",
    to: "dijkstra",
    type: "generalizes",
    reason: {
      en: "Dijkstra keeps BFS's frontier-and-distance idea, but chooses the next node by smallest tentative total cost instead of FIFO queue order.",
      zh: "Dijkstra 保留 BFS 的前沿和距离思想，但按当前暂定总代价最小来选择下一个节点，而不是按先进先出的队列顺序。"
    }
  },
  {
    from: "closest-pair-divide-and-conquer",
    to: "graham-scan",
    type: "contrasts",
    reason: {
      en: "Both are geometric algorithms, but closest pair uses divide and conquer while Graham Scan uses ordering plus a stack invariant.",
      zh: "二者都是几何算法，但最近点对分治依赖递归合并，Graham 扫描依赖排序和栈不变量。"
    }
  },
  {
    from: "closest-pair-divide-and-conquer",
    to: "bentley-ottmann",
    type: "contrasts",
    reason: {
      en: "Both avoid naive pair checking in geometry, but closest pair uses recursive spatial filtering while Bentley-Ottmann uses a dynamic sweep line.",
      zh: "二者都在几何问题中避免朴素的成对检查，但最近点对使用递归空间过滤，而 Bentley-Ottmann 使用动态扫描线。"
    }
  },
  {
    from: "graham-scan",
    to: "bentley-ottmann",
    type: "motivates",
    reason: {
      en: "Graham Scan introduces geometric ordering and local turn tests; Bentley-Ottmann extends that idea to an order maintained by changing events.",
      zh: "Graham 扫描引入几何排序和局部转向测试；Bentley-Ottmann 将这种思想扩展为随事件变化而维护的动态顺序。"
    }
  },
  {
    from: "p-vs-np",
    to: "polynomial-time-reductions",
    type: "prerequisite",
    reason: {
      en: "Reductions compare decision problems using polynomial time, so learners first need the P vs NP vocabulary of decision problems and polynomial-time algorithms.",
      zh: "归约用多项式时间来比较判定问题，因此学习者需要先理解 P 与 NP 中的判定问题和多项式时间算法。"
    }
  },
  {
    from: "polynomial-time-reductions",
    to: "np-hardness",
    type: "prerequisite",
    reason: {
      en: "NP-hardness is defined by polynomial-time reductions from every NP problem to a target.",
      zh: "NP-hardness 定义为 NP 的每个问题都向目标问题的多项式时间归约。"
    }
  },
  {
    from: "np-hardness",
    to: "circuit-sat",
    type: "prerequisite",
    reason: {
      en: "Circuit-SAT is the first concrete source problem after the general NP-hardness definition.",
      zh: "电路可满足性是在一般 NP-hardness 定义之后的第一个具体源问题。"
    }
  },
  {
    from: "p-vs-np",
    to: "circuit-sat",
    type: "uses",
    reason: {
      en: "Circuit-SAT uses the P vs NP idea that a proposed assignment can serve as a polynomial-time checkable certificate.",
      zh: "电路可满足性使用了 P 与 NP 中“候选赋值可作为多项式时间可检查证书”的思想。"
    }
  },
  {
    from: "polynomial-time-reductions",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "This reduction is the first concrete SAT-facing use of polynomial-time reductions.",
      zh: "该归约是多项式时间归约在 SAT 方向上的第一处具体实现。"
    }
  },
  {
    from: "circuit-sat",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "The reduction starts from a concrete circuit-SAT source instance and emits a SAT formula.",
      zh: "该归约从具体的 Circuit-SAT 源实例出发，产生一个 SAT 公式。"
    }
  },
  {
    from: "circuit-sat",
    to: "sat",
    type: "motivates",
    reason: {
      en: "SAT asks the same search-for-an-assignment question as Circuit-SAT, but the object is a Boolean formula instead of a gate circuit.",
      zh: "SAT 询问的仍是“是否存在一个满足赋值”，但对象从门电路换成了布尔公式。"
    }
  },
  {
    from: "sat",
    to: "circuit-sat-to-sat",
    type: "prerequisite",
    reason: {
      en: "The target language and satisfiability structure are fixed by SAT before introducing this concrete reduction.",
      zh: "在介绍这一具体归约前，先有 SAT 的目标语言与可满足性形式框架。"
    }
  },
  {
    from: "confusion-matrix",
    to: "precision",
    type: "uses",
    reason: {
      en: "Precision uses the predicted-positive part of the confusion matrix to ask how many positive predictions were correct.",
      zh: "精确率使用混淆矩阵中预测为正类的部分，询问正类预测里有多少是真的。"
    }
  },
  {
    from: "confusion-matrix",
    to: "recall",
    type: "uses",
    reason: {
      en: "Recall uses the actual-positive row of the confusion matrix to ask how many real positives were found.",
      zh: "召回率使用混淆矩阵中真实正类这一行，询问真实正类里有多少被抓住。"
    }
  },
  {
    from: "precision",
    to: "recall",
    type: "contrasts",
    reason: {
      en: "Precision judges positive predictions, while recall judges real positives covered.",
      zh: "精确率评估正类预测是否可信，召回率评估真实正类是否被覆盖。"
    }
  },
  {
    from: "precision",
    to: "f1-score",
    type: "uses",
    reason: {
      en: "F1 uses precision as one input in its harmonic balance formula.",
      zh: "F1 将精确率作为调和均值的一侧。"
    }
  },
  {
    from: "recall",
    to: "f1-score",
    type: "uses",
    reason: {
      en: "F1 uses recall as the other input in its harmonic balance formula.",
      zh: "F1 将召回率作为另一侧输入。"
    }
  },
  {
    from: "purity",
    to: "rand-index",
    type: "contrasts",
    reason: {
      en: "Purity scores each cluster by a majority reference label, while Rand Index checks pairwise together/apart decisions.",
      zh: "纯度按每个簇的多数参考标签计分，而 Rand 指数检查样本对的放一起/分开决策。"
    }
  },
  {
    from: "confusion-matrix",
    to: "rand-index",
    type: "uses",
    reason: {
      en: "Rand Index reuses the confusion-matrix idea, but the counted objects are item pairs instead of individual classifier examples.",
      zh: "Rand 指数复用了混淆矩阵思想，但计数对象是样本对，而不是单个分类样本。"
    }
  },
  {
    from: "rand-index",
    to: "adjusted-rand-index",
    type: "generalizes",
    reason: {
      en: "Adjusted Rand Index keeps Rand-style pair agreement, then subtracts the agreement expected from the cluster and class margins.",
      zh: "调整 Rand 指数保留 Rand 式成对一致性，再减去由簇和类别边际产生的机会一致性。"
    }
  },
  {
    from: "rand-index",
    to: "fowlkes-mallows-index",
    type: "contrasts",
    reason: {
      en: "Both use clustering pair counts, but Fowlkes-Mallows ignores true negatives and balances pair precision with pair recall.",
      zh: "二者都使用聚类样本对计数，但 Fowlkes-Mallows 不使用真负例，而是平衡成对精确率和成对召回率。"
    }
  },
  {
    from: "adjusted-rand-index",
    to: "fowlkes-mallows-index",
    type: "contrasts",
    reason: {
      en: "ARI adjusts for chance agreement from margins, while FMI focuses on positive co-clustering decisions without chance adjustment.",
      zh: "ARI 根据边际规模调整机会一致性，而 FMI 聚焦正向同簇决策，不做机会调整。"
    }
  },
  {
    from: "fowlkes-mallows-index",
    to: "silhouette-score",
    type: "contrasts",
    reason: {
      en: "Fowlkes-Mallows is external because it needs reference labels; Silhouette is internal because it judges distances and cluster assignments only.",
      zh: "Fowlkes-Mallows 是外部指标，因为它需要参考标签；轮廓系数是内部指标，因为它只判断距离和簇分配。"
    }
  },
  {
    from: "silhouette-score",
    to: "calinski-harabasz-index",
    type: "contrasts",
    reason: {
      en: "Silhouette compares each point with its nearest rival cluster, while Calinski-Harabasz summarizes centroid scatter globally.",
      zh: "轮廓系数逐点比较最近竞争簇，而 Calinski-Harabasz 用全局质心离散度做摘要。"
    }
  },
  {
    from: "silhouette-score",
    to: "davies-bouldin-index",
    type: "motivates",
    reason: {
      en: "After seeing cohesion versus separation point by point, Davies-Bouldin asks the same kind of question at the cluster-centroid level.",
      zh: "逐点理解簇内紧密与簇间分离之后，Davies-Bouldin 在簇质心层面提出类似问题。"
    }
  },
  {
    from: "silhouette-score",
    to: "dunn-index",
    type: "motivates",
    reason: {
      en: "Silhouette averages point-level contrast; Dunn turns the same separation idea into an extreme-gap test.",
      zh: "轮廓系数平均点级对比；Dunn 将同样的分离思想变成极值间隔测试。"
    }
  },
  {
    from: "calinski-harabasz-index",
    to: "davies-bouldin-index",
    type: "contrasts",
    reason: {
      en: "CH is a higher-better global scatter ratio, while DB is a lower-better average of each cluster's worst rival.",
      zh: "CH 是越高越好的全局离散度比例，而 DB 是越低越好的每个簇最坏邻居平均值。"
    }
  },
  {
    from: "davies-bouldin-index",
    to: "dunn-index",
    type: "contrasts",
    reason: {
      en: "DB averages worst centroid similarities, while Dunn uses the single closest cross-cluster gap and widest within-cluster diameter.",
      zh: "DB 平均最坏质心相似度，而 Dunn 使用单个最近跨簇间隔和最大簇内直径。"
    }
  },
  {
    from: "calinski-harabasz-index",
    to: "dunn-index",
    type: "contrasts",
    reason: {
      en: "CH uses squared centroid scatter; Dunn uses pairwise distance extremes and is more sensitive to bridge points or outliers.",
      zh: "CH 使用平方质心离散度；Dunn 使用成对距离极值，因此对桥接点或离群点更敏感。"
    }
  },
  {
    from: "silhouette-score",
    to: "k-means",
    type: "applied-in",
    reason: {
      en: "Internal metrics such as silhouette are often used after K-Means proposes a hard clustering.",
      zh: "K-Means 给出硬聚类之后，轮廓系数等内部指标常用于评估结果。"
    }
  },
  {
    from: "k-means",
    to: "k-medoids",
    type: "contrasts",
    reason: {
      en: "K-Means uses averaged centroids; K-Medoids repairs that assumption by requiring centers to be actual data points.",
      zh: "K-Means 使用平均质心；K-Medoids 要求中心是真实样本点，从而修补这个假设。"
    }
  },
  {
    from: "k-means",
    to: "dbscan",
    type: "contrasts",
    reason: {
      en: "K-Means searches for center-shaped partitions, while DBSCAN grows connected dense regions and can mark noise.",
      zh: "K-Means 寻找中心形状的划分，而 DBSCAN 扩张连通稠密区域并可标记噪声。"
    }
  },
  {
    from: "dbscan",
    to: "optics",
    type: "generalizes",
    reason: {
      en: "OPTICS keeps DBSCAN's density-reachability idea but records an ordering across distance scales instead of committing to one epsilon.",
      zh: "OPTICS 保留 DBSCAN 的密度可达思想，但记录跨距离尺度的排序，而不是固定一个 epsilon。"
    }
  },
  {
    from: "dbscan",
    to: "hdbscan",
    type: "generalizes",
    reason: {
      en: "HDBSCAN extends density clustering by selecting stable branches from a hierarchy rather than one fixed density cut.",
      zh: "HDBSCAN 从层级中选择稳定分支，而不是使用单一固定密度切分，从而扩展了密度聚类。"
    }
  },
  {
    from: "optics",
    to: "hdbscan",
    type: "motivates",
    reason: {
      en: "OPTICS exposes multi-scale density structure; HDBSCAN turns a related hierarchy into selected stable clusters.",
      zh: "OPTICS 暴露多尺度密度结构；HDBSCAN 将相关层级转化为被选择的稳定簇。"
    }
  },
  {
    from: "k-means",
    to: "em-for-gmm",
    type: "generalizes",
    reason: {
      en: "EM for GMM keeps the alternating update flavor of K-Means but replaces hard nearest-centroid assignment with probabilistic responsibilities.",
      zh: "GMM 的 EM 保留 K-Means 的交替更新味道，但用概率责任度替代硬性的最近质心分配。"
    }
  },
  {
    from: "feature-map",
    to: "kernel",
    type: "motivates",
    reason: {
      en: "Kernels answer the mapped-inner-product question that feature maps make concrete.",
      zh: "特征映射让映射后内积的问题变得具体，而核函数直接回答这个问题。"
    }
  },
  {
    from: "kernel",
    to: "linear-kernel",
    type: "prerequisite",
    reason: {
      en: "The linear kernel is the simplest named example after the general kernel definition.",
      zh: "在线性核之前，需要先知道一般核函数的定义。"
    }
  },
  {
    from: "linear-kernel",
    to: "polynomial-kernel",
    type: "generalizes",
    reason: {
      en: "The polynomial kernel starts from the linear dot product and adds powers and interaction features.",
      zh: "多项式核从线性核的点积出发，加入幂次项和交互特征。"
    }
  },
  {
    from: "feature-map",
    to: "polynomial-kernel",
    type: "uses",
    reason: {
      en: "Polynomial kernels are easiest to understand by first seeing explicit polynomial feature maps.",
      zh: "先看到显式的多项式特征映射，才能更容易理解多项式核。"
    }
  },
  {
    from: "kernel",
    to: "rbf-kernel",
    type: "prerequisite",
    reason: {
      en: "RBF is a named kernel whose similarity comes from distance decay rather than raw dot-product alignment.",
      zh: "RBF 是一种具名核，它的相似度来自距离衰减，而不是原始点积对齐。"
    }
  },
  {
    from: "linear-kernel",
    to: "rbf-kernel",
    type: "contrasts",
    reason: {
      en: "Linear similarity rewards origin-based alignment; RBF similarity rewards local nearness.",
      zh: "线性相似度奖励基于原点的方向对齐；RBF 相似度奖励局部距离接近。"
    }
  },
  {
    from: "polynomial-kernel",
    to: "rbf-kernel",
    type: "contrasts",
    reason: {
      en: "Polynomial kernels add finite-degree interactions, while RBF behaves like a much richer local feature space.",
      zh: "多项式核加入有限次数交互；RBF 则表现得像更丰富的局部特征空间。"
    }
  },
  {
    from: "kernel",
    to: "sigmoid-kernel",
    type: "prerequisite",
    reason: {
      en: "The sigmoid kernel needs the general kernel-validity idea because it is not valid for every parameter setting.",
      zh: "Sigmoid 核并非在所有参数下都有效，因此需要先理解一般核函数的有效性边界。"
    }
  },
  {
    from: "linear-kernel",
    to: "sigmoid-kernel",
    type: "uses",
    reason: {
      en: "The sigmoid kernel squashes an affine transformation of the same dot product used by the linear kernel.",
      zh: "Sigmoid 核压缩的正是线性核所用点积的仿射变换。"
    }
  },
  {
    from: "feature-map",
    to: "pca",
    type: "motivates",
    reason: {
      en: "Feature maps show that a representation can rewrite inputs; PCA learns a linear representation from the data itself.",
      zh: "特征映射说明输入可以被改写成新的表示；PCA 则从数据本身学到一个线性表示。"
    }
  },
  {
    from: "pca",
    to: "mds",
    type: "contrasts",
    reason: {
      en: "PCA preserves coordinate variance after rotation, while MDS starts from pairwise distances and tries to preserve those distances.",
      zh: "PCA 在旋转后保留坐标方差，而 MDS 从成对距离出发并尝试保留这些距离。"
    }
  },
  {
    from: "mds",
    to: "isomap",
    type: "generalizes",
    reason: {
      en: "Isomap keeps MDS's distance-table layout step but replaces raw distances with neighbor-graph shortest-path distances.",
      zh: "Isomap 保留 MDS 的距离表布局步骤，但用邻居图最短路距离替代原始距离。"
    }
  },
  {
    from: "pca",
    to: "lda",
    type: "contrasts",
    reason: {
      en: "PCA ignores labels and keeps high-variance directions; LDA uses labels to keep directions that separate classes.",
      zh: "PCA 忽略标签并保留高方差方向；LDA 使用标签来保留能分开类别的方向。"
    }
  },
  {
    from: "lda",
    to: "qda",
    type: "generalizes",
    reason: {
      en: "QDA relaxes LDA's shared-covariance assumption by letting each class keep its own covariance shape.",
      zh: "QDA 放松 LDA 的共享协方差假设，让每个类别保留自己的协方差形状。"
    }
  },
  {
    from: "isomap",
    to: "sne",
    type: "contrasts",
    reason: {
      en: "Isomap preserves graph geodesic distances, while SNE preserves local neighbor probabilities.",
      zh: "Isomap 保留图测地距离，而 SNE 保留局部邻居概率。"
    }
  },
  {
    from: "qda",
    to: "sne",
    type: "contrasts",
    reason: {
      en: "QDA is supervised classification geometry; SNE returns to unsupervised local-neighborhood visualization.",
      zh: "QDA 是监督式分类几何；SNE 回到无监督的局部邻域可视化。"
    }
  },
  {
    from: "sne",
    to: "t-sne",
    type: "generalizes",
    reason: {
      en: "t-SNE keeps SNE's neighbor-probability matching and repairs crowding with a heavy-tailed low-dimensional similarity.",
      zh: "t-SNE 保留 SNE 的邻居概率匹配，并用低维重尾相似度修补拥挤问题。"
    }
  },
  {
    from: "isomap",
    to: "umap",
    type: "contrasts",
    reason: {
      en: "Both build neighbor graphs, but Isomap uses shortest-path distances while UMAP matches fuzzy local memberships.",
      zh: "二者都构造邻居图，但 Isomap 使用最短路距离，而 UMAP 匹配模糊局部成员关系。"
    }
  },
  {
    from: "t-sne",
    to: "umap",
    type: "contrasts",
    reason: {
      en: "Both are local-neighbor embeddings for visualization, but UMAP frames the problem as fuzzy graph matching with attraction and repulsion.",
      zh: "二者都是用于可视化的局部邻居嵌入，但 UMAP 将问题表述为带吸引和排斥的模糊图匹配。"
    }
  },
  {
    from: "b-tree",
    to: "b-plus-tree",
    type: "motivates",
    reason: {
      en: "B+-trees keep B-tree's shallow page-based search shape, then move records to linked leaves to make range scans efficient.",
      zh: "B+ 树保留 B 树适合页读取的浅层搜索形状，再把记录放到相连的叶子中，让范围扫描更高效。"
    }
  }
];
