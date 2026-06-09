import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rate-limit';
import { checkEntitlements } from '@/lib/entitlements';

function escapeYaml(str: string): string {
  if (/[:#\n|>&*!?\[\]{},'`"]/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}

function itemToMarkdown(item: Record<string, unknown>): string {
  const title = (item.title as string) || 'Untitled';
  const url = item.url as string;
  const author = item.author as string | null;
  const platform = item.platform as string | null;
  const savedAt = item.saved_at as string | null;
  const createdAt = item.created_at as string;
  const rawData = item.raw_data as string | null;

  const summary = item.summary as string | null;
  const tags = JSON.parse((item.tags as string) || '[]') as string[];
  const entities = JSON.parse((item.entities as string) || '[]') as string[];
  const topics = JSON.parse((item.topics as string) || '[]') as string[];
  const sentiment = item.sentiment as string | null;
  const qualityScore = item.quality_score as number | null;

  const frontmatter: Record<string, unknown> = {
    title: escapeYaml(title),
    source_url: url,
    saved_brain_id: item.id,
    saved_at: savedAt || createdAt,
    platform: platform || 'unknown',
    ...(author ? { author: escapeYaml(author) } : {}),
    ...(sentiment ? { sentiment } : {}),
    ...(qualityScore ? { quality_score: qualityScore } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(topics.length > 0 ? { topics } : {}),
    ...(entities.length > 0 ? { entities } : {}),
  };

  const yamlLines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
    }
    return `${key}: ${value}`;
  });

  const body = [
    `---`,
    ...yamlLines,
    `---`,
    ``,
    `# ${title}`,
    ``,
    `**Source:** [${url}](${url})`,
    ...(author ? [`**Author:** ${author}`] : []),
    `**Platform:** ${platform || 'unknown'}`,
    ``,
    ...(summary ? [`## Summary`, ``, summary, ``] : []),
    ...(rawData ? [`## Raw Content`, ``, rawData, ``] : []),
    `---`,
    `*Exported from Recall*`,
  ].join('\n');

  return body;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'untitled';
}

export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();

  const entitlement = await checkEntitlements(userId, 'use_feature', 'export');
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'Pro feature required',
        reason: entitlement.reason,
        upgrade: '/upgrade',
      },
      { status: 403 }
    );
  }

  const db = getDb();

  let query = `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id`;
  const params: (string | null)[] = [];
  if (userId) {
    query += ' WHERE si.owner_id = ?';
    params.push(userId);
  }
  query += ' ORDER BY si.created_at DESC';

  const items = db.prepare(query).all(...params) as Record<string, unknown>[];

  if (items.length === 0) {
    return NextResponse.json({ error: 'No items to export' }, { status: 400 });
  }

  const files = items.map((item) => {
    const title = (item.title as string) || 'Untitled';
    const filename = `${slugify(title)}.md`;
    const content = itemToMarkdown(item);
    return { filename, content };
  });

  // Generate a simple text-based "zip" manifest for now
  // In production, you'd use a real zip library like JSZip
  const manifest = files.map((f) => `- ${f.filename}`).join('\n');

  return NextResponse.json({
    data: {
      itemCount: files.length,
      manifest,
      files,
    },
  });
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();

  const entitlement = await checkEntitlements(userId, 'use_feature', 'export');
  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        error: 'Pro feature required',
        reason: entitlement.reason,
        upgrade: '/upgrade',
      },
      { status: 403 }
    );
  }

  const db = getDb();

  let query = `SELECT si.*, e.summary, e.tags, e.sentiment, e.topics, e.entities, e.quality_score
       FROM saved_items si
       LEFT JOIN enrichments e ON e.item_id = si.id`;
  const params: (string | null)[] = [];
  if (userId) {
    query += ' WHERE si.owner_id = ?';
    params.push(userId);
  }
  query += ' ORDER BY si.created_at DESC';

  const items = db.prepare(query).all(...params) as Record<string, unknown>[];

  if (items.length === 0) {
    return NextResponse.json({ error: 'No items to export' }, { status: 400 });
  }

  const files = items.map((item) => {
    const title = (item.title as string) || 'Untitled';
    const filename = `${slugify(title)}.md`;
    const content = itemToMarkdown(item);
    return { filename, content };
  });

  // Return as a JSON bundle that can be downloaded
  // Client-side can use JSZip to create actual zip
  return NextResponse.json({
    data: {
      itemCount: files.length,
      exportDate: new Date().toISOString(),
      files,
    },
  });
}
