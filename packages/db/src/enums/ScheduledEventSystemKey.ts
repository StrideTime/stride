// Required system schedule types. Workspaces can add/archive/rename their own types, but system
// keys preserve app-owned behavior such as action blocks and immutable external calendar events.
export const ScheduledEventSystemKey = {
  ACTIONS: 'actions',
  EXTERNAL_CALENDAR: 'external_calendar',
} as const;

export type ScheduledEventSystemKey =
  (typeof ScheduledEventSystemKey)[keyof typeof ScheduledEventSystemKey];
