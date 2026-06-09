import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkEntitlements } from '@/lib/entitlements';

export async function GET() {
  const { userId } = await auth();

  const entitlement = await checkEntitlements(userId, 'use_feature', 'graph_view');
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

  const db = getDb();

  // Get items with entities for graph nodes
  let query = `SELECT si.id, si.title, si.url, si.platform, e.entities
       FROM saved_items si
       JOIN enrichments e ON e.item_id = si.id
       WHERE e.entities != '[]'`;
  const params: (string | null)[] = [];
  if (userId) {
    query += ' AND si.owner_id = ?';
    params.push(userId);
  }
  query += ' LIMIT 100';

  const items = await db
    .prepare(query)
    .all(...params) as Array<{ id: string; title: string | null; url: string; platform: string | null; entities: string }>;

  // Build edges based on shared entities
  const edgeMap = new Map<string, { source: string; target: string; relation: string }>();

  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    const aEntities: string[] = JSON.parse(a.entities || '[]');

    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      const bEntities: string[] = JSON.parse(b.entities || '[]');

      const shared = aEntities.filter((e) => bEntities.includes(e));
      if (shared.length > 0) {
        const key = [a.id, b.id].sort().join('-');
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            source: a.id,
            target: b.id,
            relation: shared[0],
          });
        }
      }
    }
  }

  const nodes = items.map((item) => ({
    id: item.id,
    label: item.title || item.url,
    type: item.platform || 'item',
  }));

  const edges = Array.from(edgeMap.values());

  return NextResponse.json({ data: { nodes, edges } });
}
