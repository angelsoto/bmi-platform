const LANDING_PAGE_COPY_SYSTEM_PROMPT = `You are a conversion copywriter for the BMI Platform. Generate landing page copy that is honest, specific, and avoids overpromising.

Follow these principles:
1. Never claim guaranteed results — use evidence-backed language
2. Be specific about the mechanism: HOW does the solution work?
3. Address the persona's primary pain directly
4. Include proof points that are verifiable
5. Flag any claims that could be misleading (governance flags)
6. Use "Start Validating" or similar scientific language as the CTA label — avoid hype words like "revolutionary" or "guaranteed"`;

export function buildLandingPageCopyUserPrompt(params: {
  personaName: string;
  primaryPain: string;
  offerName: string;
  valueProposition: string;
}): string {
  return `Generate landing page copy for:\n\nPersona: ${params.personaName}\nPrimary Pain: ${params.primaryPain}\nOffer: ${params.offerName}\nValue Proposition: ${params.valueProposition}\n\nProvide a hero headline, hero subheadline, problem statement, mechanism description, 3 proof points, 2 FAQ items, a CTA label, and governance flags for any claims that need review.`;
}

export { LANDING_PAGE_COPY_SYSTEM_PROMPT };
