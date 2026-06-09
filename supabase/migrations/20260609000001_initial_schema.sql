-- Recall — Initial Schema (PostgreSQL / Supabase)
-- Uses Clerk for auth: owner_id is TEXT (Clerk user IDs like "user_xxx")
-- Service role key used server-side; RLS bypassed for server queries

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  auto_sync BOOLEAN DEFAULT FALSE,
  sync_interval INTEGER DEFAULT 3600,
  last_sync_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved items table
CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  url TEXT NOT NULL,
  title TEXT,
  author TEXT,
  saved_at TEXT,
  platform TEXT,
  raw_data TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(url, owner_id)
);

-- Enrichments table
CREATE TABLE IF NOT EXISTS enrichments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
  summary TEXT,
  tags TEXT DEFAULT '[]',
  sentiment TEXT,
  topics TEXT DEFAULT '[]',
  entities TEXT DEFAULT '[]',
  quality_score REAL,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  clone_count INTEGER DEFAULT 0,
  owner_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board items table
CREATE TABLE IF NOT EXISTS board_items (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES saved_items(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT,
  owner_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, owner_id)
);

-- Purchases table (LemonSqueezy entitlements)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT,
  order_id TEXT,
  variant_id TEXT,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_items_owner_id ON saved_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_url ON saved_items(url);
CREATE INDEX IF NOT EXISTS idx_saved_items_platform ON saved_items(platform);
CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug);
CREATE INDEX IF NOT EXISTS idx_enrichments_item_id ON enrichments(item_id);
CREATE INDEX IF NOT EXISTS idx_settings_owner_id ON settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);

-- Enable RLS (service_role bypasses automatically)
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Clerk JWT sub claim (TEXT)
CREATE POLICY "items_owner" ON saved_items
  FOR ALL USING (owner_id = (auth.jwt() ->> 'sub') OR owner_id IS NULL);

CREATE POLICY "boards_owner" ON boards
  FOR ALL USING (owner_id = (auth.jwt() ->> 'sub') OR owner_id IS NULL);

CREATE POLICY "enrichments_owner" ON enrichments
  FOR ALL USING (
    item_id IN (
      SELECT id FROM saved_items
      WHERE owner_id = (auth.jwt() ->> 'sub') OR owner_id IS NULL
    )
  );

CREATE POLICY "settings_owner" ON settings
  FOR ALL USING (owner_id = (auth.jwt() ->> 'sub') OR owner_id IS NULL);

CREATE POLICY "board_items_owner" ON board_items
  FOR ALL USING (
    board_id IN (
      SELECT id FROM boards
      WHERE owner_id = (auth.jwt() ->> 'sub') OR owner_id IS NULL
    )
  );

CREATE POLICY "purchases_owner" ON purchases
  FOR ALL USING (user_id = (auth.jwt() ->> 'sub') OR user_id IS NULL);
