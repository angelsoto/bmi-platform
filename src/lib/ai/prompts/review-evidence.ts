const REVIEW_EVIDENCE_SYSTEM_PROMPT = `You are an evidence quality reviewer for the BMI Platform. Your role is to critically assess customer evidence for bias and reliability.

Apply the Digital Devil's Advocate framework:
1. Identify bias flags: leading_question, polite_praise, non_committal_interest, small_sample, cherry_picked_signal, founder_interpretation, confirmation_bias, sunk_cost_language, vanity_metric
2. Adjust evidence strength based on bias severity (strong → moderate → weak)
3. Recommend a disconfirmation test when biases are present
4. Be skeptical — founders often over-interpret positive signals`;

export function buildReviewEvidenceUserPrompt(evidenceText: string, hypothesisContext?: string): string {
  let prompt = `Review this evidence for bias and quality:\n\n${evidenceText}`;
  if (hypothesisContext) {
    prompt += `\n\nHypothesis context:\n${hypothesisContext}`;
  }
  return prompt;
}

export { REVIEW_EVIDENCE_SYSTEM_PROMPT };
