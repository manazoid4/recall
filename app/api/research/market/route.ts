import { NextResponse } from 'next/server';
import { appendRecall } from '../../../../lib/recallVault';

function cleanText(x: unknown) {
  return typeof x === 'string' ? x.trim().slice(0, 2000) : '';
}

function cleanUrl(x: unknown) {
  if (typeof x !== 'string') return null;
  try {
    const url = new URL(x.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => url.searchParams.delete(k));
    return url.toString();
  } catch { return null; }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const notes = Array.isArray(body.notes) ? body.notes : [];
  const items = notes.map((n: Record<string, unknown>) => ({
    title: cleanText(n?.title) || 'Untitled research note',
    url: cleanUrl(n?.url),
    summary: cleanText(n?.summary),
    audience: cleanText(n?.audience),
    pain: cleanText(n?.pain),
    willingness_to_pay: cleanText(n?.willingness_to_pay),
    source_platform: 'market_research',
    provenance: 'manual_research',
    privacy_level: 'private_to_owner',
  })).filter((n: { summary: string; url: string | null; pain: string }) => n.summary || n.url || n.pain);
  if (!items.length) return NextResponse.json({ error: 'No useful research notes' }, { status: 400 });
  const vault_path = await appendRecall(items.map((x: { title: string; url: string | null; summary: string; pain: string; willingness_to_pay: string }) => `- [ ] ${x.title}${x.url ? ` — ${x.url}` : ''} #recall #market_research imported:${new Date().toISOString().slice(0, 10)}\n  - summary: ${x.summary}\n  - pain: ${x.pain}\n  - wtp: ${x.willingness_to_pay}`));
  return NextResponse.json({ imported_count: items.length, skipped_count: 0, failed_count: 0, vault_path, items });
}
