import { z } from "zod";
import { hypothesisTypeEnum, riskLevelEnum } from "./validate";

export const createLandingPageSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  personaId: z.string().optional(),
  offerId: z.string().optional(),
  hypothesisId: z.string().optional(),
  journeyStage: z
    .enum(["awareness", "consideration", "decision", "retention"])
    .default("awareness"),
});

export const createLearningLoopSchema = z.object({
  sourceEntityType: z.enum([
    "experiment",
    "evidence",
    "hypothesis",
    "concept_intake",
  ]),
  sourceEntityId: z.string().min(1, "Source entity ID is required"),
  outcomeSummary: z.string().min(1, "Outcome summary is required").max(2000),
  insight: z.string().max(2000).optional(),
  targetEntityType: z.enum([
    "hypothesis",
    "experiment",
    "landing_page",
    "offer",
    "persona",
  ]),
  targetEntityId: z.string().min(1, "Target entity ID is required"),
});

export const closeLearningLoopSchema = z.object({
  actionTaken: z.string().min(1, "Action taken is required").max(2000),
  measurementPlan: z
    .string()
    .min(1, "Measurement plan is required")
    .max(2000),
});

export const upsertMVVSchema = z.object({
  mission: z.string().min(1, "Mission is required").max(2000),
  vision: z.string().min(1, "Vision is required").max(2000),
  values: z.array(z.string().max(200)).optional(),
  founderAssumptions: z.array(z.string().max(2000)).optional(),
  unresolvedTensions: z.array(z.string().max(1000)).optional(),
});

export const createPMFReadinessSchema = z.object({
  customerDisappointmentScore: z.number().min(0).max(1).nullable().optional(),
});

export const createProgressTrackSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z
    .enum(["validation", "sales", "product", "funding", "team"])
    .default("validation"),
  description: z.string().max(2000).optional(),
  health: z
    .enum(["healthy", "at_risk", "blocked", "unknown"])
    .default("unknown"),
  completionScore: z.number().min(0).max(100).optional(),
  currentFocus: z.string().max(1000).optional(),
});

export const createExperimentSurfaceSchema = z.object({
  experimentId: z.string().min(1, "Experiment ID is required"),
  surfaceType: z
    .enum([
      "landing_page",
      "email_sequence",
      "demo",
      "prototype",
      "survey",
      "interview_guide",
    ])
    .default("landing_page"),
  linkedEntityId: z.string().optional(),
});

export const createAnalyticsEventSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  eventName: z.string().min(1, "Event name is required").max(200),
  eventType: z
    .enum(["page_view", "cta_click", "form_submit", "custom"])
    .default("custom"),
  anonymousId: z.string().optional(),
  sessionId: z.string().optional(),
  landingPageId: z.string().optional(),
  ctaId: z.string().optional(),
  experimentId: z.string().optional(),
  variantId: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const acceptIntakeSchema = z.object({
  hypotheses: z
    .array(
      z.object({
        title: z.string().min(1),
        statement: z.string().min(1),
        type: hypothesisTypeEnum.optional(),
        survivalCriticality: riskLevelEnum.optional(),
        recommendedFirstTest: z.string().optional(),
      })
    )
    .optional(),
  acceptPersona: z.boolean().optional(),
  acceptOffer: z.boolean().optional(),
  persona: z
    .object({
      name: z.string().min(1),
      primaryPain: z.string().min(1),
    })
    .optional(),
  offer: z
    .object({
      name: z.string().min(1),
      valueProposition: z.string().min(1),
    })
    .optional(),
});

export const makeExperimentDecisionSchema = z.object({
  endDate: z.string().datetime().optional(),
});

export const deployLandingPageSchema = z.object({});

export const updateOnboardingSchema = z.object({
  completedTour: z.boolean().optional(),
  lastStepIndex: z.number().int().min(0).optional(),
  dismissedAt: z.string().datetime().nullable().optional(),
});
