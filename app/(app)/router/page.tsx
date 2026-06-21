'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  LockKeyhole,
  Route,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import {
  AGENTS,
  AgentId,
  buildExecutionPlan,
  ExecutionPlan,
} from '@/lib/execution-router';

const STORAGE_KEY = 'recall-execution-router-draft';
const AGENT_ORDER: AgentId[] = ['claude', 'codex', 'opencode'];
const PILOT_LINK =
  'mailto:hello@userecall.app?subject=Recall%20Founding%20Agency%20Pilot&body=Tell%20us%20about%20your%20agency%2C%20team%20size%2C%20and%20one%20client%20workflow%20you%20want%20to%20run%20through%20Recall.';

interface RouterDraft {
  objective: string;
  tasks: string;
  agents: AgentId[];
}

const defaultDraft: RouterDraft = {
  objective: '',
  tasks: '',
  agents: AGENT_ORDER,
};

export default function ExecutionRouterPage() {
  const [draft, setDraft] = useState<RouterDraft>(defaultDraft);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [error, setError] = useState('');
  const [copiedAgent, setCopiedAgent] = useState<AgentId | null>(null);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        setDraft(JSON.parse(savedDraft) as RouterDraft);
      }
    } catch {
      // Planning must continue even when storage is blocked or malformed.
    }
  }, []);

  function updateDraft<K extends keyof RouterDraft>(key: K, value: RouterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleAgent(agent: AgentId) {
    updateDraft(
      'agents',
      draft.agents.includes(agent)
        ? draft.agents.filter((selected) => selected !== agent)
        : [...draft.agents, agent],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setCopyError('');

    try {
      const nextPlan = buildExecutionPlan({
        objective: draft.objective,
        tasks: draft.tasks.split('\n'),
        availableAgents: draft.agents,
      });
      setPlan(nextPlan);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (caughtError) {
      setPlan(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to route this work.',
      );
    }
  }

  async function copyPrompt(agent: AgentId, prompt: string) {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedAgent(agent);
      window.setTimeout(() => setCopiedAgent(null), 1800);
    } catch {
      setCopyError('Clipboard access was blocked. Select the prompt and copy it manually.');
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="grid gap-6 border-b-2 border-ink pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 border-2 border-ink bg-yellow px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.16em] text-white shadow-[3px_3px_0_hsl(var(--ink))]">
            <Route className="h-3.5 w-3.5" />
            Execution Router
          </div>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl">
            Turn a big objective into work agents can actually ship.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
            Assign clear ownership, order dependencies, and generate complete handoff prompts for
            Claude, Codex, and OpenCode.
          </p>
        </div>
        <div className="flex items-center gap-2 border-2 border-line bg-panel px-4 py-3 font-mono text-xs text-muted">
          <LockKeyhole className="h-4 w-4 text-yellow" />
          Device-local draft · no model call
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={handleSubmit}
          className="border-2 border-ink bg-panel p-5 shadow-[6px_6px_0_hsl(var(--ink))] sm:p-7"
        >
          <div className="flex items-start justify-between gap-4 border-b-2 border-line pb-5">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-yellow">
                01 / Define
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">Route the work</h2>
            </div>
            <Zap className="h-6 w-6 text-yellow" />
          </div>

          <div className="mt-6 space-y-6">
            <label className="block">
              <span className="text-sm font-black text-ink">Objective</span>
              <span className="mt-1 block text-xs text-muted">
                State the outcome, customer, and definition of done.
              </span>
              <textarea
                value={draft.objective}
                onChange={(event) => updateDraft('objective', event.target.value)}
                rows={4}
                className="mt-3 w-full resize-y border-2 border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                placeholder="Example: Turn our saved campaign research into a paid agency workflow, verify it, and ship a Vercel preview."
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-ink">Tasks</span>
              <span className="mt-1 block text-xs text-muted">
                Add one concrete task per line. The router will order them.
              </span>
              <textarea
                value={draft.tasks}
                onChange={(event) => updateDraft('tasks', event.target.value)}
                rows={8}
                className="mt-3 w-full resize-y border-2 border-line bg-surface px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                placeholder={'Research the market and define positioning\nDesign the workflow and conversion journey\nImplement and deploy the feature\nRun an independent security and QA review'}
              />
            </label>

            <fieldset>
              <legend className="text-sm font-black text-ink">Available agents</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {AGENT_ORDER.map((agent) => {
                  const selected = draft.agents.includes(agent);
                  return (
                    <button
                      key={agent}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAgent(agent)}
                      className={`min-h-24 border-2 p-3 text-left transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                        selected
                          ? 'border-ink bg-yellow/10 shadow-[3px_3px_0_hsl(var(--ink))]'
                          : 'border-line bg-surface hover:border-muted'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-black text-ink">{AGENTS[agent].name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center border ${
                            selected
                              ? 'border-yellow bg-yellow text-white'
                              : 'border-line text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-muted">
                        {AGENTS[agent].role.split(',').slice(0, 2).join(',')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="border-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex min-h-14 w-full items-center justify-center gap-2 border-2 border-ink bg-yellow px-5 text-base font-black text-white shadow-[4px_4px_0_hsl(var(--ink))] hover:bg-orange active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Route the work
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-yellow">
                02 / Execute
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">Assignment plan</h2>
            </div>
            {plan && (
              <span className="border-2 border-line bg-panel px-3 py-1 font-mono text-xs font-bold text-muted">
                {plan.assignments.length} tasks
              </span>
            )}
          </div>

          {!plan ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center border-2 border-dashed border-line bg-panel p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-ink bg-yellow/10 shadow-[4px_4px_0_hsl(var(--ink))]">
                <Clipboard className="h-7 w-7 text-yellow" />
              </div>
              <h3 className="mt-6 text-xl font-black text-ink">Your execution brief appears here.</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Recall will assign every task once, explain the match, order dependencies, and
                produce a complete prompt for each working agent.
              </p>
            </div>
          ) : (
            <>
              <ol className="space-y-3">
                {plan.assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="grid gap-4 border-2 border-line bg-panel p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start"
                  >
                    <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-ink font-mono text-xs font-black text-panel">
                      {assignment.id}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-yellow">
                          {assignment.phase}
                        </span>
                        {assignment.dependsOn.length > 0 && (
                          <span className="font-mono text-[10px] uppercase text-muted">
                            after {assignment.dependsOn.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-bold leading-snug text-ink">{assignment.task}</p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">
                        {assignment.rationale}
                      </p>
                    </div>
                    <span className="w-fit border-2 border-yellow bg-yellow/10 px-3 py-1 text-xs font-black text-yellow">
                      {AGENTS[assignment.agent].name}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="space-y-4 pt-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow" />
                  <h3 className="text-xl font-black text-ink">Copy-ready agent briefs</h3>
                </div>
                {(
                  Object.entries(plan.prompts) as [AgentId, string][]
                ).map(([agent, prompt]) => (
                  <article key={agent} className="border-2 border-ink bg-ink text-white">
                    <div className="flex items-center justify-between gap-4 border-b border-white/20 px-4 py-3">
                      <div>
                        <p className="font-black">{AGENTS[agent].name}</p>
                        <p className="text-xs text-white/55">
                          {plan.assignments.filter((item) => item.agent === agent).length} owned tasks
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPrompt(agent, prompt)}
                        className="inline-flex min-h-10 items-center gap-2 border-2 border-white/30 px-3 text-xs font-black text-white hover:border-yellow hover:text-yellow"
                      >
                        {copiedAgent === agent ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy prompt
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-white/75">
                      {prompt}
                    </pre>
                  </article>
                ))}
                {copyError && (
                  <p role="status" className="text-sm font-bold text-red-600">
                    {copyError}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-6 border-2 border-ink bg-yellow/10 p-6 shadow-[5px_5px_0_hsl(var(--ink))] lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-yellow">
            <Users className="h-4 w-4" />
            Founding agency pilot
          </div>
          <h2 className="mt-3 text-2xl font-black text-ink">
            Make routing reusable across every client account.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            The £500 four-week pilot applies this workflow to one live client, imports the starting
            corpus, and delivers a source-backed intelligence board. The fee is credited against
            your first three paid months after conversion.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-yellow">
            Coming next: shared templates · routing history · permissions · outcome tracking
          </p>
        </div>
        <Link
          href={PILOT_LINK}
          className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-ink px-6 text-sm font-black text-white hover:bg-yellow"
        >
          Apply for the pilot
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
