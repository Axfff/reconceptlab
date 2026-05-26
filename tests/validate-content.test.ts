import { describe, expect, it } from "vitest";
import { validateKnowledgeGraph, type ContentRecord } from "../scripts/validate-content";

const validRecords: ContentRecord[] = [
  {
    conceptIdFromPath: "graph-basics",
    localeFromPath: "en",
    filePath: "src/content/nodes/graph-basics/en.mdx",
    data: { id: "graph-basics", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "graph-basics",
    localeFromPath: "zh",
    filePath: "src/content/nodes/graph-basics/zh.mdx",
    data: { id: "graph-basics", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "bfs",
    localeFromPath: "en",
    filePath: "src/content/nodes/bfs/en.mdx",
    data: { id: "bfs", locale: "en", prerequisites: ["graph-basics"] }
  },
  {
    conceptIdFromPath: "bfs",
    localeFromPath: "zh",
    filePath: "src/content/nodes/bfs/zh.mdx",
    data: { id: "bfs", locale: "zh", prerequisites: ["graph-basics"] }
  },
  {
    conceptIdFromPath: "dijkstra",
    localeFromPath: "en",
    filePath: "src/content/nodes/dijkstra/en.mdx",
    data: { id: "dijkstra", locale: "en", prerequisites: ["bfs"] }
  },
  {
    conceptIdFromPath: "dijkstra",
    localeFromPath: "zh",
    filePath: "src/content/nodes/dijkstra/zh.mdx",
    data: { id: "dijkstra", locale: "zh", prerequisites: ["bfs"] }
  },
  {
    conceptIdFromPath: "closest-pair-divide-and-conquer",
    localeFromPath: "en",
    filePath: "src/content/nodes/closest-pair-divide-and-conquer/en.mdx",
    data: { id: "closest-pair-divide-and-conquer", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "closest-pair-divide-and-conquer",
    localeFromPath: "zh",
    filePath: "src/content/nodes/closest-pair-divide-and-conquer/zh.mdx",
    data: { id: "closest-pair-divide-and-conquer", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "graham-scan",
    localeFromPath: "en",
    filePath: "src/content/nodes/graham-scan/en.mdx",
    data: { id: "graham-scan", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "graham-scan",
    localeFromPath: "zh",
    filePath: "src/content/nodes/graham-scan/zh.mdx",
    data: { id: "graham-scan", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "bentley-ottmann",
    localeFromPath: "en",
    filePath: "src/content/nodes/bentley-ottmann/en.mdx",
    data: { id: "bentley-ottmann", locale: "en", prerequisites: ["closest-pair-divide-and-conquer", "graham-scan"] }
  },
  {
    conceptIdFromPath: "bentley-ottmann",
    localeFromPath: "zh",
    filePath: "src/content/nodes/bentley-ottmann/zh.mdx",
    data: { id: "bentley-ottmann", locale: "zh", prerequisites: ["closest-pair-divide-and-conquer", "graham-scan"] }
  },
  {
    conceptIdFromPath: "p-vs-np",
    localeFromPath: "en",
    filePath: "src/content/nodes/p-vs-np/en.mdx",
    data: { id: "p-vs-np", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "p-vs-np",
    localeFromPath: "zh",
    filePath: "src/content/nodes/p-vs-np/zh.mdx",
    data: { id: "p-vs-np", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "polynomial-time-reductions",
    localeFromPath: "en",
    filePath: "src/content/nodes/polynomial-time-reductions/en.mdx",
    data: { id: "polynomial-time-reductions", locale: "en", prerequisites: ["p-vs-np"] }
  },
  {
    conceptIdFromPath: "polynomial-time-reductions",
    localeFromPath: "zh",
    filePath: "src/content/nodes/polynomial-time-reductions/zh.mdx",
    data: { id: "polynomial-time-reductions", locale: "zh", prerequisites: ["p-vs-np"] }
  },
  {
    conceptIdFromPath: "np-hardness",
    localeFromPath: "en",
    filePath: "src/content/nodes/np-hardness/en.mdx",
    data: { id: "np-hardness", locale: "en", prerequisites: ["p-vs-np", "polynomial-time-reductions"] }
  },
  {
    conceptIdFromPath: "np-hardness",
    localeFromPath: "zh",
    filePath: "src/content/nodes/np-hardness/zh.mdx",
    data: { id: "np-hardness", locale: "zh", prerequisites: ["p-vs-np", "polynomial-time-reductions"] }
  },
  {
    conceptIdFromPath: "circuit-sat",
    localeFromPath: "en",
    filePath: "src/content/nodes/circuit-sat/en.mdx",
    data: { id: "circuit-sat", locale: "en", prerequisites: ["p-vs-np", "np-hardness"] }
  },
  {
    conceptIdFromPath: "circuit-sat",
    localeFromPath: "zh",
    filePath: "src/content/nodes/circuit-sat/zh.mdx",
    data: { id: "circuit-sat", locale: "zh", prerequisites: ["p-vs-np", "np-hardness"] }
  },
  {
    conceptIdFromPath: "sat",
    localeFromPath: "en",
    filePath: "src/content/nodes/sat/en.mdx",
    data: { id: "sat", locale: "en", prerequisites: ["p-vs-np", "circuit-sat"] }
  },
  {
    conceptIdFromPath: "sat",
    localeFromPath: "zh",
    filePath: "src/content/nodes/sat/zh.mdx",
    data: { id: "sat", locale: "zh", prerequisites: ["p-vs-np", "circuit-sat"] }
  },
  {
    conceptIdFromPath: "circuit-sat-to-sat",
    localeFromPath: "en",
    filePath: "src/content/nodes/circuit-sat-to-sat/en.mdx",
    data: { id: "circuit-sat-to-sat", locale: "en", prerequisites: ["polynomial-time-reductions", "circuit-sat", "sat"] }
  },
  {
    conceptIdFromPath: "circuit-sat-to-sat",
    localeFromPath: "zh",
    filePath: "src/content/nodes/circuit-sat-to-sat/zh.mdx",
    data: { id: "circuit-sat-to-sat", locale: "zh", prerequisites: ["polynomial-time-reductions", "circuit-sat", "sat"] }
  },
  {
    conceptIdFromPath: "confusion-matrix",
    localeFromPath: "en",
    filePath: "src/content/nodes/confusion-matrix/en.mdx",
    data: { id: "confusion-matrix", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "confusion-matrix",
    localeFromPath: "zh",
    filePath: "src/content/nodes/confusion-matrix/zh.mdx",
    data: { id: "confusion-matrix", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "precision",
    localeFromPath: "en",
    filePath: "src/content/nodes/precision/en.mdx",
    data: { id: "precision", locale: "en", prerequisites: ["confusion-matrix"] }
  },
  {
    conceptIdFromPath: "precision",
    localeFromPath: "zh",
    filePath: "src/content/nodes/precision/zh.mdx",
    data: { id: "precision", locale: "zh", prerequisites: ["confusion-matrix"] }
  },
  {
    conceptIdFromPath: "recall",
    localeFromPath: "en",
    filePath: "src/content/nodes/recall/en.mdx",
    data: { id: "recall", locale: "en", prerequisites: ["confusion-matrix"] }
  },
  {
    conceptIdFromPath: "recall",
    localeFromPath: "zh",
    filePath: "src/content/nodes/recall/zh.mdx",
    data: { id: "recall", locale: "zh", prerequisites: ["confusion-matrix"] }
  },
  {
    conceptIdFromPath: "f1-score",
    localeFromPath: "en",
    filePath: "src/content/nodes/f1-score/en.mdx",
    data: { id: "f1-score", locale: "en", prerequisites: ["precision", "recall"] }
  },
  {
    conceptIdFromPath: "f1-score",
    localeFromPath: "zh",
    filePath: "src/content/nodes/f1-score/zh.mdx",
    data: { id: "f1-score", locale: "zh", prerequisites: ["precision", "recall"] }
  },
  {
    conceptIdFromPath: "purity",
    localeFromPath: "en",
    filePath: "src/content/nodes/purity/en.mdx",
    data: { id: "purity", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "purity",
    localeFromPath: "zh",
    filePath: "src/content/nodes/purity/zh.mdx",
    data: { id: "purity", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "rand-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/rand-index/en.mdx",
    data: { id: "rand-index", locale: "en", prerequisites: ["purity"] }
  },
  {
    conceptIdFromPath: "rand-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/rand-index/zh.mdx",
    data: { id: "rand-index", locale: "zh", prerequisites: ["purity"] }
  },
  {
    conceptIdFromPath: "adjusted-rand-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/adjusted-rand-index/en.mdx",
    data: { id: "adjusted-rand-index", locale: "en", prerequisites: ["rand-index"] }
  },
  {
    conceptIdFromPath: "adjusted-rand-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/adjusted-rand-index/zh.mdx",
    data: { id: "adjusted-rand-index", locale: "zh", prerequisites: ["rand-index"] }
  },
  {
    conceptIdFromPath: "fowlkes-mallows-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/fowlkes-mallows-index/en.mdx",
    data: { id: "fowlkes-mallows-index", locale: "en", prerequisites: ["rand-index"] }
  },
  {
    conceptIdFromPath: "fowlkes-mallows-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/fowlkes-mallows-index/zh.mdx",
    data: { id: "fowlkes-mallows-index", locale: "zh", prerequisites: ["rand-index"] }
  },
  {
    conceptIdFromPath: "silhouette-score",
    localeFromPath: "en",
    filePath: "src/content/nodes/silhouette-score/en.mdx",
    data: { id: "silhouette-score", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "silhouette-score",
    localeFromPath: "zh",
    filePath: "src/content/nodes/silhouette-score/zh.mdx",
    data: { id: "silhouette-score", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "calinski-harabasz-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/calinski-harabasz-index/en.mdx",
    data: { id: "calinski-harabasz-index", locale: "en", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "calinski-harabasz-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/calinski-harabasz-index/zh.mdx",
    data: { id: "calinski-harabasz-index", locale: "zh", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "davies-bouldin-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/davies-bouldin-index/en.mdx",
    data: { id: "davies-bouldin-index", locale: "en", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "davies-bouldin-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/davies-bouldin-index/zh.mdx",
    data: { id: "davies-bouldin-index", locale: "zh", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "dunn-index",
    localeFromPath: "en",
    filePath: "src/content/nodes/dunn-index/en.mdx",
    data: { id: "dunn-index", locale: "en", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "dunn-index",
    localeFromPath: "zh",
    filePath: "src/content/nodes/dunn-index/zh.mdx",
    data: { id: "dunn-index", locale: "zh", prerequisites: ["silhouette-score"] }
  },
  {
    conceptIdFromPath: "k-means",
    localeFromPath: "en",
    filePath: "src/content/nodes/k-means/en.mdx",
    data: { id: "k-means", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "k-means",
    localeFromPath: "zh",
    filePath: "src/content/nodes/k-means/zh.mdx",
    data: { id: "k-means", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "k-medoids",
    localeFromPath: "en",
    filePath: "src/content/nodes/k-medoids/en.mdx",
    data: { id: "k-medoids", locale: "en", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "k-medoids",
    localeFromPath: "zh",
    filePath: "src/content/nodes/k-medoids/zh.mdx",
    data: { id: "k-medoids", locale: "zh", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "dbscan",
    localeFromPath: "en",
    filePath: "src/content/nodes/dbscan/en.mdx",
    data: { id: "dbscan", locale: "en", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "dbscan",
    localeFromPath: "zh",
    filePath: "src/content/nodes/dbscan/zh.mdx",
    data: { id: "dbscan", locale: "zh", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "optics",
    localeFromPath: "en",
    filePath: "src/content/nodes/optics/en.mdx",
    data: { id: "optics", locale: "en", prerequisites: ["dbscan"] }
  },
  {
    conceptIdFromPath: "optics",
    localeFromPath: "zh",
    filePath: "src/content/nodes/optics/zh.mdx",
    data: { id: "optics", locale: "zh", prerequisites: ["dbscan"] }
  },
  {
    conceptIdFromPath: "hdbscan",
    localeFromPath: "en",
    filePath: "src/content/nodes/hdbscan/en.mdx",
    data: { id: "hdbscan", locale: "en", prerequisites: ["dbscan", "optics"] }
  },
  {
    conceptIdFromPath: "hdbscan",
    localeFromPath: "zh",
    filePath: "src/content/nodes/hdbscan/zh.mdx",
    data: { id: "hdbscan", locale: "zh", prerequisites: ["dbscan", "optics"] }
  },
  {
    conceptIdFromPath: "em-for-gmm",
    localeFromPath: "en",
    filePath: "src/content/nodes/em-for-gmm/en.mdx",
    data: { id: "em-for-gmm", locale: "en", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "em-for-gmm",
    localeFromPath: "zh",
    filePath: "src/content/nodes/em-for-gmm/zh.mdx",
    data: { id: "em-for-gmm", locale: "zh", prerequisites: ["k-means"] }
  },
  {
    conceptIdFromPath: "feature-map",
    localeFromPath: "en",
    filePath: "src/content/nodes/feature-map/en.mdx",
    data: { id: "feature-map", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "feature-map",
    localeFromPath: "zh",
    filePath: "src/content/nodes/feature-map/zh.mdx",
    data: { id: "feature-map", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "kernel",
    localeFromPath: "en",
    filePath: "src/content/nodes/kernel/en.mdx",
    data: { id: "kernel", locale: "en", prerequisites: ["feature-map"] }
  },
  {
    conceptIdFromPath: "kernel",
    localeFromPath: "zh",
    filePath: "src/content/nodes/kernel/zh.mdx",
    data: { id: "kernel", locale: "zh", prerequisites: ["feature-map"] }
  },
  {
    conceptIdFromPath: "linear-kernel",
    localeFromPath: "en",
    filePath: "src/content/nodes/linear-kernel/en.mdx",
    data: { id: "linear-kernel", locale: "en", prerequisites: ["kernel"] }
  },
  {
    conceptIdFromPath: "linear-kernel",
    localeFromPath: "zh",
    filePath: "src/content/nodes/linear-kernel/zh.mdx",
    data: { id: "linear-kernel", locale: "zh", prerequisites: ["kernel"] }
  },
  {
    conceptIdFromPath: "polynomial-kernel",
    localeFromPath: "en",
    filePath: "src/content/nodes/polynomial-kernel/en.mdx",
    data: { id: "polynomial-kernel", locale: "en", prerequisites: ["feature-map", "kernel", "linear-kernel"] }
  },
  {
    conceptIdFromPath: "polynomial-kernel",
    localeFromPath: "zh",
    filePath: "src/content/nodes/polynomial-kernel/zh.mdx",
    data: { id: "polynomial-kernel", locale: "zh", prerequisites: ["feature-map", "kernel", "linear-kernel"] }
  },
  {
    conceptIdFromPath: "rbf-kernel",
    localeFromPath: "en",
    filePath: "src/content/nodes/rbf-kernel/en.mdx",
    data: { id: "rbf-kernel", locale: "en", prerequisites: ["kernel"] }
  },
  {
    conceptIdFromPath: "rbf-kernel",
    localeFromPath: "zh",
    filePath: "src/content/nodes/rbf-kernel/zh.mdx",
    data: { id: "rbf-kernel", locale: "zh", prerequisites: ["kernel"] }
  },
  {
    conceptIdFromPath: "sigmoid-kernel",
    localeFromPath: "en",
    filePath: "src/content/nodes/sigmoid-kernel/en.mdx",
    data: { id: "sigmoid-kernel", locale: "en", prerequisites: ["kernel", "linear-kernel"] }
  },
  {
    conceptIdFromPath: "sigmoid-kernel",
    localeFromPath: "zh",
    filePath: "src/content/nodes/sigmoid-kernel/zh.mdx",
    data: { id: "sigmoid-kernel", locale: "zh", prerequisites: ["kernel", "linear-kernel"] }
  },
  {
    conceptIdFromPath: "pca",
    localeFromPath: "en",
    filePath: "src/content/nodes/pca/en.mdx",
    data: { id: "pca", locale: "en", prerequisites: ["feature-map"] }
  },
  {
    conceptIdFromPath: "pca",
    localeFromPath: "zh",
    filePath: "src/content/nodes/pca/zh.mdx",
    data: { id: "pca", locale: "zh", prerequisites: ["feature-map"] }
  },
  {
    conceptIdFromPath: "mds",
    localeFromPath: "en",
    filePath: "src/content/nodes/mds/en.mdx",
    data: { id: "mds", locale: "en", prerequisites: ["pca"] }
  },
  {
    conceptIdFromPath: "mds",
    localeFromPath: "zh",
    filePath: "src/content/nodes/mds/zh.mdx",
    data: { id: "mds", locale: "zh", prerequisites: ["pca"] }
  },
  {
    conceptIdFromPath: "isomap",
    localeFromPath: "en",
    filePath: "src/content/nodes/isomap/en.mdx",
    data: { id: "isomap", locale: "en", prerequisites: ["mds"] }
  },
  {
    conceptIdFromPath: "isomap",
    localeFromPath: "zh",
    filePath: "src/content/nodes/isomap/zh.mdx",
    data: { id: "isomap", locale: "zh", prerequisites: ["mds"] }
  },
  {
    conceptIdFromPath: "lda",
    localeFromPath: "en",
    filePath: "src/content/nodes/lda/en.mdx",
    data: { id: "lda", locale: "en", prerequisites: ["pca"] }
  },
  {
    conceptIdFromPath: "lda",
    localeFromPath: "zh",
    filePath: "src/content/nodes/lda/zh.mdx",
    data: { id: "lda", locale: "zh", prerequisites: ["pca"] }
  },
  {
    conceptIdFromPath: "qda",
    localeFromPath: "en",
    filePath: "src/content/nodes/qda/en.mdx",
    data: { id: "qda", locale: "en", prerequisites: ["lda"] }
  },
  {
    conceptIdFromPath: "qda",
    localeFromPath: "zh",
    filePath: "src/content/nodes/qda/zh.mdx",
    data: { id: "qda", locale: "zh", prerequisites: ["lda"] }
  },
  {
    conceptIdFromPath: "sne",
    localeFromPath: "en",
    filePath: "src/content/nodes/sne/en.mdx",
    data: { id: "sne", locale: "en", prerequisites: ["isomap", "qda"] }
  },
  {
    conceptIdFromPath: "sne",
    localeFromPath: "zh",
    filePath: "src/content/nodes/sne/zh.mdx",
    data: { id: "sne", locale: "zh", prerequisites: ["isomap", "qda"] }
  },
  {
    conceptIdFromPath: "t-sne",
    localeFromPath: "en",
    filePath: "src/content/nodes/t-sne/en.mdx",
    data: { id: "t-sne", locale: "en", prerequisites: ["sne"] }
  },
  {
    conceptIdFromPath: "t-sne",
    localeFromPath: "zh",
    filePath: "src/content/nodes/t-sne/zh.mdx",
    data: { id: "t-sne", locale: "zh", prerequisites: ["sne"] }
  },
  {
    conceptIdFromPath: "umap",
    localeFromPath: "en",
    filePath: "src/content/nodes/umap/en.mdx",
    data: { id: "umap", locale: "en", prerequisites: ["isomap", "t-sne"] }
  },
  {
    conceptIdFromPath: "umap",
    localeFromPath: "zh",
    filePath: "src/content/nodes/umap/zh.mdx",
    data: { id: "umap", locale: "zh", prerequisites: ["isomap", "t-sne"] }
  },
  {
    conceptIdFromPath: "b-tree",
    localeFromPath: "en",
    filePath: "src/content/nodes/b-tree/en.mdx",
    data: { id: "b-tree", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "b-tree",
    localeFromPath: "zh",
    filePath: "src/content/nodes/b-tree/zh.mdx",
    data: { id: "b-tree", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "b-plus-tree",
    localeFromPath: "en",
    filePath: "src/content/nodes/b-plus-tree/en.mdx",
    data: { id: "b-plus-tree", locale: "en", prerequisites: ["b-tree"] }
  },
  {
    conceptIdFromPath: "b-plus-tree",
    localeFromPath: "zh",
    filePath: "src/content/nodes/b-plus-tree/zh.mdx",
    data: { id: "b-plus-tree", locale: "zh", prerequisites: ["b-tree"] }
  },
  {
    conceptIdFromPath: "dfa",
    localeFromPath: "en",
    filePath: "src/content/nodes/dfa/en.mdx",
    data: { id: "dfa", locale: "en", prerequisites: [] }
  },
  {
    conceptIdFromPath: "dfa",
    localeFromPath: "zh",
    filePath: "src/content/nodes/dfa/zh.mdx",
    data: { id: "dfa", locale: "zh", prerequisites: [] }
  },
  {
    conceptIdFromPath: "nfa",
    localeFromPath: "en",
    filePath: "src/content/nodes/nfa/en.mdx",
    data: { id: "nfa", locale: "en", prerequisites: ["dfa"] }
  },
  {
    conceptIdFromPath: "nfa",
    localeFromPath: "zh",
    filePath: "src/content/nodes/nfa/zh.mdx",
    data: { id: "nfa", locale: "zh", prerequisites: ["dfa"] }
  }
];

describe("validateKnowledgeGraph", () => {
  it("accepts the demo graph content", () => {
    const result = validateKnowledgeGraph(validRecords);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("rejects content whose id does not match its directory", () => {
    const result = validateKnowledgeGraph([
      ...validRecords,
      {
        conceptIdFromPath: "wrong-place",
        localeFromPath: "en",
        filePath: "src/content/nodes/wrong-place/en.mdx",
        data: { id: "bfs", locale: "en", prerequisites: [] }
      }
    ]);

    expect(result.errors).toContain('src/content/nodes/wrong-place/en.mdx: id "bfs" does not match directory "wrong-place"');
  });

  it("rejects unknown prerequisite ids", () => {
    const result = validateKnowledgeGraph([
      {
        conceptIdFromPath: "bfs",
        localeFromPath: "en",
        filePath: "src/content/nodes/bfs/en.mdx",
        data: { id: "bfs", locale: "en", prerequisites: ["missing-node"] }
      }
    ]);

    expect(result.errors).toContain('src/content/nodes/bfs/en.mdx: prerequisite "missing-node" is not a graph node');
  });
});
