// Stride's internal lifecycle state, distinct from the source's own status string
// (`specs.sourceStatus`). Displayed using the source's vocabulary. Reopen flips this back
// to `open` manually; history is untouched (see data-model.md, Q8).
export const SpecStatus = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type SpecStatus = (typeof SpecStatus)[keyof typeof SpecStatus];
