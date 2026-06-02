// The end-of-session check-in sentiment.
export const Feeling = {
  FROWN: 'frown',
  NEUTRAL: 'neutral',
  SMILE: 'smile',
  TARGET: 'target',
} as const;

export type Feeling = (typeof Feeling)[keyof typeof Feeling];
