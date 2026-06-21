import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { authMock, discoveryMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  discoveryMock: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: authMock }));
vi.mock('../../lib/rate-limit', () => ({ rateLimit: () => null }));
vi.mock('../../lib/instagram-business-discovery', async () => {
  const actual = await vi.importActual<
    typeof import('../../lib/instagram-business-discovery')
  >('../../lib/instagram-business-discovery');
  return {
    ...actual,
    fetchInstagramBusinessDiscovery: discoveryMock,
  };
});

import { POST } from '../../app/api/instagram/discover/route';

describe('POST /api/instagram/discover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: null });
    delete process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
  });

  it('rejects unauthenticated requests', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/instagram/discover', {
        method: 'POST',
        body: JSON.stringify({ username: 'public_creator' }),
      }),
    );

    expect(response.status).toBe(401);
    expect(discoveryMock).not.toHaveBeenCalled();
  });

  it('fails closed when Meta configuration is missing', async () => {
    authMock.mockResolvedValue({ userId: 'user_123' });

    const response = await POST(
      new NextRequest('http://localhost/api/instagram/discover', {
        method: 'POST',
        body: JSON.stringify({ username: 'public_creator' }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Instagram Business Discovery is not configured.',
    });
  });

  it('returns public professional-account media for explicit preview', async () => {
    authMock.mockResolvedValue({ userId: 'user_123' });
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = 'connected-id';
    process.env.INSTAGRAM_ACCESS_TOKEN = 'meta-token';
    discoveryMock.mockResolvedValue({
      profile: {
        id: 'profile-id',
        username: 'public_creator',
        name: 'Public Creator',
        profilePictureUrl: null,
        followersCount: 12,
        mediaCount: 1,
      },
      media: [],
    });

    const response = await POST(
      new NextRequest('http://localhost/api/instagram/discover', {
        method: 'POST',
        body: JSON.stringify({ username: '@public_creator', limit: 6 }),
      }),
    );

    expect(response.status).toBe(200);
    expect(discoveryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'public_creator',
        limit: 6,
        accountId: 'connected-id',
        accessToken: 'meta-token',
      }),
    );
  });
});
