import { NextRequest, NextResponse } from 'next/server';
import { normalizeInstagramInboxMessage } from '@/lib/agents';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 });
  }

  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const captures = entries.flatMap((entry: Record<string, unknown>) => {
    const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
    return messaging
      .map((event: Record<string, any>) => {
        const messageText = event.message?.text || '';
        const attachments = Array.isArray(event.message?.attachments)
          ? event.message.attachments.map((attachment: Record<string, any>) => ({
              type: attachment.type || 'unknown',
              url: attachment.payload?.url,
              title: attachment.title,
            }))
          : [];
        if (!messageText && attachments.length === 0) return null;
        return normalizeInstagramInboxMessage({
          userId: 'pending_thread_resolution',
          instagramSenderId: event.sender?.id || 'unknown_sender',
          messageText,
          attachments,
          receivedAt: new Date(Number(event.timestamp) || Date.now()).toISOString(),
        });
      })
      .filter(Boolean);
  });

  return NextResponse.json({
    accepted: captures.length,
    status: 'thread_resolution_pending',
    captures,
  });
}
