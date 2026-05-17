import { describe, expect, it } from "vitest";
import {
  activeFGridWindowPairs,
  allCrossPairs,
  bandOnlyCrossPairs,
  boundaryFixture,
  cellFor,
  cellForId,
  cellSize,
  distanceById,
  duplicateFixture,
  finalPair,
  firstDuplicate,
  gridOrigin,
  gridWindowCrossPairs,
  neighborCells,
  pairKey,
  r,
  rLeft,
  rRight,
  scenarios,
  splitX,
  trace
} from "../src/components/interactive/closestPairTrace";

describe("closestPairTrace", () => {
  it("keeps the deterministic fixture values stable", () => {
    expect(splitX).toBe(5);
    expect(gridOrigin).toEqual({ x: 0, y: 0 });
    expect(rLeft).toBeCloseTo(1.9416, 4);
    expect(rRight).toBeCloseTo(1.3, 4);
    expect(r).toBeCloseTo(1.3, 4);
    expect(cellSize).toBeCloseTo(r / Math.sqrt(2), 8);
    expect(finalPair).toEqual(["F", "G"]);
    expect(distanceById(finalPair)).toBeCloseTo(0.7071, 4);
  });

  it("exports canonical candidate counts and ordering", () => {
    expect(allCrossPairs).toHaveLength(36);
    expect(bandOnlyCrossPairs).toEqual([["E", "G"], ["E", "H"], ["F", "G"], ["F", "H"]]);
    expect(gridWindowCrossPairs).toEqual([["E", "G"], ["E", "H"], ["F", "G"], ["F", "H"]]);
    expect(activeFGridWindowPairs).toEqual([["F", "G"], ["F", "H"]]);

    const keys = gridWindowCrossPairs.map(pairKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses pinned half-open grid cell assignment", () => {
    expect(cellForId("E")).toBe("4,2");
    expect(cellForId("F")).toBe("5,4");
    expect(cellForId("G")).toBe("5,4");
    expect(cellForId("H")).toBe("6,3");

    for (const point of boundaryFixture.points) {
      const pointId = point.id as keyof typeof boundaryFixture.expectedCells;
      expect(cellFor(point, boundaryFixture.origin, boundaryFixture.cellSize)).toBe(boundaryFixture.expectedCells[pointId]);
    }
  });

  it("uses the safe fixed neighbor window for the active F cell", () => {
    const cells = neighborCells(cellForId("F"));
    expect(cells).toHaveLength(25);
    expect(cells).toContain(cellForId("G"));
    expect(cells).toContain(cellForId("H"));
  });

  it("returns duplicate coordinates before grid construction", () => {
    expect(firstDuplicate(duplicateFixture)).toEqual(["P", "Q"]);
  });

  it("binds scenarios to valid trace step ids", () => {
    for (const scenario of Object.values(scenarios)) {
      if (!scenario.traceStepId) continue;
      expect(trace.some((step) => step.id === scenario.traceStepId), scenario.id).toBe(true);
    }
  });

  it("keeps pair categories mutually exclusive in each trace step", () => {
    for (const step of trace) {
      if (!step.pairCategories) continue;
      const keys = Object.values(step.pairCategories).flat().map(pairKey);
      expect(new Set(keys).size, step.id).toBe(keys.length);
    }
  });
});
