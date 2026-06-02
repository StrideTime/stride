import type {
  CompletedSession,
  Feeling,
  RunningSession,
  SessionTarget,
} from './sessionTypes';

export type Phase = 'idle' | 'running' | 'checkin';

export type SessionState = {
  phase: Phase;
  running: RunningSession | null;
  endedAt: number | null;
  history: CompletedSession[];
  pendingSwitchTarget: SessionTarget | null;
};

export type CheckInInput = {
  feeling: Feeling;
  note: string;
  markedDone: boolean;
};

export type SessionContextValue = {
  phase: Phase;
  running: RunningSession | null;
  elapsedMs: number;
  history: CompletedSession[];
  startSession: (target: SessionTarget) => void;
  switchSession: (target: SessionTarget) => void;
  requestEnd: () => void;
  resumeSession: () => void;
  completeSession: (input: CheckInInput) => void;
  discardSession: () => void;
};
