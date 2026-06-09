import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const body = await request.json();
  const { itemId } = body;

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  // Find the board by slug — must be owned by the requesting user
  const board = await db
    .prepare('SELECT * FROM boards WHERE slug = ? AND owner_id = ?')
    .get(params.slug, userId) as Record<string, unknown> | undefined;

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }

  const boardId = board.id as string;

  // Get current max position
  const maxPos = await db
    .prepare('SELECT MAX(position) as max_pos FROM board_items WHERE board_id = ?')
    .get(boardId) as { max_pos: number | null } | undefined;

  const position = (maxPos?.max_pos || 0) + 1;

  // Insert the item
  await db.prepare(
    `INSERT INTO board_items (board_id, item_id, position, added_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(board_id, item_id) DO UPDATE SET
       position = excluded.position,
       added_at = datetime('now')`
  ).run(boardId, itemId, position, new Date().toISOString());

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  // Find the board by slug — must be owned by the requesting user
  const board = await db
    .prepare('SELECT * FROM boards WHERE slug = ? AND owner_id = ?')
    .get(params.slug, userId) as Record<string, unknown> | undefined;

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }

  const boardId = board.id as string;

  await db.prepare(
    'DELETE FROM board_items WHERE board_id = ? AND item_id = ?'
  ).run(boardId, itemId);

  return NextResponse.json({ success: true });
}
