import { z } from "zod";
import { businessTypeEnum, projectStageEnum } from "./validate";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  businessType: businessTypeEnum.default("startup"),
  currentStage: projectStageEnum.default("idea"),
  primaryGoal: z.string().max(500).optional(),
});

export const createPersonaSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  primaryPain: z.string().min(1, "Primary pain is required").max(500),
  description: z.string().max(2000).optional(),
  context: z.string().max(2000).optional(),
});

export const createOfferSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  valueProposition: z.string().min(1, "Value proposition is required").max(1000),
  format: z.enum(["service", "product", "subscription", "program", "other"]).default("service"),
  priceModel: z.enum(["one_time", "recurring", "tiered", "free", "undecided"]).optional(),
  priceAmount: z.number().positive().optional(),
});

export const createIntakeSchema = z.object({
  rawInput: z.string().min(10, "Input must be at least 10 characters").max(50000),
  inputType: z.enum(["typed_text", "uploaded_text", "pitch_notes", "interview_transcript"]).default("typed_text"),
});
