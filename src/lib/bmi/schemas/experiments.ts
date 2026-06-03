import { z } from "zod";
import { experimentTypeEnum, experimentStatusEnum, decisionRuleOutcomeEnum } from "./validate";

export const createExperimentSchema = z.object({
  hypothesisId: z.string().min(1, "Hypothesis ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  experimentType: experimentTypeEnum.default("manual_validation"),
  ownerUserId: z.string().optional(),
});

export const updateExperimentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: experimentStatusEnum.optional(),
  experimentType: experimentTypeEnum.optional(),
});

export const recordResultSchema = z.object({
  metricName: z.string().min(1, "Metric name is required"),
  observedValue: z.number("Observed value must be a number"),
  threshold: z.number("Threshold must be a number"),
  metThreshold: z.boolean().optional(),
  decisionRuleOutcome: decisionRuleOutcomeEnum.optional(),
  notes: z.string().max(2000).optional(),
});

export const startExperimentSchema = z.object({});
