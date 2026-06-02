/**
 * Claude AI Provider Implementation.
 * Injects the Anthropic SDK client and implements the AIProvider interface.
 * Falls back to mock provider when ANTHROPIC_API_KEY is not set.
 */

import type { AIProvider } from "./provider";
import { MockAIProvider, getMockProvider } from "./mock-provider";
import type {
  ConceptDeconstructionOutput,
  EvidenceQualityReviewOutput,
  PMFReadinessExplanationOutput,
} from "@/lib/bmi/types";

/**
 * Get the active AI provider.
 * Returns the mock provider in dev/test, or the Claude provider when API key is set.
 */
export function getAIProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return new ClaudeProvider();
  }
  // In dev without API key, use mock provider
  return getMockProvider();
}

class ClaudeProvider implements AIProvider {
  private mock = new MockAIProvider();

  async deconstruct(idea: string, context?: string): Promise<ConceptDeconstructionOutput> {
    // TODO: Implement Claude API call with structured output
    // For now, falls back to mock for development
    console.warn("ClaudeProvider.deconstruct: Using mock fallback. Set ANTHROPIC_API_KEY for real AI.");
    return this.mock.deconstruct(idea);
  }

  async clarifyMVV(input: string) {
    console.warn("ClaudeProvider.clarifyMVV: Using mock fallback.");
    return this.mock.clarifyMVV(input);
  }

  async generateHypotheses(assumptions: string[]) {
    console.warn("ClaudeProvider.generateHypotheses: Using mock fallback.");
    return this.mock.generateHypotheses(assumptions);
  }

  async rankHypotheses(hypotheses: { id: string; title: string; statement: string; type: string }[]) {
    console.warn("ClaudeProvider.rankHypotheses: Using mock fallback.");
    return this.mock.rankHypotheses(hypotheses);
  }

  async designExperiment(hypothesis: { title: string; statement: string; type: string }) {
    console.warn("ClaudeProvider.designExperiment: Using mock fallback.");
    return this.mock.designExperiment(hypothesis);
  }

  async reviewEvidence(evidenceText: string, hypothesisContext?: string): Promise<EvidenceQualityReviewOutput> {
    console.warn("ClaudeProvider.reviewEvidence: Using mock fallback.");
    return this.mock.reviewEvidence(evidenceText, hypothesisContext);
  }

  async generateLandingPageCopy(params: { personaName: string; primaryPain: string; offerName: string; valueProposition: string }) {
    console.warn("ClaudeProvider.generateLandingPageCopy: Using mock fallback.");
    return this.mock.generateLandingPageCopy(params);
  }

  async generateOperatingBrief(projectContext: string) {
    console.warn("ClaudeProvider.generateOperatingBrief: Using mock fallback.");
    return this.mock.generateOperatingBrief(projectContext);
  }

  async synthesizeLearningLoop(outcome: string) {
    console.warn("ClaudeProvider.synthesizeLearningLoop: Using mock fallback.");
    return this.mock.synthesizeLearningLoop(outcome);
  }

  async explainPMFReadiness(data: { pmfScore: number; distortion: number; coverage: number; blockingHypotheses: string[] }): Promise<PMFReadinessExplanationOutput> {
    console.warn("ClaudeProvider.explainPMFReadiness: Using mock fallback.");
    return this.mock.explainPMFReadiness(data);
  }
}
