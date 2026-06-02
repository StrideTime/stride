export const workspaceCreationSteps = ['details', 'plan', 'connect'] as const;
export type WorkspaceCreationStep = (typeof workspaceCreationSteps)[number];

export type BillingCycle = 'monthly' | 'annual';
export type PlanId = 'free' | 'team' | 'enterprise';

export type WorkspacePlan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  priceSuffix: string;
  features: string[];
  recommended?: boolean;
};

export type WorkspaceSourceOption = {
  id: 'jira' | 'linear' | 'github';
  name: string;
  mark: string;
  description: string;
};

export const stepLabels: Record<WorkspaceCreationStep, string> = {
  details: 'Workspace',
  plan: 'Plan',
  connect: 'Connect',
};

export const workspacePlans: WorkspacePlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For an individual getting their own work in order.',
    monthly: 0,
    annual: 0,
    priceSuffix: 'forever',
    features: ['1 team', 'Up to 3 members', 'Capture, Backlog & Schedule', 'One source connection'],
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For a team that plans and runs work together.',
    monthly: 11,
    annual: 9,
    priceSuffix: 'per member / month',
    features: ['Unlimited teams', 'Shared source pool', 'Team flow insights', 'Roles & admin controls'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For an org that needs control and assurance.',
    monthly: null,
    annual: null,
    priceSuffix: "let's talk",
    features: ['SSO & SCIM', 'Audit log', 'Data residency options', 'Priority support'],
  },
];

export const workspaceSourceOptions: WorkspaceSourceOption[] = [
  { id: 'jira', name: 'Jira', mark: 'J', description: 'Import boards, sprints, and issues.' },
  { id: 'linear', name: 'Linear', mark: 'L', description: 'Import teams, projects, and issues.' },
  { id: 'github', name: 'GitHub', mark: 'G', description: 'Import repos, milestones, and issues.' },
];
