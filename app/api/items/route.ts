import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const source = searchParams.get('source') || '';
  const tag = searchParams.get('tag') || '';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (search) {
    where += ' AND (si.title LIKE ? OR si.url LIKE ? OR si.raw_data LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (source) {
    where += ' AND si.platform = ?';
    params.push(source);
  }
  if (tag) {
    where += ' AND e.tags LIKE ?';
    params.push(`%"${tag}"%`);
  }

  const countRow = db
    .prepare(
      `SELECT COUNT(*) as total FROM saved_items si LEFT JOIN enrichments e ON e.item_id = si.id ${where}`
    )
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score,
              e.provider as e_provider, e.model as e_model, e.created_at as e_created_at
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       ${where}
       ORDER BY si.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as Record<string, unknown>[];

  const items = rows.map((row) => ({
    id: row.id,
    url: row.url,
    title: row.title,
    author: row.author,
    savedAt: row.saved_at,
    platform: row.platform,
    rawData: row.raw_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    enrichment: row.summary
      ? {
          summary: row.summary,
          tags: JSON.parse((row.tags as string) || '[]'),
          sentiment: row.sentiment,
          topics: JSON.parse((row.topics as string) || '[]'),
          entities: JSON.parse((row.entities as string) || '[]'),
          qualityScore: row.quality_score,
          provider: row.e_provider,
          model: row.e_model,
          createdAt: row.e_created_at,
        }
      : null,
  }));

  return NextResponse.json({ data: items, total: countRow.total });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = body.id || uuid();

  try {
    db.prepare(
      `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         title = COALESCE(excluded.title, saved_items.title),
         raw_data = COALESCE(excluded.raw_data, saved_items.raw_data),
         updated_at = datetime('now')`
    ).run(
      id,
      body.url,
      body.title || null,
      body.author || null,
      body.savedAt || new Date().toISOString(),
      body.platform || body.source || 'manual',
      body.rawData || null
    );

    const item = db.prepare('SELECT * FROM saved_items WHERE id = ?').get(id);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create item' },
      { status: 500 }
    );
  }
}
