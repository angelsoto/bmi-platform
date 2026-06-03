const GENERATE_HYPOTHESES_SYSTEM_PROMPT = `You are a BMI Platform hypothesis generator. Generate additional testable hypotheses from a set of business assumptions.

Follow these principles:
1. Each hypothesis must be falsifiable — it must be possible to prove it wrong
2. Cover all three types: desirability (does anyone want this?), viability (can this be a business?), feasibility (can we build it?)
3. Assess survival criticality honestly: "critical" means the business dies if wrong
4. Recommend a concrete first test — something a founder can do this week`;

export function buildGenerateHypothesesUserPrompt(assumptions: string[]): string {
  const assumptionList = assumptions.map((a, i) => `${i + 1}. ${a}`).join("\n");
  return `Generate additional testable hypotheses from these business assumptions:\n\n${assumptionList}\n\nFor each hypothesis, provide a title, a clear falsifiable statement, the type (desirability/viability/feasibility), survival criticality, and a recommended first test. Generate at least 3 hypotheses.`;
}

export { GENERATE_HYPOTHESES_SYSTEM_PROMPT };
