export const SourceUnitType = {
  JIRA_BOARD: 'jira_board',
  LINEAR_TEAM: 'linear_team',
  GITHUB_REPO: 'github_repo',
} as const;

export type SourceUnitType = (typeof SourceUnitType)[keyof typeof SourceUnitType];
