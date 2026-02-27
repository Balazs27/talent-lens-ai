# CLAUDE.md — TalentLens AI

This file is the behavioral contract for AI coding agents working in this repo.
It defines **what this project is**, **the architecture it follows**, and guardrails
to prevent “agent drift” (over-editing, guessing, breaking conventions, or introducing risk).

Precedence:
**CLAUDE.md > docs/ARCHITECTURE_MATCHING.md > docs/ARCHITECTURE.md > docs/PLAN.md > docs/UI.md > README.md > code comments**

---

## 0) Project Summary (What you’re building)

**TalentLens AI** is a two-sided internal talent matching SaaS:

- **Employee side:** upload/paste resume → extract skills → see best matching roles/jobs + gaps.
- **HR side:** paste job description → extract requirements → rank candidates + overlap/gaps.

Core idea: resumes and job descriptions become:
1) structured skill data (normalized to a taxonomy)
2) embeddings stored in pgvector

Matching is **hybrid**:
- Vector similarity (pgvector) for semantic similarity
- Deterministic skill overlap scoring for explainability + stability (acts as reranker)

This is **not a chatbot-first product**. LLM calls are used for:
- **Structured extraction** (resume/JD → skills + metadata)
- **On-demand analysis** (gap analysis / optional qualitative assessment)

---

## 1) Hard Rules (Non-negotiable)

### 1.1 Fixed stack
- Next.js (App Router) + TypeScript
- Supabase (Auth, Postgres, pgvector, RLS)
- OpenAI API (GPT-4o / GPT-4o-mini, text-embedding-3-small)
- Tailwind + shadcn/ui
- Deploy: Vercel

### 1.2 Environment + tooling (pin choices)
- Package manager: **npm** (do not introduce pnpm/yarn unless explicitly requested)
- Node: **>= 20** (use `.nvmrc` or document in README if present)
- No new dependencies without approval (see §6)

### 1.3 Separation of concerns (where code goes)
- `src/app/**`  
  Pages/layouts/route groups/API routes only. Keep handlers thin.
- `src/lib/**`  
  Reusable logic: OpenAI client, prompts, parsing, normalization, matching, DB helpers.
- `src/components/**`  
  UI components only. No business logic beyond UI state.
- `supabase/migrations/**`  
  SQL schema/indexes/RPC functions/RLS policies.
- `scripts/**`  
  One-off utilities (seed, backfill).
- `docs/**`  
  Planning/design documentation.

**Rule:** No business logic inside React components or route handlers beyond orchestration.

### 1.4 Minimal diffs / no refactor mania
- Prefer the smallest change that works.
- Do not rename/move files unless requested.
- Do not refactor unrelated code.
- Keep public interfaces stable unless explicitly changing them.

### 1.5 Security & secrets
- Never commit secrets (keys, URLs with tokens, service role keys).
- Use env vars only (`.env.local`). Document required env vars in `.env.example`.
- Never render LLM output via `dangerouslySetInnerHTML` unless sanitized.

### 1.6 Core Data Invariant: One Active Resume per Employee (SCD2)

**Schema note**
- `resumes.is_active` may not exist yet in older environments. Add via migration + backfill.

**Invariant**
- A user may have multiple historical resumes, but **exactly one** resume must be `is_active = true` per `user_id`.
- All matching, skill displays, and gap analysis must use **only the active resume**.
- **Never** query `resume_skills` by `user_id`. Always scope by `resume_id` (active resume id).

**Canonical active resume selector**
- Active resume id for a user:
  - `SELECT id FROM resumes WHERE user_id = auth.uid() AND is_active = true LIMIT 1`

**Upload behavior**
When an employee uploads a resume:
1) Set all existing resumes for that user to `is_active = false`
2) Insert new resume with `is_active = true`
3) Run skill extraction for the new resume
4) Insert `resume_skills` rows tied **only** to the new `resume_id`

**DB enforcement**
- Add a partial unique index to enforce the invariant:
  - “Only one active resume per user” (`WHERE is_active = true`)

**Definition of Done (for this feature)**
- Uploading a new resume results in:
  - exactly one active resume for the user
  - employee matches update to use the new resume
  - HR no longer sees duplicate candidate entries caused by old resumes
- Provide SQL verification queries + a manual test checklist (employee + HR flows)

---

## 2) Required Agent Workflow (Must follow)

For every task/slice, follow this sequence:

1) **Plan first (no code yet)**
   - State the goal in 1–2 sentences
   - List the exact files you will create/modify
   - List acceptance criteria (“done when…”)
   - Call out risks/assumptions

2) **Implement**
   - Make incremental, minimal changes
   - Keep responsibilities in the correct folders

3) **Verify**
   - Provide the exact commands to run locally (e.g., `npm run dev`, `npm run build`)
   - Ensure TypeScript builds (and lint/typecheck if available)

   **Verification Commands**
    - Dev: `npm run dev`
    - Build: `npm run build`
    - Lint: `npm run lint` (if configured)
    - Typecheck: `npm run typecheck` (if configured)

4) **Update docs**
   - Update `docs/TRACKER.md` checkboxes for the slice
   - Update README or `docs/PLAN.md` only if behavior/commands changed

5) **Handoff**
   - Summarize what changed + how to test manually
   - Mention any follow-ups explicitly

---

## 3) Task Sizing Rule (How to scope work)

- Agents must implement **one vertical slice per task**.
- A slice is “DB → API → UI (minimal) → verify”.
- Avoid “build the whole system” in one go.
- Max ~3–8 files per task unless justified; if more, explain why.

---

## 4) Reference Code Policy (Bootcamp code)

This repo contains reference-only code:
- `reference/bootcamp/**`

Purpose:
- Provide patterns and examples (pgvector RPC SQL, indexing strategies, embedding text formatting, function-calling schemas, JSON-mode reranking).

Hard rules:
1) **Never import** anything from `reference/bootcamp/**` into production code.
2) **Never run** the Python reference code as part of the TalentLens app.
3) If reusing a pattern:
   - Rewrite into TypeScript under `src/lib/**` or SQL under `supabase/migrations/**`.
   - Use TalentLens naming and schemas (no `rag_content`).
4) Reference is not maintained. Treat it like a blog post: read → rewrite.

Recommended enforcement:
- Do not create any TS imports from `reference/`.
- If any import appears, remove it.

---

## 5) LLM Rules (Prompt Engineering Standards)

### 5.1 Structured outputs are mandatory
For extraction/gap analysis:
- Use response formatting + tool/function calling schema when supported.
- Parse and validate output.
- On parse failure: retry once with stricter instructions or return a controlled error.

### 5.2 Deterministic by default
- `temperature: 0` for extraction/classification/scoring.
- Only use >0 for “recommendations” style outputs (and document why).

### 5.3 Evidence & confidence
Extraction outputs should include:
- `confidence` (0–1) per extracted skill (where feasible)
- `evidence` snippet when feasible

### 5.4 Avoid LLM calls for trivial logic
Do not use LLMs for:
- dynamic top_k selection
- basic routing
- string normalization
Use deterministic heuristics/taxonomy.

### 5.5 Embeddings (V2 Matching Engine)

- Embedding model: `text-embedding-3-small` (1536 dims).
- Store embeddings in Postgres pgvector:
  - `resumes.embedding vector(1536)`
  - `jobs.embedding vector(1536)`
- Embedding input is the **full raw text** (resume `raw_text`, job `raw_text` / `description`), optionally lightly normalized.
- Embed on ingestion:
  - Resume ingestion sets `resumes.embedding`
  - Job ingestion sets `jobs.embedding`
- Do not change matching/scoring in Slice 7 (embeddings only).
- Add vector indexes (ivfflat) and keep queries limited with similarity thresholds in later slices.

---

## 6) Dependency Policy

- **No new dependencies** without explicit approval.
- If a dependency is truly necessary, provide:
  - Why it’s needed
  - Alternatives considered
  - Exact package + version
  - Impact on bundle size / security

Prefer built-in platform capabilities and existing repo dependencies.

---

## 7) Database / Supabase Rules

### 7.1 RLS required
- Employees: access only their own resumes and derived data.
- HR: access candidates/matches per allowed scope (initially role-based; later org-based).
- Any new table: consider RLS + document policy.

### 7.2 RPC functions for vector search
- Use SQL RPC functions for pgvector matching.
- Always use similarity floors + limits.

### 7.3 Migrations
- Never edit old migrations after applied.
- Add new migrations for changes.

---

## 8) Frontend Aesthetics (Hard Requirements for TalentLens)

Goal: The UI must feel premium, modern, and branded — NOT like default shadcn.

### Brand vibe
- Clean + confident + slightly futuristic (not playful, not corporate-boring).
- “Royal blue energy” as the signature. Blue should be present on every key screen.

### Color rules
- Primary brand color: strong royal blue used intentionally in:
  - Primary CTA buttons
  - Active nav state + sidebar accents
  - Section headers / key metrics emphasis
  - Subtle background glows / gradients (NOT purple-on-white cliché)
- Use neutrals for structure, blue for attention + identity.
- Prefer layered backgrounds (mesh gradients, subtle noise, glow) over flat white.

### Typography rules
- Do NOT default to Inter/Roboto/system fonts.
- Choose a distinctive display font (headings) + refined body font.
- Keep it readable and SaaS-appropriate (no gimmick fonts).

### Layout + components
- Avoid cookie-cutter “stack of identical cards”.
- Add hierarchy: featured card, varied density, deliberate whitespace rhythm.
- Use modern depth: soft shadows, borders, glassy panels, gradient strokes.
- Make empty states beautiful (illustrated/graphical placeholders).

### Motion
- One strong page-load entrance (staggered reveal).
- Crisp hover transitions: lift, glow, gradient shift, subtle scale.
- Use motion sparingly but intentionally — micro-interactions should feel “alive”.

### Implementation constraints
- Stack: Next.js App Router + TS + Tailwind + shadcn/ui.
- Use CSS variables + Tailwind tokens (themeable).
- Keep accessibility (contrast, focus states) solid.
- Keep code production-grade (no hacky inline CSS everywhere).

### “Never do this”
- Generic shadcn look with no brand identity.
- Purple gradients on white backgrounds.
- Inter everywhere.
- Same radius/shadow on every card with no hierarchy.

---

## 9) Landing Page Design Requirements (Non-Negotiable)

The landing page represents the product vision and must feel premium and investor-ready.

### Core Principles
- Large, bold typography with strong hierarchy.
- Clean but powerful visual contrast.
- Generous whitespace and intentional spacing rhythm.
- Avoid safe, generic SaaS layouts.
- The hero section must feel memorable and confident.

### CTA Structure
- One primary CTA in hero: “Get Started” (links to signup).
- One secondary CTA in navigation: “Sign In”.
- Do NOT add multiple competing buttons in hero.
- Clean > Busy.

### Required Sections (in this order)
1. Hero
2. Problem / Why
3. How It Works (3 steps)
4. Product Preview
5. About
6. Contact

### Visual Reference Style

When designing landing pages, take inspiration from:
- Linear
- Stripe
- Vercel
- Perplexity
- Modern AI-native startups

Design should feel:
- Product-led
- Minimal but bold
- High contrast
- Clean gradients
- Confident typography
- Slightly futuristic, not corporate

Avoid:
- Startup cliché gradients
- Marketing fluff
- Stock-illustration-heavy layouts
- Generic Tailwind templates

Do not change this structure unless explicitly instructed.

---

## 10) Definition of Done

A task is done only if:
- Builds (`npm run build` passes) or at minimum compiles
- API routes return correct HTTP status codes (no HTTP 200 for errors)
- Types are updated (no `any` unless unavoidable)
- Basic happy-path tested manually (document how)
- No obvious security footguns (XSS, secrets)
- No dangling TODOs for core logic
- Tracker updated (`docs/TRACKER.md`)

---

## 11) Local Dev Expectations

Agents should keep these working:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint` / `npm run typecheck` (if configured)

If commands change, update README.

---

## 12) If you’re unsure (Fallback behavior)

When uncertain:
1) Prefer the simplest approach consistent with architecture.
2) Avoid adding dependencies.
3) Implement a safe default and clearly annotate assumptions in code comments.

When in doubt, ask for clarification before proceeding with significant changes.