import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { ingestSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { verifyExtensionToken } from '@/lib/extension-token';
import {
  normalizeSocialIngestion,
  serializeIngestionMetadata,
  serializeRawMetadata,
} from '@/lib/social-ingestion';

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

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();

  const validated = ingestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid items array', details: validated.error.flatten() }, { status: 400 });
  }

  const items = validated.data;
  const db = getDb();
  let ingested = 0;
  let skipped = 0;
  const acceptedIds: string[] = [];
  const failedIds: string[] = [];

  const insertStmt = db.prepare(
    `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data, owner_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(url, owner_id) DO UPDATE SET
       title = COALESCE(excluded.title, saved_items.title),
       author = COALESCE(excluded.author, saved_items.author),
       saved_at = COALESCE(excluded.saved_at, saved_items.saved_at),
       platform = COALESCE(excluded.platform, saved_items.platform),
       raw_data = excluded.raw_data,
       updated_at = datetime('now')`
  );

  for (const item of items) {
    const queueId = item.id || uuid();

    try {
      const platform = item.source || item.platform || 'manual';
      const normalized = platform === 'instagram'
        ? normalizeSocialIngestion(item)
        : null;
      const url = normalized?.url ?? item.url;
      const rawData = normalized
        ? serializeIngestionMetadata(normalized)
        : serializeRawMetadata(item.rawData);
      const result = await insertStmt.run(
        uuid(),
        url,
        item.title || null,
        item.author || null,
        item.timestamp || item.savedAt || new Date().toISOString(),
        platform,
        rawData,
        userId
      );
      if (result.changes > 0) {
        ingested++;
        acceptedIds.push(queueId);
      } else {
        skipped++;
        failedIds.push(queueId);
      }
    } catch {
      skipped++;
      failedIds.push(queueId);
    }
  }

  return NextResponse.json({ ingested, skipped, acceptedIds, failedIds });
}
