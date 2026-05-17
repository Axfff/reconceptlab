import { describe, expect, it } from "vitest";
import {
  costState,
  directionCases,
  edgeListToAdjacencyMap,
  hasPath,
  invalidReductionCases,
  pathEncodingExample,
  pathEncodingTrace,
  practiceCards,
  reduceTwoNumberSum4ToTargetSum,
  reductionTraceFor,
  targetSumAnswer,
  toyFixtureRows,
  toySourceAnswer
} from "../src/components/interactive/reductionTrace";

describe("reduction trace fixtures", () => {
  it("maps TwoNumberSum4 into TargetSum by setting target to 4", () => {
    expect(reduceTwoNumberSum4ToTargetSum({ id: "yes-13", a: 1, b: 3 })).toEqual({ a: 1, b: 3, target: 4 });
  });

  it("preserves every toy fixture answer exactly", () => {
    for (const row of toyFixtureRows) {
      expect(reduceTwoNumberSum4ToTargetSum(row.source)).toEqual(row.target);
      expect(toySourceAnswer(row.source)).toBe(row.sourceAnswer);
      expect(targetSumAnswer(row.target)).toBe(row.targetAnswer);
      expect(row.sourceAnswer).toBe(row.targetAnswer);
    }
  });

  it("includes at least two Yes and two No toy rows", () => {
    expect(toyFixtureRows.filter((row) => row.sourceAnswer).length).toBeGreaterThanOrEqual(2);
    expect(toyFixtureRows.filter((row) => !row.sourceAnswer).length).toBeGreaterThanOrEqual(2);
  });

  it("builds the four-step toy proof trace", () => {
    expect(reductionTraceFor("yes-13").map((step) => step.id)).toEqual([
      "receive-source",
      "compute-target",
      "solve-target",
      "return-answer"
    ]);
  });

  it("keeps the simple cost model internally consistent", () => {
    const state = costState(10);

    expect(state.sourceEncodingLength).toBe(10);
    expect(state.translatorWork).toBe(10 ** 2);
    expect(state.targetEncodingLength).toBeLessThanOrEqual(10 ** 2);
    expect(state.targetSolverTime).toBe(state.targetEncodingLength ** 3);
    expect(state.combinedTime).toBe(state.translatorWork + state.targetSolverTime);
    expect(state.mappedInstanceSize).toBe(state.targetEncodingLength);
    expect(state.mappedInstanceSizeIsPolynomial).toBe(true);
    expect(state.translatorWork).toBeGreaterThanOrEqual(state.targetEncodingLength);
  });

  it("distinguishes algorithm transfer, valid hardness preview, and wrong hardness arrow", () => {
    expect(directionCases.find((item) => item.id === "algorithm-transfer")).toMatchObject({
      notation: "A <=p B",
      assumedSolver: "B",
      derivedSolver: "A",
      validConclusion: true
    });
    expect(directionCases.find((item) => item.id === "hardness-preview")).toMatchObject({
      notation: "A <=p B",
      knownHardSource: "A",
      target: "B",
      validConclusion: true
    });
    expect(directionCases.find((item) => item.id === "wrong-hardness-arrow")).toMatchObject({
      notation: "B <=p A",
      knownHardSource: "A",
      attemptedTarget: "B",
      validConclusion: false
    });
  });

  it("covers invalid reduction cases explicitly", () => {
    expect(invalidReductionCases.map((item) => item.id)).toEqual([
      "one-way-implication",
      "exponential-translator",
      "solves-inside-translator",
      "wrong-hardness-arrow",
      "solution-object-confusion"
    ]);

    const oneWay = invalidReductionCases.find((item) => item.id === "one-way-implication");
    expect(oneWay?.id).toBe("one-way-implication");
    if (oneWay?.id === "one-way-implication") {
      expect(oneWay.rows.some((row) => row.sourceAnswer === false && row.targetAnswer === true)).toBe(true);
    }

    const exponential = invalidReductionCases.find((item) => item.id === "exponential-translator");
    expect(exponential).toMatchObject({ mappedInstanceSizeIsPolynomial: false });

    const wrongArrow = invalidReductionCases.find((item) => item.id === "wrong-hardness-arrow");
    expect(wrongArrow).toMatchObject({
      knownHardSource: "A",
      notation: "B <=p A",
      validConclusion: false
    });
  });

  it("preserves reachability while changing path encoding", () => {
    expect(edgeListToAdjacencyMap(pathEncodingExample.edgeList)).toEqual(pathEncodingExample.adjacencyMap);
    expect(hasPath(pathEncodingExample.adjacencyMap, pathEncodingExample.source, pathEncodingExample.target)).toBe(pathEncodingExample.answer);
  });

  it("builds the four-step path encoding trace", () => {
    expect(pathEncodingTrace().map((step) => step.id)).toEqual([
      "receive-edge-list",
      "build-adjacency-map",
      "solve-adjacency-map",
      "return-path-answer"
    ]);
  });

  it("keeps practice cards tied to known fixture ids", () => {
    const validFixtureIds = new Set([
      pathEncodingExample.id,
      ...toyFixtureRows.map((row) => row.source.id),
      ...directionCases.map((row) => row.id),
      "cost-10"
    ]);

    for (const card of practiceCards) {
      expect(validFixtureIds.has(card.fixtureId)).toBe(true);
    }
  });
});
