import { describe, expect, it } from "vitest";
import {
  allValidIntersections,
  finalReportedPairs,
  pairKey,
  scenarios,
  trace
} from "../src/components/interactive/bentleyOttmannTrace";

describe("bentleyOttmannTrace", () => {
  it("keeps the fixture geometry and event x-order stable", () => {
    const intersections = allValidIntersections();

    expect(intersections.map((entry) => pairKey(entry.pair))).toEqual(["A-C", "A-B", "B-C"]);
    expect(intersections.map((entry) => Number(entry.point.x.toFixed(3)))).toEqual([6, 7.778, 8.667]);
    expect(intersections.some((entry) => entry.pair.includes("D"))).toBe(false);
  });

  it("reports intersections in sweep order", () => {
    expect(finalReportedPairs.map(pairKey)).toEqual(["A-C", "A-B", "B-C"]);
    expect(trace.at(-1)?.reportedIntersections.map(pairKey)).toEqual(["A-C", "A-B", "B-C"]);
  });

  it("pins stale cleanup and rescheduling around C, A, and B", () => {
    const leftC = trace.find((step) => step.id === "left-C");
    const intersectAC = trace.find((step) => step.id === "intersect-A-C");
    const intersectAB = trace.find((step) => step.id === "intersect-A-B");

    expect(leftC?.statusBefore).toEqual(["D", "B", "A"]);
    expect(leftC?.statusAfter).toEqual(["D", "B", "C", "A"]);
    expect(leftC?.removedStaleEvents).toEqual(["intersect-A-B"]);
    expect(leftC?.scheduledEvents).toEqual(["intersect-A-C", "intersect-B-C"]);

    expect(intersectAC?.reportedIntersections.map(pairKey)).toEqual(["A-C"]);
    expect(intersectAC?.statusAfter).toEqual(["D", "B", "A", "C"]);
    expect(intersectAC?.removedStaleEvents).toEqual(["intersect-B-C"]);
    expect(intersectAC?.scheduledEvents).toEqual(["intersect-A-B"]);
    expect(intersectAC?.queueAfter).toEqual(["intersect-A-B", "right-B", "right-C", "right-A", "right-D"]);

    expect(intersectAB?.reportedIntersections.map(pairKey)).toEqual(["A-C", "A-B"]);
    expect(intersectAB?.statusAfter).toEqual(["D", "A", "B", "C"]);
    expect(intersectAB?.scheduledEvents).toEqual(["intersect-B-C"]);
  });

  it("models right-B as a one-neighbor deletion", () => {
    const rightB = trace.find((step) => step.id === "right-B");

    expect(rightB?.statusBefore).toEqual(["D", "A", "C", "B"]);
    expect(rightB?.statusAfter).toEqual(["D", "A", "C"]);
    expect(rightB?.testedPairs).toEqual([]);
    expect(rightB?.scheduledEvents).toEqual([]);
  });

  it("binds scenario figures to existing trace steps", () => {
    for (const scenario of Object.values(scenarios)) {
      if (!scenario.traceStepId) continue;
      expect(trace.some((step) => step.id === scenario.traceStepId), scenario.id).toBe(true);
    }
  });
});
