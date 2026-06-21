import { describe, expect, it, vi } from 'vitest';
import {
  fetchInstagramBusinessDiscovery,
  normalizeInstagramUsername,
} from '../../lib/instagram-business-discovery';

describe('Instagram Business Discovery', () => {
  it.each([
    ['@recall.agency', 'recall.agency'],
    [' recall_agency ', 'recall_agency'],
  ])('normalizes valid public professional-account usernames', (input, expected) => {
    expect(normalizeInstagramUsername(input)).toBe(expected);
  });

  it.each(['', 'two words', 'instagram.com/recall', 'a'.repeat(31), 'name!'])(
    'rejects invalid usernames: %s',
    (input) => {
      expect(() => normalizeInstagramUsername(input)).toThrow();
    },
  );

  it('queries Business Discovery without exposing the token in returned data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          business_discovery: {
            id: 'ig-public-1',
            username: 'public_creator',
            name: 'Public Creator',
            profile_picture_url: 'https://cdn.example/profile.jpg',
            followers_count: 4200,
            media_count: 12,
            media: {
              data: [
                {
                  id: 'media-1',
                  caption: 'A useful public reel',
                  media_type: 'VIDEO',
                  permalink: 'https://www.instagram.com/reel/ABC_123/',
                  thumbnail_url: 'https://cdn.example/thumb.jpg',
                  timestamp: '2026-06-20T12:00:00+0000',
                  username: 'public_creator',
                },
              ],
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await fetchInstagramBusinessDiscovery({
      username: '@public_creator',
      limit: 6,
      accountId: 'connected-professional-id',
      accessToken: 'secret-meta-token',
      fetchImpl: fetchMock,
    });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.origin).toBe('https://graph.facebook.com');
    expect(requestedUrl.pathname).toBe('/v25.0/connected-professional-id');
    expect(requestedUrl.searchParams.get('access_token')).toBe('secret-meta-token');
    expect(requestedUrl.searchParams.get('fields')).toContain(
      'business_discovery.username(public_creator)',
    );
    expect(requestedUrl.searchParams.get('fields')).toContain('media.limit(6)');
    expect(JSON.stringify(result)).not.toContain('secret-meta-token');
    expect(result.media[0]).toMatchObject({
      id: 'media-1',
      platformItemId: 'ABC_123',
      permalink: 'https://www.instagram.com/reel/ABC_123/',
      username: 'public_creator',
      mediaType: 'VIDEO',
    });
  });

  it('returns a useful error for personal, private, or unavailable accounts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: 'Unsupported get request.',
            code: 100,
          },
        }),
        { status: 400 },
      ),
    );

    await expect(
      fetchInstagramBusinessDiscovery({
        username: 'personal_account',
        limit: 12,
        accountId: 'connected-professional-id',
        accessToken: 'secret-meta-token',
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow(
      'Instagram could not access this public professional account.',
    );
  });
});
