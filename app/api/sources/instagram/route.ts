import { NextResponse } from 'next/server';

function canonical(raw: unknown) {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => url.searchParams.delete(k));
    return url.toString();
  } catch { return null; }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const urls = Array.isArray(body.urls) ? body.urls : [];
  const sources = [...new Set(urls.map(canonical).filter(Boolean))].map((url) => ({
    canonical_url: url,
    source_platform: 'instagram',
    provenance: 'export_or_manual',
    privacy_level: 'private_to_owner',
  }));
  if (!sources.length) return NextResponse.json({ error: 'No valid URLs' }, { status: 400 });
  return NextResponse.json({ imported_count: sources.length, skipped_count: 0, failed_count: 0, sources });
}
