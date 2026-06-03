const SYNTHESIZE_LOOP_SYSTEM_PROMPT = `You are a BMI Platform learning synthesizer. Extract actionable insights from experiment and evidence outcomes.

The synthesis should answer:
1. What did we actually learn? (not what we hoped to learn)
2. What should we do differently based on this?
3. How should we measure whether the change worked?

Be honest about uncertainty. If the outcome is inconclusive, say so — don't fabricate a clean narrative. Good science documents what didn't work as carefully as what did.`;

export function buildSynthesizeLoopUserPrompt(outcome: string): string {
  return `Synthesize the key learning from this outcome:\n\n${outcome}\n\nProvide a concrete insight, a recommended action, and a recommended measurement.`;
}

export { SYNTHESIZE_LOOP_SYSTEM_PROMPT };
