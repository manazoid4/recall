export type AgentId = 'claude' | 'codex' | 'opencode';
export type WorkPhase = 'discover' | 'design' | 'build' | 'verify' | 'ship';

export interface ExecutionRouterInput {
  objective: string;
  tasks: string[];
  availableAgents: AgentId[];
}

export interface RoutedAssignment {
  id: string;
  task: string;
  agent: AgentId;
  phase: WorkPhase;
  rationale: string;
  dependsOn: string[];
}

export interface ExecutionPlan {
  objective: string;
  assignments: RoutedAssignment[];
  prompts: Partial<Record<AgentId, string>>;
}

export const AGENTS: Record<
  AgentId,
  { name: string; role: string; verification: string }
> = {
  claude: {
    name: 'Claude',
    role: 'Product direction, UX, visual design, positioning, strategy, and writing',
    verification: 'Review the complete user journey, copy accuracy, responsive UX, and accessibility.',
  },
  codex: {
    name: 'Codex',
    role: 'Architecture, implementation, security, tests, Git, integration, and deployment',
    verification: 'Run the repository test, typecheck, lint, build, and deployment verification commands.',
  },
  opencode: {
    name: 'OpenCode',
    role: 'Independent research, audits, local automation, QA, and secondary verification',
    verification: 'Report reproducible findings with evidence, severity, and the smallest safe remediation.',
  },
};

const PHASE_ORDER: WorkPhase[] = ['discover', 'design', 'build', 'verify', 'ship'];

const PHASE_KEYWORDS: Record<WorkPhase, string[]> = {
  discover: ['research', 'competitor', 'investigate', 'analyse', 'analyze', 'market', 'audit requirements'],
  design: ['design', 'ux', 'ui', 'copy', 'positioning', 'strategy', 'pricing', 'journey', 'brand'],
  build: ['build', 'implement', 'code', 'api', 'database', 'migration', 'feature', 'fix', 'integration'],
  verify: ['test', 'qa', 'audit', 'review', 'security', 'accessibility', 'verify', 'validation'],
  ship: ['deploy', 'vercel', 'release', 'ship', 'pull request', 'github', 'publish', 'launch'],
};

const AGENT_KEYWORDS: Record<AgentId, string[]> = {
  claude: [
    'design',
    'ux',
    'ui',
    'copy',
    'positioning',
    'strategy',
    'pricing',
    'brand',
    'journey',
    'content',
    'revenue',
  ],
  codex: [
    'build',
    'implement',
    'code',
    'api',
    'database',
    'migration',
    'security',
    'test',
    'debug',
    'fix',
    'deploy',
    'vercel',
    'github',
    'pull request',
    'integration',
  ],
  opencode: [
    'research',
    'audit',
    'qa',
    'review',
    'investigate',
    'competitor',
    'local',
    'automation',
    'verify',
    'validation',
  ],
};

function keywordScore(text: string, keywords: string[]): number {
  return keywords.reduce(
    (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
    0,
  );
}

function inferPhase(task: string): WorkPhase {
  const normalized = task.toLowerCase();
  let bestPhase: WorkPhase = 'build';
  let bestScore = 0;

  for (const phase of PHASE_ORDER) {
    const score = keywordScore(normalized, PHASE_KEYWORDS[phase]);
    if (score > bestScore) {
      bestPhase = phase;
      bestScore = score;
    }
  }

  return bestPhase;
}

function chooseAgent(task: string, availableAgents: AgentId[]): AgentId {
  const normalized = task.toLowerCase();
  const fallback = availableAgents.includes('codex')
    ? 'codex'
    : availableAgents[0];

  let bestAgent = fallback;
  let bestScore = -1;

  for (const agent of availableAgents) {
    const score = keywordScore(normalized, AGENT_KEYWORDS[agent]);
    if (score > bestScore || (score === bestScore && agent === fallback)) {
      bestAgent = agent;
      bestScore = score;
    }
  }

  return bestAgent;
}

function buildRationale(task: string, agent: AgentId): string {
  const matches = AGENT_KEYWORDS[agent].filter((keyword) =>
    task.toLowerCase().includes(keyword),
  );

  if (matches.length === 0) {
    return `${AGENTS[agent].name} owns integration for this plan and is the safest available lead.`;
  }

  return `${AGENTS[agent].name} is the strongest match for ${matches
    .slice(0, 3)
    .join(', ')} work.`;
}

function buildPrompt(
  objective: string,
  agent: AgentId,
  assignments: RoutedAssignment[],
  allAssignments: RoutedAssignment[],
): string {
  const dependencyLines = assignments.flatMap((assignment) =>
    assignment.dependsOn.map((dependencyId) => {
      const dependency = allAssignments.find(({ id }) => id === dependencyId);
      return dependency
        ? `- Wait for ${dependency.id}: ${dependency.task} (${AGENTS[dependency.agent].name})`
        : `- Wait for ${dependencyId}`;
    }),
  );

  return [
    `RECALL EXECUTION BRIEF — ${AGENTS[agent].name.toUpperCase()}`,
    '',
    'OBJECTIVE',
    objective,
    '',
    'ROLE',
    AGENTS[agent].role,
    '',
    'OWNED TASKS',
    ...assignments.map(
      (assignment) =>
        `- ${assignment.id} [${assignment.phase.toUpperCase()}] ${assignment.task}`,
    ),
    '',
    'DEPENDENCIES',
    ...(dependencyLines.length > 0
      ? Array.from(new Set(dependencyLines))
      : ['- None. Start immediately.']),
    '',
    'BOUNDARIES',
    '- Work only on the tasks assigned above.',
    '- Preserve existing user changes and avoid unrelated refactors.',
    '- Surface material business decisions, destructive operations, or missing credentials.',
    '',
    'VERIFICATION',
    AGENTS[agent].verification,
    '',
    'HANDOFF',
    '- Return files changed, decisions made, verification evidence, remaining risks, and the exact commit hash or artifact location.',
    '- State dependencies that are now unblocked for the next owner.',
  ].join('\n');
}

export function buildExecutionPlan(input: ExecutionRouterInput): ExecutionPlan {
  const objective = input.objective.trim();
  const tasks = input.tasks.map((task) => task.trim()).filter(Boolean);
  const availableAgents = Array.from(new Set(input.availableAgents));

  if (!objective) {
    throw new Error('Objective is required.');
  }

  if (tasks.length === 0) {
    throw new Error('At least one task is required.');
  }

  if (availableAgents.length === 0) {
    throw new Error('Select at least one agent.');
  }

  const assignments = tasks
    .map((task, originalIndex) => ({
      task,
      originalIndex,
      phase: inferPhase(task),
      agent: chooseAgent(task, availableAgents),
    }))
    .sort(
      (left, right) =>
        PHASE_ORDER.indexOf(left.phase) - PHASE_ORDER.indexOf(right.phase) ||
        left.originalIndex - right.originalIndex,
    )
    .map((assignment, index, ordered) => {
      const id = `T${index + 1}`;
      const previous = ordered[index - 1];
      return {
        id,
        task: assignment.task,
        agent: assignment.agent,
        phase: assignment.phase,
        rationale: buildRationale(assignment.task, assignment.agent),
        dependsOn: previous && previous.phase !== assignment.phase ? [`T${index}`] : [],
      };
    });

  const prompts = Object.fromEntries(
    availableAgents
      .map((agent) => {
        const ownedAssignments = assignments.filter(
          (assignment) => assignment.agent === agent,
        );
        return ownedAssignments.length > 0
          ? [agent, buildPrompt(objective, agent, ownedAssignments, assignments)]
          : null;
      })
      .filter((entry): entry is [AgentId, string] => entry !== null),
  ) as Partial<Record<AgentId, string>>;

  return { objective, assignments, prompts };
}
