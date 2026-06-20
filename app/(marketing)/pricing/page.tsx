import Link from 'next/link';
import { ArrowRight, Brain, Check, Shield, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Trial',
    price: '£0',
    cadence: 'to start',
    description: 'Prove the workflow with your own saved references.',
    features: [
      '50 saved items',
      'AI enrichment with your own model key',
      'Full-text search',
      '1 intelligence board',
      'Source-linked sharing',
    ],
    cta: 'Build your first intelligence board',
    href: '/onboarding',
    available: 'Available now',
  },
  {
    name: 'Studio',
    price: '£149',
    cadence: '/mo',
    description: 'For a small creative strategy team building a shared research habit.',
    features: [
      'Everything in Trial',
      'Unlimited saved items and boards',
      'Semantic search and knowledge graph',
      'Up to 5 team seats',
      'Shared workspace and collaborative boards',
    ],
    cta: 'Join the agency pilot',
    href: '#pilot',
    available: 'Pilot plan',
  },
  {
    name: 'Agency',
    price: '£349',
    cadence: '/mo',
    description: 'For agencies running repeatable intelligence workflows across clients.',
    features: [
      'Everything in Studio',
      'Up to 15 team seats',
      'Client-separated workspaces',
      'Automated cited brief exports',
      'Priority pilot support',
    ],
    cta: 'Join the agency pilot',
    href: '#pilot',
    available: 'Pilot plan',
    featured: true,
  },
  {
    name: 'Agency Plus',
    price: '£749',
    cadence: '/mo',
    description: 'For multi-team agencies that need governance, scale, and onboarding.',
    features: [
      'Everything in Agency',
      'Up to 40 team seats',
      'Roles and permissions',
      'Workspace templates',
      'Guided onboarding and roadmap access',
    ],
    cta: 'Join the agency pilot',
    href: '#pilot',
    available: 'Pilot plan',
  },
];

const upcomingFeatures = new Set([
  'Up to 5 team seats',
  'Shared workspace and collaborative boards',
  'Up to 15 team seats',
  'Client-separated workspaces',
  'Automated cited brief exports',
  'Priority pilot support',
  'Up to 40 team seats',
  'Roles and permissions',
  'Workspace templates',
  'Guided onboarding and roadmap access',
]);

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl bg-ink p-8 text-white shadow-panel sm:p-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute right-[-80px] top-[-100px] h-80 w-80 rounded-full bg-yellow/15 blur-3xl" />
        </div>
        <div className="relative max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow">
            Agency-first pricing
          </p>
          <h1 className="mt-3 text-balance text-4xl font-black leading-tight sm:text-6xl">
            Price the workflow against one stronger client brief.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Start by building an intelligence board today. Paid team plans are pilot pricing for
            agencies helping shape shared workspaces, collaboration, and cited brief automation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-8 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange"
            >
              Build your first intelligence board
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#pilot"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Join the agency pilot
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-black tracking-tight text-ink">
            Plans for creative intelligence teams
          </h2>
          <p className="mt-4 text-lg text-muted">
            Trial is available now. Studio, Agency, and Agency Plus describe the upcoming team
            product and are offered through the pilot only.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-xl bg-panel p-7 ${
                plan.featured
                  ? 'border-2 border-yellow shadow-panel'
                  : 'border border-line shadow-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-6 rounded-full bg-yellow px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                  Recommended
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black text-ink">{plan.name}</h3>
                  <span className="rounded-full bg-yellow/10 px-2.5 py-1 text-xs font-bold text-yellow">
                    {plan.available}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-ink">{plan.price}</span>
                  <span className="text-sm text-muted">{plan.cadence}</span>
                </div>
                <p className="mt-4 min-h-16 text-sm leading-relaxed text-muted">
                  {plan.description}
                </p>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                    <span className="text-ink">
                      {feature}
                      {upcomingFeatures.has(feature) && (
                        <span className="ml-1 text-xs font-bold uppercase text-yellow">
                          Upcoming
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`flex min-h-12 items-center justify-center rounded-lg px-4 text-center text-sm font-black transition-all ${
                  plan.featured
                    ? 'bg-yellow text-white hover:-translate-y-0.5 hover:bg-orange'
                    : 'border border-line text-ink hover:bg-overlay'
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {[
          {
            icon: Brain,
            title: 'Human-selected signal',
            copy: 'Recall starts with what your team deliberately saved, not a firehose of public mentions.',
          },
          {
            icon: Sparkles,
            title: 'Evidence before output',
            copy: 'Patterns and recommendations remain connected to the source posts that support them.',
          },
          {
            icon: Shield,
            title: 'Truthful rollout',
            copy: 'Live individual features are available now. Team capabilities are labelled as upcoming pilot work.',
          },
        ].map((item) => (
          <article key={item.title} className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-yellow/10">
              <item.icon className="h-6 w-6 text-yellow" />
            </div>
            <h3 className="mt-4 font-bold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
          </article>
        ))}
      </section>

      <section id="pilot" className="rounded-2xl border border-yellow/30 bg-yellow/10 p-8 sm:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow">
            Founding agency pilot
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black text-ink sm:text-4xl">
            Join before the team product is generally available.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Pilot agencies start with the live individual product, receive hands-on workflow
            support, and help prioritize team workspaces, permissions, collaborative boards, and
            cited brief exports. Paid team plans begin only when the agreed pilot workflow is
            usable.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange hover:shadow-glow-amber"
          >
            Join the agency pilot
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-muted">
            Pilot capacity is limited while collaboration features are being developed.
          </p>
        </div>
      </section>
    </div>
  );
}
