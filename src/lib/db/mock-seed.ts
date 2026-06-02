/**
 * Seeds 4 mock projects at different validation stages.
 * Run: npx tsx src/lib/db/mock-seed.ts
 */
import { prisma } from "./prisma";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

async function seed() {
  console.log("Seeding 4 mock projects...\n");

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: { email: "admin@test.com", name: "Admin" },
  });
  console.log("Admin user ready");

  const p1 = await seedJustStarted(admin);
  console.log('[New] "' + p1.name + '"');

  const p2 = await seedEarlyValidation(admin);
  console.log('[Early] "' + p2.name + '"');

  const p3 = await seedMidValidation(admin);
  console.log('[Mid] "' + p3.name + '"');

  const p4 = await seedAdvanced(admin);
  console.log('[Adv] "' + p4.name + '"');

  console.log("\nDone. 4 mock projects seeded.");
}

async function seedJustStarted(admin: { id: string }) {
  const project = await createProject(admin, {
    name: "Mindful Match",
    description: "Meditation app connecting users with live guided sessions matching their mood.",
    businessType: "startup",
    currentStage: "idea",
    proofCaseMode: false,
  });

  await prisma.conceptIntake.create({
    data: {
      projectId: project.id,
      userId: admin.id,
      rawInput: "I want to build a meditation app that uses AI to match users with live sessions...",
      status: "processed",
      parsedSummary: "Mindful Match connects busy professionals with live, personalized meditation sessions.",
      processedAt: hoursAgo(2),
    },
  });

  for (const a of [
    { s: "Users feel current meditation apps are too generic", c: "customer_pain", r: "high" },
    { s: "Professionals will pay $14.99/month for live sessions", c: "willingness_to_pay", r: "critical" },
    { s: "Live instructors can be retained at scale", c: "delivery_capability", r: "high" },
  ]) {
    await prisma.businessAssumption.create({
      data: { projectId: project.id, statement: a.s, category: a.c, riskLevel: a.r },
    });
  }
  return project;
}

async function seedEarlyValidation(admin: { id: string }) {
  const project = await createProject(admin, {
    name: "GST Body",
    description: "Validation platform for wellness practitioners to build evidence-based programs.",
    businessType: "clinic",
    currentStage: "validating",
    proofCaseMode: true,
  });

  await prisma.mVVStatement.create({
    data: {
      projectId: project.id,
      mission: "Make body composition science accessible to every wellness practitioner",
      vision: "A world where every fitness program is built on validated physiology",
      values: JSON.stringify(["Scientific rigor", "Practitioner empathy"]),
      founderAssumptions: JSON.stringify(["Practitioners understand physiology"]),
      unresolvedTensions: JSON.stringify(["Depth vs accessibility"]),
      createdByUserId: admin.id,
    },
  });

  await prisma.conceptIntake.create({
    data: {
      projectId: project.id,
      userId: admin.id,
      rawInput: "GST Body provides validated body composition protocols...",
      status: "processed",
      parsedSummary: "GST Body helps clinics run evidence-based programs.",
      processedAt: daysAgo(10),
    },
  });

  await prisma.persona.create({
    data: {
      projectId: project.id,
      name: "Wellness Clinic Owner",
      primaryPain: "Competing with unqualified trainers who undercut on price",
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  await prisma.offer.create({
    data: {
      projectId: project.id,
      name: "GST Body Certification Program",
      valueProposition: "Turn your clinic into an evidence-based authority",
      format: "program",
      priceModel: "tiered",
      priceAmount: 2997,
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  const h1 = await makeHypothesis(project.id, admin.id,
    "Clinics need science-backed programs to compete",
    "Wellness clinic owners believe evidence-based protocols differentiate them.",
    "desirability", "active", "medium", "weak");
  await rankHypothesis(project.id, h1.id, "critical", "high", 100, "Core value proposition");

  const h3 = await makeHypothesis(project.id, admin.id,
    "Clinics will pay $3k for certification",
    "Wellness clinic owners will invest $2k-$4k for certification.",
    "viability", "testing", "medium", "weak");
  await rankHypothesis(project.id, h3.id, "critical", "medium", 67, "Revenue model depends on this");

  const h2 = await makeHypothesis(project.id, admin.id,
    "Clinicians can learn composition science",
    "Practitioners without physiology backgrounds can apply validated protocols.",
    "feasibility", "active", "low", "none");
  await rankHypothesis(project.id, h2.id, "high", "high", 75, "Delivery depends on practitioner capability");

  await makeHypothesis(project.id, admin.id,
    "Program completion improves client outcomes",
    "Clinics see measurable improvements within 12 weeks.",
    "feasibility", "draft", "low", "none");
  await makeHypothesis(project.id, admin.id,
    "Premium pricing is sustainable",
    "Clinics can maintain premium pricing with differentiation.",
    "viability", "draft", "low", "none");

  // Weak evidence with bias for h1
  const ev1 = await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "interview",
      summary: "3 of 5 clinic owners said science differentiation sounds interesting.",
      rawText: "Asked 5 clinic owners. 3 said sounds interesting but none committed.",
      relatedHypothesisId: h1.id, evidenceStrength: "weak",
      collectedByUserId: admin.id, collectedAt: daysAgo(5),
    },
  });
  await createQualityReview(project.id, ev1.id, "interview", h1.id, "weak", [
    { type: "polite_praise", severity: "medium", explanation: "Polite praise, not purchase intent" },
    { type: "small_sample", severity: "high", explanation: "Only 5 interviews" },
  ], "Run landing page with pre-order button");

  // Weak evidence for h3
  const ev2 = await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "interview",
      summary: "One clinic owner loves the idea of certification.",
      rawText: "A clinic owner said they love the idea but didn't follow up.",
      relatedHypothesisId: h3.id, evidenceStrength: "weak",
      collectedByUserId: admin.id, collectedAt: daysAgo(3),
    },
  });
  await createQualityReview(project.id, ev2.id, "interview", h3.id, "weak", [
    { type: "polite_praise", severity: "high", explanation: "Enthusiasm for concept, not a purchase" },
  ], "Fake-door test with payment info");

  return project;
}

async function seedMidValidation(admin: { id: string }) {
  const project = await createProject(admin, {
    name: "Code Coach",
    description: "AI pair programming tutor for junior developers.",
    businessType: "startup",
    currentStage: "validating",
    proofCaseMode: false,
  });

  await prisma.mVVStatement.create({
    data: {
      projectId: project.id,
      mission: "Eliminate tutorial hell for junior developers",
      vision: "Every junior dev has a senior mentor available 24/7",
      values: JSON.stringify(["Learning by doing", "Psychological safety"]),
      founderAssumptions: JSON.stringify(["Juniors want AI mentorship"]),
      unresolvedTensions: JSON.stringify(["AI accuracy vs human quality"]),
      versionNumber: 2,
      createdByUserId: admin.id,
    },
  });

  await prisma.conceptIntake.create({
    data: {
      projectId: project.id, userId: admin.id,
      rawInput: "Code Coach is an AI pair programming tutor...",
      status: "processed", parsedSummary: "AI pair programming tutor for junior developers.",
      processedAt: daysAgo(18),
    },
  });

  await prisma.persona.create({
    data: {
      projectId: project.id,
      name: "Junior Developer (0-2 years)",
      primaryPain: "Stuck in tutorial hell",
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  await prisma.offer.create({
    data: {
      projectId: project.id,
      name: "Code Coach Pro",
      valueProposition: "Real-time AI pair programming with contextual code review",
      format: "subscription", priceModel: "recurring", priceAmount: 29,
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  const h1 = await makeHypothesis(project.id, admin.id,
    "Juniors feel stuck after bootcamps",
    "Junior devs who completed bootcamps feel unable to solve real-world problems.",
    "desirability", "supported", "high", "moderate");
  await rankHypothesis(project.id, h1.id, "critical", "medium", 67, "Core pain hypothesis");

  const h2 = await makeHypothesis(project.id, admin.id,
    "Seniors can't scale their mentorship",
    "Senior devs are willing to contribute coding patterns for income.",
    "viability", "testing", "medium", "weak");
  await rankHypothesis(project.id, h2.id, "high", "high", 75, "Supply side of marketplace");

  const h3 = await makeHypothesis(project.id, admin.id,
    "Juniors will pay $29/month",
    "Junior devs will spend $29/month for an AI mentor.",
    "viability", "testing", "medium", "moderate");
  await rankHypothesis(project.id, h3.id, "high", "medium", 50, "Revenue model");

  await makeHypothesis(project.id, admin.id,
    "AI code review improves real skills",
    "Regular AI code review improves junior dev problem-solving.",
    "feasibility", "active", "medium", "weak");
  await makeHypothesis(project.id, admin.id,
    "Companies will buy team licenses",
    "Engineering managers at mid-size tech companies will buy team licenses.",
    "viability", "draft", "low", "none");

  // Moderate evidence for h1
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "survey",
      summary: "Survey: 68% of 47 junior devs feel stuck on real-world problems.",
      rawText: "Survey via r/learnprogramming. 47 respondents. 68% feel stuck often.",
      relatedHypothesisId: h1.id, evidenceStrength: "moderate",
      collectedByUserId: admin.id, collectedAt: daysAgo(12),
    },
  });

  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "interview",
      summary: "12 interviews: 9 described imposter syndrome from skill gap.",
      rawText: "12 semi-structured interviews. 9/12 mentioned imposter syndrome.",
      relatedHypothesisId: h1.id, evidenceStrength: "moderate",
      collectedByUserId: admin.id, collectedAt: daysAgo(10),
    },
  });

  // Weak evidence for h3
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "experiment_result",
      summary: "Landing page A/B: 2.1% at $29, 4.8% at $19.",
      rawText: "Two-week test, 1240 visitors. Variant A ($29) 2.1%, Variant B ($19) 4.8%.",
      relatedHypothesisId: h3.id, evidenceStrength: "weak",
      collectedByUserId: admin.id, collectedAt: daysAgo(6),
    },
  });

  // Running experiments
  await prisma.experiment.create({
    data: {
      projectId: project.id, hypothesisId: h2.id,
      name: "Senior Dev Willingness Survey",
      experimentType: "survey_test", status: "running",
      ownerUserId: admin.id, startDate: daysAgo(3),
    },
  });
  await prisma.experiment.create({
    data: {
      projectId: project.id, hypothesisId: h3.id,
      name: "Price Point Landing Page Test",
      experimentType: "landing_page_test", status: "running",
      ownerUserId: admin.id, startDate: daysAgo(2),
    },
  });

  return project;
}

async function seedAdvanced(admin: { id: string }) {
  const project = await createProject(admin, {
    name: "LocalEats",
    description: "Hyperlocal platform connecting home cooks with neighbors for meals.",
    businessType: "startup",
    currentStage: "selling",
    proofCaseMode: false,
  });

  await prisma.mVVStatement.create({
    data: {
      projectId: project.id,
      mission: "Make home-cooked food accessible to everyone",
      vision: "Every neighborhood has a food community",
      values: JSON.stringify(["Food safety first", "Community trust"]),
      founderAssumptions: JSON.stringify(["Home cooks want to monetize"]),
      unresolvedTensions: JSON.stringify(["Regulatory compliance"]),
      versionNumber: 3,
      createdByUserId: admin.id,
    },
  });

  await prisma.conceptIntake.create({
    data: {
      projectId: project.id, userId: admin.id,
      rawInput: "LocalEats is a platform for home-cooked food delivery...",
      status: "processed", parsedSummary: "Hyperlocal home-cooked food marketplace.",
      processedAt: daysAgo(25),
    },
  });

  const persona = await prisma.persona.create({
    data: {
      projectId: project.id,
      name: "Urban Foodie Professional",
      primaryPain: "Wants authentic home-cooked meals, not delivery apps",
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  const offer = await prisma.offer.create({
    data: {
      projectId: project.id,
      name: "LocalEats Meal Subscription",
      valueProposition: "Authentic home-cooked meals from neighbors, delivered weekly",
      format: "subscription", priceModel: "recurring", priceAmount: 49,
      relatedHypothesisIds: "[]",
      createdByUserId: admin.id,
    },
  });

  const h1 = await makeHypothesis(project.id, admin.id,
    "People want alternatives to delivery apps",
    "Urban professionals want homemade alternatives to delivery apps.",
    "desirability", "supported", "high", "strong");
  await rankHypothesis(project.id, h1.id, "critical", "low", 33, "Validated — core desirability confirmed");

  const h2 = await makeHypothesis(project.id, admin.id,
    "Home cooks will cook for neighbors",
    "Home cooks are willing to cook extra portions for income.",
    "viability", "supported", "high", "strong");
  await rankHypothesis(project.id, h2.id, "critical", "low", 33, "Validated — supply side works");

  const h3 = await makeHypothesis(project.id, admin.id,
    "Customers pay $49/week for meals",
    "Urban professionals will spend $49/week on 3-4 home-cooked meals.",
    "viability", "supported", "high", "strong");
  await rankHypothesis(project.id, h3.id, "high", "low", 25, "Validated through pre-sales");

  const h4 = await makeHypothesis(project.id, admin.id,
    "Food safety trust can be established",
    "Customers trust vetted home-cooked food with certifications.",
    "feasibility", "supported", "high", "moderate");
  await rankHypothesis(project.id, h4.id, "high", "medium", 50, "Partially validated");

  const h5 = await makeHypothesis(project.id, admin.id,
    "Unit economics support growth",
    "Platform achieves 30%+ gross margin at neighborhood density.",
    "viability", "testing", "medium", "moderate");
  await rankHypothesis(project.id, h5.id, "medium", "medium", 33, "Needs density validation");

  // Create experiments
  const exp1 = await prisma.experiment.create({
    data: {
      projectId: project.id, hypothesisId: h1.id,
      name: "Landing Page Demand Validation",
      description: "Facebook/Instagram campaign in Austin",
      experimentType: "landing_page_test", status: "decision_made",
      ownerUserId: admin.id, startDate: daysAgo(21), endDate: daysAgo(14),
    },
  });

  const exp2 = await prisma.experiment.create({
    data: {
      projectId: project.id, hypothesisId: h3.id,
      name: "Pre-Sale Pricing Validation",
      description: "Pre-sale campaign with $49 deposit",
      experimentType: "landing_page_test", status: "applied",
      ownerUserId: admin.id, startDate: daysAgo(17), endDate: daysAgo(10),
    },
  });

  await prisma.experiment.create({
    data: {
      projectId: project.id, hypothesisId: h5.id,
      name: "Neighborhood Density Pilot",
      description: "Multi-neighborhood pilot for unit economics",
      experimentType: "landing_page_test", status: "running",
      ownerUserId: admin.id, startDate: daysAgo(5),
    },
  });

  // Evidence — survey
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "survey",
      summary: "Survey: 71% of 234 urban professionals interested in home-cooked delivery.",
      rawText: "Survey across 5 cities. 234 respondents. 71% interested. 42% would order weekly.",
      relatedHypothesisId: h1.id, evidenceStrength: "strong",
      collectedByUserId: admin.id, collectedAt: daysAgo(20),
    },
  });

  // Evidence — landing page experiment
  const lpResult = await prisma.experimentResult.create({
    data: {
      experimentId: exp1.id, projectId: project.id,
      metricName: "signup_rate", observedValue: 0.083, threshold: 0.05,
      metThreshold: true, decisionRuleOutcome: "supports",
      createdByUserId: admin.id, createdAt: daysAgo(14),
    },
  });

  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "experiment_result", sourceEntityId: lpResult.id,
      summary: "Landing page 8.3% signup rate over 3 weeks (4200 visitors).",
      rawText: "Facebook/Instagram campaign. 4200 visitors, 349 signups (8.3%). Exceeded 5% threshold.",
      relatedHypothesisId: h1.id, evidenceStrength: "strong",
      collectedByUserId: admin.id, collectedAt: daysAgo(14),
    },
  });

  // Evidence — cook interviews
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "interview",
      summary: "18 of 25 home cooks willing to cook for neighbors at $25-35/hr.",
      rawText: "Interviewed 25 cooks in Austin. 18 willing. Requirements: guidelines, $25/hr min.",
      relatedHypothesisId: h2.id, evidenceStrength: "strong",
      collectedByUserId: admin.id, collectedAt: daysAgo(16),
    },
  });

  // Evidence — pre-sale
  const preSaleResult = await prisma.experimentResult.create({
    data: {
      experimentId: exp2.id, projectId: project.id,
      metricName: "pre_sale_conversion", observedValue: 0.82, threshold: 0.5,
      metThreshold: true, decisionRuleOutcome: "supports",
      createdByUserId: admin.id, createdAt: daysAgo(10),
      notes: "47 paid deposits at $49 from waitlist of 210",
    },
  });

  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "experiment_result", sourceEntityId: preSaleResult.id,
      summary: "Pre-sale: 47 customers paid $49 deposit. 82% waitlist conversion.",
      rawText: "210 waitlist to 172 interested to 47 paid (82% from interested).",
      relatedHypothesisId: h3.id, evidenceStrength: "strong",
      collectedByUserId: admin.id, collectedAt: daysAgo(10),
    },
  });

  // Evidence — pilot data
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "manual_note",
      summary: "Pilot: 91% satisfaction, 68% repeat rate over 3 weeks.",
      rawText: "47 customers. 91% rated 4/5+. 68% reordered. Cooks earned $32/hr avg.",
      relatedHypothesisId: h4.id, evidenceStrength: "moderate",
      collectedByUserId: admin.id, collectedAt: daysAgo(3),
    },
  });

  // Evidence — unit economics
  await prisma.evidenceItem.create({
    data: {
      projectId: project.id, sourceType: "analytics",
      summary: "26% gross margin in pilot, projected 38% at 3x density.",
      rawText: "Revenue $2303, costs: cooks $1378, insurance $185, fees $142.",
      relatedHypothesisId: h5.id, evidenceStrength: "moderate",
      collectedByUserId: admin.id, collectedAt: daysAgo(2),
    },
  });

  // PMF Readiness
  const pmfScore = Math.round(((0.6 * 0.8 + 0.4 * 0.65) * (1 - 0.08)) * 100) / 100;
  await prisma.pMFReadinessAssessment.create({
    data: {
      projectId: project.id, customerDisappointmentScore: 0.65,
      totalHighRiskHypotheses: 4, unvalidatedHighRiskHypotheses: 0,
      evidenceDistortionCoefficient: 0.08, validationVelocity: 3.5,
      pmfScore, readinessState: "strong_signal",
      explanation: "PMF score of " + (pmfScore * 100).toFixed(0) + "% indicates Strong Signal.",
      blockingHypothesisIds: JSON.stringify([h5.id]),
      createdAt: daysAgo(1),
    },
  });

  // Learning loops
  await prisma.learningLoop.create({
    data: {
      projectId: project.id, sourceEntityType: "experiment", sourceEntityId: exp2.id,
      outcomeSummary: "Pre-sale: 47 paid deposits at $49. 82% conversion.",
      insight: "Customers pay upfront when they see cook profiles and menus.",
      targetEntityType: "hypothesis", targetEntityId: h3.id,
      actionTaken: "Locked $49/week pricing. Expanded to 2 more neighborhoods.",
      measurementPlan: "Track pre-sale conversion. Target 70%+.",
      status: "closed", ownerUserId: admin.id,
      createdAt: daysAgo(8), closedAt: daysAgo(6),
    },
  });

  await prisma.learningLoop.create({
    data: {
      projectId: project.id, sourceEntityType: "experiment", sourceEntityId: exp1.id,
      outcomeSummary: "Cook supply validated: 18 cooks at $25-35/hr.",
      insight: "Cook supply strong. Safety guidelines are primary concern.",
      targetEntityType: "hypothesis", targetEntityId: h2.id,
      actionTaken: "Designed safety certification. Built flexible scheduling.",
      measurementPlan: "Track cook retention. Target 80% after 1 month.",
      status: "closed", ownerUserId: admin.id,
      createdAt: daysAgo(10), closedAt: daysAgo(8),
    },
  });

  // Landing page
  const lp = await prisma.landingPage.create({
    data: {
      projectId: project.id, name: "LocalEats Austin", slug: "localeats-austin",
      personaId: persona.id, offerId: offer.id,
      journeyStage: "conversion", status: "measuring", governanceStatus: "not_required",
      seoTitle: "LocalEats — Home-Cooked Meals from Your Neighbors",
      seoDescription: "Fresh, authentic home-cooked meals from neighborhood kitchens.",
    },
  });

  await prisma.contentBlock.createMany({
    data: [
      { landingPageId: lp.id, blockType: "hero", content: '{"headline":"Real Home Cooking, Right Next Door"}', orderIndex: 1 },
      { landingPageId: lp.id, blockType: "cta", content: '{"label":"Join the Waitlist","url":"/waitlist"}', orderIndex: 2 },
    ],
  });

  return project;
}

// ── Helpers ─────────────────────────────────────────────────────

async function createProject(admin: { id: string }, data: any) {
  const project = await prisma.project.create({ data: { ...data, ownerId: admin.id } });
  await prisma.projectMember.create({ data: { userId: admin.id, projectId: project.id, role: "owner" } });
  return project;
}

async function makeHypothesis(
  projectId: string, userId: string,
  title: string, statement: string,
  type: string, status: string, confidence: string, evidenceStrength: string,
) {
  return prisma.hypothesis.create({
    data: { projectId, title, statement, type, status, confidence, evidenceStrength },
  });
}

async function rankHypothesis(
  projectId: string, hypothesisId: string,
  survivalCriticality: string, uncertainty: string,
  score: number, rationale: string,
) {
  await prisma.hypothesisRiskRank.create({
    data: { hypothesisId, projectId, survivalCriticality, uncertainty, validationPriorityScore: score, rationale },
  });
}

async function createQualityReview(
  projectId: string, evidenceItemId: string,
  sourceEntityType: string, hypothesisId: string,
  adjustedStrength: string,
  biasFlags: { type: string; severity: string; explanation: string }[],
  disconfirmation?: string,
) {
  const review = await prisma.evidenceQualityReview.create({
    data: {
      projectId, evidenceItemId, sourceEntityType,
      sourceEntityId: hypothesisId,
      adjustedEvidenceStrength: adjustedStrength,
      recommendedDisconfirmationTest: disconfirmation,
    },
  });
  if (biasFlags.length > 0) {
    await prisma.biasFlag.createMany({
      data: biasFlags.map((f) => ({ reviewId: review.id, ...f })),
    });
  }
}

seed()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .then(() => process.exit(0));
