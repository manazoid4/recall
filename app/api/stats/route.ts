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

  const items = await db.prepare(itemsQuery).get(...params) as { count: number };
  const enriched = await db.prepare(enrichedQuery).get(...params) as { count: number };
  const boards = await db.prepare(boardsQuery).get(...params) as { count: number };

  return NextResponse.json({
    data: {
      items: items.count,
      enriched: enriched.count,
      boards: boards.count,
    },
  });
}
