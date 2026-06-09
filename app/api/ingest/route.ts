import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { ingestSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();
  const items = await request.json();

  const validated = ingestSchema.safeParse(items);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid items array', details: validated.error.flatten() }, { status: 400 });
  }

  let ingested = 0;
  let skipped = 0;

  const insertStmt = db.prepare(
    `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data, owner_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET
       title = COALESCE(excluded.title, saved_items.title),
       updated_at = datetime('now')`
  );

  for (const item of items) {
    const id = (item.id as string) || uuid();
    const url = item.url as string;
    if (!url) {
      skipped++;
      continue;
    }

    try {
      const result = await insertStmt.run(
        id,
        url,
        (item.title as string) || null,
        (item.author as string) || null,
        (item.timestamp as string) || (item.savedAt as string) || new Date().toISOString(),
        (item.source as string) || (item.platform as string) || 'manual',
        (item.rawData as string) || null,
        userId || null
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

  return NextResponse.json({ ingested, skipped });
}
