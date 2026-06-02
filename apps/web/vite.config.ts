import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['jaren.home'],
  },
  resolve: {
    alias: {
      '@providers': fileURLToPath(new URL('./src/providers', import.meta.url)),
    },
  },
  plugins: [
    tanstackStart({
      router: {
        routeFileIgnorePattern: 'components',
      },
      spa: { enabled: process.env.BUILD_TARGET === 'desktop' },
    }),
    viteReact(),
  ],
});
