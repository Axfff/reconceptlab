import { describe, expect, it } from "vitest";
import { finalDistance, finalParent, scenarios, trace } from "../src/components/interactive/bfsTrace";

describe("bfsTrace", () => {
  it("keeps final distances and parents stable", () => {
    expect(finalDistance).toEqual({
      A: 0,
      B: 1,
      C: 1,
      D: 2,
      E: 2,
      F: 2,
      G: 3
    });
    expect(finalParent).toEqual({
      B: "A",
      C: "A",
      D: "B",
      E: "B",
      F: "C",
      G: "D"
    });
  });

  it("preserves the layer queue states and no-reparent behavior", () => {
    expect(trace.find((step) => step.id === "after-expand-B")?.queue).toEqual(["C", "D", "E"]);
    expect(trace.find((step) => step.id === "discover-G-from-D")?.queue).toEqual(["E", "F", "G"]);
    expect(trace.find((step) => step.id === "skip-E-G")?.parent.G).toBe("D");
    expect(trace.find((step) => step.id === "skip-F-G")?.parent.G).toBe("D");
  });

  it("binds scenarios to existing trace ids", () => {
    const ids = new Set(trace.map((step) => step.id));
    for (const scenario of Object.values(scenarios)) {
      if (!scenario.traceStepId) continue;
      expect(ids.has(scenario.traceStepId), scenario.id).toBe(true);
    }
  });
});
