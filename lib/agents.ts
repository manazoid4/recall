import { demoTasteNodes } from './mockData';
import type {
  AgentPrompt,
  AgentPromptType,
  CaptureInput,
  InstagramInboxMessage,
  InstagramInboxProvision,
  InstagramInboxMode,
  IntentNode,
  MemoryItem,
  DailyBrief,
  PaidPlanMoat,
  ProfileInsight,
  Project,
  SignalScore,
  TasteNode,
  UserProfile,
} from './types';

const DEMO_USER_ID = 'demo_user';

function unique<T>(items: T[]): T[] {
  return [...new Set(items.filter(Boolean))];
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function nowIso() {
  return new Date().toISOString();
}

function scoreFromSignals(count: number, base = 58) {
  return Math.min(96, base + count * 8);
}

function signalGrade(score: number) {
  if (score >= 80) return 'GOLD';
  if (score >= 50) return 'SILVER';
  return 'BRONZE';
}

function routingCodeFor(userId: string, userDisplayName: string) {
  const readable = userDisplayName.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase() || 'USER';
  const checksum = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0).toString(36).toUpperCase();
  return `RCL-${readable}-${checksum}`;
}

function firstUrl(text: string) {
  return text.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.]+$/, '');
}

function removeRoutingAndUrl(text: string, routingCode?: string, url?: string) {
  return text
    .replace(routingCode || '', '')
    .replace(url || '', '')
    .trim();
}

export function normalizeInput(input: CaptureInput): MemoryItem {
  const timestamp = nowIso();
  return {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: DEMO_USER_ID,
    type: input.type,
    platform: input.platform,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    title: input.title.trim() || 'Untitled memory',
    creator: input.creator?.trim() || undefined,
    rawContent: input.rawContent?.trim() || '',
    transcript: input.transcript?.trim() || '',
    extractedText: input.extractedText?.trim() || '',
    summary: '',
    reasonSaved: input.reasonSaved?.trim() || '',
    userNote: input.userNote?.trim() || '',
    tags: ['demo-capture'],
    topics: [],
    values: [],
    emotions: [],
    aesthetics: [],
    people: [],
    tools: [],
    projects: [],
    traitsSuggested: [],
    importanceScore: 50,
    profileImpactScore: 50,
    confidence: 0.45,
    status: 'new',
    sensitive: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createInstagramInboxProvision({
  userId,
  recallHandle,
  userDisplayName,
  mode = 'shared_recall_inbox',
}: {
  userId: string;
  recallHandle: string;
  userDisplayName: string;
  mode?: InstagramInboxMode;
}): InstagramInboxProvision {
  const routingCode = routingCodeFor(userId, userDisplayName);
  return {
    id: `ig_inbox_${userId}`,
    userId,
    mode,
    instagramHandle: recallHandle,
    routingCode,
    displayName: `${userDisplayName}'s Recall Inbox`,
    status: mode === 'shared_recall_inbox' ? 'ready' : 'needs_connection',
    setupSteps: [
      `Follow @${recallHandle}`,
      `Send any post, reel, link, screenshot, voice note, or thought to @${recallHandle}`,
      `Include ${routingCode} once so Recall can route the thread to your account`,
      'Reply with a short reason saved when Recall asks for context',
    ],
    complianceNotes: [
      'Uses Instagram Messaging API style webhooks for authorised professional inboxes.',
      'No personal-account bot creation, impersonation, password collection, or scraping.',
      'Shared inbox mode gives each user a private routing code instead of pretending every user owns a bot.',
      'Connected account mode is reserved for users who explicitly connect an eligible Instagram professional account.',
    ],
    createdAt: nowIso(),
  };
}

export function normalizeInstagramInboxMessage(message: InstagramInboxMessage): CaptureInput {
  const url = firstUrl(message.messageText) || message.attachments.find((attachment) => attachment.url)?.url;
  const routingCode = message.messageText.match(/RCL-[A-Z0-9]+-[A-Z0-9]+/i)?.[0];
  const userNote = removeRoutingAndUrl(message.messageText, routingCode, url);
  const attachment = message.attachments[0];
  return {
    type: attachment?.type === 'audio' ? 'audio' : attachment?.type === 'image' ? 'screenshot' : 'social',
    platform: 'instagram',
    sourceUrl: url,
    title: attachment?.title || url || 'Instagram inbox capture',
    creator: `instagram:${message.instagramSenderId}`,
    rawContent: message.messageText,
    reasonSaved: 'The user sent this to their Recall Instagram inbox, which is a high-intent save signal.',
    userNote,
  };
}

export function runTranscriptAgent(item: MemoryItem): MemoryItem {
  if (!['video', 'audio', 'voice'].includes(item.type) || item.transcript) return item;
  return {
    ...item,
    transcript: 'Transcript placeholder: connect YouTube, podcast, lecture, voice-note, or audio transcription here.',
  };
}

export function runVisionAgent(item: MemoryItem): MemoryItem {
  if (!['image', 'screenshot'].includes(item.type) || item.extractedText) return item;
  return {
    ...item,
    extractedText: 'Vision placeholder: OCR, frame analysis, visual style, people, tools, and scene labels will attach here.',
  };
}

export function runMeaningAgent(item: MemoryItem): MemoryItem {
  const text = [item.title, item.rawContent, item.transcript, item.extractedText, item.reasonSaved, item.userNote].join(' ');
  const topics = [
    includesAny(text, ['agent', 'ai assistant', 'mcp']) && 'AI agents',
    includesAny(text, ['memory', 'recall', 'profile', 'graph']) && 'personal memory',
    includesAny(text, ['discipline', 'habit', 'sincerity', 'intention']) && 'discipline',
    includesAny(text, ['community', 'service', 'trust']) && 'community',
    includesAny(text, ['dashboard', 'ui', 'interface', 'design']) && 'interface design',
    includesAny(text, ['obsidian', 'knowledge', 'notes', 'pkm']) && 'knowledge management',
    includesAny(text, ['local', 'private', 'privacy', 'encrypted']) && 'private AI',
  ].filter(Boolean) as string[];
  const values = [
    includesAny(text, ['private', 'privacy', 'owned', 'local']) && 'Privacy',
    includesAny(text, ['autonomy', 'independent', 'ownership']) && 'Autonomy',
    includesAny(text, ['sincerity', 'intention', 'ethical']) && 'Sincerity',
    includesAny(text, ['service', 'community', 'benefit']) && 'Service',
    includesAny(text, ['clarity', 'calm', 'direct']) && 'Clarity',
  ].filter(Boolean) as string[];
  const aesthetics = [
    includesAny(text, ['dashboard', 'interface', 'ui']) && 'calm interface',
    includesAny(text, ['dark', 'glass', 'quiet']) && 'quiet futuristic',
    includesAny(text, ['dense', 'precise', 'thin']) && 'dense high-signal layout',
  ].filter(Boolean) as string[];
  const projects = [
    includesAny(text, ['recall', 'memory graph', 'agent brain']) && 'Recall',
    includesAny(text, ['mazos', 'personal os']) && 'MazOS',
    includesAny(text, ['jobfilter', 'lead']) && 'JobFilter',
    includesAny(text, ['zawiyah', 'community']) && 'Zawiyah/community',
    includesAny(text, ['discipline', 'habit']) && 'health/discipline',
    includesAny(text, ['obsidian']) && 'Obsidian',
  ].filter(Boolean) as string[];
  const tools = [
    includesAny(text, ['mcp']) && 'MCP',
    includesAny(text, ['obsidian']) && 'Obsidian',
    includesAny(text, ['github']) && 'GitHub',
    includesAny(text, ['embedding', 'vector']) && 'embeddings',
    includesAny(text, ['agent']) && 'AI agents',
  ].filter(Boolean) as string[];
  const traitsSuggested = [
    includesAny(text, ['system', 'os', 'workflow', 'graph']) && 'system builder',
    includesAny(text, ['direct', 'action', 'practical']) && 'action-oriented',
    includesAny(text, ['sincerity', 'ethical', 'service']) && 'values-led',
    includesAny(text, ['design', 'taste', 'interface']) && 'taste-driven builder',
  ].filter(Boolean) as string[];
  const signalCount = topics.length + values.length + projects.length + tools.length + traitsSuggested.length;

  return {
    ...item,
    summary: item.summary || `${item.title}: ${item.reasonSaved || item.rawContent || item.transcript || item.extractedText || 'Captured for future context.'}`,
    tags: unique([...item.tags, ...topics.map((topic) => topic.toLowerCase().replaceAll(' ', '-'))]),
    topics: unique([...item.topics, ...topics]),
    values: unique([...item.values, ...values]),
    emotions: unique([...item.emotions, signalCount > 4 ? 'momentum' : 'curiosity']),
    aesthetics: unique([...item.aesthetics, ...aesthetics]),
    tools: unique([...item.tools, ...tools]),
    projects: unique([...item.projects, ...projects, projects.length === 0 && 'Recall'].filter(Boolean) as string[]),
    traitsSuggested: unique([...item.traitsSuggested, ...traitsSuggested]),
    importanceScore: scoreFromSignals(signalCount, 52),
    profileImpactScore: scoreFromSignals(signalCount, 48),
    confidence: Math.min(0.92, 0.5 + signalCount * 0.04),
    status: 'processed',
    updatedAt: nowIso(),
  };
}

export function runPrivacyAgent(item: MemoryItem): MemoryItem {
  const text = [item.title, item.rawContent, item.transcript, item.extractedText, item.reasonSaved, item.userNote].join(' ');
  const sensitive = item.sensitive || includesAny(text, ['spiritual', 'sincerity', 'private', 'personal', 'habit', 'health']);
  return {
    ...item,
    sensitive,
    tags: sensitive ? unique([...item.tags, 'sensitive-review']) : item.tags,
  };
}

export function processMemoryItem(item: MemoryItem): MemoryItem {
  return runPrivacyAgent(runMeaningAgent(runVisionAgent(runTranscriptAgent({ ...item, status: 'processing' }))));
}

export function scoreMemorySignal(item: MemoryItem): SignalScore {
  const reasons: string[] = [];
  let score = 35;

  if (item.reasonSaved || item.userNote) {
    score += 18;
    reasons.push('User supplied intent');
  }

  if (item.sourceUrl || item.transcript || item.extractedText || item.rawContent) {
    score += 14;
    reasons.push('Evidence attached');
  }

  if (item.projects.length > 0) {
    score += 12;
    reasons.push('Linked to a project');
  }

  if (item.profileImpactScore >= 80) {
    score += 12;
    reasons.push('High profile impact');
  } else if (item.profileImpactScore >= 60) {
    score += 6;
    reasons.push('Medium profile impact');
  }

  if (item.values.length + item.topics.length >= 5) {
    score += 8;
    reasons.push('Rich meaning signals');
  }

  if (item.platform === 'instagram' && item.tags.includes('instagram-inbox')) {
    score += 10;
    reasons.push('High-friction social save avoided');
  }

  if (item.sensitive) {
    score -= 6;
    reasons.push('Sensitive review needed');
  }

  if (item.status === 'needs_context') {
    score -= 12;
    reasons.push('Needs one more context reply');
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const grade = signalGrade(finalScore);

  return {
    memoryId: item.id,
    score: finalScore,
    grade,
    reasons: reasons.slice(0, 5),
    recommendedAction:
      grade === 'GOLD'
        ? `Act today: turn "${item.title}" into a project task or agent prompt.`
        : grade === 'SILVER'
          ? `Keep warm: ask one follow-up question about why "${item.title}" matters.`
          : `Archive or batch later unless this repeats across more inputs.`,
    paidValue:
      grade === 'GOLD'
        ? 'Included in paid daily brief and agent context packs.'
        : grade === 'SILVER'
          ? 'Tracked for pattern detection and weekly review.'
          : 'Kept searchable without polluting the active profile.',
  };
}

export function createDailyBrief(items: MemoryItem[], profile: UserProfile): DailyBrief {
  const scored = items.map(scoreMemorySignal).sort((a, b) => b.score - a.score);
  const goldSignals = scored.filter((signal) => signal.grade === 'GOLD');
  const silverSignals = scored.filter((signal) => signal.grade === 'SILVER');
  const bronzeSignals = scored.filter((signal) => signal.grade === 'BRONZE');
  const topItems = goldSignals
    .map((signal) => items.find((item) => item.id === signal.memoryId))
    .filter(Boolean) as MemoryItem[];

  return {
    id: `brief_${Date.now()}`,
    userId: profile.userId,
    title: 'Today in your personal AI signal',
    summary: `${goldSignals.length} GOLD signals are ready for action, ${silverSignals.length} should be watched, and ${bronzeSignals.length} can stay in the archive.`,
    goldSignals,
    silverSignals,
    bronzeSignals,
    nextActions: topItems.slice(0, 3).map((item) => `Use "${item.title}" to move ${item.projects[0] || 'your main project'} forward.`),
    agentPacks: ['personal_assistant', 'coding_agent', 'reflection_agent', 'mcp_context'],
    createdAt: nowIso(),
  };
}

export function getPaidPlanMoats(): PaidPlanMoat[] {
  return [
    {
      name: 'DM capture habit',
      customerPromise: 'Send anything to Recall like messaging a person.',
      paidReason: 'Unlimited Instagram inbox captures, voice notes, screenshots, and follow-up context prompts.',
      moat: 'Owning the capture reflex makes Recall harder to replace than a passive notes app.',
    },
    {
      name: 'Signal scoring',
      customerPromise: 'Know which saves deserve action today.',
      paidReason: 'GOLD/SILVER/BRONZE filtering, evidence reasons, and daily brief delivery.',
      moat: 'The scoring model compounds on personal evidence, not generic internet content.',
    },
    {
      name: 'Agent context packs',
      customerPromise: 'Make every AI assistant start with your real context.',
      paidReason: 'Exportable prompts for Codex, OpenCode, Obsidian, personal assistants, and future MCP clients.',
      moat: 'The more a user works through Recall, the more valuable their private context graph becomes.',
    },
  ];
}

export function updateProfileFromMemory(profile: UserProfile, item: MemoryItem): UserProfile {
  return {
    ...profile,
    interests: unique([...profile.interests, ...item.topics]),
    values: unique([...profile.values, ...item.values]),
    traits: unique([...profile.traits, ...item.traitsSuggested]),
    aestheticTaste: unique([...profile.aestheticTaste, ...item.aesthetics]),
    recurringThemes: unique([...profile.recurringThemes, ...item.topics, ...item.projects]),
    projectObsessions: unique([...profile.projectObsessions, ...item.projects]),
    evidenceMemoryIds: unique([...profile.evidenceMemoryIds, item.id]),
    confidence: Math.min(0.95, profile.confidence + 0.01),
    version: profile.version + 1,
    updatedAt: nowIso(),
  };
}

export function updateTasteGraph(items: MemoryItem[]): TasteNode[] {
  const generated = items.flatMap((item) =>
    item.aesthetics.map((label, index) => ({
      id: `taste_${item.id}_${index}`,
      userId: item.userId,
      category: item.type === 'screenshot' || item.type === 'image' ? 'visual taste' : 'content taste',
      label,
      description: `Preference inferred from "${item.title}" and kept traceable to source evidence.`,
      evidenceMemoryIds: [item.id],
      strength: item.profileImpactScore,
      confidence: item.confidence,
    })),
  );
  return generated.length ? generated : demoTasteNodes;
}

export function inferIntent(item: MemoryItem): IntentNode {
  const relatedProject = item.projects[0] || 'Recall';
  return {
    id: `intent_${item.id}`,
    userId: item.userId,
    inferredIntent: item.projects.includes('Recall')
      ? 'Build a private agent brain from personal evidence'
      : `Use this input to move ${relatedProject} forward`,
    relatedGoal: item.values.includes('Privacy') ? 'Keep personal context owned and controlled' : 'Turn saved context into action',
    relatedProject,
    relatedMemoryIds: [item.id],
    suggestedAction: `Create one next action or agent prompt from "${item.title}".`,
    confidence: item.confidence,
  };
}

export function findPatterns(items: MemoryItem[]): ProfileInsight[] {
  const topicCounts = new Map<string, string[]>();
  for (const item of items) {
    for (const topic of item.topics) {
      topicCounts.set(topic, [...(topicCounts.get(topic) || []), item.id]);
    }
  }
  return [...topicCounts.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([topic, ids], index) => ({
      id: `pattern_${index}_${topic.toLowerCase().replaceAll(' ', '_')}`,
      userId: DEMO_USER_ID,
      type: 'pattern',
      title: `You keep saving ${topic}`,
      description: `${topic} appears across ${ids.length} memory items, which means it likely deserves a project, prompt, or decision.`,
      evidenceMemoryIds: ids,
      confidence: Math.min(0.9, 0.58 + ids.length * 0.08),
      suggestedAction: `Ask Recall what ${topic} is trying to become in your work.`,
      createdAt: nowIso(),
    }));
}

export function findContradictions(items: MemoryItem[]): ProfileInsight[] {
  const hasPrivacy = items.some((item) => item.values.includes('Privacy'));
  const hasSocial = items.some((item) => ['instagram', 'tiktok', 'x', 'reddit'].includes(item.platform));
  if (!hasPrivacy || !hasSocial) return [];
  return [
    {
      id: 'contradiction_privacy_social',
      userId: DEMO_USER_ID,
      type: 'contradiction',
      title: 'Privacy and social capture need boundaries',
      description: 'Your inputs want rich social context and strong privacy, so Recall should use user-provided links, exports, and consent-based connectors only.',
      evidenceMemoryIds: items.filter((item) => item.values.includes('Privacy') || ['instagram', 'tiktok', 'x', 'reddit'].includes(item.platform)).map((item) => item.id),
      confidence: 0.84,
      suggestedAction: 'Keep the import UI explicit about authorised data and exclusions from profile.',
      createdAt: nowIso(),
    },
  ];
}

export function linkProjects(items: MemoryItem[]): Project[] {
  const projectNames = unique(items.flatMap((item) => item.projects));
  return projectNames.map((name) => {
    const related = items.filter((item) => item.projects.includes(name));
    return {
      id: `project_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      userId: DEMO_USER_ID,
      name,
      description: `${name} is connected to ${related.length} memory item${related.length === 1 ? '' : 's'}.`,
      relatedMemoryIds: related.map((item) => item.id),
      themes: unique(related.flatMap((item) => item.topics)).slice(0, 5),
      nextActions: [`Turn the strongest ${name} signal into a concrete task.`, `Generate an agent prompt for ${name}.`],
      agentPrompts: [`${name} project agent context`],
      status: name === 'Recall' ? 'active' : 'watching',
    };
  });
}

export function createAgentPrompt(type: AgentPromptType, profile: UserProfile, memories: MemoryItem[]): AgentPrompt {
  const evidence = memories.map((item) => item.id);
  const projectFocus = unique(memories.flatMap((item) => item.projects)).slice(0, 4).join(', ') || 'current projects';
  return {
    id: `prompt_${type}_${Date.now()}`,
    userId: profile.userId,
    type,
    title: `${type.replaceAll('_', ' ')} context pack`,
    basedOnProfileVersion: profile.version,
    evidenceMemoryIds: evidence,
    createdAt: nowIso(),
    prompt:
      `Use evidence from Recall memory before acting. Profile summary: ${profile.summary} ` +
      `Current direction: ${profile.currentDirection} ` +
      `Strong values: ${profile.values.slice(0, 6).join(', ')}. ` +
      `Communication style: ${profile.communicationStyle.join(', ')}. ` +
      `Project focus: ${projectFocus}. Treat insights as suggestions, keep sensitive context private by default, and produce direct next actions.`,
  };
}

export function createReflectionSummary(profile: UserProfile, items: MemoryItem[]) {
  return {
    title: 'Weekly memory mirror',
    summary: `This week points toward ${profile.currentDirection}`,
    returningTo: unique(items.flatMap((item) => item.topics)).slice(0, 6),
    suggestedQuestions: [
      'What am I saving repeatedly but not acting on?',
      'Which input deserves a project next action?',
      'What should stay private or excluded from agent context?',
    ],
  };
}
