import { createContext } from 'react';

import type { StatusesContextValue } from './types';

export const StatusesContext = createContext<StatusesContextValue | null>(null);
