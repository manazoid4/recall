import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';

// Determine which database to use
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabase = !!(supabaseUrl && supabaseKey);

// Supabase client
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
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

export function getDb() {
  if (isSupabase) {
    return getSupabaseDb();
  }
  return getSQLiteDb();
}

// Convert SQL with ? placeholders to numbered $1, $2, etc.
function normalizeParams(sqlStr: string, params: unknown[]): { sql: string; values: unknown[] } {
  let idx = 0;
  const sql = sqlStr.replace(/\?/g, () => {
    idx++;
    return `$${idx}`;
  });
  return { sql, values: params };
}

function getSupabaseDb() {
  return {
    prepare(sqlStr: string) {
      return {
        async run(...params: unknown[]): Promise<StmtResult> {
          const { sql, values } = normalizeParams(sqlStr, params);
          try {
            const { error } = await getSupabase().rpc('exec_sql', { sql, params: values } as any);
            if (error) {
              console.error('SQL error:', error.message);
              return { changes: 0 };
            }
            return { changes: 1 };
          } catch {
            return { changes: 0 };
          }
        },
        async get(...params: unknown[]): Promise<Record<string, unknown> | undefined> {
          const { sql, values } = normalizeParams(sqlStr, params);
          try {
            const { data, error } = await getSupabase().rpc('exec_sql', { sql, params: values } as any);
            if (error || !data || (data as any[]).length === 0) return undefined;
            return (data as any[])[0] as Record<string, unknown>;
          } catch {
            return undefined;
          }
        },
        async all(...params: unknown[]): Promise<Record<string, unknown>[]> {
          const { sql, values } = normalizeParams(sqlStr, params);
          try {
            const { data, error } = await getSupabase().rpc('exec_sql', { sql, params: values } as any);
            if (error || !data) return [];
            return (data as any[]) as Record<string, unknown>[];
          } catch {
            return [];
          }
        },
      };
    },
    async exec(sqlStr: string) {
      const { error } = await getSupabase().rpc('exec_sql', { sql: sqlStr, params: [] } as any);
      if (error) console.error('Exec error:', error.message);
    },
    pragma(_stmt: string) {
      // No-op for Supabase
    },
    transaction<T>(fn: (..._args: unknown[]) => T) {
      return (..._args: unknown[]): T => {
        return fn(..._args);
      };
    },
  };
}

function getSQLiteDb() {
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
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      owner_id TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return {
    prepare(sqlStr: string) {
      const stmt = db.prepare(sqlStr);
      return {
        run(...params: unknown[]): StmtResult {
          const result = stmt.run(...params);
          return { changes: result.changes };
        },
        get(...params: unknown[]): Record<string, unknown> | undefined {
          return stmt.get(...params) as Record<string, unknown> | undefined;
        },
        all(...params: unknown[]): Record<string, unknown>[] {
          return stmt.all(...params) as Record<string, unknown>[];
        },
      };
    },
    exec(sqlStr: string) {
      db.exec(sqlStr);
    },
    pragma(stmt: string) {
      db.pragma(stmt);
    },
    transaction<T>(fn: (..._args: unknown[]) => T) {
      return db.transaction(fn);
    },
  };
}

// Helper for direct queries
export async function dbQuery(sqlStr: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  if (isSupabase) {
    const { sql, values } = normalizeParams(sqlStr, params);
    const { data, error } = await getSupabase().rpc('exec_sql', { sql, params: values } as any);
    if (error) {
      console.error('Query error:', error.message);
      return [];
    }
    return (data || []) as Record<string, unknown>[];
  }
  const db = getSQLite();
  return db.prepare(sqlStr).all(...params) as Record<string, unknown>[];
}
