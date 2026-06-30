# Recall Repo Post-mortem Audit Report

Date: 2026-06-30  
Branch audited: `agents/recall-postmortem-instagram-inbox`  
Scope: product reset follow-up, Instagram Inbox moat, Signal OS paid wedge, webhook surface, docs, tests, and repository readiness.

## Executive Summary

The Recall repo is in a much stronger strategic position after PR #5 and PR #6. The product now points toward a future-facing personal intelligence layer rather than a generic saved-post dashboard. The latest viability pass adds a clearer paid reason: Signal OS, where captures are graded as GOLD, SILVER, or BRONZE and routed into daily actions or agent context packs. The largest remaining risk is not product direction; it is production hardening around real integrations, dependency upgrades, persistence, and Instagram compliance.

The codebase is shippable for the current mock/demo layer and strategic product surface. It is not yet production-complete for real Instagram DM ingestion because durable thread routing, Meta app approval, webhook signature verification, and persistence are still required.

## Audit Outcome

Status: `PASS WITH FOLLOW-UP RISKS`

- Tests pass locally.
- TypeScript/lint exits successfully.
- Production build exits successfully with CI-style environment variables.
- GitHub PR #6 is mergeable.
- GitHub CI and Vercel preview are green at time of audit.
- No committed secret values were found in the scan.
- Local junk artifacts are not part of the branch. A generated dev-server log, `recall-3030.log`, was identified locally and should remain untracked/removed once the locking process exits.

## What Changed in This PR

### Product

- Added `POSTMORTEM.md` with a detailed product post-mortem.
- Added a sharper future thesis: Recall should become the user-owned personal context layer for future AI agents.
- Added moat framing:
  - Capture habit moat
  - Evidence graph moat
  - Taste and intent moat
  - Agent context moat
  - Privacy and trust moat
  - Workflow distribution moat
  - Signal scoring moat
- Added Signal OS positioning: users pay for ranked signal, not storage.

### UX

- Added `/instagram-inbox`.
- Added `/signal-os`.
- Added message-first capture framing: "DM anything to your Recall inbox."
- Added setup steps for a shared Recall-owned Instagram inbox and routing code.
- Added GOLD/SILVER/BRONZE signal cards with evidence reasons and recommended actions.

### Backend/API

- Added `/api/instagram/inbox/webhook`.
- Added Meta-style webhook challenge verification.
- Added inbound message normalization into Recall capture inputs.
- Added middleware bypass only for `/api/instagram/inbox/webhook`, while keeping the rest of `/api/instagram/*` protected.

### Data Model and Logic

- Added `InstagramInboxProvision`.
- Added `InstagramInboxMessage`.
- Added `SignalScore`.
- Added `DailyBrief`.
- Added `PaidPlanMoat`.
- Added `createInstagramInboxProvision`.
- Added `normalizeInstagramInboxMessage`.
- Added `scoreMemorySignal`.
- Added `createDailyBrief`.
- Added `getPaidPlanMoats`.
- Added demo Instagram Inbox memory and provisioning data.

### Tests

- Added tests for:
  - Provisioning an Instagram inbox identity without impersonation.
  - Turning an Instagram DM into a Recall memory capture.
  - Scoring high-intent captures as GOLD.
  - Creating a paid daily brief from memory signals.

## Verification Evidence

Commands run:

```bash
npm test
npm run lint
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k DATABASE_URL=postgres://ci:ci@127.0.0.1:5432/recall npm run build
```

Results:

- `npm test`: 44 tests passing across 7 files.
- `npm run lint`: exit 0.
- `npm run build`: exit 0.
- Runtime probe:
  - `/instagram-inbox` returned `200`.
  - `/api/instagram/inbox/webhook?hub.mode=subscribe&hub.verify_token=verify-test&hub.challenge=ok` returned `ok`.

Known non-failing warnings:

- Existing lint warnings in `components/VoiceCapture.tsx` for unused callback args.
- Existing lint warnings in `lib/db.ts` for unused fallback adapter args.
- Existing build-time DB health warning when using a placeholder local `DATABASE_URL`.

## Security Audit

### Secrets

Search performed for token/key/secret/password patterns outside `node_modules`, `.next`, and lockfile.

Finding:

- No committed live secret values were identified.
- Matches were expected references to env var names, password input fields, token handling, test fixture strings, and docs.

### Instagram Inbox Security

Current state:

- Webhook verification token is environment-driven: `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.
- Webhook path is public only because Meta must call it unauthenticated.
- The rest of `/api/instagram/*` remains protected by Clerk.

Required before production:

- Verify Meta webhook signatures on POST events.
- Store and validate sender/thread routing records.
- Reject messages that cannot be mapped to a Recall user.
- Add rate limiting and replay protection to the webhook endpoint.
- Avoid returning normalized capture payloads from production webhook responses.

### Auth and Authorization

Current state:

- Existing Clerk middleware protects app routes and most APIs.
- New webhook is intentionally public for platform callback compatibility.

Required before production:

- Add server-side user ownership checks when persisting DM captures.
- Ensure thread routing cannot be claimed by another user guessing a routing code.
- Expire or rotate routing codes.

## Dependency Audit

Command run:

```bash
npm audit --audit-level=moderate
```

Result:

- 10 vulnerabilities reported:
  - 4 moderate
  - 5 high
  - 1 critical

Primary affected areas:

- `next`
- `postcss`
- `vitest` / `vite` / `esbuild`
- `eslint-config-next` transitive `glob`
- `uuid`

Why not fixed in this PR:

- `npm audit fix --force` would perform breaking upgrades, including moving Next.js and Vitest major versions.
- That should be a dedicated dependency-hardening PR with focused regression testing.

Required follow-up:

1. Upgrade Next.js on a separate branch.
2. Upgrade Vitest/Vite/esbuild.
3. Upgrade or replace vulnerable transitive lint dependencies.
4. Upgrade `uuid`.
5. Re-run full CI, Vercel preview, auth flows, extension flow, and API tests.

## Code Quality Audit

Strengths:

- New Instagram Inbox logic is small, deterministic, and covered by tests.
- Product routes remain mostly static/demo-driven, reducing integration risk.
- Data model additions are explicit and reusable.
- Webhook verification logic is isolated.

Weaknesses:

- `app/components/RouteViews.tsx` is growing into a large route-view registry.
- Several product pages still use demo data rather than real persistence.
- The existing repo has some unused-argument warnings.
- The current Instagram webhook POST is a skeleton and does not yet persist.

Recommended refactors:

- Split `RouteViews.tsx` into feature-specific files once these surfaces become interactive.
- Add `lib/instagram-inbox.ts` for routing, signature verification, and persistence.
- Move demo-only objects under a clear `demo/` or `fixtures/` namespace before production storage lands.

## Architecture Audit

The repo currently has two layers:

1. Existing production app:
   - Clerk auth
   - database fallback
   - extension ingestion
   - boards/library/search/export
   - Instagram Business Discovery

2. New personal-intelligence layer:
   - memory/profile/taste/intent model
   - mock agents
   - route surfaces
   - Instagram Inbox concept

This is acceptable for the product reset, but the next architecture step is unification:

- Existing `SavedItem` should map into or become `MemoryItem`.
- Existing enrichment should feed `ProfileInsight`, `TasteNode`, and `IntentNode`.
- Existing extension ingestion should use the same capture pipeline as Instagram Inbox.
- Existing Obsidian export should support profile/context exports, not only saved-item exports.

## Product Audit

What is now differentiated:

- Message-first capture.
- Signal scoring: GOLD/SILVER/BRONZE with reasons and next action.
- Paid daily brief and agent pack loop.
- Private memory graph.
- Taste and intent modeling.
- Agent context packs.
- Evidence-based profile.
- Trust-first social import stance.

What is still copyable:

- Static dashboard pages.
- Mock profile and insight displays.
- Basic capture forms.

What becomes harder to copy:

- Years of user DM captures.
- Personal signal scoring tuned by repeated user behavior.
- Evidence graph with traceable reasons saved.
- Personal agent context packs accepted by user workflows.
- Instagram Inbox habit plus browser extension plus Obsidian/MCP export loop.

## Instagram Inbox Production Checklist

- Create/verify Meta app.
- Configure Instagram professional account.
- Subscribe app to Instagram Messaging webhooks.
- Add webhook signature verification.
- Add database table for inbox provisioning:
  - `user_id`
  - `instagram_sender_id`
  - `instagram_thread_id`
  - `routing_code_hash`
  - `status`
  - `created_at`
  - `last_seen_at`
- Add inbound message persistence.
- Add assistant replies:
  - "Saved."
  - "Why did this matter?"
  - "Sensitive?"
  - "Link to project?"
  - "Generate prompt?"
- Add abuse controls:
  - rate limit
  - blocklist
  - replay detection
  - unknown sender quarantine
- Add privacy controls:
  - mark sensitive
  - exclude from profile
  - delete thread-derived memories

## Risk Register

| Risk | Severity | Status | Recommendation |
|---|---:|---|---|
| Dependency vulnerabilities require breaking upgrades | High | Open | Dedicated hardening PR |
| Webhook POST lacks signature verification | High | Open | Add before production Meta launch |
| DM captures not persisted | Medium | Expected MVP gap | Add storage and queue |
| Thread routing not durable | Medium | Expected MVP gap | Add routing table |
| RouteViews file growing large | Low | Manageable | Split when behavior expands |
| Existing lint warnings | Low | Non-blocking | Clean in maintenance PR |

## Final Assessment

Scores:

- Product direction: 9/10
- Differentiation: 8/10
- Code quality for current scope: 8/10
- Security for demo/MVP scope: 7/10
- Security for production Instagram launch: 5/10 until signature verification and routing persistence land
- Test coverage for new logic: 8/10
- Overall repo readiness for PR merge: 8/10

Final status:

`READY TO MERGE AS STRATEGIC/MVP LAYER`

Not yet ready for:

`PRODUCTION INSTAGRAM DM INGESTION`

That requires the follow-up production checklist above.
