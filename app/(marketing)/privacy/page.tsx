'use client';

import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-line bg-panel">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to Saved Brain
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow/10 px-3 py-1 text-sm font-medium text-yellow">
            <Brain className="h-4 w-4" />
            Legal
          </div>
          <h1 className="text-4xl font-black text-ink">Privacy Policy</h1>
          <p className="mt-2 text-muted">Last updated: June 2026</p>
        </div>

        <div className="space-y-8 text-ink">
          <section>
            <h2 className="text-xl font-bold">What we collect</h2>
            <p className="mt-2 text-muted">
              We collect only what is necessary to run the service: your email (for authentication),
              the content you save (URLs, titles, metadata), and your AI provider settings (which provider
              you choose, not your API key). Your LLM API keys are stored locally in your browser or
              encrypted on our server — we never see them in plaintext.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">What we don&apos;t collect</h2>
            <p className="mt-2 text-muted">
              We don&apos;t track your behavior, sell your data, or use your content for training.
              We don&apos;t use analytics cookies. We don&apos;t share your data with third parties
              except where required for service operation (e.g., payment processing via LemonSqueezy).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">How we store your data</h2>
            <p className="mt-2 text-muted">
              Your saved items are stored in a managed database (Supabase) with row-level security.
              Each user&apos;s data is isolated. API keys are encrypted at rest using AES-256-GCM.
              We use secure, SOC-2 compliant infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Your rights</h2>
            <p className="mt-2 text-muted">
              You can export your data at any time (JSON or Obsidian markdown). You can delete your
              account and all associated data. Contact us for data portability or deletion requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Contact</h2>
            <p className="mt-2 text-muted">
              Questions? Email us at hello@saved-brain.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
