'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import SearchBar, { SearchOptions } from '@/components/SearchBar';
import PostCard, { EntityChip } from '@/components/PostCard';
import { LibrarySkeleton } from '@/components/LibrarySkeleton';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [boards, setBoards] = useState<{id: string, name: string}[]>([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const fetchItems = useCallback(async (options?: SearchOptions) => {
    setLoading(true);
    try {
      if (options?.query) {
        // Use search API for queries
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: options.query,
            mode: options.mode || 'fulltext',
            limit: 50,
          }),
        });
        const json = await res.json();
        setItems(json.data || []);
        setTotal(json.data?.length || 0);
      } else {
        // Use items API for browsing
        const params = new URLSearchParams();
        if (options?.source) params.set('source', options.source);
        if (options?.tag) params.set('tag', options.tag);
        params.set('limit', '50');

        const res = await fetch(`/api/items?${params}`);
        const json = await res.json();
        setItems(json.data || []);
        setTotal(json.total || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    // Fetch boards for "Add to board" feature
    fetch('/api/boards')
      .then(r => r.json())
      .then(json => setBoards(json.data || []))
      .catch(() => setBoards([]));
  }, [fetchItems]);

  const handleSearch = (query: string, options: SearchOptions) => {
    setSearchQuery(query);
    fetchItems(options);
  };

  const handleAddToBoard = async (boardId: string) => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem }),
      });
      if (!res.ok) throw new Error('Failed to add item');
      setShowBoardModal(false);
      setSelectedItem(null);
    } catch {
      alert('Failed to add item to board');
    }
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
        <LibrarySkeleton />
      ) : items.length === 0 ? (
        searchQuery ? (
          <div className="rounded-xl border border-line bg-panel p-12 text-center">
            <SearchX className="mx-auto h-12 w-12 text-muted" />
            <h2 className="mt-4 text-lg font-bold text-ink">No results found</h2>
            <p className="mt-2 text-muted">
              No items match &quot;{searchQuery}&quot;. Try different keywords or check your spelling.
            </p>
          </div>
        ) : (
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
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PostCard
              key={item.id}
              {...mapToPostCard(item)}
              onAddToBoard={() => {
                setSelectedItem(item.id);
                setShowBoardModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add to Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl border border-line bg-panel p-6 shadow-lg">
            <h3 className="text-lg font-bold text-ink">Add to Board</h3>
            <p className="mt-1 text-sm text-muted">Select a board to add this item to:</p>
            <div className="mt-4 space-y-2">
              {boards.length === 0 ? (
                <p className="text-sm text-muted">No boards yet. Create one first.</p>
              ) : (
                boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleAddToBoard(board.id)}
                    className="w-full rounded-lg border border-line px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-surface"
                  >
                    {board.name}
                  </button>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowBoardModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
