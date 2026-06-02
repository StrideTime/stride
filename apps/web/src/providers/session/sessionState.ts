import { mockSessionHistory } from './session.mock';
import type { SessionState } from './types';

export const SESSION_STORAGE_KEY = 'stride.session.v1';

export const DEFAULT_SESSION_STATE: SessionState = {
  phase: 'idle',
  running: null,
  endedAt: null,
  history: mockSessionHistory,
  pendingSwitchTarget: null,
};

export function loadSessionState(): SessionState {
  if (typeof window === 'undefined') return DEFAULT_SESSION_STATE;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION_STATE;
    return { ...DEFAULT_SESSION_STATE, ...(JSON.parse(raw) as Partial<SessionState>) };
  } catch {
    return DEFAULT_SESSION_STATE;
  }
}
