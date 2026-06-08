'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import SearchBar, { SearchOptions } from '@/components/SearchBar';
import PostCard, { EntityChip } from '@/components/PostCard';
import Link from 'next/link';

interface LibraryItem {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  savedAt: string | null;
  platform: string | null;
  rawData: string | null;
  createdAt: string;
  enrichment: {
    summary: string | null;
    tags: string[];
    entities: string[];
    sentiment: string | null;
    qualityScore: number;
  } | null;
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async (options?: SearchOptions) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.query) params.set('search', options.query);
      if (options?.source) params.set('source', options.source);
      if (options?.tag) params.set('tag', options.tag);
      params.set('limit', '50');

      const res = await fetch(`/api/items?${params}`);
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (_query: string, options: SearchOptions) => {
    fetchItems(options);
  };

  const mapToPostCard = (item: LibraryItem) => ({
    id: item.id,
    title: item.title || item.url,
    source: item.platform || 'web',
    summary: item.enrichment?.summary || '',
    tags: item.enrichment?.tags || [],
    entities: (item.enrichment?.entities || []).map(
      (e: string): EntityChip => ({
        id: e,
        label: e,
        type: 'concept' as const,
      })
    ),
    originalUrl: item.url,
    savedAt: item.savedAt || item.createdAt,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
            <BookOpen className="h-6 w-6 text-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Library</h1>
            <p className="text-sm text-muted">{total} items saved</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-4 text-lg font-bold text-ink">No items yet</h2>
          <p className="mt-2 text-muted">Upload some content to get started.</p>
          <Link
            href="/upload"
            className="mt-6 inline-flex rounded-lg bg-yellow px-6 py-2.5 font-bold text-white transition-colors hover:bg-orange"
          >
            Upload Content
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PostCard key={item.id} {...mapToPostCard(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
