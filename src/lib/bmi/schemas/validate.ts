import { z } from "zod";

/**
 * Validate an API request body against a Zod schema.
 * Returns either validated data or a user-friendly error string.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data?: T; error?: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  return { data: result.data };
}

// ─── Shared enums matching Section 5A ──────────────────────────────

export const riskLevelEnum = z.enum(["low", "medium", "high", "critical"]);
export const evidenceStrengthEnum = z.enum(["weak", "moderate", "strong"]);
export const hypothesisEvidenceStrengthEnum = z.enum(["none", "weak", "moderate", "strong"]);
export const confidenceEnum = z.enum(["low", "medium", "high"]);
export const severityEnum = z.enum(["low", "medium", "high"]);
export const hypothesisTypeEnum = z.enum(["desirability", "viability", "feasibility"]);
export const hypothesisStatusEnum = z.enum(["draft", "active", "testing", "supported", "weakened", "invalidated", "archived"]);
export const experimentStatusEnum = z.enum(["proposed", "designed", "ready", "running", "analyzing", "decision_made", "applied", "stopped"]);
export const decisionRuleOutcomeEnum = z.enum(["supports", "weakens", "inconclusive"]);
export const experimentTypeEnum = z.enum(["landing_page_test", "message_test", "cta_test", "quiz_test", "interview_test", "survey_test", "manual_validation"]);
export const businessTypeEnum = z.enum(["expert_service", "startup", "clinic", "coaching", "consulting", "education", "venture_studio_project", "university_project", "other"]);
export const projectStageEnum = z.enum(["idea", "validating", "selling", "scaling", "optimizing"]);
