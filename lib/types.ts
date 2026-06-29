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
