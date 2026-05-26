import { describe, expect, it } from "vitest";
import {
  classify,
  dfaFixture,
  dfaStates,
  dfaSymbols,
  generateDfaTrace,
  transitionTable
} from "../src/components/interactive/dfaTrace";

describe("dfaTrace", () => {
  it("accepts the golden toy email cases", () => {
    for (const input of dfaFixture.accepted) {
      expect(generateDfaTrace(input).accepted, input).toBe(true);
    }
  });

  it("rejects the golden non-matching cases", () => {
    for (const input of dfaFixture.rejected) {
      expect(generateDfaTrace(input).accepted, input).toBe(false);
    }
  });

  it("classifies letters and digits as char", () => {
    expect(classify("a")).toBe("char");
    expect(classify("Z")).toBe("char");
    expect(classify("9")).toBe("char");
  });

  it("classifies boundaries for at, dot, and other", () => {
    expect(classify("@")).toBe("at");
    expect(classify(".")).toBe("dot");
    expect(classify("_")).toBe("other");
    expect(classify("!")).toBe("other");
    expect(classify(" ")).toBe("other");
    expect(classify("🙂")).toBe("other");
  });

  it("rejects other symbols anywhere they appear", () => {
    expect(generateDfaTrace("ana_@cs.ai").accepted).toBe(false);
    expect(generateDfaTrace("ana@cs!.ai").accepted).toBe(false);
    expect(generateDfaTrace("ana@cs.ai!").accepted).toBe(false);
  });

  it("rejects dots in the wrong phase", () => {
    expect(generateDfaTrace(".ana@cs.ai").accepted).toBe(false);
    expect(generateDfaTrace("ana.@cs.ai").accepted).toBe(false);
    expect(generateDfaTrace("ana@.ai").accepted).toBe(false);
  });

  it("generates the expected success trace for ana@cs.ai", () => {
    expect(generateDfaTrace("ana@cs.ai").steps.map((step) => step.state)).toEqual([
      "need-local",
      "in-local",
      "in-local",
      "in-local",
      "need-domain",
      "in-domain",
      "in-domain",
      "need-suffix",
      "in-suffix",
      "in-suffix"
    ]);
    expect(generateDfaTrace("ana@cs.ai").accepted).toBe(true);
  });

  it("moves ana@.ai to dead immediately after the dot", () => {
    const trace = generateDfaTrace("ana@.ai");
    const deadStep = trace.steps.find((step) => step.state === "dead");
    expect(deadStep?.prefix).toBe("ana@.");
    expect(deadStep?.previousState).toBe("need-domain");
    expect(deadStep?.symbol).toBe("dot");
    expect(trace.accepted).toBe(false);
  });

  it("uses final-status semantics for ana@cs.ai.", () => {
    const trace = generateDfaTrace("ana@cs.ai.");
    const acceptingPrefix = trace.steps.find((step) => step.prefix === "ana@cs.ai");
    expect(acceptingPrefix?.state).toBe("in-suffix");
    expect(acceptingPrefix?.acceptedNow).toBe(true);
    expect(trace.finalState).toBe("dead");
    expect(trace.accepted).toBe(false);
  });

  it("covers every symbol in every transition row", () => {
    for (const state of dfaStates) {
      expect(Object.keys(transitionTable[state]).sort(), state).toEqual([...dfaSymbols].sort());
    }
  });

  it("keeps dead as a self-loop for every symbol", () => {
    for (const symbol of dfaSymbols) {
      expect(transitionTable.dead[symbol]).toBe("dead");
    }
  });
});
