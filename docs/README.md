# Saved-Brain

**Turn everything you've saved into a searchable, AI-enriched second brain.**

You've saved thousands of posts across Instagram, YouTube, X/Twitter, TikTok, and Reddit. Most of them you'll never look at again. Saved-Brain ingests your saved content, enriches it with AI summaries, tags, and embeddings, and makes it all searchable — by full-text or semantic meaning. Organize into shareable boards, discover connections through a knowledge graph, and finally get value from your digital hoard.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS 3.4 |
| Database | SQLite (local dev via better-sqlite3) / Vercel Postgres (production) |
| Vector search | sqlite-vss (local) / pgvector (production) |
| AI enrichment | BYO key — OpenAI, Anthropic, Google, Groq, Together, DeepSeek, Mistral, Cohere, OpenRouter, or Ollama (local) |
| Embeddings | OpenAI text-embedding-3, Ollama nomic-embed-text, or Cohere embed-english-v3 |
| Browser extension | Chrome MV3 (TypeScript) |
| Email digests | Resend / SMTP |
| Payments | LemonSqueezy ($49 one-time) |
| Hosting | Vercel (with cron sync every 6h) |
| Icons | Lucide React |
| Validation | Zod |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yourname/saved-brain.git
cd saved-brain

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env and add your settings (at minimum, KEY_ENCRYPTION_SECRET)

# 4. Initialize the database
npx tsx scripts/setup-db.ts

# 5. (Optional) Seed demo data
npx tsx scripts/seed-demo.ts

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Saved-Brain dashboard.

### Windows Quick Start

Double-click `start.bat` — it handles install, env setup, DB init, and dev server launch automatically.

## Features

- **Multi-platform ingestion** — Import saved posts from Instagram, YouTube, X/Twitter, TikTok, Reddit, and more via platform exports or the Chrome extension
- **AI enrichment pipeline** — Auto-generate summaries, tags, sentiment analysis, topic extraction, entity recognition, and quality scores for every saved item
- **Semantic search** — Find content by meaning, not just keywords. Toggle between full-text and vector similarity search
- **Knowledge graph** — Discover connections between saved items through shared topics, entities, and concepts
- **Curated boards** — Organize items into public or private boards with shareable URLs and OG images
- **Clone and lineage tracking** — Others can clone your public boards; all clones trace back to the original
- **Obsidian sync** — Export enriched items as Markdown notes directly into your Obsidian vault
- **Email resurface digests** — Get weekly emails resurfacing your best forgotten saves
- **BYO AI key** — Use your own API key or run local models through Ollama. Your data never leaves your infrastructure
- **Open schema** — Standard JSON format for saved items means you can build custom importers for any platform
- **One-time pricing** — $49 once, no subscription. Self-host for free

## Project Structure

```
saved-brain/
├── app/                  # Next.js App Router pages and API routes
├── components/           # React components (PostCard, SearchBar, etc.)
├── extension/            # Chrome MV3 extension (background, content scripts)
├── lib/                  # Core library code
│   ├── ai/              # AI enrichment, embedding, and provider logic
│   ├── db.ts            # Database connection and schema initialization
│   └── types.ts         # TypeScript type definitions
├── docs/                 # Documentation
├── marketing/            # Marketing assets and launch materials
├── scripts/              # Setup and utility scripts
└── data/                 # SQLite database files (gitignored)
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests where applicable
4. Run type checking: `npm run lint`
5. Commit with a clear message: `git commit -m "feat: add TikTok ingestion adapter"`
6. Push and open a Pull Request

### Development Guidelines

- Follow existing code patterns and conventions
- Use TypeScript strict mode — no `any` types
- Keep components small and focused
- Write meaningful commit messages following Conventional Commits
- All API routes should return `ApiResponse<T>` format: `{ data: T | null, error: string | null }`
- Database changes must be backward-compatible (additive schema only)
- Test your changes with `npx tsx scripts/seed-demo.ts` to verify data flows

## License

MIT
