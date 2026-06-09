# Hacker News "Show HN" Launch Post — Recall

---

## Title

Show HN: Recall — AI-enriched knowledge base for everything you've saved

---

## Body

I've saved thousands of posts across Instagram, YouTube, X, TikTok, Reddit. I never found any of them again.

So I built Recall — a local-first app that pulls your saved content together, enriches it with AI, and makes it searchable by meaning, not just keywords.

**What it does:**
- Import from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more
- AI generates summaries, tags, and extracts entities (you bring your own LLM key)
- Semantic search: type "that video about Mars colonization" and find the Elon tweet from February
- Knowledge graph surfaces connections between saves you didn't know existed
- Organize into shareable boards
- Chrome extension auto-syncs from Instagram and X
- Export to Obsidian markdown

**Stack:** Next.js 14, React, Tailwind, TypeScript. JSON file storage. No cloud required.

**Pricing:** £49 lifetime. No subscriptions. Free tier: 50 items, full-text search, 1 board.

The LLM key requirement is intentional. Your key, your cost, your control. Typical enrichment is pennies per hundred items. That's how we avoid the subscription trap.

Code: https://github.com/manazoid4/saved-brain

Would love feedback from anyone else drowning in saved posts they can't find.

---

## Follow-Up Comments Strategy

### Response to "Why not just use bookmarks?"

Bookmarks save URLs. They don't tell you what's inside, they don't connect related content across platforms, and they don't let you search by meaning. Recall extracts the actual content, summarises it, tags it, and builds a graph of connections. A bookmark is a pointer. Recall is a library.

### Response to "£49 is steep for a side project"

Fair. The free tier gives you 50 items and full-text search — that's enough to test whether it solves your problem. The lifetime price is a bet that you'll keep saving content for years. Most subscription tools cost more in three months. And because you bring your own LLM key, we're not burning cash on inference every month.

### Response to "Is the code actually open source?"

Yes, MIT license. https://github.com/manazoid4/saved-brain. You can self-host, fork, modify, whatever. The paid tier is essentially a convenience license for unlimited items and AI features — the code is open, the compiled app is what you're buying.

### Response to "How does the knowledge graph work?"

When AI enrichment runs, it extracts entities (people, companies, technologies, concepts) and topics from each saved item. The graph visualises overlaps — two saves that mention "Rust" and "memory safety" connect. Three saves that share "Elon Musk" and "SpaceX" cluster. It's entity extraction + shared topic matching, visualised with D3/Force Graph. Not magic, but useful magic.

### Response to "What about privacy?"

Your data lives in a JSON file on your machine. The app runs locally. The only external calls are to your own LLM provider, and you control that key. We don't see your saves, we don't store them, we can't lose them in a data breach. Local-first by design.

---

## Timing and Monitoring

- **Post time**: Tuesday or Wednesday, 08:00-10:00 PST (catches both US coasts and Europe)
- **Monitor**: Refresh /newest for first 30 mins, then respond to comments within 15 minutes
- **Don't**: Ask friends to upvote (HN detects ring voting). Let it rise organically.
- **Do**: Reply to every substantive comment, even critical ones. HN respects makers who engage.

---

## Backup Title Options

1. Show HN: Recall — local-first AI knowledge base for your saved posts
2. Show HN: I built a searchable brain for everything I've saved across social media
3. Show HN: Recall — semantic search for your Instagram, Reddit, YouTube saves
