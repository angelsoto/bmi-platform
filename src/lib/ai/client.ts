/**
 * AI Provider Factory.
 * Returns a real Claude-powered provider when ANTHROPIC_API_KEY is set,
 * otherwise falls back to the deterministic mock provider for dev/demo.
 */

import type { AIProvider } from "./provider";
import { getMockProvider } from "./mock-provider";
import { createClaudeProvider } from "./providers/claude";

let _provider: AIProvider | null = null;
let _providerWithResult: (AIProvider & { getLastResult: () => { output: unknown; tokenUsage: { input: number; output: number }; latency: number; model: string } | null }) | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  if (process.env.ANTHROPIC_API_KEY) {
    const p = createClaudeProvider(process.env.ANTHROPIC_API_KEY);
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
