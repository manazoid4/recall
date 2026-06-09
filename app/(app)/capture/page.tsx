'use client';

import { useState } from 'react';
import { Mic, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import VoiceCapture from '@/components/VoiceCapture';

export default function CapturePage() {
  const [lastSaved, setLastSaved] = useState<{ title: string; ts: string } | null>(null);

  const handleSave = (title: string) => {
    setLastSaved({ title, ts: new Date().toLocaleTimeString() });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Voice Capture</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Speak a thought, idea, or note. AI cleans it up and saves it to your library.
        </p>
      </div>

      {/* Success toast */}
      {lastSaved && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">{lastSaved.title}</p>
            <p className="text-xs text-green-700">
              Saved at {lastSaved.ts} —{' '}
              <Link href="/library" className="underline hover:text-green-900">
                View in Library
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Main capture UI */}
      <div className="rounded-2xl border border-line bg-panel p-6">
        <VoiceCapture onSave={handleSave} />
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-line bg-surface px-5 py-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tips</h3>
        <ul className="space-y-1 text-sm text-muted">
          <li>• Speak naturally — AI removes filler words automatically</li>
          <li>• Works best in Chrome or Edge on desktop</li>
          <li>• Notes save to your Library and are AI-enriched like any other item</li>
          <li>• Edit the refined text before saving if needed</li>
        </ul>
      </div>
    </div>
  );
}
