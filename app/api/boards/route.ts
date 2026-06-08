import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, COUNT(bi.item_id) as item_count
       FROM boards b
       LEFT JOIN board_items bi ON bi.board_id = b.id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    )
    .all() as Record<string, unknown>[];

  const boards = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    isPublic: Boolean(row.is_public),
    cloneCount: row.clone_count,
    itemCount: row.item_count,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ data: boards });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuid();
  let slug = slugify(body.name);

  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM boards WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  db.prepare(
    `INSERT INTO boards (id, slug, name, description, is_public)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, slug, body.name, body.description || null, body.isPublic ? 1 : 0);

  return NextResponse.json({ data: { id, slug } }, { status: 201 });
}
