import { describe, expect, it } from "vitest";
import {
  implicationTraceForSource,
  isSymbolicAnswer,
  membershipCases,
  practiceCards,
  hardnessCostState,
  sourceRows,
  sourceIdList,
  invalidCases,
  preservationLedgerRows,
  defaultImplicationSource
} from "../src/components/interactive/npHardnessTrace";

describe("np-hardness trace fixtures", () => {
  it("keeps non-symbolic source rows answer-preserving", () => {
    for (const row of sourceRows) {
      if (isSymbolicAnswer(row.sourceAnswer) || isSymbolicAnswer(row.targetAnswer)) {
        continue;
      }
      expect(row.sourceAnswer).toBe(row.targetAnswer);
    }
  });

  it("includes at least one concrete yes row and one concrete no row", () => {
    const concreteRows = sourceRows.filter((row) => !isSymbolicAnswer(row.sourceAnswer));
    const yesRows = concreteRows.filter((row) => row.sourceAnswer === "yes");
    const noRows = concreteRows.filter((row) => row.sourceAnswer === "no");
    expect(yesRows.length).toBeGreaterThanOrEqual(1);
    expect(noRows.length).toBeGreaterThanOrEqual(1);
  });

  it("builds the default implication trace with the required five steps", () => {
    const trace = implicationTraceForSource(defaultImplicationSource);
    expect(trace.map((step) => step.id)).toEqual([
      "choose-source",
      "receive-instance",
      "reduce-to-h",
      "solve-h",
      "return-source-answer"
    ]);
  });

  it("does not solve H before reducing to H", () => {
    const trace = implicationTraceForSource("sat-preview");
    let solveSeen = false;
    let reduceSeen = false;

    for (const step of trace) {
      if (step.id === "reduce-to-h") reduceSeen = true;
      if (step.id === "solve-h") solveSeen = true;
      if (step.id === "solve-h") {
        expect(reduceSeen).toBe(true);
      }
    }

    expect(solveSeen).toBe(true);
    expect(reduceSeen).toBe(true);
  });

  it("marks symbolic any-np row and keeps it separate from concrete yes/no checks", () => {
    const anyNp = sourceRows.find((row) => row.id === "any-np-problem");
    expect(anyNp).toBeDefined();
    expect(isSymbolicAnswer(anyNp!.sourceAnswer)).toBe(true);
    expect(isSymbolicAnswer(anyNp!.targetAnswer)).toBe(true);

    const validSourceForPractice = new Set<string>(sourceIdList);
    const concretePracticeRows = practiceCards
      .map((card) => card.fixtureId)
      .filter((fixtureId) => validSourceForPractice.has(fixtureId as string));
    expect(concretePracticeRows.includes("any-np-problem")).toBe(false);
  });

  it("selects one yes and one no concrete row for the formal preservation ledger", () => {
    const [yesRow, noRow] = preservationLedgerRows;

    expect(yesRow.sourceAnswer).toBe("yes");
    expect(yesRow.targetAnswer).toBe("yes");
    expect(noRow.sourceAnswer).toBe("no");
    expect(noRow.targetAnswer).toBe("no");
  });

  it("uses symbolic hard-cost formulas in the symbolic state", () => {
    expect(hardnessCostState).toMatchObject({
      sourceSizeSymbol: "n",
      targetSizeSymbol: "m",
      targetSizeBound: "m <= n^b",
      reductionTime: "O(n^a)",
      targetSolverTime: "O(m^c)",
      combinedTime: "O(n^a + n^{bc})",
      conclusion: "polynomial"
    });
  });

  it("covers all required invalid-case ids", () => {
    const required = [
      "wrong-arrow",
      "one-source-only",
      "not-in-np-confusion",
      "large-instance-confusion",
      "no-fast-algorithm-confusion",
      "optimization-confusion"
    ];
    const actual = invalidCases.map((item) => item.id);
    expect(actual).toEqual(required);
  });

  it("distinguishes membership case variants", () => {
    const ids = membershipCases.map((item) => item.id);
    expect(ids).toEqual(["np-hard-only", "in-np-only", "np-complete"]);
    const npHardOnly = membershipCases.find((item) => item.id === "np-hard-only");
    const inNpOnly = membershipCases.find((item) => item.id === "in-np-only");
    const npComplete = membershipCases.find((item) => item.id === "np-complete");

    expect(npHardOnly?.npHard).toBe(true);
    expect(npHardOnly?.inNp).toBe(false);
    expect(npComplete?.inNp).toBe(true);
    expect(npComplete?.npHard).toBe(true);
    expect(inNpOnly?.npHard).toBe(false);
    expect(inNpOnly?.inNp).toBe(true);
  });

  it("references valid fixture ids from practice cards", () => {
    const validSource = new Set<string>(sourceIdList);
    const validInvalid = new Set<string>(invalidCases.map((item) => item.id));
    const validMembership = new Set<string>(membershipCases.map((item) => item.id));
    for (const card of practiceCards) {
      const fixtureId = card.fixtureId as string;
      const isSource = validSource.has(fixtureId);
      const isInvalid = validInvalid.has(fixtureId);
      const isMembership = validMembership.has(fixtureId);
      expect(isSource || isInvalid || isMembership).toBe(true);
    }
  });

  it("flags wrong-arrow practice as requiring L <=p H, not H <=p L", () => {
    const wrongArrow = invalidCases.find((item) => item.id === "wrong-arrow");
    expect(wrongArrow).toBeDefined();
    expect(wrongArrow!.summary.en).toMatch(/H\s*<=p\s*L/);
    expect(wrongArrow!.evidence.en).toMatch(/H\s*<=p\s*L/);
    expect(wrongArrow!.conclusion.en).toMatch(/H <=p L/i);
    expect(wrongArrow!.conclusion.en).toMatch(/not (?:prove|establish)/i);
    expect(wrongArrow!.summary.en).not.toMatch(/L\s*<=p\s*H/);
    expect(wrongArrow!.explanation.en).toMatch(/solver.*for L/i);
    expect(wrongArrow!.explanation.en).toMatch(/solve H/i);
    expect(wrongArrow!.explanation.en).not.toMatch(/solver.*for H could help/i);
  });
});
