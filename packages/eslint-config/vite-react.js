import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { config as reactConfig } from './react.js';

/**
 * React config tuned for Vite (adds react-refresh rules).
 *
 * @type {import('eslint').Linter.Config[]} */
export const config = [
  ...reactConfig,
  pluginReactRefresh.configs.vite,
];

