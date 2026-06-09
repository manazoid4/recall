-- Database schema for Saved Brain
-- Run this in Supabase SQL Editor to create tables

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT DEFAULT '{}',
  enabled INTEGER DEFAULT 1,
  auto_sync INTEGER DEFAULT 0,
  sync_interval INTEGER DEFAULT 3600,
  last_sync_at TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved items table
CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  author TEXT,
  saved_at TEXT,
  platform TEXT,
  raw_data TEXT,
  owner_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrichments table
CREATE TABLE IF NOT EXISTS enrichments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES saved_items(id),
  summary TEXT,
  tags TEXT DEFAULT '[]',
  sentiment TEXT,
  topics TEXT DEFAULT '[]',
  entities TEXT DEFAULT '[]',
  quality_score REAL,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_public INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  owner_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board items table
CREATE TABLE IF NOT EXISTS board_items (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id),
  item_id TEXT NOT NULL REFERENCES saved_items(id),
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  owner_id TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table (for entitlements)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT,
  order_id TEXT,
  variant_id TEXT,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Enable RLS
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only see their own items" ON saved_items
  FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can only see their own boards" ON boards
  FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can only see their own enrichments" ON enrichments
  FOR ALL USING (
    item_id IN (SELECT id FROM saved_items WHERE owner_id = auth.uid() OR owner_id IS NULL)
  );

CREATE POLICY "Users can only see their own settings" ON settings
  FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can only see their own board_items" ON board_items
  FOR ALL USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid() OR owner_id IS NULL)
  );

CREATE POLICY "Users can only see their own purchases" ON purchases
  FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Function for exec_sql (for admin use only)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT, params JSONB DEFAULT '[]')
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
