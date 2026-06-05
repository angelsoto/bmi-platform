# BMI Platform — Agent Working Rules

These are project-level rules derived from patterns that caused real problems during implementation. They override any generic instincts about "how things should work." Read before writing code.

## Architecture Constraints

### Stack (fixed — don't propose alternatives without explicit request)
- Next.js 15 App Router, TypeScript, Tailwind CSS v4
- Prisma 7 via libsql adapter (SQLite local / Turso remote)
- Auth.js v5 (demo-only — credentials provider, no OAuth)
- Zod for validation, Lucide for icons
- Deployed on Vercel (not Cloudflare — see rule below)

### Runtime chain (don't break this)
```
Turso/SQLite → libsql adapter → Prisma → Next.js Route Handlers → Node.js runtime → Vercel
```
Every link in this chain is load-bearing. Proposals that remove or replace any link must explicitly trace the new chain end-to-end. This rule exists because 11 hours were wasted trying to deploy this Node.js stack on Cloudflare Workers, which don't have `fs`, `tcp`, or `child_process`. The spec chose Prisma + Auth.js; those two choices implicitly chose Node.js. If you're proposing a different deployment target, you're proposing a different runtime, which means a different database adapter, which means a different ORM configuration. Trace the full chain before making claims.

### AI inference (provider-agnostic — don't add SDKs)
The inference layer uses plain `fetch()` against any OpenAI-compatible Chat Completions endpoint. Configured via:
```
INFERENCE_API_KEY=sk-...
INFERENCE_BASE_URL=https://api.openai.com/v1
INFERENCE_MODEL=gpt-4o
```
Do NOT add provider-specific SDKs (OpenAI, Anthropic, etc.). The `AIProvider` interface in `src/lib/ai/provider.ts` is the contract. The implementation in `src/lib/ai/providers/inference.ts` is the single adapter. Every provider today speaks the same protocol (`POST /v1/chat/completions`); the protocol is more stable than any SDK. If a provider doesn't speak `/chat/completions`, wrap it; don't fork the provider.

### Interface design rule
Don't define an interface until at least 2 consumers exist. The `AIProvider` interface defined 10 methods before any call site was built. Only 3 had consumers. The other 7 were dead code for the entire initial build. Extract interfaces from working call sites, not from speculative completeness.

## Process Rules

### Build order: vertical slice before horizontal spread
Build one complete end-to-end flow (Concept Intake → Hypothesis → Experiment → Evidence → PMF → Learning Loop) before building any second instance of anything. Building horizontally (all 24 pages at once) means repeating the same discovery 24 times. The first vertical slice reveals empty state shapes, persistence boundaries, and navigation dead ends that a horizontal approach hides.

### Demo-first, auth-last
The demo bypass (`?auto=demo@bmi-platform.com`) should have been the first thing built. Auth was the single highest-cost feature for zero demo value — sign-in flow, session management, CSRF protection, and token signing existed only to gate a demo that didn't need gating. For any new feature: make it work for the demo user first, add auth gates later.

### Spec-to-spec reconciliation (before writing code)
When multiple specification documents exist (functional spec, visual guidelines, scope doc), cross-reference them in a grid before any implementation. The 49-section functional spec and 48-page visual guidelines PDF were the same document but were treated as separate — and the visual requirements (breadcrumbs, skip links, AI disclosure) weren't built until a separate audit pass caught them. The grid takes 2-3 hours; discovering the mismatches after building takes days.

## Patterns That Caused Real Bugs

### 1. No barrel exports in schema files
`tsc --noEmit` passes. `npm run build` crashes with `ReferenceError: Cannot access 'F' before initialization`. This is a bundler circular-dependency issue that TypeScript's type-checker doesn't catch. Import schemas directly from their defining file:
```typescript
// CORRECT
import { validateBody } from "@/lib/bmi/schemas/validate";
import { createProjectSchema } from "@/lib/bmi/schemas/project";

// WRONG (circular via validate.ts re-exporting project.ts which imports validate.ts)
import { validateBody, createProjectSchema } from "@/lib/bmi/schemas/validate";
```
Schema files that import shared enums from `./validate` CANNOT be barrel-exported by `validate.ts`.

### 2. Zod-validate every mutation route
Every POST/PUT/PATCH handler must call `validateBody(schema, body)` before touching the database. Pattern from `src/app/api/projects/[projectId]/hypotheses/route.ts`:
```typescript
const body = await req.json();
const result = validateBody(createHypothesisSchema, body);
if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
const d = result.data!;
// Use d.fieldName, never body.fieldName
```
Routes that spread `body` directly into Prisma (`data: body`) are mass-assignment vectors. Fix them by using only validated fields.

### 3. Non-blocking AI enrichment at route level
AI calls in routes must never gate the core action. Pattern:
```typescript
// 1. Do the core action first
const experiment = await prisma.experiment.create({ data: { ... } });

// 2. Try AI enrichment in a separate try/catch
let aiDesign = null;
try {
  const ai = getAIProvider();
  aiDesign = await ai.designExperiment(hypothesis);
  // Log to AILog
} catch { /* non-blocking */ }

// 3. Return core result with optional AI enrichment
return NextResponse.json({ ...experiment, aiDesign }, { status: 201 });
```

### 4. Client components for pages with forms
Pages with inline forms (PersonasForm, OfferForm, ExperimentForm, LandingPageForm) must be `"use client"` components. They follow the pattern in `src/app/(dashboard)/dashboard/[projectId]/personas/page.tsx`:
- `useState` for items list, loading, error, form toggle
- `useEffect` to fetch on mount and on projectId change
- `fetch()` → load callback → re-render
- Grid layout: form in left panel, list in right panel

### 5. Detail pages follow a single pattern
Every detail page (`personas/[id]`, `experiments/[id]`, `hypotheses/[id]`, `surfaces/[id]`) uses the same structure from `personas/[personaId]/page.tsx`:
- Client component, `useParams` + `useRouter`
- Load item on mount (fetch from list endpoint + filter by ID)
- Inline edit form with save button → PUT to API
- Back link to parent list page

### 6. Tailwind @theme, not tailwind.config
This project uses Tailwind v4 with `@theme inline { ... }` in `src/app/globals.css`. There is no `tailwind.config.*`. Custom tokens go in the `@theme` block. Grid utilities auto-generate from `--grid-template-columns-*` tokens.

### 7. Import paths use `@/` alias
All internal imports use the `@/` prefix mapped to `src/`. Do not use relative paths that traverse more than one level up.

### 8. Empty states must contain an actionable button
A text-only empty state ("No experiments yet") is a bug. Every empty state must answer "what should the user do to get their first result here?" and provide a button that does it. The pattern: icon + title + description + CTA button. See the experiments and evidence pages for examples. This was discovered through iteration — the original text-only empty states were built, then the user pointed out they provided no path forward.

### 9. Framework auth errors mask real failures
Auth.js's `MissingCSRF` error fires for database connection failures, cookie mismatches, session corruption, and actual CSRF attacks. When you see an auth error during development, check the database connection first — it's more likely than an actual auth problem. More generally: errors from framework middleware don't map to root causes unless you know the implementation intimately. Before debugging a framework error, verify the infrastructure underneath it.

### 10. Governance visibility belongs in the UI, not just the API
The deploy route returns a `{ blocked: true, blocks: [...] }` JSON error. The user sees a failure, not a governance state. When a guardrail blocks an action at the API level, the frontend should show *why* before the user attempts the action — not after they hit the blocked endpoint. Governance is a UX pattern, not middleware.

### 11. Testing: formulas yes, framework no
27 unit tests cover `src/lib/bmi/formulas.ts`. There are zero integration tests for routes and zero component tests for UI. This split is intentional for MVP: pure functions (formulas, schema validation) are testable and stable; framework-coupled code (Next.js routes, React components) changes too fast to justify test maintenance. When adding tests, add formula tests. Don't write tests that mock Next.js internals.

### 12. Accessibility: structural required, interactive best-effort
Structural a11y (one h1 per page, main#main-content, skip link, breadcrumbs with aria-current, icon-only button labels, reduced-motion media query) is required on every page. Interactive a11y (dialog focus trap, Escape dismissal, focus restoration, full keyboard navigation) is best-effort for MVP. The original guidelines listed both at equal priority; treating them as equivalent meant neither got proper attention. Structural is low-effort and high-impact; interactive is medium-effort and medium-impact. Prioritize accordingly.

## Spec vs Implementation Reconciliation

When the specification (49-section document, 48-page visual guidelines PDF) conflicts with the implementation, follow this priority:
1. The implementation IS the spec for anything already built — don't re-litigate
2. The visual guidelines' structural requirements (breadcrumbs, skip links, aria-current) are binding
3. The visual guidelines' component list (MangoCard, MangoButton) is NOT binding — Tailwind replaces it
4. The spec's Track A vs Track B distinction is binding — Track B features (OKRs, Advisor Portfolio, Pivots) are deferred

## Pages That Need a Primary Question

Every page answers one question. If you're unsure where something goes, check:
- **Command Center** — "What is the state of my validation project?"
- **Concept Intake** — "What hidden assumptions does my business idea contain?"
- **Personas & Offers** — "Who am I building for and what am I offering them?"
- **Hypotheses** — "Which assumptions are most dangerous if wrong?"
- **Experiments** — "What am I testing and what did I learn?"
- **Evidence** — "How reliable is my evidence?"
- **Surfaces** — "Where are customers interacting with my validation?"
- **PMF Readiness** — "Am I ready to scale?"
- **Learning Loops** — "What did I learn and what should change?"
- **Analytics** — "How are users interacting with my surfaces?"
- **MVV** — "What is this project's mission, vision, and values?"
- **Empty states** — "What should I do to get my first result here?"

## Files With High Change Impact

These files are the system's spine — changes here cascade everywhere:
- `src/lib/ai/provider.ts` — AIProvider interface (10 methods, all consumers depend on it)
- `src/lib/ai/client.ts` — AI provider factory
- `src/lib/ai/providers/inference.ts` — single inference adapter
- `src/lib/bmi/schemas/validate.ts` — `validateBody()` helper and shared Zod enums
- `src/lib/bmi/formulas.ts` — core formulas (PMF score, evidence strength, priority ranking)
- `prisma/schema.prisma` — 35 models, database source of truth
- `src/app/globals.css` — Tailwind @theme tokens, design system
- `src/components/dashboard/DashboardNav.tsx` — navigation structure
