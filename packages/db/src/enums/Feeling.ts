// The end-of-session check-in sentiment, worst → best. Stored as the feeling itself, not the
// icon used to render it (the prototype mapped these to frown / neutral / smile / target).
export const Feeling = {
  TOUGH: 'tough',
  OKAY: 'okay',
  GOOD: 'good',
  ON_POINT: 'on_point',
} as const;

export type Feeling = (typeof Feeling)[keyof typeof Feeling];
