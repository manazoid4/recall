import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const productId = process.env.LEMONSQUEEZY_PRODUCT_ID;

  if (!storeId || !productId) {
    return NextResponse.json(
      { error: 'Payment not configured. Please contact support.' },
      { status: 503 }
    );
  }

  // LemonSqueezy checkout URL format
  const checkoutUrl = `https://manazoid4.lemonsqueezy.com/checkout/buy/${productId}`;

  return NextResponse.json({
    data: {
      url: checkoutUrl,
    },
  });
}

export async function POST(request: NextRequest) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const productId = process.env.LEMONSQUEEZY_PRODUCT_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!storeId || !productId || !apiKey) {
    return NextResponse.json(
      { error: 'Payment not configured' },
      { status: 503 }
    );
  }

  try {
    // Create a checkout via LemonSqueezy API
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              discount_enabled: true,
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://saved-brain.vercel.app'}/library?upgrade=success`,
              receipt_button_text: 'Go to your Saved Brain',
              receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://saved-brain.vercel.app'}/library`,
              receipt_thank_you_note: 'Thanks for upgrading to Saved Brain Pro! Your lifetime access is now active.',
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: productId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LemonSqueezy error:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { url: checkoutUrl },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
