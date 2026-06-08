import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'saved-brain.json');

interface DBSchema {
  sources: Record<string, SourceRow>;
  saved_items: Record<string, SavedItemRow>;
  enrichments: Record<string, EnrichmentRow>;
  embeddings: Record<string, EmbeddingRow>;
  boards: Record<string, BoardRow>;
  board_items: BoardItemRow[];
  graph_edges: Record<string, GraphEdgeRow>;
  settings: Record<string, string>;
}

interface SourceRow {
  id: string;
  name: string;
  type: string;
  config: string;
  enabled: number;
  auto_sync: number;
  sync_interval: number;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SavedItemRow {
  id: string;
  source_id: string | null;
  url: string;
  title: string | null;
  author: string | null;
  saved_at: string | null;
  platform: string | null;
  raw_data: string | null;
  created_at: string;
  updated_at: string;
}

interface EnrichmentRow {
  id: string;
  item_id: string;
  summary: string | null;
  tags: string;
  sentiment: string | null;
  topics: string;
  entities: string;
  quality_score: number;
  provider: string | null;
  model: string | null;
  created_at: string;
}

interface EmbeddingRow {
  id: string;
  item_id: string;
  vector: string | null;
  dimension: number | null;
  provider: string | null;
  created_at: string;
}

interface BoardRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  is_public: number;
  clone_count: number;
  created_at: string;
  updated_at: string;
}

interface BoardItemRow {
  board_id: string;
  item_id: string;
  position: number;
  added_at: string;
}

interface GraphEdgeRow {
  id: string;
  source_item_id: string;
  target_item_id: string;
  relation: string;
  weight: number;
  created_at: string;
}

let _db: DBSchema | null = null;

function emptyDB(): DBSchema {
  return {
    sources: {},
    saved_items: {},
    enrichments: {},
    embeddings: {},
    boards: {},
    board_items: [],
    graph_edges: {},
    settings: {},
  };
}

function loadDB(): DBSchema {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure all tables exist
      const empty = emptyDB();
      for (const key of Object.keys(empty) as (keyof DBSchema)[]) {
        if (!(key in parsed)) {
          (parsed as Record<string, unknown>)[key] = empty[key];
        }
      }
      _db = parsed as DBSchema;
    } catch {
      _db = emptyDB();
    }
  } else {
    _db = emptyDB();
  }

  return _db;
}

function saveDB(): void {
  if (!_db) return;
  fs.writeFileSync(DB_PATH, JSON.stringify(_db, null, 2), 'utf-8');
}

// Query builder helpers that mimic better-sqlite3 API
interface StmtResult {
  changes: number;
}

function now(): string {
  return new Date().toISOString();
}

export function getDb() {
  loadDB();

  return {
    prepare(sql: string) {
      return {
        run(...params: unknown[]): StmtResult {
          const db = loadDB();
          const upper = sql.trim().toUpperCase();

          // INSERT INTO saved_items
          if (upper.includes('INSERT') && upper.includes('SAVED_ITEMS')) {
            return handleInsertSavedItem(db, params, upper.includes('ON CONFLICT'));
          }

          // INSERT INTO enrichments
          if (upper.includes('INSERT') && upper.includes('ENRICHMENTS')) {
            return handleInsertEnrichment(db, params);
          }

          // INSERT INTO boards
          if (upper.includes('INSERT') && upper.includes('BOARDS') && !upper.includes('BOARD_ITEMS')) {
            return handleInsertBoard(db, params);
          }

          // INSERT INTO board_items
          if (upper.includes('INSERT') && upper.includes('BOARD_ITEMS')) {
            return handleInsertBoardItem(db, params);
          }

          // INSERT INTO settings
          if (upper.includes('INSERT') && upper.includes('SETTINGS')) {
            return handleInsertSetting(db, params);
          }

          // INSERT INTO graph_edges
          if (upper.includes('INSERT') && upper.includes('GRAPH_EDGES')) {
            return handleInsertGraphEdge(db, params);
          }

          // DELETE FROM saved_items
          if (upper.includes('DELETE') && upper.includes('SAVED_ITEMS')) {
            return handleDeleteSavedItem(db, params);
          }

          // DELETE FROM boards
          if (upper.includes('DELETE') && upper.includes('BOARDS')) {
            return handleDeleteBoard(db, params);
          }

          return { changes: 0 };
        },

        get(...params: unknown[]): Record<string, unknown> | undefined {
          const db = loadDB();
          const upper = sql.trim().toUpperCase();

          // SELECT from saved_items with enrichment join
          if (upper.includes('SAVED_ITEMS') && upper.includes('ENRICHMENTS')) {
            return handleGetSavedItemWithEnrichment(db, params, sql);
          }

          // SELECT from saved_items
          if (upper.includes('SAVED_ITEMS')) {
            return handleGetSavedItem(db, params, sql);
          }

          // SELECT from boards
          if (upper.includes('BOARDS') && !upper.includes('BOARD_ITEMS')) {
            return handleGetBoard(db, params, sql);
          }

          // SELECT from settings
          if (upper.includes('SETTINGS')) {
            return handleGetSetting(db, params, sql);
          }

          // SELECT COUNT
          if (upper.includes('COUNT')) {
            return handleCount(db, sql);
          }

          return undefined;
        },

        all(...params: unknown[]): Record<string, unknown>[] {
          const db = loadDB();
          const upper = sql.trim().toUpperCase();

          // SELECT all from saved_items with enrichment
          if (upper.includes('SAVED_ITEMS') && upper.includes('ENRICHMENTS')) {
            return handleGetAllSavedItemsWithEnrichment(db, params, sql);
          }

          // SELECT all from saved_items
          if (upper.includes('SAVED_ITEMS')) {
            return handleGetAllSavedItems(db, params, sql);
          }

          // SELECT all from boards with item count
          if (upper.includes('BOARDS') && upper.includes('BOARD_ITEMS')) {
            return handleGetAllBoardsWithCount(db);
          }

          // SELECT all from boards
          if (upper.includes('BOARDS')) {
            return handleGetAllBoards(db);
          }

          // SELECT board_items with items
          if (upper.includes('BOARD_ITEMS') && upper.includes('SAVED_ITEMS')) {
            return handleGetBoardItems(db, params);
          }

          // SELECT settings
          if (upper.includes('SETTINGS')) {
            return handleGetAllSettings(db);
          }

          // SELECT enrichments
          if (upper.includes('ENRICHMENTS')) {
            return handleGetAllEnrichments(db, sql);
          }

          return [];
        },
      };
    },

    exec(_sql: string) {
      // No-op for JSON store — tables are auto-created
      saveDB();
    },

    pragma(_stmt: string) {
      // No-op
    },

    transaction<T>(fn: (...args: unknown[]) => T) {
      return (...args: unknown[]): T => {
        const result = fn(...args);
        saveDB();
        return result;
      };
    },
  };
}

// --- Handler functions ---

function handleInsertSavedItem(db: DBSchema, params: unknown[], upsert: boolean): StmtResult {
  const [id, url, title, author, saved_at, platform, raw_data] = params as [
    string, string, string | null, string | null, string | null, string | null, string | null
  ];

  if (db.saved_items[url] && !upsert) {
    return { changes: 0 };
  }

  const existing = Object.values(db.saved_items).find((i) => i.url === url);

  if (existing && upsert) {
    existing.title = title || existing.title;
    existing.raw_data = raw_data || existing.raw_data;
    existing.updated_at = now();
    saveDB();
    return { changes: 1 };
  }

  db.saved_items[id] = {
    id,
    source_id: null,
    url,
    title,
    author,
    saved_at,
    platform,
    raw_data,
    created_at: now(),
    updated_at: now(),
  };
  saveDB();
  return { changes: 1 };
}

function handleInsertEnrichment(db: DBSchema, params: unknown[]): StmtResult {
  const [id, item_id, summary, tags, sentiment, topics, entities, quality_score, provider, model] = params as [
    string, string, string | null, string, string | null, string, string, number, string | null, string | null
  ];

  // Remove existing enrichment for this item (INSERT OR REPLACE)
  for (const [key, e] of Object.entries(db.enrichments)) {
    if (e.item_id === item_id) {
      delete db.enrichments[key];
    }
  }

  db.enrichments[id] = {
    id,
    item_id,
    summary,
    tags,
    sentiment,
    topics,
    entities,
    quality_score,
    provider,
    model,
    created_at: now(),
  };
  saveDB();
  return { changes: 1 };
}

function handleInsertBoard(db: DBSchema, params: unknown[]): StmtResult {
  const [id, slug, name, description, is_public] = params as [
    string, string, string, string | null, number
  ];

  db.boards[id] = {
    id,
    slug,
    name,
    description,
    owner_id: null,
    is_public,
    clone_count: 0,
    created_at: now(),
    updated_at: now(),
  };
  saveDB();
  return { changes: 1 };
}

function handleInsertBoardItem(db: DBSchema, params: unknown[]): StmtResult {
  const [board_id, item_id, position] = params as [string, string, number];

  const exists = db.board_items.find((bi) => bi.board_id === board_id && bi.item_id === item_id);
  if (exists) return { changes: 0 };

  db.board_items.push({
    board_id,
    item_id,
    position,
    added_at: now(),
  });
  saveDB();
  return { changes: 1 };
}

function handleInsertSetting(db: DBSchema, params: unknown[]): StmtResult {
  const [key, value] = params as [string, string];
  db.settings[key] = value;
  saveDB();
  return { changes: 1 };
}

function handleInsertGraphEdge(db: DBSchema, params: unknown[]): StmtResult {
  const [id, source_item_id, target_item_id, relation, weight] = params as [
    string, string, string, string, number
  ];

  db.graph_edges[id] = {
    id,
    source_item_id,
    target_item_id,
    relation,
    weight: weight || 1,
    created_at: now(),
  };
  saveDB();
  return { changes: 1 };
}

function handleDeleteSavedItem(db: DBSchema, params: unknown[]): StmtResult {
  if (params.length === 0 || !params[0]) {
    // DELETE all
    const count = Object.keys(db.saved_items).length;
    db.saved_items = {};
    db.enrichments = {};
    db.embeddings = {};
    db.board_items = [];
    db.graph_edges = {};
    saveDB();
    return { changes: count };
  }

  const id = params[0] as string;
  if (db.saved_items[id]) {
    delete db.saved_items[id];
    // Cascade
    for (const [key, e] of Object.entries(db.enrichments)) {
      if (e.item_id === id) delete db.enrichments[key];
    }
    for (const [key, e] of Object.entries(db.embeddings)) {
      if (e.item_id === id) delete db.embeddings[key];
    }
    db.board_items = db.board_items.filter((bi) => bi.item_id !== id);
    for (const [key, e] of Object.entries(db.graph_edges)) {
      if (e.source_item_id === id || e.target_item_id === id) delete db.graph_edges[key];
    }
    saveDB();
    return { changes: 1 };
  }
  return { changes: 0 };
}

function handleDeleteBoard(db: DBSchema, params: unknown[]): StmtResult {
  const id = params[0] as string;
  if (db.boards[id]) {
    delete db.boards[id];
    db.board_items = db.board_items.filter((bi) => bi.board_id !== id);
    saveDB();
    return { changes: 1 };
  }
  return { changes: 0 };
}

function handleGetSavedItemWithEnrichment(
  db: DBSchema,
  params: unknown[],
  sql: string
): Record<string, unknown> | undefined {
  const id = params[0] as string;
  const item = db.saved_items[id];
  if (!item) return undefined;

  const enrichment = Object.values(db.enrichments).find((e) => e.item_id === id);

  return {
    ...item,
    summary: enrichment?.summary || null,
    tags: enrichment?.tags || '[]',
    sentiment: enrichment?.sentiment || null,
    topics: enrichment?.topics || '[]',
    entities: enrichment?.entities || '[]',
    quality_score: enrichment?.quality_score || 0,
    e_provider: enrichment?.provider || null,
    e_model: enrichment?.model || null,
    e_created_at: enrichment?.created_at || null,
  };
}

function handleGetSavedItem(
  db: DBSchema,
  params: unknown[],
  _sql: string
): Record<string, unknown> | undefined {
  const id = params[0] as string;
  return db.saved_items[id] as unknown as Record<string, unknown>;
}

function handleGetBoard(
  db: DBSchema,
  params: unknown[],
  sql: string
): Record<string, unknown> | undefined {
  const param = params[0];
  const upper = sql.toUpperCase();

  if (upper.includes('SLUG')) {
    return Object.values(db.boards).find((b) => b.slug === param) as unknown as Record<string, unknown>;
  }
  return db.boards[param as string] as unknown as Record<string, unknown>;
}

function handleGetSetting(
  db: DBSchema,
  params: unknown[],
  _sql: string
): Record<string, unknown> | undefined {
  const key = params[0] as string;
  return { value: db.settings[key] || '' };
}

function handleCount(db: DBSchema, sql: string): Record<string, unknown> {
  const upper = sql.toUpperCase();
  if (upper.includes('SAVED_ITEMS')) return { total: Object.keys(db.saved_items).length, count: Object.keys(db.saved_items).length };
  if (upper.includes('ENRICHMENTS')) return { total: Object.keys(db.enrichments).length, count: Object.keys(db.enrichments).length };
  if (upper.includes('BOARDS')) return { total: Object.keys(db.boards).length, count: Object.keys(db.boards).length };
  return { total: 0, count: 0 };
}

function handleGetAllSavedItemsWithEnrichment(
  db: DBSchema,
  _params: unknown[],
  sql: string
): Record<string, unknown>[] {
  const upper = sql.toUpperCase();
  let items = Object.values(db.saved_items);

  // Apply WHERE filters from SQL
  const searchMatch = sql.match(/LIKE\s*\?/gi);
  if (searchMatch && _params.length > 0) {
    const params = _params as string[];
    let paramIdx = 0;

    if (upper.includes('TITLE LIKE') || upper.includes('URL LIKE') || upper.includes('RAW_DATA LIKE')) {
      const search = params[paramIdx]?.replace(/%/g, '') || '';
      paramIdx++;
      if (search) {
        const lower = search.toLowerCase();
        items = items.filter(
          (i) =>
            (i.title && i.title.toLowerCase().includes(lower)) ||
            i.url.toLowerCase().includes(lower) ||
            (i.raw_data && i.raw_data.toLowerCase().includes(lower))
        );
      }
    }

    if (upper.includes('PLATFORM')) {
      const platform = params[paramIdx];
      paramIdx++;
      if (platform) {
        items = items.filter((i) => i.platform === platform);
      }
    }

    if (upper.includes('E.TAGS LIKE')) {
      const tag = params[paramIdx]?.replace(/%/g, '') || '';
      paramIdx++;
      if (tag) {
        items = items.filter((i) => {
          const e = Object.values(db.enrichments).find((en) => en.item_id === i.id);
          return e && e.tags.includes(tag);
        });
      }
    }
  }

  // Sort by created_at DESC
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Apply LIMIT/OFFSET
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  const offsetMatch = sql.match(/OFFSET\s+\?/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : 50;

  // Check if limit/offset are params
  let actualLimit = limit;
  let actualOffset = 0;
  const numericParams = (_params as unknown[]).filter((p) => typeof p === 'number');
  if (numericParams.length >= 1) actualLimit = numericParams[0];
  if (numericParams.length >= 2) actualOffset = numericParams[1];

  items = items.slice(actualOffset, actualOffset + actualLimit);

  return items.map((item) => {
    const enrichment = Object.values(db.enrichments).find((e) => e.item_id === item.id);
    return {
      ...item,
      summary: enrichment?.summary || null,
      tags: enrichment?.tags || '[]',
      sentiment: enrichment?.sentiment || null,
      topics: enrichment?.topics || '[]',
      entities: enrichment?.entities || '[]',
      quality_score: enrichment?.quality_score || 0,
      e_provider: enrichment?.provider || null,
      e_model: enrichment?.model || null,
      e_created_at: enrichment?.created_at || null,
    };
  });
}

function handleGetAllSavedItems(
  db: DBSchema,
  _params: unknown[],
  _sql: string
): Record<string, unknown>[] {
  return Object.values(db.saved_items) as unknown as Record<string, unknown>[];
}

function handleGetAllBoardsWithCount(db: DBSchema): Record<string, unknown>[] {
  return Object.values(db.boards).map((board) => ({
    ...board,
    item_count: db.board_items.filter((bi) => bi.board_id === board.id).length,
  })) as unknown as Record<string, unknown>[];
}

function handleGetAllBoards(db: DBSchema): Record<string, unknown>[] {
  return Object.values(db.boards) as unknown as Record<string, unknown>[];
}

function handleGetBoardItems(db: DBSchema, params: unknown[]): Record<string, unknown>[] {
  const boardId = params[0] as string;
  const boardItemIds = db.board_items
    .filter((bi) => bi.board_id === boardId)
    .sort((a, b) => a.position - b.position)
    .map((bi) => bi.item_id);

  return boardItemIds
    .map((id) => {
      const item = db.saved_items[id];
      if (!item) return null;
      const enrichment = Object.values(db.enrichments).find((e) => e.item_id === id);
      return {
        ...item,
        summary: enrichment?.summary || null,
        tags: enrichment?.tags || '[]',
        entities: enrichment?.entities || '[]',
      };
    })
    .filter(Boolean) as Record<string, unknown>[];
}

function handleGetAllSettings(db: DBSchema): Record<string, unknown>[] {
  return Object.entries(db.settings).map(([key, value]) => ({ key, value }));
}

function handleGetAllEnrichments(db: DBSchema, _sql: string): Record<string, unknown>[] {
  return Object.values(db.enrichments) as unknown as Record<string, unknown>[];
}
