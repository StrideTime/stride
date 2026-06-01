import type { CompletedSession, Feeling } from './types';

export type MockSessionSeed = {
  id: string;
  actionId: string;
  specId: string;
  title: string;
  sourceKey: string;
  estimateMin: number;
  daysAgo: number;
  hour: number;
  elapsedMin: number;
  feeling: Feeling;
  note: string;
  markedDone?: boolean;
};

const now = Date.now();

function createMockSession({
  id,
  actionId,
  specId,
  title,
  sourceKey,
  estimateMin,
  daysAgo,
  hour,
  elapsedMin,
  feeling,
  note,
  markedDone = false,
}: MockSessionSeed): CompletedSession {
  const endedAt = new Date(now);
  endedAt.setDate(endedAt.getDate() - daysAgo);
  endedAt.setHours(hour, 0, 0, 0);

  return {
    id,
    target: { title, sourceKey, estimateMin, specId, actionId },
    startedAt: endedAt.getTime() - elapsedMin * 60000,
    endedAt: endedAt.getTime(),
    elapsedMin,
    feeling,
    note,
    markedDone,
  };
}

export const mockSessionHistory: CompletedSession[] = [
  createMockSession({
    id: 'mock-session-a3-1',
    actionId: 'a-3',
    specId: 'spec-3',
    title: 'Wire Jira and Linear status vocabularies',
    sourceKey: 'APP-742',
    estimateMin: 75,
    daysAgo: 1,
    hour: 15,
    elapsedMin: 35,
    feeling: 'target',
    note: 'Mapped the common statuses and confirmed the Jira edge case.',
  }),
  createMockSession({
    id: 'mock-session-a4-1',
    actionId: 'a-4',
    specId: 'spec-3',
    title: 'Add status picker interaction states',
    sourceKey: 'APP-742',
    estimateMin: 50,
    daysAgo: 0,
    hour: 15,
    elapsedMin: 25,
    feeling: 'smile',
    note: 'Checked hover, focus, and disabled states in the picker.',
  }),
  createMockSession({
    id: 'mock-session-a10-1',
    actionId: 'a-10',
    specId: 'spec-6',
    title: 'Add nudge state to blocker rows',
    sourceKey: 'API-331',
    estimateMin: 60,
    daysAgo: 2,
    hour: 11,
    elapsedMin: 40,
    feeling: 'smile',
    note: 'First pass of the row state is working.',
  }),
  createMockSession({
    id: 'mock-session-a10-2',
    actionId: 'a-10',
    specId: 'spec-6',
    title: 'Add nudge state to blocker rows',
    sourceKey: 'API-331',
    estimateMin: 60,
    daysAgo: 1,
    hour: 10,
    elapsedMin: 30,
    feeling: 'neutral',
    note: 'Tightened copy and checked contrast.',
    markedDone: true,
  }),
  createMockSession({
    id: 'mock-session-a15-1',
    actionId: 'a-15',
    specId: 'spec-6',
    title: 'Draft blocker nudge states',
    sourceKey: 'API-331',
    estimateMin: 35,
    daysAgo: 3,
    hour: 14,
    elapsedMin: 40,
    feeling: 'target',
    note: 'Finished the variants for waiting, blocked, and resolved.',
    markedDone: true,
  }),
];
