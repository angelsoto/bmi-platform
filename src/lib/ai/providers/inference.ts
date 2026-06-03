/**
 * Generic Inference Provider — zero-dependency fetch-based adapter.
 * Works with any OpenAI-compatible Chat Completions API endpoint.
 *
 * Configure via env:
 *   INFERENCE_API_KEY            — required for hosted providers
 *   INFERENCE_BASE_URL           — defaults to https://api.openai.com/v1
 *   INFERENCE_MODEL              — defaults to gpt-4o
 *   INFERENCE_STRUCTURED_OUTPUT  — "response_format" | "tool_use" | "json_parse" (auto-detects)
 */

import { z } from "zod/v4";
import { toJSONSchema } from "zod/v4";
import type { AIProvider } from "../provider";
import { MockAIProvider } from "../mock-provider";
import { ConceptDeconstructionSchema } from "../schemas/concept-deconstruction";
import { EvidenceQualityReviewSchema } from "../schemas/evidence-quality-review";
import { PMFReadinessExplanationSchema } from "../schemas/pmf-readiness";
import { DECONSTRUCT_SYSTEM_PROMPT, buildDeconstructUserPrompt } from "../prompts/deconstruct";
import { REVIEW_EVIDENCE_SYSTEM_PROMPT, buildReviewEvidenceUserPrompt } from "../prompts/review-evidence";
import { CLARIFY_MVV_SYSTEM_PROMPT, buildClarifyMVVUserPrompt } from "../prompts/clarify-mvv";
import { GENERATE_HYPOTHESES_SYSTEM_PROMPT, buildGenerateHypothesesUserPrompt } from "../prompts/generate-hypotheses";
import { RANK_HYPOTHESES_SYSTEM_PROMPT, buildRankHypothesesUserPrompt } from "../prompts/rank-hypotheses";
import { DESIGN_EXPERIMENT_SYSTEM_PROMPT, buildDesignExperimentUserPrompt } from "../prompts/design-experiment";
import { LANDING_PAGE_COPY_SYSTEM_PROMPT, buildLandingPageCopyUserPrompt } from "../prompts/landing-page-copy";
import { OPERATING_BRIEF_SYSTEM_PROMPT, buildOperatingBriefUserPrompt } from "../prompts/operating-brief";
import { SYNTHESIZE_LOOP_SYSTEM_PROMPT, buildSynthesizeLoopUserPrompt } from "../prompts/synthesize-loop";
import type {
  ConceptDeconstructionOutput,
  EvidenceQualityReviewOutput,
  PMFReadinessExplanationOutput,
} from "@/lib/bmi/types";

// ─── Inline schemas for methods without dedicated schema files ───

const clarifyMVVOutputSchema = z.object({
  mission: z.string(),
  vision: z.string(),
  values: z.array(z.string()),
});

const rankHypothesesOutputSchema = z.array(z.object({
  hypothesisId: z.string(),
  survivalCriticality: z.enum(["low", "medium", "high", "critical"]),
  uncertainty: z.enum(["low", "medium", "high"]),
  rationale: z.string(),
}));

const designExperimentOutputSchema = z.object({
  name: z.string(),
  description: z.string(),
  experimentType: z.string(),
  suggestedMetric: z.string(),
  suggestedThreshold: z.number(),
});

const landingPageCopyOutputSchema = z.object({
  heroHeadline: z.string(),
  heroSubheadline: z.string(),
  problemStatement: z.string(),
  mechanismDescription: z.string(),
  proofPoints: z.array(z.string()),
  faqItems: z.array(z.object({ question: z.string(), answer: z.string() })),
  ctaLabel: z.string(),
  governanceFlags: z.array(z.object({ text: z.string(), severity: z.string(), issue: z.string() })),
});

const generateHypothesesOutputSchema = z.array(z.object({
  title: z.string(),
  statement: z.string(),
  type: z.enum(["desirability", "viability", "feasibility"]),
  survivalCriticality: z.enum(["low", "medium", "high", "critical"]),
  recommendedFirstTest: z.string(),
}));

const operatingBriefOutputSchema = z.object({
  summary: z.string(),
  topPriority: z.string(),
  nextAction: z.string(),
});

const learningLoopOutputSchema = z.object({
  insight: z.string(),
  recommendedAction: z.string(),
  recommendedMeasurement: z.string(),
});

// ─── Inference engine ───

type StructuredOutputMode = "response_format" | "tool_use" | "json_parse";

export interface AIResult {
  output: unknown;
  tokenUsage: { input: number; output: number };
  latency: number;
  model: string;
}

interface InferenceParams {
  system: string;
  userMessage: string;
  toolName: string;
  jsonSchema: Record<string, unknown>;
}

function getConfig() {
  return {
    baseUrl: (process.env.INFERENCE_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    apiKey: process.env.INFERENCE_API_KEY || process.env.ANTHROPIC_API_KEY || "",
    model: process.env.INFERENCE_MODEL || "gpt-4o",
    outputMode: (process.env.INFERENCE_STRUCTURED_OUTPUT || "response_format") as StructuredOutputMode,
  };
}

async function callInference(params: InferenceParams): Promise<AIResult> {
  const config = getConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const startedAt = Date.now();

  // Tier 1: Try the configured structured output mode
  try {
    let response: unknown;
    switch (config.outputMode) {
      case "response_format":
        response = await tryResponseFormat(config, headers, params);
        break;
      case "tool_use":
        response = await tryToolUse(config, headers, params);
        break;
      case "json_parse":
      default:
        response = await tryJsonParse(config, headers, params);
        break;
    }
    return {
      output: response,
      tokenUsage: extractUsage(response),
      latency: Date.now() - startedAt,
      model: config.model,
    };
  } catch (error) {
    // Tier 2: If response_format failed, try tool_use
    if (config.outputMode === "response_format") {
      try {
        const response = await tryToolUse(config, headers, params);
        return {
          output: response,
          tokenUsage: extractUsage(response),
          latency: Date.now() - startedAt,
          model: config.model,
        };
      } catch {
        // Fall through to json_parse
      }
    }
    // Tier 3: Ultimate fallback — plain JSON
    try {
      const response = await tryJsonParse(config, headers, params);
      return {
        output: response,
        tokenUsage: extractUsage(response),
        latency: Date.now() - startedAt,
        model: config.model,
      };
    } catch (innerError) {
      throw new Error(
        `Inference failed: ${(error as Error).message}. Json parse fallback: ${(innerError as Error).message}`
      );
    }
  }
}

async function tryResponseFormat(
  config: ReturnType<typeof getConfig>,
  headers: Record<string, string>,
  params: InferenceParams
): Promise<unknown> {
  const body = {
    model: config.model,
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: params.toolName,
        strict: true,
        schema: params.jsonSchema,
      },
    },
  };

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response");
  return JSON.parse(content);
}

async function tryToolUse(
  config: ReturnType<typeof getConfig>,
  headers: Record<string, string>,
  params: InferenceParams
): Promise<unknown> {
  const body = {
    model: config.model,
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.userMessage },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: params.toolName,
          description: `Structured output for ${params.toolName}`,
          parameters: params.jsonSchema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: params.toolName } },
  };

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No tool call in response");
  return JSON.parse(toolCall.function.arguments);
}

async function tryJsonParse(
  config: ReturnType<typeof getConfig>,
  headers: Record<string, string>,
  params: InferenceParams
): Promise<unknown> {
  const schemaStr = JSON.stringify(params.jsonSchema, null, 2);
  const body = {
    model: config.model,
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: "system", content: `${params.system}\n\nIMPORTANT: Respond with valid JSON only. The JSON must match this schema:\n${schemaStr}` },
      { role: "user", content: `${params.userMessage}\n\nReturn ONLY valid JSON matching the specified schema. No markdown, no explanation — just the JSON object.` },
    ],
  };

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().then((t) => t.slice(0, 200))}`);
  }

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response");

  // Strip markdown code fences if present
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  return JSON.parse(content);
}

function extractUsage(response: unknown): { input: number; output: number } {
  // Minimal stub — full token extraction would require passing raw response
  return { input: 0, output: 0 };
}

// ─── Provider factory ───

export function createInferenceProvider(): AIProvider & { getLastResult: () => AIResult | null } {
  const mock = new MockAIProvider();
  let lastResult: AIResult | null = null;

  async function safeCall<TOutput>(
    params: InferenceParams,
    mockFn: () => Promise<TOutput>
  ): Promise<TOutput> {
    try {
      const result = await callInference(params);
      lastResult = result;
      return result.output as TOutput;
    } catch (error) {
      console.warn(
        `InferenceProvider.${params.toolName}: API call failed, falling back to mock:`,
        (error as Error).message
      );
      return mockFn();
    }
  }

  const schemaCache = new Map<z.ZodType, Record<string, unknown>>();

  function getSchema(zodSchema: z.ZodType): Record<string, unknown> {
    if (!schemaCache.has(zodSchema)) {
      schemaCache.set(zodSchema, toJSONSchema(zodSchema) as Record<string, unknown>);
    }
    return schemaCache.get(zodSchema)!;
  }

  return {
    getLastResult: () => lastResult,

    async deconstruct(idea: string): Promise<ConceptDeconstructionOutput> {
      return safeCall(
        {
          system: DECONSTRUCT_SYSTEM_PROMPT,
          userMessage: buildDeconstructUserPrompt(idea),
          toolName: "deconstruct",
          jsonSchema: getSchema(ConceptDeconstructionSchema),
        },
        () => mock.deconstruct(idea)
      );
    },

    async reviewEvidence(
      evidenceText: string,
      hypothesisContext?: string
    ): Promise<EvidenceQualityReviewOutput> {
      return safeCall(
        {
          system: REVIEW_EVIDENCE_SYSTEM_PROMPT,
          userMessage: buildReviewEvidenceUserPrompt(evidenceText, hypothesisContext),
          toolName: "review_evidence",
          jsonSchema: getSchema(EvidenceQualityReviewSchema),
        },
        () => mock.reviewEvidence(evidenceText, hypothesisContext)
      );
    },

    async clarifyMVV(input: string) {
      return safeCall(
        {
          system: CLARIFY_MVV_SYSTEM_PROMPT,
          userMessage: buildClarifyMVVUserPrompt(input),
          toolName: "clarify_mvv",
          jsonSchema: getSchema(clarifyMVVOutputSchema),
        },
        () => mock.clarifyMVV(input)
      );
    },

    async generateHypotheses(assumptions: string[]) {
      return safeCall(
        {
          system: GENERATE_HYPOTHESES_SYSTEM_PROMPT,
          userMessage: buildGenerateHypothesesUserPrompt(assumptions),
          toolName: "generate_hypotheses",
          jsonSchema: getSchema(generateHypothesesOutputSchema),
        },
        () => mock.generateHypotheses(assumptions)
      );
    },

    async rankHypotheses(
      hypotheses: { id: string; title: string; statement: string; type: string }[]
    ) {
      return safeCall(
        {
          system: RANK_HYPOTHESES_SYSTEM_PROMPT,
          userMessage: buildRankHypothesesUserPrompt(hypotheses),
          toolName: "rank_hypotheses",
          jsonSchema: getSchema(rankHypothesesOutputSchema),
        },
        () => mock.rankHypotheses(hypotheses)
      );
    },

    async designExperiment(hypothesis: { title: string; statement: string; type: string }) {
      return safeCall(
        {
          system: DESIGN_EXPERIMENT_SYSTEM_PROMPT,
          userMessage: buildDesignExperimentUserPrompt(hypothesis),
          toolName: "design_experiment",
          jsonSchema: getSchema(designExperimentOutputSchema),
        },
        () => mock.designExperiment(hypothesis)
      );
    },

    async generateLandingPageCopy(params: {
      personaName: string;
      primaryPain: string;
      offerName: string;
      valueProposition: string;
    }) {
      return safeCall(
        {
          system: LANDING_PAGE_COPY_SYSTEM_PROMPT,
          userMessage: buildLandingPageCopyUserPrompt(params),
          toolName: "generate_landing_page_copy",
          jsonSchema: getSchema(landingPageCopyOutputSchema),
        },
        () => mock.generateLandingPageCopy(params)
      );
    },

    async generateOperatingBrief(projectContext: string) {
      return safeCall(
        {
          system: OPERATING_BRIEF_SYSTEM_PROMPT,
          userMessage: buildOperatingBriefUserPrompt(projectContext),
          toolName: "generate_operating_brief",
          jsonSchema: getSchema(operatingBriefOutputSchema),
        },
        () => mock.generateOperatingBrief(projectContext)
      );
    },

    async synthesizeLearningLoop(outcome: string) {
      return safeCall(
        {
          system: SYNTHESIZE_LOOP_SYSTEM_PROMPT,
          userMessage: buildSynthesizeLoopUserPrompt(outcome),
          toolName: "synthesize_learning_loop",
          jsonSchema: getSchema(learningLoopOutputSchema),
        },
        () => mock.synthesizeLearningLoop(outcome)
      );
    },

    async explainPMFReadiness(data: {
      pmfScore: number;
      distortion: number;
      coverage: number;
      blockingHypotheses: string[];
    }): Promise<PMFReadinessExplanationOutput> {
      return safeCall(
        {
          system:
            "You are a BMI Platform PMF readiness analyst. Explain the product-market fit assessment honestly and concretely.",
          userMessage: `Analyze this PMF data:\n- PMF Score: ${data.pmfScore}\n- Distortion: ${data.distortion}\n- Coverage: ${data.coverage}\n- Blocking Hypotheses: ${data.blockingHypotheses.join(", ") || "none"}`,
          toolName: "explain_pmf_readiness",
          jsonSchema: getSchema(PMFReadinessExplanationSchema),
        },
        () => mock.explainPMFReadiness(data)
      );
    },
  };
}
