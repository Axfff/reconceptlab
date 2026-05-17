import { describe, expect, it } from "vitest";
import { candidateRows, circuit, demoTabs, growthState, stateIds, verifyCircuit } from "../src/components/interactive/pnpTrace";

describe("pnpTrace", () => {
  it("evaluates documented candidate rows", () => {
    for (const row of candidateRows) {
      expect(verifyCircuit(circuit, row.assignment).accepted, row.id).toBe(row.result);
    }
  });

  it("rejects malformed certificates before gate evaluation", () => {
    expect(verifyCircuit(circuit, { x1: 1, x2: 0 }).reason).toBe("malformed");
    expect(verifyCircuit(circuit, { x1: 1, x2: 0, x3: 2 }).trace).toEqual([]);
  });

  it("keeps growth models deterministic", () => {
    expect(growthState(10, "scaling-thought-experiment")).toMatchObject({
      variables: 10,
      assignments: 1024,
      gateCount: 20,
      checkSteps: 30
    });
    expect(growthState(3, "fixed-toy-circuit")).toMatchObject({
      variables: 3,
      assignments: 8,
      gateCount: 3,
      checkSteps: 6
    });
  });

  it("keeps shared demo state ids available", () => {
    expect(stateIds).toEqual(
      expect.arrayContaining([
        "initial-unknown",
        "try-failed-candidate",
        "try-000",
        "accepting-candidate",
        "verifier-accepts",
        "verifier-rejects-malformed",
        "candidate-exists",
        "candidate-failed",
        "p-subset-np-yes",
        "p-subset-np-no"
      ])
    );
    expect(demoTabs).toEqual(["search all assignments", "check certificate", "P subset NP"]);
  });
});
