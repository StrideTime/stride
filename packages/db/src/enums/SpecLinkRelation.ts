// A source-synced relationship between two Specs (the Spec view's linked-issues section).
export const SpecLinkRelation = {
  BLOCKS: 'blocks',
  BLOCKED_BY: 'blocked_by',
  RELATED: 'related',
  IMPLEMENTS: 'implements',
  IMPLEMENTED_BY: 'implemented_by',
} as const;

export type SpecLinkRelation = (typeof SpecLinkRelation)[keyof typeof SpecLinkRelation];
