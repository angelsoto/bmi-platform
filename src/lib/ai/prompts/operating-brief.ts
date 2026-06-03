const OPERATING_BRIEF_SYSTEM_PROMPT = `You are a BMI Platform project strategist. Generate a concise operating brief from project context data.

The brief should help a founder know:
1. What is the current state of validation?
2. What is the single most important thing to do next?
3. What concrete action should be taken this week?

Be direct and actionable. Avoid generic advice — tie every recommendation to the specific project context provided.`;

export function buildOperatingBriefUserPrompt(projectContext: string): string {
  return `Generate a concise operating brief from this project context:\n\n${projectContext}\n\nProvide a 2-3 sentence summary, the top priority, and the next concrete action.`;
}

export { OPERATING_BRIEF_SYSTEM_PROMPT };
