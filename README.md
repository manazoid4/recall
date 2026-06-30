# Recall

Recall is a user-owned personal intelligence layer.

It turns everything a person chooses to save, watch, hear, read, and think into a living memory graph, profile, taste model, intent map, project map, and agent context layer.

## Product One-liner

Recall turns everything you save, watch, hear, read, and think into a living profile that powers better AI agents.

## Why It Exists

Most AI assistants start from zero. They do not know what you repeatedly save, what projects keep returning, what communication style you prefer, what values matter, or what direction your work is moving in.

Recall is the private memory operating system underneath future agents. It gives assistants structured, evidence-based context without pretending the model is a final truth about the user.

## Current MVP

- Universal capture surface for URLs, manual thoughts, notes, screenshots, social links, GitHub, Obsidian, JSON, voice, and future wearable placeholders.
- Typed memory, profile, insight, taste, intent, project, prompt, and agent-run data model.
- Demo memory graph with editable mock data.
- Deterministic mock agents for intake, transcript, vision, meaning, profile, taste, intent, pattern, contradiction, project, prompt, privacy, reflection, and future MCP context.
- Routes for dashboard, capture, inbox, profile, personality, taste, patterns, intent, memory, graph, projects, prompts, ask, export, settings, and agents.
- Privacy-first language: authorised/user-provided data only, traceable evidence, sensitive flags, profile exclusion, and export-first design.

## Architecture

- `app/` - Next.js App Router pages and UI components.
- `app/components/RouteViews.tsx` - Shared route-level views for the MVP.
- `app/components/CaptureConsole.tsx` - Interactive mock capture and processing flow.
- `lib/types.ts` - Core TypeScript product model.
- `lib/mockData.ts` - Demo memory/profile/taste/intent/project/prompt data.
- `lib/agents.ts` - Deterministic mock agent services.
- `app/api/sources/*` - Existing authorised source import endpoints.
- `lib/recallVault.ts` - Existing Obsidian inbox append helper.
- `tests/agents.test.ts` - Node test coverage for the mock agent pipeline.

## Instagram Inbox Capture

Recall's strongest future capture habit is message-first: users should be able to DM a Recall inbox with a post, reel, screenshot, link, voice note, or thought.

The MVP design uses a compliant shape:

- Shared Recall-owned Instagram professional inbox first.
- Private routing code per user, for example `RCL-MANAZ-9Q2`.
- Meta webhook verification at `/api/instagram/inbox/webhook`.
- Inbound messages normalize into Recall capture inputs.
- Connected creator/professional accounts can come later.
- No personal-account bot creation, scraping, impersonation, or password collection.

See `POSTMORTEM.md` for the product reasoning and moat analysis.

## Routes

- `/dashboard` - Overview, profile summary, themes, values, traits, insights, project and prompt suggestions.
- `/capture` - Universal capture form and mock processing preview.
- `/instagram-inbox` - DM-to-Recall capture setup.
- `/inbox` - Review queue by status with user-control actions.
- `/profile` - Living profile with evidence and confidence.
- `/personality` - Human-readable memory mirror.
- `/taste` - Taste graph.
- `/patterns` - Repeated topics, values, and project signals.
- `/intent` - Inferred goals, future direction, and action suggestions.
- `/memory` - Searchable/filterable memory library shell.
- `/graph` - Linked entity memory graph view.
- `/projects` - Project map.
- `/prompts` - Agent context prompt generator.
- `/ask` - Ask My Profile interface.
- `/export` - Markdown, JSON, profile, agent context, and MCP export placeholders.
- `/settings` - Privacy, sensitivity, exclusion, export, local-first, and encryption controls.
- `/agents` - Internal agent system map.

## Data Model

The MVP includes:

- `MemoryItem`
- `UserProfile`
- `ProfileInsight`
- `TasteNode`
- `IntentNode`
- `Project`
- `AgentPrompt`
- `AgentRun`

See `lib/types.ts` for the complete shape.

## Agent System

The agent services are deliberately simple and deterministic today. Their job is to make the product architecture understandable before real AI integrations are added.

- Intake Agent normalises capture input.
- Transcript Agent marks transcript placeholders for video/audio/voice.
- Vision Agent marks OCR and image-analysis placeholders.
- Meaning Agent extracts topics, values, aesthetics, tools, projects, and traits.
- Profile Agent updates the living user profile with evidence.
- Taste Agent updates taste nodes.
- Intent Agent infers goals and next actions.
- Pattern Agent finds repeated themes.
- Contradiction Agent finds tensions.
- Project Agent links memory to projects.
- Prompt Agent creates external AI agent prompts.
- Privacy Agent flags sensitive memories.
- Reflection Agent produces self-understanding summaries.
- Future MCP Agent is reserved for context-server export.

## Privacy Principles

- User-provided and authorised data only.
- No shady scraping, password collection, impersonation, or deception.
- Social support means pasted links, official exports, browser extension capture, or future authorised APIs.
- Every insight should trace to memory evidence.
- Sensitive inputs can be flagged.
- Inputs can be excluded from profile.
- Everything should be exportable.
- The profile is an assistive model, not a final truth.

## Local Development

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

## Roadmap

See `PRODUCT_MAP.md` and `ROADMAP.md`.
