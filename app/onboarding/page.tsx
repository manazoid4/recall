'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight, ArrowLeft, Key, Upload, Link as LinkIcon, Check } from 'lucide-react';
import { PROVIDERS } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_provider: provider,
          llm_model: model,
          llm_api_key: apiKey,
          onboarding_complete: 'true',
        }),
      });
      router.push('/library');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-yellow' : 'bg-line'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Choose Provider */}
        {step === 1 && (
          <div className="rounded-xl border border-line bg-panel p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
                <Brain className="h-6 w-6 text-yellow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">Choose your AI provider</h1>
                <p className="text-sm text-muted">Bring your own API key — zero cost to us</p>
              </div>
            </div>

            <div className="space-y-3">
              {PROVIDERS.filter((p) => !p.isLocal).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    setModel(p.models[0]);
                  }}
                  className={`w-full rounded-lg border p-4 text-left transition-all ${
                    provider === p.id
                      ? 'border-yellow bg-yellow/5 ring-2 ring-yellow/20'
                      : 'border-line hover:border-yellow/50 hover:bg-surface'
                  }`}
                >
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="mt-1 text-xs text-muted">{p.models.slice(0, 3).join(', ')}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow py-3 font-bold text-white transition-colors hover:bg-orange"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: API Key */}
        {step === 2 && (
          <div className="rounded-xl border border-line bg-panel p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
                <Key className="h-6 w-6 text-yellow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">Enter your API key</h1>
                <p className="text-sm text-muted">Encrypted and stored locally</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Provider</label>
                <div className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted">
                  {selectedProvider?.name}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                >
                  {selectedProvider?.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'ollama' ? 'Not required' : 'sk-...'}
                  disabled={provider === 'ollama'}
                  className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm text-ink placeholder-muted outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 disabled:bg-surface disabled:text-muted"
                />
                <p className="mt-1.5 text-xs text-muted">
                  {provider === 'ollama'
                    ? 'Ollama runs locally — no key needed'
                    : `Get your key from ${selectedProvider?.name}'s dashboard`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-3 font-medium text-muted transition-colors hover:bg-surface"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow py-3 font-bold text-white transition-colors hover:bg-orange"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Import */}
        {step === 3 && (
          <div className="rounded-xl border border-line bg-panel p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
                <Upload className="h-6 w-6 text-yellow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">How do you want to import?</h1>
                <p className="text-sm text-muted">You can always add more later</p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="/upload"
                className="flex items-center gap-4 rounded-lg border border-line p-4 transition-all hover:border-yellow/50 hover:bg-surface"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                  <Upload className="h-5 w-5 text-orange" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Upload JSON Export</div>
                  <div className="text-xs text-muted">Instagram, YouTube, Pocket data exports</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </a>

              <a
                href="/upload?url=1"
                className="flex items-center gap-4 rounded-lg border border-line p-4 transition-all hover:border-yellow/50 hover:bg-surface"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                  <LinkIcon className="h-5 w-5 text-orange" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Paste URLs</div>
                  <div className="text-xs text-muted">Add individual links to save</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted" />
              </a>

              <div className="flex items-center gap-4 rounded-lg border border-line p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10">
                  <Brain className="h-5 w-5 text-orange" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Chrome Extension</div>
                  <div className="text-xs text-muted">Auto-sync from Instagram & X (build from /extension)</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-3 font-medium text-muted transition-colors hover:bg-surface"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow py-3 font-bold text-white transition-colors hover:bg-orange disabled:opacity-50"
              >
                {saving ? (
                  'Setting up...'
                ) : (
                  <>
                    Finish Setup
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
