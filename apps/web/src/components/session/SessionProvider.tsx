import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  CompletedSession,
  Feeling,
  RunningSession,
  SessionTarget,
} from './types';

type Phase = 'idle' | 'running' | 'checkin';

type SessionState = {
  phase: Phase;
  running: RunningSession | null;
  endedAt: number | null;
  history: CompletedSession[];
};

const now = Date.now();
const mockSession = ({
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
}: {
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
}): CompletedSession => {
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
};

const MOCK_HISTORY: CompletedSession[] = [
  mockSession({
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
  mockSession({
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
  mockSession({
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
  mockSession({
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
  mockSession({
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

const DEFAULT_STATE: SessionState = {
  phase: 'idle',
  running: null,
  endedAt: null,
  history: MOCK_HISTORY,
};

const STORAGE_KEY = 'stride.session.v1';

function loadState(): SessionState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<SessionState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

type CheckInInput = {
  feeling: Feeling;
  note: string;
  markedDone: boolean;
};

type SessionContextValue = {
  phase: Phase;
  running: RunningSession | null;
  elapsedMs: number;
  history: CompletedSession[];
  startSession: (target: SessionTarget) => void;
  requestEnd: () => void;
  resumeSession: () => void;
  completeSession: (input: CheckInInput) => void;
  discardSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Hydrate from storage after mount so the server and first client render
  // match (no SSR hydration mismatch).
  useEffect(() => {
    const stored = loadState();
    const missingMockHistory = MOCK_HISTORY.filter(
      (mock) => !stored.history.some((session) => session.id === mock.id),
    );
    if (stored.phase !== 'idle' || stored.history.length > 0) {
      setState({
        ...stored,
        history: [...missingMockHistory, ...stored.history],
      });
    }
    setNow(Date.now());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable; the session still works in-memory
    }
  }, [state, hydrated]);

  // Tick once a second only while a session is actually running.
  useEffect(() => {
    if (state.phase !== 'running') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state.phase]);

  const value = useMemo<SessionContextValue>(() => {
    const elapsedMs = state.running
      ? (state.phase === 'running' ? now : (state.endedAt ?? now)) -
        state.running.startedAt
      : 0;

    return {
      phase: state.phase,
      running: state.running,
      elapsedMs: Math.max(0, elapsedMs),
      history: state.history,
      startSession: (target) => {
        setNow(Date.now());
        setState((prev) => ({
          ...prev,
          phase: 'running',
          running: { id: `s-${Date.now()}`, target, startedAt: Date.now() },
          endedAt: null,
        }));
      },
      requestEnd: () => {
        setState((prev) =>
          prev.phase === 'running'
            ? { ...prev, phase: 'checkin', endedAt: Date.now() }
            : prev,
        );
      },
      resumeSession: () => {
        setNow(Date.now());
        setState((prev) =>
          prev.phase === 'checkin'
            ? { ...prev, phase: 'running', endedAt: null }
            : prev,
        );
      },
      completeSession: ({ feeling, note, markedDone }) => {
        setState((prev) => {
          if (!prev.running || prev.endedAt == null) return prev;
          const completed: CompletedSession = {
            ...prev.running,
            endedAt: prev.endedAt,
            elapsedMin: Math.max(
              1,
              Math.round((prev.endedAt - prev.running.startedAt) / 60000),
            ),
            feeling,
            note: note.trim(),
            markedDone,
          };
          return {
            phase: 'idle',
            running: null,
            endedAt: null,
            history: [completed, ...prev.history],
          };
        });
      },
      discardSession: () => {
        setState((prev) => ({
          ...prev,
          phase: 'idle',
          running: null,
          endedAt: null,
        }));
      },
    };
  }, [state, now]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
