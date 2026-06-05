// Append-only activity/audit events on a Spec. Only NON-derivable events are recorded — the
// Spec view's History tab reconstructs action/session events from their own timestamps. These
// support the ownership/provenance audit commitment (decisions.mdc 2026-05-21).
export const SpecActivityType = {
  SOURCE_SYNC: 'source_sync',
  STATUS_CHANGE: 'status_change',
  PRIORITY_CHANGE: 'priority_change',
  ASSIGNEE_CHANGE: 'assignee_change',
  OWNERSHIP_TRANSFER: 'ownership_transfer',
  SPEC_EDITED: 'spec_edited',
} as const;

export type SpecActivityType = (typeof SpecActivityType)[keyof typeof SpecActivityType];
