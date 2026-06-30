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

export type MemoryType =
  | 'url'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'image'
  | 'screenshot'
  | 'voice'
  | 'note'
  | 'social'
  | 'github'
  | 'obsidian'
  | 'json'
  | 'wearable_placeholder';

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'reddit'
  | 'github'
  | 'obsidian'
  | 'web'
  | 'manual'
  | 'other';

export type MemoryStatus =
  | 'new'
  | 'processing'
  | 'processed'
  | 'needs_context'
  | 'added_to_profile'
  | 'excluded'
  | 'archived';

export type InsightType =
  | 'trait'
  | 'value'
  | 'pattern'
  | 'contradiction'
  | 'project'
  | 'taste'
  | 'warning'
  | 'opportunity'
  | 'agent_context';

export type ProjectStatus = 'active' | 'watching' | 'paused' | 'future';

export type SignalGrade = 'GOLD' | 'SILVER' | 'BRONZE';

export type AgentPromptType =
  | 'personal_assistant'
  | 'coding_agent'
  | 'obsidian_assistant'
  | 'content_agent'
  | 'life_admin_agent'
  | 'project_manager'
  | 'reflection_agent'
  | 'research_agent'
  | 'hermes'
  | 'codex'
  | 'opencode'
  | 'mcp_context';

export interface MemoryItem {
  id: string;
  userId: string;
  type: MemoryType;
  platform: Platform;
  sourceUrl?: string;
  title: string;
  creator?: string;
  rawContent?: string;
  transcript?: string;
  extractedText?: string;
  summary: string;
  reasonSaved?: string;
  userNote?: string;
  tags: string[];
  topics: string[];
  values: string[];
  emotions: string[];
  aesthetics: string[];
  people: string[];
  tools: string[];
  projects: string[];
  traitsSuggested: string[];
  importanceScore: number;
  profileImpactScore: number;
  confidence: number;
  status: MemoryStatus;
  sensitive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  summary: string;
  currentDirection: string;
  interests: string[];
  values: string[];
  beliefs: string[];
  worldview: string[];
  traits: string[];
  communicationStyle: string[];
  humourStyle: string[];
  aestheticTaste: string[];
  contentTaste: string[];
  learningStyle: string[];
  decisionMakingStyle: string[];
  productivityStyle: string[];
  spiritualEthicalOrientation: string[];
  goals: string[];
  frictions: string[];
  habits: string[];
  emotionalPatterns: string[];
  contradictions: string[];
  recurringThemes: string[];
  projectObsessions: string[];
  influences: string[];
  blindSpots: string[];
  confidence: number;
  evidenceMemoryIds: string[];
  version: number;
  updatedAt: string;
}

export interface ProfileInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  evidenceMemoryIds: string[];
  confidence: number;
  suggestedAction: string;
  createdAt: string;
}

export interface TasteNode {
  id: string;
  userId: string;
  category: string;
  label: string;
  description: string;
  evidenceMemoryIds: string[];
  strength: number;
  confidence: number;
}

export interface IntentNode {
  id: string;
  userId: string;
  inferredIntent: string;
  relatedGoal: string;
  relatedProject: string;
  relatedMemoryIds: string[];
  suggestedAction: string;
  confidence: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  relatedMemoryIds: string[];
  themes: string[];
  nextActions: string[];
  agentPrompts: string[];
  status: ProjectStatus;
}

export interface AgentPrompt {
  id: string;
  userId: string;
  type: AgentPromptType;
  title: string;
  prompt: string;
  basedOnProfileVersion: number;
  evidenceMemoryIds: string[];
  createdAt: string;
}

export interface AgentRun {
  id: string;
  userId: string;
  agentType: string;
  inputMemoryIds: string[];
  output: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

export interface CaptureInput {
  sourceUrl?: string;
  title: string;
  creator?: string;
  rawContent?: string;
  transcript?: string;
  extractedText?: string;
  reasonSaved?: string;
  userNote?: string;
  type: MemoryType;
  platform: Platform;
}

export interface SignalScore {
  memoryId: string;
  score: number;
  grade: SignalGrade;
  reasons: string[];
  recommendedAction: string;
  paidValue: string;
}

export interface DailyBrief {
  id: string;
  userId: string;
  title: string;
  summary: string;
  goldSignals: SignalScore[];
  silverSignals: SignalScore[];
  bronzeSignals: SignalScore[];
  nextActions: string[];
  agentPacks: AgentPromptType[];
  createdAt: string;
}

export interface PaidPlanMoat {
  name: string;
  customerPromise: string;
  paidReason: string;
  moat: string;
}

export type InstagramInboxMode =
  | 'shared_recall_inbox'
  | 'connected_creator_account'
  | 'future_dedicated_inbox';

export interface InstagramInboxProvision {
  id: string;
  userId: string;
  mode: InstagramInboxMode;
  instagramHandle: string;
  routingCode: string;
  displayName: string;
  status: 'ready' | 'needs_connection' | 'pending_meta_review';
  setupSteps: string[];
  complianceNotes: string[];
  createdAt: string;
}

export interface InstagramInboxMessage {
  userId: string;
  instagramSenderId: string;
  messageText: string;
  attachments: Array<{
    type: 'image' | 'video' | 'audio' | 'file' | 'story_mention' | 'unknown';
    url?: string;
    title?: string;
  }>;
  receivedAt: string;
}
