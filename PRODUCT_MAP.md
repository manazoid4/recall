# Recall Product Map

## Product Pillars

1. Universal Input Layer
   - URLs, videos, audio, PDFs, screenshots, images, voice notes, manual thoughts, Obsidian notes, GitHub links, JSON/CSV exports, browser captures, and future device data.
   - Social media capture must stay authorised: pasted links, official exports, browser extension capture, future APIs, and Instagram DM inbox capture through approved messaging surfaces.

2. Memory Graph
   - Input -> topic -> value -> emotion -> project -> trait -> creator -> platform -> action -> agent prompt.

3. Living Profile
   - Evidence-based profile covering interests, values, beliefs, worldview, traits, communication style, humour, taste, learning style, decision style, productivity style, goals, frictions, emotional patterns, contradictions, and project obsessions.

4. Taste Graph
   - Visual, content, music/audio placeholder, lecture/speaker, creator, UI/product, writing, humour, ethical, and business/product inspiration taste.

5. Intent Graph
   - What the user saved, why it was saved, what it implies, which goal/project it supports, and what action or agent should handle it.

6. Agent Brain
   - Structured context packs for personal assistant, coding agent, Obsidian assistant, content agent, life admin, project manager, reflection, research, Hermes, Codex, OpenCode, and future MCP servers.

7. Privacy and Control
   - User ownership, traceable evidence, deletion, sensitivity, profile exclusion, export, consent boundaries, and local-first direction.

8. Capture Habit Moat
   - Recall should become the account users message when something matters.
   - The Instagram Inbox flow uses a shared Recall-owned professional inbox plus private routing codes first, with connected professional account mode later.

## Data Model

- `MemoryItem`
- `UserProfile`
- `ProfileInsight`
- `TasteNode`
- `IntentNode`
- `Project`
- `AgentPrompt`
- `AgentRun`

The current model lives in `lib/types.ts` and uses editable mock data from `lib/mockData.ts`.

## Route Map

- `/dashboard` - Main overview and Feed Recall quick action.
- `/capture` - Universal capture.
- `/instagram-inbox` - Instagram DM capture setup and moat explanation.
- `/inbox` - Processing queue and profile-control actions.
- `/profile` - Living profile.
- `/personality` - Human-readable mirror.
- `/taste` - Taste graph.
- `/patterns` - Pattern finder.
- `/intent` - Intent graph.
- `/memory` - Memory library.
- `/graph` - Linked memory entity graph.
- `/projects` - Project map.
- `/prompts` - Agent prompt generator.
- `/ask` - Ask My Profile.
- `/export` - Markdown/JSON/profile/context exports.
- `/settings` - Privacy and data controls.
- `/agents` - Internal agent system map.

## Agent Map

- Intake Agent - normalises capture inputs into `MemoryItem`.
- Transcript Agent - transcript placeholders for video, audio, lecture, podcast, and voice.
- Vision Agent - OCR and visual analysis placeholders.
- Meaning Agent - extracts topics, values, emotions, aesthetics, tools, people, projects, and traits.
- Profile Agent - updates living profile suggestions from evidence.
- Taste Agent - updates taste graph nodes.
- Intent Agent - infers goals, projects, and next actions.
- Pattern Agent - finds repeated themes.
- Contradiction Agent - finds tensions.
- Project Agent - links memory items to projects.
- Prompt Agent - generates prompts for outside AI agents.
- Privacy Agent - flags sensitivity and exclusion boundaries.
- Reflection Agent - creates weekly/monthly summaries.
- Future MCP Agent - prepares future context-server exposure.
- Instagram Inbox Agent - turns authorised DMs into memory items and asks follow-up context questions.

## MVP Scope

The current MVP is intentionally mock-first:

- Product reset and documentation.
- New data model and demo memory.
- Main route surface.
- Deterministic agent pipeline.
- Capture form that previews processing.
- Prompt/export/profile surfaces that demonstrate the future loop.

## Future Roadmap

- Browser extension capture.
- Instagram DM inbox capture with webhook verification and thread routing.
- Instagram export parser.
- TikTok export and link enrichment.
- YouTube transcript integration.
- Podcast/audio transcription.
- Screenshot OCR.
- Local LLM processing.
- Model adapter for OpenAI, Anthropic, Gemini, and local models.
- Vector embeddings and semantic search.
- MCP server and agent API.
- Obsidian sync.
- Mobile share sheet.
- Wearable data import.
- Private local-first mode.
- Encrypted storage.
- Scheduled reflection digest.
- Profile version timeline.
- Multi-profile support.
- Agent context pack download.

## Integration Roadmap

1. Keep existing Obsidian append flow for trusted manual imports.
2. Add Instagram Inbox routing records for sender/thread -> Recall user.
3. Add durable storage for `MemoryItem`.
4. Add ingestion workers for transcripts/OCR.
5. Add embeddings and graph relationships.
6. Add profile versioning and accept/reject insight workflow.
7. Add export adapters for Obsidian, JSON, and agent context.
8. Add MCP context server once profile evidence is stable.

## Privacy Model

- Default private.
- User-provided data only.
- Explicit status for sensitive, excluded, archived, and added-to-profile items.
- Evidence IDs on every profile claim and prompt.
- Export and delete controls visible in the product surface.
- No cloning or impersonation features.
- No surveillance framing.
