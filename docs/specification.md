# BMI Platform Specification v1.2

## Scientific Validation Engine — Functional Spec and Visual System

> **Revision note (v1.2).** This revision integrates the UI Visual Guidelines into the functional specification as a single source of truth. The document is now in two parts: **Part I — Functional Specification** (unchanged from v1.1) and **Part II — UI and Visual System** (the visual guidelines, reconciled to the Track A / Track B scope split and reorganized to follow the same module order). Component guidance now cross-references the functional module and the formulas it visualizes. Where the visual guidelines listed deferred features (OKRs, advisor, full governance) as if they were MVP surfaces, Part II marks them as Track B so the scope story stays consistent across both parts.
>
> **Revision note (v1.1).** Narrowed the MVP to the validation loop named in the North Star, separated organizational/adoption features into a distinct Platform Extensions track, defined the two scoring functions previously undefined (`pmfScore` and `evidenceDistortionCoefficient`), added the missing Persona and Offer objects, made the experiment → evidence → hypothesis chain explicit, and resolved schema and permission inconsistencies. Changes are summarized in Section 0.
>
> **How to read this document.** Part I (Sections 0–28) defines *what the system does*. Part II (Sections 29–49) defines *how it looks and behaves visually*. A developer building a module should read its functional section in Part I, then its component section in Part II. Cross-references use the form "(see §17.5)".

---

# PART I — FUNCTIONAL SPECIFICATION

## 0. Summary of Changes from v1.0

This section exists so reviewers can see what moved and why.

### 0.1 Scope split

The single biggest change. v1.0 called itself an MVP but specified 16 modules, 11 AI chains, and a 10-phase build. The stated North Star requires only one loop: idea → ranked hypotheses → bias-checked evidence → deployed experiment → readiness signal.

v1.1 divides the work into two tracks:

* **Track A — Core Loop MVP.** The minimum that proves the thesis. This is the actual MVP and the only thing required for the Definition of Done.
* **Track B — Platform Extensions.** Real features that prove organizational adoption (roles, advisor portfolio, governance, full OKRs, pivot versioning). These are deferred and built only after Track A runs end to end.

Nothing from v1.0 is deleted. Features are reassigned to a track.

### 0.2 New definitions added

* **`pmfScore` formula** (Section 17.5). Previously a `number` with no derivation.
* **`evidenceDistortionCoefficient` formula** (Section 17.6). Previously an undefined coefficient.
* **`validationPriorityScore` formula** (Section 6.6).
* **Persona schema** (Section 8A.3) and **Offer schema** (Section 8A.4). Previously referenced as required fields with no definition or module.

### 0.3 Wiring made explicit

* The **experiment result → evidence item → quality review → hypothesis evidence strength** chain is now specified as an explicit, mostly automatic flow (Section 11A).
* Aggregation rules for per-project summary values (portfolio strength, PMF inputs) are now defined (Section 17.4, 19.x).

### 0.4 Consistency fixes

* `evidenceStrength` enum unified across all objects (Section 5A).
* Governance bypass via `governanceStatus = "not_required"` closed: a single rule now defines who may set that value (Section 20A).
* The Conversion Operator deploy-vs-governance interaction is clarified (Section 23).

### 0.5 Visual system integrated (v1.2)

* The UI Visual Guidelines are folded in as **Part II** (Sections 29–49), reorganized to follow Part I's module order, with every component section cross-referenced to the module and formula it renders.
* Scope reconciled: where the visual guidelines listed deferred features (OKR Health, advisor review queue, full governance workflow) as Command Center surfaces, Part II now marks them Track B and applies the deferred-feature treatment (Section 47.2) until built. The MVP Command Center widget set and hierarchy are stated explicitly (Section 38.8).
* The PMF formula visual is corrected to match Part I: the composed score is shown as `Base × (1 − distortion)` (Section 38.6), consistent with the formula in Section 17.5.

---

## 1. Product Definition

### 1.1 Product Name

**BMI Platform** (v1.1 specification; Core Loop MVP is the shippable target).

### 1.2 Product Category

A knowledge-aware scientific validation and conversion infrastructure platform for founder-led expert businesses, startups, accelerators, venture studios, and entrepreneurship programs.

### 1.3 Core Product Thesis

The BMI Platform helps founders and venture teams turn unstructured business ideas into ranked hypotheses, bias-checked evidence, deployed experiments, objective readiness signals, and operational learning loops.

The platform uses the **Scientific Entrepreneurship Cognitive Pathway (SE-CCM)** as its reasoning spine:

```txt
MVV → Hypotheses → Experiments → Pivots → PMF
```

### 1.4 The One Loop the MVP Must Prove

The Core Loop MVP focuses on one complete validation loop:

```txt
Raw founder idea
→ AI deconstruction
→ Ranked high-risk hypotheses
→ Bias-aware evidence review
→ Experiment design
→ Experiment surface deployment (landing page)
→ Analytics signal
→ Evidence created from result
→ Hypothesis evidence strength updated
→ PMF readiness update
→ Learning loop
```

Anything not on this line is Track B.

### 1.5 Core Differentiation

Structural moats, in priority order for the MVP:

1. **Digital Devil's Advocate bias and evidence-quality engine** (the hardest thing to copy and the source of trust).
2. **Version-controlled hypothesis database.**
3. **PMF Readiness Lite as an objective, explainable signal.**
4. **Experiment surface deployment.**
5. **Programmatic validation gates.**

Landing pages are the first supported experiment surface, not the primary moat.

### 1.6 Flagship Proof Case

The MVP supports **GST Body** as the flagship proof case. GST Body data must remain isolated in demo/proof-case modules. Reusable logic must remain generalized.

```txt
src/lib/db/gst-demo-data.ts
```

---

## 2. Track A — Core Loop MVP Goals

The Core Loop MVP allows a founder to:

1. Enter an unstructured business idea.
2. Receive AI-assisted deconstruction into structured assumptions.
3. Generate desirability, viability, and feasibility hypotheses.
4. Rank hypotheses by survival criticality and validation risk.
5. Track hypothesis versions over time.
6. Define a minimal Persona and Offer (needed for any experiment surface).
7. Design experiments with metric, threshold, and decision rule.
8. Deploy a landing page as the first experiment surface.
9. Instrument the surface with required analytics events.
10. Review evidence quality and bias risk.
11. Convert an experiment result into an evidence item automatically.
12. Recalculate hypothesis evidence strength from reviewed evidence.
13. Calculate a lightweight, explainable PMF readiness signal.
14. Create and close learning loops from outcomes.
15. See a single Command Center summarizing the above.
16. Be guided through a first-time tour of that Command Center.

---

## 3. Track B — Platform Extensions (Deferred)

These are explicitly out of the MVP and built only after Track A is proven end to end with GST Body:

* Role-based workbenches (founder, strategist, operator, governance, advisor).
* Advisor / coach portfolio view.
* Full governance review workflow with reviewer queues.
* Full OKR module with objectives, key results, and OKR health.
* PivotDelta strategic-change versioning.
* Cohort-style validation dashboards.

### 3.1 Permanent Non-Goals (both tracks)

* Full no-code visual website builder.
* Advanced multivariate testing and full statistical experiment engine.
* Enterprise SSO / private cloud / on-prem.
* CoachMatch marketplace, full CRM, full payments.
* Advanced semantic search and multi-touch attribution.
* Multi-framework synthesis across TAMC, 4A's, MDCBM/RDCBM, Guanxi, Renqing, and Face models.
* Native email automation.

---

## 4. Primary Users and Segments

### 4.1 Tier 1: Early-Stage Founder / Independent Entrepreneur (Track A target)

Needs: fast time-to-value, structured validation guidance, bias correction, investor-ready artifacts, clear next steps, low-friction onboarding.

Primary interface: Concept Intake, Progress Command Center, Hypothesis Database, Experiment Designer, PMF Readiness.

### 4.2 Tier 2: Accelerator, Incubator, Venture Studio, Advisor (Track B)

Needs: portfolio visibility, standardized validation progress, coach review queues, evidence-quality tracking, PMF readiness by project.

Primary interface (Track B): Advisor Portfolio View, Strategist Workbench, Review Queue.

### 4.3 Tier 3: Enterprise Innovation Hub / University Program (post-MVP)

Needs: governance, security, audit trails, standardized lifecycle, role-based workbenches.

Full Tier 3 deployment is post-MVP.

---

## 5. Module Map

### Track A — Core Loop MVP

1. Concept Intake and AI Deconstruction
2. First-Time Command Center Tour
3. Project Setup and MVV
4. Persona and Offer (new)
5. Hypothesis Database and Versioning
6. Bias and Evidence Quality
7. Experiment Design and Tracking
8. Experiment → Evidence Chain (new, explicit)
9. Experiment Surface Deployment: Landing Pages v1
10. Analytics and Instrumentation
11. PMF Readiness Lite
12. Learning Loops
13. Progress Command Center
14. AI Assistance and Structured Output Contracts

### Track B — Platform Extensions

15. Full OKRs and Operations Awareness
16. Role-Based Workbenches
17. Advisor / Coach Portfolio View
18. Governance Review
19. PivotDelta Versioning

---

## 5A. Shared Enums (Single Source of Truth)

To remove the v1.0 inconsistency where evidence strength used two different enums, all objects use these shared types.

```ts
// Used by EvidenceItem, EvidenceQualityReview output, and AI review output.
// Evidence that exists always has at least "weak" strength.
type EvidenceStrength = "weak" | "moderate" | "strong";

// Used by Hypothesis and HypothesisVersion.
// A hypothesis with zero linked evidence is "none"; once any evidence is
// linked, its strength is derived from that evidence (never below "weak").
type HypothesisEvidenceStrength = "none" | "weak" | "moderate" | "strong";

type RiskLevel = "low" | "medium" | "high" | "critical";
type Confidence = "low" | "medium" | "high";
type Severity = "low" | "medium" | "high";
```

Rule: `HypothesisEvidenceStrength` is `"none"` only when no evidence is linked. The moment an `EvidenceItem` links to a hypothesis, the derived strength is computed (Section 11A.4) and is one of `weak | moderate | strong`.

---

# Module 1: Concept Intake and AI Deconstruction

## 6. Concept Intake and AI Deconstruction

### 6.1 Purpose

Creates the first "aha" moment: raw idea in, structured validation dashboard out, within the first session.

```txt
Founder enters raw idea
→ AI extracts assumptions
→ AI classifies assumptions
→ System ranks riskiest hypotheses
→ System recommends first experiments
→ User lands in the Progress Command Center
```

### 6.2 Time-to-Value Target

Useful structure within approximately the first 10 minutes:

1. Minutes 1–3: founder enters or uploads concept.
2. Minutes 4–7: AI deconstructs into assumptions and hypotheses.
3. Minutes 8–10: system shows top risks, first experiments, next actions.

### 6.3 Core Objects

ConceptIntake, BusinessAssumption, Hypothesis, HypothesisRiskRank, AI Deconstruction Output, SuggestedExperiment.

### 6.4 ConceptIntake Schema

```ts
type ConceptIntake = {
  id: string;
  projectId: string;
  userId: string;
  rawInput: string;
  inputType: "typed_text" | "uploaded_text" | "pitch_notes" | "interview_transcript";
  parsedSummary?: string;
  status: "submitted" | "processed" | "failed";
  createdAt: Date;
  processedAt?: Date;
};
```

### 6.5 BusinessAssumption Schema

```ts
type BusinessAssumption = {
  id: string;
  projectId: string;
  conceptIntakeId?: string;
  statement: string;
  category:
    | "customer_pain"
    | "market_demand"
    | "willingness_to_pay"
    | "delivery_capability"
    | "technical_feasibility"
    | "regulatory_constraint"
    | "acquisition_channel"
    | "retention"
    | "unit_economics";
  riskLevel: RiskLevel;
  evidenceStatus: "untested" | "weak_evidence" | "moderate_evidence" | "strong_evidence";
  createdAt: Date;
};
```

### 6.6 HypothesisRiskRank Schema and Scoring (formula now defined)

```ts
type HypothesisRiskRank = {
  id: string;
  hypothesisId: string;
  projectId: string;
  survivalCriticality: RiskLevel;     // low | medium | high | critical
  uncertainty: "low" | "medium" | "high";
  validationPriorityScore: number;     // 0..100, computed — see below
  rationale: string;
  createdAt: Date;
};
```

**`validationPriorityScore` formula.** The point of the score is "test what could kill the business and that we are least sure about, first." It combines how fatal a wrong assumption is with how little we currently know.

```txt
criticalityWeight:  low=1, medium=2, high=3, critical=4
uncertaintyWeight:  low=1, medium=2, high=3

rawPriority = criticalityWeight * uncertaintyWeight        // range 1..12

validationPriorityScore = round( (rawPriority / 12) * 100 ) // normalized 0..100
```

A critical assumption we are highly uncertain about scores 100. A low-criticality, low-uncertainty assumption scores ~8. Hypotheses are ranked descending by this score; the top three populate the "Riskiest Hypotheses" panel.

Ties break by `survivalCriticality` first, then most recently updated.

### 6.7 Required Interface

Large text input; optional sample prompt; "Use GST Body demo" option; upload/paste pitch notes; AI processing state; generated assumption matrix; top three riskiest hypotheses; suggested next experiment; button "Start validation plan."

### 6.8 Acceptance Criteria

* User can submit a raw business idea.
* AI generates structured assumptions.
* AI classifies assumptions into desirability, viability, feasibility.
* System ranks at least three high-risk hypotheses using the formula above.
* User can accept, edit, or reject generated hypotheses.
* User can create a first experiment from a ranked hypothesis.

---

# Module 2: First-Time Command Center Tour

## 7. First-Time Tour

### 7.1 Purpose

Helps new users understand the Command Center after their project or demo workspace is created. (Tour content is unchanged from v1.0; in v1.1 it covers only Track A widgets. Role-workbench and advisor steps move to Track B.)

### 7.2 Tour Trigger

Triggers on first access to the Command Center, first project creation, first entry into GST demo, or onboarding reset.

### 7.3 UserOnboardingState Schema

```ts
type UserOnboardingState = {
  id: string;
  userId: string;
  projectId?: string;
  hasSeenMainTour: boolean;
  mainTourCompletedAt?: Date;
  currentTourStep?: string;
  skippedMainTourAt?: Date;
  dismissedStepIds: string[];
  completedStepIds: string[];
  createdAt: Date;
  updatedAt: Date;
};
```

### 7.4 TourStep Schema

```ts
type TourStep = {
  id: string;
  key: string;
  title: string;
  body: string;
  targetSelector?: string;
  route?: string;
  orderIndex: number;
  actionType?: "next" | "navigate" | "create" | "dismiss" | "complete";
};
```

### 7.5 Required Tour Steps (Track A)

1. **Welcome to the Command Center** — the operating dashboard for validation progress.
2. **Your Validation Spine** — MVV → Hypotheses → Experiments → Pivots → PMF; progress by evidence, not opinion.
3. **Riskiest Hypotheses** — start with assumptions that could kill the business.
4. **Evidence Quality** — the platform flags leading questions, polite praise, cherry-picked feedback, weak signals.
5. **Experiments** — every experiment needs a hypothesis, metric, threshold, decision rule, and action.
6. **Experiment Surfaces** — landing pages are the first surface; each connects to persona, offer, CTA, events, and a goal.
7. **PMF Readiness** — an objective signal of whether there is enough validated evidence to scale.
8. **Learning Loops** — turn an outcome into an insight, an action, and a measurement plan.
9. **Your Next Best Action** — review your top-risk hypothesis and create your first experiment.

(The v1.0 "OKRs," "Role Workbenches," and "Advisor" steps are deferred with their modules.)

### 7.6 Tour Affordances

Next, Back, Skip, Resume later, Don't show again, Restart from settings, progress indicator, keyboard navigation, accessible focus management.

### 7.7 Presentation Requirements

Modal or anchored popover; short steps; highlight target element; do not block core interaction after completion; persist state; bottom-sheet on mobile.

### 7.8 Acceptance Criteria

* First-time users see the tour on first Command Center access.
* Users can complete, skip, or resume.
* Completed users do not see it again unless restarted.
* State persists per user.
* Steps link to real interface areas.

---

# Module 3: Project Setup and MVV

## 8. Project Setup and MVV

### 8.1 Purpose

Creates the central workspace for a venture or proof-case project.

### 8.2 Core Objects

User, Project, ProjectMember, Role, Permission, MVVStatement, BusinessModelContext.

### 8.3 Project Schema

```ts
type Project = {
  id: string;
  name: string;
  description?: string;
  businessType:
    | "expert_service" | "startup" | "clinic" | "coaching" | "consulting"
    | "education" | "venture_studio_project" | "university_project" | "other";
  currentStage: "idea" | "validating" | "selling" | "scaling" | "optimizing";
  primaryGoal?: string;
  proofCaseMode: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8.4 MVVStatement Schema

```ts
type MVVStatement = {
  id: string;
  projectId: string;
  mission: string;
  vision: string;
  values: string[];
  founderAssumptions: string[];
  unresolvedTensions: string[];
  versionNumber: number;
  createdByUserId: string;
  createdAt: Date;
};
```

### 8.5 Acceptance Criteria

* User can create a project and define MVV.
* Project has at least one owner.
* Unauthorized users cannot access the project.
* First-time users are routed into concept intake or demo mode.
* The Command Center tour appears after initial setup.

---

# Module 4: Persona and Offer (new)

## 8A. Persona and Offer

### 8A.1 Why this module exists

In v1.0, `LandingPage` required a non-optional `personaId` and `offerId`, and `Hypothesis` referenced `relatedPersonaId` and `relatedOfferId`, but neither object had a schema or a home in any phase. You cannot build a landing page without them. v1.1 defines minimal versions so the experiment surface module has its dependencies.

These are intentionally lightweight. A full persona/offer system is post-MVP.

### 8A.2 Core Objects

Persona, Offer.

### 8A.3 Persona Schema

```ts
type Persona = {
  id: string;
  projectId: string;
  name: string;                       // e.g. "Time-poor founder, post-seed"
  description?: string;
  primaryPain: string;                // the pain this persona feels most
  context?: string;                   // situational notes
  relatedHypothesisIds: string[];     // desirability hypotheses about this persona
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8A.4 Offer Schema

```ts
type Offer = {
  id: string;
  projectId: string;
  name: string;
  valueProposition: string;           // what the persona gets
  format: "service" | "product" | "subscription" | "program" | "other";
  priceModel?: "one_time" | "recurring" | "tiered" | "free" | "undecided";
  priceAmount?: number;               // optional in MVP; willingness-to-pay is a hypothesis
  relatedHypothesisIds: string[];     // viability hypotheses about this offer
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8A.5 Acceptance Criteria

* User can create at least one Persona and one Offer per project.
* A landing page cannot be created until at least one Persona and one Offer exist.
* Personas and Offers can be linked to hypotheses.
* AI deconstruction may propose a draft Persona and Offer, which the user accepts or edits.

---

# Module 5: Hypothesis Database and Versioning

## 9. Hypothesis Database and Versioning

### 9.1 Purpose

Converts business uncertainty into structured, versioned, testable objects. Every hypothesis is typed, versioned, linked to assumptions, evidence, and experiments, scored for risk, and tracked over time.

### 9.2 Core Objects

Hypothesis, HypothesisVersion, HypothesisRiskRank, EvidenceLink. (PivotDelta moves to Track B, Section 19A.)

### 9.3 Hypothesis Schema

```ts
type Hypothesis = {
  id: string;
  projectId: string;
  title: string;
  statement: string;
  type: "desirability" | "viability" | "feasibility";
  relatedPersonaId?: string;
  relatedOfferId?: string;
  relatedLandingPageId?: string;
  confidence: Confidence;                          // low | medium | high
  evidenceStrength: HypothesisEvidenceStrength;    // none | weak | moderate | strong
  status:
    | "draft" | "active" | "testing"
    | "supported" | "weakened" | "invalidated" | "archived";
  currentVersionNumber: number;
  createdAt: Date;
  updatedAt: Date;
};
```

### 9.4 HypothesisVersion Schema

```ts
type HypothesisVersion = {
  id: string;
  hypothesisId: string;
  projectId: string;
  versionNumber: number;
  statement: string;
  confidence: Confidence;
  evidenceStrength: HypothesisEvidenceStrength;
  changedReason: string;
  changedByUserId: string;
  createdAt: Date;
};
```

### 9.5 Required Views

Hypothesis backlog; high-risk list; desirability/viability/feasibility board; hypothesis detail; version history; evidence drawer; related experiments.

### 9.6 Acceptance Criteria

* User can create and edit hypotheses.
* Every edit can create a new version.
* Hypotheses can be classified and risk-ranked.
* Hypotheses can be linked to evidence and experiments.
* `evidenceStrength` is recomputed automatically when linked evidence changes (Section 11A.4), never set by hand on a high-risk hypothesis.

---

# Module 6: Bias and Evidence Quality

## 10. Bias and Evidence Quality

### 10.1 Purpose

Implements the v1 **Digital Devil's Advocate** engine. It protects against false validation, confirmation bias, leading questions, polite praise, cherry-picked evidence, and overconfidence. This is the primary moat and is built early.

### 10.2 Core Objects

EvidenceItem, EvidenceQualityReview, BiasFlag, InterviewNote, SurveyResponse, ValidationSignal.

### 10.3 EvidenceItem Schema

```ts
type EvidenceItem = {
  id: string;
  projectId: string;
  sourceType:
    | "interview" | "survey" | "analytics" | "experiment_result"
    | "manual_note" | "sales_call" | "customer_message";
  sourceEntityId?: string;            // e.g. the ExperimentResult id, when auto-created
  summary: string;
  rawText?: string;
  relatedHypothesisId?: string;
  relatedExperimentId?: string;
  evidenceStrength: EvidenceStrength;  // weak | moderate | strong
  collectedByUserId?: string;
  collectedAt?: Date;
  createdAt: Date;
};
```

### 10.4 EvidenceQualityReview Schema

```ts
type EvidenceQualityReview = {
  id: string;
  projectId: string;
  sourceEntityType:
    | "interview" | "survey" | "experiment_result"
    | "manual_note" | "analytics_signal" | "sales_call";
  sourceEntityId: string;
  biasFlags: {
    type:
      | "leading_question" | "polite_praise" | "non_committal_interest"
      | "small_sample" | "cherry_picked_signal" | "founder_interpretation"
      | "confirmation_bias" | "sunk_cost_language" | "vanity_metric";
    severity: Severity;
    explanation: string;
  }[];
  adjustedEvidenceStrength: EvidenceStrength;
  recommendedDisconfirmationTest?: string;
  createdAt: Date;
};
```

### 10.5 Required Functions

Review evidence; flag leading questions; detect polite praise; distinguish interest from commitment; flag weak samples and vanity metrics; suggest disconfirming tests; adjust evidence strength; feed PMF Readiness and the Operating Brief.

### 10.6 Acceptance Criteria

* User can upload or paste evidence.
* AI reviews evidence for bias and outputs an adjusted strength.
* Bias flags are visible in experiment and hypothesis views.
* Weak evidence cannot automatically validate a high-risk hypothesis.
* Review output is structured and logged.

---

# Module 7: Experiment Design and Tracking

## 11. Experiment Design and Tracking

### 11.1 Purpose

Turns assumptions into disciplined validation activity. Every experiment has a hypothesis, method, surface/channel, metric, threshold, decision rule, evidence-quality review, result, and action.

### 11.2 Core Objects

Experiment, ExperimentVariant, ExperimentMetric, DecisionRule, ExperimentResult, EvidenceQualityReview, LearningLoop.

### 11.3 Experiment Schema

```ts
type Experiment = {
  id: string;
  projectId: string;
  hypothesisId: string;
  name: string;
  description?: string;
  experimentType:
    | "landing_page_test" | "message_test" | "cta_test" | "quiz_test"
    | "interview_test" | "survey_test" | "manual_validation";
  status:
    | "proposed" | "designed" | "ready" | "running"
    | "analyzing" | "decision_made" | "applied" | "stopped";
  ownerUserId?: string;
  primaryMetricId?: string;
  decisionRuleId?: string;
  evidenceQualityReviewId?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

### 11.4 Experiment State Machine

```txt
Proposed → Designed → Ready → Running → Analyzing → Decision Made → Applied
Running → Stopped
Analyzing → Inconclusive → Extended
```

### 11.5 Experiment Guardrails

Cannot start unless it has a linked hypothesis, primary metric, decision rule, owner, surface/method, and expected evidence source.

### 11.6 Acceptance Criteria

* User can create an experiment from a hypothesis.
* AI can suggest a design.
* Experiment cannot start without metric and decision rule.
* Experiment result creates a learning loop and an evidence item (Section 11A).
* Evidence quality affects final interpretation.

---

# Module 8: Experiment → Evidence Chain (new, explicit)

## 11A. The Result-to-Hypothesis Chain

### 11A.1 Why this is its own module

In v1.0 the pieces existed (`ExperimentResult`, `EvidenceItem`, `EvidenceQualityReview`, `Hypothesis.evidenceStrength`) but the spec never stated how a result becomes evidence and updates the hypothesis. That chain is the heart of the whole loop, so it is specified here as a first-class flow.

### 11A.2 The chain

```txt
ExperimentResult recorded
→ system auto-creates an EvidenceItem
    (sourceType = "experiment_result", sourceEntityId = result.id,
     relatedHypothesisId = experiment.hypothesisId)
→ EvidenceQualityReview runs (AI, then optional human)
→ adjustedEvidenceStrength is written back to the EvidenceItem
→ Hypothesis.evidenceStrength is recomputed from all linked evidence
→ Hypothesis.status may change (supported / weakened / invalidated)
→ PMF Readiness Lite is recalculated
→ a LearningLoop is opened
```

Steps from result to evidence item are automatic. The quality review is automatic for the AI pass; human confirmation is optional in the MVP but required before a high-risk hypothesis can reach `"supported"`.

### 11A.3 ExperimentResult Schema

```ts
type ExperimentResult = {
  id: string;
  experimentId: string;
  projectId: string;
  metricName: string;
  observedValue: number;
  threshold: number;
  metThreshold: boolean;
  decisionRuleOutcome: "supports" | "weakens" | "inconclusive";
  notes?: string;
  createdByUserId: string;
  createdAt: Date;
  // wiring (populated by the chain):
  generatedEvidenceItemId?: string;
  generatedLearningLoopId?: string;
};
```

### 11A.4 Hypothesis Evidence Strength Derivation (formula now defined)

A hypothesis aggregates the *adjusted* strength of all evidence items linked to it. Adjusted strength comes from the quality review, so bias is already priced in.

```txt
Map each linked EvidenceItem's adjustedEvidenceStrength to points:
  weak = 1, moderate = 2, strong = 3

evidenceCount  = number of linked evidence items
strengthSum    = sum of points across linked evidence

if evidenceCount == 0:        evidenceStrength = "none"
else:
  avg = strengthSum / evidenceCount
  if avg < 1.5:               evidenceStrength = "weak"
  else if avg < 2.5:          evidenceStrength = "moderate"
  else:                       evidenceStrength = "strong"

Sample-size guard:
  A hypothesis cannot be "strong" on fewer than 3 independent evidence items.
  If avg >= 2.5 but evidenceCount < 3, cap evidenceStrength at "moderate".
```

This guard is what enforces the acceptance criterion "weak evidence cannot automatically validate a high-risk hypothesis." One enthusiastic interview cannot make a hypothesis strong.

### 11A.5 Acceptance Criteria

* Recording an experiment result auto-creates a linked evidence item.
* The evidence item runs through quality review before affecting the hypothesis.
* Hypothesis `evidenceStrength` is computed by the formula above, never set manually for high-risk hypotheses.
* A learning loop is opened automatically from each result.
* PMF readiness recalculates after the hypothesis updates.

---

# Module 9: Experiment Surface Deployment — Landing Pages v1

## 12. Experiment Surface Deployment

### 12.1 Purpose

Deploys the first supported experiment surface: structured landing pages, presented as measurable validation surfaces connected to persona, offer, hypothesis, CTA, experiment, analytics, OKRs, and learning loops. (Governance linkage is present in the schema but the governance *workflow* is Track B; see Section 20A for the MVP rule.)

### 12.2 Future Surfaces

Interview guide, survey, qualification quiz, concierge test, fake-door test, pricing page, waitlist, prototype test. v1 supports landing pages first.

### 12.3 Core Objects

ExperimentSurface, LandingPage, LandingPageVersion, ContentBlock, CTA, Deployment, DomainConfig, PageAnalyticsConfig.

### 12.4 ExperimentSurface Schema

```ts
type ExperimentSurface = {
  id: string;
  projectId: string;
  experimentId?: string;
  surfaceType:
    | "landing_page" | "interview_guide" | "survey"
    | "qualification_quiz" | "fake_door" | "pricing_page";
  linkedEntityId: string;
  status: "draft" | "review" | "approved" | "live" | "measuring" | "archived";
  createdAt: Date;
  updatedAt: Date;
};
```

### 12.5 LandingPage Schema

```ts
type LandingPage = {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  domain?: string;
  personaId: string;                  // requires Module 4
  offerId: string;                    // requires Module 4
  hypothesisId?: string;
  experimentId?: string;
  journeyStage: "awareness" | "consideration" | "conversion" | "retention";
  status:
    | "draft" | "review" | "approved"
    | "deployed" | "measuring" | "iterating" | "archived";
  primaryCTAId?: string;
  currentVersionId?: string;
  analyticsConfigId?: string;
  governanceStatus: "not_required" | "pending" | "approved" | "blocked";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 12.6 Required Landing Page Blocks

Hero, Problem, Mechanism, Offer, Proof, FAQ, CTA, Trust/governance note.

### 12.7 Deployment Guardrails

A page cannot deploy to production unless: persona selected; offer selected; primary CTA configured; required analytics events configured; governance approved or `not_required` (per Section 20A rule); version snapshot exists; user has deployment permission.

### 12.8 Acceptance Criteria

* User can create a landing page from persona, offer, and hypothesis.
* User can preview and create a variant.
* User can deploy to preview.
* Production deployment is blocked if guardrails fail.
* Page analytics are visible from the page detail view.

---

# Module 10: Analytics and Instrumentation

## 13. Analytics and Instrumentation

### 13.1 Purpose

Ensures experiments produce usable evidence.

```txt
No dead instrumentation.
```

Any event, dashboard, or snapshot must have a proven source, storage path, query/projection, and UI consumer.

### 13.2 Required v1 Events

| Event             |                      Required |
| ----------------- | ----------------------------: |
| Page viewed       |                           Yes |
| CTA clicked       |                           Yes |
| Quiz started      |                If quiz exists |
| Quiz completed    |                If quiz exists |
| Form submitted    |                If form exists |
| Booking started   |         If booking CTA exists |
| Booking completed | If booking integration exists |
| Payment started   |                      Optional |
| Payment completed |                      Optional |

### 13.3 AnalyticsEvent Schema

```ts
type AnalyticsEvent = {
  id: string;
  projectId: string;
  eventName: string;
  eventType:
    | "page_view" | "cta_click" | "quiz_start" | "quiz_complete"
    | "form_submit" | "booking_start" | "booking_complete"
    | "payment_event" | "custom";
  anonymousId?: string;
  userId?: string;
  sessionId?: string;
  landingPageId?: string;
  ctaId?: string;
  experimentId?: string;
  variantId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
};
```

### 13.4 MetricSnapshot Schema

```ts
type MetricSnapshot = {
  id: string;
  projectId: string;
  metricName: string;
  metricType: "count" | "rate" | "ratio" | "score";
  value: number;
  periodStart: Date;
  periodEnd: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
  source: "analytics_event" | "manual" | "experiment" | "external";
  createdAt: Date;
};
```

### 13.5 Acceptance Criteria

* Page views and CTA clicks are recorded and linked to pages, CTAs, variants, experiments.
* Metric snapshots can be generated and consumed by experiments and PMF readiness.
* Dashboards do not display fake production metrics unless demo mode is active.

---

# Module 11: PMF Readiness Lite

## 17. PMF Readiness Lite

### 17.1 Purpose

Gives founder and advisor a simple, objective, explainable signal about whether the venture has enough validated evidence to move toward scaling. Not a statistical PMF engine; a lightweight readiness assessment.

### 17.2 Inputs

* Customer disappointment score, if available (Sean Ellis style "how would you feel if you could no longer use this," percent answering "very disappointed").
* Number of high-risk hypotheses.
* Number of unvalidated high-risk hypotheses.
* Evidence distortion coefficient (Section 17.6).
* Validation velocity (Section 17.4).
* Experiment results.

### 17.3 PMFReadinessAssessment Schema

```ts
type PMFReadinessAssessment = {
  id: string;
  projectId: string;
  customerDisappointmentScore?: number;     // 0..1, percent "very disappointed"
  totalHighRiskHypotheses: number;
  unvalidatedHighRiskHypotheses: number;
  evidenceDistortionCoefficient: number;    // 0..1, computed — Section 17.6
  validationVelocity?: number;              // loops closed per 2 weeks — Section 17.4
  pmfScore: number;                          // 0..1, computed — Section 17.5
  readinessState: "not_ready" | "emerging" | "strong_signal" | "scale_ready";
  explanation: string;
  blockingHypothesisIds: string[];          // which hypotheses hold the score down
  createdAt: Date;
};
```

### 17.4 Aggregation Inputs (defined)

These were used implicitly in v1.0 with no rule.

```txt
High-risk hypotheses = hypotheses whose latest HypothesisRiskRank has
  survivalCriticality in {high, critical}.

Unvalidated high-risk = high-risk hypotheses whose evidenceStrength is
  "none" or "weak".

Validation coverage = (high-risk hypotheses that are "moderate" or "strong")
  / (total high-risk hypotheses).   If no high-risk hypotheses exist, coverage = 0
  and readiness cannot exceed "emerging" (you have not yet found your risks).

Validation velocity = number of LearningLoops closed in the trailing 14 days.
```

### 17.5 `pmfScore` Formula (now defined)

The score answers: "Of the things that could kill this business, how many are supported by trustworthy evidence, and does the market signal back that up?" It is bounded 0..1.

```txt
Let:
  coverage  = validation coverage           (0..1, from 17.4)
  signal    = customerDisappointmentScore    (0..1; if missing, treat as 0
              and note in explanation that the survey is missing)
  distortion= evidenceDistortionCoefficient  (0..1, from 17.6)

Base score (evidence + market signal, weighted toward evidence coverage):
  base = (0.6 * coverage) + (0.4 * signal)

Distortion penalty (biased evidence pulls the score down):
  pmfScore = base * (1 - distortion)

Round to 2 decimals. Clamp to [0, 1].
```

Worked example: coverage 0.5, disappointment 0.4, distortion 0.2.
base = 0.6×0.5 + 0.4×0.4 = 0.30 + 0.16 = 0.46. pmfScore = 0.46 × 0.8 = **0.37**.

### 17.5.1 Readiness State Thresholds

| pmfScore | Readiness state | Meaning |
| --- | --- | --- |
| < 0.30 | Not Ready | Too many high-risk assumptions unvalidated. |
| 0.30 – 0.59 | Emerging | Some evidence, limited confidence. |
| 0.60 – 0.79 | Strong Signal | Multiple critical assumptions supported by moderate/strong evidence. |
| ≥ 0.80 | Scale Ready | Evidence quality, customer signal, and coverage strong enough to consider scaling. |

Hard rule: readiness cannot exceed **Emerging** while any high-risk hypothesis is `invalidated`, or while validation coverage is 0.

### 17.6 `evidenceDistortionCoefficient` Formula (now defined)

This was the most dangerous undefined value in v1.0: it sounds precise but had no derivation. It measures how much the project's evidence base is contaminated by bias, on a 0 (clean) to 1 (fully distorted) scale, computed from the bias flags already produced by the Digital Devil's Advocate.

```txt
Across all EvidenceQualityReviews for the project, weight each bias flag:
  severity low = 1, medium = 2, high = 3

flagWeightSum   = sum of severity weights across all flags
evidenceCount   = number of reviewed evidence items (min 1 to avoid div/0)

rawDistortion   = flagWeightSum / (evidenceCount * 3)
                  // denominator = the worst case: every item carries one
                  // high-severity flag. So rawDistortion is naturally 0..1+.

evidenceDistortionCoefficient = min(1, round(rawDistortion, 2))
```

Interpretation: a project where reviewed evidence carries few or low-severity flags trends toward 0; a project riddled with high-severity leading-question and polite-praise flags trends toward 1, and that directly suppresses `pmfScore`. This makes "weak or biased evidence reduces readiness" a computable, testable statement rather than a slogan.

### 17.7 Acceptance Criteria

* PMF Readiness is generated from current hypothesis and evidence state using the formulas above.
* `pmfScore`, `evidenceDistortionCoefficient`, and coverage are all reproducible from stored data (no hidden inputs).
* PMF score is visible in the Command Center and explains what is missing.
* Biased evidence measurably lowers the score via the distortion coefficient.
* `blockingHypothesisIds` lists the high-risk, unvalidated hypotheses holding the score down.

---

# Module 12: Learning Loops

## 16. Learning Loops

### 16.1 Purpose

Closes the validation system.

```txt
Outcome → Insight → Action → Measurement
```

### 16.2 LearningLoop Schema

```ts
type LearningLoop = {
  id: string;
  projectId: string;
  sourceEntityType:
    | "experiment" | "landing_page" | "analytics_signal"
    | "okr" | "manual_observation" | "evidence_quality_review";
  sourceEntityId?: string;
  outcomeSummary: string;
  insight: string;
  targetEntityType:
    | "persona" | "offer" | "landing_page" | "cta"
    | "content_block" | "experiment" | "hypothesis" | "okr";
  targetEntityId?: string;
  actionTaken?: string;
  measurementPlan?: string;
  status: "open" | "action_defined" | "applied" | "measuring" | "closed";
  ownerUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
};
```

### 16.3 Acceptance Criteria

* User can create a loop from an experiment result or evidence-quality review.
* A loop is opened automatically by the experiment→evidence chain (11A.2).
* A loop cannot close without an action and a measurement plan.
* Closed loops appear in project history.
* Loops can update hypothesis confidence, offer status, or PMF readiness.

---

# Module 13: Progress Command Center

## 14. Progress Command Center

### 14.1 Purpose

The main daily interface. It answers: What is the riskiest assumption? What is being tested? What evidence changed? What needs attention? What goal is affected? Who owns the next action? What should happen next?

### 14.2 Required Widgets (Track A)

1. Operating Brief
2. Riskiest Hypotheses
3. Evidence Quality Alerts
4. Active Experiments
5. Experiment Surfaces
6. PMF Readiness
7. Attention Queue
8. Learning Loops
9. Recent Decisions

(OKR Health, Governance Blockers, and Role Workbenches widgets are added with their Track B modules.)

### 14.3 ProgressTrack Schema

```ts
type ProgressTrack = {
  id: string;
  projectId: string;
  name: string;
  type: "strategic" | "validation" | "conversion" | "experimentation" | "operations" | "governance";
  description?: string;
  health: "healthy" | "at_risk" | "blocked" | "unknown";
  completionScore: number;
  currentFocus?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 14.4 Acceptance Criteria

* Command Center displays top-risk hypotheses, active experiments, PMF readiness, evidence-quality alerts, and next best action.
* First-time tour points to the major Command Center areas.

---

# Module 14: AI Assistance and Structured Output Contracts

## 21. AI Assistance

### 21.1 AI Principles

AI is a structured reasoning layer that writes into typed business objects, not a generic chat layer.

AI may: deconstruct concepts; generate hypotheses; rank risks; design experiments; draft landing page copy; review evidence quality; flag bias; summarize operations; synthesize learning loops; explain PMF readiness.

AI must not: deploy pages without approval; approve governance without permission; make irreversible changes; create untyped blobs; access unrelated project data; bypass authorization.

### 21.1A Non-Blocking AI Enrichment (architectural rule)

AI calls at the route level must never gate the core action. The system must not fail because inference is unavailable, slow, or returns malformed output. Every route that uses AI follows this structure:

1. **Execute the core action first** (create the experiment, save the MVV, close the learning loop).
2. **Try AI enrichment in a separate try/catch block.** On any failure, fall back to the deterministic mock provider (Section 21.6).
3. **Return the core result with optional AI enrichment attached.** The enrichment field (`aiDesign`, `aiCopy`, `aiBrief`, etc.) is advisory — consumers treat it as optional.

```txt
Core action succeeds → AI enrichment attempted → enrichment attached or null
└─ AI unavailable → core action still succeeds, enrichment is null
```

This rule prevents AI outages from becoming application outages.

### 21.1B Provider-Agnostic Integration

The system's AI inference layer uses plain HTTP requests against any OpenAI-compatible Chat Completions endpoint (`POST /v1/chat/completions`). No provider-specific SDKs are required. The implementation is configured via three environment variables:

```txt
INFERENCE_API_KEY=sk-...          # provider API key
INFERENCE_BASE_URL=https://...    # defaults to https://api.openai.com/v1
INFERENCE_MODEL=gpt-4o            # any model the endpoint supports
```

The `AIProvider` interface (Section 24.1) is the sole contract. Swapping the provider requires zero code changes — only env var changes. The same structured output contracts (Sections 21.3–21.5) apply regardless of which provider processes them. Because every major inference provider now speaks the same protocol, the integration point is the protocol, not any vendor's library.

### 21.1C Structured Output Strategy

The inference adapter auto-negotiates structured output based on provider capabilities, falling back through three tiers:

1. **`response_format`** — OpenAI-native JSON schema enforcement. Used by OpenAI, Groq, Together, Fireworks, LiteLLM.
2. **`tool_use`** — Function-calling with `tool_choice: { type: "function" }`. Used by Anthropic compat endpoints.
3. **`json_parse`** — Prompt-enforced JSON with Zod validation on the parsed response text. Universal fallback for Ollama, vLLM, and any provider without native structured output support.

The tier auto-advances: if the configured mode fails, the adapter tries the next fallback. All three paths converge on Zod validation against the same output schema (Sections 21.3–21.5). This means any provider capable of returning well-formed JSON can drive the AI layer, regardless of whether it natively supports structured output.

### 21.1D Mock AI Provider (Demo / Dev Mode)

When no inference credentials are configured, the system uses a deterministic `MockAIProvider` (`src/lib/ai/mock-provider.ts`). The mock returns domain-appropriate, statically-defined data with the following characteristics:

- **Concept deconstruction:** 5 fixed assumptions with realistic risk levels, 5 hypotheses across all three types, a suggested persona and offer, and 3 recommended next actions.
- **Evidence quality review:** Heuristic bias detection (text length → small_sample, positive language → polite_praise, non-committal language → non_committal_interest, first-person interpretation → founder_interpretation). Bias flag count maps to adjusted evidence strength.
- **All other methods:** Return reasonable templates that interpolate input strings into structured output matching the AI output contracts (Sections 21.3–21.5).

The mock provider satisfies the "AI must not block" rule by construction: it never fails, never hits rate limits, and returns instantly. It is the default provider when `INFERENCE_API_KEY` is unset, making the full application usable in development and demo mode without any AI credentials. When real inference credentials are provided, the mock is bypassed entirely — but remains available as the fallback if the real provider fails.

The mock is intentionally non-compliant with certain visual guidelines (§38.7) that require confidence scores, uncertainty quantification, and evidence references — capabilities that only real introspective AI can provide. Section 47.3 defines the UI treatment for mock vs real AI states.

### 21.2 Required AI Chains (Track A)

1. Concept Deconstruction
2. MVV Clarification
3. Hypothesis Generation
4. Risk Ranking
5. Experiment Design
6. Evidence Quality Review
7. Landing Page Copy
8. Operating Brief
9. Learning Loop Synthesis
10. PMF Readiness Explanation

(Governance Review chain is Track B.)

### 21.3 Concept Deconstruction Output

```ts
type ConceptDeconstructionOutput = {
  summary: string;
  assumptions: {
    statement: string;
    category: string;
    riskLevel: RiskLevel;
  }[];
  hypotheses: {
    title: string;
    statement: string;
    type: "desirability" | "viability" | "feasibility";
    survivalCriticality: RiskLevel;
    recommendedFirstTest: string;
  }[];
  suggestedPersona?: { name: string; primaryPain: string };   // feeds Module 4
  suggestedOffer?: { name: string; valueProposition: string };// feeds Module 4
  suggestedNextActions: string[];
};
```

### 21.4 Evidence Quality Review Output

```ts
type EvidenceQualityReviewOutput = {
  adjustedEvidenceStrength: EvidenceStrength;   // weak | moderate | strong
  biasFlags: {
    type: string;
    severity: Severity;
    explanation: string;
  }[];
  recommendedDisconfirmationTest?: string;
  interpretation: string;
};
```

### 21.5 PMF Readiness Explanation Output

```ts
type PMFReadinessExplanationOutput = {
  readinessState: "not_ready" | "emerging" | "strong_signal" | "scale_ready";
  score: number;                       // matches pmfScore
  distortion: number;                  // matches evidenceDistortionCoefficient
  coverage: number;                    // validation coverage
  explanation: string;
  blockingHypotheses: string[];
  evidenceWeaknesses: string[];
  recommendedNextActions: string[];
};
```

### 21.6 AI Logging

Every AI call logs: project ID; user ID; function type; input summary; model; prompt version; output schema version; validation status; latency; token usage if available; estimated cost if available; output entity type; output entity ID if created.

---

# Track B — Platform Extensions (Deferred Modules)

These are specified for completeness but are not part of the Core Loop MVP and not in the Definition of Done.

## 15. Full OKRs and Operations Awareness (Track B)

Objectives and KeyResults link validation work to business goals. Schemas unchanged from v1.0 (`Objective`, `KeyResult`). In the MVP, validation-oriented goals are tracked informally via PMF readiness and learning loops; the full OKR module is added in Track B with the OKR Health widget.

## 16B. Role-Based Workbenches (Track B)

Founder, Strategist/Coach, Conversion Operator, Governance Reviewer, and Advisor workbenches. Deferred. The MVP ships a single founder-oriented Command Center.

## 17B. Advisor / Coach Portfolio View (Track B)

### 19.x Per-project aggregation (defined for when this is built)

The portfolio's single `evidenceStrength` per project uses the same derivation as a hypothesis (11A.4) but across the project's high-risk hypotheses: average their strength points and bucket the result, with the same 3-item guard before a project can read "strong." `biasRisk` buckets from `evidenceDistortionCoefficient`: <0.2 low, 0.2–0.5 medium, >0.5 high.

```ts
type AdvisorPortfolioItem = {
  projectId: string;
  projectName: string;
  currentStage: string;
  riskiestHypothesisId?: string;
  activeExperimentId?: string;
  evidenceStrength: HypothesisEvidenceStrength;
  biasRisk: "low" | "medium" | "high" | "unknown";
  pmfReadinessState: "not_ready" | "emerging" | "strong_signal" | "scale_ready";
  validationVelocity?: number;
  needsReview: boolean;
};
```

## 18. Governance Review (Track B workflow)

### 20A. MVP governance rule (closes the v1.0 bypass)

In v1.0 a Conversion Operator could deploy any page whose `governanceStatus` was `not_required`, but nothing said who could set that value. The rule:

* In the **Core Loop MVP**, `governanceStatus` defaults to `not_required` only for pages flagged by the AI copy chain as containing **no** risk-bearing claims (health, income, guarantees, regulated terms). Any page the AI flags is set to `pending` and **cannot** be set to `not_required` by a non-owner.
* Only the **project owner** may override a `pending` page to `not_required`, and the override is logged in the audit trail.
* The full reviewer-queue workflow (`GovernanceReview` object, reviewer roles, blocking flow) is Track B.

```ts
type GovernanceReview = {
  id: string;
  projectId: string;
  targetEntityType: "landing_page" | "content_block" | "cta" | "offer";
  targetEntityId: string;
  status: "pending" | "approved" | "needs_revision" | "blocked";
  flaggedClaims: {
    text: string;
    severity: Severity;
    issue: string;
    recommendedRewrite?: string;
  }[];
  reviewedByUserId?: string;
  createdAt: Date;
  reviewedAt?: Date;
};
```

## 19A. PivotDelta Versioning (Track B)

`PivotDelta` records strategic change over time. Deferred; hypothesis versioning (Module 5) covers per-hypothesis history in the MVP.

```ts
type PivotDelta = {
  id: string;
  projectId: string;
  beforeSnapshotId?: string;
  afterSnapshotId?: string;
  changedEntities: { entityType: string; entityId: string; changeSummary: string }[];
  rationale: string;
  evidenceIds: string[];
  createdByUserId: string;
  createdAt: Date;
};
```

---

# 22. API Surface (Core Loop MVP)

Track B endpoints (`/api/advisor/*`, full `/api/projects/:id/objectives`, governance queue) are added with their modules.

## 22.1 Concept Intake

```txt
POST   /api/projects/:projectId/concept-intakes
GET    /api/projects/:projectId/concept-intakes
POST   /api/concept-intakes/:conceptIntakeId/deconstruct
POST   /api/concept-intakes/:conceptIntakeId/accept-hypotheses
```

## 22.2 Onboarding Tour

```txt
GET    /api/users/me/onboarding
PATCH  /api/users/me/onboarding
POST   /api/users/me/onboarding/main-tour/complete
POST   /api/users/me/onboarding/main-tour/skip
POST   /api/users/me/onboarding/main-tour/reset
```

## 22.3 Project, Persona, Offer

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId

GET    /api/projects/:projectId/personas
POST   /api/projects/:projectId/personas
GET    /api/projects/:projectId/offers
POST   /api/projects/:projectId/offers
```

## 22.4 Hypotheses

```txt
GET    /api/projects/:projectId/hypotheses
POST   /api/projects/:projectId/hypotheses
GET    /api/hypotheses/:hypothesisId
PATCH  /api/hypotheses/:hypothesisId
GET    /api/hypotheses/:hypothesisId/versions
POST   /api/hypotheses/:hypothesisId/risk-rank
```

## 22.5 Bias and Evidence

```txt
POST   /api/projects/:projectId/evidence
GET    /api/projects/:projectId/evidence
POST   /api/evidence/:evidenceId/quality-review
GET    /api/evidence/:evidenceId/quality-review
```

## 22.6 Experiments and the Chain

```txt
GET    /api/projects/:projectId/experiments
POST   /api/projects/:projectId/experiments
PATCH  /api/experiments/:experimentId
POST   /api/experiments/:experimentId/start
POST   /api/experiments/:experimentId/results   // triggers the 11A chain
POST   /api/experiments/:experimentId/decision
```

## 22.7 Experiment Surfaces and Landing Pages

```txt
GET    /api/projects/:projectId/experiment-surfaces
POST   /api/projects/:projectId/experiment-surfaces

GET    /api/projects/:projectId/landing-pages
POST   /api/projects/:projectId/landing-pages
GET    /api/landing-pages/:landingPageId
PATCH  /api/landing-pages/:landingPageId
POST   /api/landing-pages/:landingPageId/versions
POST   /api/landing-pages/:landingPageId/preview
POST   /api/landing-pages/:landingPageId/deploy
POST   /api/landing-pages/:landingPageId/rollback
POST   /api/landing-pages/:landingPageId/archive
```

## 22.8 Analytics

```txt
POST   /api/events
GET    /api/projects/:projectId/analytics/summary
GET    /api/landing-pages/:landingPageId/analytics
GET    /api/experiments/:experimentId/metrics
POST   /api/projects/:projectId/metric-snapshots
```

## 22.9 PMF Readiness and Learning Loops

```txt
GET    /api/projects/:projectId/pmf-readiness
POST   /api/projects/:projectId/pmf-readiness/assess

GET    /api/projects/:projectId/learning-loops
POST   /api/projects/:projectId/learning-loops
PATCH  /api/learning-loops/:learningLoopId
POST   /api/learning-loops/:learningLoopId/close
```

## 22.10 AI

```txt
POST /api/ai/concept-deconstruction
POST /api/ai/mvv-clarification
POST /api/ai/hypothesis-generation
POST /api/ai/risk-ranking
POST /api/ai/experiment-design
POST /api/ai/evidence-quality-review
POST /api/ai/landing-page-copy
POST /api/ai/operating-brief
POST /api/ai/learning-loop-synthesis
POST /api/ai/pmf-readiness
```

---

# 23. Permissions (Core Loop MVP)

The MVP ships with project Owner and Member roles only; the full five-role matrix arrives with Track B workbenches. The v1.0 governance bypass is closed by Section 20A.

| Action | Owner | Member |
| --- | ---: | ---: |
| View project | Yes | Assigned |
| Create concept intake | Yes | Yes |
| Edit MVV | Yes | Suggest |
| Create persona / offer | Yes | Yes |
| Create hypothesis | Yes | Yes |
| Review evidence quality | Yes | Yes |
| Create experiment | Yes | Yes |
| Start experiment | Yes | Yes |
| Record experiment result | Yes | Yes |
| Create landing page | Yes | Yes |
| Deploy landing page | Yes | Yes (only if governance approved or `not_required`) |
| Set page `not_required` | Yes | No |
| Create learning loop | Yes | Yes |
| Delete project | Yes | No |

The full five-role matrix (Founder, Strategist, Conversion Operator, Governance Reviewer, Advisor) from v1.0 is retained for Track B and unchanged except that "Deploy landing page" for the Conversion Operator is now conditioned on the Section 20A governance rule.

---

# 24. Technical Architecture

### 24.1 Recommended Stack

| Layer        | Choice                                            |
| ------------ | ------------------------------------------------- |
| Frontend     | Next.js App Router, TypeScript                    |
| UI           | Tailwind CSS, Shadcn/ui                           |
| Server state | TanStack Query                                    |
| Client state | Zustand                                           |
| Backend      | Next.js Route Handlers                            |
| Database     | PostgreSQL                                        |
| ORM          | Prisma                                            |
| AI           | Provider-agnostic adapter, initially Claude       |
| Analytics    | Internal event table first, optional Umami bridge |
| Testing      | Vitest, Playwright, MSW                           |
| Auth         | Auth.js                                           |

### 24.2 Canonical Module Homes

```txt
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    onboarding/
    command-center/
    personas-offers/
    hypotheses/
    evidence/
    experiments/
    experiment-surfaces/
    landing-pages/
    analytics/
    learning-loops/
    pmf-readiness/
    // track B:
    okrs/
    governance/
    advisor/
  lib/
    ai/
      chains/
      prompts/
      schemas/
      providers/
    bmi/
      concept-intake/
      mvv/
      personas-offers/
      hypotheses/
      evidence-quality/
      experiments/
      experiment-evidence-chain/
      experiment-surfaces/
      landing-pages/
      analytics/
      pmf-readiness/
      learning-loops/
      progress/
      state-machines/
      // track B:
      okrs/
      governance/
      advisor/
      pivot-deltas/
    db/
      schema.prisma
      demo-data.ts
      gst-demo-data.ts
    auth/
    security/
    observability/
```

---

# 25. Implementation Plan (Core Loop MVP)

The build is reduced to six phases. Track B phases follow only after Phase 6 runs end to end with GST Body.

## Phase 1: Foundation and Project Access

Build: Auth; project creation; project membership; Owner/Member permissions; dashboard shell; GST demo seed; audit logging.
Done when: user can sign in, create a project, enter GST demo; unauthorized access blocked.

## Phase 2: Concept Intake, Persona/Offer, First-Time Tour

Build: Concept Intake form; AI deconstruction; assumption extraction; hypothesis generation; risk ranking (with the 6.6 formula); draft Persona/Offer suggestion and acceptance; first-time tour; onboarding persistence.
Done when: user enters a raw idea and receives ranked hypotheses plus a draft persona and offer; top risks appear in the dashboard; first-time tour works.

## Phase 3: Hypothesis Database and Bias/Evidence Engine

Build: Hypothesis CRUD and versioning; risk ranking; evidence upload/paste; EvidenceItem; EvidenceQualityReview; bias flags; adjusted strength; disconfirmation recommendation.
Done when: evidence can be reviewed for bias; flags appear in hypothesis/experiment views; weak evidence cannot validate a high-risk hypothesis (3-item guard enforced).

## Phase 4: Experiments and the Result-to-Hypothesis Chain

Build: Experiment CRUD; metrics; decision rules; ExperimentResult; the 11A chain (auto evidence item, auto quality review, hypothesis strength recompute, auto learning loop); AI experiment design; state machine.
Done when: recording a result auto-creates linked evidence, recomputes hypothesis strength by the 11A.4 formula, and opens a learning loop.

## Phase 5: Landing Pages, Analytics, PMF Readiness Lite

Build: ExperimentSurface and LandingPage CRUD; content blocks; CTA; preview; version snapshots; deployment guardrails with the 20A governance rule; analytics events; metric snapshots; PMF Readiness Lite with the 17.5 and 17.6 formulas; PMF widget.
Done when: a page deploys only when guardrails pass; events are stored and consumed; PMF score is reproducible from stored data and shows blockers.

## Phase 6: Command Center, Learning Loops, Hardening

Build: Command Center widgets (Track A set); attention queue; operating brief; learning-loop close flow; Playwright critical path; accessibility review.
Done when: Command Center shows top risk, experiments, evidence alerts, PMF readiness, and next best action; loops close with action and measurement; critical e2e path passes; tour is accessible.

## Track B Phases (post-MVP)

7. Full OKRs and OKR Health widget. 8. Role workbenches. 9. Advisor portfolio. 10. Full governance workflow. 11. PivotDelta versioning.

---

# 26. Critical MVP User Journey

1. Founder signs in.
2. Founder creates a project or opens GST demo.
3. Founder enters raw business idea.
4. AI deconstructs idea into assumptions and drafts a persona and offer.
5. AI generates and ranks hypotheses (6.6 formula).
6. First-time tour explains the Command Center.
7. Founder reviews top-risk hypothesis.
8. Founder creates an experiment; AI suggests a design.
9. Founder creates a landing page from persona, offer, and hypothesis.
10. Founder configures CTA and required events; AI copy chain sets governance status.
11. Page deploys (owner clears any flagged claims per 20A).
12. Analytics events are recorded.
13. Founder records the experiment result.
14. The 11A chain creates evidence, runs quality review, recomputes hypothesis strength, opens a learning loop.
15. PMF Readiness Lite updates with a reproducible score and named blockers.
16. Founder closes the learning loop with an action and measurement plan.

---

# 27. Definition of Done — Core Loop MVP

The MVP is complete when:

1. Users can create a project.
2. Users can enter a raw concept and receive structured assumptions.
3. Users can generate and rank hypotheses using the defined formula.
4. Hypotheses are versioned.
5. Users can create a minimal Persona and Offer.
6. Users can review evidence quality and bias flags.
7. Users can create disciplined experiments with metric and decision rule.
8. Recording an experiment result auto-creates evidence, runs quality review, and recomputes hypothesis strength (the 11A chain).
9. Landing pages exist as v1 experiment surfaces and can be instrumented.
10. Required analytics events are stored and consumed.
11. PMF Readiness Lite is calculated by the 17.5/17.6 formulas and is fully reproducible from stored data.
12. Biased evidence measurably lowers the PMF score.
13. Learning loops can be created and closed with action and measurement.
14. Command Center shows top risks, experiments, evidence quality, PMF readiness, and next actions.
15. First-time users receive a guided tour of the Command Center.
16. AI outputs are structured, validated, and logged.
17. Authorization is enforced server-side.
18. The Section 20A governance rule prevents claim-bearing pages from deploying without owner clearance.
19. GST Body demo data is available but isolated.
20. Critical Playwright path passes.
21. No production dashboard uses unwired fake metrics.
22. The product demonstrates the full loop from unstructured idea to validated learning and a readiness signal.

Track B features (role workbenches, advisor portfolio, full OKRs, full governance workflow, pivot versioning) are explicitly **not** required for Done.

---

# 28. North Star

The MVP succeeds if it proves this:

```txt
A founder can turn an unstructured business idea into ranked hypotheses,
bias-checked evidence, deployed experiments, and an objective, reproducible
readiness signal before wasting capital on premature scaling.
```

The platform makes validation visible, disciplined, evidence-based, and operationally actionable. Every number it shows a founder, especially the PMF score, can be traced back to stored evidence and a defined formula.

---
---

# PART II — UI AND VISUAL SYSTEM

> Part II adapts the BMI Platform UI Visual Guidelines to this specification. It is organized to mirror Part I: foundations first (intent, modes, principles, layout, color, type, texture, tokens), then component guidance in module order, then cross-cutting concerns (status, accessibility, interaction, copy, success criteria). Every component section names the Part I module and formula it renders.

## 29. Design Intent

The interface should communicate trust, clarity, scientific discipline, operational momentum, and structured transformation. It should not feel like a generic SaaS dashboard; it should feel like a **validation engine** that turns founder ambiguity into tested, bias-checked, operationally actionable business architecture.

The visual character combines modern SaaS usability, scientific instrumentation, blueprint-like structure, engineering discipline, evidence-based decision support, calm operational dashboards, and visible guardrails and hard stops.

### 29.1 Core Visual Metaphor

The interface visually expresses one transformation:

```txt
Chaos → Structure → Test → Evidence → Readiness → Action
```

This maps directly to the SE-CCM spine (§1.3) and the core loop (§1.4). Unstructured scribbles resolve into structured blocks and validation machinery. Use the metaphor in onboarding, concept intake (§6), hypothesis deconstruction, dashboard empty states, AI deconstruction states, and learning-loop summaries (§16).

### 29.2 Desired Feeling

Should feel: rigorous, architectural, scientific, calm, operational, evidence-first, technical but readable, trustworthy, slightly industrial, founder-friendly.

Should not feel: playful, decorative, overly soft, academic and inert, like a generic analytics tool, like a Kanban board, like a spreadsheet, like a pitch deck pasted into software.

---

## 30. Two Visual Modes

The product supports two related but distinct visual modes. This distinction is the most important rule in Part II: **the engine aesthetic is a signature explanatory layer, not a replacement for everyday usability.** Do not make every operational screen look like a slideshow.

### 30.1 Mode A — Operational UI

For daily work. Clean cards, white surfaces, subtle shadows, readable tables, compact status badges, minimal decorative texture.

Used in: Command Center (§14), experiments (§11), evidence review (§10), landing pages (§12), and the Track B surfaces when built (OKRs, advisor portfolio).

### 30.2 Mode B — Engine / Explanation UI

For explaining how the system thinks. Blueprint grids, circuit traces, dark navy core blocks, arrows, gauges, lock/key visuals, system rules, structured diagrams.

Used in: onboarding and first-time tour (§7), concept intake (§6), PMF readiness explanation (§17), evidence-quality education (§10), empty states, and "why this matters" panels.

---

## 31. Aesthetic System

The slideshow introduced a visual language that enriches the product UI. Each motif below has a defined product use and a restraint rule.

### 31.1 Blueprint Grid Backgrounds

Subtle grid textures in strategic or system-level screens. Use sparingly behind onboarding, concept intake, PMF readiness, and Command Center hero areas. Never behind dense tables or text-heavy forms.

| UI Area | Use Grid? |
| --- | ---: |
| Concept Intake | Yes |
| Onboarding tour | Lightly |
| Command Center background | Subtle |
| PMF Readiness | Yes |
| Experiment Designer | Lightly |
| Data tables | No |
| Long forms | No |
| Mobile screens | Very subtle or none |

### 31.2 Circuit Trace Motifs

Faint circuit traces as background accents in AI, evidence, and instrumentation modules; small circuit-line connectors between related objects. Use them to visually connect the chain hypothesis → experiment → evidence → learning loop (this is the visual form of §11A). They should imply data flow and wiring, never noisy decoration.

### 31.3 Dark Navy Engine Blocks

Deep navy for primary engine states, critical system panels, final readiness output, the active loop step, the AI deconstruction processor, validation-spine labels, and locked or authoritative rule panels. Dark navy signals "core engine" or "system authority." Do not use it for ordinary cards.

### 31.4 Cyan Glow / Instrumentation Accent

Cyan accents for active instrumentation, AI processing, system wiring, evidence flow, and the selected node in a validation loop. Keep it subtle: it is an active-state indicator, not general decoration. Avoid high-neon effects in dense dashboards.

### 31.5 Industrial Frames and Hard-Rule Boxes

Thick outlined boxes and hard-rule callouts for deployment guardrails (§12.7), evidence validation rules (§10), PMF readiness constraints (§17.5.1), the governance rule (§20A), and experiment launch requirements (§11.5). Rule boxes should look more authoritative than normal helper text.

```txt
Hard Rule:
Weak evidence cannot automatically validate a high-risk hypothesis.
```

### 31.6 Mechanical Step Flows

Arrows, chevrons, mechanical chains, and phase flows for the result-to-hypothesis chain (§11A), onboarding, experiment lifecycle, learning loops, and the validation spine.

```txt
Concept Intake → Ranked Hypotheses → Experiment Design → Bias-Checked Evidence → PMF Signal
```

```txt
Outcome → Evidence Item → Quality Review → Hypothesis Strength → Learning Loop
```

### 31.7 Gauges and Readiness Dials

Gauges for PMF readiness (§17), adjusted evidence strength (§10.4), confidence, and validation coverage (§17.4). Always pair a gauge with a label and explanation; never show a gauge without source evidence; use the four threshold zones Not Ready / Emerging / Strong Signal / Scale Ready (§17.5.1).

### 31.8 Lock and Key Governance Metaphor

Locks, gates, and keys for governance blockers, deployment guardrails, claim-bearing pages, owner-only overrides, and audit-logged bypasses (all from §20A and §12.7).

```txt
Deployment locked: governance approval required.
Owner override available. All bypasses are audit-logged.
```

### 31.9 Layered Moat / Stack Diagrams

Layered slabs for the structural moats (§1.5), in moat priority order: Digital Devil's Advocate, Hypothesis Database, PMF Readiness Lite, Experiment Surface Deployment, Programmatic Validation Gates. Use in onboarding, education, and help docs. In daily UI, convert the stack into compact status panels rather than large illustrations.

---

## 32. Core Design Principles

### 32.1 Evidence First

Every major recommendation, score, status, or next action is grounded in visible evidence.

```txt
Avoid:  AI recommends changing the offer.

Prefer: AI recommends testing the pricing message because:
        - CTA click rate is below target.
        - Two interviews show pricing confusion.
        - Evidence quality is currently moderate.
```

### 32.2 Explainable AI

AI outputs always show recommendation, rationale, evidence source, confidence, affected object, and next action. Affordances: Why this matters, Show evidence, View recommendation, Create experiment, Review bias flags, Inspect rule. This is the UI expression of the AI output contracts in §21.

### 32.3 Bias-Aware Design

The UI actively prevents mistaking weak signals for validation. Evidence, interviews, and results show evidence strength, confidence, bias flags, adjusted rating, and the recommended disconfirmation test (rendering §10.4 and the §11A.4 derivation).

### 32.4 Programmatic Guardrails

The interface visibly enforces hard constraints as lock states, hard-rule boxes, disabled-action explanations, deployment checklists, and validation gates.

```txt
An experiment cannot launch if any required parameter is missing.
Weak evidence cannot automatically validate a high-risk hypothesis.
Claim-bearing pages cannot deploy without owner clearance.
```

### 32.5 Actionable Next Steps

Every dashboard section leads to a clear action.

| Signal | Action |
| --- | --- |
| High-risk hypothesis | Create experiment |
| Weak evidence | Run disconfirmation test |
| Governance blocker | Review flagged claim |
| PMF readiness blocker | Validate top-risk assumption |
| Learning loop open | Define action and measurement plan |
| OKR off track (Track B) | Open related experiment |

---

## 33. Layout System

### 33.1 General Structure

Operational screens use a modular dashboard layout:

```txt
Left navigation / context rail
Main dashboard canvas
Right-side detail or action drawer
```

Strategic or explanatory screens use a blueprint-canvas layout:

```txt
Large heading
System diagram or engine panel
Rule callout
Action button
Supporting evidence or next step
```

### 33.2 Card and Panel Treatment

**Standard Cards** (daily UI): white background, light border, subtle shadow, rounded corners, compact metadata, one primary action.

**Engine Panels** (system explanations): dark navy fill or border, thicker outline, slight cyan accent glow, stronger title, rule-like copy, optional circuit/grid background.

**Hard-Stop Panels** (blockers): visible lock icon, strong outline, muted red or bronze accent, clear rule statement, explanation of how to unlock.

### 33.3 Flow Layouts

Use visual flows where the user must understand a system transformation:

```txt
Unstructured idea → AI deconstruction → structured assumptions
Hypothesis → experiment → result → evidence quality → hypothesis strength
Outcome → insight → action → measurement
Not Ready → Emerging → Strong Signal → Scale Ready
```

---

## 34. Color System

### 34.1 Primary Palette

| Role | Color Direction |
| --- | --- |
| Primary navy | Deep midnight navy |
| Engine navy | Dark blue-black |
| Blueprint background | Pale blue-gray |
| Grid line | Very light gray-blue |
| Circuit accent | Cool cyan |
| Primary action | Indigo / blue |
| Evidence good | Teal / green |
| Watch state | Amber / bronze |
| Critical state | Muted red |
| Disabled / deferred | Gray |
| Surface | White or very pale blue |

### 34.2 Signature Color Roles

* **Dark navy** — core engine blocks, validation spine, active phase, authoritative rule, final readiness output.
* **Cyan** — active instrumentation, AI processing, connected data flow, selected nodes, live experiment wiring.
* **Bronze / amber** — warnings, hard stops, risk-bearing claims, evidence distortion (§17.6), "watch" state.
* **Pale blueprint blue** — system diagrams, background canvas, explanatory modules, onboarding.

### 34.3 Semantic Color Rules

Never rely on color alone. Every status includes a label, an icon, an explanation, and an optional tooltip.

```txt
High risk / Blocker
Medium risk / Watch
Low risk / On track
Info / Neutral
```

---

## 35. Typography

### 35.1 Character

Modern sans-serif; technical but human; high x-height; strong numeric readability; crisp labels; restrained display moments.

### 35.2 Heading Treatment

Large confident titles for strategic pages ("The Progress Command Center," "The Digital Devil's Advocate," "The Hypothesis Risk Matrix," "The Result-to-Hypothesis Chain"); shorter titles in operational UI ("Evidence Quality," "PMF Readiness," "Active Experiments," "Top-Risk Hypotheses").

### 35.3 Emphasis

Bold the concept, not the whole sentence.

```txt
Good:  Hard Rule: Readiness cannot exceed Emerging while a high-risk hypothesis remains unvalidated.
Avoid: READINESS CANNOT EXCEED EMERGING WHILE A HIGH-RISK HYPOTHESIS REMAINS UNVALIDATED.
```

### 35.4 Spaced Technical Labels

Letter-spaced labels sparingly, for system category labels, diagram captions, and architecture explanations only ("CORE LOOP MVP," "VALIDATION ENGINE," "EVIDENCE QUALITY"). Not for normal dashboard labels.

---

## 36. Grid, Texture, and Background Rules

### 36.1 Blueprint Grid

```txt
background: pale blue-gray or off-white
grid opacity: very low
grid spacing: 16px or 24px
line weight: 1px
```

Never high-contrast grid lines behind body text.

### 36.2 Circuit Pattern

Low-opacity background accents in top-right corners, empty states, AI processing modules, PMF readiness panels, and evidence engine panels. Never behind dense forms, tables, or small text.

### 36.3 Technical Glow

Cyan glow only for active wiring or current processing (active AI deconstruction, live analytics connected, current experiment running, selected validation node). Never glowing every card, decorative neon, or glow behind large text.

---

## 37. Iconography and Metaphors

### 37.1 Core Icon Set

| Concept | Icon Direction |
| --- | --- |
| Hypothesis | Ranked number / matrix point |
| Evidence | Shield / document |
| Bias | Flag / warning marker |
| Experiment | Flask / circuit node |
| PMF readiness | Gauge |
| Validation gate | Lock / gate |
| Governance | Key / shield |
| Learning loop | Circular arrows |
| AI deconstruction | Processor / chip |
| Deployment | Surface / window / launch |
| Guardrail | Lock / hard stop |

### 37.2 Metaphor Consistency

| Metaphor | Meaning |
| --- | --- |
| Scribble | Unstructured founder idea |
| Processor | AI deconstruction |
| Blocks / cubes | Structured business architecture |
| Matrix | Risk prioritization |
| Lock / gate | Hard constraint |
| Gauge | Readiness or adjusted strength |
| Circuit | Data flow and instrumentation |
| Chain | Automated traceability |
| Stack / slabs | Structural moat |

---

## 38. Component Guidelines (in module order)

Each subsection names the Part I module it renders.

### 38.1 Concept Intake and AI Deconstruction — renders Module 1 (§6) and Module 4 (§8A)

Show the transformation from messy founder thinking into structured assumptions.

```txt
Unstructured idea card → AI Deconstruction Processor → Structured outputs
```

Visual elements: scribble/sketch card; dark navy processor block; circuit lines flowing outward; structured output cards; time-to-value badge (§6.2).

Required output cards: structured business assumptions; the minimum Persona and Offer schemas (§8A.3–8A.4, surfaced from `suggestedPersona`/`suggestedOffer` in §21.3); testable hypotheses.

```txt
Time-to-value: under 10 minutes
Your idea has been decomposed into assumptions, hypotheses, and first validation actions.
```

### 38.2 Hypothesis Risk Matrix — renders Module 5 (§9) and the §6.6 formula

A two-axis matrix: X = current uncertainty, Y = survival criticality, with a top-right danger zone and the `validationPriorityScore` (§6.6).

```txt
Rule: Test what could kill the business and what we are least sure about first.
Tie-breaker: Ties are broken by criticality, then recency.
```

Use in onboarding, hypothesis detail, risk-ranking explanation, and (Track B) advisor review. In compact dashboard views, show only rank, score, and reason.

### 38.3 Result-to-Hypothesis Chain — renders Module 8 (§11A)

The signature traceability component. Horizontal chain or stepper:

```txt
Experiment Result Recorded
→ Auto-generates Evidence Item
→ Triggers AI Quality Review
→ Recomputes Hypothesis Strength
→ Opens Learning Loop
```

Treatment: active phase in dark navy; pending phases gray; a lock icon between quality review and recomputation (the §11A.4 sample-size guard is the lock); subtle cyan connectors. Every result must be traceable to its evidence item, quality review, hypothesis strength update, and learning loop.

### 38.4 Digital Devil's Advocate Panel — renders Module 6 (§10)

Make bias detection feel protective, not critical of the founder. Sections: source feedback; detected flags; adjusted evidence strength; rule statement; recommended disconfirmation test.

Bias flags (the §10.4 enum): leading questions, polite praise, vanity metrics, interest vs commitment, small sample, cherry-picked signal, founder interpretation, confirmation bias, sunk-cost language.

```txt
Hard Rule: Weak evidence cannot automatically validate a high-risk hypothesis.
```

Treatment: highlighted text fragments in the evidence note; connector lines from fragments to flags; a gauge for adjusted strength; a clear explanation of the score reduction (tie this to the distortion contribution in §17.6).

### 38.5 Deployment Guardrails — renders §12.7

Hard-stop panel listing required parameters: linked hypothesis, primary metric, specific threshold, decision rule, defined persona and offer.

```txt
An experiment cannot launch if any required parameter is missing.
```

Behavior: all parameters present → unlock launch; any missing → lock state; each missing item links to the field that resolves it.

### 38.6 PMF Readiness Lite — renders Module 11 (§17), formulas §17.5 and §17.6

Make readiness objective, constrained, and auditable. Show it as a composed score, never a mysterious number:

```txt
Base Score × (1 − Evidence Distortion Coefficient) = PMF Score
```

Required display: validation coverage (§17.4); customer disappointment signal; evidence distortion coefficient (§17.6); final PMF score (§17.5); readiness state; blockers (`blockingHypothesisIds`).

```txt
Readiness states:
< 0.30: Not Ready    0.30–0.59: Emerging
0.60–0.79: Strong Signal    ≥ 0.80: Scale Ready

Hard Rule: Readiness cannot exceed Emerging if any high-risk hypothesis
remains invalidated or if validation coverage is zero.
```

Treatment: gauge with colored bands; threshold labels; blocking-rule panel; a "what would raise this score?" explanation derived from the formula inputs.

### 38.7 Governance and AI Contracts — renders §20A and §21.1

Make AI constraints explicit. AI is a structured reasoning layer, not a free agent.

```txt
AI writes into typed objects.
AI cannot deploy pages.
AI cannot approve governance.
AI cannot create untyped blobs.
```

Governance flow (the §20A MVP rule):

```txt
AI detects risk-bearing claims
→ No claims detected: proceed to setup
→ Claims detected: page set to pending
→ Blocked until owner clearance

Only the project owner can override to not_required. All bypasses are audit-logged.
```

Treatment: lock/gate icon for blocked pages; key icon for owner override; audit-log badge; claim severity labels. Note that the full reviewer-queue workflow is Track B; the MVP shows only the owner-clearance rule.

**Governance visibility rule (architecture):** Governance is a UX pattern, not just middleware. The deploy route (§12.7) returns a `{ blocked: true, blocks: [...] }` JSON payload — but the user must see *why* deployment is blocked *before* attempting the action, not only after receiving a 400 error. Every guardrail that can block an action must be visible in the UI as a state indicator on the entity it protects: a lock icon with a tooltip listing missing requirements, a disabled deploy button with an inline explanation, or a hard-rule box in the surface detail view. The API-level block is the enforcement mechanism; the UI-level visibility is the user experience.

### 38.8 Progress Command Center — renders Module 13 (§14)

A real control surface. The MVP first screen shows the Track A widget set in this hierarchy:

```txt
1. Riskiest Hypotheses
2. Active Experiments & Surfaces
3. Evidence Quality Alerts
4. PMF Readiness
5. Learning Loops
```

Suggested two-column layout:

```txt
Left:  Riskiest Hypotheses / Active Experiments & Surfaces / Learning Loops
Right: PMF Readiness / Evidence Quality Alerts
```

**Track B widgets** (OKR Health, Governance Blockers, Recent Decisions beyond the MVP set, Advisor Review Queue) appear only when their modules are built (§3) and should use the deferred-feature treatment (§47.5) until then. This reconciles the visual guidelines' optional-widget list with the v1.1 scope split.

---

## 39. Status and Risk Indicators

### 39.1 Required Status Patterns

Every major operational object has a visible state, matching the enums in Part I.

Hypothesis (§9.3): Draft, Active, Testing, Supported, Weakened, Invalidated, Archived.
Experiment (§11.3): Proposed, Designed, Ready, Running, Analyzing, Decision made, Applied, Stopped.
Experiment Surface / Landing Page (§12.5): Draft, Review, Approved, Deployed, Measuring, Iterating, Archived.
Learning Loop (§16.2): Open, Action defined, Applied, Measuring, Closed.

### 39.2 Hard-Rule Labels

Strong labels for non-negotiable constraints, used rarely and meaningfully: Hard Rule, Guardrail, Blocked, Locked, Owner Override Required, Audit Logged, Cannot Launch, Cannot Validate.

---

## 40. Confidence and Evidence Indicators

### 40.1 Confidence Rings

Circular indicators for confidence and readiness scores; always with number, label, explanation, and underlying evidence link.

```txt
42% confidence    62% PMF readiness    78 overall health
```

### 40.2 Evidence Strength Gauges

Shields in compact tables and cards; gauges in explanatory contexts (Evidence Quality Review, Digital Devil's Advocate, PMF Readiness, Track B advisor summaries). The strength values map to the §5A `EvidenceStrength` enum.

### 40.3 Evidence Adjustment Pattern

Where bias is detected, show before and after, making the §10.4 adjustment visible and teachable:

```txt
Original evidence strength → Adjusted evidence strength
```

---

## 41. Blindspot Mitigation

The UI encodes the same anti-failure stance as Part I.

* **Prevent false validation.** Show bias flags, evidence strength, confidence reduction, recommended disconfirmation test. Backed by the §11A.4 three-item guard.
* **Prevent overconfidence.** Any score above 70% shows evidence quantity, quality, recency, and remaining uncertainty.
* **Prevent color-only interpretation.** Every indicator includes text ("High risk / Blocker," not a bare red dot).
* **Prevent dashboard theater.** Every metric answers: where did this value come from, when was it updated, which entity does it affect, what should the user do. This is the UI side of the "no dead instrumentation" rule (§13.1).
* **Prevent AI sycophancy.** AI panels include contradiction, confidence, weak-evidence warning, disconfirmation prompt, alternative explanation.
* **Prevent premature scaling.** PMF Readiness blocks premature "scale ready": "Scale blocked because high-risk assumptions remain unvalidated" / "Readiness cannot exceed Emerging until validation coverage improves" (§17.5.1).

---

## 42. Accessibility

Accessibility requirements are split into two tiers by effort and impact. Both are binding, but structural requirements are required on every page before ship; interactive requirements are best-effort for MVP and escalate to required for production.

### 42.0 Prioritization (P0 = required now, P1 = required before production)

**P0 — Structural (low effort, high impact, required on every page):**
- One `<h1>` per page as the primary heading
- `<main id="main-content">` wrapping the primary content area
- Skip-to-main-content link as the first focusable element
- Breadcrumbs with `aria-current="page"` on every sub-page
- Icon-only buttons and links must have accessible labels (`aria-label` or visually hidden text)
- `prefers-reduced-motion` media query must disable all non-essential animations
- Sufficient color contrast on all text, icons, and interactive elements

**P1 — Interactive (medium effort, medium impact, best-effort for MVP):**
- Dialog focus trap: focus must not escape open dialogs, tour popovers, or drawers
- Escape key: all overlays (dialogs, popovers, drawers, mobile nav) must close on Escape
- Focus restoration: when a dialog/popover closes, focus must return to the element that opened it
- Full keyboard navigation: every interactive element must be reachable and operable via keyboard alone

The original guidelines listed both tiers at equal priority. Treating them as equivalent meant neither got proper attention during implementation. The split ensures structural requirements — which ship the most accessibility value for the least effort — are never deferred.

### 42.1 Contrast

Preserve the high-contrast dark-title-on-pale-background strength. Ensure sufficient contrast for navy panels, cyan accents, grid backgrounds, chart labels, rule boxes, and disabled states.

### 42.2 Grid and Texture

Background patterns stay low contrast; never behind body text; solid surfaces behind forms and tables; offer a reduced-texture mode.

### 42.3 Keyboard Navigation

All interactive elements support keyboard access: buttons, links, dropdowns, cards with actions, tour popovers, drawers, tabs, tables.

### 42.4 Focus States

```txt
2px cyan or indigo outline
2px offset
rounded to match component radius
```

### 42.5 Screen Reader Labels

Accessible labels for score rings, gauges, evidence shields, trend arrows, icon-only buttons, status badges, lock states, and tour steps.

```txt
PMF readiness score: 62 percent, Strong Signal blocked by one unvalidated high-risk hypothesis.
```

---

## 43. Interaction

### 43.1 Primary Actions

One obvious primary action per card: Create experiment, Review evidence, Deploy surface, View recommendation, Close learning loop, View PMF dashboard, Resolve guardrail, Inspect rule.

### 43.2 Secondary Actions

Text links: Why this matters, Show evidence, View details, Learn about bias types, View all hypotheses, Inspect calculation, View audit log.

### 43.3 Disabled Action Explanations

Disabled buttons must explain why, specifically.

```txt
Deploy surface disabled.
Reason: Linked hypothesis, primary metric, and governance approval are required.
```

### 43.4 Progressive Disclosure

Drawers, expandable evidence panels, tooltips, detail pages, "Why this matters" links, "Inspect calculation" panels, "Show chain" traceability views.

### 43.5 Traceability Interactions

Allow click-through along the full chain. This is a signature affordance and the interactive form of §11A:

```txt
Experiment Result → Evidence Item → Quality Review → Hypothesis Strength → Learning Loop
```

---

## 44. Component Copy

### 44.1 System Language

Use consistently: Validation Engine, Hypothesis Risk Matrix, Bias Engine, Evidence Quality, Experiment Surface, PMF Readiness, Learning Loop, Hard Rule, Guardrail, Owner Override, Traceability.

### 44.2 Rule Copy

```txt
Good:  Weak evidence cannot automatically validate a high-risk hypothesis.
       An experiment cannot launch if any required parameter is missing.
       Readiness cannot exceed Emerging while high-risk assumptions remain unvalidated.

Avoid: Some requirements are incomplete.
Prefer: Launch blocked: primary metric and decision rule are missing.
```

### 44.3 Educational Microcopy

```txt
Validation priority score ranks assumptions by uncertainty and survival criticality.
Evidence distortion coefficient lowers readiness when feedback contains bias.
Learning loops turn experiment outcomes into business architecture updates.
```

---

## 45. Design Tokens

### 45.1 Color

```txt
--color-navy-950: core engine navy
--color-navy-900: primary dark panel
--color-blueprint-50: blueprint background
--color-grid-line: low-opacity grid line
--color-circuit-line: low-opacity circuit trace
--color-cyan-400: active instrumentation accent
--color-indigo-600: primary action
--color-bronze-600: warning / hard-stop accent
--color-red-600: critical blocker
--color-teal-600: validated / healthy
--color-gray-500: deferred / inactive
```

### 45.2 Spacing

```txt
--space-1: 4px    --space-2: 8px    --space-3: 12px   --space-4: 16px
--space-5: 20px   --space-6: 24px   --space-8: 32px   --space-10: 40px
```

### 45.3 Border Radius

```txt
--radius-sm: 6px    --radius-md: 10px   --radius-lg: 14px   --radius-xl: 20px
--radius-engine: 8px with optional chamfered or technical frame treatment
```

### 45.4 Shadows and Glows

```txt
--shadow-card: subtle operational card shadow
--shadow-popover: stronger overlay shadow
--shadow-engine: elevated technical panel shadow
--glow-cyan-active: subtle active instrumentation glow
--focus-ring: visible keyboard focus outline
```

### 45.5 Pattern Tokens

```txt
--pattern-grid: pale blueprint grid
--pattern-circuit: low-opacity circuit trace
--pattern-disabled-dash: dashed deferred/post-MVP outline
```

---

## 46. Component Architecture

### 46.1 Component Groups

The visual component tree aligns with the canonical module homes in §24.2. Track B groups carry the deferred treatment until built.

```txt
components/
  command-center/
  concept-intake/
  personas-offers/
  hypotheses/
  evidence-quality/
  bias-engine/
  experiments/
  experiment-evidence-chain/
  experiment-surfaces/
  pmf-readiness/
  learning-loops/
  onboarding-tour/
  ui/
  // Track B:
  okrs/
  advisor/
  governance/
```

### 46.2 Required Shared Components

StatusBadge, RiskBadge, ConfidenceRing, ReadinessGauge, EvidenceStrength, EvidenceAdjustment, OwnerAvatar, MetricTrend, HealthCard, ActionCard, RuleBox, GuardrailPanel, EnginePanel, BlueprintCanvas, CircuitConnector, EmptyState, EvidenceDrawer, TourPopover, TimelineStepper, ProgressStepper, TraceabilityChain, LockState, AuditLogLink.

### 46.3 Diagram Components

ChaosToStructureDiagram, ValidationLoopDiagram, HypothesisRiskMatrix, ResultToHypothesisChain, PMFReadinessFormula, GovernanceFlow, ImplementationStaircase, MoatStack. Used in onboarding, educational states, and strategic explanations (Mode B).

---

## 47. UI Data Integrity

### 47.1 No Fake Production Values

Do not render fake production values unless demo mode is explicitly active (the UI side of §13.5). Each widget shows exactly one of:

```txt
Real metric    Demo metric    Not connected    No data yet    Blocked    Deferred
```

### 47.2 Deferred Feature Treatment

Track B and other post-MVP capabilities use dashed gray outlines and a clear "Deferred" or "Post-MVP" label, so users never confuse deferred features with broken ones.

```txt
Advisor Portfolio: Deferred for current workspace.
```

This treatment is what the Command Center (§38.8) applies to its Track B widgets, the OKR module (§15), the advisor portfolio (§17B), full governance (§18/§20A workflow), and pivot versioning (§19A) until each is built.

### 47.3 Mock vs Real AI UI States

When the mock AI provider is active (no inference credentials configured, §21.6), the UI must make the AI's limitations visible:

1. **AI disclosure banner** on concept intake results: "AI-generated suggestions require human review. Demo mode — suggestions are templates, not real analysis."
2. **Missing from mock output** that real AI would provide: confidence scores, uncertainty quantification, evidence references, alternative interpretations. Where these are absent, show "Not available in demo mode" rather than fabricating values.
3. **No fake introspection.** Do not show confidence rings or uncertainty bars for mock-generated content. Show the entity's computed values (formula-derived scores) but not AI-attributed confidence.

When real inference credentials are active, the full AI interaction guidelines (§38.7) apply: disclosure text, confidence, uncertainty, evidence references, risks, and human review state.

### 47.4 Loading States

Loading states must use skeleton placeholders that match the page layout, not full-page spinners or generic loading text. Each skeleton mirrors the actual component structure: card outlines for cards, row outlines for rows, gauge outlines for gauges. The goal is to give the user an immediate sense of what will appear and where.

**Required skeleton patterns:**
- **List pages:** Row-height rectangles matching the list card layout, with placeholder blocks for title, subtitle, and badge.
- **Detail pages:** Form-field-height rectangles matching the edit form structure, with a wider rectangle for the save button area.
- **Dashboard / Command Center:** Card-sized rectangles in the widget grid positions they will occupy.
- **Analytics:** Stat-card rectangles for summary cards, bar-chart-height blocks for the chart area.

The skeleton transition should be instantaneous (no fade-in animation that adds perceived latency). Show the skeleton immediately on navigation, replace with content as soon as data arrives.

### 47.5 Error States

Beyond data freshness (§28), the UI must handle three operational error states that occur during normal development and use:

| Error Type | UI Treatment |
|---|---|
| **500 / Server Error** | Inline error banner with icon (AlertTriangle), error message, and a retry button that re-fetches the failing endpoint. Do not replace the entire page — only the affected section. |
| **Network Failure** | Same as 500, plus a "Check your connection" hint. If the failure persists across multiple requests, show a persistent top-level banner. |
| **Authorization / 403** | "You don't have access to this resource." Do not expose internal permission logic in the message. Provide a link back to a known-safe page (Command Center). |

All error states follow the existing pattern from the personas and offers pages: `AlertTriangle` icon, `border-red-200 bg-red-50` container, error message text, and — where applicable — a retry or navigation action.

### 47.6 Empty Project State (Brand-New Dashboard)

When a project has zero hypotheses, zero experiments, zero evidence, zero surfaces, and zero learning loops, the Command Center (§38.8) must not display an empty widget grid. It must display a guided entry state:

```txt
Icon: Lightbulb or FlaskConical
Title: "Start with a business idea"
Description: "Concept Intake deconstructs your idea into testable hypotheses,
suggests a target persona and offer, and creates your first validation project."
Primary button: "Enter Your Idea" → links to Concept Intake (§6)
Secondary link: "Explore the demo project" → links to GST Body proof case
```

This is the single most important empty state in the application — it is the entry point for every new user. Every other empty state (§38 empty state guidance) is a downstream consequence of this one not yet being filled.

---

## 48. Main Interface Success Criteria

The interface is successful if a first-time user can answer, within five minutes:

1. What is my riskiest hypothesis?
2. What could kill the business if wrong?
3. What evidence do I have?
4. Is that evidence trustworthy?
5. What experiment should I run next?
6. What guardrails block launch?
7. What is my PMF readiness state?
8. What goal does this affect?
9. Who owns the next action?
10. What must happen before I can scale?

Questions 1–7, 9, and 10 are answerable in the Core Loop MVP. Question 8 (goal linkage) is partially answerable via PMF readiness and learning loops in the MVP and fully answerable once the OKR module (Track B) ships.

---

## 49. North Star Visual Standard

The UI should make scientific entrepreneurship feel operational, not theoretical.

> A calm validation engine where every idea, hypothesis, experiment, evidence item, AI recommendation, readiness signal, and governance rule is connected to a clear next action.

The product makes validation visible, disciplined, bias-aware, traceable, governed, and operationally actionable. The interface should not merely show information; it should help users make better validation decisions. Consistent with §28, every number it shows a founder, especially the PMF score, traces back to stored evidence and a defined formula.