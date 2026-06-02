import type { BacklogSpec } from '../../backlog/backlog.mock';
import type { CompletedSession } from '../../session';
import {
  getMockActiveSessionHistory,
  mockSpecCompletedSessions,
  relativeMockDate,
  type SpecHistoryChange,
} from '../specs.mock';

export type HistoryItem = {
  id: string;
  at: Date;
  eyebrow: string;
  summary: string;
  actor: string;
  changes?: SpecHistoryChange[];
  tone?: 'default' | 'success' | 'source' | 'action' | 'session';
};

export function formatDuration(min: number) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function getVisibleHistory(history: CompletedSession[]) {
  const ids = new Set(history.map(session => session.id));
  return [
    ...mockSpecCompletedSessions.filter(session => !ids.has(session.id)),
    ...history,
  ];
}

export function buildHistory(
  spec: BacklogSpec,
  sessions: CompletedSession[],
  running: {
    target: { specId?: string; actionId?: string; title: string };
    startedAt: number;
  } | null,
  elapsedMs: number,
): HistoryItem[] {
  const sourceItem: HistoryItem = {
    id: `${spec.id}-source`,
    at: relativeMockDate(6, 9),
    eyebrow: 'Source sync',
    summary: `${spec.sourceKey} imported from ${spec.source}`,
    actor: spec.assignee ?? 'You',
    tone: 'source',
  };

  const statusItem: HistoryItem = {
    id: `${spec.id}-status`,
    at: relativeMockDate(5, 11),
    eyebrow: 'Spec modified',
    summary: `Status changed to ${spec.sourceStatus}`,
    actor: spec.assignee ?? 'You',
    changes: [{ label: 'Status', from: 'Backlog', to: spec.sourceStatus }],
    tone: 'source',
  };

  const actionItems = spec.actions.map(
    (action, index): HistoryItem => ({
      id: `${spec.id}-${action.id}-created`,
      at: relativeMockDate(Math.max(1, 4 - index), 10 + index),
      eyebrow: 'Action created',
      summary: action.title,
      actor: action.assignee ?? spec.assignee ?? 'You',
      tone: 'action',
    }),
  );

  const doneItems = spec.actions
    .filter(action => action.done)
    .map(
      (action, index): HistoryItem => ({
        id: `${spec.id}-${action.id}-done`,
        at: relativeMockDate(index, 15),
        eyebrow: 'Action completed',
        summary: `${action.title} completed`,
        actor: action.assignee ?? spec.assignee ?? 'You',
        tone: 'success',
      }),
    );

  const sessionItems = sessions.map(
    (session): HistoryItem => ({
      id: session.id,
      at: new Date(session.endedAt),
      eyebrow: 'Session logged',
      summary: `${formatDuration(session.elapsedMin)} logged on ${session.target.title}`,
      actor: 'You',
      tone: session.markedDone ? 'success' : 'session',
    }),
  );

  const modifiedItems: HistoryItem[] = spec.actions
    .slice(0, 2)
    .map((action, index) => ({
      id: `${spec.id}-${action.id}-modified`,
      at: relativeMockDate(Math.max(0, 2 - index), 13 + index),
      eyebrow: 'Action modified',
      summary: `${action.title} updated`,
      actor: action.assignee ?? spec.assignee ?? 'You',
      changes: [
        ...(index === 0
          ? [{ label: 'Title', from: 'Draft action', to: action.title }]
          : []),
        ...(action.estimateMin
          ? [
              {
                label: 'Estimate',
                from: 'No estimate',
                to: formatDuration(action.estimateMin),
              },
            ]
          : []),
      ],
      tone: 'action',
    }));

  const sessionModifiedItems: HistoryItem[] =
    spec.id === 'spec-7'
      ? [
          {
            id: `${spec.id}-session-modified`,
            at: relativeMockDate(0, 11),
            eyebrow: 'Session modified',
            summary: 'Session updated for Model ownership audit display rows',
            actor: 'You',
            changes: [
              { label: 'Duration', from: '45m', to: '50m' },
              {
                label: 'Action',
                from: 'Unlinked session',
                to: 'Model ownership audit display rows',
              },
            ],
            tone: 'session',
          },
        ]
      : [];

  const mockActiveItem: HistoryItem[] = getMockActiveSessionHistory(spec.id);

  const activeItem: HistoryItem[] =
    running?.target.specId === spec.id
      ? [
          {
            id: `${spec.id}-active-session`,
            at: new Date(running.startedAt),
            eyebrow: 'Session active',
            summary: `${formatDuration(Math.max(1, Math.floor(elapsedMs / 60000)))} in progress on ${running.target.title}`,
            actor: 'You',
            tone: 'session',
          },
        ]
      : mockActiveItem;

  return [
    ...activeItem,
    sourceItem,
    statusItem,
    ...actionItems,
    ...modifiedItems,
    ...doneItems,
    ...sessionModifiedItems,
    ...sessionItems,
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
}
