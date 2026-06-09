import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { githubStarsSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const token = searchParams.get('token');

  if (!username || !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    return NextResponse.json({ error: 'Valid GitHub username required' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Saved-Brain-GitHub-Integration',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Fetch starred repositories
    const starsRes = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=100`,
      { headers }
    );

    if (!starsRes.ok) {
      const error = await starsRes.text();
      return NextResponse.json(
        { error: `GitHub API error: ${starsRes.status}`, details: error },
        { status: starsRes.status }
      );
    }

    const stars = (await starsRes.json()) as Array<{
      id: number;
      full_name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      owner: { login: string };
      created_at: string;
    }>;

    const items = stars.map((repo) => ({
      id: `github-${repo.id}`,
      url: repo.html_url,
      title: repo.full_name,
      author: repo.owner.login,
      platform: 'github',
      rawData: `Description: ${repo.description || 'No description'}\nLanguage: ${repo.language || 'Unknown'}\nStars: ${repo.stargazers_count}`,
      savedAt: repo.created_at,
    }));

    return NextResponse.json({
      data: {
        username,
        count: items.length,
        items,
        userId: userId || null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch GitHub stars' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const body = await request.json();

  const validated = githubStarsSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid request', details: validated.error.flatten() }, { status: 400 });
  }
  const { username, token } = validated.data;

  if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    return NextResponse.json({ error: 'Invalid GitHub username format' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Saved-Brain-GitHub-Integration',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Fetch starred repositories
    const starsRes = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=100`,
      { headers }
    );

    if (!starsRes.ok) {
      const error = await starsRes.text();
      return NextResponse.json(
        { error: `GitHub API error: ${starsRes.status}`, details: error },
        { status: starsRes.status }
      );
    }

    const stars = (await starsRes.json()) as Array<{
      id: number;
      full_name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      owner: { login: string };
      created_at: string;
    }>;

    let ingested = 0;
    let skipped = 0;

    const insertStmt = db.prepare(
      `INSERT INTO saved_items (id, url, title, author, saved_at, platform, raw_data, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         title = COALESCE(excluded.title, saved_items.title),
         raw_data = COALESCE(excluded.raw_data, saved_items.raw_data),
         updated_at = datetime('now')`
    );

    for (const repo of stars) {
      const id = `github-${repo.id}`;
      const url = repo.html_url;
      const title = repo.full_name;
      const author = repo.owner.login;
      const savedAt = repo.created_at;
      const rawData = `Description: ${repo.description || 'No description'}\nLanguage: ${repo.language || 'Unknown'}\nStars: ${repo.stargazers_count}`;

      try {
        const result = await insertStmt.run(id, url, title, author, savedAt, 'github', rawData, userId || null);
        if (result.changes > 0) {
          ingested++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      data: {
        username,
        ingested,
        skipped,
        total: stars.length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to import GitHub stars' },
      { status: 500 }
    );
  }
}
