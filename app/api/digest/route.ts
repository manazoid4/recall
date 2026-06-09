import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { digestSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function safeUrl(url: unknown): string {
  if (typeof url !== 'string') return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#';
    return escapeHtml(url);
  } catch {
    return '#';
  }
}

export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();

  // Get items from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  let itemsQuery = `SELECT si.*, e.summary, e.tags, e.entities
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.created_at > ?`;
  const itemsParams: (string | null)[] = [oneWeekAgo.toISOString()];
  if (userId) {
    itemsQuery += ' AND si.owner_id = ?';
    itemsParams.push(userId);
  }
  itemsQuery += ' ORDER BY si.created_at DESC LIMIT 20';

  const items = await db.prepare(itemsQuery).all(...itemsParams) as Record<string, unknown>[];

  let statsQuery = `SELECT
        (SELECT COUNT(*) FROM saved_items WHERE created_at > ?`;
  const statsParams: (string | null)[] = [oneWeekAgo.toISOString()];
  if (userId) {
    statsQuery += ' AND owner_id = ?';
    statsParams.push(userId);
  }
  statsQuery += `) as new_items,
        (SELECT COUNT(*) FROM enrichments e JOIN saved_items si ON si.id = e.item_id WHERE e.created_at > ?`;
  statsParams.push(oneWeekAgo.toISOString());
  if (userId) {
    statsQuery += ' AND si.owner_id = ?';
    statsParams.push(userId);
  }
  statsQuery += `) as new_enrichments,
        (SELECT COUNT(*) FROM saved_items`;
  if (userId) {
    statsQuery += ' WHERE owner_id = ?';
    statsParams.push(userId);
  }
  statsQuery += `) as total_items`;

  const stats = await db.prepare(statsQuery).get(...statsParams) as Record<string, unknown>;

  const digest = {
    period: '7 days',
    generatedAt: new Date().toISOString(),
    stats: {
      newItems: stats.new_items,
      newEnrichments: stats.new_enrichments,
      totalItems: stats.total_items,
    },
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      platform: item.platform,
      author: item.author,
      savedAt: item.saved_at,
      summary: item.summary || null,
      tags: JSON.parse((item.tags as string) || '[]'),
    })),
  };

  return NextResponse.json({ data: digest });
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  const db = getDb();
  const body = await request.json();
  
  const validated = digestSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid email', details: validated.error.flatten() }, { status: 400 });
  }
  
  const { email } = validated.data;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  let itemsQuery = `SELECT si.*, e.summary, e.tags
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.created_at > ?`;
  const itemsParams: (string | null)[] = [oneWeekAgo.toISOString()];
  if (userId) {
    itemsQuery += ' AND si.owner_id = ?';
    itemsParams.push(userId);
  }
  itemsQuery += ' ORDER BY si.created_at DESC LIMIT 20';

  const items = await db.prepare(itemsQuery).all(...itemsParams) as Record<string, unknown>[];

  // Try to send via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);

      const htmlItems = items
        .map((item) => {
          const url = safeUrl(item.url);
          const title = escapeHtml(String(item.title || 'Untitled'));
          const summary = escapeHtml(String(item.summary || ''));
          const platform = escapeHtml(String(item.platform || 'web'));
          const author = escapeHtml(String(item.author || 'unknown'));
          return `
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;"><a href="${url}" style="color: #f59e0b; text-decoration: none;">${title}</a></h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${summary}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">${platform} • ${author}</p>
        </div>`;
        })
        .join('');

      await resend.emails.send({
        from: process.env.DIGEST_EMAIL || 'digest@userecall.app',
        to: email,
        subject: `Your Recall Weekly Digest — ${items.length} new items`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
            <h1 style="color: #0f172a;">Your Weekly Recall Digest</h1>
            <p style="color: #64748b;">Here is what you saved this week:</p>
            ${htmlItems || '<p style="color: #64748b;">No new items this week.</p>'}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="font-size: 12px; color: #94a3b8;">
              Sent by Recall. <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings">Manage preferences</a>
            </p>
          </div>
        `,
      });

      return NextResponse.json({
        data: {
          sent: true,
          itemCount: items.length,
          email,
        },
      });
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to send email', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Return preview if no Resend key
  return NextResponse.json({
    data: {
      sent: false,
      preview: true,
      itemCount: items.length,
      email,
      message: 'RESEND_API_KEY not configured. Email not sent.',
    },
  });
}
