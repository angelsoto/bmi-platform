import { z } from "zod";

export const ConceptDeconstructionSchema = z.object({
  summary: z.string(),
  assumptions: z.array(z.object({
    statement: z.string(),
    category: z.enum([
      "customer_pain", "market_demand", "willingness_to_pay",
      "delivery_capability", "technical_feasibility", "regulatory_constraint",
      "acquisition_channel", "retention", "unit_economics",
    ]),
    riskLevel: z.enum(["low", "medium", "high", "critical"]),
  })),
  hypotheses: z.array(z.object({
    title: z.string(),
    statement: z.string(),
    type: z.enum(["desirability", "viability", "feasibility"]),
    survivalCriticality: z.enum(["low", "medium", "high", "critical"]),
    recommendedFirstTest: z.string(),
  })),
  suggestedPersona: z.object({
    name: z.string(),
    primaryPain: z.string(),
  }).optional(),
  suggestedOffer: z.object({
    name: z.string(),
    valueProposition: z.string(),
  }).optional(),
  suggestedNextActions: z.array(z.string()),
});
