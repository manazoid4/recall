import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAgentPrompt,
  inferIntent,
  normalizeInput,
  processMemoryItem,
  updateProfileFromMemory,
  updateTasteGraph,
} from '../lib/agents';
import { demoProfile } from '../lib/mockData';

test('normalizes a user-provided capture into a memory item', () => {
  const item = normalizeInput({
    sourceUrl: 'https://www.youtube.com/watch?v=abc123',
    title: 'Lecture on discipline',
    reasonSaved: 'This connects spiritual discipline to building better systems.',
    userNote: 'Use this for my agent brain.',
    type: 'video',
    platform: 'youtube',
  });

  assert.equal(item.type, 'video');
  assert.equal(item.platform, 'youtube');
  assert.equal(item.status, 'new');
  assert.equal(item.sensitive, false);
  assert.ok(item.id.startsWith('mem_'));
});

test('processing adds meaning, privacy, and profile signals', () => {
  const item = processMemoryItem(normalizeInput({
    title: 'Local AI agent operating system',
    rawContent: 'A practical agent OS for private memory, autonomy, discipline, and projects.',
    reasonSaved: 'I want this for MazOS and Recall.',
    type: 'note',
    platform: 'manual',
  }));

  assert.equal(item.status, 'processed');
  assert.ok(item.summary.includes('Local AI agent operating system'));
  assert.ok(item.topics.includes('AI agents'));
  assert.ok(item.values.includes('Autonomy'));
  assert.ok(item.projects.includes('Recall'));
  assert.ok(item.traitsSuggested.includes('system builder'));
});

test('profile, taste, intent, and prompts are evidence based', () => {
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

  assert.ok(profile.evidenceMemoryIds.includes(item.id));
  assert.ok(taste.some((node) => node.evidenceMemoryIds.includes(item.id)));
  assert.equal(intent.relatedProject, 'Recall');
  assert.ok(prompt.prompt.includes('Use evidence from Recall memory'));
  assert.ok(prompt.evidenceMemoryIds.includes(item.id));
});
