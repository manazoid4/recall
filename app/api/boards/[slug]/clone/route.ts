import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = await auth();
  const db = getDb();
  const originalSlug = params.slug;

  const original = await db
    .prepare('SELECT * FROM boards WHERE slug = ?')
    .get(originalSlug) as Record<string, unknown> | undefined;

  if (!original) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }

  const originalId = original.id as string;
  const originalName = original.name as string;

  // Generate clone slug
  const baseSlug = `clone-of-${originalSlug}`;
  let cloneSlug = baseSlug;
  let counter = 1;
  while (await db.prepare('SELECT id FROM boards WHERE slug = ?').get(cloneSlug)) {
    cloneSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const cloneId = uuid();
  const cloneName = `Clone of ${originalName}`;
  const cloneDescription = `Cloned from ${originalSlug}. Original: ${originalName}`;

  // Insert clone board
  await db.prepare(
    `INSERT INTO boards (id, slug, name, description, is_public, clone_count, owner_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(cloneId, cloneSlug, cloneName, cloneDescription, 0, 0, userId || null);

  // Copy board items
  const originalItems = await db
    .prepare('SELECT * FROM board_items WHERE board_id = ?')
    .all(originalId) as Record<string, unknown>[];

  for (const item of originalItems) {
    await db.prepare(
      `INSERT INTO board_items (board_id, item_id, position, added_at)
       VALUES (?, ?, ?, ?)`
    ).run(cloneId, item.item_id, item.position, new Date().toISOString());
  }

  // Increment original board clone count
  const currentClones = (original.clone_count as number) || 0;
  await db.prepare('UPDATE boards SET clone_count = ? WHERE id = ?').run(currentClones + 1, originalId);

  return NextResponse.json({
    data: {
      id: cloneId,
      slug: cloneSlug,
      name: cloneName,
      itemCount: originalItems.length,
    },
  });
}
