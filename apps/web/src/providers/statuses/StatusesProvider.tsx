import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { defaultProfileStatuses } from './statuses.mock';
import { StatusesContext } from './statusesContext';
import { parseStoredStatuses, STATUSES_STORAGE_KEY } from './statusesStorage';
import type { ProfileStatus, StatusesContextValue, StoredStatusesState } from './types';

export function StatusesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<ProfileStatus[]>(defaultProfileStatuses);
  const [currentStatusId, setCurrentStatusId] = useState(defaultProfileStatuses[0]!.id);

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = parseStoredStatuses(window.localStorage.getItem(STATUSES_STORAGE_KEY));
    if (stored) {
      setStatuses(stored.statuses);
      setCurrentStatusId(stored.currentStatusId);
    }
  }, []);

  const persist = (nextStatuses: ProfileStatus[], nextCurrentId: string) => {
    try {
      window.localStorage.setItem(
        STATUSES_STORAGE_KEY,
        JSON.stringify({ statuses: nextStatuses, currentStatusId: nextCurrentId } satisfies StoredStatusesState),
      );
    } catch {
      // storage unavailable; state still applies in-memory
    }
  };

  const value = useMemo<StatusesContextValue>(() => {
    const commit = (nextStatuses: ProfileStatus[], nextCurrentId: string) => {
      setStatuses(nextStatuses);
      setCurrentStatusId(nextCurrentId);
      persist(nextStatuses, nextCurrentId);
    };

    return {
      statuses,
      currentStatusId,
      currentStatus: statuses.find(status => status.id === currentStatusId) ?? null,
      setCurrentStatus: id => {
        if (!statuses.some(status => status.id === id)) return;
        commit(statuses, id);
      },
      addStatus: () => {
        const id = `status-${Date.now()}`;
        commit([...statuses, { id, label: 'New status', color: 'accent', icon: 'Circle' }], currentStatusId);
        return id;
      },
      updateStatus: (id, patch) => {
        commit(
          statuses.map(status => (status.id === id ? { ...status, ...patch } : status)),
          currentStatusId,
        );
      },
      removeStatus: id => {
        if (statuses.length === 1) return;
        const nextStatuses = statuses.filter(status => status.id !== id);
        const nextCurrentId = id === currentStatusId ? nextStatuses[0]!.id : currentStatusId;
        commit(nextStatuses, nextCurrentId);
      },
    };
  }, [statuses, currentStatusId]);

  return <StatusesContext.Provider value={value}>{children}</StatusesContext.Provider>;
}
