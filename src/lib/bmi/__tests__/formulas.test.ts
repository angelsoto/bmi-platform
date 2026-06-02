import { describe, it, expect } from "vitest";
import {
  computeValidationPriorityScore,
  computeEvidenceStrength,
  computeEvidenceDistortionCoefficient,
  computePmfScore,
  computeValidationCoverage,
  resolveReadinessState,
} from "../formulas";

describe("computeValidationPriorityScore (§6.6)", () => {
  it("critical + high uncertainty = 100", () => {
    expect(computeValidationPriorityScore("critical", "high")).toBe(100);
  });

  it("critical + medium uncertainty = 67", () => {
    expect(computeValidationPriorityScore("critical", "medium")).toBe(67);
  });

  it("low + low uncertainty = 8", () => {
    expect(computeValidationPriorityScore("low", "low")).toBe(8);
  });

  it("medium + medium uncertainty = 33", () => {
    expect(computeValidationPriorityScore("medium", "medium")).toBe(33);
  });
});

describe("computeEvidenceStrength (§11A.4)", () => {
  it("returns 'none' with no evidence", () => {
    expect(computeEvidenceStrength([])).toBe("none");
  });

  it("returns 'weak' with single weak item", () => {
    expect(computeEvidenceStrength([{ id: "1", adjustedEvidenceStrength: "weak" }])).toBe("weak");
  });

  it("returns 'moderate' with single strong item (fails sample-size guard)", () => {
    expect(computeEvidenceStrength([{ id: "1", adjustedEvidenceStrength: "strong" }])).toBe("moderate");
  });

  it("returns 'strong' with 3 strong items", () => {
    const items = [
      { id: "1", adjustedEvidenceStrength: "strong" as const },
      { id: "2", adjustedEvidenceStrength: "strong" as const },
      { id: "3", adjustedEvidenceStrength: "strong" as const },
    ];
    expect(computeEvidenceStrength(items)).toBe("strong");
  });

  it("returns 'weak' with mixed weak and moderate (avg < 1.5)", () => {
    const items = [
      { id: "1", adjustedEvidenceStrength: "weak" as const },
      { id: "2", adjustedEvidenceStrength: "weak" as const },
      { id: "3", adjustedEvidenceStrength: "moderate" as const },
    ];
    // avg = (1 + 1 + 2) / 3 = 1.33 → weak
    expect(computeEvidenceStrength(items)).toBe("weak");
  });

  it("returns 'moderate' with moderate avg (1.5-2.5)", () => {
    const items = [
      { id: "1", adjustedEvidenceStrength: "moderate" as const },
      { id: "2", adjustedEvidenceStrength: "moderate" as const },
    ];
    // avg = 2 → moderate
    expect(computeEvidenceStrength(items)).toBe("moderate");
  });

  it("guards: 2 strong items returns moderate (needs 3)", () => {
    const items = [
      { id: "1", adjustedEvidenceStrength: "strong" as const },
      { id: "2", adjustedEvidenceStrength: "strong" as const },
    ];
    // avg = 3, but count < 3 → moderate
    expect(computeEvidenceStrength(items)).toBe("moderate");
  });
});

describe("computeEvidenceDistortionCoefficient (§17.6)", () => {
  it("returns 0 with no flags", () => {
    expect(computeEvidenceDistortionCoefficient([], 5)).toBe(0);
  });

  it("returns 0 with 0 evidence count", () => {
    expect(computeEvidenceDistortionCoefficient([{ severity: "high" }], 0)).toBe(0);
  });

  it("computes correctly for 1 high flag on 1 item", () => {
    // weight=3, denom=1*3=3, 3/3=1
    expect(computeEvidenceDistortionCoefficient([{ severity: "high" }], 1)).toBe(1);
  });

  it("computes correctly for 2 medium flags on 5 items", () => {
    // weight=2+2=4, denom=5*3=15, 4/15=0.27
    expect(computeEvidenceDistortionCoefficient([{ severity: "medium" }, { severity: "medium" }], 5)).toBe(0.27);
  });

  it("clamps to 1", () => {
    // weight=3+3+3=9, denom=2*3=6, 9/6=1.5 → clamp to 1
    expect(computeEvidenceDistortionCoefficient(
      [{ severity: "high" }, { severity: "high" }, { severity: "high" }], 2
    )).toBe(1);
  });
});

describe("computePmfScore (§17.5)", () => {
  it("computes the worked example: coverage 0.5, signal 0.4, distortion 0.2", () => {
    // base = 0.6*0.5 + 0.4*0.4 = 0.30+0.16 = 0.46
    // pmfScore = 0.46 * 0.8 = 0.37
    expect(computePmfScore(0.5, 0.4, 0.2)).toBe(0.37);
  });

  it("handles null signal gracefully", () => {
    const score = computePmfScore(0.5, null, 0.2);
    // base = 0.6*0.5 + 0 = 0.30, pmf = 0.30 * 0.8 = 0.24
    expect(score).toBe(0.24);
  });

  it("clamps to 1", () => {
    expect(computePmfScore(1, 1, 0)).toBe(1);
  });
});

describe("computeValidationCoverage (§17.4)", () => {
  it("returns 0 with no high-risk hypotheses", () => {
    expect(computeValidationCoverage(0, 0)).toBe(0);
  });

  it("computes ratio correctly", () => {
    expect(computeValidationCoverage(10, 5)).toBe(0.5);
  });
});

describe("resolveReadinessState (§17.5.1)", () => {
  it("blocks at not_ready with invalidated high-risk", () => {
    expect(resolveReadinessState(0.8, 0.5, true)).toBe("not_ready");
  });

  it("blocks at not_ready with zero coverage", () => {
    expect(resolveReadinessState(0.8, 0, false)).toBe("not_ready");
  });

  it("returns scale_ready at 0.8+", () => {
    expect(resolveReadinessState(0.85, 0.6, false)).toBe("scale_ready");
  });

  it("returns strong_signal between 0.6 and 0.79", () => {
    expect(resolveReadinessState(0.65, 0.5, false)).toBe("strong_signal");
  });

  it("returns emerging between 0.3 and 0.59", () => {
    expect(resolveReadinessState(0.45, 0.3, false)).toBe("emerging");
  });

  it("returns not_ready below 0.3", () => {
    expect(resolveReadinessState(0.2, 0.1, false)).toBe("not_ready");
  });
});
