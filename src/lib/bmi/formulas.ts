/**
 * BMI Platform — Core Formulas
 *
 * All formulas defined in the v1.2 spec, with NaN/div-by-zero guards.
 * These are pure functions. They do not touch the database.
 */

import type { EvidenceStrength, HypothesisEvidenceStrength, RiskLevel } from "./types";

// ─── Section 6.6: validationPriorityScore ──────────────────────────
// "Test what could kill the business and what we are least sure about, first."

const CRITICALITY_WEIGHT: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const UNCERTAINTY_WEIGHT: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function computeValidationPriorityScore(
  survivalCriticality: RiskLevel,
  uncertainty: "low" | "medium" | "high"
): number {
  const cw = CRITICALITY_WEIGHT[survivalCriticality] ?? 1;
  const uw = UNCERTAINTY_WEIGHT[uncertainty] ?? 1;
  const raw = cw * uw; // range 1..12
  return Math.round((raw / 12) * 100); // normalized 0..100
}

// ─── Section 11A.4: Hypothesis Evidence Strength Derivation ────────
// Maps adjusted evidence strength to points, averages, buckets.
// Sample-size guard: "strong" requires >= 3 independent items.

export interface EvidenceStrengthInput {
  adjustedEvidenceStrength: EvidenceStrength;
  id: string; // used for dedup counting
}

const STRENGTH_POINTS: Record<EvidenceStrength, number> = {
  weak: 1,
  moderate: 2,
  strong: 3,
};

export function computeEvidenceStrength(
  evidenceItems: EvidenceStrengthInput[]
): HypothesisEvidenceStrength {
  const count = evidenceItems.length;
  if (count === 0) return "none";

  const sum = evidenceItems.reduce((acc, item) => {
    return acc + (STRENGTH_POINTS[item.adjustedEvidenceStrength] ?? 0);
  }, 0);

  const avg = sum / count;

  let strength: HypothesisEvidenceStrength;
  if (avg < 1.5) {
    strength = "weak";
  } else if (avg < 2.5) {
    strength = "moderate";
  } else {
    // Sample-size guard: need at least 3 items for "strong"
    strength = count >= 3 ? "strong" : "moderate";
  }

  return strength;
}

// ─── Section 17.6: evidenceDistortionCoefficient ───────────────────
// Measures bias contamination on a 0..1 scale.

const SEVERITY_WEIGHT: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function computeEvidenceDistortionCoefficient(
  biasFlags: { severity: "low" | "medium" | "high" }[],
  evidenceCount: number
): number {
  if (evidenceCount === 0) return 0;
  if (biasFlags.length === 0) return 0;

  const flagWeightSum = biasFlags.reduce((acc, flag) => {
    return acc + (SEVERITY_WEIGHT[flag.severity] ?? 0);
  }, 0);

  const rawDistortion = flagWeightSum / (evidenceCount * 3);
  return Math.min(1, Math.round(rawDistortion * 100) / 100);
}

// ─── Section 17.4: Aggregation Utilities ──────────────────────────

export function computeValidationCoverage(
  totalHighRisk: number,
  validatedHighRisk: number
): number {
  if (totalHighRisk === 0) return 0;
  return Math.min(1, validatedHighRisk / totalHighRisk);
}

// ─── Section 17.5: pmfScore ────────────────────────────────────────
// base = 0.6 * coverage + 0.4 * signal
// pmfScore = base * (1 - distortion)

export function computePmfScore(
  coverage: number,
  customerDisappointmentScore: number | null | undefined,
  distortion: number
): number {
  const c = clamp01(coverage);
  const s = clamp01(customerDisappointmentScore ?? 0);
  const d = clamp01(distortion);

  const base = 0.6 * c + 0.4 * s;
  const score = base * (1 - d);

  return clamp01(Math.round(score * 100) / 100);
}

// ─── Section 17.5.1: Readiness State Thresholds ───────────────────

export type ReadinessState = "not_ready" | "emerging" | "strong_signal" | "scale_ready";

export function resolveReadinessState(
  pmfScore: number,
  validationCoverage: number,
  hasInvalidatedHighRisk: boolean
): ReadinessState {
  const score = clamp01(pmfScore);

  // Hard rules
  if (hasInvalidatedHighRisk || validationCoverage === 0) {
    return "not_ready";
  }

  if (score >= 0.8) return "scale_ready";
  if (score >= 0.6) return "strong_signal";
  if (score >= 0.3) return "emerging";
  return "not_ready";
}

// ─── Helpers ───────────────────────────────────────────────────────

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
