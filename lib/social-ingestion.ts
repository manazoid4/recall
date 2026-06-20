import { z } from 'zod';

const instagramPostPath = /^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/;

export const socialProvenanceSchema = z.object({
  schemaVersion: z.literal(1),
  platform: z.literal('instagram'),
  platformItemId: z.string().regex(/^[A-Za-z0-9_-]+$/),
  sourceUrl: z.string().url(),
  capturedAt: z.string().datetime(),
  captureMethod: z.enum(['browser_extension', 'manual_import', 'platform_export']),
  accessClass: z.enum(['public', 'user_session_visible']),
}).strict();

export type SocialProvenance = z.infer<typeof socialProvenanceSchema>;

export interface NormalizedSocialIngestion {
  url: string;
  provenance: SocialProvenance;
  metadata: Record<string, unknown>;
}

export function normalizeInstagramUrl(input: string): {
  canonicalUrl: string;
  platformItemId: string;
} {
  let url: URL;
  try {
    url = new URL(input, 'https://www.instagram.com');
  } catch {
    throw new Error('Invalid Instagram URL');
  }

  if (!['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase())) {
    throw new Error('Unsupported Instagram host');
  }

  const match = url.pathname.match(instagramPostPath);
  if (!match) {
    throw new Error('Unsupported Instagram post URL');
  }

  const [, postType, platformItemId] = match;
  return {
    canonicalUrl: `https://www.instagram.com/${postType}/${platformItemId}/`,
    platformItemId,
  };
}

function normalizeMetadata(rawData: unknown): Record<string, unknown> {
  if (rawData == null || rawData === '') return {};
  if (typeof rawData === 'string') {
    try {
      const parsed = JSON.parse(rawData);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : { value: parsed };
    } catch {
      return { value: rawData };
    }
  }
  if (typeof rawData === 'object' && !Array.isArray(rawData)) {
    return rawData as Record<string, unknown>;
  }
  return { value: rawData };
}

export function normalizeSocialIngestion(input: {
  url: string;
  source?: string | null;
  platform?: string | null;
  provenance?: unknown;
  rawData?: unknown;
}): NormalizedSocialIngestion {
  const source = input.source ?? input.platform;
  if (source !== 'instagram') {
    throw new Error('Unsupported social ingestion platform');
  }

  const provenance = socialProvenanceSchema.parse(input.provenance);
  const itemUrl = normalizeInstagramUrl(input.url);
  const sourceUrl = normalizeInstagramUrl(provenance.sourceUrl);

  if (
    provenance.platformItemId !== itemUrl.platformItemId
    || sourceUrl.platformItemId !== itemUrl.platformItemId
  ) {
    throw new Error('Instagram provenance does not match the canonical item URL');
  }

  return {
    url: itemUrl.canonicalUrl,
    provenance: {
      ...provenance,
      sourceUrl: sourceUrl.canonicalUrl,
    },
    metadata: normalizeMetadata(input.rawData),
  };
}

export function serializeIngestionMetadata(normalized: NormalizedSocialIngestion): string {
  return JSON.stringify({
    provenance: normalized.provenance,
    metadata: normalized.metadata,
  });
}

export function serializeRawMetadata(rawData: unknown): string {
  return JSON.stringify(normalizeMetadata(rawData));
}
