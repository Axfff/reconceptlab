import { describe, expect, it } from "vitest";
import { computeLayout } from "../src/components/GraphExplorer";
import { graphEdges, graphNodes } from "../src/data/graph";

function layoutSnapshot(nodes = graphNodes, edges = graphEdges) {
  const layout = computeLayout(nodes, edges, "en");

  return {
    edges: layout.edges.map((edge) => `${edge.from}>${edge.to}:${edge.type}`),
    height: layout.height,
    nodes: layout.nodes.map((node) => ({
      height: node.height,
      id: node.id,
      width: node.width,
      x: Number(node.x.toFixed(3)),
      y: Number(node.y.toFixed(3))
    })),
    width: layout.width
  };
}

describe("graph layout", () => {
  it("is deterministic for repeated calls", () => {
    expect(layoutSnapshot()).toEqual(layoutSnapshot());
  });

  it("does not depend on caller-provided node or edge order", () => {
    expect(layoutSnapshot([...graphNodes].reverse(), [...graphEdges].reverse())).toEqual(layoutSnapshot());
  });
});
