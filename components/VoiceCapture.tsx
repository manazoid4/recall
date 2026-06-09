'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Copy, Check, Save } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type SR = any;
type SREvent = any;
type SRErrorEvent = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface VoiceCaptureProps {
  onSave?: (title: string, transcript: string, refined: string) => void;
}

type State = 'idle' | 'recording' | 'refining' | 'done' | 'error';

export default function VoiceCapture({ onSave }: VoiceCaptureProps) {
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [refined, setRefined] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const recognitionRef = useRef<SR | null>(null);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      setError('Web Speech API not supported. Use Chrome or Edge.');
      setState('error');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    let finalText = '';

    recognition.onresult = (event: SREvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalText + interim);
    };

    recognition.onerror = (event: SRErrorEvent) => {
      if (event.error !== 'aborted') {
        setError(`Speech error: ${event.error}`);
        setState('error');
      }
    };

    recognition.onend = () => {
      setTranscript(finalText.trim());
    };

    setState('recording');
    setTranscript('');
    setRefined('');
    setError('');
    setSaved(false);
    finalText = '';
    recognition.start();
  }, []);

  const stopRecording = useCallback(async () => {
    const recognition = recognitionRef.current;
    let captured = '';
    if (recognition) {
      // Grab current transcript before stopping
      setTranscript((t) => { captured = t; return t; });
      recognition.stop();
      recognitionRef.current = null;
    }

    await new Promise((r) => setTimeout(r, 400));

    // Use state value via callback form
    setTranscript((current) => {
      captured = current;
      return current;
    });

    if (!captured.trim()) {
      setState('idle');
      return;
    }

    setState('refining');

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: captured.trim() }),
      });

      if (!res.ok) throw new Error(`Refine API: ${res.status}`);
      const data = await res.json();
      setRefined(data.refined ?? captured.trim());
      setTitle(data.title ?? '');
      setState('done');
    } catch {
      setRefined(captured.trim());
      setState('done');
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(refined || transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const content = refined || transcript;
    if (!content) return;
    setSaving(true);
    try {
      const noteTitle = title || 'Voice Note — ' + new Date().toLocaleString();
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://userecall.app/voice/${Date.now()}`,
          title: noteTitle,
          platform: 'voice',
          rawData: content,
        }),
      });
      if (!res.ok) throw new Error(`Save: ${res.status}`);
      setSaved(true);
      onSave?.(noteTitle, transcript, refined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setState('idle');
    setTranscript('');
    setRefined('');
    setError('');
    setTitle('');
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Mic button */}
      <div className="flex flex-col items-center gap-4">
        {(state === 'idle' || state === 'error') && (
          <button
            onClick={startRecording}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow shadow-lg transition-all hover:scale-105 hover:bg-orange active:scale-95"
            aria-label="Start recording"
          >
            <Mic className="h-8 w-8 text-white" />
          </button>
        )}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-red-500 shadow-lg transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
            aria-label="Stop recording"
          >
            <MicOff className="h-8 w-8 text-white" />
          </button>
        )}
        {state === 'refining' && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-line bg-panel">
            <Loader2 className="h-8 w-8 animate-spin text-yellow" />
          </div>
        )}

        <p className="text-sm text-muted">
          {state === 'idle' && 'Tap to start speaking'}
          {state === 'recording' && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording… tap to stop
            </span>
          )}
          {state === 'refining' && 'Cleaning up with AI…'}
          {state === 'done' && 'Done — review and save below'}
          {state === 'error' && <span className="text-red-500">{error}</span>}
        </p>
      </div>

      {/* Live transcript */}
      {state === 'recording' && transcript && (
        <div className="rounded-xl border border-line bg-surface px-4 py-3">
          <p className="text-sm italic text-muted">{transcript}</p>
        </div>
      )}

      {/* Results */}
      {(state === 'done' || state === 'refining') && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Voice note title…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-yellow"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow" />
              <label className="text-xs font-medium text-muted">AI-refined transcript</label>
            </div>
            <textarea
              value={refined || transcript}
              onChange={(e) => setRefined(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-yellow"
            />
          </div>

          {refined && refined !== transcript && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted hover:text-ink">Original transcript</summary>
              <p className="mt-2 rounded-lg border border-line bg-surface px-3 py-2 text-muted">{transcript}</p>
            </details>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : saved ? 'Saved to Library!' : 'Save to Library'}
            </button>

            <button
              onClick={reset}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
            >
              New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
