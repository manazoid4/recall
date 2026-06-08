import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { query, mode = 'fulltext', limit = 20 } = body;

  if (!query) {
    return NextResponse.json({ data: [] });
  }

  let items;
  if (mode === 'semantic') {
    // For now, fallback to fulltext (vector search needs sqlite-vss setup)
    items = db
      .prepare(
        `SELECT si.*, e.summary, e.tags, e.entities
         FROM saved_items si
         LEFT JOIN enrichments e ON e.item_id = si.id
         WHERE si.title LIKE ? OR si.url LIKE ? OR si.raw_data LIKE ?
         ORDER BY si.created_at DESC
         LIMIT ?`
      )
      .all(`%${query}%`, `%${query}%`, `%${query}%`, limit) as Record<string, unknown>[];
  } else {
    items = db
      .prepare(
        `SELECT si.*, e.summary, e.tags, e.entities
         FROM saved_items si
         LEFT JOIN enrichments e ON e.item_id = si.id
         WHERE si.title LIKE ? OR si.url LIKE ? OR si.raw_data LIKE ?
         ORDER BY si.created_at DESC
         LIMIT ?`
      )
      .all(`%${query}%`, `%${query}%`, `%${query}%`, limit) as Record<string, unknown>[];
  }

  return NextResponse.json({
    data: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      author: item.author,
      savedAt: item.saved_at,
      platform: item.platform,
      createdAt: item.created_at,
      enrichment: item.summary
        ? {
            summary: item.summary,
            tags: JSON.parse((item.tags as string) || '[]'),
            entities: JSON.parse((item.entities as string) || '[]'),
          }
        : null,
    })),
  });
}
