import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { createItemSchema, itemQuerySchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { checkEntitlements } from '@/lib/entitlements';

export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();
  const { searchParams } = new URL(request.url);
  
  const queryData = Object.fromEntries(searchParams.entries());
  const validated = itemQuerySchema.safeParse(queryData);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validated.error.flatten() }, { status: 400 });
  }
  
  const search = validated.data.search || '';
  const source = validated.data.source || '';
  const tag = validated.data.tag || '';
  const limit = parseInt(validated.data.limit || '50');
  const offset = parseInt(validated.data.offset || '0');

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (userId) {
    where += ' AND si.owner_id = ?';
    params.push(userId);
  }

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
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();

  const entitlement = await checkEntitlements(userId, 'create_item');
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'Entitlement limit reached',
        reason: entitlement.reason,
        upgrade: '/upgrade',
        limit: entitlement.limit,
        current: entitlement.current,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  
  const validated = createItemSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validated.error.flatten() }, { status: 400 });
  }
  
  const data = validated.data;
  const id = data.id || uuid();

  try {
    db.prepare(
      `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         title = COALESCE(excluded.title, saved_items.title),
         raw_data = COALESCE(excluded.raw_data, saved_items.raw_data),
         updated_at = datetime('now')`
    ).run(
      id,
      data.url,
      data.title || null,
      data.author || null,
      data.savedAt || new Date().toISOString(),
      data.platform || data.source || 'manual',
      data.rawData || null,
      userId || null
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
