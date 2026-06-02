import { z } from "zod";

export const PMFReadinessExplanationSchema = z.object({
  readinessState: z.enum(["not_ready", "emerging", "strong_signal", "scale_ready"]),
  score: z.number().min(0).max(1),
  distortion: z.number().min(0).max(1),
  coverage: z.number().min(0).max(1),
  explanation: z.string(),
  blockingHypotheses: z.array(z.string()),
  evidenceWeaknesses: z.array(z.string()),
  recommendedNextActions: z.array(z.string()),
});
