import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({
      valid: true,
      tier: 'free',
      features: ['basic_search', 'manual_import', 'graph_view'],
      reason: 'anonymous user',
    });
  }

  const db = getDb();
  
  // Check for active purchase in database
  const purchase = db
    .prepare('SELECT * FROM purchases WHERE user_id = ? AND status = ? ORDER BY purchased_at DESC LIMIT 1')
    .get(userId, 'active') as Record<string, unknown> | undefined;

  if (purchase) {
    return NextResponse.json({
      valid: true,
      tier: 'pro',
      features: ['semantic_search', 'auto_sync', 'api_access', 'export', 'webhooks', 'digest', 'unlimited_items', 'unlimited_boards'],
      purchasedAt: purchase.purchased_at,
      orderId: purchase.order_id,
    });
  }

  // Fallback: check legacy settings-based purchase record
  const legacyPurchase = db
    .prepare('SELECT value FROM settings WHERE key = ? AND owner_id = ?')
    .get(`purchase_${userId}`, userId) as { value: string } | undefined;

  if (legacyPurchase) {
    try {
      const data = JSON.parse(legacyPurchase.value);
      if (data.status === 'active') {
        // Migrate to new purchases table
        db.prepare(
          `INSERT INTO purchases (id, user_id, email, order_id, status, purchased_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT DO NOTHING`
        ).run(
          `legacy-${userId}`,
          userId,
          data.email || userId,
          data.orderId || 'legacy',
          'active',
          data.purchasedAt || new Date().toISOString()
        );

        return NextResponse.json({
          valid: true,
          tier: 'pro',
          features: ['semantic_search', 'auto_sync', 'api_access', 'export', 'webhooks', 'digest', 'unlimited_items', 'unlimited_boards'],
          purchasedAt: data.purchasedAt,
          orderId: data.orderId,
          migrated: true,
        });
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  return NextResponse.json({
    valid: true,
    tier: 'free',
    features: ['basic_search', 'manual_import', 'graph_view'],
    limits: {
      maxItems: 50,
      maxBoards: 1,
    },
  });
}

// Validate a LemonSqueezy license key
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();
  const { licenseKey } = body;

  if (!licenseKey) {
    return NextResponse.json({ error: 'License key required' }, { status: 400 });
  }

  // In production, validate against LemonSqueezy API
  // For now, check against our database
  const db = getDb();
  const purchase = db
    .prepare('SELECT * FROM purchases WHERE license_key = ? AND status = ?')
    .get(licenseKey, 'active') as Record<string, unknown> | undefined;

  if (purchase) {
    // If userId provided, associate purchase with user
    if (userId && !purchase.user_id) {
      db.prepare('UPDATE purchases SET user_id = ? WHERE id = ?')
        .run(userId, purchase.id);
    }

    return NextResponse.json({
      valid: true,
      tier: 'pro',
      features: ['semantic_search', 'auto_sync', 'api_access', 'export', 'webhooks', 'digest', 'unlimited_items', 'unlimited_boards'],
    });
  }

  return NextResponse.json({
    valid: false,
    tier: 'free',
    error: 'Invalid or expired license key',
  }, { status: 403 });
}
