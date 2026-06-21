# Execution Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, deterministic Recall workspace that assigns tasks to Claude, Codex, and OpenCode and generates complete handoff prompts.

**Architecture:** Keep routing and prompt generation in a pure TypeScript module so behavior is testable without React or network access. Render it through one authenticated client page using existing Recall tokens and browser storage; add only a sidebar link for discovery.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, Vitest, Lucide React.

---

### Task 1: Routing domain

**Files:**
- Create: `tests/unit/execution-router.test.ts`
- Create: `lib/execution-router.ts`

- [ ] Write failing tests proving capability routing, unavailable-agent fallback, phase ordering, and prompt completeness.
- [ ] Run `npm test -- tests/unit/execution-router.test.ts` and confirm failure because the module does not exist.
- [ ] Implement the smallest pure routing module that satisfies the tests.
- [ ] Run `npm test -- tests/unit/execution-router.test.ts` and confirm all router tests pass.

### Task 2: Authenticated Router workspace

**Files:**
- Create: `app/(app)/router/page.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `middleware.ts`

- [ ] Build the form using the routing module and existing semantic tokens.
- [ ] Add browser-only draft persistence with guarded storage access.
- [ ] Add accessible copy controls and inline validation.
- [ ] Add the Router navigation entry and verify active-route behavior.
- [ ] Protect `/router` through the existing authentication route matcher.
- [ ] Run `npx tsc --noEmit`.

### Task 3: Revenue journey and product metadata

**Files:**
- Modify: `app/(marketing)/page.tsx`
- Modify: `app/(marketing)/pricing/page.tsx`
- Modify: `README.md`
- Modify: `package.json`

- [ ] Surface the working Router from the landing page without displacing Recall's creative-intelligence promise.
- [ ] Replace dead pilot CTAs with a working pre-addressed enquiry link and state the £500 credited pilot offer.
- [ ] Replace stale Saved Brain and consumer-second-brain language with concise Recall Signals positioning.
- [ ] Correct repository metadata to `manazoid4/recall`.
- [ ] Include Execution Router in the feature list without claiming agent execution or team persistence.

### Task 4: Verification and delivery

**Files:**
- Modify only files required by verified failures.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start the application and browser-test the Router at desktop and mobile widths.
- [ ] Scan the diff for secrets, unrelated files, and unsupported claims.
- [ ] Commit and push `agents/execution-router`.
- [ ] Open a draft pull request.
- [ ] Deploy a Vercel preview and inspect its status.
- [ ] Update the Recall and JobFilterV1 GitHub descriptions with concise product language.
