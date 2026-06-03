/**
 * AI Provider Factory.
 * Returns a real inference provider when INFERENCE_API_KEY is set,
 * otherwise falls back to the deterministic mock provider for dev/demo.
 *
 * Backward compat: if ANTHROPIC_API_KEY is set but INFERENCE_API_KEY is not,
 * it auto-migrates to the new env vars (Anthropic compat endpoint).
 */

import type { AIProvider } from "./provider";
import { getMockProvider } from "./mock-provider";
import { createInferenceProvider } from "./providers/inference";

let _provider: AIProvider | null = null;
let _providerWithResult: (AIProvider & { getLastResult: () => { output: unknown; tokenUsage: { input: number; output: number }; latency: number; model: string } | null }) | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  // Auto-migrate from legacy ANTHROPIC_API_KEY
  if (process.env.ANTHROPIC_API_KEY && !process.env.INFERENCE_API_KEY && !process.env.INFERENCE_BASE_URL) {
    process.env.INFERENCE_API_KEY = process.env.ANTHROPIC_API_KEY;
    process.env.INFERENCE_BASE_URL = "https://api.anthropic.com/v1";
    process.env.INFERENCE_MODEL = process.env.INFERENCE_MODEL || "claude-sonnet-4-5-20250514";
    console.warn("Auto-migrated ANTHROPIC_API_KEY to INFERENCE_API_KEY (Anthropic compat endpoint). Set INFERENCE_BASE_URL and INFERENCE_MODEL explicitly to override.");
  }

  if (process.env.INFERENCE_API_KEY || process.env.INFERENCE_BASE_URL) {
    const p = createInferenceProvider();
    _provider = p;
    _providerWithResult = p;
    return _provider;
  }

  _provider = getMockProvider();
  return _provider;
}

/** Returns the last AI call result for AILog enrichment. null if mock. */
export function getLastAIResult(): { output: unknown; tokenUsage: { input: number; output: number }; latency: number; model: string } | null {
  if (!_providerWithResult) getAIProvider();
  return _providerWithResult?.getLastResult?.() ?? null;
}
