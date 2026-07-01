import { describe, expect, it } from 'vitest';
import {
  createAgentPrompt,
  createDailyBrief,
  createInstagramInboxProvision,
  inferIntent,
  normalizeInstagramInboxMessage,
  normalizeInput,
  processMemoryItem,
  scoreMemorySignal,
  updateProfileFromMemory,
  updateTasteGraph,
} from '../../lib/agents';
import { demoProfile } from '../../lib/mockData';

describe('Recall personal intelligence agents', () => {
  it('normalizes a user-provided capture into a memory item', () => {
    const item = normalizeInput({
      sourceUrl: 'https://www.youtube.com/watch?v=abc123',
      title: 'Lecture on discipline',
      reasonSaved: 'This connects spiritual discipline to building better systems.',
      userNote: 'Use this for my agent brain.',
      type: 'video',
      platform: 'youtube',
    });

    expect(item.type).toBe('video');
    expect(item.platform).toBe('youtube');
    expect(item.status).toBe('new');
    expect(item.sensitive).toBe(false);
    expect(item.id).toMatch(/^mem_/);
  });

  it('processing adds meaning, privacy, and profile signals', () => {
    const item = processMemoryItem(normalizeInput({
      title: 'Local AI agent operating system',
      rawContent: 'A practical agent OS for private memory, autonomy, discipline, and projects.',
      reasonSaved: 'I want this for MazOS and Recall.',
      type: 'note',
      platform: 'manual',
    }));

    expect(item.status).toBe('processed');
    expect(item.summary).toContain('Local AI agent operating system');
    expect(item.topics).toContain('AI agents');
    expect(item.values).toContain('Autonomy');
    expect(item.projects).toContain('Recall');
    expect(item.traitsSuggested).toContain('system builder');
  });

  it('profile, taste, intent, and prompts are evidence based', () => {
    const item = processMemoryItem(normalizeInput({
      title: 'Beautiful calm dashboard UI',
      extractedText: 'Sparse interface, dark glass, precise controls, direct action, memory graph.',
      reasonSaved: 'This is the taste I want for Recall.',
      type: 'screenshot',
      platform: 'manual',
    }));

    const profile = updateProfileFromMemory(demoProfile, item);
    const taste = updateTasteGraph([item]);
    const intent = inferIntent(item);
    const prompt = createAgentPrompt('coding_agent', profile, [item]);

    expect(profile.evidenceMemoryIds).toContain(item.id);
    expect(taste.some((node) => node.evidenceMemoryIds.includes(item.id))).toBe(true);
    expect(intent.relatedProject).toBe('Recall');
    expect(prompt.prompt).toContain('Use evidence from Recall memory');
    expect(prompt.evidenceMemoryIds).toContain(item.id);
  });

  it('provisions an Instagram inbox identity without impersonating the user', () => {
    const inbox = createInstagramInboxProvision({
      userId: 'user_123',
      recallHandle: 'recall.inbox',
      userDisplayName: 'Manaz',
    });

    expect(inbox.routingCode).toMatch(/^RCL-/);
    expect(inbox.instagramHandle).toBe('recall.inbox');
    expect(inbox.mode).toBe('shared_recall_inbox');
    expect(inbox.complianceNotes.join(' ')).toContain('No personal-account bot');
  });

  it('turns an Instagram DM into a Recall memory capture', () => {
    const capture = normalizeInstagramInboxMessage({
      userId: 'user_123',
      instagramSenderId: 'ig_sender_1',
      messageText: 'RCL-MANAZ-9Q2 https://instagram.com/reel/demo This is the AI taste I want.',
      attachments: [],
      receivedAt: '2026-06-30T10:00:00.000Z',
    });

    expect(capture.type).toBe('social');
    expect(capture.platform).toBe('instagram');
    expect(capture.sourceUrl).toBe('https://instagram.com/reel/demo');
    expect(capture.reasonSaved).toContain('sent this to their Recall Instagram inbox');
    expect(capture.userNote).toContain('This is the AI taste I want.');
  });

  it('scores high-intent memories as GOLD signals with a next action', () => {
    const item = processMemoryItem(normalizeInput({
      title: 'Recall agent memory launch plan',
      sourceUrl: 'https://example.com/agent-memory',
      rawContent: 'Private AI agent memory graph with project context, MCP, prompts, and daily action.',
      reasonSaved: 'This directly shapes the paid Recall product.',
      userNote: 'Turn this into the Signal OS launch wedge.',
      type: 'url',
      platform: 'web',
    }));

    const signal = scoreMemorySignal(item);

    expect(signal.grade).toBe('GOLD');
    expect(signal.reasons).toContain('User supplied intent');
    expect(signal.recommendedAction).toContain('Act today');
    expect(signal.paidValue).toContain('paid daily brief');
  });

  it('creates a daily brief from scored memory signals', () => {
    const item = processMemoryItem(normalizeInput({
      title: 'Codex context pack idea',
      rawContent: 'Use Recall evidence to make coding agents understand product direction.',
      reasonSaved: 'This is worth paying for because agents stop starting cold.',
      type: 'note',
      platform: 'manual',
    }));

    const brief = createDailyBrief([item], demoProfile);

    expect(brief.title).toContain('personal AI signal');
    expect(brief.goldSignals.length).toBeGreaterThan(0);
    expect(brief.agentPacks).toContain('coding_agent');
    expect(brief.nextActions[0]).toContain(item.title);
  });
});
