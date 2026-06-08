import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Saved Brain Board';
  const itemCount = searchParams.get('count') || '0';
  const description = searchParams.get('desc') || '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#f8fafc',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#f59e0b',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🧠
          </div>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            Saved Brain
          </span>
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: '800',
            textAlign: 'center',
            margin: '0 0 16px 0',
            lineHeight: 1.1,
            maxWidth: '900px',
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              textAlign: 'center',
              margin: '0 0 32px 0',
              maxWidth: '800px',
            }}
          >
            {description}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#f59e0b',
          }}
        >
          <span>{itemCount} items curated</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '16px',
            color: '#64748b',
          }}
        >
          saved-brain.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
