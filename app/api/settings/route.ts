import { getAllSettings, setSetting } from '@/lib/settings';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Secret keys that should never be returned to the client
const SECRET_KEYS = new Set([
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

// Allowlist of keys that can be set via POST
const ALLOWED_KEYS = new Set([
  'theme',
  'language',
  'timezone',
  'notifications_enabled',
  'emailNotifications',
  'browserNotifications',
  'sync_enabled',
  'sync_interval',
  'sync_sources',
  'ollama_url',
  'ollama_model',
  'ollama_api_key',
  'llm_provider',
  'llm_model',
  'llm_api_key',
  'default_provider',
  'default_model',
  'temperature',
  'max_tokens',
  'default_temperature',
  'default_max_tokens',
  'memory_enabled',
  'memory_retention_days',
  'knowledge_base_enabled',
  'auto_tagging',
  'content_preview_length',
  'sidebarCollapsed',
  'lastSyncAt',
  'user_name',
  'user_email',
  'avatar_url',
  'linked_sources',
  'daily_sync_time',
]);

function isSecretKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    SECRET_KEYS.has(key) ||
    SECRET_KEYS.has(lowerKey) ||
    lowerKey.includes('api_key') ||
    lowerKey.includes('secret') ||
    lowerKey.includes('password') ||
    lowerKey.includes('token') ||
    lowerKey.endsWith('_key')
  );
}

export async function GET() {
  const { userId } = await auth();
  const data = await getAllSettings(userId || undefined);
  // Filter out secret keys before returning
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!isSecretKey(key)) {
      filtered[key] = value;
    }
  }
  return NextResponse.json({ data: filtered });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const body = await request.json();
  for (const [key, value] of Object.entries(body)) {
    // Allow allowlisted keys — secrets are encrypted at rest by setSetting
    if (ALLOWED_KEYS.has(key)) {
      await setSetting(key, String(value), userId || undefined);
    }
  }
  return NextResponse.json({ success: true });
}
