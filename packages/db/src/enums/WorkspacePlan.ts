// Billing is deferred in v1; the plan is selected as a non-functional preview during
// workspace creation and stored for when billing lands.
export const WorkspacePlan = {
  FREE: 'free',
  TEAM: 'team',
  ENTERPRISE: 'enterprise',
} as const;

export type WorkspacePlan = (typeof WorkspacePlan)[keyof typeof WorkspacePlan];
