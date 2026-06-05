// A coarse size for an Action. May be mapped from a source field (see team source mappings).
export const Difficulty = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
