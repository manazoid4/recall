'use client';

import { useState } from 'react';
import { Puzzle, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';

export default function ConnectExtensionPage() {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://userecall.app';

  const generateToken = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/extension/token');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow">
            <Puzzle className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Connect Extension</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Generate a token to connect the Recall Chrome extension to your account.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-ink">Step 1 — Install the extension</h2>
          <p className="text-sm text-muted">
            Download the extension from the{' '}
            <a href="https://github.com/manazoid4/recall/releases" target="_blank" rel="noreferrer" className="text-yellow underline">
              GitHub releases page
            </a>
            , then load it in Chrome via{' '}
            <code className="rounded bg-surface px-1 py-0.5 text-xs">chrome://extensions</code> → Developer mode → Load unpacked.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Step 2 — Generate your API token</h2>
          {!token ? (
            <button
              onClick={generateToken}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-yellow px-5 py-2.5 text-sm font-bold text-white hover:bg-orange disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Puzzle className="h-4 w-4" />}
              {loading ? 'Generating…' : 'Generate Token'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-line bg-surface px-3 py-2 text-xs font-mono text-ink">
                  {token.slice(0, 40)}…
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button
                onClick={generateToken}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-ink"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate (invalidates old token)
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold text-ink">Step 3 — Paste into extension</h2>
          <p className="text-sm text-muted">
            Click the Recall extension icon → paste your token → the backend URL is pre-configured to{' '}
            <code className="rounded bg-surface px-1 py-0.5 text-xs">{appUrl}</code>.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface px-5 py-4">
        <p className="text-xs text-muted">
          Token expires after 365 days. Regenerating creates a new token; the old one remains valid until it expires.
        </p>
      </div>
    </div>
  );
}
