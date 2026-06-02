import { backlogSpecs } from './backlog.mock';
import type { SpecsState } from './types';

export const SPECS_STORAGE_KEY = 'stride.specs.v1';

export const DEFAULT_SPECS_STATE: SpecsState = {
  specs: backlogSpecs,
  lastAppliedSessionId: null,
};

function mergeMockDefaults(stored: SpecsState): SpecsState {
  return {
    ...stored,
    specs: [
      ...stored.specs.map(spec => {
        const defaultSpec = backlogSpecs.find(item => item.id === spec.id);
        if (!defaultSpec) return spec;
        const missingActions = defaultSpec.actions.filter(
          action => !spec.actions.some(existing => existing.id === action.id),
        );
        return missingActions.length > 0
          ? { ...spec, actions: [...spec.actions, ...missingActions] }
          : spec;
      }),
      ...backlogSpecs.filter(defaultSpec => !stored.specs.some(spec => spec.id === defaultSpec.id)),
    ],
  };
}

export function loadSpecsState(): SpecsState {
  if (typeof window === 'undefined') return DEFAULT_SPECS_STATE;
  try {
    const raw = window.localStorage.getItem(SPECS_STORAGE_KEY);
    if (!raw) return DEFAULT_SPECS_STATE;
    return mergeMockDefaults({
      ...DEFAULT_SPECS_STATE,
      ...(JSON.parse(raw) as Partial<SpecsState>),
    });
  } catch {
    return DEFAULT_SPECS_STATE;
  }
}
