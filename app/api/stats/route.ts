import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  const items = db.prepare('SELECT COUNT(*) as count FROM saved_items').get() as { count: number };
  const enriched = db.prepare('SELECT COUNT(*) as count FROM enrichments').get() as { count: number };
  const boards = db.prepare('SELECT COUNT(*) as count FROM boards').get() as { count: number };

  return NextResponse.json({
    data: {
      items: items.count,
      enriched: enriched.count,
      boards: boards.count,
    },
  });
}
