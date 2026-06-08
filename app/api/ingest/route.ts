import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  const db = getDb();
  const items = await request.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Expected array of items' }, { status: 400 });
  }

  let ingested = 0;
  let skipped = 0;

  const insertStmt = db.prepare(
    `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET
       title = COALESCE(excluded.title, saved_items.title),
       updated_at = datetime('now')`
  );

  const transaction = db.transaction((...args: unknown[]) => {
    const items = args[0] as Array<Record<string, unknown>>;
    for (const item of items) {
      const id = (item.id as string) || uuid();
      const url = item.url as string;
      if (!url) {
        skipped++;
        continue;
      }

      try {
        const result = insertStmt.run(
          id,
          url,
          (item.title as string) || null,
          (item.author as string) || null,
          (item.timestamp as string) || (item.savedAt as string) || new Date().toISOString(),
          (item.source as string) || (item.platform as string) || 'manual',
          (item.rawData as string) || null
        );
        if (result.changes > 0) {
          ingested++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }
  });

  transaction(items);

  return NextResponse.json({ ingested, skipped });
}
