import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  // Get items from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const items = db
    .prepare(
      `SELECT si.*, e.summary, e.tags, e.entities
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.created_at > ?
       ORDER BY si.created_at DESC
       LIMIT 20`
    )
    .all(oneWeekAgo.toISOString()) as Record<string, unknown>[];

  const stats = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM saved_items WHERE created_at > ?) as new_items,
        (SELECT COUNT(*) FROM enrichments WHERE created_at > ?) as new_enrichments,
        (SELECT COUNT(*) FROM saved_items) as total_items`
    )
    .get(oneWeekAgo.toISOString(), oneWeekAgo.toISOString()) as Record<string, unknown>;

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
  const db = getDb();
  const body = await request.json();
  const email = body.email;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const items = db
    .prepare(
      `SELECT si.*, e.summary, e.tags
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id
       WHERE si.created_at > ?
       ORDER BY si.created_at DESC
       LIMIT 20`
    )
    .all(oneWeekAgo.toISOString()) as Record<string, unknown>[];

  // Try to send via Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);

      const htmlItems = items
        .map(
          (item) => `
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;"><a href="${item.url}" style="color: #f59e0b; text-decoration: none;">${item.title || 'Untitled'}</a></h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${item.summary || ''}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">${item.platform || 'web'} • ${item.author || 'unknown'}</p>
        </div>
      `
        )
        .join('');

      await resend.emails.send({
        from: process.env.DIGEST_EMAIL || 'digest@saved-brain.app',
        to: email,
        subject: `Your Saved Brain Weekly Digest — ${items.length} new items`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
            <h1 style="color: #0f172a;">Your Weekly Saved Brain Digest</h1>
            <p style="color: #64748b;">Here is what you saved this week:</p>
            ${htmlItems || '<p style="color: #64748b;">No new items this week.</p>'}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="font-size: 12px; color: #94a3b8;">
              Sent by Saved Brain. <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings">Manage preferences</a>
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
