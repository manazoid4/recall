import { normalizeInstagramUrl } from './social-ingestion';

const usernamePattern = /^[A-Za-z0-9._]{1,30}$/;

export interface InstagramPublicProfile {
  id: string;
  username: string;
  name: string | null;
  profilePictureUrl: string | null;
  followersCount: number | null;
  mediaCount: number | null;
}

export interface InstagramPublicMedia {
  id: string;
  platformItemId: string;
  caption: string | null;
  mediaType: string;
  mediaUrl: string | null;
  permalink: string;
  thumbnailUrl: string | null;
  timestamp: string;
  username: string;
}

export interface InstagramBusinessDiscoveryResult {
  profile: InstagramPublicProfile;
  media: InstagramPublicMedia[];
}

interface MetaMedia {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
  username?: string;
}

interface MetaBusinessDiscovery {
  id?: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  media?: { data?: MetaMedia[] };
}

export function normalizeInstagramUsername(input: string): string {
  const username = input.trim().replace(/^@/, '');
  if (!usernamePattern.test(username)) {
    throw new Error('Enter a valid Instagram username, without a profile URL.');
  }
  return username;
}

function mapMedia(
  media: MetaMedia,
  fallbackUsername: string,
): InstagramPublicMedia | null {
  if (!media.id || !media.permalink || !media.timestamp) return null;

  try {
    const normalized = normalizeInstagramUrl(media.permalink);
    return {
      id: media.id,
      platformItemId: normalized.platformItemId,
      caption: media.caption?.trim() || null,
      mediaType: media.media_type || 'UNKNOWN',
      mediaUrl: media.media_url || null,
      permalink: normalized.canonicalUrl,
      thumbnailUrl: media.thumbnail_url || media.media_url || null,
      timestamp: new Date(media.timestamp).toISOString(),
      username: media.username || fallbackUsername,
    };
  } catch {
    return null;
  }
}

export async function fetchInstagramBusinessDiscovery({
  username,
  limit,
  accountId,
  accessToken,
  apiVersion = 'v25.0',
  fetchImpl = fetch,
}: {
  username: string;
  limit: number;
  accountId: string;
  accessToken: string;
  apiVersion?: string;
  fetchImpl?: typeof fetch;
}): Promise<InstagramBusinessDiscoveryResult> {
  const normalizedUsername = normalizeInstagramUsername(username);
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 25);
  const fields = [
    `business_discovery.username(${normalizedUsername}){`,
    'id,username,name,profile_picture_url,followers_count,media_count,',
    `media.limit(${safeLimit}){id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username}`,
    '}',
  ].join('');
  const url = new URL(
    `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(accountId)}`,
  );
  url.searchParams.set('fields', fields);
  url.searchParams.set('access_token', accessToken);

  const response = await fetchImpl(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = (await response.json()) as {
    business_discovery?: MetaBusinessDiscovery;
    error?: { message?: string; code?: number };
  };

  if (!response.ok || !payload.business_discovery) {
    throw new Error(
      'Instagram could not access this public professional account. Confirm it is a public Business or Creator account and that the Meta token has Business Discovery access.',
    );
  }

  const profile = payload.business_discovery;
  if (!profile.id || !profile.username) {
    throw new Error('Instagram returned an incomplete professional-account profile.');
  }

  return {
    profile: {
      id: profile.id,
      username: profile.username,
      name: profile.name || null,
      profilePictureUrl: profile.profile_picture_url || null,
      followersCount: profile.followers_count ?? null,
      mediaCount: profile.media_count ?? null,
    },
    media: (profile.media?.data || [])
      .map((media) => mapMedia(media, profile.username!))
      .filter((media): media is InstagramPublicMedia => media !== null),
  };
}
