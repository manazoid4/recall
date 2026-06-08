import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');

    if (!signature || signature !== digest) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    const data = event.data;

    console.log(`LemonSqueezy webhook: ${eventName}`);

    switch (eventName) {
      case 'order_created': {
        // Handle successful payment
        const email = data.attributes?.user_email;
        const orderId = data.attributes?.order_number;
        const variantId = data.attributes?.variant_id;

        console.log(`Order created: ${orderId} for ${email} (variant: ${variantId})`);

        // Store the purchase in our database
        // For now, we'll use the settings table to track purchases
        const { getDb } = await import('@/lib/db');
        const db = getDb();
        db.prepare(
          `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
        ).run(
          `purchase_${email}`,
          JSON.stringify({
            email,
            orderId,
            variantId,
            purchasedAt: new Date().toISOString(),
            status: 'active',
          })
        );

        break;
      }

      case 'order_refunded': {
        const email = data.attributes?.user_email;
        console.log(`Order refunded for ${email}`);

        const { getDb } = await import('@/lib/db');
        const db = getDb();
        db.prepare(
          `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
        ).run(
          `purchase_${email}`,
          JSON.stringify({
            email,
            status: 'refunded',
            refundedAt: new Date().toISOString(),
          })
        );
        break;
      }

      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled': {
        // We don't use subscriptions, but log for completeness
        console.log(`Subscription event: ${eventName}`);
        break;
      }

      case 'license_key_created': {
        console.log('License key created');
        break;
      }

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
