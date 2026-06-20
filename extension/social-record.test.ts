import { describe, expect, it } from 'vitest';
import {
  buildInstagramRecord,
  remainingPendingItems,
} from './social-record';

const capturedAt = '2026-06-20T10:30:00.000Z';

describe('Instagram social record builder', () => {
  it('builds canonical records from visible page metadata without DOM access', () => {
    expect(buildInstagramRecord({
      href: '/reel/XYZ-789/?igsh=tracking',
      caption: '  A useful visible caption  ',
      author: ' creator ',
      timestamp: '2026-06-19T09:00:00.000Z',
      thumbnailUrl: 'https://cdn.example/image.jpg',
      capturedAt,
      accessClass: 'user_session_visible',
    })).toEqual({
      id: 'XYZ-789',
      url: 'https://www.instagram.com/reel/XYZ-789/',
      source: 'instagram',
      title: 'A useful visible caption',
      author: 'creator',
      timestamp: '2026-06-19T09:00:00.000Z',
      thumbnailUrl: 'https://cdn.example/image.jpg',
      scrapedAt: capturedAt,
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'XYZ-789',
        sourceUrl: 'https://www.instagram.com/reel/XYZ-789/',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass: 'user_session_visible',
      },
      rawData: {
        caption: 'A useful visible caption',
        author: 'creator',
        timestamp: '2026-06-19T09:00:00.000Z',
        thumbnailUrl: 'https://cdn.example/image.jpg',
      },
    });
  });

  it('rejects non-post and cross-origin URLs', () => {
    expect(() => buildInstagramRecord({
      href: 'https://evil.example/p/XYZ-789/',
      capturedAt,
      accessClass: 'public',
    })).toThrow();
  });
});

describe('partial sync queue retention', () => {
  const pending = [
    { id: 'accepted' },
    { id: 'failed' },
    { id: 'not-reported' },
  ];

  it('removes only explicitly accepted items', () => {
    expect(remainingPendingItems(pending, ['accepted'])).toEqual([
      { id: 'failed' },
      { id: 'not-reported' },
    ]);
  });

  it('preserves the full queue when the server reports no accepted IDs', () => {
    expect(remainingPendingItems(pending, undefined)).toEqual(pending);
  });
});
