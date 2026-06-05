export const WorkspaceRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];
