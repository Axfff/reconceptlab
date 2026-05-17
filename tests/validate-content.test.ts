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
