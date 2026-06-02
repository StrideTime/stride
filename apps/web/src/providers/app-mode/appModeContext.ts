import { createContext } from 'react';

import type { AppModeContextValue } from './types';

export const AppModeContext = createContext<AppModeContextValue | null>(null);
