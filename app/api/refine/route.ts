import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rate-limit';
import { callLLM } from '@/lib/ai/providers';
import { z } from 'zod';

const refineSchema = z.object({
  transcript: z.string().min(1).max(10000),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();

  const body = await request.json();
  const validated = refineSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const { transcript } = validated.data;

  const provider = process.env.DEFAULT_LLM_PROVIDER || 'openai';
  const model = process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini';

  const prompt = `You are a voice note assistant. Clean up the following speech-to-text transcript into clear, well-structured prose. Fix filler words, repetitions, and grammatical issues. Preserve the original meaning exactly.

Also generate a concise title (max 8 words) for the note.

Respond with JSON only, no markdown:
{"title": "...", "refined": "..."}

Transcript:
${transcript}`;

  try {
    const raw = await callLLM(prompt, { provider, model, temperature: 0.2, maxTokens: 2000, userId: userId || undefined });

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned) as { title?: string; refined?: string };

    return NextResponse.json({
      title: typeof parsed.title === 'string' ? parsed.title.slice(0, 100) : '',
      refined: typeof parsed.refined === 'string' ? parsed.refined : transcript,
    });
  } catch {
    // Graceful fallback — return original transcript unchanged
    return NextResponse.json({
      title: '',
      refined: transcript,
    });
  }
}
