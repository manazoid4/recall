import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for Vercel cron sync
  // In production, this would sync from connected sources
  return NextResponse.json({
    ok: true,
    message: 'Sync endpoint ready. Configure sources in settings.',
    timestamp: new Date().toISOString(),
  });
}
