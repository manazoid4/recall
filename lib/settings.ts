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

// Env var fallback for LLM API keys — server-side key overrides empty DB setting
const ENV_KEY_MAP: Record<string, string> = {
  llm_api_key: 'LLM_API_KEY',
  openai_api_key: 'OPENAI_API_KEY',
  anthropic_api_key: 'ANTHROPIC_API_KEY',
  google_api_key: 'GOOGLE_API_KEY',
  groq_api_key: 'GROQ_API_KEY',
  together_api_key: 'TOGETHER_API_KEY',
  deepseek_api_key: 'DEEPSEEK_API_KEY',
  mistral_api_key: 'MISTRAL_API_KEY',
  cohere_api_key: 'COHERE_API_KEY',
  openrouter_api_key: 'OPENROUTER_API_KEY',
};

const PROVIDER_ENV_MAP: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  cohere: 'COHERE_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
};

export async function getSetting(key: string, defaultValue: string = '', ownerId?: string): Promise<string> {
  const db = getDb();
  const ownerParam = ownerId || '';
  const query = 'SELECT value FROM settings WHERE key = ? AND owner_id = ?';
  const params: string[] = [key, ownerParam];
  const row = await db.prepare(query).get(...params) as { value: string } | undefined;
  let value = row?.value ?? '';
  // Decrypt secret values when reading
  if (isSecretKey(key) && value && isEncrypted(value)) {
    try {
      value = decrypt(value);
    } catch {
      // If decryption fails, return the raw value
    }
  }
  // Fall through to env vars when DB value empty
  if (!value) {
    const envKey = ENV_KEY_MAP[key.toLowerCase()];
    if (envKey) value = process.env[envKey] ?? '';
    // llm_api_key: also check provider-specific env var
    if (!value && key === 'llm_api_key') {
      const provider = (process.env.DEFAULT_LLM_PROVIDER ?? 'openai').toLowerCase();
      const envName = PROVIDER_ENV_MAP[provider];
      if (envName) value = process.env[envName] ?? '';
    }
  }
  return value || defaultValue;
}

export async function setSetting(key: string, value: string, ownerId?: string): Promise<void> {
  const db = getDb();
  // Encrypt secret values before storing
  let storedValue = value;
  if (isSecretKey(key) && value) {
    try {
      storedValue = encrypt(value);
    } catch (err) {
      // KEY_ENCRYPTION_SECRET not set — store raw value but warn loudly
      console.error('[settings.setSetting] encryption failed, storing raw value. Set KEY_ENCRYPTION_SECRET env var.', (err as Error).message);
      storedValue = value;
    }
  }
  await db.prepare(`
    INSERT INTO settings (key, value, owner_id, updated_at) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key, owner_id) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(key, storedValue, ownerId || '');
}

export async function getAllSettings(ownerId?: string): Promise<Record<string, string>> {
  const db = getDb();
  const ownerParam = ownerId || '';
  const query = 'SELECT key, value FROM settings WHERE owner_id = ?';
  const rows = await db.prepare(query).all(ownerParam) as Array<{ key: string; value: string }>;
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
  return result;
}
