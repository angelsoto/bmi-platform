import { prisma } from "./prisma";

const TOUR_STEPS = [
  {
    key: "welcome",
    title: "Welcome to the Command Center",
    body: "This is your operating dashboard for validation progress. Every widget tracks a piece of your venture's evidence journey.",
    orderIndex: 1,
    targetSelector: "[data-tour='project-header']",
    actionType: "next",
  },
  {
    key: "validation-spine",
    title: "Your Validation Spine",
    body: "MVV → Hypotheses → Experiments → Pivots → PMF. Progress by evidence, not opinion.",
    orderIndex: 2,
    targetSelector: "[data-tour='validation-spine']",
    actionType: "next",
  },
  {
    key: "riskiest-hypotheses",
    title: "Riskiest Hypotheses",
    body: "Start with assumptions that could kill the business. These are ranked by validation priority score.",
    orderIndex: 3,
    targetSelector: "[data-tour='hypotheses']",
    actionType: "next",
  },
  {
    key: "evidence-quality",
    title: "Evidence Quality",
    body: "The platform flags leading questions, polite praise, cherry-picked feedback, and weak signals.",
    orderIndex: 4,
    targetSelector: "[data-tour='evidence']",
    actionType: "next",
  },
  {
    key: "experiments",
    title: "Experiments",
    body: "Every experiment needs a hypothesis, metric, threshold, decision rule, and action.",
    orderIndex: 5,
    targetSelector: "[data-tour='experiments']",
    actionType: "next",
  },
  {
    key: "experiment-surfaces",
    title: "Experiment Surfaces",
    body: "Landing pages are the first surface. Each connects to a persona, offer, CTA, events, and a goal.",
    orderIndex: 6,
    targetSelector: "[data-tour='surfaces']",
    actionType: "next",
  },
  {
    key: "pmf-readiness",
    title: "PMF Readiness",
    body: "An objective signal of whether there is enough validated evidence to scale.",
    orderIndex: 7,
    targetSelector: "[data-tour='pmf']",
    actionType: "next",
  },
  {
    key: "learning-loops",
    title: "Learning Loops",
    body: "Turn an outcome into an insight, an action, and a measurement plan.",
    orderIndex: 8,
    targetSelector: "[data-tour='loops']",
    actionType: "next",
  },
  {
    key: "next-best-action",
    title: "Your Next Best Action",
    body: "Review your top-risk hypothesis and create your first experiment.",
    orderIndex: 9,
    targetSelector: "[data-tour='quick-actions']",
    actionType: "complete",
  },
];

export async function seedTourSteps() {
  console.log("Seeding tour steps...");
  for (const step of TOUR_STEPS) {
    await prisma.tourStep.upsert({
      where: { key: step.key },
      update: step,
      create: step,
    });
  }
  console.log(`Seeded ${TOUR_STEPS.length} tour steps.`);
}

seedTourSteps()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
