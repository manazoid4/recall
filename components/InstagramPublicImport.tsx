'use client';

import { useState } from 'react';
import { AlertCircle, Check, Instagram, Loader2 } from 'lucide-react';
import type {
  InstagramBusinessDiscoveryResult,
  InstagramPublicMedia,
} from '@/lib/instagram-business-discovery';

function titleFromCaption(media: InstagramPublicMedia): string {
  const caption = media.caption?.replace(/\s+/g, ' ').trim();
  if (!caption) return `Instagram ${media.mediaType.toLowerCase()} by @${media.username}`;
  return caption.length > 120 ? `${caption.slice(0, 117)}...` : caption;
}

export default function InstagramPublicImport({
  onBack,
  onImported,
}: {
  onBack: () => void;
  onImported: (_message: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<InstagramBusinessDiscoveryResult | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  async function discover() {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/instagram/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), limit: 12 }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Instagram discovery failed.');
      }

      const discovery = payload.data as InstagramBusinessDiscoveryResult;
      setResult(discovery);
      setSelectedIds(discovery.media.map((media) => media.id));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Instagram discovery failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMedia(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  async function importSelected() {
    if (!result || selectedIds.length === 0) return;
    setImporting(true);
    setError('');

    try {
      const capturedAt = new Date().toISOString();
      const selectedMedia = result.media.filter((media) =>
        selectedIds.includes(media.id),
      );
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          selectedMedia.map((media) => ({
            id: `instagram-api-${media.id}`,
            url: media.permalink,
            title: titleFromCaption(media),
            author: `@${media.username}`,
            timestamp: media.timestamp,
            source: 'instagram',
            provenance: {
              schemaVersion: 1,
              platform: 'instagram',
              platformItemId: media.platformItemId,
              sourceUrl: media.permalink,
              capturedAt,
              captureMethod: 'manual_import',
              accessClass: 'public',
            },
            rawData: {
              instagramMediaId: media.id,
              mediaType: media.mediaType,
              caption: media.caption,
              mediaUrl: media.mediaUrl,
              thumbnailUrl: media.thumbnailUrl,
              discoveredUsername: result.profile.username,
              discoveryMethod: 'meta_business_discovery',
            },
          })),
        ),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Instagram import failed.');
      }

      onImported(
        `Imported ${payload.ingested} Instagram posts (${payload.skipped} skipped).`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Instagram import failed.',
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="border-2 border-ink bg-panel p-6 shadow-[5px_5px_0_hsl(var(--ink))] sm:p-8">
      <div className="flex items-start gap-4 border-b-2 border-line pb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-pink-500 text-white">
          <Instagram className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-ink">Public Instagram account</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Preview recent posts from a public Business or Creator account through Meta&apos;s
            supported Business Discovery API. Searching never imports automatically.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Instagram username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="@public_creator"
            className="w-full border-2 border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
          />
        </label>
        <button
          type="button"
          onClick={discover}
          disabled={loading || !username.trim()}
          className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-yellow px-6 text-sm font-black text-white shadow-[3px_3px_0_hsl(var(--ink))] disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Preview public posts
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Personal accounts, private accounts, Stories, saved folders and unrelated recommendations
        are not accessible through this flow.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 flex gap-3 border-2 border-red-500 bg-red-500/10 p-4 text-sm font-bold text-red-600"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y-2 border-line py-4">
            <div>
              <p className="font-black text-ink">
                {result.profile.name || `@${result.profile.username}`}
              </p>
              <p className="font-mono text-xs text-muted">
                @{result.profile.username}
                {result.profile.followersCount !== null
                  ? ` · ${result.profile.followersCount.toLocaleString()} followers`
                  : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedIds(
                  selectedIds.length === result.media.length
                    ? []
                    : result.media.map((media) => media.id),
                )
              }
              className="text-xs font-black text-yellow hover:text-orange"
            >
              {selectedIds.length === result.media.length
                ? 'Clear selection'
                : 'Select all'}
            </button>
          </div>

          {result.media.length === 0 ? (
            <p className="border-2 border-dashed border-line p-6 text-center text-sm text-muted">
              Meta returned no supported feed posts for this account.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.media.map((media) => {
                const selected = selectedIds.includes(media.id);
                return (
                  <button
                    key={media.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleMedia(media.id)}
                    className={`relative overflow-hidden border-2 text-left ${
                      selected
                        ? 'border-yellow shadow-[3px_3px_0_hsl(var(--ink))]'
                        : 'border-line'
                    }`}
                  >
                    {media.thumbnailUrl ? (
                      // Remote Meta media URLs are temporary and not configured for next/image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.thumbnailUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-overlay">
                        <Instagram className="h-8 w-8 text-muted" />
                      </div>
                    )}
                    <div className="p-3">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wide text-yellow">
                        {media.mediaType}
                      </span>
                      <p className="mt-1 line-clamp-3 text-sm font-bold text-ink">
                        {titleFromCaption(media)}
                      </p>
                    </div>
                    <span
                      className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center border-2 ${
                        selected
                          ? 'border-white bg-yellow text-white'
                          : 'border-line bg-panel text-transparent'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="min-h-11 border-2 border-line px-5 text-sm font-bold text-muted hover:border-ink hover:text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={importSelected}
              disabled={importing || selectedIds.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-ink px-6 text-sm font-black text-white disabled:opacity-50"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              Import {selectedIds.length} selected
            </button>
          </div>
        </div>
      )}

      {!result && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm font-bold text-muted hover:text-ink"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
