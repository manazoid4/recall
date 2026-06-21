import { describe, expect, it } from 'vitest';
import { buildExecutionPlan } from '../../lib/execution-router';

describe('buildExecutionPlan', () => {
  it('routes work to the strongest available specialist', () => {
    const plan = buildExecutionPlan({
      objective: 'Ship a client-ready campaign intelligence workspace',
      tasks: [
        'Design the onboarding flow and write the positioning copy',
        'Implement the API, database migration, tests, and Vercel deployment',
        'Run an independent security audit and browser QA pass',
      ],
      availableAgents: ['claude', 'codex', 'opencode'],
    });

    expect(plan.assignments.map(({ agent }) => agent)).toEqual([
      'claude',
      'codex',
      'opencode',
    ]);
  });

  it('never assigns work to an unavailable agent', () => {
    const plan = buildExecutionPlan({
      objective: 'Review and ship a launch page',
      tasks: ['Audit the responsive UI', 'Deploy the finished application'],
      availableAgents: ['claude'],
    });

    expect(plan.assignments).toHaveLength(2);
    expect(plan.assignments.every(({ agent }) => agent === 'claude')).toBe(true);
  });

  it('orders discovery before design, implementation, verification, and delivery', () => {
    const plan = buildExecutionPlan({
      objective: 'Launch an agency product',
      tasks: [
        'Deploy the Vercel preview and open the pull request',
        'Implement the authenticated dashboard',
        'Research the target agencies and competitors',
        'Run accessibility QA and security verification',
        'Design the customer journey and pricing page',
      ],
      availableAgents: ['claude', 'codex', 'opencode'],
    });

    expect(plan.assignments.map(({ phase }) => phase)).toEqual([
      'discover',
      'design',
      'build',
      'verify',
      'ship',
    ]);
  });

  it('generates complete copyable prompts with dependencies and handoff rules', () => {
    const plan = buildExecutionPlan({
      objective: 'Turn a research workflow into a paid agency feature',
      tasks: [
        'Define the product workflow and revenue positioning',
        'Build and deploy the feature',
      ],
      availableAgents: ['claude', 'codex'],
    });

    expect(plan.prompts.claude).toContain(
      'Turn a research workflow into a paid agency feature',
    );
    expect(plan.prompts.claude).toContain('OWNED TASKS');
    expect(plan.prompts.claude).toContain('DEPENDENCIES');
    expect(plan.prompts.claude).toContain('VERIFICATION');
    expect(plan.prompts.claude).toContain('HANDOFF');
    expect(plan.prompts.codex).toContain('Build and deploy the feature');
  });
});
