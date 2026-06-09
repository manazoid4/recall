'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LayoutGrid, Loader2, ArrowLeft, Copy, Share2, Brain } from 'lucide-react';
import Link from 'next/link';
import PostCard, { EntityChip } from '@/components/PostCard';

interface BoardItem {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  savedAt: string | null;
  platform: string | null;
  createdAt: string;
  enrichment: {
    summary: string | null;
    tags: string[];
    entities: string[];
  } | null;
}

interface BoardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  cloneCount: number;
  items: BoardItem[];
}

export default function BoardDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/boards/${slug}`);
        const json = await res.json();
        setBoard(json.data);
      } catch {
        setBoard(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-yellow" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="rounded-xl border border-line bg-panel p-12 text-center">
        <h2 className="text-lg font-bold text-ink">Board not found</h2>
        <Link href="/boards" className="mt-4 inline-block text-yellow hover:underline">
          ← Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/boards"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{board.name}</h1>
            {board.isPublic && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                Public
              </span>
            )}
          </div>
          {board.description && <p className="mt-1 text-sm text-muted">{board.description}</p>}
        </div>
        {board.isPublic && (
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-surface"
          >
            {copied ? <Copy className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}
      </div>

      {board.items.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-12 text-center">
          <LayoutGrid className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-4 text-lg font-bold text-ink">No items in this board</h2>
          <p className="mt-2 text-muted">Add items from your library.</p>
          <Link
            href="/library"
            className="mt-4 inline-block rounded-lg bg-yellow px-6 py-2 font-bold text-white hover:bg-orange"
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {board.items.map((item) => (
            <PostCard
              key={item.id}
              id={item.id}
              title={item.title || item.url}
              source={item.platform || 'web'}
              summary={item.enrichment?.summary || ''}
              tags={item.enrichment?.tags || []}
              entities={(item.enrichment?.entities || []).map(
                (e): EntityChip => ({ id: e, label: e, type: 'concept' })
              )}
              originalUrl={item.url}
              savedAt={item.savedAt || item.createdAt}
            />
          ))}
        </div>
      )}

      {/* Virality footer — shown on all public boards */}
      <div className="mt-12 rounded-xl border border-line bg-panel px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-yellow">
          <Brain className="h-5 w-5" />
          <span className="font-bold text-ink">Built with Recall</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Turn everything you save on Instagram, X, and TikTok into a searchable, AI-enriched knowledge base.
        </p>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/sign-up`}
          className="mt-4 inline-block rounded-lg bg-yellow px-6 py-2.5 font-bold text-white hover:bg-orange transition-colors"
        >
          Build your own brain →
        </Link>
      </div>
    </div>
  );
}
