import { z } from "zod";

export const createEvidenceSchema = z.object({
  sourceType: z.enum(["interview", "survey", "analytics", "experiment_result", "manual_note", "sales_call", "customer_message"]).default("manual_note"),
  summary: z.string().min(1, "Summary is required").max(1000),
  rawText: z.string().max(10000).optional(),
  relatedHypothesisId: z.string().optional(),
  relatedExperimentId: z.string().optional(),
});
