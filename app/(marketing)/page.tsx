import Link from 'next/link';
import {
  Brain,
  Search,
  GitBranch,
  LayoutGrid,
  Sparkles,
  Download,
  ArrowRight,
  BookOpen,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Multi-Platform Import',
    description: 'Pull saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more. One place for everything.',
  },
  {
    icon: Sparkles,
    title: 'AI Enrichment',
    description: 'Auto-generate summaries, tags, sentiment, and extract entities. Your LLM, your API key — zero inference cost to us.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Find content by meaning, not just keywords. Toggle between full-text and vector similarity search.',
  },
  {
    icon: GitBranch,
    title: 'Knowledge Graph',
    description: 'Discover connections between saved items through shared topics, entities, and concepts. Cross-platform linking.',
  },
  {
    icon: LayoutGrid,
    title: 'Shareable Boards',
    description: 'Organize into curated boards with shareable URLs. Clone others\' boards. All clones trace back to the original.',
  },
  {
    icon: Download,
    title: 'Obsidian Export',
    description: 'Export your enriched library to Obsidian-compatible markdown. Your second brain, portable and future-proof.',
  },
];

const platforms = [
  { name: 'Instagram', icon: Instagram },
  { name: 'YouTube', icon: Youtube },
  { name: 'X/Twitter', icon: Twitter },
  { name: 'Reddit', icon: MessageCircle },
  { name: 'Pocket', icon: BookOpen },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5 text-sm text-muted">
            <Brain className="h-4 w-4 text-yellow" />
            <span>Your second brain is ready</span>
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Everything you&apos;ve saved.
            <br />
            <span className="text-yellow">Finally searchable.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted">
            You&apos;ve saved thousands of posts across platforms. Most you&apos;ll never see again.
            Saved Brain pulls them together, enriches them with AI, and makes them findable by meaning — not just keywords.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-8 py-4 text-lg font-bold text-ink transition-colors hover:bg-surface"
            >
              See Pricing
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            No credit card required · 50 items free · Bring your own LLM key
          </p>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-y border-line bg-panel px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted">
            Import from your favourite platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-muted">
                <p.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black text-ink">Built for people who save everything</h2>
            <p className="mt-4 text-lg text-muted">
              The tools to turn your digital hoard into a searchable, shareable knowledge base.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-line bg-panel p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow/10 text-yellow transition-colors group-hover:bg-yellow group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-panel px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-4xl font-black text-ink">From saved to searchable in 90 seconds</h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { step: '1', title: 'Import', desc: 'Upload a JSON export, paste URLs, or use the Chrome extension to sync your saved posts.' },
              { step: '2', title: 'Enrich', desc: 'AI generates summaries, tags, and extracts entities. Your LLM key — zero cost to us.' },
              { step: '3', title: 'Discover', desc: 'Search by meaning, explore the knowledge graph, organize into shareable boards.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow text-2xl font-black text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold text-ink">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-ink p-12 text-center">
          <h2 className="text-3xl font-black text-white">Stop losing what you&apos;ve saved</h2>
          <p className="mt-4 text-lg text-white/70">
            Join thousands turning their saved posts into a searchable second brain.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-orange"
          >
            Start Building Your Brain
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-panel px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-yellow" />
            <span className="font-bold text-ink">Saved Brain</span>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </div>
          <p className="text-sm text-muted">© 2026 Saved Brain</p>
        </div>
      </footer>
    </div>
  );
}
