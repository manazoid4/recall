# Execution Router Design

## Outcome

Add an authenticated Recall workspace that turns a large objective and a list of tasks into a coordinated execution plan for Claude, Codex, and OpenCode.

The first release must produce something immediately useful without requiring model credentials, new persistence, or a new database table.

## User flow

1. The user opens **Router** from the Recall sidebar.
2. They enter one objective and one task per line.
3. They select the agents available for the work.
4. Recall assigns each task to the strongest available agent.
5. Recall presents:
   - task ownership;
   - rationale;
   - dependency order;
   - verification expectations;
   - one complete, copyable prompt per agent.
6. The latest input is retained in browser storage for the same browser.

## Revenue path

The Router is a product-led acquisition surface:

- the landing page promotes a concrete working outcome: route the next client brief;
- the free authenticated workspace proves the workflow before a sales conversation;
- generated plans end with a clearly labelled founding-pilot offer;
- pricing links to a working pre-addressed email enquiry rather than a dead or misleading checkout;
- the pilot is £500 for four weeks and is credited against the first three paid months after conversion.

The page may describe shared routing history, reusable agency templates, permissions, and outcome tracking as paid-plan capabilities only when marked **Agency pilot** or **Coming next**.

## Routing model

Routing is deterministic and transparent.

- **Codex** leads implementation, architecture, debugging, security, tests, deployment, Git, and repository work.
- **Claude** leads product definition, UX, visual design, positioning, writing, strategy, and synthesis.
- **OpenCode** leads independent QA, audits, research, local automation, and secondary verification.

Keyword evidence contributes to each agent score. If a task is ambiguous, the router assigns it to Codex because Codex owns integration and shipping. If Codex is unavailable, it uses the first selected agent.

The generated plan orders research and design work before implementation, and implementation before verification and shipping.

## Architecture

- `lib/execution-router.ts` contains all domain types, scoring, ordering, and prompt generation.
- `app/(app)/router/page.tsx` is a small client boundary for form state, browser persistence, clipboard actions, and rendering.
- `components/Sidebar.tsx` gains a Router navigation entry.
- `app/(marketing)/page.tsx` surfaces the Router as the strongest product demonstration.
- `app/(marketing)/pricing/page.tsx` uses a working pilot enquiry path.
- `tests/unit/execution-router.test.ts` proves routing, fallback, ordering, and prompt completeness.

No API route, database table, dependency, or AI provider is added.

## Data and privacy

Objectives and tasks remain in the browser. The feature does not send them to Recall servers or external model providers. Browser storage is explicitly described as device-local and must not be presented as team persistence.

## Interface

The page uses the existing Recall semantic tokens, dark-mode behavior, strong hierarchy, restrained amber accent, and dense evidence-style panels.

The interface includes:

- a concise page header;
- objective and tasks inputs;
- three agent selection controls;
- a primary **Route the work** action;
- an ordered assignment list;
- agent-specific prompt panels;
- copy buttons with accessible status text;
- an empty state explaining the expected input.

## Error handling

- Empty objectives produce no plan and show an inline validation message.
- Empty task lines are ignored.
- No selected agents produces an inline validation message.
- Clipboard failure leaves the prompt visible and displays a manual-copy message.
- Browser-storage errors do not block planning.

## Non-goals

- Executing agents from Recall
- GitHub or Vercel automation
- Team collaboration
- Server persistence
- Usage billing
- LLM-generated plans
- Arbitrary custom agent definitions

## Acceptance criteria

- A user can enter an objective and tasks and receive an ordered plan.
- Every non-empty task is assigned exactly once.
- Agent assignments have a visible rationale.
- Unavailable agents never receive tasks.
- Every selected agent with assigned work receives a complete copyable prompt.
- Generated prompts include objective, owned tasks, dependencies, boundaries, verification, and handoff expectations.
- The page works on mobile and desktop with keyboard navigation.
- Inputs are not transmitted to the server.
- Landing and pricing pages provide working routes into the feature and pilot enquiry.
- Unit tests, type checking, lint, and production build pass.
