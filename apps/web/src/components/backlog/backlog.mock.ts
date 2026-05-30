export type BacklogSource = 'Jira' | 'Linear';
export type BacklogPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type BacklogReadiness =
  | 'no-actions'
  | 'draft-actions'
  | 'needs-estimates'
  | 'ready';
export type AttentionKind =
  | 'awaiting-approval'
  | 'closed-in-source'
  | 'blocker-reported'
  | 'unassigned'
  | 'just-landed';

export type BacklogAction = {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  estimateMin?: number;
  loggedMin: number;
  plannedMin: number;
  done?: boolean;
  scheduled?: boolean;
};

export type BacklogSpec = {
  id: string;
  source: BacklogSource;
  sourceKey: string;
  title: string;
  description: string;
  priority: BacklogPriority;
  sourcePriority: string;
  sourceStatus: string;
  assignee?: string;
  team: string;
  sprint?: string;
  labels: string[];
  readiness: BacklogReadiness;
  attention: AttentionKind[];
  recommendationReason?: string;
  waitingOn?: string;
  blocking?: string[];
  lastEditedBy?: string;
  actions: BacklogAction[];
};

export const backlogSpecs: BacklogSpec[] = [
  {
    id: 'spec-1',
    source: 'Jira',
    sourceKey: 'PLAT-501',
    title: 'Move billing webhooks onto the new queue worker',
    description:
      'Webhook retry behavior is unclear and needs execution breakdown before the team starts.',
    priority: 'P1',
    sourcePriority: 'Urgent',
    sourceStatus: 'To Do',
    assignee: 'You',
    team: 'Platform',
    sprint: 'Sprint 42',
    labels: ['billing', 'queue'],
    readiness: 'no-actions',
    attention: ['just-landed'],
    recommendationReason: 'P1 assigned to you, no actions yet',
    lastEditedBy: 'Nora',
    actions: [],
  },
  {
    id: 'spec-2',
    source: 'Linear',
    sourceKey: 'ENG-188',
    title: 'Clarify cross-team handoff for imported Linear teams',
    description:
      'Ambiguous scope, likely needs team refinement with admins and affected devs.',
    priority: 'P2',
    sourcePriority: 'High',
    sourceStatus: 'Backlog',
    team: 'Integrations',
    sprint: 'Sprint 42',
    labels: ['linear', 'admin'],
    readiness: 'draft-actions',
    attention: ['unassigned', 'awaiting-approval'],
    recommendationReason: 'Unassigned refinement candidate',
    waitingOn: 'Team mapping approval',
    lastEditedBy: 'Mina',
    actions: [
      {
        id: 'a-1',
        title: 'List unmapped Linear entities in setup triage',
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-2',
        title: 'Design admin map or ignore decision',
        loggedMin: 0,
        plannedMin: 0,
      },
    ],
  },
  {
    id: 'spec-3',
    source: 'Jira',
    sourceKey: 'APP-742',
    title: 'Add source-mapped status picker to spec sidebar',
    description: 'Replace generic done/reopen controls with source vocabulary.',
    priority: 'P2',
    sourcePriority: 'High',
    sourceStatus: 'In Progress',
    assignee: 'You',
    team: 'App',
    sprint: 'Sprint 42',
    labels: ['spec-view'],
    readiness: 'ready',
    attention: [],
    recommendationReason: 'Ready action with estimate gap closed',
    actions: [
      {
        id: 'a-3',
        title: 'Wire Jira and Linear status vocabularies',
        estimateMin: 75,
        loggedMin: 35,
        plannedMin: 60,
        scheduled: true,
      },
      {
        id: 'a-4',
        title: 'Add status picker interaction states',
        estimateMin: 50,
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-5',
        title: 'Regression test closed statuses',
        estimateMin: 30,
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-14',
        title: 'Confirm status picker copy with source vocabulary',
        assignee: 'You',
        estimateMin: 25,
        loggedMin: 22,
        plannedMin: 30,
        done: true,
      },
    ],
  },
  {
    id: 'spec-4',
    source: 'Linear',
    sourceKey: 'FE-209',
    title: 'Backlog compact density for large team queues',
    description:
      'High-volume teams need scan mode without losing action readiness.',
    priority: 'P3',
    sourcePriority: 'Normal',
    sourceStatus: 'Todo',
    assignee: 'Priya',
    team: 'Frontend',
    sprint: 'Sprint 43',
    labels: ['backlog', 'density'],
    readiness: 'needs-estimates',
    attention: [],
    lastEditedBy: 'You',
    actions: [
      {
        id: 'a-6',
        title: 'Reduce row vertical rhythm in compact mode',
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-7',
        title: 'Keep source key and primary action visible',
        loggedMin: 0,
        plannedMin: 0,
      },
    ],
  },
  {
    id: 'spec-5',
    source: 'Jira',
    sourceKey: 'PLAT-488',
    title: 'Resolve closed source issue with open migration actions',
    description: 'Jira was closed, but two Stride actions are still open.',
    priority: 'P2',
    sourcePriority: 'High',
    sourceStatus: 'Done',
    assignee: 'Owen',
    team: 'Platform',
    sprint: 'Sprint 42',
    labels: ['migration'],
    readiness: 'ready',
    attention: ['closed-in-source'],
    actions: [
      {
        id: 'a-8',
        title: 'Validate replay idempotency on staging',
        estimateMin: 45,
        loggedMin: 20,
        plannedMin: 45,
      },
      {
        id: 'a-9',
        title: 'Clean up old webhook secret',
        estimateMin: 20,
        loggedMin: 0,
        plannedMin: 0,
      },
    ],
  },
  {
    id: 'spec-6',
    source: 'Linear',
    sourceKey: 'API-331',
    title: 'Expose blocker nudges in backlog rows',
    description:
      'Users need to see when teammates are waiting without feeling called out.',
    priority: 'P1',
    sourcePriority: 'Urgent',
    sourceStatus: 'In Review',
    assignee: 'You',
    team: 'API',
    sprint: 'Sprint 42',
    labels: ['blockers'],
    readiness: 'ready',
    attention: ['blocker-reported'],
    blocking: ['Mina', 'Leo'],
    recommendationReason: 'Blocking 2 teammates',
    actions: [
      {
        id: 'a-10',
        title: 'Add nudge state to blocker rows',
        estimateMin: 60,
        loggedMin: 70,
        plannedMin: 60,
        scheduled: true,
      },
      {
        id: 'a-11',
        title: 'Write neutral chokepoint copy',
        estimateMin: 25,
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-16',
        title: 'Sketch tray no-estimate timer state',
        assignee: 'You',
        description: 'Validate the simple live-session state before an estimate exists.',
        loggedMin: 0,
        plannedMin: 0,
      },
      {
        id: 'a-15',
        title: 'Draft blocker nudge states',
        assignee: 'You',
        estimateMin: 35,
        loggedMin: 40,
        plannedMin: 30,
        done: true,
      },
    ],
  },
  {
    id: 'spec-7',
    source: 'Jira',
    sourceKey: 'APP-751',
    title: 'Spec view history tab for ownership changes',
    description: 'Audit trail showing prior owners and logged time.',
    priority: 'P3',
    sourcePriority: 'Normal',
    sourceStatus: 'To Do',
    assignee: 'Leo',
    team: 'App',
    sprint: 'Sprint 43',
    labels: ['history'],
    readiness: 'ready',
    attention: [],
    actions: [
      {
        id: 'a-12',
        title: 'Model ownership audit display rows',
        estimateMin: 90,
        loggedMin: 0,
        plannedMin: 60,
      },
      {
        id: 'a-13',
        title: 'Add source activity grouping',
        estimateMin: 45,
        loggedMin: 0,
        plannedMin: 0,
      },
    ],
  },
  {
    id: 'spec-8',
    source: 'Linear',
    sourceKey: 'DES-87',
    title: 'Review team refinement flow for incoming specs',
    description: 'A candidate for collaborative breakdown during planning.',
    priority: 'P2',
    sourcePriority: 'High',
    sourceStatus: 'Todo',
    team: 'Design Systems',
    sprint: 'Sprint 42',
    labels: ['refinement'],
    readiness: 'no-actions',
    attention: ['unassigned'],
    actions: [],
  },
];
