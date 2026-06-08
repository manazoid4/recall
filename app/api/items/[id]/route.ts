import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const item = db
    .prepare(
      `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.id = ?`
    )
    .get(params.id) as Record<string, unknown> | undefined;

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
  const db = getDb();
  db.prepare('DELETE FROM saved_items WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true });
}
