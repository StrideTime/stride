export const IconToken = {
  CHECK_CIRCLE: 'check-circle',
  USERS: 'users',
  COFFEE: 'coffee',
  TARGET: 'target',
  USER: 'user',
  TIMER: 'timer',
  CALENDAR: 'calendar',
  BRIEFCASE: 'briefcase',
  FLAG: 'flag',
  SPARKLE: 'sparkle',
} as const;

export type IconToken = (typeof IconToken)[keyof typeof IconToken];
