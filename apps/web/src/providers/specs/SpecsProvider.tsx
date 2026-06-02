import { useEffect, useMemo, useState, type ReactNode } from 'react';

import type { BacklogAction } from './backlog.mock';
import { useSession } from '../session';
import { SpecsContext } from './specsContext';
import { DEFAULT_SPECS_STATE, loadSpecsState, SPECS_STORAGE_KEY } from './specsState';
import type { SpecsContextValue, SpecsState } from './types';

export function SpecsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SpecsState>(DEFAULT_SPECS_STATE);
  const [hydrated, setHydrated] = useState(false);
  const session = useSession();

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    setState(loadSpecsState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SPECS_STORAGE_KEY, JSON.stringify(state));
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
        specs: prev.specs.map(spec =>
          spec.id !== specId
            ? spec
            : {
                ...spec,
                actions: spec.actions.map(action =>
                  action.id !== actionId
                    ? action
                    : {
                        ...action,
                        loggedMin: (action.loggedMin ?? 0) + latest.elapsedMin,
                        done: latest.markedDone ? true : action.done,
                      },
                ),
              },
        ),
      };
    });
  }, [session.history, hydrated, state.lastAppliedSessionId]);

  const value = useMemo<SpecsContextValue>(
    () => ({
      specs: state.specs,
      getSpec: id => state.specs.find(spec => spec.id === id),
      updateSpec: (id, patch) =>
        setState(prev => ({
          ...prev,
          specs: prev.specs.map(spec => (spec.id === id ? { ...spec, ...patch } : spec)),
        })),
      addAction: (specId, partial) => {
        const id = `a-${Date.now().toString(36)}`;
        setState(prev => ({
          ...prev,
          specs: prev.specs.map(spec =>
            spec.id !== specId
              ? spec
              : {
                  ...spec,
                  actions: [
                    ...spec.actions,
                    {
                      id,
                      title: partial.title,
                      description: partial.description,
                      estimateMin: partial.estimateMin,
                      assignee: partial.assignee,
                      loggedMin: 0,
                      plannedMin: 0,
                    } satisfies BacklogAction,
                  ],
                },
          ),
        }));
        return id;
      },
      updateAction: (specId, actionId, patch) =>
        setState(prev => ({
          ...prev,
          specs: prev.specs.map(spec =>
            spec.id !== specId
              ? spec
              : {
                  ...spec,
                  actions: spec.actions.map(action => (action.id === actionId ? { ...action, ...patch } : action)),
                },
          ),
        })),
      deleteAction: (specId, actionId) =>
        setState(prev => ({
          ...prev,
          specs: prev.specs.map(spec =>
            spec.id !== specId
              ? spec
              : {
                  ...spec,
                  actions: spec.actions.filter(action => action.id !== actionId),
                },
          ),
        })),
    }),
    [state.specs],
  );

  return <SpecsContext.Provider value={value}>{children}</SpecsContext.Provider>;
}
