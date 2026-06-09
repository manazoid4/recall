import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();

  const item = await db.prepare(
    `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.id = ? AND si.owner_id = ?`
  ).get(params.id, userId) as Record<string, unknown> | undefined;

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...item,
      enrichment: item.summary
        ? {
            summary: item.summary,
            tags: JSON.parse((item.tags as string) || '[]'),
            sentiment: item.sentiment,
            topics: JSON.parse((item.topics as string) || '[]'),
            entities: JSON.parse((item.entities as string) || '[]'),
            qualityScore: item.quality_score,
          }
        : null,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();

  await db.prepare('DELETE FROM saved_items WHERE id = ? AND owner_id = ?').run(params.id, userId);
  return NextResponse.json({ success: true });
}
