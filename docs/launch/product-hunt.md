# Product Hunt Launch Post — Recall

---

## Tagline

Everything you've saved. Finally searchable.

---

## Description

You've saved thousands of posts across Instagram, YouTube, X, TikTok, Reddit. Most you'll never see again.

Recall pulls them together, enriches them with AI, and makes them findable by meaning — not just keywords.

**What it does:**
- Import saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more
- AI auto-generates summaries, tags, and extracts entities (bring your own LLM key)
- Semantic search finds content by meaning — type "that video about Mars colonization" and find the Elon tweet from February
- Knowledge graph surfaces connections between saved items you didn't know existed
- Organize into shareable boards with public URLs
- Export everything to Obsidian markdown
- Chrome extension auto-syncs from Instagram and X

**Your data stays on your machine.** JSON file storage. No cloud lock-in.

**Pricing:** £49 lifetime. No subscriptions. No feature gates. Bring your own LLM key means zero inference cost to us — that's why we don't need a monthly fee.

Free tier: 50 items, full-text search, 1 board.

Built with Next.js 14, React, Tailwind, TypeScript. Open source.

---

## Maker Comment

Hey Product Hunt — I'm the solo dev behind Recall.

I built this because I had a problem: 2,000+ saved posts across five platforms and I couldn't find anything. I'd remember saving something about Rust memory safety, but was it on Reddit? YouTube? Twitter? Gone.

Recall is local-first. Your data lives in a JSON file on your machine. We don't host it, we don't mine it, we don't lose it when we get acquired. You bring your own OpenAI/Anthropic key for AI enrichment — that means zero cost to us, which is why we can charge £49 once instead of $15/month forever.

The knowledge graph is my favourite feature. I saved a Rust video, a Reddit thread on memory safety, and a tweet from a systems engineer. Recall connected all three. I didn't know I was building a learning path.

Happy to answer questions. Fire away.

---

## First 5 Comments Strategy

### Comment 1 (Maker, ~30 mins after launch)

Thanks for the upvotes everyone. A few questions coming in about the LLM key — yes, you need your own OpenAI or Anthropic key. We don't mark it up, we don't proxy it. Your key, your cost, your control. Typical enrichment cost is pennies per hundred items. That's how we keep the price at £49 lifetime instead of a subscription.

### Comment 2 (Maker, responding to "how is this different from Pocket?")

Great question. Pocket is a read-later app — you save articles, you read them later. Recall is a knowledge base for everything you've already saved across every platform. The semantic search and knowledge graph are the difference: Pocket can't connect your Instagram save to your Reddit thread to your YouTube video. Recall can.

### Comment 3 (Maker, responding to "is it really local-first?")

Yes. Your data lives in a JSON file on your machine. The app runs locally (Next.js dev server or build). The only external calls are to your own LLM provider for enrichment, and those are optional — you can run full-text search and boards without ever using AI.

### Comment 4 (Maker, ~2 hours after launch)

Update: Just pushed a fix for Instagram import based on early feedback. That's the beauty of shipping fast. If you hit any snags, drop a comment or open an issue on GitHub — I respond to both.

### Comment 5 (Maker, ~4 hours after launch)

For the devs asking: the knowledge graph is built with entity extraction + shared topic matching. When AI enrichment runs, it pulls out entities (people, companies, technologies, concepts) and topics. The graph visualises overlaps. It's not magic, but it feels like it when you see three unrelated saves connect into a pattern.

---

## Media Suggestions

1. **Hero GIF** (required): 5-second screen recording showing semantic search — typing "that video about Mars colonization" and the Elon tweet appearing
2. **Screenshot 1**: Clean dashboard showing imported items from multiple platforms
3. **Screenshot 2**: Knowledge graph visualization with connected nodes
4. **Screenshot 3**: Board creation and sharing flow
5. **Screenshot 4**: Chrome extension saving from X in real time
6. **Thumbnail**: 240x240, bold text "Everything you've saved. Finally searchable." with brain icon

---

## CTA Links

- Website: https://savedbrain.app (or GitHub README if no landing page yet)
- GitHub: https://github.com/manazoid4/saved-brain
- Buy: [Gumroad/Paddle link]
- Demo video: [Loom link]

---

## Launch Timing

- **Day**: Tuesday or Wednesday
- **Time**: 00:01 PST (midnight Pacific) for maximum visibility
- **Pre-launch**: Post "Launching tomorrow" on Twitter/X and LinkedIn 24 hours before
