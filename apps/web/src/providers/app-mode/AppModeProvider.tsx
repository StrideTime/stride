import { useEffect, useState, type ReactNode } from 'react';

import { AppModeContext } from './appModeContext';
import { APP_MODE_STORAGE_KEY, DEFAULT_APP_MODE } from './constants';
import type { AppMode } from './types';

function isAppMode(value: unknown): value is AppMode {
  return value === 'session-first' || value === 'schedule-first';
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(DEFAULT_APP_MODE);

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (isAppMode(stored)) setModeState(stored);
  }, []);

  const setMode = (next: AppMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(APP_MODE_STORAGE_KEY, next);
    } catch {
      // storage unavailable; the mode still applies in-memory
    }
  };

  return <AppModeContext.Provider value={{ mode, setMode }}>{children}</AppModeContext.Provider>;
}
