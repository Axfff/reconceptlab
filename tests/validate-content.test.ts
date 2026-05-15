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
