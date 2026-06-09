import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';

// Determine which database to use
const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isProduction = !!(databaseUrl || (supabaseUrl && supabaseKey));

// Supabase client (for auth/storage features if needed)
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase URL and key required');
  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

// SQLite instance (local dev only)
let _sqlite: ReturnType<typeof Database> | null = null;

function getSQLite(): ReturnType<typeof Database> {
  if (_sqlite) return _sqlite;
  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'saved-brain.sqlite');
  _sqlite = new Database(dbPath);
  _sqlite.pragma('journal_mode = WAL');
  return _sqlite;
}

interface StmtResult {
  changes: number;
}

// Shared db interface — all methods async for compatibility between SQLite and Postgres
export interface DbInterface {
  prepare(sql: string): {
    run(...params: unknown[]): Promise<StmtResult>;
    get(...params: unknown[]): Promise<Record<string, unknown> | undefined>;
    all(...params: unknown[]): Promise<Record<string, unknown>[]>;
  };
  exec(sql: string): Promise<void>;
}

export function getDb(): DbInterface {
  if (isProduction) {
    return getPostgresDb();
  }
  return getSQLiteDb();
}

// Convert SQLite SQL to Postgres-compatible SQL
function toPostgresSQL(sqlStr: string): string {
  // Convert ? placeholders to $1, $2, ...
  let idx = 0;
  let result = sqlStr.replace(/\?/g, () => `$${++idx}`);
  // Convert datetime('now') → NOW()
  result = result.replace(/datetime\('now'\)/gi, 'NOW()');
  // Cast COUNT(*) to int so pg returns number not BigInt string
  result = result.replace(/COUNT\(\*\)/gi, 'COUNT(*)::int');
  return result;
}

// Postgres adapter using @vercel/postgres (uses DATABASE_URL env var)
function getPostgresDb(): DbInterface {
  return {
    prepare(sqlStr: string) {
      const pgSql = toPostgresSQL(sqlStr);
      return {
        async run(...params: unknown[]): Promise<StmtResult> {
          try {
            const { db: pgClient } = await import('@vercel/postgres');
            await pgClient.query(pgSql, params as unknown[]);
            return { changes: 1 };
          } catch (err) {
            console.error('[db.run] error:', (err as Error).message, 'sql:', pgSql.slice(0, 120));
            return { changes: 0 };
          }
        },
        async get(...params: unknown[]): Promise<Record<string, unknown> | undefined> {
          try {
            const { db: pgClient } = await import('@vercel/postgres');
            const result = await pgClient.query(pgSql, params as unknown[]);
            if (!result.rows || result.rows.length === 0) return undefined;
            return result.rows[0] as Record<string, unknown>;
          } catch (err) {
            console.error('[db.get] error:', (err as Error).message, 'sql:', pgSql.slice(0, 120));
            return undefined;
          }
        },
        async all(...params: unknown[]): Promise<Record<string, unknown>[]> {
          try {
            const { db: pgClient } = await import('@vercel/postgres');
            const result = await pgClient.query(pgSql, params as unknown[]);
            return (result.rows || []) as Record<string, unknown>[];
          } catch (err) {
            console.error('[db.all] error:', (err as Error).message, 'sql:', pgSql.slice(0, 120));
            return [];
          }
        },
      };
    },
    async exec(sqlStr: string) {
      try {
        const { db: pgClient } = await import('@vercel/postgres');
        await pgClient.query(toPostgresSQL(sqlStr));
      } catch (err) {
        console.error('[db.exec] error:', (err as Error).message);
      }
    },
  };
}

function getSQLiteDb(): DbInterface {
  const db = getSQLite();

  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT DEFAULT '{}',
      enabled INTEGER DEFAULT 1,
      auto_sync INTEGER DEFAULT 0,
      sync_interval INTEGER DEFAULT 3600,
      last_sync_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY,
      source_id TEXT,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      author TEXT,
      saved_at TEXT,
      platform TEXT,
      raw_data TEXT,
      owner_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS enrichments (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
      summary TEXT,
      tags TEXT DEFAULT '[]',
      sentiment TEXT,
      topics TEXT DEFAULT '[]',
      entities TEXT DEFAULT '[]',
      quality_score INTEGER DEFAULT 50,
      provider TEXT,
      model TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
      vector TEXT,
      dimension INTEGER,
      provider TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT,
      is_public INTEGER DEFAULT 0,
      clone_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS board_items (
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
      position INTEGER DEFAULT 0,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (board_id, item_id)
    );
    CREATE TABLE IF NOT EXISTS graph_edges (
      id TEXT PRIMARY KEY,
      source_item_id TEXT NOT NULL,
      target_item_id TEXT NOT NULL,
      relation TEXT,
      weight REAL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      owner_id TEXT NOT NULL DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (key, owner_id)
    );
  `);

  return {
    prepare(sqlStr: string) {
      const stmt = db.prepare(sqlStr);
      return {
        async run(...params: unknown[]): Promise<StmtResult> {
          const result = stmt.run(...params);
          return { changes: result.changes };
        },
        async get(...params: unknown[]): Promise<Record<string, unknown> | undefined> {
          return stmt.get(...params) as Record<string, unknown> | undefined;
        },
        async all(...params: unknown[]): Promise<Record<string, unknown>[]> {
          return stmt.all(...params) as Record<string, unknown>[];
        },
      };
    },
    async exec(sqlStr: string) {
      db.exec(sqlStr);
    },
  };
}

// Helper for direct queries
export async function dbQuery(sqlStr: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  if (isProduction) {
    try {
      const { db: pgClient } = await import('@vercel/postgres');
      const result = await pgClient.query(sqlStr, params);
      return (result.rows || []) as Record<string, unknown>[];
    } catch (err) {
      console.error('[dbQuery] error:', (err as Error).message);
      return [];
    }
  }
  const db = getSQLite();
  return db.prepare(sqlStr).all(...params) as Record<string, unknown>[];
}
