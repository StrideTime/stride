import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { mockSessionHistory } from './session.mock';
import type { CompletedSession } from './sessionTypes';
import { SessionContext } from './sessionContext';
import {
  DEFAULT_SESSION_STATE,
  loadSessionState,
  SESSION_STORAGE_KEY,
} from './sessionState';
import type { SessionContextValue, SessionState } from './types';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(DEFAULT_SESSION_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Hydrate from storage after mount so the server and first client render
  // match (no SSR hydration mismatch).
  useEffect(() => {
    const stored = loadSessionState();
    const missingMockHistory = mockSessionHistory.filter(
      mock => !stored.history.some(session => session.id === mock.id),
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
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
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
      ? (state.phase === 'running' ? now : (state.endedAt ?? now)) - state.running.startedAt
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
      switchSession: target => {
        const switchedAt = Date.now();
        setNow(switchedAt);
        setState(prev => {
          if (!prev.running) {
            return {
              ...prev,
              phase: 'running',
              running: { id: `s-${switchedAt}`, target, startedAt: switchedAt },
              endedAt: null,
              pendingSwitchTarget: null,
            };
          }

          return {
            ...prev,
            phase: 'checkin',
            endedAt: switchedAt,
            pendingSwitchTarget: target,
          };
        });
      },
      requestEnd: () => {
        setState(prev =>
          prev.phase === 'running' ? { ...prev, phase: 'checkin', endedAt: Date.now() } : prev,
        );
      },
      resumeSession: () => {
        setNow(Date.now());
        setState(prev => (prev.phase === 'checkin' ? { ...prev, phase: 'running', endedAt: null } : prev));
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
          const nextStartedAt = Date.now();
          return prev.pendingSwitchTarget
            ? {
                phase: 'running',
                running: {
                  id: `s-${nextStartedAt}`,
                  target: prev.pendingSwitchTarget,
                  startedAt: nextStartedAt,
                },
                endedAt: null,
                history: [completed, ...prev.history],
                pendingSwitchTarget: null,
              }
            : {
                phase: 'idle',
                running: null,
                endedAt: null,
                history: [completed, ...prev.history],
                pendingSwitchTarget: null,
              };
        });
      },
      discardSession: () => {
        setState(prev => {
          if (prev.pendingSwitchTarget) {
            const startedAt = Date.now();
            return {
              ...prev,
              phase: 'running',
              running: {
                id: `s-${startedAt}`,
                target: prev.pendingSwitchTarget,
                startedAt,
              },
              endedAt: null,
              pendingSwitchTarget: null,
            };
          }

          return {
            ...prev,
            phase: 'idle',
            running: null,
            endedAt: null,
            pendingSwitchTarget: null,
          };
        });
      },
    };
  }, [state, now]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
