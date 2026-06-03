# BMI Platform — Demo Project Data Files

## Purpose

These JSON files represent 5 fully-populated projects at different validation stages. They serve as:

- **Test data** for usability audits and interface validation
- **Hydration source** to quickly seed an application instance with realistic data
- **Reference models** for understanding the complete data shape of a mature project
- **Cross-project comparison** for portfolio analytics (Track B)

## Schema Reference

The formal JSON Schema is at `../project-template-schema.json`. Each file conforms to that schema's `project` definition. All entity relationships are fully connected via string IDs:

```
Persona ──relatedHypothesisIds──→ Hypothesis
Offer   ──relatedHypothesisIds──→ Hypothesis
Hypothesis ──riskRank──→ HypothesisRiskRank
Experiment ──hypothesisId──→ Hypothesis
EvidenceItem ──relatedHypothesisId──→ Hypothesis
EvidenceItem ──qualityReview──→ EvidenceQualityReview
LandingPage ──personaId/offerId──→ Persona/Offer
LandingPage ──ctas/contentBlocks──→ nested arrays
ExperimentResult ──generatedEvidenceItemId──→ EvidenceItem
PMFAssessment ──blockingHypothesisIds──→ Hypothesis[]
LearningLoop ──sourceEntityId──→ Experiment/EvidenceItem
```

## The 5 Projects

| # | Name | Stage | Stage Detail | Key Story |
|---|------|-------|-------------|-----------|
| 1 | **Mindful Match** | `idea` | Just started | Meditation app with AI matching — no evidence yet, 5 hypotheses ranked by priority |
| 2 | **GST Body** | `validating` | Early validation | Wellness certification — 2 weak evidence items with strong bias flags, distortion coefficient 0.42 |
| 3 | **Code Coach** | `validating` | Mid validation | AI tutor for devs — moderate evidence, 2 running experiments, landing page, open learning loop |
| 4 | **LocalEats** | `selling` | Near PMF | Home-cooked meal marketplace — strong evidence (6 items), 3 experiments, closed learning loops, 68% PMF score |
| 5 | **PlantWise** | `validating` | Pivot phase | Smart gardening — hardware pre-sale failed, pivoting to content subscription, 1 closed learning loop documenting the pivot |

## Usage

To load a file into the application:

```ts
// Import and parse
import demoData from './scripts/demo-projects/04-localeats.json';

// Create project via API
const projectRes = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(demoData.project) });
const project = await projectRes.json();

// Create persona, offers, hypotheses, etc. using each entity's API route
```

Or use the included loader script:
```bash
npx tsx scripts/demo-projects/load-project.ts 4
```

## Data Integrity Notes

- All `id` fields use consistent `prefix_N` format (e.g., `hyp_01`). Real application IDs are auto-generated CUIDs — loader scripts should map these to new IDs on creation.
- `DateTime` strings are ISO 8601. The application expects `Date` objects on the server side — the loader should convert on insert.
- JSON array fields (`relatedHypothesisIds`, `blockingHypothesisIds`, `values`) are stored as JSON-encoded strings in the Prisma model. The loader should `JSON.stringify()` before writing.
- `riskRanks` are embedded in the hypothesis object for readability but stored as a separate `HypothesisRiskRank` table in the schema.
