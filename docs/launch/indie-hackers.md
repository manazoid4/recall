# Indie Hackers Launch — Saved Brain

---

## Product Page Content

### Tagline

Everything you've saved. Finally searchable.

### Description

You've saved thousands of posts across Instagram, YouTube, X, TikTok, Reddit. Most you'll never see again.

Saved Brain pulls them together, enriches them with AI, and makes them findable by meaning — not just keywords.

**What it does:**
- Import saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more
- AI generates summaries, tags, and extracts entities (bring your own LLM key)
- Semantic search: type "that video about Mars colonization" and find the Elon tweet from February
- Knowledge graph surfaces connections between saves you didn't know existed
- Organize into shareable boards with public URLs
- Chrome extension auto-syncs from Instagram and X
- Export to Obsidian markdown
- Your data stays on your machine (JSON file storage)

**Pricing:** £49 lifetime. No subscriptions. Free tier: 50 items, full-text search, 1 board.

**Why lifetime?** You bring your own LLM key. Zero inference cost to us. That's why we don't need a monthly fee.

**Stack:** Next.js 14, React, Tailwind, TypeScript. Solo dev. Open source (MIT).

---

## Launch Post

### Title

Launched Saved Brain — £49 lifetime, no subscriptions, BYO LLM key

### Body

**The problem I was solving:**

2,000+ saved posts across five platforms. I couldn't find anything. I'd remember saving something about Rust memory safety, but was it on Reddit? YouTube? Twitter? Gone forever.

**What I built:**

Saved Brain — a local-first app that pulls your saved content together, enriches it with AI, and makes it searchable by meaning.

**Key features:**
- Semantic search (meaning, not keywords)
- Knowledge graph (auto-discovers connections)
- Local-first (JSON file on your machine)
- BYO LLM key (zero cost to us = no subscription)
- Chrome extension, Obsidian export, shareable boards

**Pricing decision:**

I hate subscriptions. Most tools cost more in three months than I wanted to charge forever. The BYO LLM key model means zero ongoing inference cost — that's how £49 lifetime works. Free tier for testing: 50 items, no card required.

**Tech stack:**

Next.js 14, React, Tailwind, TypeScript. D3 for the knowledge graph. Vector search via provider embeddings. JSON file storage.

**Launch stats:**

[Update after launch with real numbers]

**What I learned:**

1. The LLM key requirement scares some people but builds trust with others. Transparency wins.
2. Local-first is a genuine differentiator, not just a privacy buzzword. People are tired of cloud lock-in.
3. Solo dev means fast iteration. Pushed a fix 2 hours into launch based on user feedback.

**Ask:**

Try the free tier. Star the repo if you're a dev. Share with someone who hoards saved posts.

GitHub: https://github.com/manazoid4/saved-brain

---

## Comment Response Templates

### "How are you handling payments?"

Gumroad for now. Simple, handles VAT, instant delivery. Might move to Paddle for more payment methods later. The £49 price point means low friction — most people decide in under 5 minutes.

### "What's your marketing plan?"

Product Hunt, Hacker News, Reddit (r/productivity, r/selfhosted, r/webdev, r/SideProject), Twitter thread, Instagram carousels, and Indie Hackers obviously. No paid ads yet — organic first, see what resonates, then double down. The knowledge graph screenshots are getting the best engagement so far.

### "Are you worried about platform APIs changing?"

Yes, that's why the Chrome extension is the primary import method for Instagram and X. It scrapes the save page, not the API. For platforms with export features (Pocket, Reddit), we parse the JSON/CSV exports. If a platform shuts down API access, the extension approach still works.

### "What's next on the roadmap?"

1. Mobile app (PWA first, then native if demand)
2. More import sources (LinkedIn saves, Telegram, Discord)
3. Collaborative boards (shared editing)
4. API for third-party integrations
5. Better knowledge graph filtering and exploration

Priority is driven by user feedback, not my assumptions.

---

## Milestone Post Template

### Title

Saved Brain — [X] days since launch: [number] sales, [number] GitHub stars

### Body

Quick update on Saved Brain since launch:

**Sales:** [number] (£[amount] revenue)
**GitHub stars:** [number]
**Free tier signups:** [number]
**Refund requests:** [number]

**What worked:**
- [Tactic that drove most traffic]
- [Feature that converted most trials]

**What didn't:**
- [Tactic that flopped]
- [Assumption that was wrong]

**Changes made:**
- [Feature added based on feedback]
- [Pricing/page tweak]

**Next 30 days:**
- [Top priority]
- [Second priority]

Full transparency. Ask me anything.

---

## Engagement Strategy

- **Post launch thread**: Monday morning GMT (catches US and Europe)
- **Respond to comments**: Within 30 minutes for first 6 hours
- **Weekly updates**: Post milestone updates every 7 days for first month
- **Cross-post**: Link IH posts to Twitter and LinkedIn for amplification
- **Be honest**: IH community values transparency over polish
