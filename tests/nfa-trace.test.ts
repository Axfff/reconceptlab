import { describe, expect, it } from "vitest";
import {
  acceptingStates,
  generateNfaTrace,
  nfaFixture,
  nfaStates,
  nfaSymbols,
  transition,
  transitionTable
} from "../src/components/interactive/nfaTrace";

describe("nfaTrace", () => {
  it("accepts the golden contains-01 cases", () => {
    for (const input of nfaFixture.accepted) {
      expect(generateNfaTrace(input).accepted, input).toBe(true);
    }
  });

  it("rejects the golden non-matching cases", () => {
    for (const input of nfaFixture.rejected) {
      expect(generateNfaTrace(input).accepted, input).toBe(false);
    }
  });

  it("generates the exact active-set trace for 010", () => {
    expect(generateNfaTrace("010").steps.map((step) => step.activeStates)).toEqual([
      ["q0"],
      ["q0", "q1"],
      ["q0", "q2"],
      ["q0", "q1", "q2"]
    ]);
  });

  it("records q1 branch death on 0 while q0 spawns a replacement branch", () => {
    const secondZero = generateNfaTrace("00").steps[2];

    expect(secondZero.previousActiveStates).toEqual(["q0", "q1"]);
    expect(secondZero.activeStates).toEqual(["q0", "q1"]);
    expect(secondZero.spawnedBranches).toEqual(["q1"]);
    expect(secondZero.diedBranches).toEqual(["q1"]);
    expect(secondZero.transitionEvents.map((event) => [event.from, event.to, event.spawned, event.died])).toEqual([
      ["q0", ["q0", "q1"], ["q1"], false],
      ["q1", [], [], true]
    ]);
  });

  it("branches q0 on 0 to q0 and q1", () => {
    expect(transition("q0", "0")).toEqual(["q0", "q1"]);
  });

  it("loops q2 on both symbols", () => {
    expect(transition("q2", "0")).toEqual(["q2"]);
    expect(transition("q2", "1")).toEqual(["q2"]);
  });

  it("separates prefix acceptance from whole-input acceptance", () => {
    const trace = generateNfaTrace("010");
    const prefix01 = trace.steps.find((step) => step.prefix === "01");

    expect(trace.steps[1].acceptedIfInputEndedHere).toBe(false);
    expect(prefix01?.acceptedIfInputEndedHere).toBe(true);
    expect(trace.accepted).toBe(true);
  });

  it("uses final active-set intersection for whole-input acceptance", () => {
    const trace = generateNfaTrace("00");
    expect(trace.steps[1].acceptedIfInputEndedHere).toBe(false);
    expect(trace.finalActiveStates.some((state) => acceptingStates.includes(state))).toBe(false);
    expect(trace.accepted).toBe(false);
  });

  it("covers every symbol in every transition row", () => {
    for (const state of nfaStates) {
      expect(Object.keys(transitionTable[state]).sort(), state).toEqual([...nfaSymbols].sort());
    }
  });
});
