import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Database,
  Eye,
  Fingerprint,
  GitBranch,
  Lock,
  Network,
  Shield,
  Sparkles,
} from 'lucide-react';
import { demoInsights, demoMemoryItems, demoProfile } from '../../lib/mockData';

const pillars = [
  {
    icon: Database,
    title: 'Universal input layer',
    description:
      'Collect user-provided links, lectures, podcasts, screenshots, PDFs, voice notes, Obsidian notes, GitHub links, exports, and manual thoughts.',
  },
  {
    icon: GitBranch,
    title: 'Living memory graph',
    description:
      'Connect inputs to topics, values, emotions, traits, projects, creators, platforms, actions, and agent prompts.',
  },
  {
    icon: Fingerprint,
    title: 'Evidence-based profile',
    description:
      'Build a profile from traceable inputs: interests, values, taste, communication style, goals, frictions, habits, and contradictions.',
  },
  {
    icon: Network,
    title: 'Agent context layer',
    description:
      'Generate structured context packs for personal assistants, coding agents, Obsidian helpers, project managers, and future MCP servers.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow shadow-sm transition-transform group-hover:scale-105">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-ink">Recall</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
              Dashboard
            </Link>
            <Link href="/capture" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
              Capture
            </Link>
            <Link href="/prompts" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
              Prompts
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange hover:shadow-glow-amber active:scale-95"
            >
              Open Recall
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-[-160px] h-[760px] w-[980px] -translate-x-1/2 rounded-full bg-yellow/5 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-yellow/25 bg-yellow/10 px-4 py-1.5 text-sm font-medium text-yellow">
                <Sparkles className="h-3.5 w-3.5" />
                Personal intelligence layer for future AI agents
              </div>
              <h1 className="text-balance text-5xl font-black leading-[1.03] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Turn everything you save, watch, hear, read, and think into a living profile.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
                Recall is a private AI memory mirror and agent operating system. It turns user-owned
                evidence into a memory graph, taste graph, intent graph, project map, and agent brain.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/capture"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber active:translate-y-0"
                >
                  Feed Recall
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-8 py-3.5 text-base font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-overlay"
                >
                  View Living Profile
                </Link>
              </div>
            </div>

            <div className="card p-6 shadow-panel">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow">Living Profile</p>
                  <h2 className="mt-1 text-2xl font-black text-ink">v{demoProfile.version}</h2>
                </div>
                <Eye className="h-6 w-6 text-yellow" />
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted">{demoProfile.summary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {demoProfile.values.slice(0, 6).map((value) => (
                  <div key={value} className="rounded-lg border border-line bg-overlay px-3 py-2 text-sm font-semibold text-ink">
                    {value}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-line bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow">Pattern signal</p>
                <p className="mt-2 text-sm text-muted">{demoInsights[0].description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-panel px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 text-center sm:grid-cols-3">
            {[
              ['Traceable', 'Every insight points back to evidence'],
              ['User-owned', 'Export, exclude, delete, and mark sensitive'],
              ['Agent-ready', 'Context packs for better AI assistants'],
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
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-yellow">Product pillars</p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight text-ink">
                A memory operating system, not another bookmark app.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="card-hover p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow/10 text-yellow">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-ink">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-2xl bg-ink p-8 shadow-panel sm:p-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow">
                Privacy-first
              </div>
              <h2 className="mt-5 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
                User-provided inputs only. No shady scraping.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
                Social support means pasted links, official exports, browser extension capture, or
                authorised APIs. Recall models the user from evidence, not surveillance.
              </p>
            </div>
            <ul className="space-y-3">
              {['Mark input sensitive', 'Exclude from profile', 'Export everything', 'Trace every insight'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/75">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow/15 text-yellow">
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-dim">
            {[
              `${demoMemoryItems.length} demo memories`,
              'Evidence-based insights',
              'Future MCP context layer',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 shrink-0 text-yellow" />
                {text}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
