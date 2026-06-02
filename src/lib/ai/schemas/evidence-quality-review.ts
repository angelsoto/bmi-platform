import { z } from "zod";

export const EvidenceQualityReviewSchema = z.object({
  adjustedEvidenceStrength: z.enum(["weak", "moderate", "strong"]),
  biasFlags: z.array(z.object({
    type: z.enum([
      "leading_question", "polite_praise", "non_committal_interest",
      "small_sample", "cherry_picked_signal", "founder_interpretation",
      "confirmation_bias", "sunk_cost_language", "vanity_metric",
    ]),
    severity: z.enum(["low", "medium", "high"]),
    explanation: z.string(),
  })),
  recommendedDisconfirmationTest: z.string().optional(),
  interpretation: z.string(),
});
