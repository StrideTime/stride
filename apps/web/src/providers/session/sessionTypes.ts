// Session-flow domain types. Client-side for now; the backend trails the FE
// (see docs/plan/roadmap.md). A Session is timed work against a target.

export type Feeling = 'frown' | 'neutral' | 'smile' | 'target';

// What a session is run against. May reference a real Action via specId +
// actionId so completion rolls up into that Action's logged time and done state.
export type SessionTarget = {
  title: string;
  sourceKey?: string;
  estimateMin?: number;
  specId?: string;
  actionId?: string;
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
