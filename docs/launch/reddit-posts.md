# Reddit Launch Posts — Recall

---

## r/productivity

### Title

I built an app that actually finds your saved posts across all platforms — semantic search + knowledge graph

### Body

I've got 2,000+ saved posts across Instagram, YouTube, X, TikTok, Reddit. I never found any of them again.

So I built Recall. It pulls your saved content from every platform into one place, enriches it with AI, and makes it searchable by meaning — not just keywords.

**What that means in practice:**
- Type "that video about Mars colonization" → find the Elon tweet from February
- Save a Rust video, a Reddit thread on memory safety, and a systems engineering tweet → the knowledge graph connects all three into a learning path
- Organise into shareable boards with public URLs
- Export everything to Obsidian markdown

**Privacy:** Your data stays on your machine in a JSON file. No cloud. You bring your own LLM key (OpenAI/Anthropic) for AI features — your key, your cost, your control.

**Pricing:** £49 lifetime. No subscriptions. Free tier: 50 items, full-text search, 1 board.

Built with Next.js 14, React, Tailwind, TypeScript. Open source (MIT).

Would love feedback from anyone else who hoards saved content they never see again.

GitHub: https://github.com/manazoid4/saved-brain

---

## r/selfhosted

### Title

Recall — local-first AI knowledge base for your saved posts. JSON storage, BYO LLM key, £49 lifetime.

### Body

Self-hosters, this one's for you.

Recall is a local-first app that turns your saved posts (Instagram, YouTube, X, TikTok, Reddit, Pocket) into a searchable, AI-enriched knowledge base.

**Why it's self-hoster friendly:**
- Data lives in a JSON file on your machine. No database server required.
- Runs as a Next.js app — `npm install && npm run dev`
- AI enrichment uses YOUR LLM key. No proxy, no markup, no vendor lock-in.
- No cloud dependencies except your chosen LLM provider (optional — full-text search works without it)
- Export to Obsidian markdown with wikilinks and frontmatter

**Features:**
- Semantic search (meaning, not keywords)
- Knowledge graph (connections between saves)
- Shareable boards
- Chrome extension for Instagram/X auto-sync
- Windows users: double-click `start.bat`

**Pricing:** £49 lifetime for unlimited items + AI features. Free tier: 50 items. Open source (MIT) — you can self-host the full app without paying, the license is for convenience and support.

GitHub: https://github.com/manazoid4/saved-brain

Curious how this compares to your current bookmarking setup.

---

## r/webdev

### Title

Showoff: I built an AI knowledge base with Next.js 14, semantic search, and a force-directed knowledge graph

### Body

Stack: Next.js 14, React, Tailwind, TypeScript. JSON file storage. D3 force graph for the knowledge visualisation.

**What it does:**
- Import saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket
- AI enrichment (summaries, tags, entity extraction) via user's own LLM key
- Semantic search with vector embeddings
- Knowledge graph built from shared entities and topics
- Shareable boards with public URLs
- Chrome extension for auto-sync
- Obsidian markdown export

**Architecture:**
- Local-first: JSON storage, no database
- LLM calls go directly from client to provider (user's key)
- Vector search runs locally or via provider's embedding API
- Knowledge graph: entity extraction → shared topic matching → D3 force simulation

**Pricing:** £49 lifetime. Free tier: 50 items. Open source (MIT).

**Why I'm posting:** Looking for feedback from devs who've built similar tools. How did you handle vector storage without a proper DB? Current approach is in-memory with periodic JSON dumps — works for personal use but curious about scaling patterns.

GitHub: https://github.com/manazoid4/saved-brain

---

## r/SideProject

### Title

£49 lifetime, no subscriptions — launched my AI knowledge base for saved posts

### Body

**The problem:** I had 2,000+ saved posts across five platforms. Couldn't find anything.

**The solution:** Recall — pulls saved content together, AI-enriches it, makes it searchable by meaning.

**Key features:**
- Semantic search ("that video about Mars colonization" → finds the Elon tweet)
- Knowledge graph (discovers connections between unrelated saves)
- Local-first (JSON file on your machine)
- BYO LLM key (zero cost to us = no subscription needed)
- Chrome extension, Obsidian export, shareable boards

**Pricing:** £49 lifetime. Free tier: 50 items, full-text search, 1 board.

**Stack:** Next.js 14, React, Tailwind, TypeScript. Solo dev.

**Launch stats so far:** [Update after launch]

**What I learned:** The LLM key requirement scared some people but delighted others. Being transparent about costs builds trust. Local-first is a genuine differentiator, not just a privacy buzzword.

GitHub: https://github.com/manazoid4/saved-brain

Happy to answer questions about the build, pricing model, or launch strategy.

---

## Posting Tips

- **r/productivity**: Post Tuesday 14:00 GMT (morning US, afternoon Europe)
- **r/selfhosted**: Post Wednesday 18:00 GMT (evening US, catches both coasts)
- **r/webdev**: Post Thursday 14:00 GMT (devs checking during work hours)
- **r/SideProject**: Post Friday 12:00 GMT (end-of-week project browsing)
- **Engagement**: Reply to every comment within 30 minutes for first 4 hours
- **Don't**: Use URL shorteners (Reddit filters them). Use full GitHub URL.
- **Do**: Be honest about limitations. Reddit smells marketing from miles away.

---

## Comment Response Templates

### "How is this different from Notion?"

Notion is a general-purpose workspace. Recall is purpose-built for saved social media content. The semantic search understands "that video about Mars colonization" — Notion's search doesn't. The knowledge graph auto-connects related saves — Notion requires manual linking. And Recall is local-first with JSON storage, not cloud-dependent.

### "Why do I need to pay if it's open source?"

The code is MIT licensed — you can self-host without paying. The £49 is for a convenience build (no setup, auto-updates) + unlimited items + AI features + support. Think of it like Obsidian — free to use, paid for extras and convenience.

### "What if I don't have an LLM key?"

Free tier works without one — 50 items, full-text search, 1 board. For AI features, an OpenAI key costs ~$5 for months of typical use. We don't mark it up or proxy it. Your key, your cost, your control.
