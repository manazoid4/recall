# Recall Post-mortem and Future Strategy

## Executive Summary

Recall's first reset moved it away from an agency creative-intelligence product and toward a user-owned personal intelligence layer. That was directionally correct, but still not unique enough. A dashboard that accepts saved links and shows a profile can be copied. The durable product has to own the capture habit, evidence graph, and agent context layer.

The next version should make Recall feel less like software you visit and more like a trusted person you message. The strongest wedge is an Instagram-native capture loop: users send posts, reels, screenshots, links, voice notes, and thoughts to a Recall inbox in DM, and those messages become structured memories.

## What Went Right

- The product direction is now future-facing: memory graph, living profile, taste graph, intent graph, project map, and agent brain.
- The app now has a route surface that makes the vision understandable.
- The model is evidence-based, which avoids creepy identity claims.
- The architecture includes deterministic mock agents, so future AI providers have obvious insertion points.
- Privacy language is stronger: user-provided data, sensitivity flags, exclusion, export, no shady scraping.

## What Was Still Weak

1. Capture was still too app-shaped.
   - Users do not want to open another dashboard every time they find something meaningful.
   - The winning capture surface should live where the memory happens.

2. The moat was not explicit.
   - A memory dashboard can be copied.
   - A living taste/intent graph with years of high-intent captures is harder to copy.
   - A trusted DM inbox that becomes habitual is harder again.

3. The product was not weird enough.
   - The future of AI is not "better bookmarking."
   - The future is agents that know what a person repeatedly chooses, avoids, builds, studies, and returns to.

4. The Instagram idea needed compliance boundaries.
   - "Every user gets an Instagram bot" is the right feeling, but not literally viable for ordinary personal accounts.
   - The compliant shape is a Recall-owned professional inbox, or connected eligible professional accounts, using authorised messaging webhooks.

## Root Cause

The reset solved positioning but not habit formation. It explained the agent brain but did not yet make feeding it feel native, social, and immediate.

## Future Thesis

Recall should become the personal context layer for AI agents by owning three scarce things:

1. High-intent personal evidence.
2. A long-term memory graph built from repeated choices.
3. A low-friction capture ritual that feels like messaging a trusted person.

## Strategic Moats

### 1. Capture Habit Moat

If Recall becomes the account users DM whenever something matters, it owns the reflex. The input layer becomes more important than the dashboard.

### 2. Evidence Graph Moat

Every save becomes structured evidence connected to topics, values, emotions, projects, traits, creators, and prompts. Over time, the graph compounds.

### 3. Taste and Intent Moat

Generic AI tools know what users ask today. Recall knows what users repeatedly choose when nobody is asking. That is a deeper signal.

### 4. Agent Context Moat

Recall should generate context packs for Codex, Claude, OpenCode, Obsidian assistants, project managers, and future MCP tools. Agents become better because Recall exists.

### 5. Trust and Privacy Moat

The product should be explicit: no scraping, no password collection, no impersonation, no surveillance framing. Users can mark sensitive, exclude, delete, and export.

### 6. Workflow Distribution Moat

Instagram DM capture, browser extension capture, mobile share sheet, Obsidian sync, and MCP server distribution create many small doors into the same memory graph.

## Instagram Inbox Strategy

### User Feeling

When a user joins Recall, they get a personal-feeling inbox:

> "DM anything to your Recall inbox."

They can send:

- Instagram posts and reels
- TikToks or YouTube links
- screenshots
- voice notes
- stray thoughts
- links
- project ideas
- "why I saved this" follow-ups

Recall replies like a lightweight assistant:

- "Saved. Why did this matter?"
- "Added to Recall. Looks connected to AI agents and personal OS."
- "Sensitive?"
- "Turn this into a project prompt?"

### Compliant Technical Shape

Phase 1 should not create fake personal-account bots.

Use one of these modes:

1. Shared Recall inbox
   - `@recall.inbox` is a Recall-owned Instagram professional account.
   - Each user gets a private routing code such as `RCL-MANAZ-9Q2`.
   - The first DM links the Instagram sender/thread to the Recall user.
   - Future DMs from that thread route automatically.

2. Connected creator/professional account
   - Eligible users connect their own Instagram professional account.
   - Recall receives authorised messaging webhooks.
   - Useful for creators, teams, and power users.

3. Future dedicated inbox
   - For high-value users, provision a branded inbox through approved business messaging infrastructure if platform rules allow.
   - This is a future enterprise/creator feature, not MVP.

## Product Principle

Recall should not ask: "Where did you save this?"

It should ask: "What did this mean to you?"

## Next Build Priorities

1. Build the Recall Instagram Inbox onboarding page.
2. Store Instagram thread routing records.
3. Add webhook verification and inbound message normalization.
4. Convert DMs into `MemoryItem` records.
5. Add assistant-style replies asking for reason saved, sensitivity, and project link.
6. Add MCP/context pack export.
7. Add semantic search and profile version timeline.

## Failure Mode to Avoid

Do not become:

- a social media scraper
- a saved-post dashboard
- a personality quiz
- a generic second brain
- a creepy clone tool
- a corporate SaaS analytics product

Recall should feel like a private memory mirror that future agents can trust.
