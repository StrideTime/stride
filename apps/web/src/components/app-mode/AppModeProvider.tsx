import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// The working mode reshapes the whole app: Today, the Tray, scheduling
// defaults. It is a real account-level setting, chosen at onboarding and
// changed in Settings. See docs/product/overview.md (User modes).
export type AppMode = 'session-first' | 'schedule-first';

const STORAGE_KEY = 'stride.appMode.v1';
const DEFAULT_MODE: AppMode = 'session-first';

function isAppMode(value: unknown): value is AppMode {
  return value === 'session-first' || value === 'schedule-first';
}

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(DEFAULT_MODE);

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAppMode(stored)) setModeState(stored);
  }, []);

  const setMode = (next: AppMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable; the mode still applies in-memory
    }
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode(): AppModeContextValue {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return ctx;
}
