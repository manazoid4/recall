'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Link as LinkIcon, FileJson, Loader2, Check, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-yellow" /></div>}>
      <UploadContent />
    </Suspense>
  );
}

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'select' | 'file' | 'url' | 'paste'>(
    searchParams.get('url') ? 'url' : 'select'
  );
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [pasteContent, setPasteContent] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : data.items || [data];

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          items.map((item: Record<string, string>, i: number) => ({
            id: item.id || `import-${Date.now()}-${i}`,
            url: item.url || item.href || item.link || '',
            title: item.title || item.name || null,
            source: item.source || file.name.split('.')[0],
            author: item.author || null,
            timestamp: item.timestamp || item.saved_at || null,
            thumbnailUrl: item.thumbnailUrl || null,
          }))
        ),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      setSuccess(`Imported ${result.ingested} items (${result.skipped} duplicates skipped)`);
      setTimeout(() => router.push('/library'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    setError(null);

    try {
      const urls = urlInput.split('\n').filter((u) => u.trim());
      const items = urls.map((url, i) => ({
        id: `url-${Date.now()}-${i}`,
        url: url.trim(),
        title: null,
        source: 'manual',
        author: null,
        timestamp: new Date().toISOString(),
        thumbnailUrl: null,
      }));

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add URLs');

      setSuccess(`Added ${result.ingested} URLs`);
      setUrlInput('');
      setTimeout(() => router.push('/library'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add URLs');
    } finally {
      setUploading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteContent.trim()) return;
    setUploading(true);
    setError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'manual://paste',
          title: 'Pasted Content',
          platform: 'manual',
          rawData: pasteContent,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Content saved');
      setPasteContent('');
      setTimeout(() => router.push('/library'), 2000);
    } catch {
      setError('Failed to save content');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow/10">
          <Upload className="h-6 w-6 text-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Import Content</h1>
          <p className="text-sm text-muted">Add saved posts to your brain</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {mode === 'select' && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('file')}
            className="flex w-full items-center gap-4 rounded-xl border border-line bg-panel p-6 text-left transition-all hover:border-yellow/50 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <FileJson className="h-6 w-6 text-orange" />
            </div>
            <div>
              <div className="font-bold text-ink">Upload JSON Export</div>
              <div className="text-sm text-muted">Instagram, YouTube, Pocket, Raindrop data exports</div>
            </div>
          </button>

          <button
            onClick={() => setMode('url')}
            className="flex w-full items-center gap-4 rounded-xl border border-line bg-panel p-6 text-left transition-all hover:border-yellow/50 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <LinkIcon className="h-6 w-6 text-orange" />
            </div>
            <div>
              <div className="font-bold text-ink">Paste URLs</div>
              <div className="text-sm text-muted">Add one or more links to save</div>
            </div>
          </button>

          <button
            onClick={() => setMode('paste')}
            className="flex w-full items-center gap-4 rounded-xl border border-line bg-panel p-6 text-left transition-all hover:border-yellow/50 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10">
              <Upload className="h-6 w-6 text-orange" />
            </div>
            <div>
              <div className="font-bold text-ink">Paste Content</div>
              <div className="text-sm text-muted">Save raw text or notes</div>
            </div>
          </button>
        </div>
      )}

      {mode === 'file' && (
        <div className="rounded-xl border border-line bg-panel p-8">
          <h2 className="mb-4 text-lg font-bold text-ink">Upload JSON File</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line p-12 transition-colors hover:border-yellow"
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-yellow" />
            ) : (
              <>
                <FileJson className="h-10 w-10 text-muted" />
                <p className="mt-4 font-medium text-ink">Click to select JSON file</p>
                <p className="mt-1 text-sm text-muted">or drag and drop</p>
              </>
            )}
          </button>
          <button
            onClick={() => setMode('select')}
            className="mt-4 text-sm text-muted hover:text-ink"
          >
            ← Back
          </button>
        </div>
      )}

      {mode === 'url' && (
        <div className="rounded-xl border border-line bg-panel p-8">
          <h2 className="mb-4 text-lg font-bold text-ink">Paste URLs</h2>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="One URL per line&#10;https://youtube.com/watch?v=...&#10;https://twitter.com/.../status/..."
            rows={6}
            className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink placeholder-muted outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setMode('select')}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface"
            >
              Back
            </button>
            <button
              onClick={handleUrlSubmit}
              disabled={uploading || !urlInput.trim()}
              className="flex items-center gap-2 rounded-lg bg-yellow px-6 py-2 font-bold text-white disabled:opacity-50"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add URLs
            </button>
          </div>
        </div>
      )}

      {mode === 'paste' && (
        <div className="rounded-xl border border-line bg-panel p-8">
          <h2 className="mb-4 text-lg font-bold text-ink">Paste Content</h2>
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste any text, notes, or content you want to save..."
            rows={8}
            className="w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-ink placeholder-muted outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setMode('select')}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface"
            >
              Back
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={uploading || !pasteContent.trim()}
              className="flex items-center gap-2 rounded-lg bg-yellow px-6 py-2 font-bold text-white disabled:opacity-50"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
