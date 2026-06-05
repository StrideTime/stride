// Inbox notification categories. `assigned` and `source_drift` are relevant for a single
// user; `unblocked` / `handoff` / `approval` populate once the team layer is live; `unmapped`
// is a setup/onboarding state. The primary/secondary UI actions are derived from the type,
// not stored.
export const NotificationType = {
  ASSIGNED: 'assigned',
  UNBLOCKED: 'unblocked',
  HANDOFF: 'handoff',
  APPROVAL: 'approval',
  SOURCE_DRIFT: 'source_drift',
  UNMAPPED: 'unmapped',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
