import Anthropic from "@anthropic-ai/sdk";
import { toJSONSchema } from "zod/v4";
import type { AIProvider } from "../provider";
import { MockAIProvider } from "../mock-provider";
import { ConceptDeconstructionSchema } from "../schemas/concept-deconstruction";
import { EvidenceQualityReviewSchema } from "../schemas/evidence-quality-review";
import { PMFReadinessExplanationSchema } from "../schemas/pmf-readiness";
import { DECONSTRUCT_SYSTEM_PROMPT, buildDeconstructUserPrompt } from "../prompts/deconstruct";
import { REVIEW_EVIDENCE_SYSTEM_PROMPT, buildReviewEvidenceUserPrompt } from "../prompts/review-evidence";
import type {
  ConceptDeconstructionOutput,
  EvidenceQualityReviewOutput,
  PMFReadinessExplanationOutput,
} from "@/lib/bmi/types";

const MODEL = "claude-sonnet-4-5-20250514";
const MAX_TOKENS = 4096;

interface AIResult {
  output: unknown;
  tokenUsage: { input: number; output: number };
  latency: number;
  model: string;
}

async function callClaude(params: {
  apiKey: string;
  system: string;
  userMessage: string;
  toolName: string;
  jsonSchema: Record<string, unknown>;
}): Promise<AIResult> {
  const client = new Anthropic({ apiKey: params.apiKey });
  const startedAt = Date.now();

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.3,
    system: params.system,
    messages: [{ role: "user", content: params.userMessage }],
    tools: [
      {
        name: params.toolName,
        description: `Structured output for ${params.toolName}`,
        input_schema: params.jsonSchema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: params.toolName },
  });

  const latency = Date.now() - startedAt;

  const toolBlock = msg.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return structured output");
  }

  return {
    output: toolBlock.input,
    tokenUsage: {
      input: msg.usage.input_tokens,
      output: msg.usage.output_tokens,
    },
    latency,
    model: MODEL,
  };
}

export function createClaudeProvider(apiKey: string): AIProvider & { getLastResult: () => AIResult | null } {
  const mock = new MockAIProvider();
  let lastResult: AIResult | null = null;

  return {
    getLastResult: () => lastResult,

    async deconstruct(idea: string, context?: string): Promise<ConceptDeconstructionOutput> {
      try {
        const result = await callClaude({
          apiKey,
          system: DECONSTRUCT_SYSTEM_PROMPT,
          userMessage: buildDeconstructUserPrompt(idea, context),
          toolName: "deconstruct",
          jsonSchema: toJSONSchema(ConceptDeconstructionSchema) as Record<string, unknown>,
        });
        lastResult = result;
        return result.output as ConceptDeconstructionOutput;
      } catch (error) {
        console.warn("ClaudeProvider.deconstruct: API call failed, falling back to mock:", (error as Error).message);
        return mock.deconstruct(idea);
      }
    },

    async reviewEvidence(evidenceText: string, hypothesisContext?: string): Promise<EvidenceQualityReviewOutput> {
      try {
        const result = await callClaude({
          apiKey,
          system: REVIEW_EVIDENCE_SYSTEM_PROMPT,
          userMessage: buildReviewEvidenceUserPrompt(evidenceText, hypothesisContext),
          toolName: "review_evidence",
          jsonSchema: toJSONSchema(EvidenceQualityReviewSchema) as Record<string, unknown>,
        });
        lastResult = result;
        return result.output as EvidenceQualityReviewOutput;
      } catch (error) {
        console.warn("ClaudeProvider.reviewEvidence: API call failed, falling back to mock:", (error as Error).message);
        return mock.reviewEvidence(evidenceText, hypothesisContext);
      }
    },

    async clarifyMVV(input: string) {
      console.warn("ClaudeProvider.clarifyMVV: Not yet wired to real Claude. Using mock.");
      return mock.clarifyMVV(input);
    },

    async generateHypotheses(assumptions: string[]) {
      console.warn("ClaudeProvider.generateHypotheses: Not yet wired to real Claude. Using mock.");
      return mock.generateHypotheses(assumptions);
    },

    async rankHypotheses(hypotheses: { id: string; title: string; statement: string; type: string }[]) {
      console.warn("ClaudeProvider.rankHypotheses: Not yet wired to real Claude. Using mock.");
      return mock.rankHypotheses(hypotheses);
    },

    async designExperiment(hypothesis: { title: string; statement: string; type: string }) {
      console.warn("ClaudeProvider.designExperiment: Not yet wired to real Claude. Using mock.");
      return mock.designExperiment(hypothesis);
    },

    async generateLandingPageCopy(params: { personaName: string; primaryPain: string; offerName: string; valueProposition: string }) {
      console.warn("ClaudeProvider.generateLandingPageCopy: Not yet wired to real Claude. Using mock.");
      return mock.generateLandingPageCopy(params);
    },

    async generateOperatingBrief(projectContext: string) {
      console.warn("ClaudeProvider.generateOperatingBrief: Not yet wired to real Claude. Using mock.");
      return mock.generateOperatingBrief(projectContext);
    },

    async synthesizeLearningLoop(outcome: string) {
      console.warn("ClaudeProvider.synthesizeLearningLoop: Not yet wired to real Claude. Using mock.");
      return mock.synthesizeLearningLoop(outcome);
    },

    async explainPMFReadiness(data: { pmfScore: number; distortion: number; coverage: number; blockingHypotheses: string[] }): Promise<PMFReadinessExplanationOutput> {
      try {
        const result = await callClaude({
          apiKey,
          system: "You are a BMI Platform PMF readiness analyst. Explain the product-market fit assessment.",
          userMessage: `Analyze this PMF data:\n- PMF Score: ${data.pmfScore}\n- Distortion: ${data.distortion}\n- Coverage: ${data.coverage}\n- Blocking Hypotheses: ${data.blockingHypotheses.join(", ") || "none"}`,
          toolName: "explain_pmf_readiness",
          jsonSchema: toJSONSchema(PMFReadinessExplanationSchema) as Record<string, unknown>,
        });
        lastResult = result;
        return result.output as PMFReadinessExplanationOutput;
      } catch (error) {
        console.warn("ClaudeProvider.explainPMFReadiness: API call failed, falling back to mock:", (error as Error).message);
        return mock.explainPMFReadiness(data);
      }
    },
  };
}
