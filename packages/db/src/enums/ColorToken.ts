export const ColorToken = {
  BLUE: 'blue',
  VIOLET: 'violet',
  GREEN: 'green',
  AMBER: 'amber',
  ROSE: 'rose',
  SLATE: 'slate',
  GRAY: 'gray',
  TEAL: 'teal',
  RED: 'red',
  INDIGO: 'indigo',
} as const;

export type ColorToken = (typeof ColorToken)[keyof typeof ColorToken];

export const colorHexByToken = {
  blue: '#2563eb',
  violet: '#7c3aed',
  green: '#16a34a',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#475569',
  gray: '#6b7280',
  teal: '#0d9488',
  red: '#dc2626',
  indigo: '#4f46e5',
} satisfies Record<ColorToken, `#${string}`>;
