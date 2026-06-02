import { useContext } from 'react';

import { StatusesContext } from './statusesContext';
import type { StatusesContextValue } from './types';

export function useStatuses(): StatusesContextValue {
  const ctx = useContext(StatusesContext);
  if (!ctx) {
    throw new Error('useStatuses must be used within a StatusesProvider');
  }
  return ctx;
}
