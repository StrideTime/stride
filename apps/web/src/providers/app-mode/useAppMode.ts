import { useContext } from 'react';

import { AppModeContext } from './appModeContext';
import type { AppModeContextValue } from './types';

export function useAppMode(): AppModeContextValue {
  const ctx = useContext(AppModeContext);
  if (!ctx) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return ctx;
}
