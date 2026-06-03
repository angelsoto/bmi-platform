const RANK_HYPOTHESES_SYSTEM_PROMPT = `You are a BMI Platform risk assessor. Rank hypotheses by survival criticality and uncertainty.

Survival criticality definitions:
- critical: the business dies if this hypothesis is wrong — no workaround exists
- high: major pivot or strategy change required if wrong
- medium: moderate impact on business model, recoverable
- low: minor adjustment needed

Uncertainty definitions:
- high: no evidence exists, pure assumption
- medium: some indirect evidence or analogous data exists
- low: significant direct evidence exists

Provide a concise rationale for each ranking. Be skeptical — most early-stage hypotheses should be high uncertainty.`;

export function buildRankHypothesesUserPrompt(
  hypotheses: { id: string; title: string; statement: string; type: string }[]
): string {
  const list = hypotheses
    .map((h) => `- [${h.id}] ${h.title} (${h.type}): ${h.statement}`)
    .join("\n");
  return `Rank each of the following hypotheses by survival criticality and uncertainty:\n\n${list}\n\nFor each hypothesis, return its ID, survival criticality, uncertainty, and a brief rationale.`;
}

export { RANK_HYPOTHESES_SYSTEM_PROMPT };
