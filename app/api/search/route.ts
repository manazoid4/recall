import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { searchSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { checkEntitlements } from '@/lib/entitlements';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();
  const body = await request.json();
  
  const validated = searchSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid search query', details: validated.error.flatten() }, { status: 400 });
  }
  
  const { query, mode = 'fulltext', limit = 20 } = validated.data;

  if (mode === 'semantic') {
    const entitlement = await checkEntitlements(userId, 'use_feature', 'semantic_search');
    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error: 'Pro feature required',
          reason: entitlement.reason,
          upgrade: '/upgrade',
        },
        { status: 403 }
      );
    }
  }

  if (!query) {
    return NextResponse.json({ data: [] });
  }

  let baseQuery = `SELECT si.*, e.summary, e.tags, e.entities
         FROM saved_items si
         LEFT JOIN enrichments e ON e.item_id = si.id
         WHERE (si.title LIKE ? OR si.url LIKE ? OR si.raw_data LIKE ?)`;
  const params: (string | number | null)[] = [`%${query}%`, `%${query}%`, `%${query}%`];
  
  if (userId) {
    baseQuery += ' AND si.owner_id = ?';
    params.push(userId);
  }
  baseQuery += ' ORDER BY si.created_at DESC LIMIT ?';
  params.push(limit);

  let items;
  if (mode === 'semantic') {
    // For now, fallback to fulltext (vector search needs sqlite-vss setup)
    items = await db.prepare(baseQuery).all(...params) as Record<string, unknown>[];
  } else {
    items = await db.prepare(baseQuery).all(...params) as Record<string, unknown>[];
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
