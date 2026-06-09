import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  const db = getDb();

  let itemsQuery = 'SELECT COUNT(*) as count FROM saved_items';
  let enrichedQuery = 'SELECT COUNT(*) as count FROM enrichments';
  let boardsQuery = 'SELECT COUNT(*) as count FROM boards';
  const params: (string | null)[] = [];
  
  if (userId) {
    itemsQuery += ' WHERE owner_id = ?';
    enrichedQuery += ' e JOIN saved_items si ON si.id = e.item_id WHERE si.owner_id = ?';
    boardsQuery += ' WHERE owner_id = ?';
    params.push(userId);
  }

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
