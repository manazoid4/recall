'use client';

import Link from 'next/link';
import { Check, Brain, ArrowRight, Shield, Infinity } from 'lucide-react';
import CheckoutButton from '@/components/CheckoutButton';

const freeFeatures = [
  '50 saved items',
  'Full-text search',
  'Manual import (JSON, URLs)',
  '1 board',
  'Basic tags & summaries',
  'Community support',
];

const proFeatures = [
  'Unlimited saved items',
  'Semantic (AI) search',
  'AI enrichment (summaries, entities, topics)',
  'Knowledge graph',
  'Unlimited boards',
  'Shareable public boards',
  'Board cloning & lineage',
  'Obsidian export',
  'Chrome extension auto-sync',
  'Priority support',
];

const objections = [
  [
    'Why lifetime only?',
    'We\'re not building a subscription farm. You pay once, you own it. No surprise price hikes, no "pro tier" upsells, no feature gating after you pay. One price. Forever.',
  ],
  [
    'What about the API costs?',
    'You bring your own LLM key — OpenAI, Anthropic, Google, whoever. We never touch your inference costs. That\'s why we can afford a lifetime deal at this price.',
  ],
  [
    'Is my data safe?',
    'Your data is stored in a private Supabase database secured by Postgres Row Level Security — only you can access your content. Your LLM API key is encrypted at rest and never logged or shared. No advertising, no selling your data.',
  ],
  [
    'What if I want a refund?',
    '30-day money-back guarantee. No questions asked. Email us and you\'re refunded. Simple.',
  ],
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-ink p-8 text-white sm:p-12">
        <p className="text-sm font-bold uppercase tracking-wide text-yellow">LIFETIME ACCESS</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
          ONE PAYMENT.
          <br />
          YOUR BRAIN, FOREVER.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/70">
          No subscriptions. No feature gates. No surprise price hikes. Pay once and own every
          feature — semantic search, knowledge graph, unlimited boards, AI enrichment, Obsidian
          export. Everything.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#plans"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-8 py-4 text-lg font-black text-ink transition-all hover:-translate-y-0.5 hover:bg-orange"
          >
            GET LIFETIME — £49
            <ArrowRight className="h-5 w-5" />
          </a>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
          >
            TRY FREE — 50 ITEMS
          </Link>
        </div>
        <p className="mt-4 text-sm font-bold text-yellow/80">
          30-day money-back guarantee · No credit card for free tier
        </p>
      </section>

      {/* Plans */}
      <section id="plans" className="grid gap-6 lg:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-line bg-panel p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-ink">Free</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-black text-ink">£0</span>
              <span className="text-muted">/forever</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Get started with 50 items. See if Recall works for you.
            </p>
          </div>
          <ul className="mb-8 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span className="text-ink">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/onboarding"
            className="block w-full rounded-lg border border-line py-3 text-center font-bold text-ink transition-colors hover:bg-surface"
          >
            START FREE
          </Link>
        </div>

        {/* Pro Lifetime */}
        <div className="relative rounded-xl border-2 border-yellow bg-panel p-8 shadow-lg">
          <div className="absolute -top-3 left-6 rounded-full bg-yellow px-3 py-1 text-xs font-black text-white">
            BEST VALUE
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-ink">Pro Lifetime</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-black text-ink">£49</span>
              <span className="text-muted">one-time</span>
            </div>
            <p className="mt-1 text-sm text-muted line-through">£9.99/mo equivalent</p>
            <p className="mt-2 text-sm text-muted">
              Pay once. Every feature. Forever. No subscriptions, ever.
            </p>
          </div>
          <ul className="mb-8 space-y-3">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
                <span className="text-ink">{f}</span>
              </li>
            ))}
          </ul>
          <CheckoutButton label="GET LIFETIME ACCESS — £49" />
          <p className="mt-3 text-center text-xs text-muted">
            🔒 Secure payment via LemonSqueezy · 30-day refund
          </p>
        </div>
      </section>

      {/* Why Lifetime */}
      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow/10">
            <Infinity className="h-6 w-6 text-yellow" />
          </div>
          <h3 className="font-bold text-ink">No Subscriptions</h3>
          <p className="mt-2 text-sm text-muted">
            One payment. No recurring charges. No &quot;annual plan&quot; tricks. You own it.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-panel p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow/10">
            <Shield className="h-6 w-6 text-yellow" />
          </div>
          <h3 className="font-bold text-ink">30-Day Guarantee</h3>
          <p className="mt-2 text-sm text-muted">
            Not for you? Full refund within 30 days. No questions, no hassle.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-panel p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow/10">
            <Brain className="h-6 w-6 text-yellow" />
          </div>
          <h3 className="font-bold text-ink">Your Data, Your Keys</h3>
          <p className="mt-2 text-sm text-muted">
            BYO LLM key means zero inference cost to us. That&apos;s why we can do lifetime pricing.
          </p>
        </div>
      </section>

      {/* Objections */}
      <section className="rounded-xl border border-line bg-panel p-8">
        <h2 className="mb-8 text-center text-2xl font-black text-ink">Questions? Answered.</h2>
        <div className="space-y-6">
          {objections.map(([q, a]) => (
            <div key={q}>
              <h3 className="font-bold text-ink">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-2xl bg-yellow p-8 text-center sm:p-12">
        <h2 className="text-3xl font-black text-white">Stop losing what you&apos;ve saved</h2>
        <p className="mt-3 text-lg text-white/80">
          Join thousands turning their digital hoard into a searchable second brain.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <CheckoutButton label="GET LIFETIME — £49" className="bg-ink hover:bg-ink/90" />
        </div>
        <p className="mt-4 text-sm font-bold text-white/60">
          One payment · Every feature · Forever
        </p>
      </section>
    </div>
  );
}
