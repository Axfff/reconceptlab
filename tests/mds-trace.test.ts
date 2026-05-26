import { describe, expect, it } from "vitest";
import {
  canonicalPairKey,
  getMdsPair,
  mapDistance,
  mdsItems,
  mdsPairs,
  mdsTraceSteps,
  normalizedStress,
  pairResiduals,
  residualForPair,
  residualRows,
  stress,
  targetDistance
} from "../src/components/interactive/mdsTrace";

describe("mdsTrace", () => {
  it("keeps the five-item campus fixture and one unordered row per pair", () => {
    expect(mdsItems.map((item) => item.label.en)).toEqual(["Library", "Lab", "Cafe", "Dorm", "Gym"]);
    expect(mdsPairs).toHaveLength((mdsItems.length * (mdsItems.length - 1)) / 2);
    expect(new Set(mdsPairs.map((pair) => pair.id)).size).toBe(mdsPairs.length);
  });

  it("uses residual = map distance - target distance", () => {
    const row = residualRows("naive").find((candidate) => candidate.id === "library-gym");
    const pair = getMdsPair("library-gym");

    expect(row).toBeDefined();
    expect(row?.residual).toBeCloseTo(mapDistance("naive", pair) - pair.targetDistance);
    expect(row?.residual).toBeLessThan(0);
  });

  it("canonicalizes pair keys and target distances symmetrically", () => {
    expect(canonicalPairKey("library", "gym")).toBe("library-gym");
    expect(canonicalPairKey("gym", "library")).toBe("library-gym");
    expect(targetDistance("library", "gym")).toBe(3.6);
    expect(targetDistance("gym", "library")).toBe(3.6);
    expect(() => canonicalPairKey("gym", "gym")).toThrow("two distinct items");
  });

  it("returns symmetric residual measurements for either pair order", () => {
    const forward = residualForPair("naive", "library", "gym");
    const reversed = residualForPair("naive", "gym", "library");

    expect(forward).toEqual(reversed);
    expect(forward).toEqual({
      targetDistance: targetDistance("library", "gym"),
      mapDistance: mapDistance("naive", "library", "gym"),
      residual: forward.mapDistance - forward.targetDistance,
      squaredContribution: forward.residual ** 2
    });
    expect(forward.residual).toBeLessThan(0);
  });

  it("exports pairResiduals as the design-named residual row helper", () => {
    const rows = pairResiduals("improved");

    expect(rows).toEqual(residualRows("improved"));
    expect(rows).toHaveLength(mdsPairs.length);
    expect(rows.find((row) => row.id === "dorm-gym")?.residual).not.toBe(0);
  });

  it("makes the improved fixture lower stress while preserving visible residuals", () => {
    expect(stress("improved")).toBeLessThan(stress("naive"));
    expect(normalizedStress("improved")).toBeGreaterThan(0);

    const remaining = residualRows("improved").filter((row) => Math.abs(row.residual) > 0.1);
    expect(remaining.map((row) => row.id)).toContain("dorm-gym");
  });

  it("shares deterministic localized trace steps", () => {
    expect(mdsTraceSteps.map((step) => step.id)).toEqual([
      "read-table",
      "closest-pair",
      "add-more",
      "inspect-residuals",
      "lower-stress"
    ]);
    expect(mdsTraceSteps.every((step) => step.title.en && step.title.zh && step.explanation.en && step.explanation.zh)).toBe(true);
  });
});
