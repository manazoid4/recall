import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import {
  fetchInstagramBusinessDiscovery,
  normalizeInstagramUsername,
} from '@/lib/instagram-business-discovery';

const requestSchema = z.object({
  username: z.string().min(1).max(31),
  limit: z.number().int().min(1).max(25).optional().default(12),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !accessToken) {
    return NextResponse.json(
      {
        error: 'Instagram Business Discovery is not configured.',
        action:
          'Set INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN in Vercel.',
      },
      { status: 503 },
    );
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid Instagram username and media limit.' },
      { status: 400 },
    );
  }

  try {
    const username = normalizeInstagramUsername(parsed.data.username);
    const data = await fetchInstagramBusinessDiscovery({
      username,
      limit: parsed.data.limit,
      accountId,
      accessToken,
      apiVersion: process.env.META_GRAPH_API_VERSION || 'v25.0',
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Instagram Business Discovery failed.',
      },
      { status: 422 },
    );
  }
}
