'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Tag, Hash, Trash2 } from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';

interface ItemDetail {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  platform: string | null;
  rawData: string | null;
  createdAt: string;
  savedAt: string | null;
  enrichment: {
    summary: string | null;
    tags: string[];
    entities: string[];
    sentiment: string | null;
    qualityScore: number;
  } | null;
}

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${params.id}`);
        const json = await res.json();
        setItem(json.data || null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/api/items/${params.id}`, { method: 'DELETE' });
      window.location.href = '/library';
    } catch {
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-line bg-panel p-12 text-center">
        <h2 className="text-lg font-bold text-ink">Item not found</h2>
        <p className="mt-2 text-muted">This item may have been deleted or moved.</p>
        <Link
          href="/library"
          className="mt-6 inline-flex rounded-lg bg-yellow px-6 py-2.5 font-bold text-white transition-colors hover:bg-orange"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-line bg-panel p-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="rounded-md bg-yellow/10 px-2 py-0.5 text-xs font-medium text-yellow">
            {item.platform || 'web'}
          </span>
          <time dateTime={item.savedAt || item.createdAt}>
            {formatRelativeDate(item.savedAt || item.createdAt)}
          </time>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-ink">
          {item.title || item.url}
        </h1>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-yellow hover:text-orange"
        >
          <ExternalLink className="h-4 w-4" />
          {item.url}
        </a>

        {item.enrichment?.summary && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">Summary</h2>
            <p className="mt-2 text-muted">{item.enrichment.summary}</p>
          </div>
        )}

        {item.enrichment?.sentiment && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">Sentiment</h2>
            <p className="mt-2 text-muted">{item.enrichment.sentiment}</p>
          </div>
        )}

        {item.enrichment?.tags && item.enrichment.tags.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.enrichment.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.enrichment?.entities && item.enrichment.entities.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">Entities</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.enrichment.entities.map((entity) => (
                <span
                  key={entity}
                  className="inline-flex items-center gap-1 rounded-full bg-yellow/10 px-2 py-0.5 text-xs text-yellow"
                >
                  <Hash className="h-3 w-3" />
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.rawData && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink">Raw Content</h2>
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-surface p-4 text-xs text-muted">
              {item.rawData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
