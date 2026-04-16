import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * Shared Node.js ESLint config.
 *
 * @type {import('eslint').Linter.Config[]} */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];

