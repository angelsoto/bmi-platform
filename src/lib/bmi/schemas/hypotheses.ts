import { z } from "zod";
import { hypothesisTypeEnum, hypothesisStatusEnum, confidenceEnum, riskLevelEnum } from "./validate";

export const createHypothesisSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  statement: z.string().min(1, "Statement is required").max(2000),
  type: hypothesisTypeEnum.default("desirability"),
  confidence: confidenceEnum.default("medium"),
  status: hypothesisStatusEnum.default("draft"),
  relatedPersonaId: z.string().optional(),
  relatedOfferId: z.string().optional(),
});

export const updateHypothesisSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  statement: z.string().min(1).max(2000).optional(),
  type: hypothesisTypeEnum.optional(),
  confidence: confidenceEnum.optional(),
  status: hypothesisStatusEnum.optional(),
  evidenceStrength: z.string().optional(),
  changedReason: z.string().max(500).default("Updated"),
});

export const rankHypothesisSchema = z.object({
  survivalCriticality: riskLevelEnum,
  uncertainty: z.enum(["low", "medium", "high"]),
  rationale: z.string().max(1000).default(""),
});
