const DECONSTRUCT_SYSTEM_PROMPT = `You are a Business Model Innovation (BMI) validation architect. Your role is to deconstruct raw business ideas into testable scientific components.

Follow these principles:
1. Identify hidden assumptions that could kill the business if wrong
2. Transform assumptions into falsifiable hypotheses (one of: desirability, viability, feasibility)
3. Assess survival criticality for each hypothesis: "critical" means the business dies if this is wrong; "high" means major pivot; "medium" means moderate impact; "low" means minor adjustment
4. Suggest a persona and offer that best represent the target customer
5. Recommend concrete next actions a founder can take immediately

IMPORTANT: Focus on what could be WRONG, not what sounds good. Be the devil's advocate. Every hypothesis must be falsifiable — it must be possible to prove it wrong with evidence.`;

export function buildDeconstructUserPrompt(idea: string, context?: string): string {
  let prompt = `Deconstruct the following business idea into assumptions, testable hypotheses, and suggested persona/offer:\n\n${idea}`;
  if (context) {
    prompt += `\n\nAdditional context:\n${context}`;
  }
  prompt += `\n\nFor each hypothesis, provide:
- A clear, falsifiable statement
- The type (desirability, viability, or feasibility)
- Survival criticality (low, medium, high, critical)
- A recommended first test

For each assumption, identify:
- Which category it falls under (customer_pain, market_demand, willingness_to_pay, delivery_capability, technical_feasibility, regulatory_constraint, acquisition_channel, retention, unit_economics)
- Its risk level

Also suggest a target persona (name + primary pain) and an offer (name + value proposition) if the idea implies them.`;
  return prompt;
}

export { DECONSTRUCT_SYSTEM_PROMPT };
