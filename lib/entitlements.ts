import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

interface EntitlementCheck {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

const FREE_TIER = {
  maxItems: 50,
  maxBoards: 1,
  features: ['basic_search', 'manual_import', 'graph_view'],
};

const PRO_TIER = {
  maxItems: Infinity,
  maxBoards: Infinity,
  features: ['semantic_search', 'auto_sync', 'api_access', 'export', 'webhooks', 'digest'],
};

export async function checkEntitlements(
  userId: string | null,
  action: 'create_item' | 'create_board' | 'use_feature',
  feature?: string
): Promise<EntitlementCheck> {
  // If no user, treat as free tier
  if (!userId) {
    return { allowed: true }; // Allow anonymous usage for demo
  }

  // Check if user is pro (would query from database in production)
  const isPro = await checkIsPro(userId);
  const tier = isPro ? PRO_TIER : FREE_TIER;

  if (action === 'create_item') {
    const count = await getItemCount(userId);
    if (count >= tier.maxItems) {
      return {
        allowed: false,
        reason: `Free tier limit: ${tier.maxItems} items. Upgrade to Pro for unlimited.`,
        limit: tier.maxItems,
        current: count,
      };
    }
    return { allowed: true, current: count, limit: tier.maxItems };
  }

  if (action === 'create_board') {
    const count = await getBoardCount(userId);
    if (count >= tier.maxBoards) {
      return {
        allowed: false,
        reason: `Free tier limit: ${tier.maxBoards} board. Upgrade to Pro for unlimited.`,
        limit: tier.maxBoards,
        current: count,
      };
    }
    return { allowed: true, current: count, limit: tier.maxBoards };
  }

  if (action === 'use_feature' && feature) {
    if (!tier.features.includes(feature)) {
      return {
        allowed: false,
        reason: `Feature '${feature}' requires Pro. Upgrade to unlock.`,
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

async function checkIsPro(userId: string): Promise<boolean> {
  // In production, this would query the database for purchase status
  // For now, check if there's a purchase record in settings
  try {
    const { getDb } = await import('./db');
    const db = getDb();
    const purchase = await db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(`purchase_${userId}`) as { value: string } | undefined;
    if (purchase) {
      const data = JSON.parse(purchase.value);
      return data.status === 'active';
    }
    return false;
  } catch {
    return false;
  }
}

async function getItemCount(userId: string): Promise<number> {
  try {
    const { getDb } = await import('./db');
    const db = getDb();
    const row = await db
      .prepare('SELECT COUNT(*) as count FROM saved_items WHERE owner_id = ?')
      .get(userId) as { count: number };
    return row?.count || 0;
  } catch {
    return 0;
  }
}

async function getBoardCount(userId: string): Promise<number> {
  try {
    const { getDb } = await import('./db');
    const db = getDb();
    const row = await db
      .prepare('SELECT COUNT(*) as count FROM boards WHERE owner_id = ?')
      .get(userId) as { count: number };
    return row?.count || 0;
  } catch {
    return 0;
  }
}

export async function withEntitlements(
  request: NextRequest,
  action: 'create_item' | 'create_board' | 'use_feature',
  feature?: string
): Promise<EntitlementCheck | NextResponse> {
  const { userId } = await auth();
  const check = await checkEntitlements(userId, action, feature);
  
  if (!check.allowed) {
    return NextResponse.json(
      { error: check.reason, limit: check.limit, current: check.current },
      { status: 403 }
    );
  }
  
  return check;
}
