import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  authMock,
  verifyExtensionTokenMock,
  runMock,
  prepareMock,
} = vi.hoisted(() => {
  const auth = vi.fn();
  const verifyExtensionToken = vi.fn();
  const run = vi.fn();
  const prepare = vi.fn(() => ({ run }));
  return {
    authMock: auth,
    verifyExtensionTokenMock: verifyExtensionToken,
    runMock: run,
    prepareMock: prepare,
  };
});

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}));

vi.mock('../../lib/extension-token', () => ({
  verifyExtensionToken: verifyExtensionTokenMock,
}));

vi.mock('../../lib/rate-limit', () => ({
  rateLimit: () => null,
}));

vi.mock('../../lib/db', () => ({
  getDb: () => ({ prepare: prepareMock }),
}));

import { POST } from '../../app/api/ingest/route';

const item = {
  id: 'queue-item-1',
  url: 'https://instagram.com/p/AbC_123/?igsh=tracking',
  source: 'instagram',
  title: 'Visible caption',
  author: '@creator',
  provenance: {
    schemaVersion: 1,
    platform: 'instagram',
    platformItemId: 'AbC_123',
    sourceUrl: 'https://instagram.com/p/AbC_123/?igsh=tracking',
    capturedAt: '2026-06-20T10:30:00.000Z',
    captureMethod: 'browser_extension',
    accessClass: 'user_session_visible',
  },
  rawData: { thumbnailUrl: 'https://cdn.example/image.jpg' },
};

describe('POST /api/ingest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: null });
    verifyExtensionTokenMock.mockResolvedValue(null);
    runMock.mockResolvedValue({ changes: 1 });
  });

  it('rejects ingestion without a Clerk session or valid extension token', async () => {
    const response = await POST(new NextRequest('http://localhost/api/ingest', {
      method: 'POST',
      body: JSON.stringify([item]),
    }));

    expect(response.status).toBe(401);
    expect(prepareMock).not.toHaveBeenCalled();
  });

  it('uses owner-scoped conflict identity and stores canonical serialized provenance', async () => {
    verifyExtensionTokenMock.mockResolvedValue({ userId: 'user_123' });

    const response = await POST(new NextRequest('http://localhost/api/ingest', {
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
      body: JSON.stringify([item]),
    }));

    expect(response.status).toBe(200);
    expect(prepareMock).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT(url, owner_id)'));
    expect(runMock).toHaveBeenCalledWith(
      expect.any(String),
      'https://www.instagram.com/p/AbC_123/',
      'Visible caption',
      '@creator',
      expect.any(String),
      'instagram',
      JSON.stringify({
        provenance: {
          ...item.provenance,
          sourceUrl: 'https://www.instagram.com/p/AbC_123/',
        },
        metadata: item.rawData,
      }),
      'user_123',
    );
    await expect(response.json()).resolves.toEqual({
      ingested: 1,
      skipped: 0,
      acceptedIds: ['queue-item-1'],
      failedIds: [],
    });
  });
});
