export interface SavedItem {
  id: string;
  sourceId: string | null;
  url: string;
  title: string | null;
  author: string | null;
  savedAt: string | null;
  platform: string | null;
  rawData: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Enrichment {
  id: string;
  itemId: string;
  summary: string | null;
  tags: string[];
  sentiment: string | null;
  topics: string[];
  entities: string[];
  qualityScore: number;
  provider: string | null;
  model: string | null;
  createdAt: string;
}

export interface Embedding {
  id: string;
  itemId: string;
  vector: number[] | null;
  dimension: number | null;
  provider: string | null;
  createdAt: string;
}

export interface Source {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ownerId: string | null;
  isPublic: boolean;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardItem {
  boardId: string;
  itemId: string;
  position: number;
  addedAt: string;
}

export interface GraphEdge {
  id: string;
  sourceItemId: string;
  targetItemId: string;
  relation: string;
  weight: number;
  createdAt: string;
}

export interface EnrichedSavedItem extends SavedItem {
  enrichment: Enrichment | null;
  embedding: Embedding | null;
}

export interface LibraryItem extends SavedItem {
  enrichment: Enrichment | null;
  boards: string[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  models: string[];
  requiresKey: boolean;
  isLocal: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export const SOURCE_TYPES = [
  'youtube',
  'reddit',
  'twitter',
  'pocket',
  'instapaper',
  'raindrop',
  'notion',
  'chrome-bookmarks',
  'obsidian',
  'github',
  'manual-upload',
] as const;

export const PROVIDERS: ProviderConfig[] = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'text-embedding-3-large', 'text-embedding-3-small'], requiresKey: true, isLocal: false },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250414', 'claude-haiku-3.5'], requiresKey: true, isLocal: false },
  { id: 'google', name: 'Google', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'text-embedding-004'], requiresKey: true, isLocal: false },
  { id: 'groq', name: 'Groq', models: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'], requiresKey: true, isLocal: false },
  { id: 'together', name: 'Together AI', models: ['Meta-Llama-3.1-70B', 'Mixtral-8x7B'], requiresKey: true, isLocal: false },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'], requiresKey: true, isLocal: false },
  { id: 'mistral', name: 'Mistral', models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'], requiresKey: true, isLocal: false },
  { id: 'cohere', name: 'Cohere', models: ['command-r-plus', 'command-r', 'embed-english-v3'], requiresKey: true, isLocal: false },
  { id: 'openrouter', name: 'OpenRouter', models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4', 'google/gemini-2.0-flash'], requiresKey: true, isLocal: false },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.1', 'mistral', 'phi3', 'nomic-embed-text'], requiresKey: false, isLocal: true },
];
