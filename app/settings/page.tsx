'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2, Check, Save, Key, Trash2, Sparkles } from 'lucide-react';
import { PROVIDERS } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ items: 0, enriched: 0, boards: 0 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/stats'),
        ]);
        const settingsJson = await settingsRes.json();
        const statsJson = await statsRes.json();
        setSettings(settingsJson.data || {});
        setStats(statsJson.data || { items: 0, enriched: 0, boards: 0 });
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  const handleEnrichAll = async () => {
    setSaving(true);
    try {
      await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  const selectedProvider = PROVIDERS.find((p) => p.id === settings.llm_provider);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-yellow" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
          <SettingsIcon className="h-6 w-6 text-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Settings</h1>
          <p className="text-sm text-muted">Configure your AI provider and preferences</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-panel p-4 text-center">
          <div className="text-2xl font-black text-ink">{stats.items}</div>
          <div className="text-xs text-muted">Items</div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-4 text-center">
          <div className="text-2xl font-black text-ink">{stats.enriched}</div>
          <div className="text-xs text-muted">Enriched</div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-4 text-center">
          <div className="text-2xl font-black text-ink">{stats.boards}</div>
          <div className="text-xs text-muted">Boards</div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          <Check className="h-4 w-4" />
          Settings saved
        </div>
      )}

      {/* LLM Config */}
      <div className="rounded-xl border border-line bg-panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-yellow" />
          <h2 className="text-lg font-bold text-ink">AI Provider</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Provider</label>
            <select
              value={settings.llm_provider || 'openai'}
              onChange={(e) => {
                const p = PROVIDERS.find((pr) => pr.id === e.target.value);
                setSettings({
                  ...settings,
                  llm_provider: e.target.value,
                  llm_model: p?.models[0] || '',
                });
              }}
              className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
            >
              {PROVIDERS.filter((p) => !p.isLocal).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Model</label>
            <select
              value={settings.llm_model || ''}
              onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
              className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
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
              value={settings.llm_api_key || ''}
              onChange={(e) => setSettings({ ...settings, llm_api_key: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
            />
            <p className="mt-1 text-xs text-muted">Stored locally, encrypted at rest</p>
          </div>

          {settings.llm_provider === 'ollama' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Ollama URL</label>
              <input
                type="text"
                value={settings.ollama_url || 'http://localhost:11434'}
                onChange={(e) => setSettings({ ...settings, ollama_url: e.target.value })}
                className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-line bg-panel p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Actions</h2>
        <div className="space-y-3">
          <button
            onClick={handleEnrichAll}
            disabled={saving || stats.items === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Enrich All Items ({stats.items - stats.enriched} pending)
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow py-3 font-bold text-white transition-colors hover:bg-orange disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-panel p-6">
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          <h2 className="text-lg font-bold">Danger Zone</h2>
        </div>
        <p className="mt-2 text-sm text-muted">These actions cannot be undone.</p>
        <button
          onClick={async () => {
            if (confirm('Delete ALL saved items? This cannot be undone.')) {
              await fetch('/api/items?all=true', { method: 'DELETE' });
              window.location.reload();
            }
          }}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete All Items
        </button>
      </div>
    </div>
  );
}
