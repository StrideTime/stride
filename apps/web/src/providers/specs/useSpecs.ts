import { useContext } from 'react';

import { SpecsContext } from './specsContext';
import type { SpecsContextValue } from './types';

export function useSpecs(): SpecsContextValue {
  const ctx = useContext(SpecsContext);
  if (!ctx) {
    throw new Error('useSpecs must be used within a SpecsProvider');
  }
  return ctx;
}
