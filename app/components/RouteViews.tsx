import {
  createAgentPrompt,
  createReflectionSummary,
  findContradictions,
  findPatterns,
  linkProjects,
} from '../../lib/agents';
import {
  demoInsights,
  demoIntentNodes,
  demoMemoryItems,
  demoProfile,
  demoProjects,
  demoPrompts,
  demoTasteNodes,
  futureIntegrations,
} from '../../lib/mockData';
import type { MemoryItem } from '../../lib/types';
import { CaptureConsole } from './CaptureConsole';
import { EvidenceList, Metric, PageHeader, PillList, Section } from './RecallShell';

function MemoryCard({ item }: { item: MemoryItem }) {
  return (
    <article className="memory-card">
      <div className="card-topline">
        <span>{item.platform}</span>
        <span>{item.status}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <PillList items={[...item.topics.slice(0, 3), ...item.values.slice(0, 2), ...item.projects.slice(0, 2)]} />
      <EvidenceList ids={[item.id]} />
    </article>
  );
}

export function DashboardView() {
  const unprocessed = demoMemoryItems.filter((item) => item.status === 'new' || item.status === 'needs_context');
  return (
    <>
      <PageHeader
        eyebrow="Personal intelligence layer"
        title="Recall turns everything you save, watch, hear, read, and think into an agent brain."
        description="A private memory mirror for inputs, evidence, profile signals, projects, taste, intent, and AI agent context."
        action={<a className="primary-button" href="/capture">Feed Recall</a>}
      />
      <div className="metric-grid">
        <Metric label="Memory items" value={demoMemoryItems.length} detail="demo evidence objects" />
        <Metric label="Unprocessed" value={unprocessed.length} detail="need context or review" />
        <Metric label="Profile version" value={`v${demoProfile.version}`} detail={`${Math.round(demoProfile.confidence * 100)}% confidence`} />
        <Metric label="Agent prompts" value={demoPrompts.length} detail="context packs ready" />
      </div>
      <div className="two-column">
        <Section title="Living Profile" eyebrow="Current direction">
          <p className="lead">{demoProfile.summary}</p>
          <PillList items={demoProfile.recurringThemes.slice(0, 8)} />
        </Section>
        <Section title="Recent Insights" eyebrow="Pattern signals">
          <div className="stack">
            {demoInsights.map((insight) => (
              <div className="insight-card" key={insight.id}>
                <strong>{insight.title}</strong>
                <p>{insight.description}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <Section title="Project and prompt suggestions">
        <div className="card-grid">
          {demoProjects.slice(0, 3).map((project) => (
            <div className="panel" key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <PillList items={project.nextActions.slice(0, 2)} />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

export function CaptureView() {
  return (
    <>
      <PageHeader
        eyebrow="Universal Input Layer"
        title="Feed Recall"
        description="Paste a URL, add a manual thought, include why you saved it, and preview how it becomes structured memory."
      />
      <CaptureConsole />
    </>
  );
}

export function InboxView() {
  const statuses = ['new', 'needs_context', 'processed', 'added_to_profile', 'excluded', 'archived'];
  return (
    <>
      <PageHeader eyebrow="Processing inbox" title="Review what enters your profile" description="Each input remains user-controlled: process, add context, mark sensitive, exclude, archive, or turn into an agent prompt." />
      <div className="status-board">
        {statuses.map((status) => (
          <section className="status-column" key={status}>
            <h2>{status.replaceAll('_', ' ')}</h2>
            {demoMemoryItems.filter((item) => item.status === status).map((item) => (
              <div className="mini-card" key={item.id}>
                <strong>{item.title}</strong>
                <small>{item.platform} / {item.type}</small>
                <div className="action-row">
                  <span>process</span>
                  <span>mark sensitive</span>
                  <span>exclude</span>
                  <span>agent prompt</span>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function ProfileView() {
  return (
    <>
      <PageHeader eyebrow="Living Profile" title="Evidence-based user model" description="The profile is a versioned assistive model. It is not a final truth, and every claim should trace back to memory." />
      <div className="profile-grid">
        {[
          ['Summary', [demoProfile.summary, demoProfile.currentDirection]],
          ['Values', demoProfile.values],
          ['Traits', demoProfile.traits],
          ['Interests', demoProfile.interests],
          ['Beliefs and worldview', [...demoProfile.beliefs, ...demoProfile.worldview]],
          ['Communication style', demoProfile.communicationStyle],
          ['Taste', [...demoProfile.aestheticTaste, ...demoProfile.contentTaste]],
          ['Goals and frictions', [...demoProfile.goals, ...demoProfile.frictions]],
          ['Contradictions', demoProfile.contradictions],
        ].map(([title, items]) => (
          <div className="panel" key={title as string}>
            <h2>{title as string}</h2>
            <PillList items={items as string[]} />
          </div>
        ))}
      </div>
      <EvidenceList ids={demoProfile.evidenceMemoryIds} />
    </>
  );
}

export function PersonalityView() {
  return (
    <>
      <PageHeader eyebrow="Personality mirror" title="What your inputs suggest" description="A human-readable mirror of repeated evidence, framed as suggestions and growth edges rather than fixed labels." />
      <div className="two-column">
        <Section title="How you seem to think">
          <p className="lead">You repeatedly save material about turning scattered information into systems, then using those systems for action.</p>
          <PillList items={['builder mindset', 'systems first', 'project-driven learning', 'evidence before claims']} />
        </Section>
        <Section title="What motivates and drains you">
          <PillList items={['autonomy', 'service', 'useful AI', 'calm interfaces', 'unfinished systems', 'too many disconnected inputs']} />
        </Section>
      </div>
      <Section title="Not fixed, evidence based">
        <p>Recall should keep this page humble: profile statements are working hypotheses from saved inputs, not identity claims.</p>
      </Section>
    </>
  );
}

export function TasteView() {
  return (
    <>
      <PageHeader eyebrow="Taste Graph" title="What you keep choosing" description="Visual, content, creator, lecture, product, writing, humour, and ethical taste nodes with evidence." />
      <div className="card-grid">
        {demoTasteNodes.map((node) => (
          <div className="panel" key={node.id}>
            <span className="eyebrow">{node.category}</span>
            <h2>{node.label}</h2>
            <p>{node.description}</p>
            <Metric label="Strength" value={node.strength} detail={`${Math.round(node.confidence * 100)}% confidence`} />
            <EvidenceList ids={node.evidenceMemoryIds} />
          </div>
        ))}
      </div>
    </>
  );
}

export function PatternsView() {
  const patterns = [...demoInsights.filter((insight) => insight.type === 'pattern'), ...findPatterns(demoMemoryItems)];
  return (
    <>
      <PageHeader eyebrow="Pattern finder" title="What you keep returning to" description="Repeated topics, creators, platforms, emotions, values, and project signals become inspectable pattern cards." />
      <div className="card-grid">
        {patterns.map((insight) => (
          <div className="panel" key={insight.id}>
            <h2>{insight.title}</h2>
            <p>{insight.description}</p>
            <small>{insight.suggestedAction}</small>
            <EvidenceList ids={insight.evidenceMemoryIds} />
          </div>
        ))}
      </div>
    </>
  );
}

export function IntentView() {
  return (
    <>
      <PageHeader eyebrow="Intent Graph" title="What your saves imply you want to build or become" description="Recall infers goals, project signals, and suggested actions from what you repeatedly choose to keep." />
      <div className="stack">
        {demoIntentNodes.map((node) => (
          <div className="wide-card" key={node.id}>
            <div>
              <span className="eyebrow">{node.relatedProject}</span>
              <h2>{node.inferredIntent}</h2>
              <p>{node.relatedGoal}</p>
            </div>
            <div>
              <strong>Build From This</strong>
              <p>{node.suggestedAction}</p>
              <EvidenceList ids={node.relatedMemoryIds} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function MemoryView() {
  return (
    <>
      <PageHeader eyebrow="Memory library" title="All memory items" description="Search and filters will sit here: type, platform, project, value, topic, emotion, and status." />
      <div className="filter-row">
        <input placeholder="Search memory, topics, projects, creators" />
        <select><option>All types</option></select>
        <select><option>All platforms</option></select>
        <select><option>All statuses</option></select>
      </div>
      <div className="card-grid">
        {demoMemoryItems.map((item) => <MemoryCard key={item.id} item={item} />)}
      </div>
    </>
  );
}

export function GraphView() {
  return (
    <>
      <PageHeader eyebrow="Memory Graph" title="Inputs connect to topics, values, traits, projects, and prompts" description="This MVP uses a linked entity view. A visual graph can replace it once real storage and embeddings exist." />
      <div className="graph-list">
        {demoMemoryItems.slice(0, 6).map((item) => (
          <div className="graph-row" key={item.id}>
            <strong>{item.title}</strong>
            <span>{'->'}</span>
            <PillList items={[...item.topics, ...item.values, ...item.projects, ...item.traitsSuggested].slice(0, 8)} />
          </div>
        ))}
      </div>
    </>
  );
}

export function ProjectsView() {
  const generated = linkProjects(demoMemoryItems);
  const projects = [...demoProjects, ...generated.filter((project) => !demoProjects.some((demo) => demo.name === project.name))];
  return (
    <>
      <PageHeader eyebrow="Project map" title="Memory becomes project direction" description="Each project shows related memories, recurring themes, suggested next actions, generated prompts, and profile relevance." />
      <div className="card-grid">
        {projects.map((project) => (
          <div className="panel" key={project.id}>
            <span className="eyebrow">{project.status}</span>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <PillList items={project.themes} />
            <ol>
              {project.nextActions.map((action) => <li key={action}>{action}</li>)}
            </ol>
            <EvidenceList ids={project.relatedMemoryIds} />
          </div>
        ))}
      </div>
    </>
  );
}

export function PromptsView() {
  const generated = createAgentPrompt('coding_agent', demoProfile, demoMemoryItems.slice(0, 4));
  const prompts = [...demoPrompts, generated];
  return (
    <>
      <PageHeader eyebrow="Agent Context" title="Generate prompts from your living profile" description="Personal assistant, coding agent, Obsidian assistant, Hermes, Codex, OpenCode, content, project, research, and reflection prompts." />
      <div className="stack">
        {prompts.map((prompt) => (
          <div className="panel" key={prompt.id}>
            <span className="eyebrow">{prompt.type}</span>
            <h2>{prompt.title}</h2>
            <div className="prompt-box">{prompt.prompt}</div>
            <EvidenceList ids={prompt.evidenceMemoryIds} />
          </div>
        ))}
      </div>
    </>
  );
}

export function AskView() {
  const questions = [
    'What do my saved posts say about me?',
    'What am I clearly interested in?',
    'What do I keep circling back to?',
    'What projects should I build next?',
    'What contradictions do I have?',
    'What kind of AI agent would suit me?',
    'What does my lecture history suggest I value?',
    'Build me a system prompt based on my profile.',
  ];
  return (
    <>
      <PageHeader eyebrow="Ask My Profile" title="Query the evidence model" description="The real version will answer from memory graph, profile versions, and source evidence. This MVP shows the intended interface." />
      <div className="ask-layout">
        <div className="panel">
          {questions.map((question) => <button className="question-button" key={question}>{question}</button>)}
        </div>
        <div className="panel">
          <h2>Example answer</h2>
          <p>Your inputs most strongly point toward building private AI systems that turn scattered life and project context into calm action. The strongest evidence is Recall, MazOS, local AI tooling, and discipline content.</p>
          <EvidenceList ids={['mem_ai_agents_reel', 'mem_mazos_note', 'mem_local_ai_repo', 'mem_discipline_lecture']} />
        </div>
      </div>
    </>
  );
}

export function ExportView() {
  const markdown = `# Recall Agent Context\n\n${demoProfile.summary}\n\n## Values\n${demoProfile.values.map((value) => `- ${value}`).join('\n')}\n\n## Evidence\n${demoProfile.evidenceMemoryIds.map((id) => `- ${id}`).join('\n')}`;
  return (
    <>
      <PageHeader eyebrow="Export Agent Brain" title="Export without lock-in" description="Obsidian markdown, JSON, profile export, agent context export, and future MCP context pack placeholders." />
      <div className="two-column">
        <Section title="Export options">
          <PillList items={['Obsidian markdown', 'JSON export', 'profile export', 'agent context pack', 'future MCP context']} />
        </Section>
        <Section title="Markdown preview">
          <pre className="export-preview">{markdown}</pre>
        </Section>
      </div>
    </>
  );
}

export function SettingsView() {
  return (
    <>
      <PageHeader eyebrow="Privacy and control" title="You own the data" description="Delete, mark sensitive, exclude from profile, export everything, and prepare for local-first or self-hosted mode." />
      <div className="profile-grid">
        {['Delete data', 'Mark sensitive', 'Exclude from profile', 'Export data', 'Local-first mode', 'Encrypted storage'].map((item) => (
          <div className="panel" key={item}>
            <h2>{item}</h2>
            <p>Control placeholder for {item.toLowerCase()}.</p>
          </div>
        ))}
      </div>
      <Section title="Future-ready placeholders">
        <PillList items={futureIntegrations} />
      </Section>
    </>
  );
}

export function AgentsView() {
  const reflection = createReflectionSummary(demoProfile, demoMemoryItems);
  const contradictions = findContradictions(demoMemoryItems);
  return (
    <>
      <PageHeader eyebrow="Internal agent system" title="Simple deterministic agents first" description="Recall uses mock services now so each future model integration has an obvious place to attach." />
      <div className="card-grid">
        {[
          'Intake Agent',
          'Transcript Agent',
          'Vision Agent',
          'Meaning Agent',
          'Profile Agent',
          'Taste Agent',
          'Intent Agent',
          'Pattern Agent',
          'Contradiction Agent',
          'Project Agent',
          'Prompt Agent',
          'Privacy Agent',
          'Reflection Agent',
          'Future MCP Agent',
        ].map((agent) => (
          <div className="mini-card" key={agent}>
            <strong>{agent}</strong>
            <small>Mock deterministic service boundary</small>
          </div>
        ))}
      </div>
      <Section title={reflection.title}>
        <p>{reflection.summary}</p>
        <PillList items={reflection.returningTo} />
      </Section>
      <Section title="Contradiction checks">
        {contradictions.map((item) => <p key={item.id}>{item.description}</p>)}
      </Section>
    </>
  );
}
