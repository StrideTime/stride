import type { CompletedSession, Feeling } from '@providers';

export type SpecHistoryChange = { label: string; from?: string; to: string };

export type SpecHistoryFixture = {
  id: string;
  at: Date;
  eyebrow: string;
  summary: string;
  actor: string;
  changes?: SpecHistoryChange[];
  tone?: 'default' | 'success' | 'source' | 'action' | 'session';
};

export type MockCompletedSessionSeed = {
  id: string;
  specId: string;
  actionId: string;
  title: string;
  sourceKey: string;
  estimateMin: number;
  daysAgo: number;
  hour: number;
  elapsedMin: number;
  feeling: Feeling;
};

export function relativeMockDate(daysAgo: number, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function createMockCompletedSession({
  id,
  specId,
  actionId,
  title,
  sourceKey,
  estimateMin,
  daysAgo,
  hour,
  elapsedMin,
  feeling,
}: MockCompletedSessionSeed): CompletedSession {
  const endedAt = relativeMockDate(daysAgo, hour).getTime();

  return {
    id,
    target: { title, sourceKey, estimateMin, specId, actionId },
    startedAt: endedAt - elapsedMin * 60000,
    endedAt,
    elapsedMin,
    feeling,
    note: '',
    markedDone: false,
  };
}

export const mockSpecCompletedSessions: CompletedSession[] = [
  createMockCompletedSession({
    id: 'mock-spec-view-a3-1',
    specId: 'spec-3',
    actionId: 'a-3',
    title: 'Wire Jira and Linear status vocabularies',
    sourceKey: 'APP-742',
    estimateMin: 75,
    daysAgo: 1,
    hour: 15,
    elapsedMin: 35,
    feeling: 'target',
  }),
  createMockCompletedSession({
    id: 'mock-spec-view-a4-1',
    specId: 'spec-3',
    actionId: 'a-4',
    title: 'Add status picker interaction states',
    sourceKey: 'APP-742',
    estimateMin: 50,
    daysAgo: 0,
    hour: 15,
    elapsedMin: 25,
    feeling: 'smile',
  }),
  createMockCompletedSession({
    id: 'mock-spec-view-a12-1',
    specId: 'spec-7',
    actionId: 'a-12',
    title: 'Model ownership audit display rows',
    sourceKey: 'APP-751',
    estimateMin: 90,
    daysAgo: 1,
    hour: 16,
    elapsedMin: 50,
    feeling: 'target',
  }),
  createMockCompletedSession({
    id: 'mock-spec-view-a13-1',
    specId: 'spec-7',
    actionId: 'a-13',
    title: 'Add source activity grouping',
    sourceKey: 'APP-751',
    estimateMin: 45,
    daysAgo: 0,
    hour: 10,
    elapsedMin: 25,
    feeling: 'smile',
  }),
];

export function getMockActiveSessionHistory(specId: string): SpecHistoryFixture[] {
  if (specId !== 'spec-7') return [];

  return [
    {
      id: `${specId}-mock-active-session`,
      at: relativeMockDate(0, 14),
      eyebrow: 'Session active',
      summary: '18m in progress on Add source activity grouping',
      actor: 'You',
      tone: 'session',
    },
  ];
}
