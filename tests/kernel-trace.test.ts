import { describe, expect, it } from "vitest";
import {
  dot,
  kernelPoints,
  labKernelRows,
  linearKernel,
  polynomialKernel,
  quadraticFeatureMap,
  rbfDecayRows,
  rbfKernel,
  rbfPainPoints,
  rbfPainRows,
  sigmoidKernel
} from "../src/components/interactive/kernelTrace";

describe("kernel trace helpers", () => {
  it("keeps the degree-2 feature map consistent with the squared dot-product shortcut", () => {
    const [a, b] = kernelPoints;

    expect(dot(quadraticFeatureMap(a), quadraticFeatureMap(b))).toBeCloseTo(linearKernel(a, b) ** 2);
  });

  it("computes the named kernel values for the fixture anchor pair", () => {
    const [a, b] = kernelPoints;

    expect(linearKernel(a, b)).toBe(3);
    expect(polynomialKernel(a, b)).toBeCloseTo(6.25);
    expect(rbfKernel(a, b)).toBeCloseTo(Math.exp(-0.5));
    expect(sigmoidKernel(a, b)).toBeCloseTo(Math.tanh(2.5));
  });

  it("gives an RBF self-similarity of one", () => {
    const [a] = kernelPoints;

    expect(rbfKernel(a, a)).toBe(1);
  });

  it("keeps the shared RBF fixture values from anchor A", () => {
    const [a, b, c, d] = kernelPoints;

    expect(rbfKernel(a, a)).toBe(1);
    expect(rbfKernel(a, b)).toBeCloseTo(Math.exp(-0.5));
    expect(rbfKernel(a, c)).toBeCloseTo(Math.exp(-2.5));
    expect(rbfKernel(a, d)).toBeCloseTo(Math.exp(-5));
  });

  it("keeps the far same-direction RBF pain case scenario-local", () => {
    const near = rbfPainRows.find((row) => row.point.id === "b");
    const far = rbfPainRows.find((row) => row.point.id === "e");

    expect(kernelPoints.some((point) => point.id === "e")).toBe(false);
    expect(rbfPainPoints.find((point) => point.id === "e")).toMatchObject({ label: "E", x: 4, y: 4 });
    expect(near?.dot).toBe(3);
    expect(near?.squaredDistance).toBe(1);
    expect(near?.value).toBeCloseTo(0.6065306597);
    expect(far?.dot).toBe(8);
    expect(far?.squaredDistance).toBe(18);
    expect(far?.value).toBeCloseTo(0.0001234098);
  });

  it("provides deterministic RBF decay rows for gamma 0.5", () => {
    expect(rbfDecayRows.map((row) => row.squaredDistance)).toEqual([0, 1, 5, 10, 18]);
    expect(rbfDecayRows.map((row) => row.value)).toEqual([
      1,
      Math.exp(-0.5),
      Math.exp(-2.5),
      Math.exp(-5),
      Math.exp(-9)
    ]);
  });

  it("keeps non-RBF lab values unaffected by the RBF gamma selector", () => {
    const [a] = kernelPoints;
    const gammaLow = 0.1;
    const gammaHigh = 1;

    for (const name of ["linear", "polynomial", "sigmoid"] as const) {
      expect(labKernelRows(name, a, gammaLow).map((row) => row.value)).toEqual(
        labKernelRows(name, a, gammaHigh).map((row) => row.value)
      );
    }

    expect(labKernelRows("rbf", a, gammaLow)[1].value).not.toBeCloseTo(labKernelRows("rbf", a, gammaHigh)[1].value);
  });
});
