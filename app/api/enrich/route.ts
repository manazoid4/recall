import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { enrichItem } from '@/lib/ai/enrich';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  let enriched = 0;

  try {
    if (body.itemId) {
      // Enrich single item
      const item = db
        .prepare('SELECT * FROM saved_items WHERE id = ?')
        .get(body.itemId) as Record<string, unknown> | undefined;

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
        body.itemId,
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
    } else if (body.all) {
      // Enrich all unenriched items
      const items = db
        .prepare(
          `SELECT si.* FROM saved_items si
           LEFT JOIN enrichments e ON e.item_id = si.id
           WHERE e.id IS NULL
           LIMIT 10`
        )
        .all() as Record<string, unknown>[];

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
