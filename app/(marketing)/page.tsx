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
  Zap,
  Shield,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Multi-Platform Import',
    description:
      'Pull saved posts from Instagram, YouTube, X, TikTok, Reddit, Pocket, and more. One place for everything.',
  },
  {
    icon: Sparkles,
    title: 'AI Enrichment',
    description:
      'Auto-generate summaries, tags, sentiment, and extract entities. Your LLM, your API key — zero inference cost to us.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description:
      'Find content by meaning, not just keywords. Toggle between full-text and vector similarity search.',
  },
  {
    icon: GitBranch,
    title: 'Knowledge Graph',
    description:
      'Discover connections between saved items through shared topics, entities, and concepts. Cross-platform linking.',
  },
  {
    icon: LayoutGrid,
    title: 'Shareable Boards',
    description:
      "Organize into curated boards with shareable URLs. Clone others' boards. All clones trace back to the original.",
  },
  {
    icon: Download,
    title: 'Obsidian Export',
    description:
      'Export your enriched library to Obsidian-compatible markdown. Your second brain, portable and future-proof.',
  },
];

const platforms = [
  { name: 'Instagram', icon: Instagram    },
  { name: 'YouTube',   icon: Youtube      },
  { name: 'X/Twitter', icon: Twitter      },
  { name: 'Reddit',    icon: MessageCircle },
  { name: 'Pocket',    icon: BookOpen     },
];

const stats = [
  { value: '50+',  label: 'Free items'        },
  { value: 'BYO',  label: 'LLM key'           },
  { value: '100%', label: 'Private by default' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow shadow-sm transition-transform group-hover:scale-105">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-ink">Recall</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link href="/pricing" className="text-sm text-muted transition-colors hover:text-ink">
              Pricing
            </Link>
            <Link href="/sign-in" className="text-sm text-muted transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange hover:shadow-glow-amber active:scale-95"
            >
              Get Started
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* Ambient glow behind hero */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute left-1/2 top-[-100px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-yellow/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow/25 bg-yellow/8 px-4 py-1.5 text-sm font-medium text-yellow animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            AI-powered knowledge layer
          </div>

          {/* Headline */}
          <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl animate-slide-up">
            Everything you&apos;ve saved.
            <br />
            <span className="gradient-text">Finally searchable.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            You&apos;ve saved thousands of posts across platforms. Most you&apos;ll never see again.
            Recall pulls them together, enriches them with AI, and makes them findable by
            meaning — not just keywords.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber active:translate-y-0"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-8 py-3.5 text-base font-bold text-ink transition-all hover:bg-overlay hover:-translate-y-0.5"
            >
              See Pricing
            </Link>
          </div>

          {/* Mini stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-ink">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-dim">
            No credit card required · 50 items free · Bring your own LLM key
          </p>
        </div>
      </section>

      {/* ── Platforms ────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-panel px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-7 text-center text-xs font-semibold uppercase tracking-widest text-dim">
            Import from your favourite platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-muted transition-colors hover:text-ink">
                <p.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-balance text-4xl font-black tracking-tight text-ink">
              Built for people who save everything
            </h2>
            <p className="mt-3 text-lg text-muted">
              The tools to turn your digital hoard into a searchable, shareable knowledge base.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group card-hover flex flex-col gap-4 p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10 text-yellow transition-all group-hover:bg-yellow group-hover:text-white group-hover:shadow-glow-amber">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-bold text-ink">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-panel px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-14 text-center text-balance text-4xl font-black tracking-tight text-ink">
            From saved to searchable in 90 seconds
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Import',
                desc: 'Upload a JSON export, paste URLs, or use the Chrome extension to sync your saved posts.',
              },
              {
                step: '2',
                title: 'Enrich',
                desc: 'AI generates summaries, tags, and extracts entities. Your LLM key — zero cost to us.',
              },
              {
                step: '3',
                title: 'Discover',
                desc: 'Search by meaning, explore the knowledge graph, organize into shareable boards.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-yellow text-xl font-black text-white shadow-glow-amber">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-dim">
          {[
            { icon: Shield,   text: 'Supabase + RLS — your data never leaks'      },
            { icon: Zap,      text: 'Bring your own LLM key, zero inference markup' },
            { icon: Download, text: 'Full export anytime — no lock-in'             },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm">
              <item.icon className="h-4 w-4 shrink-0 text-yellow" />
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-ink p-12 text-center shadow-panel">
          {/* Ambient glow inside dark box */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-[-80px] h-64 w-64 -translate-x-1/2 rounded-full bg-yellow/15 blur-3xl" />
          </div>

          <h2 className="relative text-balance text-3xl font-black tracking-tight text-white">
            Stop losing what you&apos;ve saved
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
            Join thousands turning their saved posts into a searchable second brain.
          </p>
          <Link
            href="/onboarding"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber active:translate-y-0"
          >
            Start Using Recall
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-line bg-panel px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-ink">Recall</span>
          </div>
          <nav className="flex gap-5 text-sm text-muted">
            <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms"   className="transition-colors hover:text-ink">Terms</Link>
          </nav>
          <p className="text-xs text-dim">© 2026 Recall. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
