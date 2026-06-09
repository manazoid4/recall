import { getDb } from './db';
import { encrypt, decrypt, isEncrypted } from './encryption';

// Keys that should be encrypted at rest
const ENCRYPTED_KEYS = new Set([
  'llm_api_key',
  'anthropic_api_key',
  'openai_api_key',
  'google_api_key',
  'groq_api_key',
  'together_api_key',
  'deepseek_api_key',
  'mistral_api_key',
  'cohere_api_key',
  'openrouter_api_key',
  'ollama_api_key',
  'database_url',
  'supabase_url',
  'supabase_anon_key',
  'supabase_service_role_key',
  'redis_url',
  'redis_password',
  'cron_secret',
  'clerk_secret_key',
  'clerk_webhook_secret',
]);

function isSecretKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    ENCRYPTED_KEYS.has(key) ||
    ENCRYPTED_KEYS.has(lowerKey) ||
    lowerKey.includes('api_key') ||
    lowerKey.includes('secret') ||
    lowerKey.includes('password') ||
    lowerKey.includes('token') ||
    lowerKey.endsWith('_key')
  );
}

export function getSetting(key: string, defaultValue: string = '', ownerId?: string): Promise<string> {
  const db = getDb();
  let query = 'SELECT value FROM settings WHERE key = ?';
  const params: (string)[] = [key];
  if (ownerId) {
    query += ' AND owner_id = ?';
    params.push(ownerId);
  }
  const row = db.prepare(query).get(...params) as { value: string } | undefined;
  let value = row?.value ?? defaultValue;
  // Decrypt secret values when reading
  if (isSecretKey(key) && value && isEncrypted(value)) {
    try {
      value = decrypt(value);
    } catch {
      // If decryption fails, return the raw value
    }
  }
  return Promise.resolve(value);
}

export function setSetting(key: string, value: string, ownerId?: string): Promise<void> {
  const db = getDb();
  // Encrypt secret values before storing
  let storedValue = value;
  if (isSecretKey(key) && value) {
    try {
      storedValue = encrypt(value);
    } catch {
      // If encryption fails, store the raw value
      storedValue = value;
    }
  }
  db.prepare(`
    INSERT INTO settings (key, value, owner_id, updated_at) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(key, storedValue, ownerId || null);
  return Promise.resolve();
}

export function getAllSettings(ownerId?: string): Promise<Record<string, string>> {
  const db = getDb();
  let query = 'SELECT key, value FROM settings';
  const params: (string)[] = [];
  if (ownerId) {
    query += ' WHERE owner_id = ?';
    params.push(ownerId);
  }
  const rows = db.prepare(query).all(...params) as Array<{ key: string; value: string }>;
  const result: Record<string, string> = {};
  for (const row of rows) {
    let value = row.value;
    // Decrypt secret values when reading
    if (isSecretKey(row.key) && value && isEncrypted(value)) {
      try {
        value = decrypt(value);
      } catch {
        // If decryption fails, return the raw value
      }
    }
    result[row.key] = value;
  }
  return Promise.resolve(result);
}
