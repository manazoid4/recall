'use client';

import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-line bg-panel">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to Recall
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
          <h1 className="text-4xl font-black text-ink">Terms of Service</h1>
          <p className="mt-2 text-muted">Last updated: June 2026</p>
        </div>

        <div className="space-y-8 text-ink">
          <section>
            <h2 className="text-xl font-bold">1. Service Description</h2>
            <p className="mt-2 text-muted">
              Recall is a content aggregation and knowledge management tool. You can save URLs,
              import bookmarks, and use AI to enrich and search your content. The service is provided
              &quot;as is&quot; with no warranties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Account Registration</h2>
            <p className="mt-2 text-muted">
              You must provide accurate information when creating an account. You are responsible for
              maintaining the security of your account. Do not share your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Acceptable Use</h2>
            <p className="mt-2 text-muted">
              You may not use the service to store illegal content, harass others, or violate any laws.
              We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Data & Content</h2>
            <p className="mt-2 text-muted">
              You retain ownership of your content. By using the service, you grant us a license to
              store and process your content solely to provide the service. We do not claim ownership
              of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Payments & Refunds</h2>
            <p className="mt-2 text-muted">
              Pro features are available via a one-time purchase. All payments are processed through
              LemonSqueezy. Refunds are handled on a case-by-case basis within 14 days of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Termination</h2>
            <p className="mt-2 text-muted">
              You can delete your account at any time. We may terminate accounts that violate these terms.
              Upon termination, your data will be deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Contact</h2>
            <p className="mt-2 text-muted">
              Questions? Email us at hello@userecall.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
