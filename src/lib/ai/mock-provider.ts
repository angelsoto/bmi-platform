/**
 * Mock AI Provider — returns deterministic structured data for dev/test.
 * Implements the AIProvider interface.
 */

import type { AIProvider } from "./provider";
import type {
  ConceptDeconstructionOutput,
  EvidenceQualityReviewOutput,
  PMFReadinessExplanationOutput,
} from "@/lib/bmi/types";

export class MockAIProvider implements AIProvider {
  async deconstruct(idea: string): Promise<ConceptDeconstructionOutput> {
    return {
      summary: `Deconstructed from: "${idea.slice(0, 60)}..."`,
      assumptions: [
        { statement: "Customers experience this pain point daily", category: "customer_pain", riskLevel: "high" },
        { statement: "Target market is large enough to sustain the business", category: "market_demand", riskLevel: "high" },
        { statement: "Customers are willing to pay for this solution", category: "willingness_to_pay", riskLevel: "critical" },
        { statement: "The team can deliver this solution effectively", category: "delivery_capability", riskLevel: "medium" },
        { statement: "The technology required is feasible to build", category: "technical_feasibility", riskLevel: "medium" },
      ],
      hypotheses: [
        {
          title: "Customers feel pain X enough to pay for a solution",
          statement: "Target customers experience the identified pain at least weekly and have tried alternatives",
          type: "desirability",
          survivalCriticality: "critical",
          recommendedFirstTest: "Customer interview series (minimum 10)",
        },
        {
          title: "Market size supports sustainable revenue",
          statement: "At least 10,000 potential customers exist in the target segment",
          type: "viability",
          survivalCriticality: "high",
          recommendedFirstTest: "Market sizing analysis",
        },
        {
          title: "Solution can be built within budget and timeline",
          statement: "The proposed solution requires < 6 months and < $100k to reach MVP",
          type: "feasibility",
          survivalCriticality: "high",
          recommendedFirstTest: "Technical feasibility assessment",
        },
        {
          title: "Customers will pay $X for this solution",
          statement: "At least 20% of interviewed customers express willingness to pay the target price",
          type: "viability",
          survivalCriticality: "critical",
          recommendedFirstTest: "Price testing via landing page",
        },
        {
          title: "Acquisition channels can reach target customers cost-effectively",
          statement: "Customer acquisition cost is under $50 through primary channels",
          type: "feasibility",
          survivalCriticality: "medium",
          recommendedFirstTest: "Channel pilot campaign",
        },
      ],
      suggestedPersona: { name: "Early-stage founder", primaryPain: "Lack of structured validation process" },
      suggestedOffer: { name: "Scientific Validation Engine", valueProposition: "Turn unstructured ideas into tested, evidence-backed business plans" },
      suggestedNextActions: [
        "Review and rank the generated hypotheses",
        "Create your first experiment to test the highest-risk hypothesis",
        "Define a persona and offer based on the suggestions",
      ],
    };
  }

  async clarifyMVV(input: string) {
    return {
      mission: "Empower founders to validate ideas scientifically before scaling",
      vision: "A world where every business decision is evidence-based",
      values: ["Scientific rigor", "Founder empathy", "Evidence over opinion"],
    };
  }

  async generateHypotheses(assumptions: string[]) {
    return [
      {
        title: "Core pain hypothesis",
        statement: assumptions[0] || "Target customers experience this pain frequently",
        type: "desirability" as const,
        survivalCriticality: "critical" as const,
        recommendedFirstTest: "Customer interviews",
      },
    ];
  }

  async rankHypotheses(hypotheses: { id: string; title: string; statement: string; type: string }[]) {
    return hypotheses.map((h, i) => ({
      hypothesisId: h.id,
      survivalCriticality: i < 2 ? "critical" as const : i < 4 ? "high" as const : "medium" as const,
      uncertainty: i < 3 ? "high" as const : "medium" as const,
      rationale: `Assumption ${i + 1} could significantly impact business model viability`,
    }));
  }

  async designExperiment(hypothesis: { title: string; statement: string; type: string }) {
    return {
      name: `Test: ${hypothesis.title.slice(0, 40)}`,
      description: `Landing page experiment to validate: ${hypothesis.statement}`,
      experimentType: "landing_page_test",
      suggestedMetric: "conversion_rate",
      suggestedThreshold: 0.05,
    };
  }

  async reviewEvidence(evidenceText: string, hypothesisContext?: string): Promise<EvidenceQualityReviewOutput> {
    const biasFlags = evidenceText.length < 50
      ? [{ type: "small_sample" as const, severity: "high" as const, explanation: "Evidence text is very short; may lack detail" }]
      : evidenceText.includes("love") || evidenceText.includes("great")
        ? [{ type: "polite_praise" as const, severity: "medium" as const, explanation: "Positive language may indicate courtesy bias rather than genuine enthusiasm" }]
        : evidenceText.includes("maybe") || evidenceText.includes("might")
          ? [{ type: "non_committal_interest" as const, severity: "medium" as const, explanation: "Non-committal language suggests weak intent" }]
          : evidenceText.includes("I think") || evidenceText.includes("I believe")
            ? [{ type: "founder_interpretation" as const, severity: "medium" as const, explanation: "Founder's interpretation may introduce confirmation bias" }]
            : [];

    return {
      adjustedEvidenceStrength: biasFlags.length > 1 ? "weak" : biasFlags.length === 1 ? "moderate" : "strong",
      biasFlags,
      recommendedDisconfirmationTest: biasFlags.length > 0
        ? "Conduct a follow-up with open-ended questions focused on what the customer would lose, not gain"
        : undefined,
      interpretation: biasFlags.length > 0
        ? "This evidence contains potential bias signals. Consider running a disconfirmation test before treating it as strong validation."
        : "No significant bias signals detected. Evidence quality appears reliable.",
    };
  }

  async generateLandingPageCopy(params: { personaName: string; primaryPain: string; offerName: string; valueProposition: string }) {
    const hasClaims = params.valueProposition.toLowerCase().includes("guarantee") || params.valueProposition.toLowerCase().includes("proven");
    return {
      heroHeadline: `Solve ${params.primaryPain} for ${params.personaName}s`,
      heroSubheadline: params.valueProposition,
      problemStatement: `Most ${params.personaName}s struggle with ${params.primaryPain}. Current solutions are either too complex or don't address the root cause.`,
      mechanismDescription: "A structured, step-by-step validation process that turns uncertainty into evidence.",
      proofPoints: [
        "Built on the Scientific Entrepreneurship Cognitive Pathway (SE-CCM)",
        "Digital Devil's Advocate bias detection engine",
        "Evidence-based PMF readiness scoring",
      ],
      faqItems: [
        { question: "How long does validation take?", answer: "Most founders complete the core loop in 4-6 weeks." },
        { question: "What if my hypothesis is wrong?", answer: "Invalidation is valuable data. It prevents wasted resources on untested assumptions." },
      ],
      ctaLabel: "Start Validating",
      governanceFlags: hasClaims
        ? [{ text: params.valueProposition, severity: "medium", issue: "Claim may imply guaranteed results without evidence" }]
        : [],
    };
  }

  async generateOperatingBrief(projectContext: string) {
    return {
      summary: `Project status summary based on ${projectContext.slice(0, 50)}...`,
      topPriority: "Validate the highest-risk hypothesis first",
      nextAction: "Create an experiment to test your critical assumption",
    };
  }

  async synthesizeLearningLoop(outcome: string) {
    return {
      insight: `Key learning from outcome: ${outcome.slice(0, 60)}...`,
      recommendedAction: "Update hypothesis evidence strength based on this result",
      recommendedMeasurement: "Track how the evidence strength affects PMF readiness score",
    };
  }

  async explainPMFReadiness(data: { pmfScore: number; distortion: number; coverage: number; blockingHypotheses: string[] }): Promise<PMFReadinessExplanationOutput> {
    const readinessState: PMFReadinessExplanationOutput["readinessState"] =
      data.pmfScore >= 0.8 ? "scale_ready" :
      data.pmfScore >= 0.6 ? "strong_signal" :
      data.pmfScore >= 0.3 ? "emerging" : "not_ready";

    return {
      readinessState,
      score: data.pmfScore,
      distortion: data.distortion,
      coverage: data.coverage,
      explanation: `PMF score of ${(data.pmfScore * 100).toFixed(0)}% indicates ${readinessState}. Evidence distortion of ${(data.distortion * 100).toFixed(0)}% is suppressing the score.`,
      blockingHypotheses: data.blockingHypotheses,
      evidenceWeaknesses: data.distortion > 0.3 ? ["Evidence quality reviews show bias signals"] : [],
      recommendedNextActions: [
        "Run disconfirmation tests on biased evidence",
        "Validate remaining high-risk hypotheses",
        "Collect customer disappointment survey data",
      ],
    };
  }
}

let _defaultProvider: MockAIProvider | null = null;

export function getMockProvider(): MockAIProvider {
  if (!_defaultProvider) {
    _defaultProvider = new MockAIProvider();
  }
  return _defaultProvider;
}
