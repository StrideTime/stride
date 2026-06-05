export const ActionDifficulty = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type ActionDifficulty = (typeof ActionDifficulty)[keyof typeof ActionDifficulty];
