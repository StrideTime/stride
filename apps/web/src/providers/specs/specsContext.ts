import { createContext } from 'react';

import type { SpecsContextValue } from './types';

export const SpecsContext = createContext<SpecsContextValue | null>(null);
