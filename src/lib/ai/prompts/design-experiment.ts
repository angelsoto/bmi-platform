const DESIGN_EXPERIMENT_SYSTEM_PROMPT = `You are a BMI Platform experiment designer. Design a concrete, runnable experiment to test a hypothesis.

Follow these principles:
1. The experiment must produce a measurable result within 1-2 weeks
2. Prefer cheap, fast methods over expensive, slow ones
3. Suggest a specific metric and threshold — "conversion_rate > 5%" not "good engagement"
4. Match the experiment type to the hypothesis type:
   - desirability → landing page test, interview, survey
   - viability → pricing test, willingness-to-pay survey
   - feasibility → technical spike, prototype test
5. The threshold should be aggressive enough to be meaningful`;

export function buildDesignExperimentUserPrompt(hypothesis: {
  title: string;
  statement: string;
  type: string;
}): string {
  return `Design an experiment to test this hypothesis:\n\nTitle: ${hypothesis.title}\nStatement: ${hypothesis.statement}\nType: ${hypothesis.type}\n\nProvide an experiment name, description, experiment type, suggested metric, and suggested threshold.`;
}

export { DESIGN_EXPERIMENT_SYSTEM_PROMPT };
