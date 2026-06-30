import { describe, expect, it } from 'vitest';
import {
  createAgentPrompt,
  inferIntent,
  normalizeInput,
  processMemoryItem,
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
});
