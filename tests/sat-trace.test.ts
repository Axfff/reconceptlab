import { describe, expect, it } from "vitest";
import {
  allPracticeFixtureIds,
  assignmentCount,
  assignmentGridGoldenState,
  assignmentRows,
  canonicalTraceOrder,
  evaluateFormula,
  formulaSemantics,
  growthGoldenState,
  malformedFixtures,
  misconceptionCards,
  parseNamedAssignment,
  practiceCards,
  satFormula,
  unsatContrastRows
} from "../src/components/interactive/satTrace";

describe("sat trace fixtures", () => {
  it("evaluates documented accepting and rejecting assignments", () => {
    expect(evaluateFormula(satFormula, "1010")).toMatchObject({
      result: "accept",
      output: 1
    });
    expect(evaluateFormula(satFormula, "0101")).toMatchObject({
      result: "accept",
      output: 1
    });
    expect(evaluateFormula(satFormula, "0000")).toMatchObject({
      result: "reject",
      output: 0
    });
  });

  it("rejects malformed strings before formula evaluation", () => {
    const wrongLength = evaluateFormula(satFormula, "101");
    const nonBit = evaluateFormula(satFormula, "1020");

    expect(wrongLength.result).toBe("malformed");
    expect(wrongLength.steps.map((step) => step.id)).toEqual(["validation"]);
    expect(wrongLength.formulaSteps).toEqual([]);

    expect(nonBit.result).toBe("malformed");
    expect(nonBit.steps.map((step) => step.id)).toEqual(["validation"]);
    expect(nonBit.formulaSteps).toEqual([]);
  });

  it("rejects malformed named assignments", () => {
    for (const fixture of malformedFixtures.filter((item) => Array.isArray(item.certificate))) {
      const parsed = parseNamedAssignment(fixture.certificate as never);
      expect(parsed).toHaveProperty("en");
      const result = evaluateFormula(satFormula, fixture.certificate as never);
      expect(result.result).toBe("malformed");
      expect(result.formulaSteps).toEqual([]);
    }
  });

  it("uses the canonical formula-occurrence trace order", () => {
    const result = evaluateFormula(satFormula, "1010");

    expect(result.steps.map((step) => step.id)).toEqual(canonicalTraceOrder);
  });

  it("orders each parent subformula after its dependencies are stored", () => {
    const result = evaluateFormula(satFormula, "1010");
    const seen = new Set<string>();

    for (const step of result.formulaSteps) {
      for (const dependency of step.dependencies) {
        if (String(dependency.id).startsWith("x") && !String(dependency.id).includes("-")) continue;
        expect(seen.has(dependency.id)).toBe(true);
      }
      seen.add(step.id);
    }
  });

  it("computes every operator output according to Boolean semantics", () => {
    const result = evaluateFormula(satFormula, "1010");

    for (const step of result.formulaSteps) {
      expect(step.output).toBe(formulaSemantics(step.op, step.dependencies.map((input) => input.value)));
    }
  });

  it("keeps the fixture AST convention and formula size explicit", () => {
    expect(satFormula.size).toBe(11);
    expect(satFormula.root.kind).toBe("or");
    if (satFormula.root.kind !== "or") throw new Error("fixture root should be OR");
    expect(satFormula.root.children).toHaveLength(2);
    const left = satFormula.root.children[0];
    expect(left.kind).toBe("and");
    if (left.kind === "and") expect(left.children).toHaveLength(3);
  });

  it("returns deterministic assignment counts", () => {
    expect(assignmentCount(0)).toBe(1);
    expect(assignmentCount(4)).toBe(16);
    expect(assignmentCount(10)).toBe(1024);
  });

  it("keeps assignment fixture rows aligned with the evaluator", () => {
    for (const row of assignmentRows) {
      const result = evaluateFormula(satFormula, row.assignment);
      expect(result.result).toBe(row.result);
      expect(result.output).toBe(row.output);
    }
  });

  it("keeps the tiny unsat contrast separate and fully false", () => {
    expect(unsatContrastRows).toEqual([
      expect.objectContaining({ assignment: "0", output: 0 }),
      expect.objectContaining({ assignment: "1", output: 0 })
    ]);
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
    expect(practiceCards.at(-1)?.expectedAnswer).toBe("in NP proved here; reductions and CNF forms are future nodes");
  });

  it("keeps golden component states documented", () => {
    expect(assignmentGridGoldenState).toEqual({
      selectedAssignment: "1010",
      output: 1,
      reasonBadge: "satisfying via left side",
      expected: "accept"
    });
    expect(growthGoldenState).toEqual({
      selectedInputCount: 4,
      assignmentCount: 16,
      oneCheckWorkLabel: "O(|phi| + n)",
      bruteForceLabel: "16 formula checks for this fixture",
      reasonBadge: "search doubles rows, checking one certificate evaluates the formula once",
      expected: "growth comparison"
    });
  });

  it("has misconception cards referenced by stable ids", () => {
    expect(misconceptionCards.map((card) => card.id)).toEqual([
      "failed-row-proves-no",
      "certificate-finds-it",
      "sat-vs-cnf",
      "malformed-runs-formula"
    ]);
  });
});
