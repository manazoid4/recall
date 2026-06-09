import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { enrichItem } from '@/lib/ai/enrich';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { enrichSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { checkEntitlements } from '@/lib/entitlements';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();

  const entitlement = await checkEntitlements(userId, 'use_feature', 'enrichment');
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'Pro feature required',
        reason: entitlement.reason,
        upgrade: '/upgrade',
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  
  const validated = enrichSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validated.error.flatten() }, { status: 400 });
  }
  
  const data = validated.data;
  let enriched = 0;

  try {
    if (data.itemId) {
      // Enrich single item
      let itemQuery = 'SELECT * FROM saved_items WHERE id = ?';
      const itemParams: (string | null)[] = [data.itemId];
      if (userId) {
        itemQuery += ' AND owner_id = ?';
        itemParams.push(userId);
      }
      
      const item = db
        .prepare(itemQuery)
        .get(...itemParams) as Record<string, unknown> | undefined;

      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const result = await enrichItem({
        title: item.title as string | null,
        url: item.url as string,
        rawData: item.raw_data as string | null,
      });

      db.prepare(
        `INSERT OR REPLACE INTO enrichments (id, item_id, summary, tags, sentiment, topics, entities, quality_score, provider, model)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        uuid(),
        data.itemId,
        result.summary,
        JSON.stringify(result.tags),
        result.sentiment,
        JSON.stringify(result.topics),
        JSON.stringify(result.entities),
        result.qualityScore,
        result.provider,
        result.model
      );

      enriched = 1;
    } else if (data.all) {
      // Enrich all unenriched items
      let itemsQuery = `SELECT si.* FROM saved_items si
           LEFT JOIN enrichments e ON e.item_id = si.id
           WHERE e.id IS NULL`;
      const itemsParams: (string | null)[] = [];
      if (userId) {
        itemsQuery += ' AND si.owner_id = ?';
        itemsParams.push(userId);
      }
      itemsQuery += ' LIMIT 10';
      
      const items = db
        .prepare(itemsQuery)
        .all(...itemsParams) as Record<string, unknown>[];

      for (const item of items) {
        try {
          const result = await enrichItem({
            title: item.title as string | null,
            url: item.url as string,
            rawData: item.raw_data as string | null,
          });

          db.prepare(
            `INSERT OR REPLACE INTO enrichments (id, item_id, summary, tags, sentiment, topics, entities, quality_score, provider, model)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            uuid(),
            item.id,
            result.summary,
            JSON.stringify(result.tags),
            result.sentiment,
            JSON.stringify(result.topics),
            JSON.stringify(result.entities),
            result.qualityScore,
            result.provider,
            result.model
          );

          enriched++;
        } catch {
          // Skip failed items
        }
      }
    }

    return NextResponse.json({ enriched });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Enrichment failed' },
      { status: 500 }
    );
  }
}
