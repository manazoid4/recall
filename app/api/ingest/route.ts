import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { ingestSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { verifyExtensionToken } from '@/lib/extension-token';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  // Support both Clerk session (web) and extension Bearer tokens
  let userId: string | null = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const tokenPayload = await verifyExtensionToken(authHeader.slice(7));
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid extension token' }, { status: 401 });
    }
    userId = tokenPayload.userId;
  } else {
    const session = await auth();
    userId = session.userId;
  }

  const db = getDb();
  const body = await request.json();

  const validated = ingestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid items array', details: validated.error.flatten() }, { status: 400 });
  }

  const items = validated.data;
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
    const id = item.id || uuid();

    try {
      const result = await insertStmt.run(
        id,
        item.url,
        item.title || null,
        item.author || null,
        item.timestamp || item.savedAt || new Date().toISOString(),
        item.source || item.platform || 'manual',
        item.rawData || null,
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
