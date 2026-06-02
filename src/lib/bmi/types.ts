/**
 * BMI Platform — Shared TypeScript Types
 *
 * Mirrors the Prisma enums and key interfaces from the v1.2 spec.
 */

// ─── Section 5A: Shared Enums ──────────────────────────────────────

export type EvidenceStrength = "weak" | "moderate" | "strong";
export type HypothesisEvidenceStrength = "none" | "weak" | "moderate" | "strong";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";
export type Severity = "low" | "medium" | "high";

// ─── Project ───────────────────────────────────────────────────────

export type BusinessType =
  | "expert_service" | "startup" | "clinic" | "coaching" | "consulting"
  | "education" | "venture_studio_project" | "university_project" | "other";

export type ProjectStage =
  | "idea" | "validating" | "selling" | "scaling" | "optimizing";

// ─── Hypothesis ────────────────────────────────────────────────────

export type HypothesisType = "desirability" | "viability" | "feasibility";

export type HypothesisStatus =
  | "draft" | "active" | "testing"
  | "supported" | "weakened" | "invalidated" | "archived";

// ─── Experiment ────────────────────────────────────────────────────

export type ExperimentStatus =
  | "proposed" | "designed" | "ready" | "running"
  | "analyzing" | "decision_made" | "applied" | "stopped";

export type DecisionRuleOutcome = "supports" | "weakens" | "inconclusive";

// ─── PMF ──────────────────────────────────────────────────────────

export type ReadinessState =
  | "not_ready" | "emerging" | "strong_signal" | "scale_ready";

// ─── AI Output Contracts (Section 21.3–21.5) ───────────────────────

export interface ConceptDeconstructionOutput {
  summary: string;
  assumptions: {
    statement: string;
    category: string;
    riskLevel: RiskLevel;
  }[];
  hypotheses: {
    title: string;
    statement: string;
    type: HypothesisType;
    survivalCriticality: RiskLevel;
    recommendedFirstTest: string;
  }[];
  suggestedPersona?: { name: string; primaryPain: string };
  suggestedOffer?: { name: string; valueProposition: string };
  suggestedNextActions: string[];
}

export interface EvidenceQualityReviewOutput {
  adjustedEvidenceStrength: EvidenceStrength;
  biasFlags: {
    type: string;
    severity: Severity;
    explanation: string;
  }[];
  recommendedDisconfirmationTest?: string;
  interpretation: string;
}

export interface PMFReadinessExplanationOutput {
  readinessState: ReadinessState;
  score: number;
  distortion: number;
  coverage: number;
  explanation: string;
  blockingHypotheses: string[];
  evidenceWeaknesses: string[];
  recommendedNextActions: string[];
}
