// Session-flow domain types. Client-side for now; the backend trails the FE
// (see docs/plan/roadmap.md). A Session is timed work against a target.

export type Feeling = 'frown' | 'neutral' | 'smile' | 'target';

// What a session is run against. In a later slice this is a real Action;
// for now it carries just what the timer and check-in need.
export type SessionTarget = {
  title: string;
  sourceKey?: string;
  estimateMin?: number;
};

export type RunningSession = {
  id: string;
  target: SessionTarget;
  startedAt: number;
};

export type CompletedSession = RunningSession & {
  endedAt: number;
  elapsedMin: number;
  feeling: Feeling;
  note: string;
  markedDone: boolean;
};
