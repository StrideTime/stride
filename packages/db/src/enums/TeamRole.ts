export const TeamRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];
