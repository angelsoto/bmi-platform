/**
 * AI Provider Interface — Provider-agnostic adapter.
 * All BMI AI chains use this interface; the provider is injected at runtime.
 */

import type {
  ConceptDeconstructionOutput,
  EvidenceQualityReviewOutput,
  PMFReadinessExplanationOutput,
} from "@/lib/bmi/types";

export interface AIProvider {
  deconstruct(idea: string, context?: string): Promise<ConceptDeconstructionOutput>;
  clarifyMVV(input: string): Promise<{ mission: string; vision: string; values: string[] }>;
  generateHypotheses(assumptions: string[]): Promise<ConceptDeconstructionOutput["hypotheses"]>;
  rankHypotheses(
    hypotheses: { id: string; title: string; statement: string; type: string }[]
  ): Promise<{ hypothesisId: string; survivalCriticality: string; uncertainty: string; rationale: string }[]>;
  designExperiment(hypothesis: { title: string; statement: string; type: string }): Promise<{
    name: string;
    description: string;
    experimentType: string;
    suggestedMetric: string;
    suggestedThreshold: number;
  }>;
  reviewEvidence(
    evidenceText: string,
    hypothesisContext?: string
  ): Promise<EvidenceQualityReviewOutput>;
  generateLandingPageCopy(params: {
    personaName: string;
    primaryPain: string;
    offerName: string;
    valueProposition: string;
  }): Promise<{
    heroHeadline: string;
    heroSubheadline: string;
    problemStatement: string;
    mechanismDescription: string;
    proofPoints: string[];
    faqItems: { question: string; answer: string }[];
    ctaLabel: string;
    governanceFlags: { text: string; severity: string; issue: string }[];
  }>;
  generateOperatingBrief(projectContext: string): Promise<{
    summary: string;
    topPriority: string;
    nextAction: string;
  }>;
  synthesizeLearningLoop(outcome: string): Promise<{
    insight: string;
    recommendedAction: string;
    recommendedMeasurement: string;
  }>;
  explainPMFReadiness(data: {
    pmfScore: number;
    distortion: number;
    coverage: number;
    blockingHypotheses: string[];
  }): Promise<PMFReadinessExplanationOutput>;
}
