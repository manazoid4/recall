import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'ok';
  let dbLatency = 0;

  try {
    const db = getDb();
    const dbStart = Date.now();
    await db.prepare('SELECT 1 as ok').get();
    dbLatency = Date.now() - dbStart;
  } catch (err) {
    dbStatus = err instanceof Error ? err.message : 'error';
  }

  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    latency: Date.now() - start,
    db: { status: dbStatus, latency: dbLatency },
    env: {
      hasClerk: !!process.env.CLERK_SECRET_KEY,
      hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasDatabase: !!process.env.DATABASE_URL,
      hasLLM: !!(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || process.env.DEFAULT_LLM_PROVIDER),
      hasKeyEncryption: !!process.env.KEY_ENCRYPTION_SECRET,
    },
  });
}
