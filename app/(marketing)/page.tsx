import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  ChevronRight,
  FileText,
  GitBranch,
  LayoutGrid,
  Search,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';

const workflow = [
  {
    icon: Upload,
    step: 'Capture',
    title: 'Collect the saves your team chose',
    description:
      'Bring Instagram posts and other saved references into one private library with their source links intact.',
  },
  {
    icon: GitBranch,
    step: 'Patterns',
    title: 'See repeated creative signals',
    description:
      'Use enrichment, semantic search, and the knowledge graph to find recurring hooks, formats, topics, and audience tensions.',
  },
  {
    icon: FileText,
    step: 'Cited briefs',
    title: 'Turn evidence into a client-ready board',
    description:
      'Curate the strongest examples into a shareable intelligence board today. Automated brief generation is coming to the agency pilot.',
  },
];

const useCases = [
  {
    icon: Search,
    title: 'Research with intent',
    description:
      'Search the references your strategists already judged worth keeping instead of starting every brief from a blank feed.',
  },
  {
    icon: Sparkles,
    title: 'Explain the pattern',
    description:
      'AI summaries, topics, entities, and semantic connections help teams move from scattered inspiration to a defensible point of view.',
  },
  {
    icon: LayoutGrid,
    title: 'Show the evidence',
    description:
      'Organize source-linked examples into public or private boards that make creative recommendations easier to review.',
  },
];

const pilotFeatures = [
  'Shared agency workspaces',
  'Team roles and permissions',
  'Collaborative board editing',
  'Automated cited brief exports',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow shadow-sm transition-transform group-hover:scale-105">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-ink">Recall Signals</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link href="/pricing" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
              Pricing
            </Link>
            <Link href="/sign-in" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange hover:shadow-glow-amber active:scale-95"
            >
              Build a board
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-[-100px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-yellow/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow/25 bg-yellow/10 px-4 py-1.5 text-sm font-medium text-yellow animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              Creative intelligence for agencies
            </div>
            <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl animate-slide-up">
              Turn your team&apos;s saved posts into{' '}
              <span className="gradient-text">client-ready creative intelligence.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">
              Social listening finds what is popular. Recall preserves what your team believes
              matters.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
              Capture the references your strategists save, surface the patterns across them, and
              build source-linked boards that make the next client brief sharper.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber active:translate-y-0"
              >
                Build your first intelligence board
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing#pilot"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-8 py-3.5 text-base font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-overlay"
              >
                Join the agency pilot
              </Link>
            </div>
            <p className="mt-5 text-sm text-dim">
              Start with an individual workspace today. Team collaboration is in pilot development.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-panel px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 text-center sm:grid-cols-3">
            {[
              ['Source-linked', 'Keep the original reference attached'],
              ['Private by default', 'Your research library stays yours'],
              ['Built for judgment', 'Start from what your team selected'],
            ].map(([title, description]) => (
              <div key={title}>
                <p className="font-bold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-yellow">
                The intelligence workflow
              </p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight text-ink">
                Capture → patterns → cited briefs
              </h2>
              <p className="mt-4 text-lg text-muted">
                Preserve the provenance of every idea, then turn your team&apos;s collective taste
                into evidence a client can act on.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {workflow.map((item, index) => (
                <article key={item.step} className="card-hover p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow/10 text-yellow">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-dim">0{index + 1}</span>
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-widest text-yellow">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-panel px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-yellow">
                  A different signal source
                </p>
                <h2 className="mt-3 text-balance text-4xl font-black tracking-tight text-ink">
                  Popularity is public. Taste is proprietary.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted">
                  Listening platforms scan the market for volume. Recall starts with a smaller,
                  higher-intent dataset: the work your strategists, creators, and account leads
                  deliberately saved.
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  That human selection becomes a reusable agency asset instead of disappearing
                  inside personal bookmarks, DMs, and screenshots.
                </p>
              </div>
              <div className="grid gap-5">
                {useCases.map((item) => (
                  <article key={item.title} className="card flex gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow/10 text-yellow">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pilot" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 rounded-2xl bg-ink p-8 shadow-panel sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow">
                Agency pilot · Upcoming
              </div>
              <h2 className="mt-5 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
                Help shape the team workflow.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
                Recall&apos;s individual capture, enrichment, search, graph, and boards are available
                now. The pilot is for agencies that want to help design the collaborative layer.
              </p>
              <Link
                href="/pricing#pilot"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber"
              >
                Join the agency pilot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-3">
              {pilotFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/75">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow/15 text-yellow">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  {feature}
                  <span className="ml-auto text-xs font-bold uppercase tracking-wide text-yellow">
                    Upcoming
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-dim">
            {[
              'Private workspaces',
              'Source provenance retained',
              'Exportable data',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 shrink-0 text-yellow" />
                {text}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-panel px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-ink">Recall Signals</span>
          </div>
          <nav className="flex gap-5 text-sm text-muted">
            <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
          </nav>
          <p className="text-xs text-dim">© 2026 Recall. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
