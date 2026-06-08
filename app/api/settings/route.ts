import { getAllSettings, setSetting } from '@/lib/settings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const data = await getAllSettings();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  for (const [key, value] of Object.entries(body)) {
    await setSetting(key, String(value));
  }
  return NextResponse.json({ success: true });
}
