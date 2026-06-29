'use client';

import { useMemo, useState } from 'react';
import {
  createAgentPrompt,
  inferIntent,
  normalizeInput,
  processMemoryItem,
  updateProfileFromMemory,
  updateTasteGraph,
} from '../../lib/agents';
import { demoProfile } from '../../lib/mockData';
import type { MemoryItem, MemoryType, Platform } from '../../lib/types';
import { EvidenceList, PillList } from './RecallShell';

const types: MemoryType[] = ['url', 'video', 'audio', 'pdf', 'image', 'screenshot', 'voice', 'note', 'social', 'github', 'obsidian', 'json', 'wearable_placeholder'];
const platforms: Platform[] = ['instagram', 'tiktok', 'youtube', 'x', 'reddit', 'github', 'obsidian', 'web', 'manual', 'other'];

export function CaptureConsole() {
  const [type, setType] = useState<MemoryType>('note');
  const [platform, setPlatform] = useState<Platform>('manual');
  const [title, setTitle] = useState('Manual thought about Recall as an agent brain');
  const [sourceUrl, setSourceUrl] = useState('');
  const [reasonSaved, setReasonSaved] = useState('This should become structured context for future coding agents.');
  const [rawContent, setRawContent] = useState('Recall should turn saved posts, notes, lectures, screenshots, and project ideas into a living profile and memory graph.');
  const [memory, setMemory] = useState<MemoryItem | null>(null);

  const preview = useMemo(() => {
    if (!memory) return null;
    const profile = updateProfileFromMemory(demoProfile, memory);
    const taste = updateTasteGraph([memory]);
    const intent = inferIntent(memory);
    const prompt = createAgentPrompt('codex', profile, [memory]);
    return { profile, taste, intent, prompt };
  }, [memory]);

  function processInput() {
    const normalized = normalizeInput({
      type,
      platform,
      title,
      sourceUrl,
      reasonSaved,
      rawContent,
    });
    setMemory(processMemoryItem(normalized));
  }

  return (
    <div className="capture-grid">
      <form className="panel" action={processInput}>
        <label>
          Memory type
          <select value={type} onChange={(event) => setType(event.target.value as MemoryType)}>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Platform
          <select value={platform} onChange={(event) => setPlatform(event.target.value as Platform)}>
            {platforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source URL
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Paste Instagram, TikTok, YouTube, GitHub, article, or podcast link" />
        </label>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Reason saved
          <textarea value={reasonSaved} onChange={(event) => setReasonSaved(event.target.value)} />
        </label>
        <label>
          Manual thought, transcript, OCR, or notes
          <textarea value={rawContent} onChange={(event) => setRawContent(event.target.value)} />
        </label>
        <div className="placeholder-row">
          <span>Upload placeholder</span>
          <span>Social export placeholder</span>
          <span>Obsidian import placeholder</span>
          <span>GitHub import placeholder</span>
        </div>
        <button className="primary-button" type="submit">
          Feed Recall
        </button>
      </form>

      <div className="panel">
        <h2>Mock processing result</h2>
        {memory && preview ? (
          <div className="stack">
            <div className="memory-card">
              <div className="card-topline">
                <span>{memory.platform}</span>
                <span>{memory.status}</span>
              </div>
              <h3>{memory.title}</h3>
              <p>{memory.summary}</p>
              <PillList items={[...memory.topics, ...memory.values, ...memory.projects]} />
            </div>
            <div className="insight-card">
              <strong>Intent signal</strong>
              <p>{preview.intent.inferredIntent}</p>
              <small>{preview.intent.suggestedAction}</small>
            </div>
            <div className="insight-card">
              <strong>Profile preview v{preview.profile.version}</strong>
              <p>{preview.profile.currentDirection}</p>
              <EvidenceList ids={preview.profile.evidenceMemoryIds.slice(-4)} />
            </div>
            <div className="prompt-box">{preview.prompt.prompt}</div>
          </div>
        ) : (
          <p className="muted">Add a memory item to see Intake, Meaning, Privacy, Profile, Taste, Intent, and Prompt agents run with deterministic mock logic.</p>
        )}
      </div>
    </div>
  );
}
