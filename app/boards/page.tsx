'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Loader2, ExternalLink, Copy } from 'lucide-react';
import Link from 'next/link';

interface Board {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  cloneCount: number;
  itemCount: number;
  createdAt: string;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPublic, setNewPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boards');
      const json = await res.json();
      setBoards(json.data || []);
    } catch {
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, isPublic: newPublic }),
      });
      if (!res.ok) throw new Error('Failed to create board');
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewPublic(false);
      fetchBoards();
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
            <LayoutGrid className="h-6 w-6 text-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Boards</h1>
            <p className="text-sm text-muted">Curate and share collections</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-yellow px-4 py-2 font-bold text-white transition-colors hover:bg-orange"
        >
          <Plus className="h-4 w-4" />
          New Board
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-yellow/30 bg-panel p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-ink">Create Board</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Board name"
              className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-sm outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newPublic}
                onChange={(e) => setNewPublic(e.target.checked)}
                className="rounded border-line"
              />
              <span className="text-muted">Make public (shareable)</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex items-center gap-2 rounded-lg bg-yellow px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow" />
        </div>
      ) : boards.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-12 text-center">
          <LayoutGrid className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-4 text-lg font-bold text-ink">No boards yet</h2>
          <p className="mt-2 text-muted">Create a board to organize your saved items.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/b/${board.slug}`}
              className="group rounded-xl border border-line bg-panel p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-ink group-hover:text-yellow">{board.name}</h3>
                <ExternalLink className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {board.description && (
                <p className="mt-2 text-sm text-muted line-clamp-2">{board.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                <span>{board.itemCount} items</span>
                {board.isPublic && (
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {board.cloneCount} clones
                  </span>
                )}
                {board.isPublic && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Public</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
