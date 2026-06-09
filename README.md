# Recall

**Capture everything. Find anything. Think faster.**

Turn everything you save and say into usable knowledge. Your AI-powered knowledge layer — save from social, capture with voice, find anything with semantic search.

You've saved thousands of posts across Instagram, YouTube, X, TikTok, Reddit, and more. Most of them you'll never see again. Recall pulls them all together, enriches them with AI, and makes them findable by meaning — not just keywords.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **Multi-Platform Import** — Pull saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more
- **AI Enrichment** — Auto-generate summaries, tags, sentiment, and extract entities (bring your own LLM key)
- **Semantic Search** — Find content by meaning, not just keywords
- **Knowledge Graph** — Discover connections between saved items through shared entities and topics
- **Shareable Boards** — Organize into curated boards with shareable URLs
- **Chrome Extension** — Auto-sync from Instagram and X
- **Obsidian Export** — Export your enriched library to markdown
- **Local-First** — Your data stays on your machine (JSON file storage)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/manazoid4/recall.git
cd recall

# Install dependencies
npm install

# Initialize the database
npm run db:setup

# Seed demo data (optional)
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Recall.

### Windows Users

Double-click `start.bat` — it handles everything automatically.

## 🎯 How It Works

1. **Import** — Upload JSON exports, paste URLs, or use the Chrome extension
2. **Enrich** — AI generates summaries, tags, and extracts entities (your LLM key, zero cost to us)
3. **Discover** — Search by meaning, explore the knowledge graph, organize into boards

## 💰 Pricing

**Free Tier** — 50 items, full-text search, manual import, 1 board

**Pro Lifetime** — £49 one-time payment
- Unlimited saved items
- Semantic (AI) search
- AI enrichment (summaries, entities, topics)
- Knowledge graph
- Unlimited boards
- Shareable public boards
- Chrome extension auto-sync
- Obsidian export
- Priority support

**Why lifetime?** We're not building a subscription farm. You pay once, you own it. No surprise price hikes, no feature gating. Bring your own LLM key means zero inference cost to us — that's why we can do lifetime pricing.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Database | JSON file storage (local-first) |
| AI | BYO key — OpenAI, Anthropic, Google, Groq, Together, DeepSeek, Mistral, Cohere, OpenRouter, Ollama |
| Browser Extension | Chrome MV3 (TypeScript) |
| Hosting | Vercel |
| Icons | Lucide React |

## 📁 Project Structure

```
recall/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── boards/            # Boards management
│   ├── b/[slug]/          # Individual board view
│   ├── graph/             # Knowledge graph visualization
│   ├── library/           # Main library view
│   ├── onboarding/        # Setup wizard
│   ├── pricing/           # Pricing page
│   ├── settings/          # Settings page
│   └── upload/            # Import content
├── components/            # React components
├── extension/             # Chrome extension
├── lib/                   # Core logic
│   ├── ai/               # AI providers and enrichment
│   ├── db.ts             # JSON database layer
│   ├── settings.ts       # Settings management
│   └── types.ts          # TypeScript types
├── scripts/               # Database scripts
└── data/                  # JSON database (auto-created)
```

## 🔧 Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key settings:
- `KEY_ENCRYPTION_SECRET` — Random string for encrypting API keys
- `DEFAULT_LLM_PROVIDER` — Your preferred AI provider (openai, anthropic, etc.)
- `DEFAULT_LLM_MODEL` — Model to use (gpt-4o-mini, claude-3-5-sonnet, etc.)

## 🧩 Chrome Extension

The Chrome extension auto-syncs your saved posts from Instagram and X.

### Installation

```bash
cd extension
npm install
npm run build
```

Then load the `extension/dist` folder as an unpacked extension in Chrome.

## 📊 API Routes

- `GET/POST /api/items` — List/create saved items
- `GET/DELETE /api/items/[id]` — Get/delete single item
- `GET/POST /api/settings` — Get/save settings
- `POST /api/enrich` — Trigger AI enrichment
- `POST /api/search` — Semantic search
- `POST /api/ingest` — Bulk ingest from extension
- `GET/POST /api/boards` — List/create boards
- `GET /api/boards/[slug]` — Get board with items
- `GET /api/graph` — Get knowledge graph data
- `GET /api/stats` — Get statistics

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

The app is configured for Vercel with:
- Automatic deployments from `main` branch
- Cron job for periodic sync (every 6 hours)
- Serverless API routes

### Self-Hosted

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📝 License

MIT © [Manazoid4](https://github.com/manazoid4)

## 🙏 Acknowledgments

Built with Next.js, Tailwind CSS, and a lot of coffee.

---

**Stop losing what you've saved. Start using Recall.**
