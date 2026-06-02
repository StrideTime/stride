import type { BacklogAction, BacklogSpec } from './backlog.mock';

export type SpecsState = {
  specs: BacklogSpec[];
  // Idempotency token for the session-completion bridge.
  lastAppliedSessionId: string | null;
};

export type ActionPatch = Partial<
  Pick<BacklogAction, 'title' | 'description' | 'estimateMin' | 'done'>
>;

export type SpecPatch = Partial<
  Pick<BacklogSpec, 'title' | 'description' | 'sourceStatus' | 'assignee' | 'labels'>
>;

export type SpecsContextValue = {
  specs: BacklogSpec[];
  getSpec: (id: string) => BacklogSpec | undefined;
  updateSpec: (id: string, patch: SpecPatch) => void;
  addAction: (
    specId: string,
    partial: {
      title: string;
      description?: string;
      estimateMin?: number;
      assignee?: string;
    },
  ) => string;
  updateAction: (specId: string, actionId: string, patch: ActionPatch) => void;
  deleteAction: (specId: string, actionId: string) => void;
};
