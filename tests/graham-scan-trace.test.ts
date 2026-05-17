import { describe, expect, it } from "vitest";
import {
  discriminatingAnchorFixture,
  finalHull,
  lowestLeftmost,
  orientationOf,
  scenarios,
  sortedOrder,
  trace
} from "../src/components/interactive/grahamScanTrace";

describe("grahamScanTrace", () => {
  it("uses the lowest-leftmost anchor convention", () => {
    expect(lowestLeftmost(discriminatingAnchorFixture).id).toBe("A");
  });

  it("keeps the sorted order, pop sequence, and final hull stable", () => {
    expect(sortedOrder).toEqual(["B", "C", "F", "G", "D", "I", "E", "H"]);
    expect(finalHull).toEqual(["A", "C", "D", "E", "H"]);
    expect(trace.filter((step) => step.action === "pop").map((step) => step.poppedPoint)).toEqual(["B", "F", "G", "I"]);
  });

  it("labels the teaching triples with the expected orientations", () => {
    expect(orientationOf(["C", "F", "G"])).toBe("right");
    expect(orientationOf(["A", "B", "C"])).toBe("collinear");
  });

  it("binds section figures to matching trace states", () => {
    for (const scenario of Object.values(scenarios)) {
      if (!scenario.traceStepId) continue;

      const step = trace.find((candidate) => candidate.id === scenario.traceStepId);
      expect(step, scenario.id).toBeDefined();
      expect(scenario.expectedPointLabels, scenario.id).toEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);

      if (!step || !scenario.state) continue;
      expect(step.activePoint, scenario.id).toBe(scenario.state.activePoint);
      expect(step.stack, scenario.id).toEqual(scenario.state.afterStack ?? step.stack);
      expect(step.triple, scenario.id).toEqual(scenario.state.triple);
      expect(step.orientation, scenario.id).toBe(scenario.state.orientation);
      expect(step.poppedPoint, scenario.id).toBe(scenario.state.poppedPoint);
    }
  });
});
