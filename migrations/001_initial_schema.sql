-- Initial schema for Saved Brain
-- Supports multi-tenancy with owner_id

-- Enable RLS
ALTER TABLE IF EXISTS saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrichments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS board_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their own items" ON saved_items;
DROP POLICY IF EXISTS "Users can only see their own boards" ON boards;
DROP POLICY IF EXISTS "Users can only see their own enrichments" ON enrichments;
DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
DROP POLICY IF EXISTS "Users can only see their own board_items" ON board_items;

-- Create RLS policies
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_items_owner_id ON saved_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_settings_owner_id ON settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_url ON saved_items(url);
CREATE INDEX IF NOT EXISTS idx_saved_items_platform ON saved_items(platform);
CREATE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug);
CREATE INDEX IF NOT EXISTS idx_enrichments_item_id ON enrichments(item_id);
