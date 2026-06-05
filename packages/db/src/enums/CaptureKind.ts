// How a quick capture is triaged. Reflection-oriented kinds feed Insights (post-v1).
export const CaptureKind = {
  INSIGHT: 'insight',
  NEXT: 'next',
} as const;

export type CaptureKind = (typeof CaptureKind)[keyof typeof CaptureKind];
