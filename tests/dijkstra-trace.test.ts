import { describe, expect, it } from "vitest";
import {
  adjacency,
  complexityCounts,
  finalDistances,
  finalParents,
  scenarios,
  trace
} from "../src/components/interactive/dijkstraTrace";

describe("dijkstraTrace", () => {
  it("generates the expected final distances and parents", () => {
    expect(finalDistances).toEqual({
      A: 0,
      B: 3,
      C: 1,
      D: 4,
      E: 7,
      F: 8
    });
    expect(finalParents).toEqual({
      B: "C",
      C: "A",
      D: "B",
      E: "D",
      F: "E"
    });
  });

  it("includes required relaxation and stale-skip states", () => {
    const ids = new Set(trace.map((step) => step.id));
    for (const id of ["relax-C-B", "relax-B-D", "relax-D-E", "relax-E-F", "skip-stale-B-4", "skip-stale-D-6", "skip-stale-E-9", "skip-stale-F-10"]) {
      expect(ids.has(id), id).toBe(true);
    }

    const staleB = trace.find((step) => step.id === "skip-stale-B-4");
    expect(staleB?.popped).toEqual({ node: "B", distance: 4 });
    expect(staleB?.dist.B).toBe(3);
  });

  it("keeps canonical adjacency and complexity counts stable", () => {
    expect(adjacency.B).toEqual([["A", 4], ["C", 2], ["D", 1]]);
    expect(complexityCounts).toEqual({
      undirectedEdges: 9,
      directedNeighborScans: 18,
      heapPushes: 10,
      staleSkips: 4
    });
  });

  it("binds main scenarios to existing trace ids and separates variants", () => {
    const ids = new Set(trace.map((step) => step.id));
    for (const scenario of Object.values(scenarios)) {
      if (scenario.variant === "negative-directed") {
        expect(scenario.warningStepId).toMatch(/^negative-/);
        continue;
      }
      if (!scenario.traceStepId) continue;
      expect(ids.has(scenario.traceStepId), scenario.id).toBe(true);
    }
  });
});
