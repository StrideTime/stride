import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// User-defined presence statuses. Defined in Settings (Personal > My statuses)
// and chosen from the profile menu in the app shell. Account-level, so it
// lives in a provider and persists locally.
export type StatusColor =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'violet'
  | 'cyan'
  | 'slate';

export type ProfileStatus = {
  id: string;
  label: string;
  color: StatusColor;
  icon: string;
};

const STORAGE_KEY = 'stride.statuses.v1';

const DEFAULT_STATUSES: ProfileStatus[] = [
  { id: 'available', label: 'Available', color: 'success', icon: 'Smiley' },
  { id: 'focus', label: 'Focus', color: 'accent', icon: 'Target' },
  { id: 'away', label: 'Away', color: 'warning', icon: 'Coffee' },
];

type StoredState = {
  statuses: ProfileStatus[];
  currentStatusId: string;
};

type StatusesContextValue = {
  statuses: ProfileStatus[];
  currentStatusId: string;
  currentStatus: ProfileStatus | null;
  setCurrentStatus: (id: string) => void;
  addStatus: () => string;
  updateStatus: (id: string, patch: Partial<Omit<ProfileStatus, 'id'>>) => void;
  removeStatus: (id: string) => void;
};

const StatusesContext = createContext<StatusesContextValue | null>(null);

function isStatusColor(value: unknown): value is StatusColor {
  return (
    value === 'accent'
    || value === 'success'
    || value === 'warning'
    || value === 'danger'
    || value === 'violet'
    || value === 'cyan'
    || value === 'slate'
  );
}

function parseStored(raw: string | null): StoredState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!Array.isArray(parsed.statuses)) return null;
    const statuses = parsed.statuses
      .filter((entry): entry is ProfileStatus =>
        typeof entry?.id === 'string'
        && typeof entry?.label === 'string'
        && typeof entry?.icon === 'string'
        && isStatusColor(entry?.color))
      .map(entry => ({ id: entry.id, label: entry.label, color: entry.color, icon: entry.icon }));
    if (statuses.length === 0) return null;
    const currentStatusId = statuses.some(status => status.id === parsed.currentStatusId)
      ? parsed.currentStatusId!
      : statuses[0]!.id;
    return { statuses, currentStatusId };
  } catch {
    return null;
  }
}

export function StatusesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<ProfileStatus[]>(DEFAULT_STATUSES);
  const [currentStatusId, setCurrentStatusId] = useState(DEFAULT_STATUSES[0]!.id);

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setStatuses(stored.statuses);
      setCurrentStatusId(stored.currentStatusId);
    }
  }, []);

  const persist = (nextStatuses: ProfileStatus[], nextCurrentId: string) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ statuses: nextStatuses, currentStatusId: nextCurrentId } satisfies StoredState),
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

export function useStatuses(): StatusesContextValue {
  const ctx = useContext(StatusesContext);
  if (!ctx) {
    throw new Error('useStatuses must be used within a StatusesProvider');
  }
  return ctx;
}
