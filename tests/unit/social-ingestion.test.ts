import { describe, expect, it } from 'vitest';
import {
  normalizeInstagramUrl,
  normalizeSocialIngestion,
  serializeIngestionMetadata,
  serializeRawMetadata,
} from '../../lib/social-ingestion';

const capturedAt = '2026-06-20T10:30:00.000Z';

describe('Instagram provenance contract', () => {
  it.each([
    ['https://instagram.com/p/AbC_123/?utm_source=ig_web_copy_link', 'https://www.instagram.com/p/AbC_123/', 'AbC_123'],
    ['https://www.instagram.com/reel/XYZ-789/', 'https://www.instagram.com/reel/XYZ-789/', 'XYZ-789'],
    ['https://www.instagram.com/tv/TV_code/?igsh=abc', 'https://www.instagram.com/tv/TV_code/', 'TV_code'],
  ])('canonicalizes supported Instagram URLs', (input, canonicalUrl, platformItemId) => {
    expect(normalizeInstagramUrl(input)).toEqual({ canonicalUrl, platformItemId });
  });

  it.each([
    'https://www.instagram.com/accounts/login/',
    'https://www.instagram.com/private-profile/',
    'https://evil.example/p/AbC_123/',
    'not a url',
  ])('rejects unsupported Instagram URLs: %s', (input) => {
    expect(() => normalizeInstagramUrl(input)).toThrow();
  });

  it('normalizes a versioned user-session-visible provenance envelope', () => {
    expect(normalizeSocialIngestion({
      url: 'https://instagram.com/p/AbC_123/?igsh=tracking',
      source: 'instagram',
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'AbC_123',
        sourceUrl: 'https://instagram.com/p/AbC_123/?igsh=tracking',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass: 'user_session_visible',
      },
      rawData: { thumbnailUrl: 'https://cdn.example/image.jpg' },
    })).toEqual({
      url: 'https://www.instagram.com/p/AbC_123/',
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'AbC_123',
        sourceUrl: 'https://www.instagram.com/p/AbC_123/',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass: 'user_session_visible',
      },
      metadata: { thumbnailUrl: 'https://cdn.example/image.jpg' },
    });
  });

  it.each(['private', 'unknown', 'bypassed'])('rejects disallowed access classification: %s', (accessClass) => {
    expect(() => normalizeSocialIngestion({
      url: 'https://www.instagram.com/p/AbC_123/',
      source: 'instagram',
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'AbC_123',
        sourceUrl: 'https://www.instagram.com/p/AbC_123/',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass,
      },
    })).toThrow();
  });

  it('rejects provenance whose ID does not match the canonical URL', () => {
    expect(() => normalizeSocialIngestion({
      url: 'https://www.instagram.com/p/AbC_123/',
      source: 'instagram',
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'different',
        sourceUrl: 'https://www.instagram.com/p/AbC_123/',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass: 'public',
      },
    })).toThrow();
  });

  it('serializes metadata with a stable envelope shape', () => {
    const normalized = normalizeSocialIngestion({
      url: 'https://www.instagram.com/p/AbC_123/',
      source: 'instagram',
      provenance: {
        schemaVersion: 1,
        platform: 'instagram',
        platformItemId: 'AbC_123',
        sourceUrl: 'https://www.instagram.com/p/AbC_123/',
        capturedAt,
        captureMethod: 'browser_extension',
        accessClass: 'public',
      },
      rawData: '{"likes":12}',
    });

    expect(serializeIngestionMetadata(normalized)).toBe(JSON.stringify({
      provenance: normalized.provenance,
      metadata: { likes: 12 },
    }));
  });

  it('serializes legacy JSON metadata without double encoding it', () => {
    expect(serializeRawMetadata('{"likes":12}')).toBe('{"likes":12}');
  });
});
