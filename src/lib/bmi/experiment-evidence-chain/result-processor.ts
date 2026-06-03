/**
 * Section 11A — The Result-to-Hypothesis Chain
 *
 * This is the heart of the validation loop. When an experiment result is recorded,
 * this processor runs the full chain atomically:
 *
 * 1. Create ExperimentResult
 * 2. Auto-create EvidenceItem (sourceType=experiment_result)
 * 3. Trigger AI quality review → get adjustedEvidenceStrength
 * 4. Write adjusted strength back to EvidenceItem
 * 5. Recompute Hypothesis.evidenceStrength via Section 11A.4 formula
 * 6. Update hypothesis.status if applicable
 * 7. Recalculate PMF readiness
 * 8. Auto-open LearningLoop
 *
 * All steps run in a single Prisma transaction — rollback on any failure.
 */

import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/client";
import {
  computeEvidenceStrength,
  computePmfScore,
  computeEvidenceDistortionCoefficient,
  computeValidationCoverage,
  resolveReadinessState,
} from "@/lib/bmi/formulas";
import type { EvidenceStrength } from "@/lib/bmi/types";

export interface ChainInput {
  experimentId: string;
  projectId: string;
  metricName: string;
  observedValue: number;
  threshold: number;
  metThreshold: boolean;
  decisionRuleOutcome: "supports" | "weakens" | "inconclusive";
  notes?: string;
  userId: string;
}

export interface ChainOutput {
  resultId: string;
  evidenceItemId: string;
  reviewId: string;
  learningLoopId: string;
  hypothesisStrength: string;
  hypothesisStatus: string;
  pmfScore: number | null;
}

export async function runExperimentResultChain(input: ChainInput): Promise<ChainOutput> {
  const ai = getAIProvider();

  return prisma.$transaction(async (tx) => {
    // Step 1: Create ExperimentResult
    const result = await tx.experimentResult.create({
      data: {
        experimentId: input.experimentId,
        projectId: input.projectId,
        metricName: input.metricName,
        observedValue: input.observedValue,
        threshold: input.threshold,
        metThreshold: input.metThreshold,
        decisionRuleOutcome: input.decisionRuleOutcome,
        notes: input.notes,
        createdByUserId: input.userId,
      },
    });

    // Update experiment status
    await tx.experiment.update({
      where: { id: input.experimentId },
      data: { status: "analyzing" },
    });

    // Step 2: Auto-create EvidenceItem
    const evidenceText = `Experiment result: ${input.metricName}=${input.observedValue} (threshold: ${input.threshold}). Outcome: ${input.decisionRuleOutcome}.`;

    const experiment = await tx.experiment.findUnique({
      where: { id: input.experimentId },
      select: { hypothesisId: true },
    });

    const evidenceItem = await tx.evidenceItem.create({
      data: {
        projectId: input.projectId,
        sourceType: "experiment_result",
        sourceEntityId: result.id,
        summary: evidenceText,
        rawText: input.notes || evidenceText,
        relatedHypothesisId: experiment?.hypothesisId,
        relatedExperimentId: input.experimentId,
        evidenceStrength: "weak", // will be updated after quality review
        collectedByUserId: input.userId,
        collectedAt: new Date(),
      },
    });

    // Step 3: AI Quality Review
    const review = await ai.reviewEvidence(evidenceText);

    // Persist quality review
    const qualityReview = await tx.evidenceQualityReview.create({
      data: {
        projectId: input.projectId,
        evidenceItemId: evidenceItem.id,
        sourceEntityType: "experiment_result",
        sourceEntityId: result.id,
        originalEvidenceStrength: evidenceItem.evidenceStrength,
        adjustedEvidenceStrength: review.adjustedEvidenceStrength,
        recommendedDisconfirmationTest: review.recommendedDisconfirmationTest,
      },
    });

    
    // Log AI call
    await tx.aILog.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        functionType: "experiment_result_chain",
        inputSummary: evidenceText.substring(0, 200),
        model: "mock",
        outputEntityType: "evidence_quality_review",
        outputEntityId: qualityReview.id,
      },
    });

    // Create bias flags
    if (review.biasFlags.length > 0) {
      await tx.biasFlag.createMany({
        data: review.biasFlags.map((flag) => ({
          reviewId: qualityReview.id,
          type: flag.type,
          severity: flag.severity,
          explanation: flag.explanation,
        })),
      });
    }

    // Step 4: Write adjusted strength back to EvidenceItem
    await tx.evidenceItem.update({
      where: { id: evidenceItem.id },
      data: { evidenceStrength: review.adjustedEvidenceStrength },
    });

    // Update ExperimentResult with evidence link
    await tx.experimentResult.update({
      where: { id: result.id },
      data: { generatedEvidenceItemId: evidenceItem.id },
    });

    // Step 5: Recompute Hypothesis.evidenceStrength
    let hypothesisStrength = "none";
    if (experiment?.hypothesisId) {
      const allEvidence = await tx.evidenceItem.findMany({
        where: { relatedHypothesisId: experiment.hypothesisId },
        select: { id: true, evidenceStrength: true },
      });

      const strengthInput = allEvidence.map((e) => ({
        id: e.id,
        adjustedEvidenceStrength: e.evidenceStrength as EvidenceStrength,
      }));
      hypothesisStrength = computeEvidenceStrength(strengthInput);

      // Step 6: Update hypothesis status
      let newStatus: string | undefined;
      if (input.decisionRuleOutcome === "supports" && hypothesisStrength === "strong") {
        newStatus = "supported";
      } else if (input.decisionRuleOutcome === "weakens") {
        newStatus = "weakened";
      } else if (hypothesisStrength !== "none") {
        newStatus = "testing";
      }

      if (newStatus) {
        await tx.hypothesis.update({
          where: { id: experiment.hypothesisId },
          data: {
            evidenceStrength: hypothesisStrength,
            status: newStatus,
            currentVersionNumber: { increment: 1 },
          },
        });
      } else {
        await tx.hypothesis.update({
          where: { id: experiment.hypothesisId },
          data: {
            evidenceStrength: hypothesisStrength,
          },
        });
      }
    }

    // Step 7: Recalculate PMF readiness
    const pmf = await recalculatePMFReadiness(tx, input.projectId);

    // Step 8: Auto-open LearningLoop
    const learningLoop = await tx.learningLoop.create({
      data: {
        projectId: input.projectId,
        sourceEntityType: "experiment",
        sourceEntityId: input.experimentId,
        outcomeSummary: evidenceText,
        insight: review.interpretation || `Experiment outcome: ${input.decisionRuleOutcome}`,
        targetEntityType: "hypothesis",
        targetEntityId: experiment?.hypothesisId,
        status: "open",
        ownerUserId: input.userId,
      },
    });

    // Update result with learning loop link
    await tx.experimentResult.update({
      where: { id: result.id },
      data: { generatedLearningLoopId: learningLoop.id },
    });

    return {
      resultId: result.id,
      evidenceItemId: evidenceItem.id,
      reviewId: qualityReview.id,
      learningLoopId: learningLoop.id,
      hypothesisStrength,
      hypothesisStatus: "",
      pmfScore: pmf?.pmfScore ?? null,
    };
  });
}

async function recalculatePMFReadiness(tx: any, projectId: string) {
  // Get all high-risk hypotheses
  const highRiskHyps = await tx.hypothesis.findMany({
    where: {
      projectId,
      riskRanks: {
        some: {
          survivalCriticality: { in: ["high", "critical"] },
        },
      },
    },
    select: { id: true, evidenceStrength: true },
  });

  const totalHighRisk = highRiskHyps.length;
  const validatedHighRisk = highRiskHyps.filter(
    (h: any) => h.evidenceStrength === "moderate" || h.evidenceStrength === "strong"
  ).length;
  const invalidatedHighRisk = highRiskHyps.filter(
    (h: any) => h.evidenceStrength === "none" || h.evidenceStrength === "weak"
  ).length;

  // Get distortion coefficient
  const reviews = await tx.evidenceQualityReview.findMany({
    where: { projectId },
    include: { biasFlags: true },
  });

  const allFlags = reviews.flatMap((r: any) => r.biasFlags);
  const distortion = computeEvidenceDistortionCoefficient(
    allFlags.map((f: any) => ({ severity: f.severity as "low" | "medium" | "high" })),
    reviews.length
  );

  const coverage = computeValidationCoverage(totalHighRisk, validatedHighRisk);

  // Get latest PMF assessment or create new one
  const latestPmf = await tx.pmfReadinessAssessment.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const pmfScore = computePmfScore(
    coverage,
    latestPmf?.customerDisappointmentScore ?? null,
    distortion
  );

  const readinessState = resolveReadinessState(pmfScore, coverage, invalidatedHighRisk > 0);

  const assessment = await tx.pmfReadinessAssessment.create({
    data: {
      projectId,
      totalHighRiskHypotheses: totalHighRisk,
      unvalidatedHighRiskHypotheses: invalidatedHighRisk,
      evidenceDistortionCoefficient: distortion,
      pmfScore,
      readinessState,
      blockingHypothesisIds: JSON.stringify(
        highRiskHyps.filter((h: any) => h.evidenceStrength === "none" || h.evidenceStrength === "weak").map((h: any) => h.id)
      ),
      explanation: `PMF score adjusted based on ${totalHighRisk} high-risk hypotheses and distortion coefficient of ${distortion}.`,
    },
  });

  return assessment;
}
