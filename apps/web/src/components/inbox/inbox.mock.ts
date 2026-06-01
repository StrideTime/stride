export type InboxType =
  | 'assigned'
  | 'unblocked'
  | 'handoff'
  | 'approval'
  | 'source-drift'
  | 'unmapped';

export type InboxNotification = {
  id: string;
  type: InboxType;
  title: string;
  sourceKey: string;
  source: 'Jira' | 'Linear';
  team: string;
  actor: string;
  timestamp: string;
  summary: string;
  detail: string;
  priority: 'P1' | 'P2' | 'P3';
  unread: boolean;
  primaryAction: string;
  secondaryAction: string;
};

export const inboxNotifications: InboxNotification[] = [
  {
    id: 'inbox-1',
    type: 'assigned',
    title: 'Move billing webhooks onto the new queue worker',
    sourceKey: 'PLAT-501',
    source: 'Jira',
    team: 'Platform',
    actor: 'Nora',
    timestamp: '12m ago',
    summary: 'Assigned to you',
    detail: 'New P1 spec landed without actions. Review scope before planning it.',
    priority: 'P1',
    unread: true,
    primaryAction: 'Review spec',
    secondaryAction: 'Send to breakdown',
  },
  {
    id: 'inbox-2',
    type: 'unblocked',
    title: 'Expose blocker nudges in backlog rows',
    sourceKey: 'API-331',
    source: 'Linear',
    team: 'API',
    actor: 'Mina',
    timestamp: '28m ago',
    summary: 'Unblocked',
    detail: 'Copy review cleared. You can start the next action.',
    priority: 'P1',
    unread: true,
    primaryAction: 'Open',
    secondaryAction: 'Start next action',
  },
  {
    id: 'inbox-3',
    type: 'handoff',
    title: 'Add source-mapped status picker to spec sidebar',
    sourceKey: 'APP-742',
    source: 'Jira',
    team: 'App',
    actor: 'Owen',
    timestamp: '1h ago',
    summary: 'Handoff ready',
    detail: 'One action is complete. Confirm the next action fits your schedule.',
    priority: 'P2',
    unread: true,
    primaryAction: 'Review handoff',
    secondaryAction: 'Schedule',
  },
  {
    id: 'inbox-4',
    type: 'approval',
    title: 'Clarify cross-team handoff for imported Linear teams',
    sourceKey: 'ENG-188',
    source: 'Linear',
    team: 'Integrations',
    actor: 'Priya',
    timestamp: '2h ago',
    summary: 'Approval requested',
    detail: 'Transfer to Integrations is paused until you approve or reject it.',
    priority: 'P2',
    unread: false,
    primaryAction: 'Review approval',
    secondaryAction: 'Open spec',
  },
  {
    id: 'inbox-5',
    type: 'source-drift',
    title: 'Resolve closed source issue with open migration actions',
    sourceKey: 'PLAT-488',
    source: 'Jira',
    team: 'Platform',
    actor: 'Jira sync',
    timestamp: '3h ago',
    summary: 'Closed in source',
    detail: 'Jira says Done, but Stride still has 2 open actions. Resolve the mismatch.',
    priority: 'P2',
    unread: false,
    primaryAction: 'Resolve',
    secondaryAction: 'Keep open',
  },
  {
    id: 'inbox-6',
    type: 'unmapped',
    title: 'Linear team “Growth” has no Stride team mapping',
    sourceKey: 'GRO-24',
    source: 'Linear',
    team: 'Setup triage',
    actor: 'Linear sync',
    timestamp: 'Yesterday',
    summary: 'Needs mapping',
    detail: 'Incoming Linear items are held until Growth is mapped or ignored.',
    priority: 'P3',
    unread: false,
    primaryAction: 'Map team',
    secondaryAction: 'Ignore source',
  },
];

export const inboxMetrics = [
  { label: 'Unread', value: '3' },
  { label: 'Needs decision', value: '4' },
  { label: 'Safe to archive', value: '2' },
];
