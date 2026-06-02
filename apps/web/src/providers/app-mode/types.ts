export type AppMode = 'session-first' | 'schedule-first';

export type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};
