import type { AccessClass, SavedItem } from './types';

const instagramPostPath = /^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/;

export interface InstagramRecordInput {
  href: string;
  caption?: string | null;
  author?: string | null;
  timestamp?: string | null;
  thumbnailUrl?: string | null;
  capturedAt?: string;
  accessClass: AccessClass;
}

function cleanVisibleText(value?: string | null): string | null {
  const cleaned = value?.trim();
  return cleaned || null;
}

function normalizeInstagramUrl(href: string): {
  canonicalUrl: string;
  platformItemId: string;
} {
  const url = new URL(href, 'https://www.instagram.com');
  if (!['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase())) {
    throw new Error('Unsupported Instagram host');
  }

  const match = url.pathname.match(instagramPostPath);
  if (!match) throw new Error('Unsupported Instagram post URL');

  const [, postType, platformItemId] = match;
  return {
    canonicalUrl: `https://www.instagram.com/${postType}/${platformItemId}/`,
    platformItemId,
  };
}

export function buildInstagramRecord(input: InstagramRecordInput): SavedItem {
  const { canonicalUrl, platformItemId } = normalizeInstagramUrl(input.href);
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const caption = cleanVisibleText(input.caption);
  const author = cleanVisibleText(input.author);
  const timestamp = cleanVisibleText(input.timestamp);
  const thumbnailUrl = cleanVisibleText(input.thumbnailUrl);

  return {
    id: platformItemId,
    url: canonicalUrl,
    source: 'instagram',
    title: caption,
    author,
    timestamp,
    thumbnailUrl,
    scrapedAt: capturedAt,
    provenance: {
      schemaVersion: 1,
      platform: 'instagram',
      platformItemId,
      sourceUrl: canonicalUrl,
      capturedAt,
      captureMethod: 'browser_extension',
      accessClass: input.accessClass,
    },
    rawData: {
      caption,
      author,
      timestamp,
      thumbnailUrl,
    },
  };
}

export function remainingPendingItems<T extends { id: string }>(
  pending: T[],
  acceptedIds?: string[],
): T[] {
  if (!acceptedIds?.length) return pending;
  const accepted = new Set(acceptedIds);
  return pending.filter((item) => !accepted.has(item.id));
}
