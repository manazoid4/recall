'use client';

import { useState } from 'react';
import JSZip from 'jszip';

const canonical = (raw: string) => {
  try {
    const url = new URL(raw.trim());
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => url.searchParams.delete(k));
    return url.toString();
  } catch { return null; }
};

const mergeUrls = (prev: string[], next: string[]) => [...new Set([...prev, ...next.map(canonical).filter((u): u is string => !!u)])];

export default function InstagramImporter() {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function parseZip(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const zip = await JSZip.loadAsync(file);
      const savedFile = zip.file(/saved(_|\/|\\)saved_posts\.json$/i)[0];
      if (!savedFile) return setMessage('No saved_posts.json found. Use Meta export: saved/saved_posts.json.');
      const json = JSON.parse(await savedFile.async('string'));
      const posts = (json.saved_saved_media ?? []).map((p: any) => p?.string_map_data?.['Saved on']?.href).filter(Boolean);
      setUrls((prev) => mergeUrls(prev, posts));
      setMessage(`Loaded ${posts.length} saved posts locally. Nothing uploaded yet.`);
    } catch { setMessage('ZIP parsing failed.'); }
  }

  function handlePaste(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setUrls((prev) => mergeUrls(prev, e.target.value.split(/\s+/)));
  }

  async function commitToRecall() {
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/sources/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setUrls([]);
      setMessage(`Imported ${data.imported_count} sources. Enrichment ready.`);
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Import failed'); }
    finally { setLoading(false); }
  }

  return <section style={{ padding: 20, border: '1px solid #2a2a2a', background: '#141414', color: '#f0ede6' }}>
    <h1 style={{ textTransform: 'uppercase' }}>Recall import</h1>
    <p>Private Instagram saves importer. ZIP parsed in-browser; only canonical URLs sent.</p>
    <label>Meta export ZIP <input type="file" accept=".zip" onChange={parseZip} disabled={loading} /></label>
    <p>Or paste URLs</p>
    <textarea placeholder="https://instagram.com/p/..." onChange={handlePaste} style={{ width: '100%', height: 120, background: '#0a0a0a', color: '#00d4ff' }} />
    <p>{urls.length} unique URLs ready.</p>
    <button onClick={commitToRecall} disabled={loading || urls.length === 0}>{loading ? 'Importing...' : 'Commit to Recall'}</button>
    {message && <p>{message}</p>}
  </section>;
}
