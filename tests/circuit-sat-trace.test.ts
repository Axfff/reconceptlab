import { describe, expect, it } from "vitest";
import {
  allPracticeFixtureIds,
  assignmentCount,
  assignmentGridGoldenState,
  assignmentRows,
  canonicalTraceOrder,
  circuitSatCircuit,
  evaluateCircuit,
  gateSemantics,
  growthGoldenState,
  malformedFixtures,
  misconceptionCards,
  parseNamedAssignment,
  practiceCards
} from "../src/components/interactive/circuitSatTrace";
import {
  answerPreservationRows,
  canonicalGateOrder,
  finalFormulaText,
  gateEncodings,
  reductionTraceForAssignment,
  sourceCircuit
} from "../src/components/interactive/circuitSatToSatTrace";

describe("circuit-sat trace fixtures", () => {
  it("evaluates documented accepting and rejecting assignments", () => {
    expect(evaluateCircuit(circuitSatCircuit, "1010")).toMatchObject({
      result: "accept",
      output: 1
    });
    expect(evaluateCircuit(circuitSatCircuit, "0101")).toMatchObject({
      result: "accept",
      output: 1
    });
    expect(evaluateCircuit(circuitSatCircuit, "0000")).toMatchObject({
      result: "reject",
      output: 0
    });
  });

  it("rejects malformed strings before gate evaluation", () => {
    const wrongLength = evaluateCircuit(circuitSatCircuit, "101");
    const nonBit = evaluateCircuit(circuitSatCircuit, "1020");

    expect(wrongLength.result).toBe("malformed");
    expect(wrongLength.steps.map((step) => step.id)).toEqual(["validation"]);
    expect(wrongLength.gateSteps).toEqual([]);

    expect(nonBit.result).toBe("malformed");
    expect(nonBit.steps.map((step) => step.id)).toEqual(["validation"]);
    expect(nonBit.gateSteps).toEqual([]);
  });

  it("rejects malformed named assignments", () => {
    for (const fixture of malformedFixtures.filter((item) => Array.isArray(item.certificate))) {
      const parsed = parseNamedAssignment(fixture.certificate as never);
      expect(parsed).toHaveProperty("en");
      const result = evaluateCircuit(circuitSatCircuit, fixture.certificate as never);
      expect(result.result).toBe("malformed");
      expect(result.gateSteps).toEqual([]);
    }
  });

  it("uses the canonical trace order for well-formed assignments", () => {
    const result = evaluateCircuit(circuitSatCircuit, "1010");

    expect(result.steps.map((step) => step.id)).toEqual(canonicalTraceOrder);
  });

  it("orders each gate after its dependencies are stored", () => {
    const result = evaluateCircuit(circuitSatCircuit, "1010");
    const seen = new Set<string>(circuitSatCircuit.inputs);

    for (const step of result.gateSteps) {
      for (const input of step.inputs) {
        expect(seen.has(input.id)).toBe(true);
      }
      seen.add(step.id);
    }
  });

  it("computes every gate output according to Boolean semantics", () => {
    const result = evaluateCircuit(circuitSatCircuit, "1010");

    for (const step of result.gateSteps) {
      expect(step.output).toBe(gateSemantics(step.op, step.inputs.map((input) => input.value)));
    }
  });

  it("returns deterministic assignment counts", () => {
    expect(assignmentCount(0)).toBe(1);
    expect(assignmentCount(4)).toBe(16);
    expect(assignmentCount(10)).toBe(1024);
  });

  it("keeps assignment fixture rows aligned with the evaluator", () => {
    for (const row of assignmentRows) {
      const result = evaluateCircuit(circuitSatCircuit, row.assignment);
      expect(result.result).toBe(row.result);
      expect(result.output).toBe(row.output);
    }
  });

  it("keeps practice cards on valid fixture ids", () => {
    const validFixtureIds = allPracticeFixtureIds();

    for (const card of practiceCards) {
      expect(validFixtureIds.has(card.fixtureId)).toBe(true);
    }
  });

  it("covers the required practice card cases", () => {
    expect(practiceCards.map((card) => card.fixtureId)).toEqual([
      "row-1010",
      "row-0000",
      "malformed-length",
      "malformed-non-bit",
      "claim-ledger"
    ]);
    expect(practiceCards.at(-1)?.expectedAnswer).toBe("in NP proved here; NP-hard named by Cook-Levin only");
  });

  it("keeps golden component states documented", () => {
    expect(assignmentGridGoldenState).toEqual({
      selectedAssignment: "1010",
      output: 1,
      reasonBadge: "satisfying via g1 AND g2",
      expected: "accept"
    });
    expect(growthGoldenState).toEqual({
      selectedInputCount: 4,
      assignmentCount: 16,
      oneCheckWorkLabel: "O(|C| + n)",
      bruteForceLabel: "16 checks for this fixture",
      reasonBadge: "search grows by doubling, checking one row follows the circuit once",
      expected: "growth comparison"
    });
  });

  it("has misconception cards referenced by stable ids", () => {
    expect(misconceptionCards.map((card) => card.id)).toEqual([
      "failed-row-proves-no",
      "trace-proves-hardness",
      "certificate-finds-it",
      "malformed-runs-gates"
    ]);
  });
});

describe("circuit-sat-to-sat trace fixtures", () => {
  it("uses source-gate IDs as helper variables", () => {
    expect(gateEncodings.map((entry) => entry.gate.id)).toEqual(sourceCircuit.gates.map((gate) => gate.id));
    expect(canonicalGateOrder).toEqual(sourceCircuit.gates.map((gate) => gate.id));
    expect(finalFormulaText).toContain("z");
  });

  it("evaluates known yes/no rows into the same formula answers", () => {
    const sharedRows = ["1010", "0101", "0000"] as const;

    for (const assignment of sharedRows) {
      const run = reductionTraceForAssignment(assignment);
      expect(run.status).toBe("ok");
      if (run.status === "ok") {
        const row = answerPreservationRows.find((item) => item.assignment === assignment);
        expect(row).toBeDefined();
        expect(row).toMatchObject({
          circuitOutput: run.outputValue,
          reductionOutput: run.finalFormulaValue
        });
      }
    }
  });

  it("keeps malformed strings from emitting any gate constraints", () => {
    const malformed = reductionTraceForAssignment("1020");
    expect(malformed.status).toBe("malformed");
    expect(malformed.steps).toEqual([]);
    expect(malformed).not.toHaveProperty("gateValues");
  });

  it("emits only emitted-form constraints (no bi-implication glyphs)", () => {
    const run = reductionTraceForAssignment("1010");
    expect(run.status).toBe("ok");
    if (run.status === "ok") {
      const gateSteps = run.steps.filter((step) => step.kind === "gate");
      expect(gateSteps.every((step) => !step.emittedFormula.includes("<->"))).toBe(true);
      expect(gateSteps.every((step) => !step.emittedFormula.includes("↔"))).toBe(true);
      expect(finalFormulaText.includes("<->")).toBe(false);
      expect(run.outputValue).toBe(1);
      expect(run.finalFormulaValue).toBe(1);
    }
  });

  it("keeps answer-preservation accounting: AND z can flip a row", () => {
    const row0000 = answerPreservationRows.find((row) => row.assignment === "0000");
    expect(row0000).toBeDefined();
    if (row0000) {
      expect(row0000.reductionOutputNoZ).toBe(1);
      expect(row0000.reductionOutput).toBe(0);
      expect(row0000.circuitOutput).toBe(0);
    }
  });

  it("tracks trace steps in topological gate order", () => {
    const run = reductionTraceForAssignment("1010");
    expect(run.status).toBe("ok");
    if (run.status === "ok") {
      const gateIds = run.steps
        .filter((step) => step.kind === "gate")
        .map((step) => step.helperVar);
      expect(gateIds).toEqual(sourceCircuit.gates.map((gate) => gate.id));
      expect(gateIds).toEqual(canonicalGateOrder);
      expect(run.steps.at(-1)?.kind).toBe("assert-output");
    }
  });
});
