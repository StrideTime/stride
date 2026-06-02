// Roles are additive: a workspace_admin is also a team_admin and a member.
export const MembershipRole = {
  MEMBER: 'member',
  TEAM_ADMIN: 'team_admin',
  WORKSPACE_ADMIN: 'workspace_admin',
} as const;

export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole];
