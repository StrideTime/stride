import { useContext } from 'react';

import { SessionContext } from './sessionContext';
import type { SessionContextValue } from './types';

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
