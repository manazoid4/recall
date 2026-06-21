# Recall Signals

Creative intelligence from the posts your team saves.

Recall helps agencies capture source material, preserve why it mattered, find repeated patterns, build evidence boards, and turn research into client-ready decisions.

## Working features

- Explicit social and web capture with source provenance
- AI enrichment and semantic search
- Knowledge graph and private or shareable boards
- Voice, URL, JSON, GitHub-star, and browser-extension capture
- Execution Router for Claude, Codex, and OpenCode task plans
- Markdown/Obsidian export
- Clerk authentication with owner-scoped persistence

## Local development

```bash
npm install
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm test
npm run lint
npm run extension:test
npm run extension:build
npm run build
```

## Stack

- Next.js App Router
- TypeScript and Tailwind CSS
- Clerk authentication
- Supabase/Postgres in production
- SQLite for local development
- Vercel deployment
- Chrome MV3 extension

## Product direction

Recall is built for creative, social-content, and influencer agencies. The commercial path is a £500 founding pilot followed by monthly Studio, Agency, and Agency Plus plans.

Team workspaces, shared routing history, permissions, and automated cited briefs are labelled as pilot or upcoming until they are production-ready.

## Repository

GitHub: https://github.com/manazoid4/recall

License: MIT
