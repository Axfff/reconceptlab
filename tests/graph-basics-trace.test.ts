import { describe, expect, it } from "vitest";
import { adjacency, exerciseExpectations, matrixValue, scenarios, undirectedEdges } from "../src/components/interactive/graphBasicsTrace";

describe("graphBasicsTrace", () => {
  it("keeps the five-room adjacency fixture stable", () => {
    expect(adjacency.lobby).toEqual(["hall", "stairs"]);
    expect(adjacency.hall).toEqual(["lobby", "lab", "cafe"]);
    expect(adjacency.lab).toEqual(["hall"]);
    expect(adjacency.stairs).toEqual(["lobby", "cafe"]);
    expect(adjacency.cafe).toEqual(["hall", "stairs"]);
    expect(Object.values(adjacency).reduce((sum, neighbors) => sum + neighbors.length, 0)).toBe(undirectedEdges.length * 2);
  });

  it("keeps the undirected matrix symmetric", () => {
    for (const [from, tos] of Object.entries(adjacency)) {
      for (const to of tos) {
        expect(matrixValue(from as keyof typeof adjacency, to)).toBe(1);
        expect(matrixValue(to, from as keyof typeof adjacency)).toBe(1);
      }
    }
    expect(matrixValue("lab", "cafe")).toBe(0);
  });

  it("binds planned scenarios and exercise expectations to the fixture", () => {
    expect(Object.keys(scenarios)).toContain("door-change-pain");
    expect(scenarios["door-change-pain"].routeCardStatuses?.map((card) => card.status)).toEqual([
      "unchanged",
      "valid-needs-review",
      "stale",
      "missing"
    ]);
    expect(exerciseExpectations.selectLobbyNeighbors).toEqual(["hall", "stairs"]);
    expect(exerciseExpectations.labCafeMatrixCell).toBe(0);
  });
});
