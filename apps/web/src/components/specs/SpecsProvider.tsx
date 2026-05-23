import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useSession } from '../session';
import {
  backlogSpecs,
  type BacklogAction,
  type BacklogSpec,
} from '../backlog/backlog.mock';

// Live, client-side store for Specs + Actions. Seeded from the backlog mock,
// the source of truth for everything: the Spec view edits it, Backlog reads
// from it, Today's "Up next" reads from it, and completed Sessions roll up
// into the matching Action via the bridge effect below.

type SpecsState = {
  specs: BacklogSpec[];
  // Idempotency token for the session-completion bridge — see effect below.
  lastAppliedSessionId: string | null;
};

const DEFAULT_STATE: SpecsState = {
  specs: backlogSpecs,
  lastAppliedSessionId: null,
};

const STORAGE_KEY = 'stride.specs.v1';

function loadState(): SpecsState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<SpecsState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

type ActionPatch = Partial<Pick<BacklogAction, 'title' | 'estimateMin' | 'done'>>;
type SpecPatch = Partial<Pick<BacklogSpec, 'title' | 'description'>>;

type SpecsContextValue = {
  specs: BacklogSpec[];
  getSpec: (id: string) => BacklogSpec | undefined;
  updateSpec: (id: string, patch: SpecPatch) => void;
  addAction: (specId: string, partial: { title: string; estimateMin?: number; assignee?: string }) => string;
  updateAction: (specId: string, actionId: string, patch: ActionPatch) => void;
  deleteAction: (specId: string, actionId: string) => void;
};

const SpecsContext = createContext<SpecsContextValue | null>(null);

export function SpecsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SpecsState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const session = useSession();

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable; in-memory still works
    }
  }, [state, hydrated]);

  // Bridge: when a session completes against a known Action, accumulate the
  // elapsed minutes into that Action's loggedMin and apply markedDone. Guarded
  // by lastAppliedSessionId (persisted with state) so a reload does not
  // re-apply the same completion.
  useEffect(() => {
    if (!hydrated) return;
    const latest = session.history[0];
    if (!latest) return;
    if (state.lastAppliedSessionId === latest.id) return;
    const { specId, actionId } = latest.target;
    setState(prev => {
      if (prev.lastAppliedSessionId === latest.id) return prev;
      if (!specId || !actionId) {
        return { ...prev, lastAppliedSessionId: latest.id };
      }
      return {
        lastAppliedSessionId: latest.id,
        specs: prev.specs.map(spec => (spec.id !== specId ? spec : {
          ...spec,
          actions: spec.actions.map(action => (action.id !== actionId ? action : {
            ...action,
            loggedMin: (action.loggedMin ?? 0) + latest.elapsedMin,
            done: latest.markedDone ? true : action.done,
          })),
        })),
      };
    });
  }, [session.history, hydrated, state.lastAppliedSessionId]);

  const value = useMemo<SpecsContextValue>(() => ({
    specs: state.specs,
    getSpec: id => state.specs.find(spec => spec.id === id),
    updateSpec: (id, patch) => setState(prev => ({
      ...prev,
      specs: prev.specs.map(spec => (spec.id === id ? { ...spec, ...patch } : spec)),
    })),
    addAction: (specId, partial) => {
      const id = `a-${Date.now().toString(36)}`;
      setState(prev => ({
        ...prev,
        specs: prev.specs.map(spec => (spec.id !== specId ? spec : {
          ...spec,
          actions: [
            ...spec.actions,
            {
              id,
              title: partial.title,
              estimateMin: partial.estimateMin,
              assignee: partial.assignee,
              loggedMin: 0,
              plannedMin: 0,
            },
          ],
        })),
      }));
      return id;
    },
    updateAction: (specId, actionId, patch) => setState(prev => ({
      ...prev,
      specs: prev.specs.map(spec => (spec.id !== specId ? spec : {
        ...spec,
        actions: spec.actions.map(action => (action.id === actionId ? { ...action, ...patch } : action)),
      })),
    })),
    deleteAction: (specId, actionId) => setState(prev => ({
      ...prev,
      specs: prev.specs.map(spec => (spec.id !== specId ? spec : {
        ...spec,
        actions: spec.actions.filter(action => action.id !== actionId),
      })),
    })),
  }), [state.specs]);

  return <SpecsContext.Provider value={value}>{children}</SpecsContext.Provider>;
}

export function useSpecs(): SpecsContextValue {
  const ctx = useContext(SpecsContext);
  if (!ctx) {
    throw new Error('useSpecs must be used within a SpecsProvider');
  }
  return ctx;
}
