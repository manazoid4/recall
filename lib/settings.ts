import { getDb } from './db';

export function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return Promise.resolve(row?.value ?? defaultValue);
}

export function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(key, value);
  return Promise.resolve();
}

export function getAllSettings(): Promise<Record<string, string>> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return Promise.resolve(result);
}
