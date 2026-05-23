import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { CompletedSession, Feeling, RunningSession, SessionTarget } from './types';

type Phase = 'idle' | 'running' | 'checkin';

type SessionState = {
  phase: Phase;
  running: RunningSession | null;
  endedAt: number | null;
  history: CompletedSession[];
};

const DEFAULT_STATE: SessionState = {
  phase: 'idle',
  running: null,
  endedAt: null,
  history: [],
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
    if (stored.phase !== 'idle' || stored.history.length > 0) {
      setState(stored);
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
      ? (state.phase === 'running' ? now : state.endedAt ?? now) - state.running.startedAt
      : 0;

    return {
      phase: state.phase,
      running: state.running,
      elapsedMs: Math.max(0, elapsedMs),
      history: state.history,
      startSession: target => {
        setNow(Date.now());
        setState(prev => ({
          ...prev,
          phase: 'running',
          running: { id: `s-${Date.now()}`, target, startedAt: Date.now() },
          endedAt: null,
        }));
      },
      requestEnd: () => {
        setState(prev => (prev.phase === 'running'
          ? { ...prev, phase: 'checkin', endedAt: Date.now() }
          : prev));
      },
      resumeSession: () => {
        setNow(Date.now());
        setState(prev => (prev.phase === 'checkin'
          ? { ...prev, phase: 'running', endedAt: null }
          : prev));
      },
      completeSession: ({ feeling, note, markedDone }) => {
        setState(prev => {
          if (!prev.running || prev.endedAt == null) return prev;
          const completed: CompletedSession = {
            ...prev.running,
            endedAt: prev.endedAt,
            elapsedMin: Math.max(1, Math.round((prev.endedAt - prev.running.startedAt) / 60000)),
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
        setState(prev => ({ ...prev, phase: 'idle', running: null, endedAt: null }));
      },
    };
  }, [state, now]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
