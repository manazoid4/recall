import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  // CRON_SECRET must be configured - reject if missing
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not configured');
    return NextResponse.json(
      { error: 'Cron endpoint not configured' },
      { status: 500 }
    );
  }

  // Validate the authorization header
  const expected = `Bearer ${cronSecret}`;
  if (authHeader !== expected) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // In production, this would sync from connected sources
  return NextResponse.json({
    ok: true,
    message: 'Sync endpoint ready. Configure sources in settings.',
    timestamp: new Date().toISOString(),
  });
}
