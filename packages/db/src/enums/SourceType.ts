export const SourceType = {
  JIRA: 'jira',
  LINEAR: 'linear',
  GITHUB: 'github',
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];
