import { z } from 'zod';

// Item schemas
export const createItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Invalid URL format'),
  title: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  savedAt: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  rawData: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export const itemQuerySchema = z.object({
  search: z.string().optional(),
  source: z.string().optional(),
  tag: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

// Board schemas
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name too long'),
  description: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

// Enrich schema
export const enrichSchema = z.object({
  itemId: z.string().optional(),
  all: z.boolean().optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  mode: z.enum(['fulltext', 'semantic']).optional(),
  limit: z.number().optional(),
});

// Settings schema
export const settingsSchema = z.record(z.string());

// GitHub schema
export const githubStarsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  token: z.string().optional().nullable(),
});

// Ingest schema
export const ingestSchema = z.array(
  z.object({
    id: z.string().optional(),
    url: z.string().url(),
    title: z.string().optional().nullable(),
    author: z.string().optional().nullable(),
    timestamp: z.string().optional().nullable(),
    savedAt: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    platform: z.string().optional().nullable(),
    rawData: z.string().optional().nullable(),
  })
);

// Export schema
export const exportSchema = z.object({
  format: z.enum(['obsidian', 'json', 'csv']).optional(),
});

// Digest schema
export const digestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Webhook schema
export const lemonsqueezyWebhookSchema = z.object({
  meta: z.object({
    event_name: z.string(),
  }),
  data: z.object({
    attributes: z.record(z.unknown()),
  }),
});
