import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const db = getDb();
  
  let query = `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.id = ?`;
  const queryParams: (string | null)[] = [params.id];
  if (userId) {
    query += ' AND si.owner_id = ?';
    queryParams.push(userId);
  }
  
  const item = await db.prepare(query).get(...queryParams) as Record<string, unknown> | undefined;

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
  const db = getDb();
  
  let deleteQuery = 'DELETE FROM saved_items WHERE id = ?';
  const deleteParams: (string | null)[] = [params.id];
  if (userId) {
    deleteQuery += ' AND owner_id = ?';
    deleteParams.push(userId);
  }
  
  await db.prepare(deleteQuery).run(...deleteParams);
  return NextResponse.json({ success: true });
}
