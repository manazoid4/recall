import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@clerk/nextjs/server';
import { createBoardSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';
import { checkEntitlements } from '@/lib/entitlements';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function GET() {
  const { userId } = await auth();
  const db = getDb();
  
  let where = '';
  const params: (string | number)[] = [];
  if (userId) {
    where = 'WHERE b.owner_id = ?';
    params.push(userId);
  }
  
  const rows = await db
    .prepare(
      `SELECT b.*, COUNT(bi.item_id) as item_count
       FROM boards b
       LEFT JOIN board_items bi ON bi.board_id = b.id
       ${where}
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    )
    .all(...params) as Record<string, unknown>[];

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
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();

  const entitlement = await checkEntitlements(userId, 'create_board');
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'Entitlement limit reached',
        reason: entitlement.reason,
        upgrade: '/upgrade',
        limit: entitlement.limit,
        current: entitlement.current,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  
  const validated = createBoardSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validated.error.flatten() }, { status: 400 });
  }
  
  const data = validated.data;
  const id = uuid();
  let slug = slugify(data.name);

  // Ensure unique slug
  const existing = await db.prepare('SELECT id FROM boards WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await db.prepare(
    `INSERT INTO boards (id, slug, name, description, is_public, owner_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, slug, data.name, data.description || null, data.isPublic ? 1 : 0, userId || null);

  return NextResponse.json({ data: { id, slug } }, { status: 201 });
}
