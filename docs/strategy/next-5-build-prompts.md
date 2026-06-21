# Recall Signals: next five build prompts

Run these in order. Each prompt is intentionally concise and scoped to one shippable outcome.

## Prompt 1 — Production trust baseline

```text
ULTRAWORK — RECALL PRODUCTION TRUST BASELINE

Repository: C:\Users\manaz\saved-brain
Create branch: agents/recall-production-trust

Make Recall safe for paid agency pilots.

Deliver:
- Correct Supabase pooled DATABASE_URL usage and prove /api/health reports a working database.
- Upgrade vulnerable production and test dependencies with the smallest compatible version changes.
- Verify Clerk fails closed in preview/production.
- Add tests for tenant isolation, unauthorized access, deletion and health failure states.
- Run npm test, npm run lint, extension tests/build and npm run build.
- Deploy a Vercel preview, inspect logs, push the branch and open a draft PR.

Do not add product features. Preserve local SQLite development. Never commit secrets.

Return: preview URL, PR URL, exact security fixes, test evidence and remaining manual credential actions.
```

## Prompt 2 — Agency workspaces and persisted Router

```text
ULTRAWORK — RECALL AGENCY WORKSPACES

Repository: C:\Users\manaz\saved-brain
Create branch: agents/agency-workspaces

Turn Recall from a personal workspace into a tenant-safe agency product.

Build the minimum real model for workspace, member, role, client/project, activity event and persisted Execution Router plan. Add client-scoped libraries, boards and permission-aware search. Every write and read must enforce workspace membership and client access server-side.

Roles: owner, admin, strategist, contributor, viewer.

Use Supabase migrations and keep SQLite parity. Add tests proving no cross-workspace or cross-client leakage.

Update onboarding so a user creates a workspace and first client, then routes one real objective.

Verify, deploy a preview, push an agents/* branch and open a draft PR.

Return only shipped flows, migration summary, isolation evidence, preview URL, PR URL and blockers.
```

## Prompt 3 — Evidence-to-brief engine

```text
ULTRAWORK — RECALL CITED INTELLIGENCE BRIEFS

Repository: C:\Users\manaz\saved-brain
Create branch: agents/cited-briefs

Build Recall's core paid output.

Add structured annotations and claims classified as source fact, human annotation or AI inference. Build pattern groups with supporting and contradictory sources, independent-source count, freshness and evidence strength. Let users turn selected patterns into a client-safe brief where every claim links back to evidence.

Export Markdown and print-quality PDF. Provide a Notion-compatible Markdown export; do not add a Notion integration yet.

Never use a universal AI score. AI-generated fields must be editable and visibly labelled.

Add tests for citation integrity, client isolation, contradiction handling and export completeness. Verify, deploy, push and open a draft PR.

Return: working workflow, example output, test evidence, preview URL, PR URL and limitations.
```

## Prompt 4 — Capture activation loop

```text
ULTRAWORK — RECALL CAPTURE ACTIVATION

Repository: C:\Users\manaz\saved-brain
Create branch: agents/capture-activation

Make a new agency reach a useful corpus in under 30 minutes.

Unify explicit browser-extension capture, URL paste, JSON imports, mobile-share-compatible URLs and user-owned screenshots/files. Require or strongly prompt for “why I saved this” and client/project assignment. Preserve contributor, original URL, canonical URL, platform ID, publication time, capture time, method and access class.

Keep per-item partial success and retries. Never scrape viewed, recommended, private or unrelated posts.

Add an onboarding checklist and progress state through first 10 cited items.

Test poison records, duplicates, sparse retries, authorization and provenance. Verify, deploy, push and open a draft PR.

Return: supported inputs, safety boundaries, activation evidence, preview URL and PR URL.
```

## Prompt 5 — Outcome learning and pilot revenue

```text
ULTRAWORK — RECALL OUTCOME LEARNING AND REVENUE

Repository: C:\Users\manaz\saved-brain
Create branch: agents/outcome-revenue-loop

Close the loop from recommendation to recurring revenue.

Add recommendation status, assigned owner, delivered-creative URL/file, campaign outcome, result source/date and successful/failed/inconclusive learning. Show where evidence or a learning was reused in later work.

Add pilot operations for the £500 four-week offer: application record, onboarding checklist, baseline research hours, target client output, weekly activation metrics and conversion review. Implement Studio £149 and Agency £349 entitlement boundaries only after the workflow is functional. Use Stripe if credentials already exist; otherwise build a safe test-mode integration and document exact founder setup.

Add tests for billing boundaries, workspace quotas and outcome isolation. Verify, deploy, push and open a draft PR.

Return: revenue flow, metrics, billing status, preview URL, PR URL and founder actions.
```
