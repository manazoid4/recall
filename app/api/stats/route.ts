import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();

  const itemsQuery = 'SELECT COUNT(*) as count FROM saved_items WHERE owner_id = ?';
  const enrichedQuery = 'SELECT COUNT(*) as count FROM enrichments e JOIN saved_items si ON si.id = e.item_id WHERE si.owner_id = ?';
  const boardsQuery = 'SELECT COUNT(*) as count FROM boards WHERE owner_id = ?';
  const params: (string | null)[] = [userId];

  const [itemsRow, enrichedRow, boardsRow] = await Promise.all([
    db.prepare(itemsQuery).get(...params),
    db.prepare(enrichedQuery).get(...params),
    db.prepare(boardsQuery).get(...params),
  ]);

  return NextResponse.json({
    data: {
      items: Number((itemsRow as { count?: unknown })?.count ?? 0),
      enriched: Number((enrichedRow as { count?: unknown })?.count ?? 0),
      boards: Number((boardsRow as { count?: unknown })?.count ?? 0),
    },
  });
}
