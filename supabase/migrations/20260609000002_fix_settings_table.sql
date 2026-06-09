-- Fix settings table so key-based upserts work correctly
-- Replace id+key design with (key, owner_id) composite primary key
-- owner_id uses '' (empty string) for global/system settings instead of NULL

-- Step 1: drop existing constraints
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_owner_id_key;

-- Step 2: remove id column (not needed with composite PK)
ALTER TABLE settings DROP COLUMN IF EXISTS id;

-- Step 3: normalize owner_id — use '' for global settings (NULL not allowed in PK)
UPDATE settings SET owner_id = '' WHERE owner_id IS NULL;
ALTER TABLE settings ALTER COLUMN owner_id SET DEFAULT '';
ALTER TABLE settings ALTER COLUMN owner_id SET NOT NULL;

-- Step 4: add composite primary key
ALTER TABLE settings ADD PRIMARY KEY (key, owner_id);

-- Step 5: update RLS policy to match new schema
DROP POLICY IF EXISTS "settings_owner" ON settings;
CREATE POLICY "settings_owner" ON settings
  FOR ALL USING (
    owner_id = (auth.jwt() ->> 'sub')
    OR owner_id = ''
  );
