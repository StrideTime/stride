import { config as viteReactConfig } from '@repo/eslint-config/vite-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // TanStack Router's generated route tree — not hand-written, not linted.
  { ignores: ['src/routeTree.gen.ts'] },
  ...viteReactConfig,
  {
    // Route files export a `Route` object alongside the page component — that's the framework's
    // file shape, not a fast-refresh hazard.
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
];
