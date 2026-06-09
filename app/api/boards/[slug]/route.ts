import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth();
  const db = getDb();
  
  let boardQuery = 'SELECT * FROM boards WHERE slug = ?';
  const boardParams: (string | null)[] = [params.slug];
  if (userId) {
    boardQuery += ' AND (owner_id = ? OR is_public = 1)';
    boardParams.push(userId);
  }
  
  const board = await db
    .prepare(boardQuery)
    .get(...boardParams) as Record<string, unknown> | undefined;

  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const items = await db
    .prepare(
      `SELECT si.*, e.summary, e.tags, e.entities
       FROM board_items bi
       JOIN saved_items si ON si.id = bi.item_id
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE bi.board_id = ?
       ORDER BY bi.position`
    )
    .all(board.id) as Record<string, unknown>[];

  return NextResponse.json({
    data: {
      id: board.id,
      slug: board.slug,
      name: board.name,
      description: board.description,
      isPublic: Boolean(board.is_public),
      cloneCount: board.clone_count,
      items: items.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        author: item.author,
        savedAt: item.saved_at,
        platform: item.platform,
        createdAt: item.created_at,
        enrichment: item.summary
          ? {
              summary: item.summary,
              tags: JSON.parse((item.tags as string) || '[]'),
              entities: JSON.parse((item.entities as string) || '[]'),
            }
          : null,
      })),
    },
  });
}
