import { NextResponse } from 'next/server';
import { appendRecall } from '../../../../lib/recallVault';

function videoId(raw: unknown) {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
    if (!url.hostname.endsWith('youtube.com')) return null;
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    if (['shorts', 'embed', 'live'].includes(parts[0])) return parts[1] || null;
  } catch { return null; }
  return null;
}

function canonical(raw: unknown) {
  const id = videoId(raw);
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  const url = new URL('https://www.youtube.com/watch');
  url.searchParams.set('v', id);
  return url.toString();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const urls = Array.isArray(body.urls) ? body.urls : [];
  const sources = [...new Set(urls.map(canonical).filter(Boolean))].map((url) => ({
    canonical_url: url,
    source_platform: 'youtube',
    provenance: 'manual_or_export',
    privacy_level: 'private_to_owner',
    enrichment_status: 'transcript_pending',
  }));
  if (!sources.length) return NextResponse.json({ error: 'No valid YouTube URLs' }, { status: 400 });
  const vault_path = await appendRecall(sources.map((s) => `- [ ] ${s.canonical_url} #recall #youtube #transcript_pending imported:${new Date().toISOString().slice(0, 10)}`));
  return NextResponse.json({ imported_count: sources.length, skipped_count: 0, failed_count: 0, vault_path, sources });
}
