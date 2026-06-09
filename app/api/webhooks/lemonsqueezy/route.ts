import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // Webhook secret not configured
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

    if (!signature) {
      // Missing webhook signature
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Use timingSafeEqual to prevent timing attacks
    const signatureBuf = Buffer.from(signature);
    const digestBuf = Buffer.from(digest);
    if (signatureBuf.length !== digestBuf.length || !crypto.timingSafeEqual(signatureBuf, digestBuf)) {
      // Invalid webhook signature
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    const data = event.data;

    // Webhook received: eventName

    switch (eventName) {
      case 'order_created': {
        // Handle successful payment
        const email = data.attributes?.user_email;
        const orderId = data.attributes?.order_number;
        const variantId = data.attributes?.variant_id;
        const licenseKey = data.attributes?.license_key?.key;

        // Order created: orderId for email

        // Store the purchase in our database
        const { getDb } = await import('@/lib/db');
        const db = getDb();
        const id = `purchase_${orderId}`;
        
        db.prepare(
          `INSERT INTO purchases (id, email, order_id, variant_id, license_key, status, purchased_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             status = excluded.status,
             license_key = COALESCE(excluded.license_key, purchases.license_key),
             updated_at = datetime('now')`
        ).run(
          id,
          email,
          orderId,
          variantId,
          licenseKey || null,
          'active',
          new Date().toISOString()
        );

        break;
      }

      case 'order_refunded': {
        const email = data.attributes?.user_email;
        const orderId = data.attributes?.order_number;
        // Order refunded for email

        const { getDb } = await import('@/lib/db');
        const db = getDb();
        
        db.prepare(
          `UPDATE purchases SET status = ?, updated_at = datetime('now') 
           WHERE email = ? OR order_id = ?`
        ).run('refunded', email, orderId);
        break;
      }

      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled': {
        // Subscription event received
        break;
      }

      case 'license_key_created': {
        // License key created
        break;
      }

      default:
        // Unhandled event: eventName
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Webhook error: err
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
